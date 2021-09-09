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

import { LoadingDialog, ErrorDialog } from "components/dialog";
import NavBar from "components/nav-bar";
import ProgressBar from "components/progress-bar";
import UploadingWidget from "components/record/uploading-widget";
import VideoPlayer from "components/record/video-player";
import { getValueIfKeyExists, onTextInputChanged } from "helpers";
import withAuthorizationOnly from "hooks/wrap-with-authorization-only";
import { ConfigStatus } from "store/slices/config";
import { useWithConfig } from "store/slices/config/useWithConfig";
import useActiveMentor, {
  isActiveMentorLoading,
} from "store/slices/mentor/useActiveMentor";
import useQuestions from "store/slices/questions/useQuestions";
import {
  AnswerAttentionNeeded,
  MentorType,
  UtteranceName,
  Status,
} from "types";
import withLocation from "wrap-with-location";
import { useWithRecordState } from "hooks/graphql/use-with-record-state";

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
  const { curAnswer, reloadMentorData } = recordState;
  const { state: configState, isConfigLoaded, loadConfig } = useWithConfig();
  const mentorId = useActiveMentor((state) => state.data?._id);
  const mentorType = useActiveMentor((state) => state.data?.mentorType);
  const curQuestion = getValueIfKeyExists(
    curAnswer?.answer.question || "",
    useQuestions(
      (state) => state.questions,
      curAnswer?.answer.question ? [curAnswer.answer.question] : undefined
    )
  );
  const curSubject = useActiveMentor((state) =>
    state.data?.subjects.find((s) => s._id == props.search.subject)
  );
  const subjectTitle = curSubject?.name || "";
  const curCategory = curSubject?.categories.find(
    (c) => c.id == props.search.category
  );
  const categoryTitle = curCategory?.name || "";
  const curEditedQuestion = curAnswer?.editedQuestion;
  const curAnswerBelongsToMentor = curEditedQuestion?.mentor === mentorId;
  const warnEmptyTranscript =
    curAnswer?.attentionNeeded === AnswerAttentionNeeded.NEEDS_TRANSCRIPT;
  const isMentorLoading = isActiveMentorLoading();

  function onBack() {
    reloadMentorData();
    if (props.search.back) {
      navigate(decodeURI(props.search.back));
    } else {
      navigate("/");
    }
  }

  function switchAnswer(onNav: () => void) {
    if (curAnswer?.recordedVideo && !curAnswer?.isUploading) {
      setConfirmLeave({
        message:
          "You have not uploaded your recorded video yet. Would you like to move on anyway?",
        callback: onNav,
      });
    } else {
      if (curAnswer?.isEdited) {
        recordState.saveAnswer();
      }
      onNav();
    }
  }

  function confirm() {
    if (!confirmLeave) {
      return;
    }
    if (curAnswer?.isEdited) {
      recordState.saveAnswer();
    }
    confirmLeave.callback();
    setConfirmLeave(undefined);
  }

  if (!mentorId || !curAnswer || !isConfigLoaded() || isMentorLoading) {
    return (
      <div className={classes.root}>
        <NavBar title="Recording: " mentorId={undefined} />
        <LoadingDialog title={"Loading..."} />
        <ErrorDialog error={recordState.error} />
      </div>
    );
  }

  if (!configState.config || configState.status === ConfigStatus.FAILED) {
    return (
      <div>
        <NavBar title="Recording: " mentorId={undefined} />
        <Typography>Failed to load config</Typography>
        <Button color="primary" variant="contained" onClick={loadConfig}>
          Retry
        </Button>
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
        title={
          categoryTitle
            ? `Recording: ${subjectTitle} - ${categoryTitle}`
            : `Recording: ${subjectTitle}`
        }
        mentorId={mentorId}
        uploads={recordState.uploads}
        uploadsButtonVisible={uploadingWidgetVisible}
        toggleUploadsButtonVisibility={setUploadingWidgetVisible}
        onBack={() => switchAnswer(onBack)}
      />

      <div>
        <div data-cy="progress" className={classes.block}>
          <Typography
            variant="h6"
            className={classes.title}
            style={{ textAlign: "center" }}
          >
            Questions {recordState.answerIdx + 1} / {recordState.answers.length}
          </Typography>
          <ProgressBar
            value={recordState.answerIdx + 1}
            total={recordState.answers.length}
          />
        </div>
        {mentorType === MentorType.VIDEO ? (
          <VideoPlayer
            classes={classes}
            recordState={recordState}
            videoRecorderMaxLength={configState.config.videoRecorderMaxLength}
          />
        ) : undefined}
        <div data-cy="question" className={classes.block}>
          <Typography className={classes.title}>Question:</Typography>
          <FormControl className={classes.inputField} variant="outlined">
            <OutlinedInput
              data-cy="question-input"
              multiline
              value={curEditedQuestion?.question}
              disabled={!curAnswerBelongsToMentor}
              onChange={(e) => {
                if (curEditedQuestion) {
                  const caret = e?.target.selectionStart;
                  const element = e.target;
                  window.requestAnimationFrame(() => {
                    element.selectionStart = caret;
                    element.selectionEnd = caret;
                  });
                  recordState.editQuestion({
                    ...curEditedQuestion,
                    question: e.target.value,
                  });
                }
              }}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    data-cy="undo-question-btn"
                    disabled={
                      curEditedQuestion?.question ===
                      curQuestion?.question?.question
                    }
                    onClick={() =>
                      recordState.editQuestion({
                        question: curQuestion?.question?.question,
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
        curEditedQuestion?.name === UtteranceName.IDLE ? (
          <div data-cy="idle" className={classes.block}>
            <Typography className={classes.title}>Idle Duration:</Typography>
            <Select
              data-cy="idle-duration"
              value={curAnswer?.minVideoLength}
              onChange={(
                event: React.ChangeEvent<{ value: unknown; name?: unknown }>
              ) => recordState.setMinVideoLength(event.target.value as number)}
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
              Answer Transcript:{" "}
              {warnEmptyTranscript ? (
                <text
                  data-cy="warn-empty-transcript"
                  style={{ fontWeight: "normal" }}
                >
                  No video transcript available. Would you like to manually
                  enter a transcript?
                </text>
              ) : undefined}
            </Typography>
            <FormControl className={classes.inputField} variant="outlined">
              <OutlinedInput
                data-cy="transcript-input"
                multiline
                value={curAnswer?.editedAnswer.transcript}
                onChange={(e) =>
                  onTextInputChanged(e, () => {
                    recordState.editAnswer({ transcript: e.target.value });
                  })
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
          {recordState.answerIdx !== recordState.answers.length - 1 ? (
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
          ) : curSubject && curCategory ? (
            <Button
              data-cy="done-btn"
              variant="contained"
              color="primary"
              disableElevation
              className={classes.nextBtn}
              onClick={() =>
                switchAnswer(() => {
                  navigate(
                    `/followups?category=${curCategory.id}&subject=${curSubject._id}`
                  );
                })
              }
            >
              Next
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
      <ErrorDialog error={recordState.error} />
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
