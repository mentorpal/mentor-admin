import React, { useContext, useState } from "react";
import { useCookies } from "react-cookie";
import VideoRecorder from "react-video-recorder";
import { navigate } from "gatsby";
import {
  Button,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
  TextField,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import { updateQuestion, generateTranscript } from "api";
import { Question, Status, } from "types";
import Context from "context";
import NavBar from "components/nav-bar";
import ProgressBar from "components/progress-bar";
import withLocation from "wrap-with-location";
import "react-toastify/dist/ReactToastify.css";

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  title: {
    fontWeight: "bold",
  },
  error: {
    color: "red",
  },
  block: {
    padding: 15,
    textAlign: "left"
  },
  inputField: {
    width: "100%",
  },
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center"
  },
  topicItem: {
    border: 1,
    borderRadius: 5,
    width: "auto",
    backgroundColor: "#eee"
  },
  footer: {
    display: 'flex',
    flexDirection: 'row',
    position: 'fixed',
    width: '100%',
    left: 0,
    bottom: 0,
  }
}));

function RecordPage(props: {
  search: {
    videoId?: string[] | string,
    utterance?: string,
    topic?: string,
    status?: string,
    i?: string,
  }
}): JSX.Element {
  const classes = useStyles();
  const context = useContext(Context);
  const [cookies] = useCookies(["accessToken"]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [curIdx, setCurIdx] = useState(0);
  const { videoId, utterance, topic, status, i } = props.search;

  React.useEffect(() => {
    setCurIdx(parseInt(i ? i : "0"));
  }, []);

  React.useEffect(() => {
    if (!cookies.accessToken) {
      navigate("/login");
    }
  }, [cookies]);

  React.useEffect(() => {
    if (!context.mentor) {
      return;
    }
    const _questions: Question[] = [];
    if (videoId) {
      const ids = Array.isArray(videoId) ? videoId : [videoId];
      _questions.push(...context.mentor.questions.filter(q => ids.includes(q.videoId)));
      _questions.push(...context.mentor.utterances.filter(u => ids.includes(u.videoId)));
    }
    else if (utterance) {
      _questions.push(...context.mentor.utterances.filter(u => status ? u.status === status : true));
    }
    else if (topic) {
      _questions.push(...context.mentor.questions.filter(q => status ? q.status === status && q.topics.map(t => t.id).includes(topic) : q.topics.map(t => t.id).includes(topic)));
    }
    else if (status) {
      _questions.push(...context.mentor.questions.filter(q => q.status === status));
    }
    else {
      _questions.push(...context.mentor.questions);
    }
    setQuestions(_questions);
  }, [context.mentor]);

  async function onUpdateQuestion(question: Question) {
    if (!context.mentor) {
      return;
    }
    try {
      const updated = await updateQuestion(context.mentor.id, question, cookies.accessToken);
      context.updateMentor(updated);
    } catch (err) {
      console.error(err);
    }
  }

  async function onGenerateTranscript() {
    if (!context.mentor) {
      return;
    }
    try {
      await generateTranscript(context.mentor.id, curQuestion.videoId, cookies.accessToken);
      context.updateMentor();
    } catch (err) {
      console.error(err);
    }
  }

  async function onRecordingComplete(videoBlob: any) {
    console.log('videoBlob: ' + videoBlob);
    if (!context.mentor) {
      return;
    }
    try {
      await updateQuestion(context.mentor.id, {...curQuestion, video: videoBlob}, cookies.accessToken);
      context.updateMentor();
    } catch (err) {
      console.error(err);
    }
  }

  const idx = curIdx + 1;
  const curQuestion = questions[curIdx];

  if (!context.mentor || !questions || !curQuestion) {
    return (
      <div>
        <NavBar title="Record Mentor" />
        <CircularProgress />
      </div>
    )
  }

  return (
    <div className={classes.root}>
      <NavBar title="Record Mentor" />
      <div id="progress" style={{ padding: 15 }}>
        <Typography variant="h6" className={classes.title}>
          Questions {idx} / {questions.length}
        </Typography>
        <ProgressBar value={idx / questions.length} />
      </div>
      {
        curQuestion.video ? undefined : <VideoRecorder onRecordingComplete={onRecordingComplete} />
      }
      <div id="question" className={classes.block}>
        <Typography className={classes.title}>
          Question:
        </Typography>
        <TextField
          id="question-input"
          variant="outlined"
          disabled={true}
          value={curQuestion.question}
          className={classes.inputField}
        />
      </div>
      <div id="transcript" className={classes.block}>
        <Typography className={classes.title}>
          Answer Transcript:
        </Typography>
        <FormControl className={classes.inputField} variant="outlined">
          <OutlinedInput
            id="transcript-input"
            value={curQuestion.transcript || ""}
            onChange={(e) => { onUpdateQuestion({ ...curQuestion, transcript: e.target.value }) }}
            endAdornment={
              <InputAdornment position="end">
                <Button
                  id="transcript-btn"
                  variant="contained"
                  disabled={!curQuestion.video}
                  onClick={onGenerateTranscript}
                  disableElevation
                >
                  Generate
                </Button>
              </InputAdornment>
            }
          />
        </FormControl>
      </div>
      <Grid container spacing={1} className={classes.block}>
        <Grid item xs={6}>
          <div className={classes.row}>
            <Typography style={{ fontWeight: "bold" }}>
              Topics:
            </Typography>
          </div>
          <List id="topics" className={classes.row}>
            {
              curQuestion.topics.map((t, i) =>
                <ListItem id={`topic-${i}`} key={`topic-${i}`} className={classes.topicItem}>
                  {t.name}
                </ListItem>
              )
            }
          </List>
        </Grid>
        <Grid id="status" item xs={6} style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
          <Typography className={classes.title}>
            Status:
          </Typography>
          <Select
            id="select-status"
            value={curQuestion.status.toString()}
            onChange={(event: React.ChangeEvent<{ value: unknown; name?: unknown }>) => { onUpdateQuestion({ ...curQuestion, status: event.target.value as Status }) }}
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
      <div className={classes.footer}>
        <IconButton id="back-btn" style={{ position: "fixed", bottom: 0, left: 0 }} disabled={idx === 1} onClick={() => setCurIdx(curIdx - 1)}>
          <ArrowBackIcon fontSize="large" />
        </IconButton>
        <IconButton id="next-btn" style={{ position: "fixed", bottom: 0, right: 0 }} disabled={idx === questions.length} onClick={() => setCurIdx(curIdx + 1)}>
          <ArrowForwardIcon fontSize="large" />
        </IconButton>
      </div>
    </div>
  )
}

export default withLocation(RecordPage);
