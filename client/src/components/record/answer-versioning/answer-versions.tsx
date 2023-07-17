import { IconButton } from "@mui/material";
import React, { useState } from "react";
import HistoryIcon from "@mui/icons-material/History";
import { Answer, MediaType } from "types";
import { AnswerVersionsDialog } from "./answer-versions-dialog";
import { PreviousAnswerVersion } from "types-gql";
import { LoadingDialog } from "components/dialog";
import { UploadVttResponse, uploadVtt } from "api";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import { useWithConfig } from "store/slices/config/useWithConfig";

export enum PreviousVersionSelectionType {
  VTT_ONLY = "VTT_ONLY",
  TRANSCRIPT_ONLY = "TRANSCRIPT_ONLY",
  BOTH = "BOTH",
  NONE = "NONE",
}

export function AnswerVersionsHandler(props: {
  editedAnswer: Answer;
  saveAnswer: (customEditedAnswer?: Answer) => Promise<void>;
  accessToken: string;
}): JSX.Element {
  const [selectedAnswerVersion, setSelectedAnswerVersion] =
    useState<PreviousAnswerVersion>();
  const [selectionType, setSelectionType] =
    useState<PreviousVersionSelectionType>(PreviousVersionSelectionType.NONE);
  const { editedAnswer, saveAnswer, accessToken } = props;
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { getData } = useActiveMentor();
  const { state: configState } = useWithConfig();
  const mentorId = getData((state) => state.data?._id);

  function handleReplacingTranscript(
    selectedVersion: PreviousAnswerVersion,
    curAnswer: Answer
  ): Promise<void> {
    const newAnswer: Answer = {
      ...curAnswer,
      transcript: selectedVersion.transcript,
      markdownTranscript: selectedVersion.transcript,
    };
    return saveAnswer(newAnswer);
  }

  function handleReplaceVtt(
    selectedVersion: PreviousAnswerVersion,
    curAnswer: Answer
  ): Promise<UploadVttResponse> {
    const blob = new Blob([selectedVersion.vttText], { type: "text/vtt" });
    const file = new File([blob], "vttFile.vtt", { type: "text/vtt" });
    return uploadVtt(
      mentorId,
      curAnswer.question,
      file,
      accessToken,
      configState.config?.uploadLambdaEndpoint || ""
    );
  }

  async function handleReplace(
    selectedVersion: PreviousAnswerVersion,
    selectionType: PreviousVersionSelectionType
  ) {
    setLoading(true);
    let answerUpdatedVttInfo: Answer = {
      ...editedAnswer,
      previousVersions: editedAnswer.previousVersions.filter(
        (version) =>
          version.transcript !== selectedVersion.transcript ||
          version.dateVersioned !== selectedVersion.dateVersioned ||
          version.vttText !== selectedVersion.vttText
      ),
    };
    try {
      if (selectionType === PreviousVersionSelectionType.TRANSCRIPT_ONLY) {
        await handleReplacingTranscript(selectedVersion, answerUpdatedVttInfo);
      } else if (selectionType === PreviousVersionSelectionType.VTT_ONLY) {
        const vttUpdate = await handleReplaceVtt(
          selectedVersion,
          answerUpdatedVttInfo
        );
        answerUpdatedVttInfo = {
          ...answerUpdatedVttInfo,
          media: (answerUpdatedVttInfo.media || []).map((media) => {
            if (media.type === MediaType.VTT) {
              return {
                ...media,
                vttUrl: vttUpdate.vtt_path,
                vttText: vttUpdate.vtt_text,
              };
            }
            return media;
          }),
        };
        await saveAnswer(answerUpdatedVttInfo);
      } else if (selectionType === PreviousVersionSelectionType.BOTH) {
        const vttInfo = await handleReplaceVtt(
          selectedVersion,
          answerUpdatedVttInfo
        );
        // add vtt info to answer media for local update since already updated in gql
        answerUpdatedVttInfo = {
          ...answerUpdatedVttInfo,
          media: (answerUpdatedVttInfo.media || []).map((media) => {
            if (media.type === MediaType.VTT) {
              return {
                ...media,
                vttUrl: vttInfo.vtt_path,
                vttText: vttInfo.vtt_text,
              };
            }
            return media;
          }),
        };
        await handleReplacingTranscript(selectedVersion, answerUpdatedVttInfo);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
      setOpen(false);
    }
  }

  function sortPreviousVersionByDate(
    previousVersions: PreviousAnswerVersion[]
  ): PreviousAnswerVersion[] {
    if (previousVersions.length === 0) {
      return previousVersions;
    }
    return [...previousVersions].sort((a, b) => {
      return parseInt(b.dateVersioned) - parseInt(a.dateVersioned);
    });
  }

  return (
    <span>
      <IconButton
        data-cy="versions-icon"
        disabled={editedAnswer.previousVersions.length === 0}
        onClick={() => {
          setOpen(true);
        }}
      >
        <HistoryIcon />
      </IconButton>
      <AnswerVersionsDialog
        open={open}
        closeDialog={() => setOpen(false)}
        handleReplace={handleReplace}
        previousAnswers={sortPreviousVersionByDate(
          editedAnswer.previousVersions
        )}
        selectedAnswerVersion={selectedAnswerVersion}
        selectionType={selectionType}
        setSelectedAnswerVersion={setSelectedAnswerVersion}
        setSelectionType={setSelectionType}
      />
      <LoadingDialog title={loading ? "Saving..." : ""} />
    </span>
  );
}
