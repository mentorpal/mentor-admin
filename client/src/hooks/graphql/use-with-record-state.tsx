/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect, useState } from "react";
import {
  fetchVideoBlobFromUrl,
  fetchVttFileFromUrl,
  regenerateVTTForQuestion,
  updateAnswer,
  updateAnswerUrl,
} from "api";
import {
  Answer,
  AnswerAttentionNeeded,
  AnswerState,
  CurAnswerState,
  MediaTag,
  MediaType,
  MentorType,
  Question,
  Subject,
  UploadTask,
  UseWithRecordState,
  UtteranceName,
  RecordStateError,
  Status,
  Media,
} from "types";
import {
  copyAndSet,
  equals,
  extractErrorMessageFromError,
  getValueIfKeyExists,
  isAnswerComplete,
} from "helpers";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import useQuestions, {
  isQuestionsLoading,
  isQuestionsSaving,
  useQuestionActions,
} from "store/slices/questions/useQuestions";
import { useWithUploadStatus } from "./use-with-upload-status";
import { navigate } from "gatsby";
import { areAllTasksDoneOrOneFailed } from "./upload-status-helpers";
import { useWithConfig } from "store/slices/config/useWithConfig";
import { useAppSelector } from "store/hooks";
import { PreviousAnswerVersion } from "types-gql";

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
  const [isUpdatingUrl, setIsUpdatingUrl] = useState<boolean>(false);
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
  const { state: configState } = useWithConfig();

  const mentorId = getData((state) => state.data?._id);
  const mentorType = getData((state) => state.data?.mentorType);
  const hasVirtualBackground = getData(
    (state) => state.data?.hasVirtualBackground
  );
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
  const filesUploading = useAppSelector(
    (state) => state.uploads.uploadingFiles
  );
  const { saveQuestion } = useQuestionActions();

  const {
    uploads,
    isUploading,
    pollStatusCount,
    upload,
    removeCompletedOrFailedTask,
  } = useWithUploadStatus(
    accessToken,
    onAnswerUploaded,
    isNaN(pollingInterval) ? undefined : pollingInterval
  );
  const idxChanged =
    curAnswer?.answer.question !== answers[answerIdx]?.answer.question;

  useEffect(() => {
    if (isMentorLoading || !mentorAnswers || !mentorSubjects) {
      return;
    }
    const { videoId, subject, category, status } = filter;
    let _answers = mentorAnswers;
    if (videoId && !subject) {
      const ids = Array.isArray(videoId) ? videoId : [videoId];
      _answers = _answers.filter(
        (a) => ids.includes(a.question) || ids.includes(a.questionClientId)
      );
    } else if (subject) {
      const s = mentorSubjects.find((ms) => ms._id === subject);
      if (s) {
        const sQuestions = s.questions.filter(
          (q) => !category || `${q.category?.id}` === category
        );
        _answers = _answers.filter((a) =>
          sQuestions.map((q) => q.question).includes(a.question)
        );
      }
    }

    const answerStates: AnswerState[] = [];
    for (const a of _answers) {
      const q = getValueIfKeyExists(a.question, mentorQuestions);
      // we don't want to remove questions that are already in the recording state
      const answerAlreadyInState = Boolean(
        answers.find((as) => as.answer.question === a.question)
      );
      let checkStatus = !status || answerAlreadyInState;
      if (status === Status.COMPLETE) {
        checkStatus =
          isAnswerComplete(a, q?.question?.name, mentorType) ||
          answerAlreadyInState;
      } else if (status === Status.INCOMPLETE) {
        checkStatus =
          !isAnswerComplete(a, q?.question?.name, mentorType) ||
          answerAlreadyInState;
      } else if (status === Status.NONE) {
        checkStatus = a.status === Status.NONE || answerAlreadyInState;
      }
      if (
        q?.question &&
        (!q.question.mentorType || q.question.mentorType === mentorType) &&
        checkStatus
      ) {
        answerStates.push({
          answer: a,
          editedAnswer: a,
          editedQuestion: q.question,
          recordedVideo: undefined,
          minVideoLength: q.question.minVideoLength,
          attentionNeeded: doesAnswerNeedAttention(a),
          localTranscriptChanges: false,
        });
      }
    }
    //if after filtering through the answers we end up with none, then go back to My Mentor page
    if (!_answers.length) {
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

  function getUniqueCurAnswerUrl(answer?: Answer) {
    let videoSrc;
    if (answer) {
      videoSrc = getVideoSrcAnswer(answer);
    } else if (curAnswer) {
      videoSrc = getVideoSrc(curAnswer);
    }
    if (videoSrc) {
      return videoSrc ? `${videoSrc}?v=${Math.random()}` : "";
    }
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
        !equals(question, answer.editedQuestion) ||
        answer.localTranscriptChanges,
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
        (upload.transcript || upload.transcript === "") &&
        !answer.localTranscriptChanges // check if local edits were made while upload in progress
          ? upload.transcript
          : answer.editedAnswer.transcript;
      updateAnswerState(
        {
          recordedVideo: undefined,
          answer: {
            ...answer.answer,
            transcript: newTranscript,
            markdownTranscript: newTranscript,
            media: upload.media || [],
          },
          editedAnswer: {
            ...answer.editedAnswer,
            transcript: newTranscript,
            markdownTranscript: newTranscript,
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
    return getVideoSrcAnswer(answer.editedAnswer);
  }

  function getVideoSrcAnswer(answer: Answer) {
    const media = answer?.media?.find(
      (m) => m.type === MediaType.VIDEO && m.tag === MediaTag.WEB
    );
    return hasVirtualBackground && media?.transparentVideoUrl
      ? media.transparentVideoUrl
      : media?.url;
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

  function editAnswer(
    edits: Partial<Answer>,
    answerStateEdits?: Partial<AnswerState>
  ) {
    const answer = answers[answerIdx];
    updateAnswerState({
      editedAnswer: { ...answer.editedAnswer, ...edits },
      ...answerStateEdits,
    });
  }

  function editQuestion(edits: Partial<Question>) {
    const answer = answers[answerIdx];
    updateAnswerState({
      editedQuestion: { ...answer.editedQuestion, ...edits },
    });
  }

  async function saveAnswer(customEditedAnswer?: Answer) {
    const {
      answer,
      editedAnswer: _editedAnswer,
      localTranscriptChanges,
    } = answers[answerIdx];
    const editedAnswer = customEditedAnswer || _editedAnswer;
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
      await saveQuestion(editedQuestion);
    }
    // update the answer if it has changed
    if (!equals(answer, editedAnswer) || localTranscriptChanges) {
      setIsSaving(true);
      let didUpdate = false;
      try {
        const shouldVersionTranscript =
          localTranscriptChanges || customEditedAnswer;
        if (shouldVersionTranscript) {
          editedAnswer.previousVersions = await getUpdatedAnswerVersions(
            answer,
            editedAnswer
          );
        }
        didUpdate = await updateAnswer(editedAnswer, accessToken, mentorId);
      } catch (e) {
        const errorMessage = extractErrorMessageFromError(e);
        setIsSaving(false);
        setError({
          message: "Failed to save answer",
          error: errorMessage,
        });
        return;
      }
      if (!didUpdate) {
        setIsSaving(false);
        return;
      }
      let answerUpdateEdits: Partial<AnswerState> = {
        answer: { ...editedAnswer },
        editedAnswer: { ...editedAnswer },
        localTranscriptChanges: false,
      };
      if (
        localTranscriptChanges &&
        mentorType === MentorType.VIDEO &&
        configState.config?.uploadLambdaEndpoint
      ) {
        try {
          const newVttInfo = await regenerateVTTForQuestion(
            editedAnswer.question,
            mentorId,
            accessToken,
            configState.config.uploadLambdaEndpoint
          );
          const existingVttMedia = answer.media?.find(
            (m) => m.tag === MediaTag.VTT
          );
          if (!newVttInfo.regen_vtt) {
            return;
          }
          const newVttMedia: Media = {
            type: MediaType.VTT,
            tag: MediaTag.VTT,
            transparentVideoUrl: "",
            needsTransfer: false,
            hash: "",
            duration: 0,
            ...(existingVttMedia || []),
            url: newVttInfo.new_vtt_url,
            vttText: newVttInfo.new_vtt_text,
          };
          const newMedia = editedAnswer.media
            ?.filter((m) => m.tag !== MediaTag.VTT)
            .concat(newVttMedia);
          answerUpdateEdits = {
            ...answerUpdateEdits,
            answer: {
              ...answerUpdateEdits.answer!,
              media: newMedia,
            },
            editedAnswer: {
              ...answerUpdateEdits.editedAnswer!,
              media: newMedia,
            },
          };
        } catch (err) {
          console.error("failed to regenerate vtt");
          console.error(err);
        }
      }
      updateAnswerState(answerUpdateEdits, answerIdx);
      setIsSaving(false);
    }
  }

  async function getUpdatedAnswerVersions(
    answer: Answer,
    editedAnswer: Answer
  ): Promise<PreviousAnswerVersion[]> {
    const firstUpload = !answer.previousVersions.length && !answer.transcript;
    if (firstUpload) {
      return [];
    }
    const oldWebMedia = answer.media?.find((m) => m.tag === MediaTag.WEB);
    const oldVttMedia = answer.media?.find((m) => m.tag === MediaTag.VTT);
    let newVttText = oldVttMedia?.vttText || "";

    if (!newVttText && oldVttMedia?.url) {
      newVttText = await fetchVttFileFromUrl(oldVttMedia.url);
    }

    return [
      ...(editedAnswer.previousVersions || []),
      {
        transcript: answer.transcript,
        dateVersioned: Date.now().toString(),
        webVideoHash: oldWebMedia?.hash || "",
        vttText: newVttText,
        videoDuration: oldWebMedia?.duration || 0,
      },
    ];
  }

  async function uploadVideo(trim?: { start: number; end: number }) {
    const answer = answers[answerIdx];
    if (!mentorId || !answer.answer.question) {
      return;
    }
    const editedAnswer: Answer = {
      ...answer.editedAnswer,
      previousVersions: await getUpdatedAnswerVersions(
        answer.answer,
        answer.editedAnswer
      ),
    };
    const existingVideoWithEditedTranscript =
      trim &&
      (editedAnswer.hasEditedTranscript || answer.answer.hasEditedTranscript);
    if (existingVideoWithEditedTranscript) {
      setNotifyDialogOpen(true);
    }
    updateAnswerState({ answer: editedAnswer, editedAnswer: editedAnswer });
    try {
      await updateAnswer(editedAnswer, accessToken, mentorId);
    } catch (err) {
      setError({
        message: "Failed to update answer with edited transcript",
        error: String(err),
      });
    }

    if (!answer.recordedVideo) {
      const url = curAnswer?.videoSrc;
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
              Boolean(hasVirtualBackground),
              trim,
              editedAnswer.hasEditedTranscript ||
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
      upload(
        mentorId,
        answer.answer.question,
        answer.recordedVideo,
        Boolean(hasVirtualBackground),
        trim
      );
    }
  }

  function updateUrl(
    webUrl: string | undefined,
    mobileUrl: string | undefined,
    webTransUrl: string | undefined,
    mobileTransUrl: string | undefined
  ): void {
    const { answer } = answers[answerIdx];
    setIsUpdatingUrl(true);
    updateAnswerUrl(
      accessToken,
      mentorId,
      answer,
      webUrl,
      mobileUrl,
      webTransUrl,
      mobileTransUrl
    )
      .then((res) => {
        if (res) {
          setIsUpdatingUrl(false);
          const ca = {
            ...curAnswer!,
            answer: {
              ...curAnswer!.answer,
              media: res.media,
            },
            editedAnswer: {
              ...curAnswer!.editedAnswer,
              media: res.media,
            },
            videoSrc: getUniqueCurAnswerUrl(res),
            recordedVideo: undefined,
          };
          setCurAnswer(ca);
          setAnswers(copyAndSet(answers, answerIdx, ca));
        }
      })
      .catch((error) => {
        setIsUpdatingUrl(false);
        setError({
          message: `Failed to update answer video url`,
          error: String(error),
        });
      });
  }

  function downloadVideoBlobUrl(blobUrl: string, questionId: string): boolean {
    const link = document.createElement("a");
    link.setAttribute("href", blobUrl);
    link.setAttribute(
      "download",
      `${questionId}.${hasVirtualBackground ? "webm" : "mp4"}`
    );
    link.click();
    return true;
  }

  function downloadVideoBlob(
    blob: Blob,
    filename: string,
    document: Document
  ): boolean {
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", blobUrl);
    link.setAttribute(
      "download",
      `${filename}.${hasVirtualBackground ? "webm" : "mp4"}`
    );
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
      (u) =>
        u.url.length > 15 &&
        (u.url.slice(-12) == "original.mp4" ||
          u.url.slice(-12) == "original.webm")
    )?.url;
    if (url) {
      fetchVideoBlobFromUrl(url)
        .then((videoBlob) => {
          downloadVideoBlob(
            videoBlob,
            `${upload.question}_video.${hasVirtualBackground ? "webm" : "mp4"}`,
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
        const qsUploading = Object.keys(filesUploading);
        const uploadingFileFound = qsUploading.find((qId) => qId == question);
        if (uploadingFileFound) {
          downloaded = downloadVideoBlobUrl(
            filesUploading[uploadingFileFound],
            question
          );
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
    isUpdatingUrl,
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
    setMinVideoLength,
    clearError,
    downloadVideoBlobUrl,
    updateUrl,
    filesUploading,
  };
}
