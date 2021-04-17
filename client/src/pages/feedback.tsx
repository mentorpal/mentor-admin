/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState } from "react";
import {
  AppBar,
  CircularProgress,
  Fab,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";
import CloseIcon from "@material-ui/icons/Close";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import ThumbDownIcon from "@material-ui/icons/ThumbDown";
import { Autocomplete } from "@material-ui/lab";

import {
  fetchMentor,
  fetchTrainingStatus,
  fetchUserQuestions,
  trainMentor,
  updateUserQuestion,
} from "api";
import {
  Answer,
  ClassifierAnswerType,
  Connection,
  Feedback,
  Mentor,
  TrainState,
  TrainStatus,
  UserQuestion,
} from "types";
import { ColumnDef, ColumnHeader } from "components/column-header";
import NavBar from "components/nav-bar";
import withAuthorizationOnly from "wrap-with-authorization-only";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexFlow: "column",
  },
  container: {
    flex: 1,
    flexGrow: 1,
  },
  button: {
    margin: theme.spacing(1),
  },
  appBar: {
    height: "10%",
    top: "auto",
    bottom: 0,
  },
  fab: {
    position: "absolute",
    right: theme.spacing(1),
    zIndex: 1,
  },
  progress: {
    marginLeft: "50%",
  },
}));

const columnHeaders: ColumnDef[] = [
  {
    id: "feedback",
    label: "Feedback",
    minWidth: 50,
    align: "center",
    sortable: true,
  },
  {
    id: "confidence",
    label: "Confidence",
    minWidth: 50,
    align: "center",
    sortable: true,
  },
  {
    id: "question",
    label: "Question",
    minWidth: 100,
    align: "left",
    sortable: true,
  },
  {
    id: "classifierAnswer",
    label: "Classifier Match",
    minWidth: 300,
    align: "left",
    sortable: true,
  },
  {
    id: "graderAnswer",
    label: "Correct Match",
    minWidth: 300,
    align: "left",
    sortable: true,
  },
  {
    id: "updatedAt",
    label: "Date",
    minWidth: 100,
    align: "center",
    sortable: true,
  },
];

function FeedbackItem(props: {
  id: string;
  feedback: UserQuestion;
  mentor: Mentor;
  onUpdated: () => void;
}): JSX.Element {
  const { feedback, mentor, onUpdated } = props;

  async function onUpdateAnswer(answerId: string | undefined) {
    await updateUserQuestion(feedback._id, answerId || "");
    onUpdated();
  }

  return (
    <TableRow hover role="checkbox" tabIndex={-1}>
      <TableCell id="grade" align="center">
        {feedback.feedback === Feedback.BAD ? (
          <ThumbDownIcon style={{ color: "red" }} />
        ) : feedback.feedback === Feedback.GOOD ? (
          <ThumbUpIcon style={{ color: "green" }} />
        ) : undefined}
      </TableCell>
      <TableCell id="confidence" align="center">
        <Typography
          variant="body2"
          style={{
            color:
              feedback.classifierAnswerType === ClassifierAnswerType.OFF_TOPIC
                ? "red"
                : "",
          }}
        >
          {feedback.classifierAnswerType === ClassifierAnswerType.EXACT_MATCH
            ? "Exact"
            : feedback.classifierAnswerType === ClassifierAnswerType.PARAPHRASE
            ? "Paraphrase"
            : Math.round(feedback.confidence * 100) / 100}
        </Typography>
      </TableCell>
      <TableCell id="question" align="left">
        {feedback.question}
      </TableCell>
      <TableCell id="classifierAnswer" align="left">
        <Tooltip title={feedback.classifierAnswer?.transcript || ""}>
          <Typography variant="body2">
            {feedback.classifierAnswer?.question.question || ""}
          </Typography>
        </Tooltip>
      </TableCell>
      <TableCell id="graderAnswer" align="left">
        {feedback.classifierAnswerType ===
        ClassifierAnswerType.EXACT_MATCH ? undefined : (
          <div style={{ display: "flex", flexDirection: "row" }}>
            <Autocomplete
              id="select-answer"
              options={mentor.answers}
              getOptionLabel={(option: Answer) => option.question.question}
              onChange={(e, v) => {
                onUpdateAnswer(v?._id);
              }}
              style={{
                minWidth: 300,
                background: feedback.graderAnswer ? "#eee" : "",
                flexGrow: 1,
              }}
              renderOption={(option) => (
                <Typography align="left">{option.question.question}</Typography>
              )}
              renderInput={(params) => (
                <TextField {...params} variant="outlined" />
              )}
            />
            <IconButton onClick={() => onUpdateAnswer(undefined)}>
              <CloseIcon />
            </IconButton>
          </div>
        )}
        <Tooltip
          placement="top-start"
          title={feedback.graderAnswer?.transcript || ""}
        >
          <Typography variant="body2">
            {feedback.graderAnswer?.question.question || ""}
          </Typography>
        </Tooltip>
      </TableCell>
      <TableCell id="date" align="center">
        {feedback.updatedAt || ""}
      </TableCell>
    </TableRow>
  );
}

