/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import {
  generateReportForAllUsers,
  getQuestion,
  getUniqueUserIdsFromReportEntries,
  ReportEntry,
} from "lrs-helpers";
import { Statement } from "@xapi/xapi";
import { useWithStatements } from "./use-with-statements";
import { useWithUserQuestions } from "./use-with-user-questions";
import { v4 as uuid } from "uuid";
import { UserQuestionGQL } from "lrs-api";
import { useWithAnswersTopics } from "./use-with-answers-topics";

type ChatStartType = "INIT_FOUND" | "FIRST_ASK_FOUND" | "NO_INIT_OR_ASK_FOUND";
type ChatEndType =
  | "TERMINATE_FOUND"
  | "END_OF_STATEMENTS"
  | "SUBSEQUENT_INIT_FOUND";

interface UserChatSession {
  startDate: Date;
  endDate: Date;
  userId: string;
  mentorIds: string[];
  relatedEntries: ReportEntry[];
  chatStartType: ChatStartType;
  chatEndType: ChatEndType;
  source: string;
  referrer: string;
}

type UserEntriesDict = Record<string, ReportEntry[]>;

export interface UseWithMergeReport {
  handleMergeReport: (
    startDate: string,
    endDate: string
  ) => Promise<ReportEntry[] | undefined>;
}

