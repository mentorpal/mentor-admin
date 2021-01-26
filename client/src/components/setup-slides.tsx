/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Select,
  MenuItem,
} from "@material-ui/core";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import { navigate } from "@reach/router";
import {
  updateMentor,
  trainMentor,
  addQuestionSet,
  fetchTrainingStatus,
} from "api";
import Context from "context";
import React, { useContext, useState } from "react";
import { useCookies } from "react-cookie";
import { Mentor, Status, Subject, TrainStatus, TrainState } from "types";

export function WelcomeSlide(props: { classes: any }): JSX.Element {
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
  );
}

export function MentorSlide(props: {
  classes: any;
  mentor: Mentor;
  onUpdated: (mentor: Mentor) => void;
}): JSX.Element {
  const { classes, mentor, onUpdated } = props;
  const [cookies] = useCookies(["accessToken"]);
  const [name, setName] = useState(mentor.name);
  const [firstName, setFirstName] = useState(mentor.firstName);
  const [title, setTitle] = useState(mentor.title);

  async function onSave() {
    const updatedMentor = await updateMentor(
      { ...mentor, name, firstName, title },
      cookies.accessToken
    );
    onUpdated(updatedMentor);
  }

  return (
    <Paper id="slide" className={classes.card}>
      <Typography variant="h3" className={classes.title}>
        Tell us a little about yourself.
      </Typography>
      <div className={classes.column}>
        <TextField
          id="first-name"
          label="First Name"
          variant="outlined"
          value={firstName}
          onChange={(e) => {
            setFirstName(e.target.value);
          }}
          className={classes.inputField}
        />
        <TextField
          id="name"
          label="Full Name"
          variant="outlined"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          className={classes.inputField}
        />
        <TextField
          id="title"
          label="Job Title"
          variant="outlined"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
          className={classes.inputField}
        />
        <Button
          id="save-btn"
          variant="contained"
          color="primary"
          disabled={
            mentor.name === name &&
            mentor.firstName === firstName &&
            mentor.title === title
          }
          onClick={onSave}
        >
          Save Changes
        </Button>
      </div>
    </Paper>
  );
}

export function IntroductionSlide(props: { classes: any }): JSX.Element {
  const { classes } = props;
  return (
    <Paper id="slide" className={classes.card}>
      <Typography variant="h3" className={classes.title}>
        Let's start recording.
      </Typography>
      <div className={classes.column}>
        <Typography variant="h6" className={classes.text}>
          You'll be asked to answer some background questions and repeat after
          mes.
        </Typography>
        <Typography variant="h6" className={classes.text}>
          Once you're done recording, you can build and preview your mentor.
        </Typography>
        <Typography variant="h6" className={classes.text}>
          If you'd like to stop, press done at any point. You can always finish
          later.
        </Typography>
      </div>
    </Paper>
  );
}

export function IdleSlide(props: {
  classes: any;
  mentor: Mentor;
}): JSX.Element {
  const { classes, mentor } = props;
  const idle = mentor.questions.find(
    (q) => q.topics.findIndex((t) => t.name === "Idle") !== -1
  );
  const isRecorded = idle !== undefined && idle.status === Status.COMPLETE;

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
        onClick={() => {
          navigate(
            `/record?videoId=${idle?.id}&back=${encodeURI(`/setup?i=3`)}`
          );
        }}
      >
        Record
      </Button>
      {isRecorded ? (
        <CheckCircleIcon id="check" style={{ color: "green" }} />
      ) : undefined}
    </Paper>
  );
}

