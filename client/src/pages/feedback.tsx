/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and feedback to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { navigate } from "gatsby";
import React, { useContext, useState } from "react";
import { useCookies } from "react-cookie";
import {
  AppBar,
  CircularProgress,
  Fab,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";
import { Autocomplete } from "@material-ui/lab";

import { ColumnDef, ColumnHeader } from "components/column-header";
import NavBar from "components/nav-bar";
import Context from "context";
import {
  fetchMentor,
  fetchTrainingStatus,
  fetchUserQuestions,
  trainMentor,
  updateUserQuestion,
} from "api";
import {
  Answer,
  Connection,
  Mentor,
  TrainState,
  TrainStatus,
  UserQuestion,
} from "types";

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

const columns: ColumnDef[] = [
  {
    id: "feedback",
    label: "Feedback",
    minWidth: 100,
    align: "left",
    sortable: true,
  },
  {
    id: "confidence",
    label: "Confidence",
    minWidth: 100,
    align: "left",
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
    minWidth: 100,
    align: "left",
    sortable: true,
  },
  {
    id: "graderAnswer",
    label: "Correct Match",
    minWidth: 100,
    align: "left",
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
    if (answerId) {
      await updateUserQuestion(feedback._id, answerId);
      onUpdated();
    }
  }

  return (
    <TableRow hover role="checkbox" tabIndex={-1}>
      <TableCell id="grade" align="left">
        {feedback.feedback}
      </TableCell>
      <TableCell id="confidence" align="left">
        {feedback.confidence}
      </TableCell>
      <TableCell id="question" align="left">
        {feedback.question}
      </TableCell>
      <TableCell id="classifierAnswer" align="left">
        {feedback.classifierAnswer?.question.question || ""}
      </TableCell>
      <TableCell id="graderAnswer" align="left">
        <Autocomplete
          id="select-answer"
          options={mentor.answers}
          getOptionLabel={(option: Answer) => option.question.question}
          onChange={(e, v) => {
            onUpdateAnswer(v?._id);
          }}
          style={{ minWidth: 300 }}
          renderOption={(option) => (
            <Typography align="left">{option.question.question}</Typography>
          )}
          renderInput={(params) => <TextField {...params} variant="outlined" />}
        />
        {feedback.graderAnswer?.question.question || ""}
      </TableCell>
    </TableRow>
  );
}

function FeedbackPage(): JSX.Element {
  const classes = useStyles();
  const context = useContext(Context);
  const [cookies] = useCookies(["accessToken"]);
  const [feedback, setFeedback] = useState<Connection<UserQuestion>>();
  const [cursor, setCursor] = React.useState("");
  const [sortBy, setSortBy] = React.useState("name");
  const [sortAscending, setSortAscending] = React.useState(false);
  const limit = 10;

  const [mentor, setMentor] = React.useState<Mentor>();
  const [statusUrl, setStatusUrl] = React.useState("");
  const [trainData, setTrainData] = React.useState<TrainStatus>({
    state: TrainState.NONE,
  });
  const [isTraining, setIsTraining] = useState(false);

  React.useEffect(() => {
    if (!cookies.accessToken) {
      navigate("/login");
    }
  }, [cookies]);

  React.useEffect(() => {
    if (context.user) {
      fetchMentor(cookies.accessToken).then((m) => setMentor(m));
    }
  }, [context.user]);

  React.useEffect(() => {
    loadFeedback();
  }, [cursor, sortBy, sortAscending]);

  async function loadFeedback() {
    const filter = {};
    setFeedback(
      await fetchUserQuestions({ filter, cursor, limit, sortBy, sortAscending })
    );
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
      .catch((err: any) => {
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
        <NavBar title="Feedback" />
        <CircularProgress />
      </div>
    );
  }

  return (
    <div>
      <NavBar title="Feedback" />
      <div className={classes.root}>
        <Paper className={classes.container}>
          <TableContainer>
            <Table stickyHeader aria-label="sticky table">
              <ColumnHeader
                columns={columns}
                sortBy={sortBy}
                sortAsc={sortAscending}
                onSort={setSort}
              />
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

export default FeedbackPage;
