import { Mentor, Question } from "../support/types";

export function updateQuestion(
  m: Mentor,
  qid: string,
  update: Partial<Question>
): Mentor {
  return {
    ...m,
    questions: m.questions.map((q) => {
      if(q.id === qid) {
        return {
          ...q,
          ...update
        }
      }
      else {
        return q
      }
    })
  };
}
