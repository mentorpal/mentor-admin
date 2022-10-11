/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect, useReducer, useState } from "react";

import {
  fetchMentorRecordQueue,
  setRecordQueueGQL,
  removeQuestionFromRecordQueue,
  addQuestionToRecordQueue,
} from "api";
import { isAnswerComplete } from "helpers";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import { Answer, Question, Status } from "types";
import {
  LoadingReducer,
  LoadingState,
  LoadingStatusType,
  LoadingActionType,
} from "./generic-loading-reducer";
import useQuestions, {
  isQuestionsLoading,
} from "store/slices/questions/useQuestions";

export interface useWithRecordQueue {
  recordQueue: string[];
  loadingStatus: LoadingStatusType;
  questionDocsInQueue: Question[];
  removeQuestionFromQueue: (questionId: string) => void;
  addQuestionToQueue: (questionId: string) => void;
}

export interface RecordQueueData {
  idsInQueue: string[];
  docsInQueue: Question[];
}

const initialState: LoadingState<RecordQueueData> = {
  status: LoadingStatusType.LOADING,
  data: { idsInQueue: [], docsInQueue: [] },
  error: undefined,
};

export function useWithRecordQueue(accessToken: string): useWithRecordQueue {
  const { getData, isLoading: mentorIsLoading } = useActiveMentor();
  const mentorAnswers: Answer[] = getData((state) => state.data?.answers);
  const mentorQuestions = useQuestions(
    (state) => state.questions,
    (mentorAnswers || []).map((a) => a.question)
  );

  const questionsLoading = isQuestionsLoading(
    (mentorAnswers || []).map((a) => a.question)
  );
  const mentorType = getData((m) => m.data?.mentorType);
  const [answerStatuses, setAnswerStatuses] = useState<Status[]>([]);
  const [state, dispatch] = useReducer(
    LoadingReducer<RecordQueueData>,
    initialState
  );

  function updateQueue(newIdList: string[]) {
    const mentorQuestionDocsInQueue = newIdList.reduce(
      (acc: Question[], questionId) => {
        const questionDoc = mentorQuestions[questionId]?.question;
        if (questionDoc) {
          acc.push(questionDoc);
        }
        return acc;
      },
      []
    );
    dispatch({
      type: LoadingActionType.LOADING_SUCCEEDED,
      dataPayload: {
        idsInQueue: newIdList,
        docsInQueue: mentorQuestionDocsInQueue,
      },
    });
  }

  useEffect(() => {
    if (
      mentorIsLoading ||
      questionsLoading ||
      Object.keys(mentorQuestions).length === 0
    ) {
      return;
    }
    fetchMentorRecordQueue(accessToken)
      .then((queueIDList) => {
        updateQueue(queueIDList);
      })
      .catch((err) => {
        dispatch({
          type: LoadingActionType.LOADING_FAILED,
          errorPayload: {
            message: "Failed to fetch record queue",
            error: JSON.stringify(err),
          },
        });
        console.error("failed to fetch record queue", err);
      });
  }, [questionsLoading, mentorIsLoading, mentorQuestions]);

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
    if (!mentorAnswers || !state.data || state.data.idsInQueue.length == 0) {
      return;
    }
    const idListAfterRemoval = removeCompleteAnswerFromQueue(
      state.data.idsInQueue,
      mentorAnswers
    );
    const questionDocsAfterRemoval = state.data.docsInQueue.filter(
      (questionDoc) => {
        idListAfterRemoval.find((idInQueue) => idInQueue === questionDoc._id);
      }
    );
    dispatch({
      type: LoadingActionType.LOADING_SUCCEEDED,
      dataPayload: {
        idsInQueue: idListAfterRemoval,
        docsInQueue: questionDocsAfterRemoval,
      },
    });
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
      return !isAnswerComplete(answer, undefined, mentorType);
    });
    setRecordQueueGQL(accessToken, newQueueIdList);
    return newQueueIdList;
  }

  function removeQuestionFromQueue(questionId: string) {
    removeQuestionFromRecordQueue(accessToken, questionId)
      .then((newList) => {
        updateQueue(newList);
      })
      .catch((err) => {
        dispatch({
          type: LoadingActionType.LOADING_FAILED,
          errorPayload: {
            message: "Failed to remove question from record queue",
            error: JSON.stringify(err),
          },
        });
      });
  }

  function addQuestionToQueue(questionId: string) {
    addQuestionToRecordQueue(accessToken, questionId)
      .then((newList) => {
        updateQueue(newList);
      })
      .catch((err) => {
        dispatch({
          type: LoadingActionType.LOADING_FAILED,
          errorPayload: {
            message: "Failed to add question to record queue",
            error: JSON.stringify(err),
          },
        });
      });
  }

  return {
    recordQueue: state.data?.idsInQueue || [],
    questionDocsInQueue: state.data?.docsInQueue || [],
    loadingStatus: state.status,
    removeQuestionFromQueue,
    addQuestionToQueue,
  };
}
