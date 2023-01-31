/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { navigate } from "gatsby";
import React, { useEffect, useState } from "react";
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
  Theme,
  SelectChangeEvent,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import UndoIcon from "@mui/icons-material/Undo";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";

import {
  LoadingDialog,
  ErrorDialog,
  NotificationDialog,
} from "components/dialog";
import NavBar from "components/nav-bar";
import ProgressBar from "components/progress-bar";
import UploadingWidget from "components/record/uploading-widget";
import VideoPlayer from "components/record/video-player";
import { getValueIfKeyExists, sanitizeWysywigString } from "helpers";
import withAuthorizationOnly from "hooks/wrap-with-authorization-only";
import { ConfigStatus } from "store/slices/config";
import { useWithConfig } from "store/slices/config/useWithConfig";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import useQuestions from "store/slices/questions/useQuestions";
import {
  AnswerAttentionNeeded,
  MentorType,
  UtteranceName,
  Status,
  Subject,
  User,
} from "types";
import withLocation from "wrap-with-location";
import { useWithRecordState } from "hooks/graphql/use-with-record-state";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { mdToDraftjs, draftjsToMd } from "draftjs-md-converter";
import {
  EditorState,
  ContentState,
  convertToRaw,
  convertFromRaw,
} from "draft-js";
import { useWithBrowser } from "hooks/use-with-browser";

const useStyles = makeStyles((theme: Theme) => ({
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
    justifyContent: "space-between",
    padding: 0,
  },
  title: {
    fontWeight: "bold",
  },
  inputField: {
    width: "100%",
  },
  footer: {
    top: "auto",
    position: "fixed",
    bottom: 0,
    backgroundColor: "#eee",
    height: "fit-content",
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
  transcriptOverlay: {
    position: "absolute",
    width: "90%",
    height: "100%",
    top: 0,
    left: "5%",
    backgroundColor: "rgba(0,0,0,0.8)",
    zIndex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: "24px",
    cursor: "pointer",
  },
}));

const toolBarOpts = {
  options: ["inline", "list", "link", "history"],
  inline: {
    className: "toolbar-inline",
    options: ["bold", "italic"],
  },
  list: {
    className: "toolbar-list",
    options: ["unordered", "ordered"],
  },
  link: {
    className: "toolbar-link",
    inDropdown: true,
    showOpenOptionOnHover: true,
  },
  history: {
    className: "toolbar-history",
    options: ["undo", "redo"],
  },
};

export interface LeaveConfirmation {
  message: string;
  callback: () => void;
}

