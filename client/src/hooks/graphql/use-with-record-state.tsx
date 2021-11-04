/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect, useState } from "react";
import {
  fetchVideoBlobFromServer,
  fetchVideoBlobFromUrl,
  updateAnswer,
} from "api";
import {
  Answer,
  AnswerAttentionNeeded,
  MediaTag,
  MediaType,
  MentorType,
  Question,
  Subject,
  UploadTask,
  UtteranceName,
} from "types";
import { copyAndSet, equals, getValueIfKeyExists } from "helpers";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import useQuestions, {
  isQuestionsLoading,
  isQuestionsSaving,
  useQuestionActions,
} from "store/slices/questions/useQuestions";
import { LoadingError } from "./loading-reducer";
import { useWithUploadStatus } from "./use-with-upload-status";
import { QuestionState } from "store/slices/questions";
import { navigate } from "gatsby";
import { areAllTasksDoneOrOneFailed } from "./upload-status-helpers";

export interface AnswerState {
  answer: Answer;
  editedAnswer: Answer;
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

interface RecordStateError {
  message: string;
  error: string;
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
  const [curAnswer, setCurAnswer] = useState<CurAnswerState>();
  const [isDownloadingVideo, setIsDownloadingVideo] = useState<boolean>(false);
  const [error, setError] = useState<RecordStateError>();

  const pollingInterval = parseInt(filter.poll || "");
  const {
    getData,
    loadMentor,
    clearMentorError,
    isLoading: isMentorLoading,
    error: mentorError,
  } = useActiveMentor();

  const mentorId: string = getData((state) => state.data?._id);
  const mentorType: MentorType = getData((state) => state.data?.mentorType);
  const mentorSubjects: Subject[] = getData((state) => state.data?.subjects);
  const mentorAnswers: Answer[] = getData((state) => state.data?.answers);
  const mentorQuestions = useQuestions(
    (state) => state.questions,
    mentorAnswers?.map((a) => a.question)
  );
  const questionsLoading = isQuestionsLoading(
    mentorAnswers?.map((a) => a.question)
  );
  const questionsSaving = isQuestionsSaving(
    mentorAnswers?.map((a) => a.question)
  );
  const { saveQuestion } = useQuestionActions();

  const {
    uploads,
    isUploading,
    pollStatusCount,
    upload,
    cancelUpload,
    removeCompletedTask,
  } = useWithUploadStatus(
    accessToken,
    onAnswerUploaded,
    isNaN(pollingInterval) ? undefined : pollingInterval
  );
  const idxChanged =
    curAnswer?.answer.question !== answers[answerIdx]?.answer.question;

  useEffect(() => {
    if (!mentorAnswers || !mentorSubjects || isMentorLoading) {
      return;
    }
    const { videoId, subject, category, status } = filter;
    let answers = mentorAnswers;
    if (videoId && !subject) {
      const ids = Array.isArray(videoId) ? videoId : [videoId];
      answers = answers.filter((a) => ids.includes(a.question));
    } else if (subject) {
      const s = mentorSubjects.find((a) => a._id === subject);
      if (s) {
        const sQuestions = s.questions.filter(
          (q) => !category || `${q.category?.id}` === category
        );
        answers = answers.filter((a) =>
          sQuestions.map((q) => q.question).includes(a.question)
        );
      }
    }
    const answerStates: AnswerState[] = [];
    for (const a of answers) {
      const q = getValueIfKeyExists(a.question, mentorQuestions);
      if (
        q?.question &&
        (!q.question.mentorType || q.question.mentorType === mentorType) &&
        (!status || a.status === status)
      ) {
        answerStates.push({
          answer: a,
          editedAnswer: a,
          editedQuestion: q.question,
          recordedVideo: undefined,
          minVideoLength: q.question.minVideoLength,
          attentionNeeded: doesAnswerNeedAttention(a),
        });
      }
    }
    //if after filtering through the answers we end up with none, then go back to My Mentor page
    if (!answers.length) {
      navigate("/");
    }
    setAnswers(answerStates);
  }, [mentorAnswers, mentorQuestions, filter]);

