/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect, useState } from "react";

import {
  fetchMentorRecordQueue,
  setRecordQueueGQL,
  removeQuestionFromRecordQueue,
  addQuestionToRecordQueue,
} from "api";
import { isAnswerComplete } from "helpers";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import { Answer, Status } from "types";

export interface useWithRecordQueue {
  recordQueue: string[];
  removeQuestionFromQueue: (questionId: string) => void;
  addQuestionToQueue: (questionId: string) => void;
}

export function useWithRecordQueue(accessToken: string): useWithRecordQueue {
  const { getData } = useActiveMentor();
  const mentorAnswers: Answer[] = getData((state) => state.data?.answers);
  const mentorType = getData((m) => m.data?.mentorType);
  const [queueIDList, setQueueIDList] = useState<string[]>([]);
  const [answerStatuses, setAnswerStatuses] = useState<Status[]>([]);

  useEffect(() => {
    fetchMentorRecordQueue(accessToken).then((queueIDList) => {
      setQueueIDList(queueIDList);
    });
  }, []);

  useEffect(() => {
    if (!mentorAnswers) {
      return;
    }
    if (mentorAnswers.length && !answerStatuses.length) {
      setAnswerStatuses(mentorAnswers.map((answer) => answer.status));
      return;
    }
    const differentLength = mentorAnswers.length !== answerStatuses.length;
    let differentStatus = false;
    if (!differentLength) {
      mentorAnswers.forEach((answer, i) => {
        if (answerStatuses[i] !== answer.status) {
          differentStatus = true;
        }
      });
    }
    if (differentStatus || differentLength) {
      setAnswerStatuses(mentorAnswers.map((answer) => answer.status));
    }
  }, [mentorAnswers]);

  useEffect(() => {
    if (!mentorAnswers || queueIDList.length == 0) {
      return;
    }
    const idListAfterRemoval = removeCompleteAnswerFromQueue(
      queueIDList,
      mentorAnswers
    );
    setQueueIDList(idListAfterRemoval);
  }, [answerStatuses]);

  function removeCompleteAnswerFromQueue(
    queueIDList: string[],
    mentorAnswers: Answer[]
  ): string[] {
    // remove answered questions from queue
    const mentorAnswersInRecordQueue = mentorAnswers.filter((mentorAnswer) =>
      queueIDList.includes(mentorAnswer.question)
    );
    const newQueueIdList = queueIDList.filter((questionId) => {
      const answer = mentorAnswersInRecordQueue.find(
        (a) => a.question === questionId
      );
      if (!answer) {
        return true;
      }
      console.log(isAnswerComplete(answer, undefined, mentorType));
      return !isAnswerComplete(answer, undefined, mentorType);
    });
    setRecordQueueGQL(accessToken, newQueueIdList);
    return newQueueIdList;
  }

  function removeQuestionFromQueue(questionId: string) {
    removeQuestionFromRecordQueue(accessToken, questionId);
    const newList = queueIDList.filter((qId) => qId !== questionId);
    setQueueIDList(newList);
  }

  function addQuestionToQueue(questionId: string) {
    addQuestionToRecordQueue(accessToken, questionId);
    setQueueIDList((prev) => {
      return [...prev, questionId];
    });
  }

  return {
    recordQueue: queueIDList,
    removeQuestionFromQueue,
    addQuestionToQueue,
  };
}
