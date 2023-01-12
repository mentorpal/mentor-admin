/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Statement, Activity } from "@xapi/xapi";
import { UserQuestionGQL } from "lrs-api";
// eslint-disable-next-line  @typescript-eslint/no-var-requires
const dfd = require("danfojs");

type DataSource =
  | "REVOC_Maybe"
  | "RECOV_Certain"
  | "xapi"
  | "orphaned_user_question";
/* Defining the structure of the report object. */
export interface ReportEntry {
  action: string;
  referrer: string;
  mentorSelected: string;
  question: string;
  typed: string;
  answer: string;
  source: string;
  date: string;
  userId: string;
  dateObject: Date;
  dataSource: DataSource;
  allMentorsAsked: string[];
  answerId: string;
  topics: string[];
}

/**
 * It takes in a user id and an array of statements, and returns a report object with the user's
 * actions, questions, and answers
 * @param {string} id - the user id
// eslint-disable-next-line @typescript-eslint/no-explicit-any
 * @param {any} statements - the array of statements from the LRS
 * @returns A report object with the following properties:
 * - action: an array of strings
 * - referrer: an array of strings
 * - mentorSelected: an array of strings
 * - question: an array of strings
 * - typed: an array of strings
 * - answer: an array of strings
 * - source: an array of strings
 * - date: an array of strings
 */
const generateUserReport = (
  userIds: string[],
  statements: Statement[]
): ReportEntry[] => {
  const allReportEntries: ReportEntry[] = [];
  userIds.forEach((userId) => {
    for (const statement in statements) {
      const reportEntry: ReportEntry = {
        action: "-",
        referrer: "-",
        mentorSelected: "-",
        question: "-",
        typed: "-",
        answer: "-",
        source: "-",
        date: "-",
        userId: "-",
        dateObject: new Date(),
        dataSource: "xapi",
        allMentorsAsked: [],
        answerId: "",
        topics: [],
      };
      const curStatement = statements[statement];
      const username = curStatement["actor"]["name"];
      if (username !== userId || curStatement["verb"] === undefined) {
        continue;
      }
      // 0. set userId
      reportEntry.userId = userId;

      // 1. get verb
      const verb = curStatement["verb"]["display"]["en-US"];
      reportEntry.action = verb;

      // 2. get referrer
      const referrer = getReferrer(curStatement);
      reportEntry.referrer = referrer;

      // 3. get mentor selected
      if (verb === "selected") {
        const mentor = getMentorSelected(curStatement);
        reportEntry.mentorSelected = mentor;
      }

      if (verb === "asked") {
        // 4. get if question is typed or selected
        const questionTyped = getQuestionType(curStatement);
        reportEntry.typed = questionTyped;

        // 5. get question
        const question = getQuestion(curStatement);
        reportEntry.question = question;
      }

      // 6. get mentor answer Id
      if (verb === "answer-playback-started") {
        const mentorId = getMentorAnswerId(curStatement);
        reportEntry.answer = mentorId;
      }

      // 7. get all mentors asked, just for data mining
      reportEntry.allMentorsAsked = getAllMentorsAsked(curStatement);

      const origin = getOrigin(curStatement);
      reportEntry.source = origin;
      if (curStatement.timestamp) {
        const date = new Date(curStatement.timestamp).toDateString();
        reportEntry.date = date;
        reportEntry.dateObject = new Date(curStatement.timestamp);
      }

      // Get answer id from extensions
      reportEntry.answerId = getAnswerId(curStatement);

      allReportEntries.push(reportEntry);
    }
  });

  // Sort by date
  allReportEntries.sort((a, b) =>
    new Date(a.date) > new Date(b.date) ? -1 : 1
  );
  // Sort by userId
  const uniqueUserIds = getUniqueUserIdsFromStatements(statements);
  const entriesSortedByIdAndDate = uniqueUserIds.reduce(
    (reportEntriesSortedByUserId, userId) => {
      return [
        ...reportEntriesSortedByUserId,
        ...allReportEntries.filter(
          (reportEntry) => reportEntry.userId === userId
        ),
      ];
    },
    [] as ReportEntry[]
  );
  return entriesSortedByIdAndDate;
};

