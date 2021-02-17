/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useContext, useState } from "react";
import { useCookies } from "react-cookie";
import { ToastContainer, toast } from "react-toastify";
import ReactPlayer from "react-player";
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
import { fetchMentor, fetchSubject, updateAnswer } from "api";
import { Answer, Status, Mentor, Subject } from "types";
import Context from "context";
import NavBar from "components/nav-bar";
import ProgressBar from "components/progress-bar";
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
}));

function RecordPage(props: {
  search: {
    videoId?: string[] | string;
    subject?: string;
    status?: string;
    back?: string;
  };
}): JSX.Element {
  const classes = useStyles();
  const context = useContext(Context);
  const [cookies] = useCookies(["accessToken"]);
  const [mentor, setMentor] = useState<Mentor>();
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [answerInput, setAnswerInput] = useState("");
  const [videoInput, setVideoInput] = useState<any>();
  const [video, setVideo] = useState("");
  const [idx, setIdx] = useState(0);

  React.useEffect(() => {
    if (!cookies.accessToken) {
      navigate("/login");
    }
  }, [cookies]);

  React.useEffect(() => {
    loadMentor();
  }, [context.user]);

  React.useEffect(() => {
    loadAnswers();
  }, [mentor]);

  React.useEffect(() => {
    if (!answers || answers.length === 0) {
      return;
    }
    const answer = answers[idx];
    setVideoInput(null);
    setVideo(answer.video);
    setAnswerInput(answer.transcript);
  }, [answers, idx]);

  async function loadMentor() {
    if (!context.user) {
      return;
    }
    setMentor(await fetchMentor(cookies.accessToken));
  }

  async function loadAnswers() {
    if (!mentor) {
      return;
    }
    const { videoId, subject, status } = props.search;
    const _questions: Answer[] = [];
    if (videoId) {
      const ids = Array.isArray(videoId) ? videoId : [videoId];
      _questions.push(
        ...mentor.answers.filter((a) => ids.includes(a.question._id))
      );
    } else if (subject) {
      const s: Subject = await fetchSubject(subject);
      _questions.push(
        ...mentor.answers.filter(
          (a) =>
            s.questions.map((q) => q._id).includes(a.question._id) &&
            (!status || a.status === status)
        )
      );
    } else {
      _questions.push(
        ...mentor.answers.filter((a) => !status || a.status === status)
      );
    }
    setAnswers(_questions);
  }

  async function onUpdateAnswer(answer: Answer) {
    await updateAnswer(mentor!._id, answer, cookies.accessToken);
    loadMentor();
  }

  async function onUploadVideo() {
    toast("Uploading video...");
    //todo
    onUpdateAnswer({
      ...curAnswer!,
      video:
        "https://video.mentorpal.org/videos/mentors/clint/web/clintanderson_U1_1_1.mp4",
      transcript: "fake transcript",
    });
  }

  function onRerecord() {
    setVideo("");
  }

  function onBack() {
    if (props.search.back) {
      navigate(decodeURI(props.search.back));
    } else {
      navigate("/");
    }
  }

  function renderVideo(): JSX.Element {
    return (
      <div className={classes.block}>
        <ReactPlayer
          id="video-player"
          className={classes.video}
          url={video}
          controls={true}
          playing={true}
          playsinline
          webkit-playsinline="true"
        />
        <Button
          id="rerecord-btn"
          variant="contained"
          disableElevation
          onClick={onRerecord}
        >
          Re-Record
        </Button>
      </div>
    );
  }

  function renderVideoRecorder(): JSX.Element {
    return (
      <div className={classes.block}>
        <VideoRecorder
          isFlipped={false}
          showReplayControls
          onRecordingComplete={(v: any) => {
            setVideoInput(v);
          }}
        />
        {videoInput ? (
          <Button
            id="upload-btn"
            variant="contained"
            disableElevation
            onClick={onUploadVideo}
          >
            Upload
          </Button>
        ) : undefined}
      </div>
    );
  }

  if (!mentor || !answers || answers.length === 0) {
    return (
      <div>
        <NavBar title="Record Mentor" />
        <CircularProgress />
      </div>
    );
  }

  const curAnswer = answers[idx];
  return (
    <div className={classes.root}>
      <NavBar title="Record Mentor" back={true} onBack={onBack} />
      <div id="progress" className={classes.block}>
        <Typography
          variant="h6"
          className={classes.title}
          style={{ textAlign: "center" }}
        >
          Questions {idx + 1} / {answers.length}
        </Typography>
        <ProgressBar value={((idx + 1) / answers.length) * 100} />
      </div>
      {video ? renderVideo() : renderVideoRecorder()}
      <div id="question" className={classes.block}>
        <Typography className={classes.title}>Question:</Typography>
        <FormControl className={classes.inputField} variant="outlined">
          <OutlinedInput
            id="question-input"
            value={curAnswer.question.question}
            disabled={true}
          />
        </FormControl>
      </div>
      <div id="transcript" className={classes.block}>
        <Typography className={classes.title}>Answer Transcript:</Typography>
        <FormControl className={classes.inputField} variant="outlined">
          <OutlinedInput
            id="transcript-input"
            value={answerInput}
            onChange={(e) => {
              setAnswerInput(e.target.value);
            }}
            endAdornment={
              <InputAdornment position="end">
                <div>
                  <IconButton
                    id="undo-transcript-btn"
                    disabled={curAnswer.transcript === answerInput}
                    onClick={() => {
                      setAnswerInput(curAnswer.transcript);
                    }}
                  >
                    <UndoIcon />
                  </IconButton>
                  <Button
                    id="save-transcript-btn"
                    variant="contained"
                    color="primary"
                    disabled={curAnswer.transcript === answerInput}
                    onClick={() => {
                      onUpdateAnswer({
                        ...curAnswer,
                        transcript: answerInput,
                      });
                    }}
                    disableElevation
                  >
                    Save
                  </Button>
                </div>
              </InputAdornment>
            }
          />
        </FormControl>
      </div>
      <div id="status" className={classes.block}>
        <Typography className={classes.title}>Status:</Typography>
        <Select
          id="select-status"
          value={curAnswer.status.toString()}
          onChange={(
            event: React.ChangeEvent<{ value: unknown; name?: unknown }>
          ) => {
            onUpdateAnswer({
              ...curAnswer,
              status: event.target.value as Status,
            });
          }}
          style={{ marginLeft: 10 }}
        >
          <MenuItem id="incomplete" value={Status.INCOMPLETE}>
            {Status.INCOMPLETE}
          </MenuItem>
          <MenuItem id="complete" value={Status.COMPLETE}>
            {Status.COMPLETE}
          </MenuItem>
        </Select>
      </div>
      <div className={classes.toolbar} />
      <AppBar position="fixed" className={classes.footer}>
        <Toolbar>
          <IconButton
            id="back-btn"
            className={classes.backBtn}
            disabled={idx === 0}
            onClick={() => setIdx(idx - 1)}
          >
            <ArrowBackIcon fontSize="large" />
          </IconButton>
          {idx === answers.length - 1 ? (
            <Button
              id="done-btn"
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
              id="next-btn"
              className={classes.nextBtn}
              disabled={idx === answers.length - 1}
              onClick={() => setIdx(idx + 1)}
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

export default withLocation(RecordPage);
