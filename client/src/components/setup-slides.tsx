/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { navigate } from "gatsby";
import React, { useState } from "react";
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
import {
  updateMentor,
  trainMentor,
  fetchTrainingStatus,
  CLIENT_ENDPOINT,
} from "api";
import {
  Mentor,
  Status,
  Subject,
  TrainStatus,
  TrainState,
  Answer,
  MentorType,
} from "types";

export interface SlideType {
  status: boolean;
  element: JSX.Element;
}

export function Slide(status: boolean, element: JSX.Element): SlideType {
  return {
    status,
    element,
  };
}

export function WelcomeSlide(props: {
  classes: Record<string, string>;
  userName: string;
}): JSX.Element {
  const { classes, userName } = props;
  return (
    <Paper className={classes.card}>
      <Typography variant="h3" className={classes.title}>
        Welcome to MentorPal!
      </Typography>
      <div className={classes.column}>
        <Typography variant="h6" className={classes.text}>
          It&apos;s nice to meet you, {userName}!
        </Typography>
        <Typography variant="h6" className={classes.text}>
          Let&apos;s get started setting up your new mentor.
        </Typography>
      </div>
    </Paper>
  );
}

export function MentorInfoSlide(props: {
  classes: Record<string, string>;
  mentor: Mentor;
  accessToken: string;
  onUpdated: () => void;
}): JSX.Element {
  const { classes, mentor, onUpdated } = props;
  const [name, setName] = useState(mentor.name);
  const [firstName, setFirstName] = useState(mentor.firstName);
  const [title, setTitle] = useState(mentor.title);

  async function onSave() {
    const update = await updateMentor(
      { ...mentor, name, firstName, title },
      props.accessToken
    );
    if (!update) {
      console.error("failed to update");
      return;
    }
    onUpdated();
  }

  return (
    <Paper className={classes.card}>
      <Typography variant="h3" className={classes.title}>
        Tell us a little about yourself.
      </Typography>
      <div className={classes.column}>
        <TextField
          data-cy="first-name"
          label="First Name"
          variant="outlined"
          value={firstName}
          onChange={(e) => {
            setFirstName(e.target.value);
          }}
          className={classes.inputField}
        />
        <TextField
          data-cy="name"
          label="Full Name"
          variant="outlined"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          className={classes.inputField}
        />
        <TextField
          data-cy="title"
          label="Job Title"
          variant="outlined"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
          className={classes.inputField}
        />
        <Button
          data-cy="save-btn"
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

export function MentorTypeSlide(props: {
  classes: Record<string, string>;
  mentor: Mentor;
  accessToken: string;
  onUpdated: () => void;
}): JSX.Element {
  const { classes, mentor, onUpdated } = props;
  const [type, setType] = useState<MentorType>(
    mentor.mentorType || MentorType.CHAT
  );
  const [isSaving, setIsSaving] = useState<boolean>(false);

  function onSelect(mentorType: MentorType) {
    setType(mentorType);
  }

  async function onSave() {
    setIsSaving(true);
    await updateMentor({ ...mentor, mentorType: type }, props.accessToken);
    onUpdated();
    setIsSaving(false);
  }

  return (
    <Paper className={classes.card}>
      <Typography variant="h3" className={classes.title}>
        Pick a mentor type.
      </Typography>
      <div className={classes.column}>
        <div className={classes.row}>
          <Select
            data-cy="select-chat-type"
            value={type}
            style={{ width: 100, marginRight: 20 }}
            onChange={(
              event: React.ChangeEvent<{
                name?: string | undefined;
                value: unknown;
              }>
            ) => {
              onSelect(event.target.value as MentorType);
            }}
          >
            <MenuItem data-cy="chat" value={MentorType.CHAT}>
              Chat
            </MenuItem>
            <MenuItem data-cy="video" value={MentorType.VIDEO}>
              Video
            </MenuItem>
          </Select>
          <Button
            data-cy="save-btn"
            onClick={onSave}
            disabled={isSaving || mentor.mentorType === type}
            variant="contained"
            color="primary"
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
        <Typography>
          {type === MentorType.CHAT
            ? "Make a text-only mentor that responds with chat bubbles"
            : type === MentorType.VIDEO
            ? "Make a video mentor that responds with pre-recorded video answers"
            : ""}
        </Typography>
      </div>
    </Paper>
  );
}

export function IntroductionSlide(props: {
  classes: Record<string, string>;
}): JSX.Element {
  const { classes } = props;
  return (
    <Paper className={classes.card}>
      <Typography variant="h3" className={classes.title}>
        Let&apos;s start recording!
      </Typography>
      <div className={classes.column}>
        <Typography variant="h6" className={classes.text}>
          You&apos;ll be asked to pick some subjects and answer some questions.
        </Typography>
        <Typography variant="h6" className={classes.text}>
          Once you&apos;re done, you can build and preview your mentor.
        </Typography>
        <Typography variant="h6" className={classes.text}>
          If you&apos;d like to stop, press done at any point. You can always
          finish later.
        </Typography>
      </div>
    </Paper>
  );
}

export function SelectSubjectsSlide(props: {
  classes: Record<string, string>;
  i: number;
}): JSX.Element {
  const { classes, i } = props;

  function onClick() {
    navigate(`/subjects?back=${encodeURI(`/setup?i=${i}`)}`);
  }

  return (
    <Paper className={classes.card}>
      <Typography variant="h3" className={classes.title}>
        Select subjects?
      </Typography>
      <div className={classes.column}>
        <Typography variant="h6" className={classes.text}>
          Subjects will ask questions related to a particular field or topic.
          Pick the ones you feel qualified to mentor in!
        </Typography>
        <Typography variant="h6" className={classes.text}>
          After completing a subject, you&apos;ll be placed in a panel with
          other mentors in your field.
        </Typography>
        <Button
          data-cy="button"
          variant="contained"
          color="primary"
          onClick={onClick}
        >
          View Subjects
        </Button>
      </div>
    </Paper>
  );
}

export function RecordIdleSlide(props: {
  classes: Record<string, string>;
  idle: Answer;
  i: number;
}): JSX.Element {
  const { classes, idle, i } = props;

  function onRecord() {
    navigate(
      `/record?videoId=${idle.question._id}&back=${encodeURI(`/setup?i=${i}`)}`
    );
  }

  return (
    <Paper className={classes.card}>
      <Typography variant="h3" className={classes.title}>
        Idle
      </Typography>
      <div className={classes.column}>
        <Typography variant="h6" className={classes.text}>
          Let&apos;s record a short idle calibration video.
        </Typography>
        <Typography variant="h6" className={classes.text}>
          Click the record button and you&apos;ll be taken to a recording
          screen.
        </Typography>
      </div>
      <Button
        data-cy="record-btn"
        className={classes.button}
        variant="contained"
        color="primary"
        onClick={onRecord}
      >
        Record
      </Button>
      {idle.status === Status.COMPLETE ? (
        <CheckCircleIcon data-cy="check" style={{ color: "green" }} />
      ) : undefined}
    </Paper>
  );
}

export function RecordSubjectSlide(props: {
  classes: Record<string, string>;
  subject: Subject;
  questions: Answer[];
  i: number;
}): JSX.Element {
  const { classes, subject, questions, i } = props;
  const recorded = questions.filter((q) => q.status === Status.COMPLETE);
  const isRecorded = questions.length === recorded.length;

  function onRecord() {
    navigate(
      `/record?subject=${subject._id}&back=${encodeURI(`/setup?i=${i}`)}`
    );
  }

  return (
    <Paper className={classes.card}>
      <Typography variant="h3" className={classes.title}>
        {subject.name} questions
      </Typography>
      <div className={classes.column}>
        <Typography variant="h6" className={classes.text}>
          {subject.description}
        </Typography>
      </div>
      <Button
        data-cy="record-btn"
        className={classes.button}
        variant="contained"
        color="primary"
        onClick={onRecord}
      >
        Record
      </Button>
      {isRecorded ? (
        <CheckCircleIcon data-cy="check" style={{ color: "green" }} />
      ) : (
        <Typography variant="h6" className={classes.text}>
          {recorded.length} / {questions.length}
        </Typography>
      )}
    </Paper>
  );
}

interface TrainingState {
  statusUrl: string;
  trainData: TrainStatus;
  isBuilding: boolean;
}

const TRAIN_STATUS_POLL_INTERVAL_DEFAULT = 1000;
export function BuildMentorSlide(props: {
  classes: Record<string, string>;
  mentor: Mentor;
  onUpdated: () => void;
}): JSX.Element {
  const { classes, mentor, onUpdated } = props;
  const [trainingState, setTrainingState] = useState<TrainingState>({
    isBuilding: false,
    statusUrl: "",
    trainData: {
      state: TrainState.NONE,
    },
  });
  const { trainData, statusUrl, isBuilding } = trainingState;

  function trainAndBuild() {
    trainMentor(mentor._id)
      .then((trainJob) => {
        setTrainingState({
          ...trainingState,
          isBuilding: true,
          statusUrl: trainJob.statusUrl,
        });
      })
      .catch((err) => {
        setTrainingState({
          ...trainingState,
          trainData: {
            state: TrainState.FAILURE,
            status: err.message || `${err}`,
          },
          isBuilding: false,
        });
      });
  }

  interface CancellableFunc {
    (isCancelled: () => boolean): void;
  }

  function useInterval(callback: CancellableFunc, delay: number | null) {
    const savedCallback = React.useRef<CancellableFunc>();
    React.useEffect(() => {
      savedCallback.current = callback;
    });
    React.useEffect(() => {
      let mounted = true;
      function tick() {
        if (!mounted) {
          return;
        }
        if (savedCallback.current) {
          savedCallback.current(() => !mounted);
        }
      }
      if (delay) {
        const id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
      return () => {
        mounted = false;
      };
    }, [delay]);
  }

  useInterval(
    (isCancelled) => {
      fetchTrainingStatus(statusUrl)
        .then((trainStatus) => {
          if (isCancelled()) {
            return;
          }
          const nextState = {
            ...trainingState,
            trainData: trainStatus,
            isBuilding:
              trainStatus.state === TrainState.STARTED ||
              trainStatus.state === TrainState.PENDING,
          };
          setTrainingState(nextState);
          if (!nextState.isBuilding) {
            onUpdated();
          }
        })
        .catch((err: Error) => {
          console.error(err);
          setTrainingState({
            ...trainingState,
            trainData: { state: TrainState.FAILURE, status: err.message },
            isBuilding: false,
          });
        });
    },
    isBuilding ? TRAIN_STATUS_POLL_INTERVAL_DEFAULT : null
  );

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
    if (trainData.state === TrainState.FAILURE) {
      return (
        <div>
          <Typography variant="h6" className={classes.text}>
            Oops, training failed. Please try again.
          </Typography>
        </div>
      );
    }
    if (
      Boolean(mentor.lastTrainedAt) ||
      trainData.state === TrainState.SUCCESS
    ) {
      return (
        <div>
          <Typography variant="h6" className={classes.text}>
            Congratulations! Your brand-new mentor is ready!
          </Typography>
          <Typography variant="h6" className={classes.text}>
            Click the preview button to see your mentor.
          </Typography>
          <Typography variant="h6" className={classes.text}>
            Click the build button to retrain your mentor.
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

  return (
    <Paper className={classes.card}>
      <Typography variant="h3" className={classes.title}>
        Great job! You&apos;re ready to build your mentor!
      </Typography>
      <div className={classes.column}>{renderMessage()}</div>
      <div className={classes.row}>
        <Button
          data-cy="train-btn"
          className={classes.button}
          variant="contained"
          color="primary"
          disabled={isBuilding}
          onClick={trainAndBuild}
        >
          Build
        </Button>
        {mentor.lastTrainedAt ? (
          <Button
            data-cy="preview-btn"
            className={classes.button}
            variant="contained"
            color="secondary"
            disabled={isBuilding}
            onClick={() => {
              const path = `${window.location.origin}${CLIENT_ENDPOINT}?mentor=${mentor._id}`;
              window.location.href = path;
            }}
          >
            Preview
          </Button>
        ) : undefined}
      </div>
    </Paper>
  );
}
