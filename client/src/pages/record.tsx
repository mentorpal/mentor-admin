/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { navigate } from "gatsby";
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import {
  AppBar,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
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

import {
  fetchMentor,
  fetchUploadVideoStatus,
  updateAnswer,
  updateQuestion,
  uploadVideo,
} from "api";
import { Answer, Status, MentorType, VideoState, Mentor } from "types";
import useInterval from "use-interval";
import NavBar from "components/nav-bar";
import ProgressBar from "components/progress-bar";
import VideoPlayer from "components/record/video-player";
import withAuthorizationOnly from "wrap-with-authorization-only";
import withLocation from "wrap-with-location";
import "react-toastify/dist/ReactToastify.css";

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

interface RecordState {
  answers: Answer[];
  curAnswerIx: number;
  curAnswer?: Answer;
  mentor?: {
    _id: string;
    mentorType: MentorType;
  };
}

function copyAndSet<T>(a: T[], i: number, item: T): T[] {
  return [...a.slice(0, i), item, ...a.slice(i + 1)];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function equals(val1: any, val2: any): boolean {
  return JSON.stringify(val1) === JSON.stringify(val2);
}

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
  const [recordState, setRecordState] = useState<RecordState>({
    answers: [],
    curAnswerIx: 0,
  });
  const { answers, curAnswer, curAnswerIx, mentor } = recordState;
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusUrl, setUploadStatusUrl] = React.useState("");
  const [loadingMessage, setLoadingMessage] = useState<string>();

  function setCurAnswer(curAnswer: Answer): void {
    setRecordState({
      ...recordState,
      curAnswer,
    });
  }

  function setCurAnswerIx(curAnswerIx: number) {
    setRecordState({
      ...recordState,
      curAnswerIx,
    });
  }

  React.useEffect(() => {
    let mounted = true;
    fetchMentor(props.accessToken)
      .then((m) => {
        if (!mounted) {
          return;
        }
        updateRecordState(m);
      })
      .catch((err) => console.error(err));
    return () => {
      mounted = false;
    };
  }, []);

  function updateRecordState(mentor: Mentor) {
    if (!mentor) {
      return;
    }
    const nextState: RecordState = {
      ...recordState,
      mentor: { _id: mentor._id, mentorType: mentor.mentorType },
    };
    const { videoId, subject, category, status } = props.search;
    if (videoId) {
      const ids = Array.isArray(videoId) ? videoId : [videoId];
      nextState.answers = [
        ...mentor.answers.filter((a) => ids.includes(a.question._id)),
      ];
    } else if (subject) {
      const s = mentor.subjects.find((a) => a._id === subject);
      if (s) {
        const sQuestions = s.questions.filter(
          (q) => !category || `${q.category?.id}` === category
        );
        nextState.answers = [
          ...mentor.answers.filter(
            (a) =>
              sQuestions.map((q) => q.question._id).includes(a.question._id) &&
              (!status || a.status === status)
          ),
        ];
      }
    } else {
      nextState.answers = [
        ...mentor.answers.filter((a) => !status || a.status === status),
      ];
    }
    setRecordState(nextState);
  }

  React.useEffect(() => {
    if (answers.length === 0 || curAnswerIx >= answers.length) {
      return;
    }
    setRecordState({
      ...recordState,
      curAnswer: answers[curAnswerIx],
    });
  }, [curAnswerIx, answers]);

  function onBack() {
    if (props.search.back) {
      navigate(decodeURI(props.search.back));
    } else {
      navigate("/");
    }
  }

  function onUploadVideo(video: File) {
    if (!mentor || !curAnswer) {
      return;
    }
    setLoadingMessage("Uploading video...");
    uploadVideo(mentor._id, curAnswer.question._id, video)
      .then((job) => {
        setUploadStatusUrl(job.statusUrl);
        setIsUploading(true);
      })
      .catch((err) => {
        toast(`Upload failed`);
        console.error(err);
        setLoadingMessage(undefined);
        setIsUploading(false);
      });
  }

  function onTrimVideo(video: File, startTime: number, endTime: number) {
    if (!mentor || !curAnswer) {
      return;
    }
    setLoadingMessage("Trimming video...");
    const trim = { start: startTime, end: endTime };
    uploadVideo(mentor._id, curAnswer.question._id, video, trim)
      .then((job) => {
        setUploadStatusUrl(job.statusUrl);
        setIsUploading(true);
      })
      .catch((err) => {
        toast(`Trim failed`);
        console.error(err);
        setLoadingMessage(undefined);
        setIsUploading(false);
      });
  }

  function onRerecordVideo() {
    if (!curAnswer) {
      return;
    }
    setCurAnswer({ ...curAnswer, recordedAt: "" });
  }

  useInterval(
    (isCancelled) => {
      fetchUploadVideoStatus(uploadStatusUrl)
        .then((videoStatus) => {
          if (isCancelled()) {
            return;
          }
          if (videoStatus.state === VideoState.FAILURE) {
            toast(`Upload failed`);
            setIsUploading(false);
            setLoadingMessage(undefined);
          }
          if (videoStatus.state === VideoState.SUCCESS) {
            toast(`Uploaded video!`);
            setIsUploading(false);
            setLoadingMessage(undefined);
            fetchMentor(props.accessToken)
              .then((m) => {
                if (isCancelled()) {
                  return;
                }
                updateRecordState(m);
              })
              .catch((err) => console.error(err));
          }
        })
        .catch((err) => {
          toast(`Upload failed`);
          console.error(err);
          setIsUploading(false);
          setLoadingMessage(undefined);
        });
    },
    isUploading ? 1000 : null
  );

  function saveAnswer(mentorId: string, answer: Answer, aIdx: number) {
    updateAnswer(mentorId, answer, props.accessToken)
      .then((didUpdate) => {
        // don't update if state has changed since calling update?
        if (!didUpdate || curAnswerIx !== aIdx || !equals(curAnswer, answer)) {
          return;
        }
        setRecordState({
          ...recordState,
          answers: copyAndSet(answers, aIdx, answer),
          curAnswer: answer,
        });
      })
      .catch((err) => {
        console.error(err);
        toast("Failed to save answer");
      });
  }

  function onSave() {
    if (!(curAnswer && mentor)) {
      return;
    }
    let answer = curAnswer;
    const question = curAnswer.question;
    const aIdx = curAnswerIx;
    // update the question
    if (!equals(question, answers[aIdx].question)) {
      updateQuestion(question, props.accessToken)
        .then((didUpdate) => {
          // don't update if state has changed since calling update?
          if (
            !didUpdate ||
            curAnswerIx !== aIdx ||
            !equals(curAnswer, answer)
          ) {
            return;
          }
          answer = {
            ...answers[aIdx],
            question: question,
          };
          if (!equals(answer, answers[aIdx])) {
            saveAnswer(mentor._id, answer, aIdx);
          } else {
            setRecordState({
              ...recordState,
              answers: copyAndSet(answers, aIdx, answer),
              curAnswer: answer,
            });
          }
        })
        .catch((err) => {
          console.error(err);
          toast("Failed to save question");
        });
    }
    // update the answer
    else if (!equals(answer, answers[curAnswerIx])) {
      saveAnswer(mentor._id, answer, aIdx);
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
          Questions {curAnswerIx + 1} / {answers.length}
        </Typography>
        <ProgressBar value={curAnswerIx + 1} total={answers.length} />
      </div>
      <VideoPlayer
        classes={classes}
        mentorId={mentor._id}
        mentorType={mentor.mentorType}
        curAnswer={curAnswer}
        onUpload={onUploadVideo}
        onRerecord={onRerecordVideo}
        onTrim={onTrimVideo}
        isUploading={isUploading}
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
              setCurAnswer({
                ...curAnswer,
                question: { ...curAnswer.question, question: e.target.value },
              })
            }
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  data-cy="undo-question-btn"
                  disabled={
                    curAnswer.question?.question ===
                    answers[curAnswerIx].question?.question
                  }
                  onClick={() =>
                    setCurAnswer({
                      ...curAnswer,
                      question: answers[curAnswerIx].question,
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
      <div data-cy="transcript" className={classes.block}>
        <Typography className={classes.title}>Answer Transcript:</Typography>
        <FormControl className={classes.inputField} variant="outlined">
          <OutlinedInput
            data-cy="transcript-input"
            multiline
            value={curAnswer.transcript}
            onChange={(e) =>
              setCurAnswer({ ...curAnswer, transcript: e.target.value })
            }
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  data-cy="undo-transcript-btn"
                  disabled={
                    curAnswer.transcript === answers[curAnswerIx].transcript
                  }
                  onClick={() =>
                    setCurAnswer({
                      ...curAnswer,
                      transcript: answers[curAnswerIx].transcript,
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
      <div data-cy="status" className={classes.block}>
        <Typography className={classes.title}>Status:</Typography>
        <Select
          data-cy="select-status"
          value={curAnswer.status.toString()}
          onChange={(
            event: React.ChangeEvent<{ value: unknown; name?: unknown }>
          ) =>
            setCurAnswer({ ...curAnswer, status: event.target.value as Status })
          }
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
            disabled={curAnswerIx === 0}
            onClick={() => setCurAnswerIx(curAnswerIx - 1)}
          >
            <ArrowBackIcon fontSize="large" />
          </IconButton>
          <Button
            data-cy="save-btn"
            variant="contained"
            color="primary"
            disableElevation
            disabled={equals(curAnswer, answers[curAnswerIx])}
            onClick={onSave}
          >
            Save
          </Button>
          {curAnswerIx === answers.length - 1 ? (
            <Button
              data-cy="done-btn"
              className={classes.nextBtn}
              variant="contained"
              color="primary"
              disableElevation
              onClick={onBack}
            >
              Done
            </Button>
          ) : (
            <IconButton
              data-cy="next-btn"
              className={classes.nextBtn}
              disabled={curAnswerIx === answers.length - 1}
              onClick={() => setCurAnswerIx(curAnswerIx + 1)}
            >
              <ArrowForwardIcon fontSize="large" />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>
      <Dialog open={Boolean(loadingMessage)}>
        <DialogTitle>{loadingMessage}</DialogTitle>
        <DialogContent>
          <CircularProgress />
        </DialogContent>
      </Dialog>
      <ToastContainer />
    </div>
  );
}

export default withAuthorizationOnly(withLocation(RecordPage));