export function useWithMergeReport(): UseWithMergeReport {
  const { getStatements } = useWithStatements();
  const { fetchUserQuestions } = useWithUserQuestions();
  const { fetchAnswerTopicMappings } = useWithAnswersTopics();

  // Statement timestamp format example: "2022-12-06T00:01:16.232Z",
  // User Question timestamp format example: "2022-10-24T17:09:33.321Z",
  function isUserQuestionAccountedFor(
    userQuestion: UserQuestionGQL,
    statements: Statement[]
  ) {
    const userQuestionDate = new Date(userQuestion.createdAt);
    const relevantStatementStartEpoch = new Date(
      userQuestion.createdAt
    ).setSeconds(userQuestionDate.getSeconds() - 10);
    const relevantStatementEndEpoch = new Date(
      userQuestion.createdAt
    ).setSeconds(userQuestionDate.getSeconds() + 10);
    const relevantStatements = statements.filter((statement) => {
      if (!statement.timestamp) {
        return false;
      }
      const statementDateEpoch = Date.parse(statement.timestamp);
      if (
        statementDateEpoch <= relevantStatementEndEpoch &&
        statementDateEpoch >= relevantStatementStartEpoch
      ) {
        return true;
      }
      return false;
    });
    return Boolean(
      relevantStatements.find(
        (statement) => getQuestion(statement) == userQuestion.question
      )
    );
  }

  /**
   * Recursively extracts user chat sessions from a set of report entries related to one user
   * @param reportEntries a list of report entries for a single user and in ascending date order
   * @return all chat sessions for that user
   */
  function recursivelyGetChatSessionsFromSingleUser(
    reportEntries: ReportEntry[],
    userChatSessions: UserChatSession[],
    userId: string,
    escapeCounter: number
  ): UserChatSession[] {
    if (escapeCounter > 1000) {
      throw new Error("ERROR: chat session parse exceeeded 1000 loops");
    }
    if (!reportEntries.length) {
      return userChatSessions;
    }

    let startDate: Date | undefined = undefined;
    let endDate: Date | undefined = undefined;
    let endDateIndex = -1;
    let startDateIndex = -1;
    let chatStartTypeFound: ChatStartType = "NO_INIT_OR_ASK_FOUND";
    let chatEndTypeFound: ChatEndType = "END_OF_STATEMENTS";
    const mentorsInChatSession = new Set<string>();
    for (let i = 0; i < reportEntries.length; i++) {
      const curEntry = reportEntries[i];

      // ***Checking for end date***

      if (curEntry.action == "terminated") {
        if (!startDate) {
          // don't care about an ended session since we haven't even started one
          continue;
        } else {
          chatEndTypeFound = "TERMINATE_FOUND";
          endDate = curEntry.dateObject;
          endDateIndex = i;
          break;
        }
      }

      // START EXTRACTING MENTOR IDS
      if (curEntry.answer) {
        mentorsInChatSession.add(curEntry.answer);
      }
      if (curEntry.mentorSelected) {
        const cleanedMentorSelected = curEntry.mentorSelected.replace(
          /&/gi,
          ""
        );
        const mentorIds = cleanedMentorSelected.split("mentor=");
        mentorIds.forEach((id) => mentorsInChatSession.add(id));
      }
      if (curEntry.allMentorsAsked.length) {
        curEntry.allMentorsAsked.forEach((id) => mentorsInChatSession.add(id));
      }
      // END EXTRACTING MENTOR IDS

      // ***Checking for start date***

      // If something was asked before a start date was found, this is considered the start of the convo
      if (curEntry.action == "asked" && !startDate) {
        chatStartTypeFound = "FIRST_ASK_FOUND";
        startDate = curEntry.dateObject;
        startDateIndex = i;
        continue;
      }
      if (curEntry.action == "initialized") {
        if (startDate) {
          chatEndTypeFound = "SUBSEQUENT_INIT_FOUND";
          // because we found another intiated despite there being a start date, we know a new conversation must have started
          endDate = curEntry.dateObject;
          endDateIndex = i;
          break;
        } else {
          chatStartTypeFound = "INIT_FOUND";
          startDate = curEntry.dateObject;
          startDateIndex = i;
          continue;
        }
      }
    }

    mentorsInChatSession.delete("-");
    mentorsInChatSession.delete("");

    // If we didn't find a start date, then consider all entries as a chat session
    if (!startDate) {
      const newChatSession: UserChatSession = {
        startDate: reportEntries[0].dateObject,
        endDate: reportEntries[reportEntries.length - 1].dateObject,
        userId,
        mentorIds: Array.from(mentorsInChatSession),
        relatedEntries: reportEntries,
        chatStartType: chatStartTypeFound,
        chatEndType: chatEndTypeFound,
        source:
          reportEntries.find((entry) => entry.source !== "-")?.source || "-",
        referrer:
          reportEntries.find((entry) => entry.referrer !== "-")?.referrer ||
          "-",
      };
      return recursivelyGetChatSessionsFromSingleUser(
        [],
        [...userChatSessions, newChatSession],
        userId,
        escapeCounter + 1
      );
    }

    // If we look through all statements and find a start but not an end, then last statement considered the end
    if (!endDate) {
      const relatedEntries = reportEntries.slice(startDateIndex);
      const newChatSession: UserChatSession = {
        startDate: reportEntries[startDateIndex].dateObject,
        endDate: reportEntries[reportEntries.length - 1].dateObject,
        userId,
        mentorIds: Array.from(mentorsInChatSession),
        relatedEntries: relatedEntries,
        chatStartType: chatStartTypeFound,
        chatEndType: chatEndTypeFound,
        source:
          relatedEntries.find((entry) => entry.source !== "-")?.source || "-",
        referrer:
          relatedEntries.find((entry) => entry.referrer !== "-")?.referrer ||
          "-",
      };
      return recursivelyGetChatSessionsFromSingleUser(
        [],
        [...userChatSessions, newChatSession],
        userId,
        escapeCounter + 1
      );
    }

    const relatedEntries = reportEntries.slice(startDateIndex, endDateIndex);
    const newChatSession: UserChatSession = {
      startDate: relatedEntries[0].dateObject,
      endDate: relatedEntries[relatedEntries.length - 1].dateObject,
      userId,
      mentorIds: Array.from(mentorsInChatSession),
      relatedEntries: reportEntries.slice(startDateIndex, endDateIndex),
      chatStartType: chatStartTypeFound,
      chatEndType: chatEndTypeFound,
      source:
        relatedEntries.find((entry) => entry.source !== "-")?.source || "-",
      referrer:
        relatedEntries.find((entry) => entry.referrer !== "-")?.referrer || "-",
    };

    return recursivelyGetChatSessionsFromSingleUser(
      reportEntries.slice(endDateIndex),
      [...userChatSessions, newChatSession],
      userId,
      escapeCounter + 1
    );
  }

  /**
   * Takes in a list of ALL report entries and returns all user chat sessions
   * @param reportEntries All report entries
   * @returns All user chat sessions
   */
  const reportEntriesIntoUserChatSessions = (
    reportEntries: ReportEntry[]
  ): UserChatSession[] => {
    // Sort by date
    reportEntries.sort((a, b) =>
      new Date(a.date) > new Date(b.date) ? -1 : 1
    );
    // Sort by userId
    const uniqueUserIds = getUniqueUserIdsFromReportEntries(reportEntries);
    const entriesSortedByIdAndDate = uniqueUserIds.reduce(
      (reportEntriesSortedByUserId, userId) => {
        return [
          ...reportEntriesSortedByUserId,
          ...reportEntries.filter(
            (reportEntry) => reportEntry.userId === userId
          ),
        ];
      },
      [] as ReportEntry[]
    );

    const entriesSplitByUserId = uniqueUserIds.reduce(
      (userEntriesDict, userId) => {
        userEntriesDict[userId] = entriesSortedByIdAndDate.filter(
          (entry) => entry.userId == userId
        );
        return userEntriesDict;
      },
      {} as UserEntriesDict
    );

    const chatSessions: UserChatSession[] = [];
    uniqueUserIds.forEach((userId) => {
      const usersEntries = entriesSplitByUserId[userId];
      usersEntries.reverse(); //to get in order of oldest --> newest
      const usersChatSessions = recursivelyGetChatSessionsFromSingleUser(
        usersEntries,
        [],
        userId,
        0
      );
      chatSessions.push(...usersChatSessions);
    });
    return chatSessions;
  };

  const handleMergeReport = async (startDate: string, endDate: string) => {
    const userQuestions = await fetchUserQuestions(startDate, endDate);
    const statements = await getStatements(startDate, endDate);
    if (!userQuestions || !statements) {
      return;
    }
    let reportEntries = generateReportForAllUsers(statements);

    const allAnswerIds = new Set(reportEntries.map((entry) => entry.answerId));
    const answerToTopicMappings = await fetchAnswerTopicMappings(
      Array.from(allAnswerIds)
    );

    // Remap reportEntries to contain the topic names
    reportEntries = reportEntries.map((entry) => {
      try {
        return {
          ...entry,
          topics: answerToTopicMappings[entry.answerId] || [],
        };
      } catch (err) {
        console.log(
          "unable to find topic mapping for answer",
          entry.answerId,
          err
        );
        return entry;
      }
    });

    if (!userQuestions.length) {
      return reportEntries;
    }

    // START handling orphaned user questions by looking at faux chat sessions

    // XAPI chat sessions
    const chatSessions = reportEntriesIntoUserChatSessions(reportEntries);

    // Ignore empty chat sessions and ones with no mentor ids
    const effectiveChatSessions = chatSessions.filter(
      (chatSession) =>
        chatSession.relatedEntries.length > 0 &&
        chatSession.mentorIds.length > 0
    );

    // USER QUESTIONS
    const orphanedUserQuestions = userQuestions.filter(
      (userQuestion) => !isUserQuestionAccountedFor(userQuestion, statements)
    );

    orphanedUserQuestions.forEach((orphanUserQuestion) => {
      try {
        const effectiveAnswerId =
          orphanUserQuestion.graderAnswer?._id ||
          orphanUserQuestion.classifierAnswer?._id ||
          "";
        const topics: string[] = answerToTopicMappings[effectiveAnswerId] || [];
        const userQuestionEpoch = Date.parse(orphanUserQuestion.createdAt);
        const relevantChatSessions = effectiveChatSessions.filter(
          (chatSession) => {
            const chatSessionStartEpoch = chatSession.startDate.getTime();
            const chatSessionEndEpoch = chatSession.endDate.getTime();
            return (
              userQuestionEpoch >= chatSessionStartEpoch &&
              userQuestionEpoch <= chatSessionEndEpoch &&
              Boolean(
                chatSession.mentorIds.find(
                  (mentorId) => mentorId == orphanUserQuestion.mentor._id
                )
              )
            );
          }
        );
        if (relevantChatSessions.length == 1) {
          const relevantChatSession = relevantChatSessions[0];
          reportEntries.push({
            action: "asked",
            referrer: relevantChatSession.referrer,
            mentorSelected: orphanUserQuestion.mentor._id,
            question: orphanUserQuestion.question,
            typed:
              orphanUserQuestion.classifierAnswerType == "EXACT"
                ? "TOPIC_LIST"
                : "TYPED",
            answer: "-",
            source: relevantChatSession.source,
            date: new Date(orphanUserQuestion.createdAt).toDateString(),
            dataSource: "RECOV_Certain",
            userId: relevantChatSession.userId,
            dateObject: new Date(orphanUserQuestion.createdAt),
            allMentorsAsked: relevantChatSession.mentorIds,
            answerId: effectiveAnswerId,
            topics,
          });
        } else if (relevantChatSessions.length > 1) {
          relevantChatSessions.forEach((relevantChatSession) => {
            reportEntries.push({
              action: "asked",
              referrer: relevantChatSession.referrer,
              mentorSelected: orphanUserQuestion.mentor._id,
              question: orphanUserQuestion.question,
              typed:
                orphanUserQuestion.classifierAnswerType == "EXACT"
                  ? "TOPIC_LIST"
                  : "TYPED",
              answer: "-",
              source: relevantChatSession.source,
              date: new Date(orphanUserQuestion.createdAt).toDateString(),
              dataSource: "REVOC_Maybe",
              userId: relevantChatSession.userId,
              dateObject: new Date(orphanUserQuestion.createdAt),
              allMentorsAsked: relevantChatSession.mentorIds,
              answerId: effectiveAnswerId,
              topics,
            });
          });
        } else if (relevantChatSessions.length == 0) {
          // add entry as orphaned
          reportEntries.push({
            action: "asked",
            referrer: "-",
            mentorSelected: orphanUserQuestion.mentor._id,
            question: orphanUserQuestion.question,
            typed:
              orphanUserQuestion.classifierAnswerType == "EXACT"
                ? "TOPIC_LIST"
                : "TYPED",
            answer: "-",
            source: "-",
            date: new Date(orphanUserQuestion.createdAt).toDateString(),
            dataSource: "orphaned_user_question",
            userId: `orphaned-${uuid()}`,
            dateObject: new Date(orphanUserQuestion.createdAt),
            allMentorsAsked: [orphanUserQuestion.mentor._id],
            answerId: effectiveAnswerId,
            topics,
          });
        }
      } catch (err) {
        console.error("orphan question error", err);
      }
    });
    return reportEntries;
  };

  return {
    handleMergeReport,
  };
}
