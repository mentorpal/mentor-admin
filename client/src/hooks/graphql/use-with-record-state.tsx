/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect, useState } from "react";
import { updateAnswer, updateQuestion, fetchFollowUpQuestions } from "api";
import {
  Answer,
  AnswerAttentionNeeded,
  MediaTag,
  MediaType,
  Mentor,
  MentorType,
  UtteranceName,
} from "types";
import { copyAndSet, equals } from "helpers";

import { RecordPageState } from "types";
import { LoadingError } from "./loading-reducer";
import { UploadTask, useWithUploadStatus } from "./use-with-upload-status";
import { useWithMentor } from "store/slices/mentor/useWithMentor";

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
  const [recordPageState, setRecordPageState] = useState<RecordPageState>(
    RecordPageState.INITIALIZING
  );
  const [saveError, setSaveError] = useState<LoadingError>();
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [curAnswer, setCurAnswer] = useState<CurAnswerState>();
  const pollingInterval = parseInt(filter.poll || "");
  const { mentor, mentorError, isMentorLoading, loadMentor, clearMentorError } =
    useWithMentor();
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
        attentionNeeded: doesAnswerNeedAttention(a),
      }))
    );
    setRecordPageState(RecordPageState.RECORDING_ANSWERS);
  }, [mentor]);

  useEffect(() => {
    setIsRecording(false);
  }, [answerIdx]);

  useEffect(() => {
    if (!mentor) return;
    if (
      recordPageState === RecordPageState.RELOADING_MENTOR &&
      !isMentorLoading
    ) {
      setRecordPageState(RecordPageState.RECORDING_ANSWERS);
      if (answerIdx < answers.length) {
        nextAnswer();
      }
    }
  }, [isMentorLoading]);

  useEffect(() => {
    if (!mentor || !answers[answerIdx]) return;
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

  function fetchFollowUpQs() {
    if (!mentor) return;
    if (!filter.category || filter.status === "COMPLETE") {
      setFollowUpQuestions([]);
      setRecordPageState(RecordPageState.REVIEWING_FOLLOW_UPS);
      return;
    }
    setRecordPageState(RecordPageState.FETCHING_FOLLOW_UPS);
    fetchFollowUpQuestions(filter.category, accessToken).then((data) => {
      setFollowUpQuestions(
        (data || [])
          .map((d) => {
            return d.question;
          })
          .filter(
            (followUp) =>
              mentor.answers.findIndex(
                (a) => a.question.question === followUp
              ) === -1
          )
      );
      setRecordPageState(RecordPageState.REVIEWING_FOLLOW_UPS);
    });
  }

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

  function reloadMentorData() {
    setRecordPageState(RecordPageState.RELOADING_MENTOR);
    loadMentor();
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
    if (!mentor || !answer.answer.question || !answer.recordedVideo) {
      return;
    }
    upload(mentor._id, answer.answer.question, answer.recordedVideo, trim);
  }

  function cancelUploadVideo(task: UploadTask) {
    if (!mentor || isTaskDoneOrFailed(task)) {
      return;
    }
    cancelUpload(mentor._id, task);
  }

  return {
    mentor,
    answers,
    answerIdx,
    recordPageState,
    curAnswer,
    uploads,
    pollStatusCount,
    followUpQuestions,
    prevAnswer,
    nextAnswer,
    setAnswerIdx,
    setRecordPageState,
    editAnswer,
    saveAnswer,
    removeCompletedTask,
    fetchFollowUpQs,
    rerecord,
    reloadMentorData,
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
  mentor?: Mentor;
  answers: AnswerState[];
  answerIdx: number;
  recordPageState: RecordPageState;
  curAnswer?: CurAnswerState;
  uploads: UploadTask[];
  pollStatusCount: number;
  followUpQuestions: string[];
  fetchFollowUpQs: () => void;
  prevAnswer: () => void;
  reloadMentorData: () => void;
  nextAnswer: () => void;
  setRecordPageState: (newState: RecordPageState) => void;
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
