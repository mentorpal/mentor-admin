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
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { fetchMentor, updateMentor, fetchSets } from "api";
import { Mentor, Set } from "types";
import Context from "context";
import NavBar from "components/nav-bar";
import withLocation from "wrap-with-location";

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: "#eee"
  },
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
  },
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginLeft: 25,
    marginRight: 25,
    padding: 25,
    flexGrow: 1,
  },
  column: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "100%",
  },
  title: {
    fontWeight: "bold",
    margin: 15,
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
    <Paper className={classes.card}>
      <Typography variant="h3" className={classes.title}>
        Welcome to MentorPal!
      </Typography>
      <div className={classes.column}>
        <Typography variant="h6" className={classes.text}>
          It's nice to meet you, {context.user!.name}!
        </Typography>
        <Typography variant="h6" className={classes.text}>
          Let's get started setting up your new mentor.
        </Typography>
      </div>
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
    <Paper className={classes.card}>
      <Typography variant="h3" className={classes.title}>
        Tell us a little about yourself.
      </Typography>
      <div className={classes.column}>
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
      </div>
    </Paper>
  )
}

function IntroductionSlide(props: { classes: any }): JSX.Element {
  const { classes } = props;
  return (
    <Paper className={classes.card}>
      <Typography variant="h3" className={classes.title}>
        Let's start recording.
      </Typography>
      <div className={classes.column}>
        <Typography variant="h6" className={classes.text}>
          You'll be asked to answer some background questions and repeat after mes.
        </Typography>
        <Typography variant="h6" className={classes.text}>
          Once you're done recording, you can build and preview your mentor.
        </Typography>
        <Typography variant="h6" className={classes.text}>
          If you'd like to stop, press done at any point. You can always do this later!
        </Typography>
      </div>
    </Paper>
  )
}

function IdleSlide(props: {
  classes: any,
  i: number
}): JSX.Element {
  const { classes, i } = props;
  return (
    <Paper className={classes.card}>
      <Typography variant="h3" className={classes.title}>
        Idle
      </Typography>
      <div className={classes.column}>
        <Typography variant="h6" className={classes.text}>
          Let's record a short idle calibration.
        </Typography>
        <Typography variant="h6" className={classes.text}>
          Click the record button and you'll be taken to a recording screen.
        </Typography>
      </div>
      <Button
        className={classes.button}
        variant="contained"
        color="primary"
        onClick={() => { navigate(`/record?topic=idle&back=${encodeURI(`/setup?i=${i}`)}`) }}
      >
        Record
      </Button>
    </Paper>
  )
}

function RecordSlide(props: {
  classes: any,
  i: number,
  set: Set,
}): JSX.Element {
  const { classes, set, i } = props;
  return (
    <Paper className={classes.card}>
      <Typography variant="h3" className={classes.title}>
        {set.name} questions
      </Typography>
      <Typography variant="h6" className={classes.text}>
        {set.description}
      </Typography>
      <Button
        className={classes.button}
        variant="contained"
        color="primary"
        onClick={() => { navigate(`/record?set=${set.id}&back=${encodeURI(`/setup?i=${i}`)}`) }}
      >
        Record
      </Button>
    </Paper>
  )
}

function PreviewSlide(props: { classes: any }): JSX.Element {
  const { classes } = props;
  const [isBuilt, setIsBuilt] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);

  async function buildMentor() {
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
    setIsBuilding(true);
    await delay(5000);
    setIsBuilding(false);
    setIsBuilt(true);
  }

  return (
    <Paper className={classes.card}>
      <Typography variant="h3" className={classes.title}>
        Great job! You're ready to build your mentor!
      </Typography>
      {
        isBuilding ? (
          <div>
            <Typography variant="h6" className={classes.text}>
              Building your mentor...
            </Typography>
            <CircularProgress />
          </div>
        ) : (
            isBuilt ? (
              <div>
                <Typography variant="h6" className={classes.text}>
                  Congratulations! Your brand-new mentor is ready!
                </Typography>
                <Typography variant="h6" className={classes.text}>
                  Click the preview button to see your mentor.
                </Typography>
              </div >
            ) : (
                <div>
                  <Typography variant="h6" className={classes.text}>
                    Click the build button to start building your mentor.
                </Typography>
                  <Typography variant="h6" className={classes.text}>
                    Once its complete, click preview to see your mentor.
                </Typography>
                </div >
              )
          )
      }
      <Button
        className={classes.button}
        variant="contained"
        color="primary"
        disabled={isBuilding}
        onClick={() => {
          if (isBuilt) {
            navigate(`http://mentorpal.org/mentorpanel/?mentor=clint`)
          } else {
            buildMentor();
          }
        }}
      >
        {isBuilt ? "Preview" : "Build"}
      </Button>
    </Paper >
  )
}

function SetSlide(props: { classes: any }): JSX.Element {
  const { classes } = props;
  return (
    <Paper className={classes.card}>
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

function SetupPage(props: { search: { i?: string } }): JSX.Element {
  const classes = useStyles();
  const context = useContext(Context);
  const [cookies] = useCookies(["accessToken"]);
  const [mentor, setMentor] = useState<Mentor>();
  const [sets, setSets] = useState<Set[]>([]);
  const [slides, setSlides] = useState<JSX.Element[]>([]);
  const [idx, setIdx] = useState(props.search.i ? parseInt(props.search.i) : 0);

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
      setSets(await fetchSets(cookies.accessToken));
      setMentor(await fetchMentor(context.user.id, cookies.accessToken));
    }
    load();
  }, [context.user]);

  React.useEffect(() => {
    if (!mentor) {
      return;
    }
    setSlides([
      <WelcomeSlide key='welcome' classes={classes} />,
      <MentorSlide key='mentor-info' classes={classes} mentor={mentor} onUpdated={setMentor} />,
      <IntroductionSlide key='record' classes={classes} />,
      <IdleSlide key='idle' classes={classes} i={3} />,
      <RecordSlide key='background-questions' classes={classes} i={4} set={sets.find(s => s.id === 'background')!} />,
      <RecordSlide key='utterances' classes={classes} i={5} set={sets.find(s => s.id === 'repeat_after_me')!} />,
      <PreviewSlide key='preview' classes={classes} />
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
          idx > 1 ? (
            <Button className={classes.button} variant="contained" color="secondary" onClick={() => { navigate("/") }}>
              Done
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
