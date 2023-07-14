import { IconButton } from "@mui/material";
import React, { useState } from "react";
import HistoryIcon from "@mui/icons-material/History";
import { Answer } from "types";
import { AnswerVersionsDialog } from "./answer-versions-dialog";
import { PreviousAnswerVersion } from "types-gql";

export enum PreviousVersionSelectionType {
  VTT_ONLY = "VTT_ONLY",
  TRANSCRIPT_ONLY = "TRANSCRIPT_ONLY",
  BOTH = "BOTH",
  NONE = "NONE",
}

export function AnswerVersionsHandler(props: { answer: Answer }): JSX.Element {
  const { answer } = props;
  const [open, setOpen] = useState<boolean>(false);

  function handleReplace(
    selectedVersion: PreviousAnswerVersion,
    selectionType: PreviousVersionSelectionType
  ) {
    console.log(selectedVersion);
    console.log(selectionType);
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
        disabled={answer.previousVersions.length === 0}
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
        previousAnswers={sortPreviousVersionByDate(answer.previousVersions)}
      />
    </span>
  );
}