/**
 * It takes a statement and returns the origin of the object's id
// eslint-disable-next-line @typescript-eslint/no-explicit-any
 * @param {any} statement - The statement that was sent to the LRS.
 * @returns The origin of the URL
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getOrigin = (statement: any): string => {
  const origin = new URL(statement["object"]["id"]);
  return `${origin.origin}${origin.pathname}`;
};

/**
 * It takes a statement and returns the id of the mentor who answered the question
// eslint-disable-next-line @typescript-eslint/no-explicit-any 
* @param {any} statement - the statement that was sent to the LRS
 * @returns The mentor's answer id.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getMentorAnswerId = (statement: any): string => {
  const mentor =
    statement["result"]["extensions"][
      "https://mentorpal.org/xapi/verb/answer-playback-started"
    ]["mentorCur"];

  return mentor;
};

const getAllMentorsAsked = (statement: Statement): string[] => {
  const extensions = statement.result?.extensions;

  if (!extensions) {
    return [];
  }

  const foundExtention =
    extensions["https://mentorpal.org/xapi/verb/answer-playback-started"];

  if (!foundExtention) {
    return [];
  }

  const mentorsAsked = foundExtention["answerStatusByMentor"];

  if (!mentorsAsked) {
    return [];
  }

  return Object.keys(mentorsAsked);
};

const getAnswerId = (statement: Statement): string => {
  try {
    const extensions = statement.result?.extensions;

    if (!extensions) {
      return "";
    }
    const answeredExtension =
      extensions["https://mentorpal.org/xapi/verb/answered"];

    if (!answeredExtension) {
      return "";
    }

    return answeredExtension["answerId"] || "";
  } catch (err) {
    console.error("failed to get answer id", err, statement);
    return "";
  }
};

/**
 * It takes a statement as an argument and returns the mentorID of the mentor selected
// eslint-disable-next-line @typescript-eslint/no-explicit-any 
* @param {any} statement - the statement object
 * @returns The mentorID is being returned.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getMentorSelected = (statement: any): string => {
  const mentor =
    statement["result"]["extensions"][
      "https://mentorpal.org/xapi/verb/selected"
    ]["mentorID"];
  const isMentorPanel =
    statement["result"]["extensions"][
      "https://mentorpal.org/xapi/verb/selected"
    ]["isPanel"];
  if (!isMentorPanel) {
    return mentor;
  }
  const mentorPanel =
    statement["result"]["extensions"][
      "https://mentorpal.org/xapi/verb/selected"
    ]["mentorID"];
  return mentorPanel;
};

/**
 * It takes a statement as an argument and returns the type of question that was asked
// eslint-disable-next-line @typescript-eslint/no-explicit-any 
* @param {any} statement - The statement that was sent to the LRS.
 * @returns The type of question that was asked.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getQuestionType = (statement: any): string => {
  const type =
    statement["result"]["extensions"]["https://mentorpal.org/xapi/verb/asked"][
      "source"
    ];
  return type;
};

/**
 * It takes a statement as an argument and returns the question that was asked
 * @param statement - the statement that was sent to the LRS
 * @returns The question being asked.
 */
export const getQuestion = (statement: Statement): string => {
  try {
    const extensions = statement.result?.extensions;
    if (!extensions) {
      return "";
    }
    return extensions["https://mentorpal.org/xapi/verb/asked"]["text"];
  } catch (err) {
    return "";
  }
};

/**
 * It takes a statement, and returns the referrer from the statement's object
 * @param statement - the statement object that is being processed
 * @returns The referrer of the statement.
 */
const getReferrer = (statement: Statement): string => {
  try {
    const object: Activity = statement.object as Activity;
    const url = object.id;
    const referrer = new URLSearchParams(url).get("referrer") || "-";
    return referrer;
  } catch (err) {
    console.error("failed to get referrer", err);
    return "";
  }
};

/**
 * It takes in a date and an array of statements, and returns a set of unique user ids that match the
 * date
 * @param {string} date - The date you want to find the user ids for.
// eslint-disable-next-line @typescript-eslint/no-explicit-any 
* @param {any} statements - The statements that you want to filter through.
 * @returns A set of unique user ids
 */
export const findUserIdsByDate = (
  date: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  statements: Statement[]
): Set<unknown> | undefined => {
  if (!date) {
    return undefined;
  }

  const uniqueUserIds = new Set();
  for (const statement in statements) {
    const curStatement = statements[statement];
    const formattedInputDate = new Date(date).toDateString();
    if (!curStatement.timestamp) {
      // statement does not have a properly stored date, unable to confirm if on this date.
      continue;
    }
    const formattedStatementDate = new Date(
      curStatement.timestamp
    ).toDateString();

    if (formattedInputDate === formattedStatementDate) {
      const userId = curStatement["actor"]["name"];
      uniqueUserIds.add(userId);
    }
  }
  return uniqueUserIds;
};

export const getUniqueUserIdsFromStatements = (
  statements: Statement[]
): string[] => {
  const uniqueUserIds = new Set<string>();
  statements.forEach((statement) => {
    const userId = statement["actor"]["name"];
    if (userId) {
      uniqueUserIds.add(userId);
    }
  });
  return Array.from(uniqueUserIds);
};

