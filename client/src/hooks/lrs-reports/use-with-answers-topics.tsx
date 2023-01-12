/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { AnswerQuestionIdsGQL, fetchAnswersQuestionIds } from "lrs-api";
import { useWitSubjectQuestionTopics } from "./use-with-subject-question-topics";
type AnswerId = string;
type TopicNames = string[];
export interface UseWithAnswersTopics {
  fetchAnswerTopicMappings: (
    answerIds: string[]
  ) => Promise<Record<string, TopicNames>>;
}

export function useWithAnswersTopics(): UseWithAnswersTopics {
  const { fetchQuestionTopicMappings } = useWitSubjectQuestionTopics();

  const MAX_FETCHES = 50;

  async function recursivelyFetchMoreAnswers(
    answerAcc: AnswerQuestionIdsGQL[],
    totalFetches: number,
    cursor: string,
    answerIds: string[]
  ): Promise<AnswerQuestionIdsGQL[]> {
    if (totalFetches > MAX_FETCHES) {
      console.log("too many page fetches for answers");
      return answerAcc;
    }
    const moreAnswerFetches = await fetchAnswersQuestionIds({
      limit: 200,
      sortBy: "",
      sortAscending: false,
      filter: {
        _id: {
          $in: answerIds,
        },
      },
      cursor: cursor,
    });
    const moreAnswers = moreAnswerFetches.edges.map((uq) => uq.node);
    if (moreAnswerFetches.pageInfo.endCursor) {
      return recursivelyFetchMoreAnswers(
        [...answerAcc, ...moreAnswers],
        totalFetches + 1,
        moreAnswerFetches.pageInfo.endCursor,
        answerIds
      );
    }
    return [...answerAcc, ...moreAnswers];
  }

  async function fetchAnswerTopicMappings(answerIds: string[]) {
    try {
      const answerQuestionIdsConnection = await fetchAnswersQuestionIds();
      let allAnswerQuestionObjects = answerQuestionIdsConnection.edges.map(
        (edge) => edge.node
      );
      if (answerQuestionIdsConnection.pageInfo.endCursor) {
        allAnswerQuestionObjects = await recursivelyFetchMoreAnswers(
          allAnswerQuestionObjects,
          0,
          answerQuestionIdsConnection.pageInfo.endCursor,
          answerIds
        );
      }
      const answerIdToQuestionMapping: Record<string, string> =
        allAnswerQuestionObjects.reduce(
          (record: Record<string, string>, cur: AnswerQuestionIdsGQL) => {
            record[cur._id] = cur.question._id;
            return record;
          },
          {}
        );

      const questionToTopicMapping = await fetchQuestionTopicMappings();
      const allAnswerIds = allAnswerQuestionObjects.map(
        (answerQuestionObject) => answerQuestionObject._id
      );
      return allAnswerIds.reduce(
        (record: Record<AnswerId, TopicNames>, answerId: string) => {
          try {
            const questionId = answerIdToQuestionMapping[answerId];
            const relatedTopics = questionToTopicMapping[questionId];
            record[answerId] = relatedTopics;
            return record;
          } catch (err) {
            console.error(err);
            record[answerId] = [];
            return record;
          }
        },
        {}
      );
    } catch (err) {
      console.error("Failed to get answers", err);
      return {};
    }
  }

  return {
    fetchAnswerTopicMappings,
  };
}
