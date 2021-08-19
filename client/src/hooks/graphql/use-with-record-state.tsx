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
  MentorType,
  Question,
  RecordPageState,
  UploadTask,
  UtteranceName,
} from "types";
import { copyAndSet, equals, getValueIfKeyExists } from "helpers";

import { LoadingError } from "./loading-reducer";
import {
  isActiveMentorLoading,
  isActiveMentorSaving,
  useActiveMentor,
  useActiveMentorActions,
} from "store/slices/mentor/useActiveMentor";
import { useWithUploadStatus } from "./use-with-upload-status";
import { useAppSelector } from "store/hooks";
import useSubjects from "store/slices/subjects/useSubjects";
import useQuestions, {
  useQuestionActions,
} from "store/slices/questions/useQuestions";

export interface AnswerState {
  answer: Answer;
  editedAnswer: Answer;
  question: Question;
  editedQuestion: Question;
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

export function useWithRecordState(filter: {
  videoId?: string[] | string;
  subject?: string;
  status?: string;
  category?: string;
  poll?: string;
}): UseWithRecordState {
  const accessToken = useAppSelector((state) => state.login.accessToken);

  const [answers, setAnswers] = useState<AnswerState[]>([]);
  const [answerIdx, setAnswerIdx] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordPageState, setRecordPageState] = useState<RecordPageState>(
    RecordPageState.INITIALIZING
  );
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [curAnswer, setCurAnswer] = useState<CurAnswerState>();
  const pollingInterval = parseInt(filter.poll || "");
  const mentorId = useActiveMentor((state) => state.data?._id);
  const mentorType = useActiveMentor((state) => state.data?.mentorType);
  const mentorAnswers = useActiveMentor((state) => state.data?.answers);
  const mentorSubjects = useActiveMentor((state) => state.data?.subjects);
  const mentorError = useActiveMentor((state) => state.error);
  const mentorIsSaving = isActiveMentorSaving();
  const mentorIsLoading = isActiveMentorLoading();
  const subjects = useSubjects((s) => s.subjects, mentorSubjects);
  const questions = useQuestions(
    (s) => s.questions,
    mentorAnswers?.map((a) => a.question)
  );
  const { loadMentor, clearMentorError } = useActiveMentorActions();
  const { saveQuestion, clearQuestionErrors } = useQuestionActions();
  const {
    uploads,
    isUploading,
    pollStatusCount,
    upload,
    cancelUpload,
    removeCompletedTask,
    isTaskDoneOrFailed,
  } = useWithUploadStatus(
    onAnswerUploaded,
    isNaN(pollingInterval) ? undefined : pollingInterval
  );
  const idxChanged =
    curAnswer?.answer.question !== answers[answerIdx]?.answer.question;

  useEffect(() => {
    if (!mentorAnswers || !mentorSubjects) {
      return;
    }
    const { videoId, subject, category, status } = filter;
    let answers = mentorAnswers;
    if (videoId) {
      const ids = Array.isArray(videoId) ? videoId : [videoId];
      answers = answers.filter((a) => ids.includes(a.question));
    } else if (subject) {
      const sId = mentorSubjects.find((s) => s === subject);
      const s = getValueIfKeyExists(sId || "", subjects);
      if (s) {
        const sQuestions = s.questions.filter(
          (q) => !category || `${q.category}` === category
        );
        answers = answers.filter((a) =>
          sQuestions.map((q) => q.question).includes(a.question)
        );
      }
    }
    if (status) {
      answers = answers.filter((a) => a.status === status);
    }
    answers = answers.filter((a) => {
      const question = getValueIfKeyExists(a.question, questions);
      return !question?.mentorType || question.mentorType === mentorType;
    });
    setAnswers(
      answers.map((a) => ({
        answer: a,
        editedAnswer: a,
        recordedVideo: undefined,
        minVideoLength: getValueIfKeyExists(a.question, questions)
          ?.minVideoLength,
        attentionNeeded: doesAnswerNeedAttention(a),
      }))
    );
    setRecordPageState(RecordPageState.RECORDING_ANSWERS);
  }, [mentorAnswers]);

  useEffect(() => {
    setIsRecording(false);
  }, [answerIdx]);

  useEffect(() => {
    if (!mentorAnswers) return;
    if (
      recordPageState === RecordPageState.RELOADING_MENTOR &&
      !mentorIsLoading
    ) {
      setRecordPageState(RecordPageState.RECORDING_ANSWERS);
      if (answerIdx < answers.length) {
        nextAnswer();
      }
    }
  }, [mentorIsLoading]);

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

  function fetchFollowUpQs() {
    if (!mentorAnswers || !accessToken) return;
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
              mentorAnswers.findIndex(
                (a) =>
                  getValueIfKeyExists(a.question, questions)?.question ===
                  followUp
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
      getValueIfKeyExists(answer.question, questions)?.name !==
        UtteranceName.IDLE
    ) {
      return AnswerAttentionNeeded.NEEDS_TRANSCRIPT;
    }
    return AnswerAttentionNeeded.NONE;
  }

  function onAnswerUploaded(upload: UploadTask) {
    const idx = answers.findIndex((a) => a.answer.question === upload.question);
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
    const upload = uploads.find((u) => u.question === answer.question);
    return Boolean(upload && !isTaskDoneOrFailed(upload));
  }

  function clearError() {
    clearMentorError();
    clearQuestionsError();
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
          (getValueIfKeyExists(editedAnswer.question, questions)?.name ===
            UtteranceName.IDLE ||
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

  function editQuestion(edits: Partial<Question>) {
    // const question = questions[]
  }

  function saveAnswer() {
    if (!accessToken) {
      return;
    }
    const answer = answers[answerIdx].answer;
    const editedAnswer = answers[answerIdx].editedAnswer;
    const question = getValueIfKeyExists(answer.question, questions);
    const editedQuestion = getValueIfKeyExists(
      editedAnswer.question,
      questions
    );
    if (
      editedQuestion?.question &&
      !equals(question?.question, editedQuestion?.question)
    ) {
      saveQuestion(editedQuestion.question);
    }
    if (editedAnswer && !equals(answer, editedAnswer)) {
      updateAnswer(editedAnswer, accessToken)
        .then((didUpdate) => {
          if (!didUpdate) {
            return;
          }
          updateAnswerState({ answer: editedAnswer });
        })
        .catch((err) => {
          console.error(err);
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
    isSaving: mentorIsSaving,
    error: mentorError,
    clearError,
  };
}

export interface UseWithRecordState {
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