export function RecordSlide(props: {
  classes: any;
  mentor: Mentor;
  subject: Subject;
  i: number;
}): JSX.Element {
  const { classes, subject, i, mentor } = props;
  const questions = mentor.questions.filter(
    (q) => q.subject !== undefined && q.subject._id === subject._id
  );
  const recorded = questions.filter((q) => q.status === Status.COMPLETE);
  const isRecorded = recorded.length === questions.length;

  function onRecord() {
    navigate(
      `/record?subject=${subject._id}&back=${encodeURI(`/setup?i=${i}`)}`
    );
  }

  return (
    <Paper id="slide" className={classes.card}>
      <Typography variant="h3" className={classes.title}>
        {subject.name} questions
      </Typography>
      <div className={classes.column}>
        <Typography variant="h6" className={classes.text}>
          {subject.description}
        </Typography>
      </div>
      <Button
        id="record-btn"
        className={classes.button}
        variant="contained"
        color="primary"
        onClick={onRecord}
      >
        Record
      </Button>
      {isRecorded ? (
        <CheckCircleIcon id="check" style={{ color: "green" }} />
      ) : (
        <Typography variant="h6" className={classes.text}>
          {recorded.length} / {questions.length}
        </Typography>
      )}
    </Paper>
  );
}

export function BuildErrorSlide(props: { classes: any }): JSX.Element {
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
          Please check the previous steps and make sure you've recorded all
          videos and filled out all fields.
        </Typography>
      </div>
    </Paper>
  );
}

