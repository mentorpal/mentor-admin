import { navigate } from "gatsby";
import React, { useContext, useState } from "react";
import { useCookies } from "react-cookie";
import {
  Button,
  CircularProgress,
  Paper,
  Radio,
  TextField,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { fetchMentor, updateMentor } from "api";
import { Mentor, Topic } from "types";
import Context from "context";
import NavBar from "components/nav-bar";
import withLocation from "wrap-with-location";

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
  },
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
  },
  paper: {
    padding: 25,
    flexGrow: 1,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 75,
  },
  text: {
    marginBottom: 15,
  },
  inputField: {
    width: "100%",
    margin: 10,
  },
  button: {
    width: 100,
    margin: 5,
  },
}));

function WelcomeSlide(props: { classes: any }): JSX.Element {
  const { classes } = props;
  const context = useContext(Context);
  return (
    <Paper className={classes.paper} elevation={0}>
      <Typography variant="h3" className={classes.title}>
        Welcome to MentorPal!
      </Typography>
      <Typography variant="h6" className={classes.text}>
        It's nice to meet you, {context.user!.name}!
      </Typography>
      <Typography variant="h6" className={classes.text}>
        Let's get started by setting up your new mentor and recording a few questions.
      </Typography>
    </Paper>
  )
}

function MentorSlide(props: {
  classes: any,
  mentor: Mentor,
  onUpdated: (mentor: Mentor) => void,
}): JSX.Element {
  const { classes, mentor, onUpdated } = props;
  const [cookies] = useCookies(["accessToken"]);
  const [name, setName] = useState(mentor.name);
  const [shortName, setShortName] = useState(mentor.shortName);
  const [title, setTitle] = useState(mentor.title);

  async function onSave() {
    const updatedMentor = await updateMentor({ ...mentor, name, shortName, title }, cookies.accessToken);
    onUpdated(updatedMentor);
  }

  return (
    <Paper className={classes.paper} elevation={0}>
      <Typography variant="h3" className={classes.title}>
        Tell us a little about yourself.
      </Typography>
      <TextField
        id="short-name"
        label="First Name"
        variant="outlined"
        value={shortName}
        onChange={(e) => { setShortName(e.target.value) }}
        className={classes.inputField}
      />
      <TextField
        id="name"
        label="Full Name"
        variant="outlined"
        value={name}
        onChange={(e) => { setName(e.target.value) }}
        className={classes.inputField}
      />
      <TextField
        id="title"
        label="Job Title"
        variant="outlined"
        value={title}
        onChange={(e) => { setTitle(e.target.value) }}
        className={classes.inputField}
      />
      <Button
        variant="contained"
        color="primary"
        disabled={mentor.name === name && mentor.shortName === shortName && mentor.title === title}
        onClick={onSave}
      >
        Save Changes
      </Button>
    </Paper>
  )
}

function VideoIntroductionSlide(props: { classes: any }): JSX.Element {
  const { classes } = props;
  return (
    <Paper className={classes.paper} elevation={0}>
      <Typography variant="h3" className={classes.title}>
        Let's start recording!
      </Typography>
      <Typography variant="h6" className={classes.text}>
        For the next few steps, you'll be asked to record some question sets.
      </Typography>
      <Typography variant="h6" className={classes.text}>
        Each set will ask you some related questions, and you'll record and upload your answers.
      </Typography>
      <Typography variant="h6" className={classes.text}>
        If you'd like to stop, press done at any point. You can always record your questions later!
      </Typography>
    </Paper>
  )
}

function VideoRecordSlide(props: {
  classes: any,
  i: number,
  topic: Topic,
}): JSX.Element {
  const { classes, topic, i } = props;
  return (
    <Paper className={classes.paper} elevation={0}>
      <Typography variant="h3" className={classes.title}>
        {topic.name} questions
      </Typography>
      <Typography variant="h6" className={classes.text}>
        {topic.description}
      </Typography>
      <Button
        className={classes.button}
        variant="contained"
        color="primary"
        onClick={() => { navigate(`/record?topic=${topic.id}&back=${encodeURI(`/setup?i=${i}`)}`) }}
      >
        Record
      </Button>
    </Paper>
  )
}

function UtteranceRecordSlide(props: {
  classes: any,
  i: number,
}): JSX.Element {
  const { classes, i } = props;
  return (
    <Paper className={classes.paper} elevation={0}>
      <Typography variant="h3" className={classes.title}>
        Record utterances
      </Typography>
      <Typography variant="h6" className={classes.text}>
        These are miscellaneous videos that will ask you to do things like sit still or repeat certain lines.
      </Typography>
      <Button
        className={classes.button}
        variant="contained"
        color="primary"
        onClick={() => { navigate(`/record?utterance=true&back=${encodeURI(`/setup?i=${i}`)}`) }}
      >
        Record
      </Button>
    </Paper>
  )
}

function SetupPage(props: { search: { i?: string } }): JSX.Element {
  const classes = useStyles();
  const context = useContext(Context);
  const [cookies] = useCookies(["accessToken"]);
  const [mentor, setMentor] = useState<Mentor>();
  const [slides, setSlides] = useState<JSX.Element[]>([]);
  const [idx, setIdx] = useState(props.search.i ? parseInt(props.search.i) : 0);

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
    setSlides([
      <WelcomeSlide key='welcome' classes={classes} />,
      <MentorSlide key='mentor-info' classes={classes} mentor={mentor} onUpdated={setMentor} />,
      <VideoIntroductionSlide key='record' classes={classes} />,
      ...mentor.topics.map((t, i) => <VideoRecordSlide key={`topic-${t.id}`} classes={classes} i={i + 3} topic={t} />),
      <UtteranceRecordSlide key='utterances' classes={classes} i={mentor.topics.length + 3} />
    ]);
  }, [mentor])

  if (!mentor || slides.length === 0) {
    return (
      <div>
        <NavBar title="Mentor Setup" />
        <CircularProgress />
      </div>
    )
  }

  return (
    <div className={classes.root}>
      <NavBar title="Mentor Setup" />
      {slides[idx]}
      <div className={classes.row} style={{ height: 150 }}>
        {
          idx > 0 ? (
            <Button className={classes.button} variant="contained" onClick={() => { setIdx(idx - 1) }}>
              Back
            </Button>
          ) : undefined
        }
        {
          idx !== slides.length - 1 ? (
            <Button className={classes.button} variant="contained" color="primary" onClick={() => { setIdx(idx + 1) }}>
              Next
            </Button>
          ) : undefined
        }
        {
          idx > 1 ? (
            <Button className={classes.button} variant="contained" color="secondary" onClick={() => { navigate("/") }}>
              Done
            </Button>
          ) : undefined
        }
      </div>
      <div className={classes.row}>
        {slides.map((v, i) => (
          <Radio
            key={i}
            color="primary"
            checked={i === idx}
            onClick={() => setIdx(i)}
          />
        ))}
      </div>
    </div>
  )
}

export default withLocation(SetupPage);
