import { Mentor, Subject } from "./types";

export function updateMentorAnswer(
  mentor: Partial<Mentor>,
  answerId: string,
  update: any
): Partial<Mentor> {
  return {
    ...mentor,
    answers: mentor.answers.map((answer) => {
      if(answer._id === answerId) {
        return {
          ...answer,
          ...update
        }
      }
      else {
        return answer
      }
    })
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
      if(subjectQuestion.question._id === questionId) {
        return {
          ...subjectQuestion,
          ...update
        }
      }
      else {
        return subjectQuestion
      }
    })
  };
}