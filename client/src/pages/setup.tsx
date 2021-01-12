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
  Select,
  MenuItem,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { fetchMentor, updateMentor, fetchSets, fetchQuestionSet, buildMentor } from "api";
import { Mentor, Set, Status, Question } from "types";
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
    <Paper id="slide" className={classes.card}>
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
    <Paper id="slide" className={classes.card}>
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
          id="save-btn"
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
    <Paper id="slide" className={classes.card}>
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
          If you'd like to stop, press done at any point. You can always finish later.
        </Typography>
      </div>
    </Paper>
  )
}

function IdleSlide(props: {
  classes: any,
  isRecorded: boolean,
}): JSX.Element {
  const { classes, isRecorded } = props;
  return (
    <Paper id="slide" className={classes.card}>
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
        id="record-btn"
        className={classes.button}
        variant="contained"
        color="primary"
        onClick={() => { navigate(`/record?topic=idle&back=${encodeURI(`/setup?i=3`)}`) }}
      >
        Record
      </Button>
      {
        isRecorded ? (
          <CheckCircleIcon id="check" style={{ color: 'green' }} />
        ) : undefined
      }
    </Paper>
  )
}

function RecordSlide(props: {
  classes: any,
  i: number,
  set: Set,
  questions: Question[],
}): JSX.Element {
  const { classes, set, i, questions } = props;
  const recorded = questions.filter(q => q.status === Status.COMPLETE);
  const isRecorded = recorded.length === questions.length;

  return (
    <Paper id="slide" className={classes.card}>
      <Typography variant="h3" className={classes.title}>
        {set.name} questions
      </Typography>
      <div className={classes.column}>
        <Typography variant="h6" className={classes.text}>
          {set.description}
        </Typography>
      </div>
      <Button
        id="record-btn"
        className={classes.button}
        variant="contained"
        color="primary"
        onClick={() => { navigate(`/record?set=${set.id}&back=${encodeURI(`/setup?i=${i}`)}`) }}
      >
        Record
      </Button>
      {
        isRecorded ? (
          <CheckCircleIcon id="check" style={{ color: 'green' }} />
        ) : (
            <Typography variant="h6" className={classes.text}>
              {recorded.length} / {questions.length}
            </Typography>
          )
      }
    </Paper>
  )
}

function BuildErrorSlide(props: { classes: any }): JSX.Element {
  const { classes } = props;
  return (
    <Paper id="slide" className={classes.card}>
      <Typography variant="h3" className={classes.title}>
        Oops! We aren't done just yet!
      </Typography>
      <div className={classes.column}>
        <Typography variant="h6" className={classes.text}>
          You're still missing some steps before you can build a mentor.
        </Typography>
        <Typography variant="h6" className={classes.text}>
          Please check the previous steps and make sure you've recorded all videos and filled out all fields.
        </Typography>
      </div>
    </Paper>
  )
}

function BuildMentorSlide(props: {
  classes: any,
  mentor: Mentor,
  onUpdated: (mentor: Mentor) => void,
}): JSX.Element {
  const { classes, mentor, onUpdated } = props;
  const [cookies] = useCookies(["accessToken"]);
  const [isBuilding, setIsBuilding] = useState(false);
  const isBuilt = mentor.isBuilt;

  async function build() {
    setIsBuilding(true);
    const updatedMentor = await buildMentor(mentor.id, cookies.accessToken);
    onUpdated(updatedMentor);
    setIsBuilding(false);
  }

  return (
    <Paper id="slide" className={classes.card}>
      <Typography variant="h3" className={classes.title}>
        Great job! You're ready to build your mentor!
      </Typography>
      <div className={classes.column}>
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
      </div>
      <Button
        id="build-btn"
        className={classes.button}
        variant="contained"
        color="primary"
        disabled={isBuilding}
        onClick={() => {
          if (isBuilt) {
            navigate(`http://mentorpal.org/mentorpanel/?mentor=${mentor.id}`)
          } else {
            build();
          }
        }}
      >
        {isBuilt ? "Preview" : "Build"}
      </Button>
    </Paper >
  )
}

