/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useContext, useState } from "react";
import { useCookies } from "react-cookie";
import ReactPlayer from "react-player";
import { toast, ToastContainer } from "react-toastify";
import VideoRecorder from "react-video-recorder";
//import ReactVideoTrimmer from "react-video-trimmer";
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
import { CallMissedSharp } from "@material-ui/icons";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import UndoIcon from "@material-ui/icons/Undo";
import { fetchMentor, updateAnswer, updateQuestion } from "api";
import { Answer, Status, Mentor, MentorType } from "types";
import Context from "context";
import NavBar from "components/nav-bar";
import ProgressBar from "components/progress-bar";
import withLocation from "wrap-with-location";
import "react-toastify/dist/ReactToastify.css";
//import "react-video-trimmer/dist/style.css";

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
  recorder: { //1280 * 720 standard hd resolution 16*9
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 75,
    paddingRight: 75,
    alignSelf: "center",
    width: '90%',
    //height: 720,
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
    category?: string;
    back?: string;
  };
}): JSX.Element {
  const classes = useStyles();
  const context = useContext(Context);
  const [cookies] = useCookies(["accessToken"]);
  const [mentor, setMentor] = useState<Mentor>();
  const [answers, setAnswers] = useState<Answer[]>([]);

  const [idx, setIdx] = useState(0);
  const [curAnswer, setCurAnswer] = useState<Answer>();
  const [videoInput, setVideoInput] = useState<any>();
  const [recorderHeight, setRecorderHeight] = React.useState<number>(0);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const handleResize = () => setRecorderHeight(window.innerWidth * 0.8 / 16 * 9);
    window.addEventListener("resize", handleResize);
    setRecorderHeight(window.innerWidth * 0.8 / 16 * 9);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  React.useEffect(() => {
    if (!cookies.accessToken) {
      navigate("/login");
    }
  }, [cookies]);

  React.useEffect(() => {
    if (!context.user) {
      return;
    }
    fetchMentor(cookies.accessToken).then((m) => {
      setMentor(m);
      const { videoId, subject, category, status } = props.search;
      if (videoId) {
        const ids = Array.isArray(videoId) ? videoId : [videoId];
        setAnswers([...m.answers.filter((a) => ids.includes(a.question._id))]);
      } else if (subject) {
        const s = m.subjects.find((a) => a._id === subject);
        if (s) {
          const sQuestions = s.questions.filter(
            (q) => !category || `${q.category?.id}` === category
          );
          setAnswers([
            ...m.answers.filter(
              (a) =>
                sQuestions
                  .map((q) => q.question._id)
                  .includes(a.question._id) &&
                (!status || a.status === status)
            ),
          ]);
        }
      } else {
        setAnswers([
          ...m.answers.filter((a) => !status || a.status === status),
        ]);
      }
    });
  }, [context.user]);

  React.useEffect(() => {
    if (!mentor || !answers || answers.length === 0) {
      return;
    }
    setVideoInput(null);
    setCurAnswer(answers[idx]);
  }, [idx, answers]);

  function onBack() {
    if (props.search.back) {
      navigate(decodeURI(props.search.back));
    } else {
      navigate("/");
    }
  }

  async function onSave() {
    if (!curAnswer) {
      return;
    }
    let updated = false;
    if (
      JSON.stringify(curAnswer.question) !==
      JSON.stringify(answers[idx].question)
    ) {
      if (await updateQuestion(curAnswer.question, cookies.accessToken)) {
        answers[idx] = { ...answers[idx], question: curAnswer.question };
        updated = true;
      } else {
        toast("Failed to save question");
      }
    }
    if (JSON.stringify(curAnswer) !== JSON.stringify(answers[idx])) {
      if (await updateAnswer(mentor!._id, curAnswer, cookies.accessToken)) {
        answers[idx] = curAnswer;
        updated = true;
      } else {
        toast("Failed to save answer");
      }
    }
    if (updated) {
      setAnswers([...answers]);
    }
  }

  function renderVideo(): JSX.Element {
    if (!mentor || mentor.mentorType === MentorType.CHAT || !curAnswer) {
      return <div />;
    }
    const video = curAnswer.recordedAt
      ? `https://video.mentorpal.org/videos/mentors/${mentor._id}/web/${curAnswer._id}.mp4`
      : undefined;

    if (video) {
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
            onClick={() => setCurAnswer({ ...curAnswer, recordedAt: "" })}
          >
            Re-Record
          </Button>
        </div>
      );
    }
    return (
      <div className={classes.recorder} style={{ height: recorderHeight }} >
        <VideoRecorder
          isFlipped={false}
          showReplayControls
          onRecordingComplete={(v: any) => {
            setVideoInput(v);
          }}
        />
        
        {videoInput ? (
          <div>
            <Button id="upload-btn" variant="contained" disableElevation>
              Upload
          </Button>
            <Button id="trim-btn" variant="contained" disableElevation
              onClick={() => {
                trimVideo(videoInput);
              }}>
              Trim
          </Button>
          </div>
        ) : undefined}
      </div>
    );
  }

  function trimVideo(video): JSX.Element {
    return (
      <div className={classes.block}>
        {/* <ReactVideoTrimmer timeLimit={300} showEncodeBtn /> */}
      </div>
    );
  }

  if (!mentor || !answers || answers.length === 0 || !curAnswer) {
    return (
      <div>
        <NavBar title="Record Mentor" />
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <NavBar title="Record Mentor" />
      <div id="progress" className={classes.block}>
        <Typography
          variant="h6"
          className={classes.title}
          style={{ textAlign: "center" }}
        >
          Questions {idx + 1} / {answers.length}
        </Typography>
        <ProgressBar value={idx + 1} total={answers.length} />
      </div>
      {renderVideo()}
      {trimVideo()}
      <div id="question" className={classes.block}>
        <Typography className={classes.title}>Question:</Typography>
        <FormControl className={classes.inputField} variant="outlined">
          <OutlinedInput
            id="question-input"
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
                  id="undo-question-btn"
                  disabled={
                    curAnswer.question.question ===
                    answers[idx].question.question
                  }
                  onClick={() =>
                    setCurAnswer({
                      ...curAnswer,
                      question: answers[idx].question,
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
      <div id="transcript" className={classes.block}>
        <Typography className={classes.title}>Answer Transcript:</Typography>
        <FormControl className={classes.inputField} variant="outlined">
          <OutlinedInput
            id="transcript-input"
            multiline
            value={curAnswer.transcript}
            onChange={(e) =>
              setCurAnswer({ ...curAnswer, transcript: e.target.value })
            }
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  id="undo-transcript-btn"
                  disabled={curAnswer.transcript === answers[idx].transcript}
                  onClick={() =>
                    setCurAnswer({
                      ...curAnswer,
                      transcript: answers[idx].transcript,
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
      <div id="status" className={classes.block}>
        <Typography className={classes.title}>Status:</Typography>
        <Select
          id="select-status"
          value={curAnswer.status.toString()}
          onChange={(
            event: React.ChangeEvent<{ value: unknown; name?: unknown }>
          ) =>
            setCurAnswer({ ...curAnswer, status: event.target.value as Status })
          }
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
        <Toolbar
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <IconButton
            id="back-btn"
            className={classes.backBtn}
            disabled={idx === 0}
            onClick={() => setIdx(idx - 1)}
          >
            <ArrowBackIcon fontSize="large" />
          </IconButton>
          <Button
            id="done-btn"
            variant="contained"
            color="primary"
            disableElevation
            disabled={
              JSON.stringify(curAnswer) === JSON.stringify(answers[idx])
            }
            onClick={onSave}
          >
            Save
          </Button>
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
