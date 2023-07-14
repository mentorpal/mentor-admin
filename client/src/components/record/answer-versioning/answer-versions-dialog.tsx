import { Button, Dialog, DialogContent } from "@mui/material";
import React, { useState } from "react";
import { PreviousAnswerVersion } from "types-gql";
import { PreviousAnswerDisplay } from "./single-previous-answer-display";
import { PreviousVersionSelectionType } from "./answer-versions";

export function AnswerVersionsDialog(props: {
  open: boolean;
  closeDialog: () => void;
  handleReplace: (
    selectedVersion: PreviousAnswerVersion,
    selectionType: PreviousVersionSelectionType
  ) => void;
  previousAnswers: PreviousAnswerVersion[];
}): JSX.Element {
  const { open, previousAnswers, handleReplace } = props;
  const [selectedAnswerVersion, setSelectedAnswerVersion] =
    useState<PreviousAnswerVersion>();
  const [selectionType, setSelectionType] =
    useState<PreviousVersionSelectionType>(PreviousVersionSelectionType.NONE);

  function closeDialog() {
    setSelectedAnswerVersion(undefined);
    setSelectionType(PreviousVersionSelectionType.NONE);
    props.closeDialog();
  }

  return (
    <Dialog
      data-cy="versions-dialog"
      maxWidth="lg"
      fullWidth={true}
      open={open}
      PaperProps={{
        style: {
          borderRadius: "20px",
          borderWidth: "3px",
          borderColor: "#1c6a9c",
          borderStyle: "solid",
        },
      }}
    >
      <DialogContent style={{ maxHeight: "80%", overflow: "scroll" }}>
        {previousAnswers.map((previousAnswer, index) => {
          return (
            <PreviousAnswerDisplay
              index={index}
              key={index}
              previousAnswer={previousAnswer}
              curSelectedAnswerVersion={selectedAnswerVersion}
              setSelectedAnswerVersion={setSelectedAnswerVersion}
              setSelectionType={setSelectionType}
            />
          );
        })}
      </DialogContent>
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        <Button
          disabled={!selectedAnswerVersion || !selectionType}
          data-cy="replace-dialog-button"
          onClick={() => {
            selectedAnswerVersion &&
              selectionType &&
              handleReplace(selectedAnswerVersion, selectionType);
          }}
        >
          Replace
        </Button>
        <Button
          data-cy="versions-close-dialog-button"
          onClick={() => {
            closeDialog();
          }}
        >
          Close
        </Button>
      </div>
    </Dialog>
  );
}
