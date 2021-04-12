import { Mentor } from "./types";

export function updateAnswer(
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
