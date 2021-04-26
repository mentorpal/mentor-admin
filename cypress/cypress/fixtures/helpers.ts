import { Mentor } from "../support/types";

export function updateAnswer(
  m: Mentor,
  qid: string,
  update: any
): Mentor {
  return {
    ...m,
    answers: m.answers.map((answer) => {
      if(answer.question._id === qid) {
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
