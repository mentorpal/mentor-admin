/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { getUniqueQuestionAndAnswer } from "../../support/functions";
import { Mentor, Question, Status } from "../../support/types";
import { answered1100Questions } from "./recommender-full-subject-statuses";

export const hasSubjectQuestionsOver1300 = (): [Mentor, Question[]] => {
  const [oldMentor, oldQuestionSet] = answered1100Questions();
  const { questions: newQuestionSet, answers: newAnswers } =
    getUniqueQuestionAndAnswer(200);
  const newMentor: Mentor = {
    ...oldMentor,
    subjects: oldMentor.subjects.map((subj) => {
      if (subj._id == "new_subject_1") {
        subj.questions = [...subj.questions, ...newQuestionSet];
      }
      return subj;
    }),
    answers: [...oldMentor.answers, ...newAnswers],
  };

  return [
    newMentor,
    [...oldQuestionSet, ...newQuestionSet.map((subjQ) => subjQ.question)],
  ];
};

export const dirtyMentor = (): [Mentor, Question[]] => {
  const [oldMentor, oldQuestionSet] = hasSubjectQuestionsOver1300();

  const updatedMentor: Mentor = {
    ...oldMentor,
    isDirty: true,
  };

  return [updatedMentor, oldQuestionSet];
};