  useEffect(() => {
    const { videoId, subject } = filter;
    if (!answers.length || !subject) return;
    if (videoId) {
      const ids = Array.isArray(videoId) ? videoId : [videoId];
      const firstIdx = retrieveAnswerIdx(ids[0]);
      if (firstIdx || firstIdx == 0) setAnswerIdx(firstIdx);
    }
  }, [answers.length]);

  useEffect(() => {
    if (!curAnswer) return;
    setCurAnswer({
      ...curAnswer,
      videoSrc: getVideoSrc(curAnswer),
    });
  }, [curAnswer?.answer.media]);

  useEffect(() => {
    setIsRecording(false);
  }, [answerIdx]);

  useEffect(() => {
    if (!mentorAnswers || !answers[answerIdx]) return;
    const answer = answers[answerIdx];
    const question = getValueIfKeyExists(
      answer.answer.question,
      mentorQuestions
    )?.question;
    setCurAnswer({
      ...answer,
      isEdited:
        !equals(answer.answer, answer.editedAnswer) ||
        !equals(question, answer.editedQuestion),
      isValid: isAnswerValid(),
      isUploading: isAnswerUploading(answer.editedAnswer),
      videoSrc: idxChanged
        ? getVideoSrc(answer)
        : curAnswer?.videoSrc || getVideoSrc(answer),
    });
  }, [answers[answerIdx], questionsLoading, questionsSaving, uploads]);

  function retrieveAnswerIdx(id: string) {
    for (let i = 0; i < answers?.length; i++) {
      if (answers[i].answer.question == id) {
        return i;
      }
    }
    return 0;
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
      getValueIfKeyExists(answer.question, mentorQuestions)?.question?.name !==
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
    return Boolean(upload && !areAllTasksDoneOrOneFailed(upload));
  }

  function clearError() {
    clearMentorError();
    setError(undefined);
  }

