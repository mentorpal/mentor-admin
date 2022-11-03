/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { getUniqueQuestionAndAnswer } from "../../support/functions";
import { Mentor, Question, Status, SubjectTypes } from "../../support/types";
import questions from "../questions";
import { builtMentor } from "./recommender-phase-2-statuses";

export const hasSubjectQuestionsOver20 = (): [Mentor, Question[]] => {
  const { questions: newQuestions, answers: newAnswers } =
    getUniqueQuestionAndAnswer(15);
  const newMentor = {
    ...builtMentor,
    subjects: [
      ...builtMentor.subjects,
      {
        _id: "new_subject_1",
        name: "Subject 1",
        type: SubjectTypes.SUBJECT,
        isRequired: true,
        description: "Mock subject to reach 20+ subject questions",
        categories: [
          {
            id: "category1",
            name: "Category1",
            description: "A category",
          },
          {
            id: "category3",
            name: "Category3",
            description: "",
          },
        ],
        topics: [],
        questions: newQuestions,
      },
    ],
    answers: [...builtMentor.answers, ...newAnswers],
  };
  const newQuestionSet = [
    ...questions,
    ...newQuestions.map((subjQ) => subjQ.question),
  ];
  return [newMentor, newQuestionSet];
};

export const isDirtyMentor = (): [Mentor, Question[]] => {
  const [newMentor, newQuestionSet] = hasSubjectQuestionsOver20();

  const updatedMentor: Mentor = {
    ...newMentor,
    isDirty: true,
  };

  return [updatedMentor, newQuestionSet];
};

export const isBuiltButNotPreviewed = (): [Mentor, Question[]] => {
  const [newMentor, newQuestionSet] = hasSubjectQuestionsOver20();

  const updatedMentor: Mentor = {
    ...newMentor,
    isDirty: false,
    lastTrainedAt: "12356",
    lastPreviewedAt: "",
  };

  return [updatedMentor, newQuestionSet];
};

export const answered20Questions = (): [Mentor, Question[]] => {
  const [newMentor, newQuestionSet] = hasSubjectQuestionsOver20();

  const updatedMentor: Mentor = {
    ...newMentor,
    isDirty: true,
    lastTrainedAt: "1235",
    lastPreviewedAt: "",
    answers: newMentor.answers.map((a) => {
      a.status = Status.COMPLETE;
      return a;
    }),
  };

  return [updatedMentor, newQuestionSet];
};
