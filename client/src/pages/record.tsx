/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved.
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { navigate } from "gatsby";
import React, { useState } from "react";
import {
  AppBar,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  OutlinedInput,
  Select,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import UndoIcon from "@material-ui/icons/Undo";

import { Status, UtteranceName } from "types";
import NavBar from "components/nav-bar";
import ProgressBar from "components/progress-bar";
import VideoPlayer from "components/record/video-player";
import withAuthorizationOnly from "hooks/wrap-with-authorization-only";
import withLocation from "hooks/wrap-with-location";
import { useWithUploading } from "hooks/task/use-with-upload";
import { useWithRecordState } from "hooks/graphql/use-with-record-state";
import { useWithMentor } from "hooks/graphql/use-with-mentor";

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
  },
  footer: {
    top: "auto",
    bottom: 0,
    backgroundColor: "#eee",
    opacity: 0.8,
  },
  button: {
    width: 150,
  },
  backBtn: {
    position: "absolute",
    left: 0,
  },
  nextBtn: {
    position: "absolute",
    right: 0,
  },
  faceOutline: {
    opacity: 0.5,
  },
}));

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
    answers,
    curAnswer,
    curAnswerIdx,
    hasUnsavedChanges,
    prevAnswer,
    nextAnswer,
    editAnswer,
    saveAnswer,
  } = useWithRecordState(props.accessToken, props.search);
  const { mentor } = useWithMentor(props.accessToken);
  const { isUploading, startUploading } = useWithUploading();
  const [idleLength, setIdleLength] = useState<number>(10);

  function onBack() {
    if (props.search.back) {
      navigate(decodeURI(props.search.back));
    } else {
      navigate("/");
    }
  }

  if (!mentor || answers.length === 0 || !curAnswer) {
    return (
      <div>
        <NavBar title="Record Mentor" mentorId={mentor?._id} />
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <NavBar title="Record Mentor" mentorId={mentor._id} />
      <div data-cy="progress" className={classes.block}>
        <Typography
          variant="h6"
          className={classes.title}
          style={{ textAlign: "center" }}
        >
          Questions {curAnswerIdx + 1} / {answers.length}
        </Typography>
        <ProgressBar value={curAnswerIdx + 1} total={answers.length} />
      </div>
      <VideoPlayer
        classes={classes}
        mentor={{ id: mentor._id, type: mentor.mentorType }}
        answer={{ id: curAnswer._id, recordedAt: curAnswer.recordedAt }}
        isUploading={isUploading}
        onUpload={startUploading}
        onRerecord={() => editAnswer({ recordedAt: "" })}
        minLength={
          curAnswer.question?.name === UtteranceName.IDLE ? idleLength : 0
        }
      />
      <div data-cy="question" className={classes.block}>
        <Typography className={classes.title}>Question:</Typography>
        <FormControl className={classes.inputField} variant="outlined">
          <OutlinedInput
            data-cy="question-input"
            multiline
            value={curAnswer.question?.question}
            disabled={curAnswer.question?.mentor !== mentor._id}
            onChange={(e) =>
              editAnswer({
                question: { ...curAnswer.question, question: e.target.value },
              })
            }
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  data-cy="undo-question-btn"
                  disabled={
                    curAnswer.question?.question ===
                    answers[curAnswerIdx].question?.question
                  }
                  onClick={() =>
                    editAnswer({
                      question: answers[curAnswerIdx].question,
                    })
                  }
                >
                  <UndoIcon />
                </IconButton>
              </InputAdornment>
            }
          />
        </FormControl>
      </div>
      {curAnswer.question?.name === UtteranceName.IDLE ? (
        <div data-cy="idle" className={classes.block}>
          <Typography className={classes.title}>Idle Duration:</Typography>
          <Select
            data-cy="idle-duration"
            value={idleLength}
            onChange={(
              event: React.ChangeEvent<{ value: unknown; name?: unknown }>
            ) => setIdleLength(event.target.value as number)}
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
            <OutlinedInput
              data-cy="transcript-input"
              multiline
              value={curAnswer.transcript}
              onChange={(e) => editAnswer({ transcript: e.target.value })}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    data-cy="undo-transcript-btn"
                    disabled={
                      curAnswer.transcript === answers[curAnswerIdx].transcript
                    }
                    onClick={() =>
                      editAnswer({
                        transcript: answers[curAnswerIdx].transcript,
                      })
                    }
                  >
                    <UndoIcon />
                  </IconButton>
                </InputAdornment>
              }
            />
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
          value={curAnswer.status.toString()}
          onChange={(
            event: React.ChangeEvent<{ value: unknown; name?: unknown }>
          ) => editAnswer({ status: event.target.value as Status })}
          style={{ marginLeft: 10 }}
        >
          <MenuItem data-cy="incomplete" value={Status.INCOMPLETE}>
            {Status.INCOMPLETE}
          </MenuItem>
          <MenuItem data-cy="complete" value={Status.COMPLETE}>
            {Status.COMPLETE}
          </MenuItem>
        </Select>
      </div>
      <div className={classes.toolbar} />
      <AppBar position="fixed" className={classes.footer}>
        <Toolbar className={classes.row} style={{ justifyContent: "center" }}>
          <IconButton
            data-cy="back-btn"
            className={classes.backBtn}
            disabled={curAnswerIdx === 0}
            onClick={prevAnswer}
          >
            <ArrowBackIcon fontSize="large" />
          </IconButton>
          <Button
            data-cy="save-btn"
            variant="contained"
            color="primary"
            disableElevation
            disabled={hasUnsavedChanges}
            onClick={saveAnswer}
          >
            Save
          </Button>
          {curAnswerIdx === answers.length - 1 ? (
            <Button
              data-cy="done-btn"
              variant="contained"
              color="primary"
              disableElevation
              onClick={onBack}
              className={classes.nextBtn}
            >
              Done
            </Button>
          ) : (
            <IconButton
              data-cy="next-btn"
              className={classes.nextBtn}
              disabled={curAnswerIdx === answers.length - 1}
              onClick={nextAnswer}
            >
              <ArrowForwardIcon fontSize="large" />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default withAuthorizationOnly(withLocation(RecordPage));
