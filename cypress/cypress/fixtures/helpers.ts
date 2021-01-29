
export function updateAnswers(
  answers: any[],
  qid: string,
  update: any
) {
  return {
    answers: answers.map((answer) => {
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


export function updateAnswer(
  m: any,
  qid: string,
  update: any
) {
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
