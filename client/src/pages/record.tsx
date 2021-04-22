/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { FunctionComponent, useState } from "react";
import ReactPlayer from "react-player";
import { toast, ToastContainer } from "react-toastify";
import VideoRecorder from "react-video-recorder";
import { navigate } from "gatsby";
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

import { fetchMentor, updateAnswer, updateQuestion } from "api";
import { Answer, Status, MentorType } from "types";
import NavBar from "components/nav-bar";
import ProgressBar from "components/progress-bar";
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
  recorder: {
    // 1280 * 720 standard hd resolution 16*9
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 75,
    paddingRight: 75,
    alignSelf: "center",
  },
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  video: {
    position: "relative",
    margin: "0 auto",
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  videoInput?: any;
}

function copyAndSet<T>(a: T[], i: number, item: T): T[] {
  return [...a.slice(0, i), item, ...a.slice(i + 1)];
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
  const [recorderHeight, setRecorderHeight] = React.useState<number>(0);
  const { answers, curAnswer, curAnswerIx, mentor, videoInput } = recordState;

  function setCurAnswer(a: Answer): void {
    setRecordState({
      ...recordState,
      curAnswer: a,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function setVideoInput(v: any): void {
    setRecordState({
      ...recordState,
      videoInput: v,
    });
  }

  function setCurAnswerIx(i: number) {
    setRecordState({
      ...recordState,
      curAnswerIx: i,
    });
  }
  React.useEffect(() => {
    if (typeof window === "undefined") {
      return () => {};
    }
    const handleResize = () => setRecorderHeight(window.innerHeight * 0.75);
    window.addEventListener("resize", handleResize);
    setRecorderHeight(window.innerHeight * 0.75);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  React.useEffect(() => {
    let mounted = true;
    fetchMentor(props.accessToken)
      .then((m) => {
        if (!mounted) {
          return;
        }
        const nextState: RecordState = {
          ...recordState,
          mentor: { _id: m._id, mentorType: m.mentorType },
        };
        const { videoId, subject, category, status } = props.search;
        if (videoId) {
          const ids = Array.isArray(videoId) ? videoId : [videoId];
          nextState.answers = [
            ...m.answers.filter((a) => ids.includes(a.question._id)),
          ];
        } else if (subject) {
          const s = m.subjects.find((a) => a._id === subject);
          if (s) {
            const sQuestions = s.questions.filter(
              (q) => !category || `${q.category?.id}` === category
            );
            nextState.answers = [
              ...m.answers.filter(
                (a) =>
                  sQuestions
                    .map((q) => q.question._id)
                    .includes(a.question._id) &&
                  (!status || a.status === status)
              ),
            ];
          }
        } else {
          nextState.answers = [
            ...m.answers.filter((a) => !status || a.status === status),
          ];
        }
        setRecordState(nextState);
      })
      .catch((err) => console.error(err));
    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    if (!answers || answers.length === 0) {
      return;
    }
    setRecordState({
      ...recordState,
      curAnswer: answers[curAnswerIx],
      videoInput: null,
    });
  }, [curAnswerIx, answers]);

  function onBack() {
    if (props.search.back) {
      navigate(decodeURI(props.search.back));
    } else {
      navigate("/");
    }
  }

  async function onSave() {
    if (!(curAnswer && mentor)) {
      return;
    }
    let answerUpdated: Answer | null = null;
    if (
      JSON.stringify(curAnswer.question) !==
      JSON.stringify(answers[curAnswerIx].question)
    ) {
      if (await updateQuestion(curAnswer.question, props.accessToken)) {
        answerUpdated = {
          ...answers[curAnswerIx],
          question: curAnswer.question,
        };
      } else {
        toast("Failed to save question");
      }
    }
    const answerWorking = answerUpdated || curAnswer;
    if (
      JSON.stringify(answerWorking) !== JSON.stringify(answers[curAnswerIx])
    ) {
      if (await updateAnswer(mentor._id, answerWorking, props.accessToken)) {
        answerUpdated = answerWorking;
      } else {
        toast("Failed to save answer");
      }
    }
    if (answerUpdated) {
      setRecordState({
        ...recordState,
        answers: copyAndSet(answers, curAnswerIx, answerUpdated),
        curAnswer: answerWorking,
      });
    }
  }

  function renderVideo(): JSX.Element {
    if (!mentor || mentor.mentorType === MentorType.CHAT || !curAnswer) {
      return <div />;
    }
    // TODO: hard-coded video host MUST be removed!
    const video = curAnswer.recordedAt
      ? `https://video.mentorpal.org/videos/mentors/${mentor._id}/web/${curAnswer._id}.mp4`
      : undefined;

    if (video) {
      return (
        <div className={classes.block}>
          <ReactPlayer
            data-cy="video-player"
            className={classes.video}
            url={video}
            controls
            playing
            playsinline
            webkit-playsinline="true"
          />
          <Button
            data-cy="rerecord-btn"
            variant="contained"
            disableElevation
            onClick={() => setCurAnswer({ ...curAnswer, recordedAt: "" })}
          >
            Re-Record
          </Button>
        </div>
      );
    }
    return (
      <div
        data-cy="video-recorder"
        className={classes.recorder}
        style={{ height: recorderHeight, width: (recorderHeight / 9) * 16 }}
      >
        <VideoRecorder
          isFlipped={false}
          showReplayControls
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onRecordingComplete={(v: any) => {
            setVideoInput(v);
          }}
        />

        {videoInput ? (
          <div>
            <Button data-cy="upload-btn" variant="contained" disableElevation>
              Upload
            </Button>
          </div>
        ) : undefined}
      </div>
    );
  }

  if (!mentor || !answers || answers.length === 0 || !curAnswer) {
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
      {renderVideo()}
      <div data-cy="question" className={classes.block}>
        <Typography className={classes.title}>Question:</Typography>
        <FormControl className={classes.inputField} variant="outlined">
          <OutlinedInput
            data-cy="question-input"
            multiline
            value={curAnswer.question.question}
            disabled={curAnswer.question.mentor !== mentor._id}
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
                    curAnswer.question.question ===
                    answers[curAnswerIx].question.question
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
        <Toolbar
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
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
            disabled={
              JSON.stringify(curAnswer) === JSON.stringify(answers[curAnswerIx])
            }
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
      <ToastContainer />
    </div>
  );
}

export default withAuthorizationOnly(
  withLocation(RecordPage as FunctionComponent)
);
