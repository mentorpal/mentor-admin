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
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import DeleteIcon from "@material-ui/icons/Delete";
import UndoIcon from "@material-ui/icons/Undo";
import Autocomplete from "@material-ui/lab/Autocomplete";
import {
  fetchMentor,
  fetchTopics,
  updateQuestion,
  uploadVideo,
  generateTranscript,
} from "api";
import { Question, Status, Mentor, Topic, Edge } from "types";
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
  topicItem: {
    border: 1,
    borderRadius: 5,
    width: "auto",
    backgroundColor: "#eee",
    margin: 5,
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
    topic?: string;
    status?: string;
    back?: string;
  };
}): JSX.Element {
  const classes = useStyles();
  const context = useContext(Context);
  const [cookies] = useCookies(["accessToken"]);
  const [mentor, setMentor] = useState<Mentor>();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionInput, setQuestionInput] = useState("");
  const [transcriptInput, setTranscriptInput] = useState("");
  const [topicInput, setTopicInput] = useState("");
  const [videoInput, setVideoInput] = useState<any>();
  const [video, setVideo] = useState("");
  const [idx, setIdx] = useState(0);
  const [allTopics, setAllTopics] = useState<Topic[]>([]);

  React.useEffect(() => {
    if (!cookies.accessToken) {
      navigate("/login");
    }
  }, [cookies]);

  React.useEffect(() => {
    const load = async () => {
      if (!context.user) {
        return;
      }
      const topics = await fetchTopics(cookies.accessToken, { sortBy: "name" });
      setAllTopics(topics.edges.map((e: Edge<Topic>) => e.node));
      const mentor = await fetchMentor(context.user._id, cookies.accessToken);
      const { videoId, subject, topic, status } = props.search;
      const _questions: Question[] = [];
      if (videoId) {
        const ids = Array.isArray(videoId) ? videoId : [videoId];
        _questions.push(...mentor.questions.filter((q) => ids.includes(q.id)));
      } else if (subject) {
        _questions.push(
          ...mentor.questions.filter(
            (q) =>
              q.subject !== undefined &&
              q.subject._id === subject &&
              (!status || q.status === status)
          )
        );
      } else if (topic) {
        _questions.push(
          ...mentor.questions.filter(
            (q) =>
              q.topics.map((t) => t._id).includes(topic) &&
              (!status || q.status === status)
          )
        );
      } else {
        _questions.push(
          ...mentor.questions.filter((q) =>
            status ? q.status === status : true
          )
        );
      }
      setMentor(mentor);
      setQuestions(_questions);
    };
    load();
  }, [context.user]);

  React.useEffect(() => {
    if (!questions || questions.length === 0) {
      return;
    }
    const question = questions[idx];
    setVideoInput(null);
    setVideo(question.video);
    setQuestionInput(question.question);
    setTranscriptInput(question.transcript);
  }, [questions, idx]);

  async function onUpdateQuestion(question: Question) {
    const updatedMentor = await updateQuestion(
      context.user!._id,
      question,
      cookies.accessToken
    );
    const updatedQuestions = questions;
    questions.splice(idx, 1, question);
    setMentor({ ...updatedMentor });
    setQuestions([...updatedQuestions]);
  }

  async function onUploadVideo() {
    toast("Uploading video...");
    const videoId = questions[idx].id;
    const updatedMentor = await uploadVideo(
      context.user!._id,
      videoId,
      videoInput,
      cookies.accessToken
    );
    const question = updatedMentor.questions.find((q) => q.id === videoId);
    if (!question) {
      toast("Failed to upload video");
      return;
    }
    setMentor({ ...updatedMentor });
    onUpdateQuestion(question);
    toast("Transcribing video...");
    const transcript = await generateTranscript(
      context.user!._id,
      question.id,
      cookies.accessToken
    );
    onUpdateQuestion({ ...question!, transcript: transcript });
  }

  function onRerecord() {
    setVideo("");
  }

  function deleteTopic(i: number) {
    const question = questions[idx];
    question.topics.splice(i, 1);
    onUpdateQuestion(question);
  }

  function addTopic() {
    const existingTopic = allTopics.find((t) => t.name === topicInput);
    if (existingTopic) {
      question.topics.push(existingTopic);
    } else {
      question.topics.push({
        _id: topicInput.toLowerCase().replace(" ", ""),
        name: topicInput,
        description: "",
      });
    }
    onUpdateQuestion(question);
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

  if (!mentor || !questions || questions.length === 0) {
    return (
      <div>
        <NavBar title="Record Mentor" />
        <CircularProgress />
      </div>
    );
  }

  const question = questions[idx];
  return (
    <div className={classes.root}>
      <NavBar title="Record Mentor" back={true} onBack={onBack} />
      <div id="progress" className={classes.block}>
        <Typography
          variant="h6"
          className={classes.title}
          style={{ textAlign: "center" }}
        >
          Questions {idx + 1} / {questions.length}
        </Typography>
        <ProgressBar value={((idx + 1) / questions.length) * 100} />
      </div>
      {video ? renderVideo() : renderVideoRecorder()}
      <div id="question" className={classes.block}>
        <Typography className={classes.title}>Question:</Typography>
        <FormControl className={classes.inputField} variant="outlined">
          <OutlinedInput
            id="question-input"
            value={questionInput}
            disabled={question.subject !== undefined}
            onChange={(e) => {
              setQuestionInput(e.target.value);
            }}
            endAdornment={
              <InputAdornment position="end">
                <div>
                  <IconButton
                    id="undo-question-btn"
                    disabled={question.question === questionInput}
                    onClick={() => {
                      setQuestionInput(question.question);
                    }}
                  >
                    <UndoIcon />
                  </IconButton>
                  <Button
                    id="save-question-btn"
                    variant="contained"
                    color="primary"
                    disabled={question.question === questionInput}
                    onClick={() => {
                      onUpdateQuestion({
                        ...questions[idx],
                        question: questionInput,
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
      <div id="transcript" className={classes.block}>
        <Typography className={classes.title}>Answer Transcript:</Typography>
        <FormControl className={classes.inputField} variant="outlined">
          <OutlinedInput
            id="transcript-input"
            value={transcriptInput}
            onChange={(e) => {
              setTranscriptInput(e.target.value);
            }}
            endAdornment={
              <InputAdornment position="end">
                <div>
                  <IconButton
                    id="undo-transcript-btn"
                    disabled={question.transcript === transcriptInput}
                    onClick={() => {
                      setTranscriptInput(question.transcript);
                    }}
                  >
                    <UndoIcon />
                  </IconButton>
                  <Button
                    id="save-transcript-btn"
                    variant="contained"
                    color="primary"
                    disabled={question.transcript === transcriptInput}
                    onClick={() => {
                      onUpdateQuestion({
                        ...questions[idx],
                        transcript: transcriptInput,
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
      <div className={classes.block}>
        <Grid container spacing={1}>
          <Grid item xs={12} sm={12} md={8} lg={6}>
            <div className={classes.row}>
              <Typography className={classes.title}>Topics:</Typography>
              <Autocomplete
                id="topic-input"
                freeSolo
                options={allTopics.map((t) => t.name)}
                onChange={(e, v) => {
                  setTopicInput(v || "");
                }}
                style={{ marginLeft: 15, marginRight: 15 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    margin="normal"
                    variant="outlined"
                    style={{ marginLeft: 15, width: 300 }}
                    onChange={(ev) => {
                      setTopicInput(ev.target.value);
                    }}
                  />
                )}
              />
              <Button
                id="add-topic-btn"
                variant="contained"
                onClick={addTopic}
                disabled={topicInput === ""}
                disableElevation
              >
                Add
              </Button>
            </div>
          </Grid>
          <Grid
            id="status"
            item
            xs={12}
            sm={12}
            md={4}
            lg={6}
            className={classes.row}
          >
            <Typography className={classes.title}>Status:</Typography>
            <Select
              id="select-status"
              value={question.status.toString()}
              onChange={(
                event: React.ChangeEvent<{ value: unknown; name?: unknown }>
              ) => {
                onUpdateQuestion({
                  ...question,
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
          </Grid>
        </Grid>
        <List
          id="topics"
          className={classes.row}
          style={{ overflow: "auto", whiteSpace: "nowrap" }}
        >
          {question.topics.map((t, i) => (
            <ListItem
              id={`topic-${i}`}
              key={`topic-${i}`}
              className={classes.topicItem}
            >
              <ListItemText primary={t.name} />
              <ListItemSecondaryAction>
                <IconButton
                  id="delete-topic-btn"
                  edge="end"
                  onClick={() => {
                    deleteTopic(i);
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
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
          {idx === questions.length - 1 ? (
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
              disabled={idx === questions.length - 1}
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
