/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  Mentor,
  MentorType,
  Question,
  QuestionType,
  Subject,
  SubjectQuestion,
} from "./types";

export function completeMentor(m) {
  return {
    ...m,
    _id: m._id || "",
    name: m.name || "",
    firstName: m.firstName || "",
    title: m.title || "",
    mentorType: (m.mentorType || MentorType.VIDEO) as MentorType,
    lastTrainedAt: m.lastTrainedAt || "",
    subjects: m.subjects || [],
    topics: m.topics || [],
    answers: m.answers || [],
    questions: m.questions || [],
  };
}

export function completeQuestion(q: Partial<Question>): Question {
  return {
    ...q,
    _id: q._id || "",
    question: q.question || "",
    name: q.name || "",
    type: q.type || QuestionType.QUESTION,
    paraphrases: q.paraphrases || [],
  };
}

export function completeSubjectQuestion(
  q: Partial<SubjectQuestion>
): SubjectQuestion {
  return {
    ...q,
    question: completeQuestion(q.question || {}),
    topics: q.topics || [],
  };
}

export function completeSubject(s) {
  return {
    ...s,
    _id: s._id || "",
    name: s.name || "",
    description: s.description || "",
    categories: s.categories || [],
    topics: s.topics || [],
    questions: s.questions || [],
  };
}

export function updateMentorAnswer(mentor: any, answerId: string, update: any) {
  return {
    ...mentor,
    answers: mentor.answers.map((answer) => {
      if (answer._id === answerId) {
        return {
          ...answer,
          ...update,
        };
      } else {
        return answer;
      }
    }),
  };
}

export function updateSubjectQuestion(
  subject: Partial<Subject>,
  questionId: string,
  update: any
): Partial<Mentor> {
  return {
    ...subject,
    questions: subject.questions.map((subjectQuestion) => {
      if (subjectQuestion.question._id === questionId) {
        return {
          ...subjectQuestion,
          ...update,
        };
      } else {
        return subjectQuestion;
      }
    }),
  };
}
