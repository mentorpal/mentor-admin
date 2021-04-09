import { Mentor } from "./types";

export function updateAnswer(
  mentor: Mentor,
  answerId: string,
  update: any
): Mentor {
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