export const getUniqueUserIdsFromReportEntries = (
  reportEntries: ReportEntry[]
): string[] => {
  const uniqueUserIds = new Set<string>();
  reportEntries.forEach((entry) => {
    uniqueUserIds.add(entry.userId);
  });
  return Array.from(uniqueUserIds);
};

export const generateReportForAllUsers = (
  statements: Statement[]
): ReportEntry[] => {
  return generateUserReport(
    getUniqueUserIdsFromStatements(statements),
    statements
  );
};

export interface Report {
  action: Array<string>;
  referrer: Array<string>;
  mentorSelected: Array<string>;
  question: Array<string>;
  typed: Array<string>;
  answer: Array<string>;
  source: Array<string>;
  date: Array<string>;
  userId: Array<string>;
  dataSource: Array<string>;
  topics: Array<string[]>;
}

/**
 * It takes a report and an id, converts the report to a DataFrame, and then downloads the DataFrame as
 * a CSV file
 * @param {Report} report - Report - the report object that we want to convert to CSV
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const reportToCsv = (reportEntries: ReportEntry[]): any => {
  console.log("going to csv")
  // Sort by date
  reportEntries.sort((a, b) =>
    a.dateObject.getTime() < b.dateObject.getTime() ? -1 : 1
  );
  // Sort by userId
  const uniqueUserIds = getUniqueUserIdsFromReportEntries(reportEntries);
  const entriesSortedByIdAndDate = uniqueUserIds.reduce(
    (reportEntriesSortedByUserId, userId) => {
      return [
        ...reportEntriesSortedByUserId,
        ...reportEntries.filter((reportEntry) => reportEntry.userId === userId),
      ];
    },
    [] as ReportEntry[]
  );

  // Pull out the orphaned questions and insert at the end
  const nonOrphanedEntries = entriesSortedByIdAndDate.filter(
    (entry) => entry.dataSource !== "orphaned_user_question"
  );
  const orphanedEntries = entriesSortedByIdAndDate.filter(
    (entry) => entry.dataSource == "orphaned_user_question"
  );

  const effectiveEntries = [...nonOrphanedEntries, ...orphanedEntries];

  const report: Report = {
    action: effectiveEntries.map((entry) => entry.action),
    referrer: effectiveEntries.map((entry) => entry.referrer),
    mentorSelected: effectiveEntries.map((entry) => entry.mentorSelected),
    question: effectiveEntries.map((entry) => `"${entry.question}"`),
    typed: effectiveEntries.map((entry) => entry.typed),
    answer: effectiveEntries.map((entry) => entry.answer),
    source: effectiveEntries.map((entry) => entry.source),
    date: effectiveEntries.map(
      (entry) =>
        `"${entry.dateObject.toLocaleString("en-US", {
          timeZone: "America/Los_Angeles",
        })}"`
    ),
    userId: effectiveEntries.map((entry) => entry.userId),
    dataSource: effectiveEntries.map((entry) => entry.dataSource),
    topics: effectiveEntries.map((entry) => entry.topics),
  };
  const dfReport = new dfd.DataFrame(report);

  dfd.toCSV(dfReport, {
    fileName: `report`,
    download: true,
    header: true,
  });
};

export interface UserQuestionReport {
  mentorId: Array<string>;
  mentorName: Array<string>;
  date: Array<string>;
  question: Array<string>;
  classifierQuestionMatch: Array<string>;
  confidence: Array<number>;
  feedback: Array<string>;
  graderQuestionMatch: Array<string>;
}

export const userQuestionsToCSV = (userQuestions: UserQuestionGQL[]): void => {
  userQuestions.sort((a, b) =>
    new Date(a.createdAt) > new Date(b.createdAt) ? -1 : 1
  );

  const report: UserQuestionReport = {
    mentorId: userQuestions.map((uq) => uq.mentor._id),
    mentorName: userQuestions.map((uq) => `"${uq.mentor.name}"`),
    date: userQuestions.map(
      (uq) =>
        `"${new Date(uq.createdAt).toLocaleString("en-US", {
          timeZone: "America/Los_Angeles",
        })}"`
    ),
    question: userQuestions.map((uq) => `"${uq.question}"`),
    classifierQuestionMatch: userQuestions.map(
      (uq) => `"${uq.classifierAnswer.question.question}"`
    ),
    confidence: userQuestions.map((uq) => uq.confidence),
    feedback: userQuestions.map((uq) => uq.feedback),
    graderQuestionMatch: userQuestions.map(
      (uq) => ` "${uq.graderAnswer ? uq.graderAnswer.question.question : "-"}"`
    ),
  };

  const dfReport = new dfd.DataFrame(report);

  dfd.toCSV(dfReport, {
    fileName: `user-questions-report`,
    download: true,
    header: true,
  });
};