function RecordPage(props: {
  accessToken: string;
  user: User;
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
  const [stopRequests, setStopRequests] = useState<number>(0);
  const [editorState, setEditorState] = useState<EditorState>(
    EditorState.createWithContent(ContentState.createFromText(""))
  );
  const [isEditingQuestion, setIsEditingQuestion] = useState<boolean>(false);

  const recordState = useWithRecordState(props.accessToken, props.search);
  const { curAnswer, reloadMentorData, notifyDialogOpen, setNotifyDialogOpen } =
    recordState;
  const { state: configState, isConfigLoaded, loadConfig } = useWithConfig();
  const { getData, isLoading: isMentorLoading } = useActiveMentor();
  const { browserSupportsVbg } = useWithBrowser();

  const mentorId = getData((state) => state.data?._id);
  const mentorType = getData((state) => state.data?.mentorType);
  const hasVirtualBackground = getData(
    (state) => state.data?.hasVirtualBackground
  );
  const curQuestion = getValueIfKeyExists(
    curAnswer?.answer.question || "",
    useQuestions(
      (state) => state.questions,
      curAnswer?.answer.question ? [curAnswer.answer.question] : undefined
    )
  );
  const curSubject: Subject = getData((state) =>
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

  useEffect(() => {
    if (!curAnswer) {
      return;
    }
    let text = "";
    if (curAnswer.answer.markdownTranscript) {
      text = curAnswer.answer.markdownTranscript;
    } else {
      text = curAnswer.answer.transcript;
    }
    initializeEditorStateWithTranscript(text);
  }, [curAnswer?.answer]);

  useEffect(() => {
    setIsEditingQuestion(false);
  }, [recordState.answerIdx]);

  function initializeEditorStateWithTranscript(transcript: string): void {
    const rawData = mdToDraftjs(transcript);
    const contentState = convertFromRaw(rawData);
    const newEditorState = EditorState.createWithContent(contentState);
    setEditorState(newEditorState);
  }

  function getMarkdownFromEditor(contentState: ContentState): string {
    const markdown: string = draftjsToMd(convertToRaw(contentState), {
      BOLD: "**",
    });
    return markdown;
  }

  function updateTranscriptWithMarkdown(markdown: string): void {
    recordState.editAnswer(
      {
        transcript: markdown,
        markdownTranscript: markdown,
        hasEditedTranscript: markdown !== curAnswer?.answer.markdownTranscript,
      },
      {
        localTranscriptChanges:
          markdown !== curAnswer?.answer.markdownTranscript,
      }
    );
  }

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
        recordState.saveAnswer().then(() => {
          onNav();
        });
      } else {
        onNav();
      }
    }
  }

  function confirm() {
    if (!confirmLeave) {
      return;
    }
    if (curAnswer?.isEdited) {
      recordState.saveAnswer().then(() => {
        confirmLeave.callback();
        setConfirmLeave(undefined);
      });
    } else {
      confirmLeave.callback();
      setConfirmLeave(undefined);
    }
  }

  function transcriptDisplay() {
    if (!curAnswer) {
      return;
    }
    const { isRecording } = recordState;
    return (
      // relative so overlay can fit
      <div
        data-cy="transcript"
        className={classes.block}
        style={{ position: "relative" }}
      >
        {isRecording ? (
          <div
            data-cy="transcript-overlay"
            className={classes.transcriptOverlay}
            onClick={() => setStopRequests(stopRequests + 1)}
          >
            Click here or press spacebar to stop recording.
          </div>
        ) : undefined}
        <Typography className={classes.title}>
          Answer Transcript:{" "}
          {warnEmptyTranscript ? (
            <text
              data-cy="warn-empty-transcript"
              style={{ fontWeight: "normal" }}
            >
              No video transcript available. Would you like to manually enter a
              transcript?
            </text>
          ) : undefined}
        </Typography>
        <Editor
          wrapperClassName="wrapper-class"
          editorClassName="editor-class"
          toolbarClassName="toolbar-class"
          toolbar={toolBarOpts}
          onEditorStateChange={(editorState: EditorState) => {
            const contentState = editorState.getCurrentContent();
            const markdown = getMarkdownFromEditor(contentState);
            updateTranscriptWithMarkdown(sanitizeWysywigString(markdown));
            setEditorState(editorState);
          }}
          editorState={editorState}
        />
      </div>
    );
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
          onRecordPage={true}
          setUploadWidgetVisible={setUploadingWidgetVisible}
          recordState={recordState}
        />
      ) : undefined}
      <NavBar
        title={
          categoryTitle
            ? `Recording: ${subjectTitle} - ${categoryTitle}`
            : subjectTitle
            ? `Recording: ${subjectTitle}`
            : ""
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
            data-cy="heading"
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
        {hasVirtualBackground && !browserSupportsVbg() ? (
          <span
            style={{ color: "darkred", width: "80vw" }}
            data-cy="unsupported-browser-warning"
          >
            WARNING: You are trying to record using a virtual background in an
            unsupported browser. Please use Chrome, Edge, or Opera, or turn off
            virtual background use in setup.
          </span>
        ) : undefined}

        {mentorType === MentorType.VIDEO ? (
          <div
            data-cy="videoplayer-container"
            className={classes.block}
            style={{ height: "100%", position: "relative" }}
          >
            <VideoPlayer
              classes={classes}
              recordState={recordState}
              user={props.user}
              accessToken={props.accessToken}
              videoRecorderMaxLength={configState.config.videoRecorderMaxLength}
              stopRequests={stopRequests}
            />
          </div>
        ) : undefined}
        <div data-cy="question" className={classes.block}>
          <Typography className={classes.title}>Question:</Typography>
          {isEditingQuestion ? (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyItems: "center",
              }}
            >
              <FormControl className={classes.inputField} variant="outlined">
                <OutlinedInput
                  data-cy="question-input"
                  multiline
                  value={curEditedQuestion?.question}
                  style={{
                    color: curAnswerBelongsToMentor ? "black" : "#474747",
                  }}
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
                        style={{
                          visibility: curAnswerBelongsToMentor
                            ? "visible"
                            : "hidden",
                        }}
                        disabled={
                          curEditedQuestion?.question ===
                          curQuestion?.question?.question
                        }
                        onClick={() =>
                          recordState.editQuestion({
                            question: curQuestion?.question?.question,
                          })
                        }
                        size="large"
                      >
                        <UndoIcon />
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </FormControl>
              <IconButton
                data-cy="question-edit"
                onClick={() => setIsEditingQuestion(false)}
                size="large"
              >
                <CloseIcon />
              </IconButton>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Typography data-cy="question-text">
                {curEditedQuestion?.question}
              </Typography>
              {curAnswerBelongsToMentor ? (
                <IconButton
                  data-cy="question-edit"
                  onClick={() => setIsEditingQuestion(true)}
                  size="large"
                >
                  <EditIcon />
                </IconButton>
              ) : undefined}
            </div>
          )}
        </div>
        {curAnswer.minVideoLength &&
        curEditedQuestion?.name === UtteranceName.IDLE ? (
          <div data-cy="idle" className={classes.block}>
            <Typography className={classes.title}>Idle Duration:</Typography>
            <Select
              data-cy="idle-duration"
              value={curAnswer?.minVideoLength}
              onChange={(event: SelectChangeEvent<number>) =>
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
          transcriptDisplay()
        )}
        <div
          data-cy="status"
          className={classes.block}
          style={{ textAlign: "right" }}
        >
          <Typography className={classes.title}>Status:</Typography>
          <Select
            data-cy="select-status"
            value={curAnswer?.editedAnswer.status || Status.NONE}
            onChange={(event: SelectChangeEvent<Status>) =>
              recordState.editAnswer({ status: event.target.value as Status })
            }
            style={{ marginLeft: 10 }}
          >
            <MenuItem data-cy="none" value={Status.NONE}>
              None
            </MenuItem>
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
      <AppBar data-cy="app-bar-wrapper" className={classes.footer}>
        <Toolbar
          data-cy="tool-bar-wrapper"
          style={{
            position: "fixed",
            bottom: 0,
            backgroundColor: "#eee",
            height: "fit-content",
            width: "100%",
            padding: 0,
            margin: 0,
          }}
          className={classes.row}
        >
          <IconButton
            data-cy="back-btn"
            className={classes.backBtn}
            disabled={recordState.answerIdx === 0}
            onClick={() => switchAnswer(recordState.prevAnswer)}
            size="large"
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
              size="large"
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
      <NotificationDialog
        title={
          "Don't forget to trim your transcript to match the length of your trimmed video!"
        }
        open={notifyDialogOpen}
        closeDialog={() => setNotifyDialogOpen(false)}
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
