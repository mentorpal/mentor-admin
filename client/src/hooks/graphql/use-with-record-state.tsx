/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect, useReducer, useState } from "react";
import { updateAnswer, updateQuestion, UPLOAD_ENTRYPOINT } from "api";
import { Answer, MentorType, UtteranceName } from "types";
import { useWithUploading } from "hooks/task/use-with-upload";
import { useWithMentor } from "./use-with-mentor";
import {
  RecordingActionType,
  RecordingReducer,
  RecordingState,
} from "./recording-reducer";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function equals(val1: any, val2: any): boolean {
  return JSON.stringify(val1) === JSON.stringify(val2);
}

function copyAndSet<T>(a: T[], i: number, item: T): T[] {
  return [...a.slice(0, i), item, ...a.slice(i + 1)];
}

const initialState: RecordingState = {
  isSaving: false,
  isUploading: false,
  isRecording: false,
  error: undefined,
};

interface AnswerState {
  answer: Answer;
  recordedVideo?: File;
  minVideoLength?: number;
}

export interface CurAnswerState {
  answer: Answer;
  isEdited: boolean;
  isValid: boolean;
  videoSrc: string | undefined;
  recordedVideo: File | undefined;
  minVideoLength: number | undefined;
}

export function useWithRecordState(
  accessToken: string,
  filter: {
    videoId?: string[] | string;
    subject?: string;
    status?: string;
    category?: string;
  }
) {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [answerIdx, setAnswerIdx] = useState<number>(0);
  const [curAnswerState, setCurAnswerState] = useState<AnswerState>();
  const [state, dispatch] = useReducer(RecordingReducer, initialState);

  const { mentor } = useWithMentor(accessToken);
  const { isUploading, startUploading } = useWithUploading();

  useEffect(() => {
    if (!mentor) {
      return;
    }
    const { videoId, subject, category, status } = filter;
    let answers = mentor.answers;
    if (videoId) {
      const ids = Array.isArray(videoId) ? videoId : [videoId];
      answers = answers.filter((a) => ids.includes(a.question._id));
    } else if (subject) {
      const s = mentor.subjects.find((a) => a._id === subject);
      if (s) {
        const sQuestions = s.questions.filter(
          (q) => !category || `${q.category?.id}` === category
        );
        answers = answers.filter((a) =>
          sQuestions.map((q) => q.question._id).includes(a.question._id)
        );
      }
    }
    if (status) {
      answers = answers.filter((a) => a.status === status);
    }
    answers = answers.filter(
      (a) =>
        !a.question.mentorType || a.question.mentorType === mentor.mentorType
    );
    setAnswers(answers);
  }, [mentor]);

  useEffect(() => {
    if (answers.length === 0 || answerIdx >= answers.length) {
      return;
    }
    const answer = answers[answerIdx];
    setCurAnswerState({
      answer,
      minVideoLength: answer.question.minVideoLength,
    });
    dispatch({ type: RecordingActionType.RECORDING, payload: false });
  }, [answers, answerIdx]);

  useEffect(() => {
    if (isUploading === state.isUploading) {
      return;
    }
    dispatch({ type: RecordingActionType.UPLOADING, payload: isUploading });
  }, [isUploading]);

  function prevAnswer() {
    if (
      !curAnswerState ||
      state.isUploading ||
      state.isSaving ||
      answerIdx === 0
    ) {
      return;
    }
    setAnswerIdx(answerIdx - 1);
  }

  function nextAnswer() {
    if (
      !curAnswerState ||
      state.isUploading ||
      state.isSaving ||
      answerIdx >= answers.length
    ) {
      return;
    }
    setAnswerIdx(answerIdx + 1);
  }

  function rerecord() {
    if (!curAnswerState || state.isUploading || state.isSaving) {
      return;
    }
    setCurAnswerState({
      ...curAnswerState,
      recordedVideo: undefined,
      answer: { ...curAnswerState.answer, recordedAt: undefined },
    });
  }

  function startRecording() {
    if (!curAnswerState || state.isUploading || state.isSaving) {
      return;
    }
    dispatch({ type: RecordingActionType.RECORDING, payload: true });
  }

  function stopRecording(video: File) {
    if (!curAnswerState || state.isUploading || state.isSaving) {
      return;
    }
    setCurAnswerState({
      ...curAnswerState,
      recordedVideo: video,
    });
    dispatch({ type: RecordingActionType.RECORDING, payload: false });
  }

  function setMinVideoLength(length: number) {
    if (!curAnswerState || state.isUploading || state.isSaving) {
      return;
    }
    setCurAnswerState({
      ...curAnswerState,
      minVideoLength: length,
    });
  }

  function editAnswer(edits: Partial<Answer>) {
    if (!curAnswerState || state.isUploading || state.isSaving) {
      return;
    }
    setCurAnswerState({
      ...curAnswerState,
      answer: { ...curAnswerState.answer, ...edits },
    });
  }

  function saveAnswer() {
    if (!mentor || !curAnswerState || state.isUploading || state.isSaving) {
      return;
    }
    const answer = answers[answerIdx];
    const editedAnswer = curAnswerState.answer;
    // update the question if it has changed
    if (!equals(answer.question, editedAnswer.question)) {
      dispatch({ type: RecordingActionType.SAVING, payload: true });
      updateQuestion(editedAnswer.question, accessToken)
        .then((didUpdate) => {
          if (!didUpdate) {
            dispatch({ type: RecordingActionType.SAVING, payload: false });
            return;
          }
          if (!equals(answer, editedAnswer)) {
            updateAnswer(mentor._id, editedAnswer, accessToken)
              .then((didUpdate) => {
                if (!didUpdate) {
                  dispatch({
                    type: RecordingActionType.SAVING,
                    payload: false,
                  });
                  return;
                }
                setAnswers(copyAndSet(answers, answerIdx, editedAnswer));
                dispatch({ type: RecordingActionType.SAVING, payload: false });
              })
              .catch((err) => {
                console.error(err);
                dispatch({ type: RecordingActionType.SAVING, payload: false });
              });
          } else {
            setAnswers(copyAndSet(answers, answerIdx, editedAnswer));
            dispatch({ type: RecordingActionType.SAVING, payload: false });
          }
        })
        .catch((err) => {
          console.error(err);
          dispatch({ type: RecordingActionType.SAVING, payload: false });
        });
    }
    // update the answer if it has changed
    else if (!equals(answer, editedAnswer)) {
      dispatch({ type: RecordingActionType.SAVING, payload: true });
      updateAnswer(mentor._id, editedAnswer, accessToken)
        .then((didUpdate) => {
          if (!didUpdate) {
            dispatch({ type: RecordingActionType.SAVING, payload: false });
            return;
          }
          setAnswers(copyAndSet(answers, answerIdx, editedAnswer));
          dispatch({ type: RecordingActionType.SAVING, payload: false });
        })
        .catch((err) => {
          console.error(err);
          dispatch({ type: RecordingActionType.SAVING, payload: false });
        });
    }
  }

  function uploadVideo(trim?: { start: number; end: number }) {
    if (
      !mentor ||
      !curAnswerState ||
      !curAnswerState.answer.question ||
      !curAnswerState.recordedVideo ||
      state.isUploading ||
      state.isSaving
    ) {
      return;
    }
    startUploading({
      mentorId: mentor._id,
      questionId: curAnswerState.answer.question._id,
      video: curAnswerState.recordedVideo,
      trim,
    });
  }

  function getVideoSrc() {
    if (!curAnswerState || !mentor) {
      return undefined;
    }
    if (curAnswerState.recordedVideo) {
      return URL.createObjectURL(curAnswerState.recordedVideo);
    }
    if (curAnswerState.answer.recordedAt) {
      return `${UPLOAD_ENTRYPOINT}/mentors/${mentor._id}/${curAnswerState.answer.question._id}.mp4`;
    }
    return undefined;
  }

  function isAnswerValid() {
    if (!curAnswerState || !mentor) {
      return false;
    }
    if (mentor.mentorType === MentorType.CHAT) {
      return Boolean(curAnswerState.answer.transcript);
    }
    if (mentor.mentorType === MentorType.VIDEO) {
      return Boolean(
        // curAnswerState.answer.recordedAt &&
        curAnswerState.answer.question?.name === UtteranceName.IDLE ||
          curAnswerState.answer.transcript
      );
    }
    return false;
  }

  return {
    answers,
    answerIdx,
    recordState: state,
    curAnswer:
      mentor && curAnswerState
        ? {
            answer: curAnswerState.answer,
            isEdited: !equals(answers[answerIdx], curAnswerState.answer),
            isValid: isAnswerValid(),
            videoSrc: getVideoSrc(),
            recordedVideo: curAnswerState.recordedVideo,
            minVideoLength: curAnswerState.minVideoLength,
          }
        : undefined,

    prevAnswer,
    nextAnswer,
    editAnswer,
    saveAnswer,
    rerecord,
    startRecording,
    stopRecording,
    uploadVideo,
    setMinVideoLength,
  };
}
