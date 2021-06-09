/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { navigate } from "gatsby";
import React from "react";
import {
  AppBar,
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  TextField,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import CreateIcon from "@material-ui/icons/Create";
import UndoIcon from "@material-ui/icons/Undo";

import { MentorType, Status, UtteranceName } from "types";
import NavBar from "components/nav-bar";
import ProgressBar from "components/progress-bar";
import VideoPlayer from "components/record/video-player";
import withAuthorizationOnly from "hooks/wrap-with-authorization-only";
import withLocation from "wrap-with-location";
import { useWithRecordState } from "hooks/graphql/use-with-record-state";
import { LoadingDialog } from "components/dialog";
import { equals } from "helpers";
import UploadingWidget from "components/record/uploading-widget";

const useStyles = makeStyles((theme) => ({
  toolbar: theme.mixins.toolbar,
  root: {
    display: "flex",
    flexDirection: "column",
  },
  block: {
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 75,
    paddingRight: 75,
    textAlign: "left",
  },
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontWeight: "bold",
  },
  inputField: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
  },
  footer: {
    top: "auto",
    bottom: 0,
    backgroundColor: "#eee",
    opacity: 0.8,
  },
  button: {
    width: 180,
  },
  backBtn: {
    position: "absolute",
    left: 0,
  },
  nextBtn: {
    position: "absolute",
    right: 0,
  },
}));

const DarkerDisabledTextField = withStyles({
  root: {
    marginRight: 8,
    "& .MuiInputBase-root.Mui-disabled": {
      color: "rgba(0, 0, 0, 1)", // (default alpha is 0.38)
    },
  },
})(TextField);

