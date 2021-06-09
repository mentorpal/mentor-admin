/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect, useState } from "react";
import {
  fetchMentor,
  fetchUploadVideoStatus,
  updateAnswer,
  updateQuestion,
  uploadVideo,
} from "api";
import {
  Answer,
  JobState,
  MediaTag,
  MediaType,
  Mentor,
  MentorType,
  TaskStatus,
  UtteranceName,
  VideoInfo,
} from "types";
import { copyAndSet, equals } from "helpers";
import { useWithMentor } from "./use-with-mentor";
import { useInterval } from "hooks/task/use-interval";

export interface RecordingError {
  message: string;
  error: string;
}
export interface AnswerState {
  answer: Answer;
  editedAnswer: Answer;
  recordedVideo: File | undefined;
  minVideoLength: number | undefined;
  error: RecordingError | undefined;
  isSaving: boolean;
  uploadStatus: TaskStatus<VideoInfo> | undefined;
}
export interface CurAnswerState extends AnswerState {
  videoSrc: string | undefined;
  isValid: boolean;
  isUploading: boolean;
  isEdited: boolean;
}

export function useWithRecordState(
  accessToken: string,
  filter: {
    videoId?: string[] | string;
    subject?: string;
    status?: string;
    category?: string;
  }
): UseWithRecordState {
  const [answers, setAnswers] = useState<AnswerState[]>([]);
  const [answerIdx, setAnswerIdx] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const { data: mentor, isLoading: isMentorLoading } = useWithMentor(
    accessToken
  );

  // Get initial state for the answers that are being recorded
  useEffect(() => {
    if (!mentor) {
      return;
    }
    const { videoId, subject, category, status } = filter;
    let mentorAnswers = mentor.answers;
    if (videoId) {
      const ids = Array.isArray(videoId) ? videoId : [videoId];
      mentorAnswers = mentorAnswers.filter((a) => ids.includes(a.question._id));
    } else if (subject) {
      const s = mentor.subjects.find((a) => a._id === subject);
      if (s) {
        const sQuestions = s.questions.filter(
          (q) => !category || `${q.category?.id}` === category
        );
        mentorAnswers = mentorAnswers.filter((a) =>
          sQuestions.map((q) => q.question._id).includes(a.question._id)
        );
      }
    }
    if (status) {
      mentorAnswers = mentorAnswers.filter((a) => a.status === status);
    }
    mentorAnswers = mentorAnswers.filter(
      (a) =>
        !a.question?.mentorType || a.question?.mentorType === mentor.mentorType
    );
    const answerState: AnswerState[] = mentorAnswers.map((a) => {
      return {
        answer: a,
        editedAnswer: a,
        recordedVideo: undefined,
        minVideoLength: a.question?.minVideoLength,
        error: undefined,
        isSaving: false,
        uploadStatus: undefined,
      };
    });
    setAnswers(answerState);
  }, [mentor]);

  useEffect(() => {
    setIsRecording(false);
  }, [answerIdx]);

  useEffect(() => {
    setIsPolling(answers.some((a) => Boolean(a.editedAnswer.uploadStatusUrl)));
  }, [answers]);

  useInterval(
    (isCancelled) => {
      for (const [i, a] of answers.entries()) {
        const editedAnswer = a.editedAnswer;
        if (!editedAnswer.uploadStatusUrl || isCancelled()) {
          break;
        }
        fetchUploadVideoStatus(editedAnswer.uploadStatusUrl)
          .then((s) => {
            if (isCancelled()) {
              updateCurAnswerState(
                {
                  editedAnswer: { ...editedAnswer, uploadStatusUrl: undefined },
                  uploadStatus: s,
                },
                i
              );
            } else if (s.state === JobState.SUCCESS) {
              updateCurAnswerState(
                {
                  editedAnswer: { ...editedAnswer, uploadStatusUrl: undefined },
                  uploadStatus: s,
                },
                i
              );
              fetchMentor(accessToken).then((m) => {
                if (!isCancelled()) {
                  if (!m) {
                    updateCurAnswerState(
                      {
                        editedAnswer: {
                          ...editedAnswer,
                          uploadStatusUrl: undefined,
                        },
                        error: {
                          message: "Failed update",
                          error: "Failed to fetch changes after uploading",
                        },
                      },
                      i
                    );
                  } else {
                    const updatedAnswer = m.answers.find(
                      (a) => a._id === editedAnswer._id
                    );
                    if (updatedAnswer) {
                      updateCurAnswerState({
                        recordedVideo: undefined,
                        answer: updatedAnswer,
                        uploadStatus: s,
                        editedAnswer: {
                          ...editedAnswer,
                          uploadStatusUrl: undefined,
                          media: updatedAnswer.media,
                          transcript: updatedAnswer.transcript,
                        },
                      });
                    }
                  }
                }
              });
            } else if (s.state === JobState.FAILURE) {
              updateCurAnswerState(
                {
                  editedAnswer: { ...editedAnswer, uploadStatusUrl: undefined },
                  uploadStatus: s,
                  error: {
                    message: "Failed job",
                    error: "Job returned with fail",
                  },
                },
                i
              );
            }
          })
          .catch((err: Error) => {
            updateCurAnswerState(
              {
                editedAnswer: { ...editedAnswer, uploadStatusUrl: undefined },
                error: { message: "Upload failed", error: err.message },
              },
              i
            );
          });
      }
    },
    isPolling ? 1000 : null
  );

  function updateCurAnswerState(
    edits: Partial<AnswerState>,
    idx: number = answerIdx
  ) {
    setAnswers(
      copyAndSet(answers, idx, {
        ...answers[idx],
        ...edits,
      })
    );
  }

  function getVideoSrc(answer: AnswerState) {
    if (!answer) {
      return undefined;
    }
    if (answer.recordedVideo) {
      return URL.createObjectURL(answer.recordedVideo);
    }
    return answer.editedAnswer?.media?.find(
      (m) => m.type === MediaType.VIDEO && m.tag === MediaTag.WEB
    )?.url;
  }

  function isAnswerValid(answer: AnswerState) {
    if (!answer) {
      return false;
    }
    if (mentor?.mentorType === MentorType.CHAT) {
      return Boolean(answer.editedAnswer.transcript);
    }
    if (mentor?.mentorType === MentorType.VIDEO) {
      return Boolean(
        answer.editedAnswer.media?.find((m) => m.type === MediaType.VIDEO)
          ?.url &&
          (answer.editedAnswer.question?.name === UtteranceName.IDLE ||
            answer.editedAnswer.transcript)
      );
    }
    return false;
  }

  function prevAnswer() {
    if (!answers || answers.length === 0 || answerIdx === 0) {
      return;
    }
    setAnswerIdx(answerIdx - 1);
  }

  function nextAnswer() {
    if (!answers || answerIdx >= answers.length) {
      return;
    }
    setAnswerIdx(answerIdx + 1);
  }

  function startRecording() {
    if (!answers || answers.length === 0) {
      return;
    }
    const curAnswerState = answers[answerIdx];
    if (
      curAnswerState.editedAnswer.uploadStatusUrl ||
      curAnswerState.isSaving
    ) {
      return;
    }
    setIsRecording(true);
  }

  function stopRecording(video: File) {
    if (!answers || answers.length === 0) {
      return;
    }
    const curAnswerState = answers[answerIdx];
    if (
      curAnswerState.editedAnswer.uploadStatusUrl ||
      curAnswerState.isSaving
    ) {
      return;
    }
    updateCurAnswerState({ recordedVideo: video });
    setIsRecording(false);
  }

  function rerecord() {
    if (!answers || answers.length === 0) {
      return;
    }
    const curAnswerState = answers[answerIdx];
    if (
      curAnswerState.editedAnswer.uploadStatusUrl ||
      curAnswerState.isSaving
    ) {
      return;
    }
    updateCurAnswerState({
      recordedVideo: undefined,
      editedAnswer: { ...curAnswerState.editedAnswer, media: undefined },
    });
  }

  function setMinVideoLength(length: number) {
    if (!answers || answers.length === 0) {
      return;
    }
    const curAnswerState = answers[answerIdx];
    if (
      curAnswerState.editedAnswer.uploadStatusUrl ||
      curAnswerState.isSaving
    ) {
      return;
    }
    updateCurAnswerState({ minVideoLength: length });
  }

  function editAnswer(edits: Partial<Answer>) {
    if (!answers || answers.length === 0) {
      return;
    }
    const curAnswerState = answers[answerIdx];
    if (
      curAnswerState.editedAnswer.uploadStatusUrl ||
      curAnswerState.isSaving
    ) {
      return;
    }
    updateCurAnswerState({
      editedAnswer: { ...curAnswerState.editedAnswer, ...edits },
    });
  }

  function saveAnswer() {
    if (!answers || answers.length === 0) {
      return;
    }
    const curAnswerState = answers[answerIdx];
    if (
      curAnswerState.editedAnswer.uploadStatusUrl ||
      curAnswerState.isSaving
    ) {
      return;
    }
    const answer = curAnswerState.answer;
    const editedAnswer = curAnswerState.editedAnswer;
    // update the question if it has changed
    if (!equals(answer.question, editedAnswer.question)) {
      updateCurAnswerState({ isSaving: true });
      updateQuestion(editedAnswer.question, accessToken)
        .then((didUpdate) => {
          if (!didUpdate) {
            updateCurAnswerState({ isSaving: false });
            return;
          }
          if (!equals(answer, editedAnswer)) {
            updateAnswer(editedAnswer, accessToken)
              .then((didUpdate) => {
                if (!didUpdate) {
                  updateCurAnswerState({ isSaving: false });
                  return;
                }
                updateCurAnswerState({ isSaving: false, answer: editedAnswer });
              })
              .catch((err) => {
                updateCurAnswerState({
                  isSaving: false,
                  error: {
                    message: "Failed to save answer",
                    error: err.message,
                  },
                });
              });
          } else {
            updateCurAnswerState({ isSaving: false, answer: editedAnswer });
          }
        })
        .catch((err) => {
          updateCurAnswerState({
            isSaving: false,
            error: { message: "Failed to save question", error: err.message },
          });
        });
    }
    // update the answer if it has changed
    else if (!equals(answer, editedAnswer)) {
      updateCurAnswerState({ isSaving: true });
      updateAnswer(editedAnswer, accessToken)
        .then((didUpdate) => {
          if (!didUpdate) {
            updateCurAnswerState({ isSaving: false });
            return;
          }
          updateCurAnswerState({ isSaving: false, answer: editedAnswer });
        })
        .catch((err) => {
          updateCurAnswerState({
            isSaving: false,
            error: { message: "Failed to save answer", error: err.message },
          });
        });
    }
  }

  function uploadOrTrimVideo(trim?: { start: number; end: number }) {
    if (!answers || answers.length === 0 || !mentor?._id) {
      return;
    }
    const curAnswerState = answers[answerIdx];
    const editedAnswer = curAnswerState.editedAnswer;
    if (
      editedAnswer.uploadStatusUrl ||
      curAnswerState.isSaving ||
      !editedAnswer.question ||
      !curAnswerState.recordedVideo
    ) {
      return;
    }
    uploadVideo(
      mentor?._id,
      editedAnswer.question._id,
      curAnswerState.recordedVideo,
      trim
    ).then((job) => {
      updateCurAnswerState({
        editedAnswer: { ...editedAnswer, uploadStatusUrl: job.statusUrl },
      });
    });
  }

  return {
    mentor,
    answers: answers.map((a) => {
      return {
        ...a,
        videoSrc: getVideoSrc(a),
        isValid: isAnswerValid(a),
        isUploading: Boolean(a.editedAnswer.uploadStatusUrl),
        isEdited: !equals(a.answer, a.editedAnswer),
      };
    }),
    answerIdx,
    curAnswer:
      answers && answers.length > 0
        ? {
            ...answers[answerIdx],
            videoSrc: getVideoSrc(answers[answerIdx]),
            isValid: isAnswerValid(answers[answerIdx]),
            isUploading: Boolean(
              answers[answerIdx].editedAnswer.uploadStatusUrl
            ),
            isEdited: !equals(
              answers[answerIdx].answer,
              answers[answerIdx].editedAnswer
            ),
          }
        : undefined,
    isLoading: isMentorLoading,
    isRecording,
    prevAnswer,
    nextAnswer,
    editAnswer,
    saveAnswer,
    rerecord,
    startRecording,
    stopRecording,
    uploadVideo: uploadOrTrimVideo,
    setMinVideoLength,
  };
}

interface UseWithRecordState {
  mentor: Mentor | undefined;
  answers: CurAnswerState[];
  curAnswer: CurAnswerState | undefined;
  answerIdx: number;
  isLoading: boolean;
  isRecording: boolean;
  prevAnswer: () => void;
  nextAnswer: () => void;
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
}
