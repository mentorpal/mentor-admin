/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect, useState } from "react";
import {
  fetchVideoBlobFromUrl,
  regenerateVTTForQuestion,
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
  const [notifyDialogOpen, setNotifyDialogOpen] = useState<boolean>(false);
  const [error, setError] = useState<RecordStateError>();

  const pollingInterval = parseInt(filter.poll || "");
  const {
    getData,
    loadMentor,
    clearMentorError,
    isLoading: isMentorLoading,
    error: mentorError,
  } = useActiveMentor();

  const mentorId = getData((state) => state.data?._id);
  const mentorType = getData((state) => state.data?.mentorType);
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
    removeCompletedOrFailedTask,
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
      answers = answers.filter(
        (a) => ids.includes(a.question) || ids.includes(a.questionClientId)
      );
    } else if (subject) {
      const s = mentorSubjects.find((ms) => ms._id === subject);
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
    if (videoId && subject) {
      const ids = Array.isArray(videoId) ? videoId : [videoId];
      const idx = retrieveAnswerIdx(answerStates, ids[0]);
      setAnswerIdx(idx);
    }
  }, [mentorAnswers, mentorQuestions, filter]);

  useEffect(() => {
    if (!curAnswer) return;
    setCurAnswer({
      ...curAnswer,
      videoSrc: getUniqueCurAnswerUrl(),
    });
  }, [curAnswer?.answer.media]);

  function getUniqueCurAnswerUrl() {
    if (!curAnswer) return;
    return `${getVideoSrc(curAnswer)}?v=${Math.random()}`;
  }

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

  function retrieveAnswerIdx(answerstates: AnswerState[], id: string) {
    for (let i = 0; i < answerstates?.length; i++) {
      if (
        answerstates[i].answer.question == id ||
        answerstates[i].answer.questionClientId == id
      ) {
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
      const newTranscript =
        upload.transcript || upload.transcript === ""
          ? upload.transcript
          : answer.editedAnswer.transcript;
      updateAnswerState(
        {
          recordedVideo: undefined,
          answer: {
            ...answer.answer,
            transcript: newTranscript,
            media: upload.media || [],
          },
          editedAnswer: {
            ...answer.editedAnswer,
            transcript: newTranscript,
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
          setIsSaving(false);
          updateAnswerState({ answer: editedAnswer });
          if (editedAnswer.hasEditedTranscript) {
            regenerateVTTForQuestion(
              editedAnswer.question,
              mentorId,
              accessToken
            );
          }
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

  async function uploadVideo(trim?: { start: number; end: number }) {
    const answer = answers[answerIdx];
    if (!mentorId || !answer.answer.question) {
      return;
    }
    if (
      trim &&
      (answer.editedAnswer.hasEditedTranscript ||
        answer.answer.hasEditedTranscript)
    ) {
      setNotifyDialogOpen(true);
      if (answer.editedAnswer.hasEditedTranscript) {
        try {
          await updateAnswer(answer.editedAnswer, accessToken, mentorId);
          updateAnswerState({ answer: answer.editedAnswer });
        } catch (err) {
          setError({
            message: "Failed to update answer with edited transcript",
            error: String(err),
          });
        }
      }
    }
    if (!answer.recordedVideo) {
      const url = answer.answer.media?.find(
        (u) => u.url.length > 15 && u.url.slice(-7) == "web.mp4"
      )?.url;
      if (url) {
        fetchVideoBlobFromUrl(url)
          .then((videoBlob) => {
            const videoFile = new File([videoBlob], "web.mp4", {
              type: "video/mp4",
            });
            upload(
              mentorId,
              answer.answer.question,
              videoFile,
              trim,
              answer.editedAnswer.hasEditedTranscript ||
                answer.answer.hasEditedTranscript
            );
          })
          .catch((error) => {
            setError({
              message: `Failed to fetch video blob from url: ${url}`,
              error: String(error),
            });
          });
      } else {
        setError({ message: "Failed to find url for answer media", error: "" });
      }
    } else {
      upload(mentorId, answer.answer.question, answer.recordedVideo, trim);
    }
  }

  function downloadVideoBlob(
    blob: Blob,
    filename: string,
    document: Document
  ): boolean {
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", blobUrl);
    link.setAttribute("download", `${filename}.mp4`);
    link.click();
    return true;
  }

  function downloadVideoFromAnswer(answer: AnswerState): boolean {
    const videoSrc = getVideoSrc(answer);
    if (!videoSrc) {
      setError({
        message: "No video source file available for download",
        error: "",
      });
      return false;
    }
    fetchVideoBlobFromUrl(videoSrc)
      .then((videoBlob) => {
        return downloadVideoBlob(
          videoBlob,
          `${answer.answer.question}_video`,
          document
        );
      })
      .catch((error) => {
        setError({
          message: `Failed to download video from url: ${videoSrc}`,
          error: String(error),
        });
      });
    return false;
  }

  function downloadVideoFromUpload(upload: UploadTask): boolean {
    const url = upload.media?.find(
      (u) => u.url.length > 15 && u.url.slice(-12) == "original.mp4"
    )?.url;
    if (url) {
      fetchVideoBlobFromUrl(url)
        .then((videoBlob) => {
          downloadVideoBlob(
            videoBlob,
            `${upload.question}_video.mp4`,
            document
          );
          return true;
        })
        .catch((error) => {
          setError({
            message: "Failed to fetch video blob from url",
            error: String(error),
          });
        });
    }
    return false;
  }

  function downloadVideoForQuestion(question: string) {
    if (!mentorId) return;
    setIsDownloadingVideo(true);
    let downloaded = false;
    const answer = answers.find((a) => a.answer.question === question);
    if (answer) {
      if (answer.recordedVideo) {
        downloaded = downloadVideoBlob(
          answer.recordedVideo,
          `${answer.answer.question}_video`,
          document
        );
      } else if (isAnswerUploading(answer.answer)) {
        const upload = uploads.find((u) => u.question === question);
        if (upload) {
          downloaded = downloadVideoFromUpload(upload);
        }
      } else {
        const videoSrc = getVideoSrc(answer);
        if (videoSrc) {
          downloaded = downloadVideoFromAnswer(answer);
        }
      }
    }
    if (!downloaded) {
      const answer = mentorAnswers?.find((a) => a.question === question);
      if (!answer) {
        setError({
          message: "Failed to download video",
          error: "Question ID did not match any Answer",
        });
      } else {
        if (isAnswerUploading(answer)) {
          const upload = uploads.find((u) => u.question === question);
          if (upload) {
            downloadVideoFromUpload(upload);
          }
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
    mentorSubjects,
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
    notifyDialogOpen,
    setNotifyDialogOpen,
    prevAnswer,
    nextAnswer,
    setAnswerIdx,
    editQuestion,
    editAnswer,
    saveAnswer,
    removeCompletedOrFailedTask,
    rerecord,
    reloadMentorData: loadMentor,
    startRecording,
    stopRecording,
    uploadVideo,
    downloadCurAnswerVideo,
    downloadVideoFromUpload,
    cancelUpload: cancelUploadVideo,
    setMinVideoLength,
    clearError,
  };
}

export interface UseWithRecordState {
  mentorQuestions: Record<string, QuestionState>;
  mentorSubjects: Subject[];
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
  notifyDialogOpen: boolean;
  setNotifyDialogOpen: (open: boolean) => void;
  prevAnswer: () => void;
  reloadMentorData: () => void;
  nextAnswer: () => void;
  setAnswerIdx: (id: number) => void;
  editAnswer: (edits: Partial<Answer>) => void;
  editQuestion: (edits: Partial<Question>) => void;
  saveAnswer: () => void;
  removeCompletedOrFailedTask: (tasks: UploadTask) => void;
  rerecord: () => void;
  startRecording: () => void;
  stopRecording: (video: File) => void;
  uploadVideo: (trim?: { start: number; end: number }) => void;
  downloadCurAnswerVideo: () => void;
  downloadVideoFromUpload: (upload: UploadTask) => void;
  cancelUpload: (task: UploadTask) => void;
  setMinVideoLength: (length: number) => void;
  clearError: () => void;
}
