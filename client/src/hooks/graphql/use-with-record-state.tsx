/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect, useState } from "react";
import { updateAnswer, updateQuestion } from "api";
import {
  Answer,
  AnswerAttentionNeeded,
  MediaTag,
  MediaType,
  MentorType,
  UtteranceName,
} from "types";
import { copyAndSet, equals } from "helpers";
import { LoadingError } from "./loading-reducer";
import { UploadTask, useWithUploadStatus } from "./use-with-upload-status";
import { navigate } from "gatsby";
import {
  useActiveMentor,
  useActiveMentorActions,
} from "store/slices/mentor/useActiveMentor";

export interface AnswerState {
  answer: Answer;
  editedAnswer: Answer;
  attentionNeeded: AnswerAttentionNeeded;
  recordedVideo?: File;
  minVideoLength?: number;
}

export interface CurAnswerState extends AnswerState {
  isEdited: boolean;
  isValid: boolean;
  isUploading: boolean;
  videoSrc?: string;
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
  const [saveError, setSaveError] = useState<LoadingError>();
  const [curAnswer, setCurAnswer] = useState<CurAnswerState>();
  const pollingInterval = parseInt(filter.poll || "");
  const mentorId = useActiveMentor((state) => state.data?._id);
  const mentorType = useActiveMentor((state) => state.data?.mentorType);
  const mentorAnswers = useActiveMentor((state) => state.data?.answers);
  const mentorSubjects = useActiveMentor((state) => state.data?.subjects);
  const mentorError = useActiveMentor((state) => state.error);
  const { loadMentor, clearMentorError } = useActiveMentorActions();
  const {
    uploads,
    isUploading,
    pollStatusCount,
    upload,
    cancelUpload,
    removeCompletedTask,
    isTaskDoneOrFailed,
  } = useWithUploadStatus(
    accessToken,
    onAnswerUploaded,
    isNaN(pollingInterval) ? undefined : pollingInterval
  );
  const idxChanged =
    curAnswer?.answer.question._id !== answers[answerIdx]?.answer.question._id;

  useEffect(() => {
    if (!mentorAnswers || !mentorSubjects) {
      return;
    }
    const { videoId, subject, category, status } = filter;
    let answers = mentorAnswers;
    if (videoId) {
      const ids = Array.isArray(videoId) ? videoId : [videoId];
      answers = answers.filter((a) => ids.includes(a.question._id));
    } else if (subject) {
      const s = mentorSubjects.find((a) => a._id === subject);
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
      (a) => !a.question?.mentorType || a.question?.mentorType === mentorType
    );
    //if after filtering through the answers we end up with none, then go back to My Mentor page
    if (!answers.length) {
      navigate("/");
    }
    setAnswers(
      answers.map((a) => ({
        answer: a,
        editedAnswer: a,
        recordedVideo: undefined,
        minVideoLength: a.question?.minVideoLength,
        attentionNeeded: doesAnswerNeedAttention(a),
      }))
    );
  }, [mentorAnswers]);

  useEffect(() => {
    setIsRecording(false);
  }, [answerIdx]);

  useEffect(() => {
    if (!mentorAnswers || !answers[answerIdx]) return;
    setCurAnswer({
      ...answers[answerIdx],
      isEdited: !equals(
        answers[answerIdx].answer,
        answers[answerIdx].editedAnswer
      ),
      isValid: isAnswerValid(),
      isUploading: isAnswerUploading(answers[answerIdx].editedAnswer),
      videoSrc: idxChanged
        ? getVideoSrc()
        : curAnswer?.videoSrc || getVideoSrc(),
    });
  }, [answers[answerIdx], uploads]);

  function updateAnswerState(
    edits: Partial<AnswerState>,
    idx: number = answerIdx
  ) {
    const updatedAnswer = { ...answers[idx], ...edits };
    setAnswers(
      copyAndSet(answers, idx, {
        ...updatedAnswer,
        attentionNeeded: doesAnswerNeedAttention(updatedAnswer.editedAnswer),
      })
    );
  }

  function doesAnswerNeedAttention(answer: Answer): AnswerAttentionNeeded {
    if (
      answer.media?.length &&
      !answer.transcript &&
      answer.question.name !== UtteranceName.IDLE
    ) {
      return AnswerAttentionNeeded.NEEDS_TRANSCRIPT;
    }
    return AnswerAttentionNeeded.NONE;
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
    clearMentorError();
    setSaveError(undefined);
  }

  function getVideoSrc() {
    if (!mentorAnswers) {
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
    if (!mentorAnswers) {
      return false;
    }
    const editedAnswer = answers[answerIdx].editedAnswer;
    if (mentorType === MentorType.CHAT) {
      return Boolean(editedAnswer.transcript);
    }
    if (mentorType === MentorType.VIDEO) {
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

  function rerecord() {
    const answer = answers[answerIdx];
    if (!curAnswer) return;
    setCurAnswer({
      ...curAnswer,
      videoSrc: "",
    });
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
                setSaveError({
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
          setSaveError({
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
          setSaveError({
            message: "Failed to save answer",
            error: err.message,
          });
        });
    }
  }

  function uploadVideo(trim?: { start: number; end: number }) {
    const answer = answers[answerIdx];
    if (!mentorId || !answer.answer.question || !answer.recordedVideo) {
      return;
    }
    upload(mentorId, answer.answer.question, answer.recordedVideo, trim);
  }

  function cancelUploadVideo(task: UploadTask) {
    if (!mentorId || isTaskDoneOrFailed(task)) {
      return;
    }
    cancelUpload(mentorId, task);
  }

  return {
    answers,
    answerIdx,
    curAnswer,
    uploads,
    pollStatusCount,
    reloadMentorData: loadMentor,
    prevAnswer,
    nextAnswer,
    setAnswerIdx,
    editAnswer,
    saveAnswer,
    removeCompletedTask,
    rerecord,
    startRecording,
    stopRecording,
    uploadVideo,
    cancelUpload: cancelUploadVideo,
    setMinVideoLength,
    isUploading,
    isRecording,
    isSaving,
    error: mentorError || saveError,
    clearError,
  };
}

export interface UseWithRecordState {
  answers: AnswerState[];
  answerIdx: number;
  curAnswer?: CurAnswerState;
  uploads: UploadTask[];
  pollStatusCount: number;
  reloadMentorData: () => void;
  prevAnswer: () => void;
  nextAnswer: () => void;
  setAnswerIdx: (id: number) => void;
  editAnswer: (edits: Partial<Answer>) => void;
  saveAnswer: () => void;
  removeCompletedTask: (tasks: UploadTask) => void;
  rerecord: () => void;
  startRecording: () => void;
  stopRecording: (video: File) => void;
  uploadVideo: (trim?: { start: number; end: number }) => void;
  cancelUpload: (task: UploadTask) => void;
  setMinVideoLength: (length: number) => void;
  isUploading: boolean;
  isRecording: boolean;
  isSaving: boolean;
  error?: LoadingError;
  clearError: () => void;
}