function RecordPage(props: {
  accessToken: string;
  search: {
    videoId?: string[] | string;
    subject?: string;
    status?: string;
    category?: string;
    back?: string;
  };
}): JSX.Element {
  const classes = useStyles();
  const {
    mentor,
    isLoading,
    answers,
    answerIdx,
    curAnswer,
    isRecording,
    prevAnswer,
    nextAnswer,
    editAnswer,
    saveAnswer,
    rerecord,
    startRecording,
    stopRecording,
    uploadVideo,
    setMinVideoLength,
  } = useWithRecordState(props.accessToken, props.search);

  function onBack() {
    if (props.search.back) {
      navigate(decodeURI(props.search.back));
    } else {
      navigate("/");
    }
  }

  function switchAnswer(onNav: () => void) {
    if (curAnswer?.isEdited) {
      saveAnswer();
      onNav();
    } else {
      onNav();
    }
  }

  if (!mentor) {
    return <div />;
  }

  return (
    <div className={classes.root}>
      {curAnswer ? <UploadingWidget answers={answers} /> : undefined}
      <NavBar title="Record Mentor" mentorId={mentor?._id} />
      <div data-cy="progress" className={classes.block}>
        <Typography
          variant="h6"
          className={classes.title}
          style={{ textAlign: "center" }}
        >
          Questions {answerIdx + 1} / {answers.length}
        </Typography>
        <ProgressBar value={answerIdx + 1} total={answers.length} />
      </div>
      <div data-cy="question" className={classes.block}>
        <Typography className={classes.title}>Question:</Typography>
        <FormControl className={classes.inputField} variant="outlined">
          <DarkerDisabledTextField
            multiline
            variant="outlined"
            data-cy="question-input"
            style={{ flexGrow: 1 }}
            value={curAnswer?.editedAnswer?.question?.question}
            disabled={curAnswer?.editedAnswer?.question?.mentor !== mentor?._id}
            onChange={(e) => {
              if (curAnswer?.editedAnswer?.question) {
                editAnswer({
                  question: {
                    ...curAnswer?.editedAnswer.question,
                    question: e.target.value,
                  },
                });
              }
            }}
            InputProps={{
              endAdornment:
                curAnswer?.editedAnswer?.question?.mentor !==
                mentor?._id ? undefined : (
                  <InputAdornment data-cy="edit-question-input" position="end">
                    <CreateIcon />
                  </InputAdornment>
                ),
            }}
          />
          <IconButton
            data-cy="undo-question-btn"
            disabled={equals(
              curAnswer?.editedAnswer?.question,
              curAnswer?.answer?.question
            )}
            onClick={() =>
              editAnswer({
                question: curAnswer?.answer?.question,
              })
            }
          >
            <UndoIcon />
          </IconButton>
        </FormControl>
      </div>
      {curAnswer && mentor?.mentorType === MentorType.VIDEO ? (
        <VideoPlayer
          classes={classes}
          curAnswer={curAnswer}
          isRecording={isRecording}
          onUpload={uploadVideo}
          onRerecord={rerecord}
          onRecordStart={startRecording}
          onRecordStop={stopRecording}
        />
      ) : undefined}
      {curAnswer?.minVideoLength &&
      curAnswer?.editedAnswer?.question?.name === UtteranceName.IDLE ? (
        <div data-cy="idle" className={classes.block}>
          <Typography className={classes.title}>Idle Duration:</Typography>
          <Select
            data-cy="idle-duration"
            value={curAnswer?.minVideoLength}
            onChange={(
              event: React.ChangeEvent<{ value: unknown; name?: unknown }>
            ) => setMinVideoLength(event.target.value as number)}
            style={{ marginLeft: 10 }}
          >
            <MenuItem data-cy="10" value={10}>
              10 seconds
            </MenuItem>
            <MenuItem data-cy="30" value={30}>
              30 seconds
            </MenuItem>
            <MenuItem data-cy="60" value={60}>
              60 seconds
            </MenuItem>
          </Select>
        </div>
      ) : (
        <div data-cy="transcript" className={classes.block}>
          <Typography className={classes.title}>Answer Transcript:</Typography>
          <FormControl className={classes.inputField} variant="outlined">
            <DarkerDisabledTextField
              multiline
              variant="outlined"
              data-cy="transcript-input"
              style={{ flexGrow: 1 }}
              value={curAnswer?.editedAnswer?.transcript}
              onChange={(e) => editAnswer({ transcript: e.target.value })}
            />
            <IconButton
              data-cy="undo-transcript-btn"
              disabled={
                curAnswer?.editedAnswer?.transcript ===
                curAnswer?.answer?.transcript
              }
              onClick={() =>
                editAnswer({
                  transcript: curAnswer?.answer?.transcript,
                })
              }
            >
              <UndoIcon />
            </IconButton>
          </FormControl>
        </div>
      )}
      <div
        data-cy="status"
        className={classes.block}
        style={{ textAlign: "right" }}
      >
        <Typography className={classes.title}>Status:</Typography>
        <Select
          data-cy="select-status"
          value={curAnswer?.editedAnswer?.status || ""}
          onChange={(
            event: React.ChangeEvent<{ value: unknown; name?: unknown }>
          ) => editAnswer({ status: event.target.value as Status })}
          style={{ marginLeft: 10 }}
        >
          <MenuItem data-cy="incomplete" value={Status.INCOMPLETE}>
            Skip
          </MenuItem>
          <MenuItem
            data-cy="complete"
            value={Status.COMPLETE}
            disabled={!curAnswer?.isValid}
          >
            Active
          </MenuItem>
        </Select>
      </div>
      <div className={classes.toolbar} />
      <AppBar position="fixed" className={classes.footer}>
        <Toolbar className={classes.row} style={{ justifyContent: "center" }}>
          <IconButton
            data-cy="back-btn"
            className={classes.backBtn}
            disabled={
              answerIdx === 0 || curAnswer?.isSaving || curAnswer?.isUploading
            }
            onClick={() => switchAnswer(prevAnswer)}
          >
            <ArrowBackIcon fontSize="large" />
          </IconButton>
          {answerIdx === answers.length - 1 ? (
            <Button
              data-cy="done-btn"
              variant="contained"
              color="primary"
              disableElevation
              disabled={curAnswer?.isSaving || curAnswer?.isUploading}
              onClick={() => switchAnswer(onBack)}
              className={classes.nextBtn}
            >
              Done
            </Button>
          ) : (
            <IconButton
              data-cy="next-btn"
              className={classes.nextBtn}
              disabled={
                answerIdx === answers.length - 1 ||
                curAnswer?.isSaving ||
                curAnswer?.isUploading
              }
              onClick={() => switchAnswer(nextAnswer)}
            >
              <ArrowForwardIcon fontSize="large" />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
      <LoadingDialog
        data-cy="loading-dialog"
        title={
          isLoading ? "Loading..." : curAnswer?.isSaving ? "Saving..." : ""
        }
      />
    </div>
  );
}

export default withAuthorizationOnly(withLocation(RecordPage));
