/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { updateAnswer, updateQuestion } from "api";
import { useEffect, useState } from "react";
import { Answer, MentorType, UtteranceName } from "types";
import { useWithMentor } from "./use-with-mentor";

interface RecordState {
  answers: Answer[];
  curAnswerIdx: number;
  curAnswer?: Answer;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function equals(val1: any, val2: any): boolean {
  return JSON.stringify(val1) === JSON.stringify(val2);
}

function copyAndSet<T>(a: T[], i: number, item: T): T[] {
  return [...a.slice(0, i), item, ...a.slice(i + 1)];
}

export function useWithRecordState(
  accessToken: string,
  search: {
    videoId?: string[] | string;
    subject?: string;
    status?: string;
    category?: string;
  }
) {
  const [recordState, setRecordState] = useState<RecordState>({
    answers: [],
    curAnswerIdx: 0,
  });
  const { mentor, isMentorLoading, isMentorSaving } = useWithMentor(
    accessToken
  );

  useEffect(() => {
    if (!mentor || isMentorLoading || isMentorSaving) {
      return;
    }
    const { videoId, subject, category, status } = search;
    let answers = mentor.answers;
    if (videoId) {
      const ids = Array.isArray(videoId) ? videoId : [videoId];
      answers = mentor.answers.filter((a) => ids.includes(a.question._id));
    } else if (subject) {
      const s = mentor.subjects.find((a) => a._id === subject);
      if (s) {
        const sQuestions = s.questions.filter(
          (q) => !category || `${q.category?.id}` === category
        );
        answers = mentor.answers.filter((a) =>
          sQuestions.map((q) => q.question._id).includes(a.question._id)
        );
      }
    }
    if (status) {
      answers = answers.filter((a) => a.status === status);
    }
    if (mentor.mentorType === MentorType.CHAT) {
      answers = answers.filter((a) => a.question.name !== UtteranceName.IDLE);
    }
    setRecordState({ ...recordState, answers });
  }, [mentor]);

  useEffect(() => {
    const { answers, curAnswerIdx } = recordState;
    if (answers.length === 0 || curAnswerIdx >= answers.length) {
      return;
    }
    setRecordState({
      ...recordState,
      curAnswer: answers[curAnswerIdx],
    });
  }, [recordState.curAnswerIdx, recordState.answers]);

  function nextAnswer() {
    if (recordState.curAnswerIdx === recordState.answers.length - 1) {
      return;
    }
    setRecordState({
      ...recordState,
      curAnswerIdx: recordState.curAnswerIdx + 1,
    });
  }

  function prevAnswer() {
    if (recordState.curAnswerIdx === 0) {
      return;
    }
    setRecordState({
      ...recordState,
      curAnswerIdx: recordState.curAnswerIdx - 1,
    });
  }

  function editCurAnswer(edits: Partial<Answer>) {
    if (!recordState.curAnswer) {
      return;
    }
    setRecordState({
      ...recordState,
      curAnswer: { ...recordState.curAnswer, ...edits },
    });
  }

  function saveAnswer(mentorId: string, answer: Answer, aIdx: number) {
    const { answers, curAnswer, curAnswerIdx } = recordState;
    if (!mentor || isMentorLoading || isMentorSaving) {
      return;
    }
    updateAnswer(mentor._id, answer, accessToken)
      .then((didUpdate) => {
        // don't update if state has changed since calling update?
        if (!didUpdate || curAnswerIdx !== aIdx || !equals(curAnswer, answer)) {
          return;
        }
        setRecordState({
          ...recordState,
          answers: copyAndSet(answers, aIdx, answer),
          curAnswer: answer,
        });
      })
      .catch((err) => {
        console.error(err);
      });
  }

  function saveCurAnswer() {
    const { answers, curAnswer, curAnswerIdx } = recordState;
    if (!curAnswer || !mentor || isMentorLoading || isMentorSaving) {
      return;
    }
    let answer = curAnswer;
    const question = curAnswer.question;
    const aIdx = curAnswerIdx;
    // update the question
    if (!equals(question, answers[aIdx].question)) {
      updateQuestion(question, accessToken)
        .then((didUpdate) => {
          // don't update if state has changed since calling update?
          if (
            !didUpdate ||
            curAnswerIdx !== aIdx ||
            !equals(curAnswer, answer)
          ) {
            return;
          }
          answer = {
            ...answers[aIdx],
            question: question,
          };
          if (!equals(answer, answers[aIdx])) {
            saveAnswer(mentor._id, answer, aIdx);
          } else {
            setRecordState({
              ...recordState,
              answers: copyAndSet(answers, aIdx, answer),
              curAnswer: answer,
            });
          }
        })
        .catch((err) => {
          console.error(err);
        });
    }
    // update the answer
    else if (!equals(answer, answers[curAnswerIdx])) {
      saveAnswer(mentor._id, answer, aIdx);
    }
  }

  return {
    answers: recordState.answers,
    curAnswer: recordState.curAnswer,
    curAnswerIdx: recordState.curAnswerIdx,
    hasUnsavedChanges: equals(
      recordState.curAnswer,
      recordState.answers[recordState.curAnswerIdx]
    ),
    nextAnswer,
    prevAnswer,
    editAnswer: editCurAnswer,
    saveAnswer: saveCurAnswer,
  };
}
