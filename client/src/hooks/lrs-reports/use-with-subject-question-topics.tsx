/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  fetchAllSubjectQuestionsAndTopics,
  SubjectQuestionsTopicsGQL,
  SubjectQuestionTopicsGQL,
} from "lrs-api";

export type TopicNames = string[];
export type QuestionId = string;
export type SubjectQuestionTopicMappings = Record<QuestionId, TopicNames>;

export interface UseWitSubjectQuestionTopics {
  fetchQuestionTopicMappings: () => Promise<SubjectQuestionTopicMappings>;
}

export function useWitSubjectQuestionTopics(): UseWitSubjectQuestionTopics {
  async function fetchQuestionTopicMappings(): Promise<SubjectQuestionTopicMappings> {
    const subjectQuestionsAndTopicsConnection =
      await fetchAllSubjectQuestionsAndTopics();
    const subjectQuestionsAndTopics =
      subjectQuestionsAndTopicsConnection.edges.map((edge) => edge.node);
    const allSubjectQuestions = subjectQuestionsAndTopics.reduce(
      (acc: SubjectQuestionTopicsGQL[], cur: SubjectQuestionsTopicsGQL) => {
        return [...acc, ...cur.questions];
      },
      []
    );
    const questionIdToTopicsMapping: SubjectQuestionTopicMappings =
      allSubjectQuestions.reduce(
        (
          record: SubjectQuestionTopicMappings,
          cur: SubjectQuestionTopicsGQL
        ) => {
          record[cur.question._id] = cur.topics.map((topic) => topic.name);
          return record;
        },
        {}
      );
    return questionIdToTopicsMapping;
  }
  return {
    fetchQuestionTopicMappings,
  };
}