  function getVideoSrc(answer: AnswerState) {
    if (!mentorAnswers) {
      return undefined;
    }
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
    const editedQuestion = answers[answerIdx].editedQuestion;
    if (mentorType === MentorType.CHAT) {
      return Boolean(editedAnswer.transcript);
    }
    if (mentorType === MentorType.VIDEO) {
      return Boolean(
        editedAnswer?.media?.find((m) => m.type === MediaType.VIDEO)?.url &&
          (editedQuestion?.name === UtteranceName.IDLE ||
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

  function editQuestion(edits: Partial<Question>) {
    const answer = answers[answerIdx];
    updateAnswerState({
      editedQuestion: { ...answer.editedQuestion, ...edits },
    });
  }

  function saveAnswer() {
    const answer = answers[answerIdx].answer;
    const editedAnswer = answers[answerIdx].editedAnswer;
    const question = getValueIfKeyExists(
      answer.question,
      mentorQuestions
    )?.question;
    const editedQuestion = answers[answerIdx].editedQuestion;
    if (!mentorId) {
      return;
    }
    // update the question if it has changed
    if (!equals(question, editedQuestion)) {
      saveQuestion(editedQuestion);
    }
    // update the answer if it has changed
    if (!equals(answer, editedAnswer)) {
      setIsSaving(true);
      updateAnswer(editedAnswer, accessToken, mentorId)
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
    if (!mentorId || !answer.answer.question || !answer.recordedVideo) {
      return;
    }
    upload(mentorId, answer.answer.question, answer.recordedVideo, trim);
  }

  function downloadVideoBlob(blob: Blob, filename: string, document: Document) {
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", blobUrl);
    link.setAttribute("download", `${filename}.mp4`);
    link.click();
  }

  async function downloadAnswerVideoFromServer(answer: Answer) {
    if (!mentorId) return;
    try {
      const videoBlob = await fetchVideoBlobFromServer(
        mentorId,
        answer.question
      );
      downloadVideoBlob(videoBlob, `${answer.question}_video`, document);
    } catch (error) {
      setError({
        message: "Failed to download video from server",
        error: String(error),
      });
    }
  }

  async function downloadAnswerSrcVideo(answer: AnswerState) {
    const videoSrc = getVideoSrc(answer);
    if (!videoSrc) {
      setError({
        message: "No video source file available for download",
        error: "",
      });
      return;
    }
    try {
      const videoBlob = await fetchVideoBlobFromUrl(videoSrc);
      downloadVideoBlob(videoBlob, `${answer.answer.question}_video`, document);
    } catch (error) {
      setError({
        message: `Failed to download video from url: ${videoSrc}`,
        error: String(error),
      });
    }
  }

  async function downloadVideoForQuestion(question: string) {
    if (!mentorId) return;
    setIsDownloadingVideo(true);
    const answer = answers.find((a) => a.answer.question === question);
    if (answer) {
      if (answer.recordedVideo) {
        downloadVideoBlob(
          answer.recordedVideo,
          `${answer.answer.question}_video`,
          document
        );
      } else if (isAnswerUploading(answer.answer)) {
        downloadAnswerVideoFromServer(answer.answer);
      } else {
        const videoSrc = getVideoSrc(answer);
        if (videoSrc) downloadAnswerSrcVideo(answer);
      }
    } else {
      const answer = mentorAnswers?.find((a) => a.question === question);
      if (!answer) {
        setError({
          message: "Failed to download video",
          error: "Question ID did not match any Answer",
        });
      } else {
        if (isAnswerUploading(answer)) {
          downloadAnswerVideoFromServer(answer);
        }
      }
    }
    setIsDownloadingVideo(false);
  }

  function downloadCurAnswerVideo() {
    if (!curAnswer) return;
    downloadVideoForQuestion(curAnswer?.answer.question);
  }

  function cancelUploadVideo(task: UploadTask) {
    if (!mentorId) {
      return;
    }
    cancelUpload(mentorId, task);
  }

  return {
    mentorQuestions,
    answers,
    answerIdx,
    curAnswer,
    uploads,
    pollStatusCount,
    isUploading,
    isRecording,
    isSaving: isSaving || questionsSaving,
    error: mentorError || error,
    isDownloadingVideo,
    prevAnswer,
    nextAnswer,
    setAnswerIdx,
    editQuestion,
    editAnswer,
    saveAnswer,
    removeCompletedTask,
    rerecord,
    reloadMentorData: loadMentor,
    startRecording,
    stopRecording,
    uploadVideo,
    downloadCurAnswerVideo,
    downloadVideoForQuestion,
    cancelUpload: cancelUploadVideo,
    setMinVideoLength,
    clearError,
  };
}

export interface UseWithRecordState {
  mentorQuestions: Record<string, QuestionState>;
  answers: AnswerState[];
  answerIdx: number;
  curAnswer?: CurAnswerState;
  uploads: UploadTask[];
  pollStatusCount: number;
  isUploading: boolean;
  isRecording: boolean;
  isSaving: boolean;
  error?: LoadingError;
  isDownloadingVideo: boolean;
  prevAnswer: () => void;
  reloadMentorData: () => void;
  nextAnswer: () => void;
  setAnswerIdx: (id: number) => void;
  editAnswer: (edits: Partial<Answer>) => void;
  editQuestion: (edits: Partial<Question>) => void;
  saveAnswer: () => void;
  removeCompletedTask: (tasks: UploadTask) => void;
  rerecord: () => void;
  startRecording: () => void;
  stopRecording: (video: File) => void;
  uploadVideo: (trim?: { start: number; end: number }) => void;
  downloadCurAnswerVideo: () => void;
  downloadVideoForQuestion: (question: string) => void;
  cancelUpload: (task: UploadTask) => void;
  setMinVideoLength: (length: number) => void;
  clearError: () => void;
}
