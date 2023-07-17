import { Button, Dialog, DialogContent, IconButton } from "@mui/material";
import React from "react";
import { PreviousAnswerVersion } from "types-gql";
import { PreviousAnswerDisplay } from "./single-previous-answer-display";
import { PreviousVersionSelectionType } from "./answer-versions";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";

export function AnswerVersionsDialog(props: {
  open: boolean;
  closeDialog: () => void;
  handleReplace: (
    selectedVersion: PreviousAnswerVersion,
    selectionType: PreviousVersionSelectionType
  ) => void;
  previousAnswers: PreviousAnswerVersion[];
  selectedAnswerVersion?: PreviousAnswerVersion;
  selectionType?: PreviousVersionSelectionType;
  setSelectedAnswerVersion: (version?: PreviousAnswerVersion) => void;
  setSelectionType: (selectionType: PreviousVersionSelectionType) => void;
}): JSX.Element {
  const {
    open,
    previousAnswers,
    handleReplace,
    setSelectedAnswerVersion,
    setSelectionType,
    selectedAnswerVersion,
    selectionType,
  } = props;
  const [displayIndex, setDisplayIndex] = React.useState(0);
  const answerToDisplay = previousAnswers[displayIndex];

  function handleDecrement() {
    setDisplayIndex((prev) => {
      if (prev === 0) {
        return prev;
      }
      return prev - 1;
    });
  }

  function handleDoubleDecrement() {
    setDisplayIndex((prev) => {
      if (prev === 0) {
        return prev;
      }
      const newStartIndex = prev - 10;
      if (newStartIndex <= 0) {
        return 0;
      }
      return newStartIndex;
    });
  }

  function handleIncrement() {
    setDisplayIndex((prev) => {
      if (prev === previousAnswers.length - 1) {
        return prev;
      }
      const newEndIndex = prev + 1;
      if (newEndIndex >= previousAnswers.length) {
        return previousAnswers.length - 1;
      }
      return newEndIndex;
    });
  }

  function handleDoubleIncrement() {
    setDisplayIndex((prev) => {
      if (prev === previousAnswers.length - 1) {
        return prev;
      }
      const newEndIndex = prev + 10;
      if (newEndIndex >= previousAnswers.length) {
        return previousAnswers.length - 1;
      }
      return newEndIndex;
    });
  }

  function closeDialog() {
    setSelectedAnswerVersion(undefined);
    setSelectionType(PreviousVersionSelectionType.NONE);
    setDisplayIndex(0);
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
      style={{ display: "flex", flexDirection: "column" }}
    >
      <DialogContent
        style={{ maxHeight: "80%", overflow: "auto", paddingBottom: 0 }}
      >
        <PreviousAnswerDisplay
          previousAnswer={answerToDisplay}
          setSelectedAnswerVersion={setSelectedAnswerVersion}
          setSelectionType={setSelectionType}
        />
      </DialogContent>
      <div
        data-cy="versions-dialog-pagination"
        style={{ display: "flex", alignSelf: "center" }}
      >
        <IconButton
          data-cy="double-left"
          onClick={handleDoubleDecrement}
          disabled={displayIndex === 0}
        >
          <KeyboardDoubleArrowLeftIcon />
        </IconButton>
        <IconButton
          data-cy="single-left"
          onClick={handleDecrement}
          disabled={displayIndex === 0}
        >
          <KeyboardArrowLeftIcon />
        </IconButton>
        <IconButton
          data-cy="single-right"
          onClick={handleIncrement}
          disabled={displayIndex === previousAnswers.length - 1}
        >
          <KeyboardArrowRightIcon />
        </IconButton>
        <IconButton
          data-cy="double-right"
          onClick={handleDoubleIncrement}
          disabled={displayIndex === previousAnswers.length - 1}
        >
          <KeyboardDoubleArrowRightIcon />
        </IconButton>
      </div>
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
