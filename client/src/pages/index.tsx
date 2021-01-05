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
import { updateMentor, fetchMentor } from "api";
import { Mentor, Question, Status } from "types";
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
  questions: Question[],
  classes: any,
}): JSX.Element {
  const { questions, classes } = props;
  const complete = questions.filter((q) => { return q.status === Status.COMPLETE })
  const incomplete = questions.filter((q) => { return q.status === Status.INCOMPLETE });

  function onRecord() {
    navigate(`/record`);
  }

  return (
    <Paper id="questions" className={classes.paper}>
      <Typography id="progress" variant="h6" className={classes.title}>
        My Questions ({complete.length} / {questions.length})
      </Typography>
      <ProgressBar value={(complete.length / questions.length) * 100} />
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
  mentor: Mentor,
  onMentorUpdated: (mentor: Mentor) => void,
}): JSX.Element {
  const { classes } = props;
  const [cookies] = useCookies(["accessToken"]);
  const [mentor, setMentor] = useState<Mentor>(props.mentor);

  async function updateProfile() {
    const updatedMentor = await updateMentor(mentor, cookies.accessToken);
    props.onMentorUpdated(updatedMentor);
    toast("Profile updated!");
  }

  return (
    <Paper id="mentor" className={classes.paper}>
      <Typography variant="h6" className={classes.title}>
        My Details
      </Typography>
      <TextField
        id="id"
        label="ID"
        variant="outlined"
        value={mentor.id}
        onChange={(e) => { setMentor({ ...mentor, id: e.target.value }) }}
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
        Save Changes
      </Button>
    </Paper>
  )
}

function IndexPage(): JSX.Element {
  const classes = useStyles();
  const context = useContext(Context);
  const [cookies] = useCookies(["accessToken"]);
  const [mentor, setMentor] = useState<Mentor>();
  const [alerts, setAlerts] = useState<IAlert[]>([]);

  React.useEffect(() => {
    if (!cookies.accessToken) {
      navigate("/login");
    }
  }, [cookies]);

  React.useEffect(() => {
    const loadMentor = async () => {
      if (!context.user) {
        return;
      }
      setMentor(await fetchMentor(context.user.id, cookies.accessToken));
    }
    loadMentor();
  }, [context.user]);

  React.useEffect(() => {
    if (!mentor) {
      return;
    }
    const _alerts: IAlert[] = [];
    const idle = mentor.questions.find(q => q.topics[0].id === "idle" && q.status === Status.INCOMPLETE);
    if (idle) {
      _alerts.push({
        severity: "warning",
        title: "Missing Idle Video",
        message: "You have not yet recorded a 30 second calibration idle video of yourself. Click the button to record one now.",
        actionText: "Record",
        actionFunction: function () { navigate(`/record?id=${idle.id}`) }
      });
    }
    const utterances = mentor.questions.find(q => q.set !== undefined && q.set.id === "repeat_after_me" && q.status === Status.INCOMPLETE);
    if (utterances) {
      _alerts.push({
        severity: "info",
        title: `Record Utterances`,
        message: `You have unrecorded utterances. You will be asked to repeat various lines.`,
        actionText: "Record",
        actionFunction: function () { navigate(`/record?set=${utterances.set!.id}&status=${Status.INCOMPLETE}`) }
      });
    }
    const questions = mentor.questions.find(q => q.status === Status.INCOMPLETE);
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
  }, [mentor]);

  function onMentorUpdated(mentor: Mentor) {
    setMentor(mentor);
  }

  if (!mentor) {
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
      <QuestionsPanel classes={classes} questions={mentor.questions} />
      <MentorPanel classes={classes} mentor={mentor} onMentorUpdated={onMentorUpdated} />
      <ToastContainer />
    </div>
  )
}

export default IndexPage
