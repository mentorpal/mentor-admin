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

import { LoadingDialog, ErrorDialog } from "components/dialog";
import NavBar from "components/nav-bar";
import ProgressBar from "components/progress-bar";
import FollowUpQuestionsWidget from "components/record/follow-up-question-list";
import VideoPlayer from "components/record/video-player";
import UploadingWidget from "components/record/uploading-widget";
import { useWithRecordState } from "hooks/graphql/use-with-record-state";
import withAuthorizationOnly from "hooks/wrap-with-authorization-only";
import { ConfigStatus } from "store/slices/config";
import { useWithConfig } from "store/slices/config/useWithConfig";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import {
  AnswerAttentionNeeded,
  RecordPageState,
  MentorType,
  UtteranceName,
  Status,
} from "types";
import withLocation from "wrap-with-location";
import { useSubjectEdits } from "store/slices/subjects/useSubjectEdits";
import useSubjects from "store/slices/subjects/useSubjects";
import { getValueIfKeyExists } from "helpers";
import useQuestions from "store/slices/questions/useQuestions";

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

  const config = useWithConfig();
  const recordState = useWithRecordState(props.search);
  const { curAnswer, setRecordPageState, recordPageState, reloadMentorData } =
    recordState;
  const { addQuestion, removeQuestion, editedSubject, saveSubject } =
    useSubjectEdits(props.search.subject);
  const [toRecordFollowUpQs, setRecordFollowUpQs] = useState(false);
  const mentorId = useActiveMentor((state) => state.data?._id);
  const mentorType = useActiveMentor((state) => state.data?.mentorType);
  const mentorAnswers = useActiveMentor((state) => state.data?.answers);
  const questions = useQuestions(
    (state) => state.questions,
    mentorAnswers?.map((a) => a.question)
  );

  const curSubject = useSubjects(
    (s) => getValueIfKeyExists(props.search.subject || "", s.subjects),
    [props.search.subject || ""]
  );
  const subjectTitle = curSubject?.subject?.name || "";
  const categoryTitle =
    curSubject?.subject?.categories.find((c) => c.id == props.search.category)
      ?.name || "";
  const curAnswerBelongsToMentor =
    getValueIfKeyExists(curAnswer?.editedAnswer.question || "", questions)
      ?.question?.mentor === mentorId;
  const curEditedQuestion = curAnswer?.editedAnswer?.question;
  const warnEmptyTranscript =
    curAnswer?.attentionNeeded === AnswerAttentionNeeded.NEEDS_TRANSCRIPT;

  const isConfigLoaded = config.state.status === ConfigStatus.SUCCEEDED;

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

  function handleSaveSubject() {
    setRecordPageState(RecordPageState.RELOADING_MENTOR);
    saveSubject();
  }

  if (!mentorId || !curAnswer || !isConfigLoaded) {
    return (
      <div className={classes.root}>
        <NavBar title="Recording: " mentorId={undefined} />
        <LoadingDialog title={"Loading..."} />
        <ErrorDialog error={recordState.error} />
      </div>
    );
  }

  if (!config.state.config || config.state.status === ConfigStatus.FAILED) {
    return (
      <div>
        <NavBar title="Recording: " mentorId={undefined} />
        <Typography>Failed to load config</Typography>
        <Button color="primary" variant="contained" onClick={config.loadConfig}>
          Retry
        </Button>
      </div>
    );
  }

  if (
    recordPageState == RecordPageState.REVIEWING_FOLLOW_UPS &&
    recordState.followUpQuestions.length === 0
  ) {
    //default leave page method
    onBack();
  }

  const displayRecordingPage = !(
    recordPageState === RecordPageState.REVIEWING_FOLLOW_UPS ||
    recordPageState === RecordPageState.RELOADING_MENTOR
  );

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

      {displayRecordingPage ? (
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
          {mentorType === MentorType.VIDEO ? (
            <VideoPlayer
              classes={classes}
              recordState={recordState}
              videoRecorderMaxLength={
                config.state.config.videoRecorderMaxLength
              }
            />
          ) : undefined}
          <div data-cy="question" className={classes.block}>
            <Typography className={classes.title}>Question:</Typography>
            <FormControl className={classes.inputField} variant="outlined">
              <OutlinedInput
                data-cy="question-input"
                multiline
                value={
                  getValueIfKeyExists(curEditedQuestion || "", questions)
                    ?.question
                }
                disabled={!curAnswerBelongsToMentor}
                onChange={(e) => {
                  if (curEditedQuestion) {
                    recordState.editQuestion({
                      question: curEditedQuestion,
                    });
                  }
                }}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton
                      data-cy="undo-question-btn"
                      // disabled={
                      //   curEditedQuestion?.question ===
                      //   curAnswer?.answer.question?.question
                      // }
                      // onClick={() =>
                      //   recordState.editAnswer({
                      //     question: curAnswer?.answer.question,
                      //   })
                      // }
                    >
                      <UndoIcon />
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
          </div>
          {curAnswer?.minVideoLength &&
          getValueIfKeyExists(curEditedQuestion || "", questions)?.question
            ?.name === UtteranceName.IDLE ? (
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
              categoryId={props.search.category || ""}
              questions={recordState.followUpQuestions}
              mentorId={mentorId || ""}
              toRecordFollowUpQs={setRecordFollowUpQs}
              addQuestion={addQuestion}
              removeQuestion={removeQuestion}
              editedData={editedSubject}
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
          {displayRecordingPage ? (
            recordState.answerIdx === recordState.answers.length - 1 ? (
              <Button
                data-cy="done-btn"
                variant="contained"
                color="primary"
                disabled={
                  recordState.recordPageState ===
                  RecordPageState.FETCHING_FOLLOW_UPS
                }
                disableElevation
                onClick={() => switchAnswer(recordState.fetchFollowUpQs)}
                className={classes.nextBtn}
              >
                Next
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
              disabled={recordPageState === RecordPageState.RELOADING_MENTOR}
              onClick={() => handleSaveSubject()}
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
