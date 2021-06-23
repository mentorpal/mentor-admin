/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect, useState } from "react";
import { updateAnswer, updateQuestion } from "api";
import {
  Answer,
  MediaTag,
  MediaType,
  Mentor,
  MentorType,
  UtteranceName,
} from "types";
import { copyAndSet, equals } from "helpers";
import { useWithMentor } from "./use-with-mentor";
import { UploadTask, useWithUploadStatus } from "./use-with-upload-status";
import { RecordingError } from "./recording-reducer";

export interface AnswerState {
  answer: Answer;
  editedAnswer: Answer;
  recordedVideo?: File;
  minVideoLength?: number;
}

export interface CurAnswerState extends AnswerState {
  isEdited: boolean;
  isValid: boolean;
  isUploading: boolean;
  videoSrc: string | undefined;
}

export function useWithRecordState(
  accessToken: string,
  filter: {
    videoId?: string[] | string;
    subject?: string;
    status?: string;
    category?: string;
    poll?: string;
  }
): UseWithRecordState {
  const [answers, setAnswers] = useState<AnswerState[]>([]);
  const [answerIdx, setAnswerIdx] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [error, setError] = useState<RecordingError>();
  const pollingInterval = parseInt(filter.poll || "");
  const {
    data: mentor,
    error: mentorError,
    clearError: clearMentorError,
  } = useWithMentor(accessToken);
  const {
    uploads,
    isUploading,
    upload,
    isTaskDoneOrFailed,
  } = useWithUploadStatus(
    accessToken,
    onAnswerUploaded,
    isNaN(pollingInterval) ? undefined : pollingInterval
  );

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
        !a.question?.mentorType || a.question?.mentorType === mentor.mentorType
    );
    setAnswers(
      answers.map((a) => ({
        answer: a,
        editedAnswer: a,
        recordedVideo: undefined,
        minVideoLength: a.question?.minVideoLength,
      }))
    );
  }, [mentor]);

  useEffect(() => {
    setIsRecording(false);
  }, [answerIdx]);

  useEffect(() => {
    if (mentorError) {
      setError({ message: "Failed to load", error: mentorError?.error });
      clearMentorError();
    }
  }, [mentorError]);

  function updateAnswerState(
    edits: Partial<AnswerState>,
    idx: number = answerIdx
  ) {
    setAnswers(copyAndSet(answers, idx, { ...answers[idx], ...edits }));
  }
  function onAnswerUploaded(upload: UploadTask) {
    const idx = answers.findIndex(
      (a) => a.answer.question?._id === upload.question._id
    );
    if (idx !== -1) {
      const answer = answers[idx];
      updateAnswerState(
        {
          recordedVideo: undefined,
          answer: {
            ...answer.answer,
            transcript: upload.transcript || "",
            media: upload.media || [],
          },
          editedAnswer: {
            ...answer.editedAnswer,
            transcript: upload.transcript || "",
            media: upload.media || [],
          },
        },
        idx
      );
    }
  }
  function isAnswerUploading(answer: Answer) {
    const upload = uploads.find((u) => u.question._id === answer.question._id);
    return Boolean(upload && !isTaskDoneOrFailed(upload));
  }
  function clearError() {
    setError(undefined);
  }
  function getVideoSrc() {
    if (!mentor) {
      return undefined;
    }
    const answer = answers[answerIdx];
    if (answer.recordedVideo) {
      return URL.createObjectURL(answer.recordedVideo);
    }
    return answer.editedAnswer?.media?.find(
      (m) => m.type === MediaType.VIDEO && m.tag === MediaTag.WEB
    )?.url;
  }
  function isAnswerValid() {
    if (!mentor) {
      return false;
    }
    const editedAnswer = answers[answerIdx].editedAnswer;
    if (mentor.mentorType === MentorType.CHAT) {
      return Boolean(editedAnswer.transcript);
    }
    if (mentor.mentorType === MentorType.VIDEO) {
      return Boolean(
        editedAnswer?.media?.find((m) => m.type === MediaType.VIDEO)?.url &&
          (editedAnswer.question?.name === UtteranceName.IDLE ||
            editedAnswer.transcript)
      );
    }
    return false;
  }

  function prevAnswer() {
    if (answerIdx === 0) {
      return;
    }
    setAnswerIdx(answerIdx - 1);
  }

  function nextAnswer() {
    if (answerIdx >= answers.length) {
      return;
    }
    setAnswerIdx(answerIdx + 1);
  }

  function setAnswerIDx(num: number) {
    setAnswerIdx(num);
  }

  function rerecord() {
    const answer = answers[answerIdx];
    updateAnswerState({
      recordedVideo: undefined,
      editedAnswer: { ...answer.editedAnswer, media: [] },
    });
  }

  function startRecording() {
    setIsRecording(true);
  }

  function stopRecording(video: File) {
    updateAnswerState({ recordedVideo: video });
    setIsRecording(false);
  }

  function setMinVideoLength(length: number) {
    updateAnswerState({ minVideoLength: length });
  }

  function editAnswer(edits: Partial<Answer>) {
    const answer = answers[answerIdx];
    updateAnswerState({ editedAnswer: { ...answer.editedAnswer, ...edits } });
  }

  function saveAnswer() {
    const answer = answers[answerIdx].answer;
    const editedAnswer = answers[answerIdx].editedAnswer;
    // update the question if it has changed
    if (!equals(answer.question, editedAnswer.question)) {
      setIsSaving(true);
      updateQuestion(editedAnswer.question, accessToken)
        .then((didUpdate) => {
          if (!didUpdate) {
            setIsSaving(false);
            return;
          }
          if (!equals(answer, editedAnswer)) {
            updateAnswer(editedAnswer, accessToken)
              .then((didUpdate) => {
                if (!didUpdate) {
                  setIsSaving(false);
                  return;
                }
                updateAnswerState({ answer: editedAnswer });
                setIsSaving(false);
              })
              .catch((err) => {
                setIsSaving(false);
                setError({
                  message: "Failed to save answer",
                  error: err.message,
                });
              });
          } else {
            updateAnswerState({ answer: editedAnswer });
            setIsSaving(false);
          }
        })
        .catch((err) => {
          setIsSaving(false);
          setError({
            message: "Failed to save question",
            error: err.message,
          });
        });
    }
    // update the answer if it has changed
    else if (!equals(answer, editedAnswer)) {
      setIsSaving(true);
      updateAnswer(editedAnswer, accessToken)
        .then((didUpdate) => {
          if (!didUpdate) {
            setIsSaving(false);
            return;
          }
          updateAnswerState({ answer: editedAnswer });
          setIsSaving(false);
        })
        .catch((err) => {
          setIsSaving(false);
          setError({
            message: "Failed to save answer",
            error: err.message,
          });
        });
    }
  }

  function uploadVideo(trim?: { start: number; end: number }) {
    const answer = answers[answerIdx];
    if (!mentor || !answer.answer.question || !answer.recordedVideo) {
      return;
    }
    upload(mentor._id, answer.answer.question, answer.recordedVideo, trim);
  }

  return {
    mentor,
    answers,
    answerIdx,
    curAnswer:
      answers.length >= answerIdx + 1
        ? {
            ...answers[answerIdx],
            isEdited: !equals(
              answers[answerIdx].answer,
              answers[answerIdx].editedAnswer
            ),
            isValid: isAnswerValid(),
            isUploading: isAnswerUploading(answers[answerIdx].editedAnswer),
            videoSrc: getVideoSrc(),
          }
        : undefined,
    uploads: uploads,
    prevAnswer,
    nextAnswer,
    setAnswerIDx,
    editAnswer,
    saveAnswer,
    rerecord,
    startRecording,
    stopRecording,
    uploadVideo,
    setMinVideoLength,

    isUploading,
    isRecording,
    isSaving,
    error,
    clearError,
  };
}

export interface UseWithRecordState {
  mentor: Mentor | undefined;
  answers: AnswerState[];
  answerIdx: number;
  curAnswer: CurAnswerState | undefined;
  uploads: UploadTask[];
  prevAnswer: () => void;
  nextAnswer: () => void;
  setAnswerIDx: (id: number) => void;
  editAnswer: (edits: Partial<Answer>) => void;
  saveAnswer: () => void;
  rerecord: () => void;
  startRecording: () => void;
  stopRecording: (video: File) => void;
  uploadVideo: (
    trim?:
      | {
          start: number;
          end: number;
        }
      | undefined
  ) => void;
  setMinVideoLength: (length: number) => void;

  isUploading: boolean;
  isRecording: boolean;
  isSaving: boolean;
  error: RecordingError | undefined;
  clearError: () => void;
}