const TRAIN_STATUS_POLL_INTERVAL_DEFAULT = 1000;
export function BuildMentorSlide(props: {
  classes: any;
  mentor: Mentor;
  onUpdated: (mentor: Mentor) => void;
}): JSX.Element {
  const { classes, mentor, onUpdated } = props;
  const [cookies] = useCookies(["accessToken"]);
  const [statusUrl, setStatusUrl] = React.useState("");
  const [trainData, setTrainData] = React.useState<TrainStatus>({
    state: TrainState.NONE,
  });
  const [isBuilding, setIsBuilding] = useState(false);
  const isBuilt = mentor.isBuilt;

  async function trainAndBuild() {
    trainMentor(mentor._id)
      .then((trainJob) => {
        setStatusUrl(trainJob.statusUrl);
        setIsBuilding(true);
      })
      .catch((err: any) => {
        console.error(err);
        setTrainData({
          state: TrainState.FAILURE,
          status: err.message || `${err}`,
        });
        setIsBuilding(false);
      });
  }

  function useInterval(callback: any, delay: number | null) {
    const savedCallback = React.useRef() as any;
    React.useEffect(() => {
      savedCallback.current = callback;
    });
    React.useEffect(() => {
      function tick() {
        savedCallback.current();
      }
      if (delay) {
        const id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay]);
  }

  function renderMessage(): JSX.Element {
    if (isBuilding) {
      return (
        <div>
          <Typography variant="h6" className={classes.text}>
            Building your mentor...
          </Typography>
          <CircularProgress />
        </div>
      );
    }
    if (mentor.isBuilt || trainData.state === TrainState.SUCCESS) {
      return (
        <div>
          <Typography variant="h6" className={classes.text}>
            Congratulations! Your brand-new mentor is ready!
          </Typography>
          <Typography variant="h6" className={classes.text}>
            Click the preview button to see your mentor.
          </Typography>
        </div>
      );
    }
    if (trainData.state === TrainState.FAILURE) {
      return (
        <div>
          <Typography variant="h6" className={classes.text}>
            Oops, training failed. Please try again.
          </Typography>
        </div>
      );
    }
    return (
      <div>
        <Typography variant="h6" className={classes.text}>
          Click the build button to start building your mentor.
        </Typography>
        <Typography variant="h6" className={classes.text}>
          Once its complete, click preview to see your mentor.
        </Typography>
      </div>
    );
  }

  useInterval(
    () => {
      fetchTrainingStatus(statusUrl)
        .then((trainStatus) => {
          setTrainData(trainStatus);
          if (
            trainStatus.state === TrainState.SUCCESS ||
            trainStatus.state === TrainState.FAILURE
          ) {
            if (trainStatus.state === TrainState.SUCCESS) {
              const updatedMentor = { ...mentor, isBuilt: true };
              updateMentor(updatedMentor, cookies.accessToken);
              onUpdated(updatedMentor);
            }
            setIsBuilding(false);
          }
        })
        .catch((err: Error) => {
          setTrainData({ state: TrainState.FAILURE, status: err.message });
          setIsBuilding(false);
          console.error(err);
        });
    },
    isBuilding ? TRAIN_STATUS_POLL_INTERVAL_DEFAULT : null
  );

  return (
    <Paper id="slide" className={classes.card}>
      <Typography variant="h3" className={classes.title}>
        Great job! You're ready to build your mentor!
      </Typography>
      <div className={classes.column}>{renderMessage()}</div>
      <Button
        id="build-btn"
        className={classes.button}
        variant="contained"
        color="primary"
        disabled={isBuilding}
        onClick={() => {
          if (isBuilt) {
            navigate(`http://mentorpal.org/mentorpanel/?mentor=${mentor._id}`);
          } else {
            trainAndBuild();
          }
        }}
      >
        {isBuilt ? "Preview" : "Build"}
      </Button>
    </Paper>
  );
}

export function QuestionSetSlide(props: {
  classes: any;
  subjects: Subject[];
  mentor: Mentor;
  onUpdated: (mentor: Mentor) => void;
}): JSX.Element {
  const { classes, mentor, onUpdated, subjects } = props;
  const [cookies] = useCookies(["accessToken"]);
  const [subject, setSubject] = React.useState<Subject>();
  const [isAdding, setIsAdding] = React.useState(false);
  const isSubjectAdded =
    subject !== undefined &&
    mentor.subjects.findIndex((s) => s._id === subject._id) !== -1;
  const questions =
    subject !== undefined
      ? mentor.questions.filter(
          (q) => q.subject !== undefined && q.subject._id === subject._id
        )
      : [];
  const recorded = questions.filter((q) => q.status === Status.COMPLETE);
  const isRecorded = recorded.length === questions.length;

  async function addSubject() {
    if (!subject) {
      return;
    }
    setIsAdding(true);
    const updatedMentor = await addQuestionSet(
      mentor._id,
      subject._id,
      cookies.accessToken
    );
    onUpdated(updatedMentor);
    setIsAdding(false);
  }

  async function record() {
    if (!subject) {
      return;
    }
    navigate(`/record?subject=${subject._id}&back=${encodeURI(`/setup?i=7`)}`);
  }

  return (
    <Paper id="slide" className={classes.card}>
      <Typography variant="h3" className={classes.title}>
        Pick a Field?
      </Typography>
      <div className={classes.column}>
        <Typography variant="h6" className={classes.text}>
          Your basic mentor is done, but you can make it better by picking a
          question set.
        </Typography>
        <Typography variant="h6" className={classes.text}>
          These question sets are specific to your field of expertise. Pick the
          one you are most qualified to mentor in.
        </Typography>
        <Typography variant="h6" className={classes.text}>
          Each set will ask you some related questions. After answering, you'll
          be placed in a panel with other mentors in your field.
        </Typography>
      </div>
      <div className={classes.row}>
        <Select
          id="select-set"
          value={subject ? subject._id : ""}
          onChange={(
            event: React.ChangeEvent<{ value: unknown; name?: unknown }>
          ) => {
            setSubject(
              subjects.find((s) => s._id === (event.target.value as string))
            );
          }}
          style={{ marginLeft: 10, marginRight: 10, minWidth: 100 }}
        >
          {subjects.map((s) => (
            <MenuItem id={s._id} value={s._id}>
              {s.name}
            </MenuItem>
          ))}
        </Select>
        {isAdding ? (
          <CircularProgress />
        ) : (
          <Button
            id="set-btn"
            className={classes.button}
            variant="contained"
            color="primary"
            disabled={subject === undefined}
            onClick={isSubjectAdded ? record : addSubject}
          >
            {isSubjectAdded ? "Record" : "Add"}
          </Button>
        )}
      </div>
      {subject ? (
        <Typography variant="h6" className={classes.text}>
          {subject.description}
        </Typography>
      ) : undefined}
      {isSubjectAdded ? (
        isRecorded ? (
          <CheckCircleIcon id="check" style={{ color: "green" }} />
        ) : (
          <Typography variant="h6" className={classes.text}>
            {recorded.length} / {questions.length}
          </Typography>
        )
      ) : undefined}
    </Paper>
  );
}
