import React, { useContext, useState } from "react";
import { useCookies } from "react-cookie";
import { ToastContainer, toast } from "react-toastify";
import { navigate } from "gatsby";
import {
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { updateMentor } from "api";
import { Mentor, Question, Status, UtteranceType } from "types";
import Context from "context";
import Alerts, { IAlert } from "components/alert";
import NavBar from "components/nav-bar";
import ProgressBar from "components/progress-bar";
import QuestionList from "components/question-list";
import "react-toastify/dist/ReactToastify.css";

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: "#ddd"
  },
  paper: {
    flexGrow: 1,
    height: "100%",
    padding: 25,
    margin: 25,
  },
  title: {
    fontWeight: "bold",
  },
  expand: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: "rotate(180deg)",
  },
  inputField: {
    width: "100%",
    margin: 10,
  },
}));

function QuestionsPanel(props: {
  classes: any,
}): JSX.Element {
  const { classes } = props;
  const context = useContext(Context);
  const [topicFilter, setTopicFilter] = useState("");
  const [selected, setSelected] = useState<Question[]>([]);
  const questions = context.mentor!.questions;
  const complete = questions.filter((q) => { return q.status === Status.COMPLETE })
  const incomplete = questions.filter((q) => { return q.status === Status.INCOMPLETE });

  function onRecord() {
    if (!selected || selected.length === 0) {
      navigate(`/record`);
    }
    else {
      
    }
  }

  return (
    <Paper id="questions" className={classes.paper}>
      <Typography id="progress" variant="h6" className={classes.title}>
        My Questions ({complete.length} / {questions.length})
      </Typography>
      <ProgressBar value={complete.length / questions.length} />
      <QuestionList id="complete-questions" header="Recorded" questions={complete} classes={classes} />
      <QuestionList id="incomplete-questions" header="Unrecorded" questions={incomplete} classes={classes} />
      <Button id="record-btn" variant="contained" color="primary" onClick={onRecord}>
        Record Questions
      </Button>
    </Paper>
  )
}

function MentorPanel(props: {
  classes: any,
}): JSX.Element {
  const { classes } = props;
  const context = useContext(Context);
  const [cookies] = useCookies(["accessToken"]);
  const [mentor, setMentor] = useState<Mentor>(context.mentor!)

  async function updateProfile() {
    try {
      context.updateMentor(await updateMentor(mentor, cookies.accessToken));
      toast("Profile updated!");
    } catch (err) {
      toast(err);
    }
  }

  return (
    <Paper id="mentor" className={classes.paper}>
      <Typography variant="h6" className={classes.title}>
        My Details
      </Typography>
      <TextField
        id="video-id"
        label="Video ID"
        variant="outlined"
        value={mentor.videoId}
        onChange={(e) => { setMentor({ ...mentor, videoId: e.target.value }) }}
        className={classes.inputField}
      />
      <TextField
        id="name"
        label="Name"
        variant="outlined"
        value={mentor.name}
        onChange={(e) => { setMentor({ ...mentor, name: e.target.value }) }}
        className={classes.inputField}
      />
      <TextField
        id="short-name"
        label="Short Name"
        variant="outlined"
        value={mentor.shortName}
        onChange={(e) => { setMentor({ ...mentor, shortName: e.target.value }) }}
        className={classes.inputField}
      />
      <TextField
        id="title"
        label="Job Title"
        variant="outlined"
        value={mentor.title}
        onChange={(e) => { setMentor({ ...mentor, title: e.target.value }) }}
        className={classes.inputField}
      />
      <Button id="update-btn" variant="contained" color="primary" onClick={updateProfile}>
        Update Profile
      </Button>
    </Paper>
  )
}

function IndexPage(): JSX.Element {
  const classes = useStyles();
  const context = useContext(Context);
  const [cookies] = useCookies(["accessToken"]);
  const [alerts, setAlerts] = useState<IAlert[]>([]);

  React.useEffect(() => {
    if (!cookies.accessToken) {
      navigate("/login");
    }
  }, [cookies]);

  React.useEffect(() => {
    if (!context.mentor) {
      return;
    }
    const _alerts: IAlert[] = [];
    const mentor = context.mentor;
    const idle = mentor.utterances.find(u => u.topics[0].id === UtteranceType.IDLE && u.status === Status.INCOMPLETE );
    if (idle) {
      _alerts.push({
        severity: "warning",
        title: "Missing Idle Video",
        message: "You have not yet recorded a 30 second calibration idle video of yourself. Click the button to record one now.",
        actionText: "Record",
        actionFunction: function () { navigate(`/record?videoId=${idle.videoId}`) }
      });
    }
    const utterances = mentor.utterances.find(u => u.status === Status.INCOMPLETE);
    if (utterances) {
      _alerts.push({
        severity: "info",
        title: `Record Utterances`,
        message: `You have unrecorded utterances. You will be asked to repeat various lines.`,
        actionText: "Record",
        actionFunction: function () { navigate(`/record?utterance=true&status=${Status.INCOMPLETE}`) }
      });
    }
    const questions = mentor.questions.find(q => q.status === Status.INCOMPLETE );
    if (questions) {
      const topic = questions.topics[0];
      _alerts.push({
        severity: "info",
        title: `Record ${topic.name} Questions`,
        message: `${topic.description}`,
        actionText: "Record",
        actionFunction: function () { navigate(`/record?topic=${topic.id}&status=${Status.INCOMPLETE}`) }
      });
    }
    setAlerts(_alerts);
  }, [context.mentor]);

  if (!context.mentor) {
    return (
      <div>
        <NavBar title="Mentor Studio" />
        <CircularProgress />
      </div>
    )
  }

  return (
    <div className={classes.root}>
      <NavBar title="Mentor Studio" />
      <Alerts alerts={alerts} />
      <QuestionsPanel classes={classes} />
      <MentorPanel classes={classes} />
      <ToastContainer />
    </div>
  )
}

export default IndexPage