function FeedbackPage(props: { accessToken: string }): JSX.Element {
  const classes = useStyles();
  const [feedback, setFeedback] = useState<Connection<UserQuestion>>();
  const [cursor, setCursor] = React.useState("");
  const [sortBy, setSortBy] = React.useState("name");
  const [sortAscending, setSortAscending] = React.useState(false);
  const [feedbackFilter, setFeedbackFilter] = React.useState<Feedback>();
  const [
    confidenceFilter,
    setConfidenceFilter,
  ] = React.useState<ClassifierAnswerType>();
  const [classifierFilter, setClassifierFilter] = React.useState<Answer>();
  const [graderFilter, setGraderFilter] = React.useState<Answer>();
  const limit = 20;

  const [mentor, setMentor] = React.useState<Mentor>();
  const [statusUrl, setStatusUrl] = React.useState("");
  const [trainData, setTrainData] = React.useState<TrainStatus>({
    state: TrainState.NONE,
  });
  const [isTraining, setIsTraining] = useState(false);

  React.useEffect(() => {
    let mounted = true;
    fetchMentor(props.accessToken).then((m) => {
      if (!mounted) {
        return;
      }
      setMentor(m);
    });
    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    if (!mentor) {
      return;
    }
    let mounted = true;
    fetchFeedback().then((f) => {
      if (!mounted) {
        return;
      }
      setFeedback(f);
    });
    return () => {
      mounted = false;
    };
  }, [
    mentor,
    cursor,
    sortBy,
    sortAscending,
    feedbackFilter,
    confidenceFilter,
    classifierFilter,
    graderFilter,
  ]);

  async function fetchFeedback(): Promise<Connection<UserQuestion>> {
    const filter: {
      mentor?: string;
      classifierAnswer?: string;
      graderAnswer?: string;
      feedback?: Feedback;
      classifierAnswerType?: ClassifierAnswerType;
    } = { mentor: mentor?._id };
    if (feedbackFilter !== undefined) {
      filter["feedback"] = feedbackFilter;
    }
    if (classifierFilter !== undefined) {
      filter["classifierAnswer"] = classifierFilter._id;
    }
    if (graderFilter !== undefined) {
      filter["graderAnswer"] = graderFilter._id;
    }
    if (confidenceFilter !== undefined) {
      filter["classifierAnswerType"] = confidenceFilter;
    }
    return fetchUserQuestions({ filter, cursor, limit, sortBy, sortAscending });
  }

  async function loadFeedback(): Promise<void> {
    setFeedback(await fetchFeedback());
  }

  function train() {
    if (!mentor) {
      return;
    }
    trainMentor(mentor._id)
      .then((trainJob) => {
        setStatusUrl(trainJob.statusUrl);
        setIsTraining(true);
      })
      .catch((err) => {
        console.error(err);
        setTrainData({
          state: TrainState.FAILURE,
          status: err.message || `${err}`,
        });
        setIsTraining(false);
      });
  }

  function setSort(id: string) {
    if (sortBy === id) {
      setSortAscending(!sortAscending);
    } else {
      setSortBy(id);
    }
    setCursor("");
  }

  function useInterval(callback: () => void, delay: number | null): void {
    const savedCallback = React.useRef<() => void>();
    React.useEffect(() => {
      savedCallback.current = callback;
    });
    React.useEffect(() => {
      function tick() {
        if (savedCallback.current) {
          savedCallback.current();
        }
      }
      if (delay) {
        const id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
    }, [delay]);
  }

  const TRAIN_STATUS_POLL_INTERVAL_DEFAULT = 1000;
  useInterval(
    () => {
      fetchTrainingStatus(statusUrl)
        .then((trainStatus) => {
          setTrainData(trainStatus);
          if (
            trainStatus.state === TrainState.SUCCESS ||
            trainStatus.state === TrainState.FAILURE
          ) {
            setIsTraining(false);
          }
        })
        .catch((err: Error) => {
          setTrainData({ state: TrainState.FAILURE, status: err.message });
          setIsTraining(false);
          console.error(err);
        });
    },
    isTraining ? TRAIN_STATUS_POLL_INTERVAL_DEFAULT : null
  );

  if (!mentor || !feedback) {
    return (
      <div>
        <NavBar title="Feedback" mentorId={mentor?._id} />
        <CircularProgress />
      </div>
    );
  }

  return (
    <div>
      <NavBar title="Feedback" mentorId={mentor._id} />
      <div className={classes.root}>
        <Paper className={classes.container}>
          <TableContainer>
            <Table stickyHeader aria-label="sticky table">
              <ColumnHeader
                columns={columnHeaders}
                sortBy={sortBy}
                sortAsc={sortAscending}
                onSort={setSort}
              />
              <TableHead id="column-filter">
                <TableRow>
                  <TableCell align="center">
                    <Select
                      id="filter-feedback"
                      value={feedbackFilter}
                      style={{ flexGrow: 1, marginLeft: 10 }}
                      onChange={(
                        event: React.ChangeEvent<{
                          value: unknown;
                          name?: unknown;
                        }>
                      ) => {
                        setFeedbackFilter(event.target.value as Feedback);
                      }}
                    >
                      <MenuItem id="none" value={undefined}>
                        No Filter
                      </MenuItem>
                      <MenuItem id="good" value={Feedback.GOOD}>
                        {Feedback.GOOD}
                      </MenuItem>
                      <MenuItem id="bad" value={Feedback.BAD}>
                        {Feedback.BAD}
                      </MenuItem>
                      <MenuItem id="neutral" value={Feedback.NEUTRAL}>
                        {Feedback.NEUTRAL}
                      </MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell align="center">
                    <Select
                      id="filter-confidence"
                      value={feedbackFilter}
                      style={{ flexGrow: 1, marginLeft: 10 }}
                      onChange={(
                        event: React.ChangeEvent<{
                          value: unknown;
                          name?: unknown;
                        }>
                      ) => {
                        setConfidenceFilter(
                          event.target.value as ClassifierAnswerType
                        );
                      }}
                    >
                      <MenuItem id="none" value={undefined}>
                        No Filter
                      </MenuItem>
                      <MenuItem
                        id="exact"
                        value={ClassifierAnswerType.EXACT_MATCH}
                      >
                        Exact Match
                      </MenuItem>
                      <MenuItem
                        id="paraphrase"
                        value={ClassifierAnswerType.PARAPHRASE}
                      >
                        Paraphrase
                      </MenuItem>
                      <MenuItem
                        id="classifier"
                        value={ClassifierAnswerType.CLASSIFIER}
                      >
                        Classifier
                      </MenuItem>
                      <MenuItem
                        id="offtopic"
                        value={ClassifierAnswerType.OFF_TOPIC}
                      >
                        Off-Topic
                      </MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell />
                  <TableCell>
                    <Autocomplete
                      id="filter-classifier"
                      options={mentor.answers}
                      getOptionLabel={(option: Answer) =>
                        option.question.question
                      }
                      onChange={(e, v) => {
                        setClassifierFilter(v || undefined);
                      }}
                      style={{ minWidth: 300 }}
                      renderOption={(option) => (
                        <Typography align="left">
                          {option.question.question}
                        </Typography>
                      )}
                      renderInput={(params) => (
                        <TextField {...params} variant="outlined" />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Autocomplete
                      id="filter-grader"
                      options={mentor.answers}
                      getOptionLabel={(option: Answer) =>
                        option.question.question
                      }
                      onChange={(e, v) => {
                        setGraderFilter(v || undefined);
                      }}
                      style={{ minWidth: 300 }}
                      renderOption={(option) => (
                        <Typography align="left">
                          {option.question.question}
                        </Typography>
                      )}
                      renderInput={(params) => (
                        <TextField {...params} variant="outlined" />
                      )}
                    />
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody id="feedbacks">
                {feedback.edges.map((row, i) => (
                  <FeedbackItem
                    key={`feedback-${i}`}
                    id={`feedback-${i}`}
                    feedback={row.node}
                    mentor={mentor!}
                    onUpdated={loadFeedback}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        <AppBar position="sticky" color="default" className={classes.appBar}>
          <Toolbar>
            <IconButton
              id="prev-page"
              disabled={!feedback.pageInfo.hasPreviousPage}
              onClick={() =>
                setCursor("prev__" + feedback.pageInfo.startCursor)
              }
            >
              <KeyboardArrowLeftIcon />
            </IconButton>
            <IconButton
              id="next-page"
              disabled={!feedback.pageInfo.hasNextPage}
              onClick={() => setCursor("next__" + feedback.pageInfo.endCursor)}
            >
              <KeyboardArrowRightIcon />
            </IconButton>
            <Fab
              id="train-button"
              variant="extended"
              color="primary"
              className={classes.fab}
              onClick={train}
              disabled={isTraining}
            >
              {isTraining
                ? "Training..."
                : trainData.state === TrainState.FAILURE
                ? "Training Failed. Retry?"
                : "Train Mentor"}
            </Fab>
          </Toolbar>
        </AppBar>
      </div>
    </div>
  );
}

export default withAuthorizationOnly(FeedbackPage);
