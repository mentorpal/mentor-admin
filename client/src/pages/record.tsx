/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { navigate } from "gatsby";
import React, { useState } from "react";
import {
  AppBar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
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

import { MentorType, Status, UtteranceName } from "types";
import NavBar from "components/nav-bar";
import ProgressBar from "components/progress-bar";
import VideoPlayer from "components/record/video-player";
import withAuthorizationOnly from "hooks/wrap-with-authorization-only";
import withLocation from "wrap-with-location";
import { useWithRecordState } from "hooks/graphql/use-with-record-state";
import { ErrorDialog, LoadingDialog } from "components/dialog";
import UploadingWidget from "components/record/uploading-widget";
import { fetchFollowUpQuestions } from "api";
import FollowUpQuestionsWidget from "components/record/follow-up-question-list";
import { useEffect } from "react";
import { useWithSubject } from "hooks/graphql/use-with-subject";

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
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 30,
    left: 0,
    right: 0,
  },
}));

interface LeaveConfirmation {
  message: string;
  callback: () => void;
}

function RecordPage(props: {
  accessToken: string;
  search: {
    videoId?: string[] | string;
    subject?: string;
    status?: string;
    category?: string;
    back?: string;
    poll?: string;
  };
}): JSX.Element {
  const classes = useStyles();
  const [confirmLeave, setConfirmLeave] = useState<LeaveConfirmation>();
  const [uploadingWidgetVisible, setUploadingWidgetVisible] = useState(true);
  const recordState = useWithRecordState(props.accessToken, props.search);
  const { curAnswer, mentor } = recordState;
  const { addQuestion, removeQuestion, editedData, saveSubject } =
    useWithSubject(props.search.subject || "", props.accessToken);
  const [recordSession, setRecordSesssion] = useState(true);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]); //TODO: send this to the backend
  const [toRecordFollowUpQs, setRecordFollowUpQs] = useState(false); //lets us know if we are gonna be saving extra questions and recording
  const curSubject = mentor?.subjects.find(
    (s) => s._id == props.search.subject
  );
  const subjectTitle = curSubject?.name || "";
  const categoryTitle =
    curSubject?.categories.find((c) => c.id == props.search.category)?.name ||
    "";
  useEffect(() => {
    fetchFollowUpQuestions(props.accessToken).then((data) => {
      setFollowUpQuestions(data);
    });
  }, [recordSession]);

  //when the length of the answers changes, we have more questions to record.
  useEffect(() => {
    setRecordSesssion(true);
    recordState.nextAnswer();
  }, [mentor?.answers]);

  function onBack() {
    if (props.search.back) {
      navigate(decodeURI(props.search.back));
    } else {
      navigate("/");
    }
  }
  function onEnd() {
    setRecordSesssion(false);
  }
  function switchAnswer(onNav: () => void) {
    if (curAnswer?.isEdited) {
      if (curAnswer?.recordedVideo && !curAnswer?.isUploading) {
        setConfirmLeave({
          message:
            "You have not uploaded your recorded video yet. Would you like to move on anyway?",
          callback: onNav,
        });
      } else {
        onNav();
      }
    } else {
      onNav();
    }
  }

  function confirm() {
    if (!confirmLeave) {
      return;
    }
    confirmLeave.callback();
    setConfirmLeave(undefined);
  }

  if (!mentor || !curAnswer) {
    return (
      <div className={classes.root}>
        <NavBar title="Recording: " mentorId={undefined} />
        <LoadingDialog title={"Loading..."} />
        <ErrorDialog
          error={recordState.error}
          clearError={recordState.clearError}
        />
      </div>
    );
  }

  return (
    <div className={classes.root}>
      {curAnswer ? (
        <UploadingWidget
          visible={uploadingWidgetVisible}
          setUploadWidgetVisible={setUploadingWidgetVisible}
          curAnswer={curAnswer.answer}
          recordState={recordState}
        />
      ) : undefined}
      <NavBar
        title={`Recording: ${subjectTitle} - ${categoryTitle}`}
        mentorId={mentor._id}
        uploads={recordState.uploads}
        uploadsButtonVisible={uploadingWidgetVisible}
        toggleUploadsButtonVisibility={setUploadingWidgetVisible}
      />

      {recordSession ? (
        <div>
          <div data-cy="progress" className={classes.block}>
            <Typography
              variant="h6"
              className={classes.title}
              style={{ textAlign: "center" }}
            >
              Questions {recordState.answerIdx + 1} /{" "}
              {recordState.answers.length}
            </Typography>
            <ProgressBar
              value={recordState.answerIdx + 1}
              total={recordState.answers.length}
            />
          </div>
          {mentor.mentorType === MentorType.VIDEO ? (
            <VideoPlayer classes={classes} recordState={recordState} />
          ) : undefined}
          <div data-cy="question" className={classes.block}>
            <Typography className={classes.title}>Question:</Typography>
            <FormControl className={classes.inputField} variant="outlined">
              <OutlinedInput
                data-cy="question-input"
                multiline
                value={curAnswer?.editedAnswer.question?.question}
                disabled={
                  curAnswer?.editedAnswer.question?.mentor !== mentor._id
                }
                onChange={(e) => {
                  if (curAnswer?.editedAnswer.question) {
                    recordState.editAnswer({
                      question: {
                        ...curAnswer?.editedAnswer.question,
                        question: e.target.value,
                      },
                    });
                  }
                }}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      data-cy="undo-question-btn"
                      disabled={
                        curAnswer?.editedAnswer.question?.question ===
                        curAnswer?.answer.question?.question
                      }
                      onClick={() =>
                        recordState.editAnswer({
                          question: curAnswer?.answer.question,
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
          {curAnswer?.minVideoLength &&
          curAnswer?.editedAnswer.question?.name === UtteranceName.IDLE ? (
            <div data-cy="idle" className={classes.block}>
              <Typography className={classes.title}>Idle Duration:</Typography>
              <Select
                data-cy="idle-duration"
                value={curAnswer?.minVideoLength}
                onChange={(
                  event: React.ChangeEvent<{ value: unknown; name?: unknown }>
                ) =>
                  recordState.setMinVideoLength(event.target.value as number)
                }
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
              <Typography className={classes.title}>
                Answer Transcript:
              </Typography>
              <FormControl className={classes.inputField} variant="outlined">
                <OutlinedInput
                  data-cy="transcript-input"
                  multiline
                  value={curAnswer?.editedAnswer.transcript}
                  onChange={(e) =>
                    recordState.editAnswer({ transcript: e.target.value })
                  }
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        data-cy="undo-transcript-btn"
                        disabled={
                          curAnswer?.editedAnswer.transcript ===
                          curAnswer?.answer.transcript
                        }
                        onClick={() =>
                          recordState.editAnswer({
                            transcript: curAnswer?.answer.transcript,
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
              value={curAnswer?.editedAnswer.status || ""}
              onChange={(
                event: React.ChangeEvent<{ value: unknown; name?: unknown }>
              ) =>
                recordState.editAnswer({ status: event.target.value as Status })
              }
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
        </div>
      ) : (
        <div>
          <Box height="100%" width="100%">
            <FollowUpQuestionsWidget
              categoryID={props.search.category}
              questions={followUpQuestions}
              mentorID={mentor._id}
              toRecordFollowUpQs={setRecordFollowUpQs}
              addQuestion={addQuestion}
              removeQuestion={removeQuestion}
              editedData={editedData}
            />
          </Box>
        </div>
      )}
      <div className={classes.toolbar} />

      <AppBar position="fixed" className={classes.footer}>
        <Toolbar className={classes.row} style={{ justifyContent: "center" }}>
          <IconButton
            data-cy="back-btn"
            className={classes.backBtn}
            disabled={recordState.answerIdx === 0}
            onClick={() => switchAnswer(recordState.prevAnswer)}
          >
            <ArrowBackIcon fontSize="large" />
          </IconButton>
          <Button
            data-cy="save-btn"
            variant="contained"
            color="primary"
            disableElevation
            disabled={!curAnswer?.isEdited}
            onClick={recordState.saveAnswer}
          >
            Save
          </Button>
          {recordSession ? (
            recordState.answerIdx === recordState.answers.length - 1 ? (
              <Button
                data-cy="done-btn"
                variant="contained"
                color="primary"
                disableElevation
                onClick={() => switchAnswer(onEnd)}
                className={classes.nextBtn}
              >
                Review
              </Button>
            ) : (
              <IconButton
                data-cy="next-btn"
                className={classes.nextBtn}
                disabled={
                  recordState.answerIdx === recordState.answers.length - 1
                }
                onClick={() => switchAnswer(recordState.nextAnswer)}
              >
                <ArrowForwardIcon fontSize="large" />
              </IconButton>
            )
          ) : toRecordFollowUpQs ? (
            <Button
              data-cy="record-follow-up-qs-btn"
              variant="contained"
              color="primary"
              disableElevation
              onClick={() => {
                saveSubject(recordState.reloadMentorData);
              }} //window.location.reload();
              className={classes.nextBtn}
            >
              Record
            </Button>
          ) : (
            <Button
              data-cy="done-btn"
              variant="contained"
              color="primary"
              disableElevation
              onClick={() => switchAnswer(onBack)}
              className={classes.nextBtn}
            >
              Done
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <LoadingDialog title={recordState.isSaving ? "Saving..." : ""} />
      <ErrorDialog
        error={recordState.error}
        clearError={recordState.clearError}
      />
      <Dialog open={confirmLeave !== undefined}>
        <DialogContent>
          <DialogContentText>{confirmLeave?.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={confirm}>Yes</Button>
          <Button color="primary" onClick={() => setConfirmLeave(undefined)}>
            No
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default withAuthorizationOnly(withLocation(RecordPage));