function QuestionSetSlide(props: {
  classes: any,
  sets: Set[],
  mentor: Mentor,
  onUpdated: (mentor: Mentor) => void,
}): JSX.Element {
  const { classes, mentor, onUpdated, sets } = props;
  const [cookies] = useCookies(["accessToken"]);
  const [set, setSet] = React.useState<Set>();
  const [isAdding, setIsAdding] = React.useState(false);

  const isSetAdded = set !== undefined && mentor.sets.findIndex(s => s.id === set.id) !== -1;
  const questions = set !== undefined ? mentor.questions.filter(q => q.set !== undefined && q.set.id === set.id) : [];
  const recorded = questions.filter(q => q.status === Status.COMPLETE);
  const isRecorded = recorded.length === questions.length;

  async function addSet() {
    if (!set) {
      return;
    }
    setIsAdding(true);
    const questionSet = await fetchQuestionSet(set.id, cookies.accessToken);
    const updatedMentor = await updateMentor({
      ...mentor,
      sets: [...mentor.sets, set],
      questions: [...mentor.questions, ...questionSet.questions]
    }, cookies.accessToken);
    onUpdated(updatedMentor);
    setIsAdding(false);
  }

  async function record() {
    if (!set) {
      return;
    }
    navigate(`/record?set=${set.id}&back=${encodeURI(`/setup?i=7`)}`)
  }

  return (
    <Paper id="slide" className={classes.card}>
      <Typography variant="h3" className={classes.title}>
        Pick a Field?
      </Typography>
      <div className={classes.column}>
        <Typography variant="h6" className={classes.text}>
          Your basic mentor is done, but you can make it better by picking a question set.
        </Typography>
        <Typography variant="h6" className={classes.text}>
          These question sets are specific to your field of expertise. Pick the one you are most qualified to mentor in.
        </Typography>
        <Typography variant="h6" className={classes.text}>
          Each set will ask you some related questions. After answering, you'll be placed in a panel with other mentors in your field.
        </Typography>
      </div>
      <div className={classes.row}>
        <Select
          id="select-set"
          value={set ? set.id : ""}
          onChange={(event: React.ChangeEvent<{ value: unknown; name?: unknown }>) => {
            setSet(sets.find(s => s.id === event.target.value as string))
          }}
          style={{ marginLeft: 10, marginRight: 10, minWidth: 100 }}
        >
          {
            sets.map(s => (
              <MenuItem id={s.id} value={s.id}>
                {s.name}
              </MenuItem>
            ))
          }
        </Select>
        {
          isAdding ? <CircularProgress /> : (
            <Button
              id="set-btn"
              className={classes.button}
              variant="contained"
              color="primary"
              disabled={set === undefined}
              onClick={isSetAdded ? record : addSet}
            >
              {isSetAdded ? "Record" : "Add"}
            </Button>
          )
        }
      </div>
      {
        set ? (
          <Typography variant="h6" className={classes.text}>
            {set.description}
          </Typography>
        ) : undefined
      }
      {
        isSetAdded ? (
          isRecorded ? (
            <CheckCircleIcon id="check" style={{ color: 'green' }} />
          ) : (
              <Typography variant="h6" className={classes.text}>
                {recorded.length} / {questions.length}
              </Typography>
          )
        ) : undefined
      }
    </Paper>
  )
}

function SetupPage(props: { search: { i?: string } }): JSX.Element {
  const classes = useStyles();
  const context = useContext(Context);
  const [cookies] = useCookies(["accessToken"]);
  const [mentor, setMentor] = useState<Mentor>();
  const [slides, setSlides] = useState<JSX.Element[]>([]);
  const [slideStatus, setSlideStatus] = useState<boolean[]>([]);
  const [idx, setIdx] = useState(props.search.i ? parseInt(props.search.i) : 0);
  const [sets, setSets] = useState<Set[]>([]);

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
    const idle = mentor.questions.filter(q => q.topics.findIndex(t => t.id === 'idle') !== -1);
    const background = mentor.questions.filter(q => q.set !== undefined && q.set.id === 'background');
    const repeatAfterMe = mentor.questions.filter(q => q.set !== undefined && q.set.id === 'repeat_after_me');
    const isMentorFilled = mentor.name !== "" && mentor.shortName !== "" && mentor.title !== "";
    const isIdleRecorded = idle.every(q => q.status === Status.COMPLETE);
    const isBackgroundRecorded = background.every(q => q.status === Status.COMPLETE);
    const isRepeatRecorded = repeatAfterMe.every(q => q.status === Status.COMPLETE);
    const isBuildReady = isMentorFilled && isIdleRecorded && isBackgroundRecorded && isRepeatRecorded;
    const isBuilt = mentor.isBuilt;
    const _slides = [
      <WelcomeSlide key='welcome' classes={classes} />,
      <MentorSlide key='mentor-info' classes={classes} mentor={mentor} onUpdated={setMentor} />,
      <IntroductionSlide key='introduction' classes={classes} />,
      <IdleSlide key='idle' classes={classes} isRecorded={isIdleRecorded} />,
      <RecordSlide key='background'
        classes={classes} i={4}
        set={sets.find(s => s.id === 'background')!}
        questions={background}
      />,
      <RecordSlide key='utterances'
        classes={classes} i={5}
        set={sets.find(s => s.id === 'repeat_after_me')!}
        questions={repeatAfterMe}
      />,
      isBuildReady ?
        <BuildMentorSlide key='build' classes={classes} mentor={mentor} onUpdated={setMentor} /> :
        <BuildErrorSlide key='build-error' classes={classes} />
    ]
    const _slideStatus = [
      true,
      isMentorFilled,
      true,
      isIdleRecorded,
      isBackgroundRecorded,
      isRepeatRecorded,
      isBuilt
    ];
    if (isBuilt) {
    _slides.push(<QuestionSetSlide classes={classes} mentor={mentor} sets={sets} onUpdated={setMentor} />);
    _slideStatus.push(true);
    }
    setSlides(_slides);
    setSlideStatus(_slideStatus);
  }, [mentor, sets])

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
            <Button id="back-btn" className={classes.button} variant="contained" onClick={() => { setIdx(idx - 1) }}>
              Back
            </Button>
          ) : undefined
        }
        {
          idx > 1 ? (
            <Button id="done-btn" className={classes.button} variant="contained" color="secondary" onClick={() => { navigate("/") }}>
              Done
            </Button>
          ) : undefined
        }
        {
          idx !== slides.length - 1 ? (
            <Button id="next-btn" className={classes.button} variant="contained" color="primary" onClick={() => { setIdx(idx + 1) }}>
              Next
            </Button>
          ) : undefined
        }
      </div>
      <div className={classes.row}>
        {slides.map((v, i) => (
          <Radio
            id={`radio-${i}`}
            key={i}
            checked={i === idx}
            onClick={() => setIdx(i)}
            color={slideStatus[i] ? "primary" : "default"}
            style={{ color: slideStatus[i] ? "" : "red" }}
          />
        ))}
      </div>
    </div>
  )
}

export default withLocation(SetupPage);
