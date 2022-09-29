/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useCallback, useEffect, useState } from "react";
import {
  AppBar,
  Button,
  Fab,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";
import { Autocomplete } from "@material-ui/lab";

//IMPORT FUNCTIONS
import {
  updateUserQuestion,
  addQuestionToRecordQueue,
  removeQuestionFromRecordQueue,
  fetchMentorRecordQueue,
} from "api";
import {
  Answer,
  ClassifierAnswerType,
  Feedback,
  Mentor,
  Status,
  MentorType,
  UserQuestion,
} from "types";
import { ColumnDef, ColumnHeader } from "components/column-header";
import NavBar from "components/nav-bar";
import { useActiveMentor } from "store/slices/mentor/useActiveMentor";
import { useWithTraining } from "hooks/task/use-with-train";
import withAuthorizationOnly from "hooks/wrap-with-authorization-only";
import { useWithFeedback } from "hooks/graphql/use-with-feedback";
import { ErrorDialog, LoadingDialog } from "components/dialog";
import {
  isQuestionsLoading,
  useQuestions,
} from "store/slices/questions/useQuestions";
import { getValueIfKeyExists, isAnswerComplete } from "helpers";
import { QuestionState } from "store/slices/questions";
import { useWithLogin } from "store/slices/login/useWithLogin";
import EditQuestionForQueueModal from "components/feedback/edit-question-for-queue-modal";
import { useWithRecordQueue } from "hooks/graphql/use-with-record-queue";
import FeedbackItem from "components/feedback/feedback-item";
import { useWithTrendingFeedback } from "hooks/use-with-trending-feedback";
import { LoadingStatusType } from "hooks/graphql/generic-loading-reducer";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexFlow: "column",
    height: "100vh", //
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
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    right: theme.spacing(1),
    zIndex: 1,
    width: 100,
  },
  progress: {
    marginLeft: "50%",
  },
}));

const columnHeaders: ColumnDef[] = [
  {
    id: "dismiss",
    label: "",
    minWidth: 10,
    align: "center",
  },
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

function FeedbackPage(): JSX.Element {
  const classes = useStyles();
  const {
    getData,
    isLoading: isMentorLoading,
    error: mentorError,
    loadMentor,
  } = useActiveMentor();
  const { state: loginState } = useWithLogin();
  const mentorId = getData((state) => state.data?._id);
  const mentor = getData((state) => state.data);
  const mentorType = getData((state) => state.data?.mentorType);
  const mentorAnswers: Answer[] = getData((state) => state.data?.answers);
  const [needsFiltering, setNeedsFiltering] = useState<boolean>(false);
  const [feedbackItems, setFeedbackItems] = useState<JSX.Element[]>([]);
  const [viewingAll, setViewingAll] = useState<boolean>(false);
  const { bestRepIds: trendingUserQuestionIds, loadingStatus: trendQuestionsLoadStatus } = useWithTrendingFeedback();
  const mentorQuestions = useQuestions(
    (state) => state.questions,
    (mentorAnswers || []).map((a) => a.question)
  );

  const questionsLoading = isQuestionsLoading(
    (mentorAnswers || []).map((a) => a.question)
  );

  const trendingQuestionsSearchParam = {
    limit: 20,
    sortBy: "createdAt",
    sortAscending: false,
    cursor: "",
    filter: {
      _id: { $in: trendingUserQuestionIds },
      mentor: mentorId
    },
  };

  const viewAllQuestionsSearchParam = {
    limit: 20,
    sortBy: "createdAt",
    cursor: "",
    sortAscending: false,
    filter: { mentor: mentorId },
  };

  const {
    isPolling: isTraining,
    error: trainError,
    startTask: startTraining,
  } = useWithTraining();
  const {
    data: feedback,
    isLoading: isFeedbackLoading,
    searchParams: feedbackSearchParams,
    sortBy: sortFeedback,
    filter: filterFeedback,
    reloadData: reloadFeedback,
    nextPage: feedbackNextPage,
    prevPage: feedbackPrevPage,
    setSearchParams: setFeedbackSearchParams,
  } = useWithFeedback(viewAllQuestionsSearchParam);
  const [initialLoad, setInitialLoad] = useState<boolean>(false);
  const {
    recordQueue: queueList,
    removeQuestionFromQueue,
    addQuestionToQueue,
  } = useWithRecordQueue(loginState.accessToken || "");

  function onViewAllQuestions(event: React.ChangeEvent<HTMLInputElement>) {
    const displayAllQuestions = event.target.checked;
    setViewingAll(displayAllQuestions);
    if (displayAllQuestions) {
      setFeedbackSearchParams((prevValue) => {
        return {
          ...prevValue,
          ...viewAllQuestionsSearchParam,
        };
      });
    } else {
      setFeedbackSearchParams((prevValue) => {
        return {
          ...prevValue,
          ...trendingQuestionsSearchParam,
        };
      });
    }
  }

  const [showExactConfidence, setShowExactConfidence] =
    useState<boolean>(false);
  function onShowExactConfidence(event: React.ChangeEvent<HTMLInputElement>) {
    setShowExactConfidence(event.target.checked);
  }
  const label = { inputProps: { "aria-label": "Switch demo" } };

  useEffect(() => {
    if (mentorId && trendQuestionsLoadStatus === LoadingStatusType.SUCCESS) {
      console.log("success")
      console.log(trendingQuestionsSearchParam)
      if (!isFeedbackLoading) {
        setFeedbackSearchParams(trendingQuestionsSearchParam);
      } else {
        setNeedsFiltering(true);
      }
    }
  }, [mentorId, trendQuestionsLoadStatus]);

  useEffect(() => {
    if (!isFeedbackLoading && needsFiltering) {
      setFeedbackSearchParams(trendingQuestionsSearchParam);
      setNeedsFiltering(false);
    }
  }, [needsFiltering, isFeedbackLoading]);

  useEffect(() => {
    if (!feedback || !mentor) {
      return;
    }
    const feedbackEdges = feedback.edges.filter((edge) => Boolean(edge.node));
    const feedbackItems = feedbackEdges.map((row, i) => (
      <FeedbackItem
        feedback={row.node}
        accessToken={loginState.accessToken}
        mentorType={mentorType}
        mentorAnswers={mentorAnswers || []}
        mentorQuestions={mentorQuestions}
        mentor={mentor}
        queueList={queueList}
        key={`feedback-${i}`}
        data-cy={`feedback-${i}`}
        onUpdated={reloadFeedback}
        addQuestionToQueue={addQuestionToQueue}
        removeQuestionFromQueue={removeQuestionFromQueue}
        viewingAll={viewingAll}
      />
    ));
    setFeedbackItems(feedbackItems);
  }, [
    feedback,
    loginState.accessToken,
    mentorType,
    mentorAnswers,
    mentorQuestions,
    mentor,
    queueList,
    viewingAll,
  ]);

  const initialDisplayReady =
    mentor && !isMentorLoading && !questionsLoading && !isFeedbackLoading;

  if (!initialLoad && initialDisplayReady) {
    setInitialLoad(true);
  }

  if (!initialLoad && !initialDisplayReady) {
    return (
      <div>
        <NavBar title="Feedback" mentorId={mentorId} />
        <LoadingDialog
          title={
            isMentorLoading || isFeedbackLoading
              ? "Loading..."
              : isTraining
              ? "Building mentor..."
              : ""
          }
        />
      </div>
    );
  }

  const reloadMentor = (cb: () => void) => {
    loadMentor();
    cb();
  };

  return (
    <div>
      <NavBar title="Feedback" mentorId={mentorId} onNav={reloadMentor} />
      <div className={classes.root}>
        <Paper className={classes.container}>
          <TableContainer>
            <Table stickyHeader aria-label="sticky table">
              <ColumnHeader
                columns={viewingAll ? columnHeaders.slice(1) : columnHeaders}
                sortBy={feedbackSearchParams.sortBy}
                sortAsc={feedbackSearchParams.sortAscending}
                onSort={sortFeedback}
              />
              <TableHead data-cy="column-filter">
                <TableRow>
                  {viewingAll ? undefined : <TableCell></TableCell>}
                  <TableCell align="center">
                    <Select
                      data-cy="filter-feedback"
                      value={feedbackSearchParams.filter.feedback}
                      style={{ flexGrow: 1, marginLeft: 10 }}
                      onChange={(
                        event: React.ChangeEvent<{
                          value: unknown;
                          name?: unknown;
                        }>
                      ) =>
                        filterFeedback({
                          ...feedbackSearchParams.filter,
                          feedback: event.target.value as Feedback,
                        })
                      }
                    >
                      <MenuItem data-cy="none" value={undefined}>
                        No Filter
                      </MenuItem>
                      <MenuItem data-cy="good" value={Feedback.GOOD}>
                        {Feedback.GOOD}
                      </MenuItem>
                      <MenuItem data-cy="bad" value={Feedback.BAD}>
                        {Feedback.BAD}
                      </MenuItem>
                      <MenuItem data-cy="neutral" value={Feedback.NEUTRAL}>
                        {Feedback.NEUTRAL}
                      </MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell align="center">
                    <Select
                      data-cy="filter-confidence"
                      value={feedbackSearchParams.filter.ClassifierAnswerType}
                      style={{ flexGrow: 1, marginLeft: 10 }}
                      onChange={(
                        event: React.ChangeEvent<{
                          value: unknown;
                          name?: unknown;
                        }>
                      ) =>
                        filterFeedback({
                          ...feedbackSearchParams.filter,
                          classifierAnswerType: event.target
                            .value as ClassifierAnswerType,
                        })
                      }
                    >
                      <MenuItem data-cy="none" value={undefined}>
                        No Filter
                      </MenuItem>
                      <MenuItem
                        data-cy="exact"
                        value={ClassifierAnswerType.EXACT_MATCH}
                      >
                        Exact Match
                      </MenuItem>
                      <MenuItem
                        data-cy="paraphrase"
                        value={ClassifierAnswerType.PARAPHRASE}
                      >
                        Paraphrase
                      </MenuItem>
                      <MenuItem
                        data-cy="classifier"
                        value={ClassifierAnswerType.CLASSIFIER}
                      >
                        Classifier
                      </MenuItem>
                      <MenuItem
                        data-cy="offtopic"
                        value={ClassifierAnswerType.OFF_TOPIC}
                      >
                        Off-Topic
                      </MenuItem>
                    </Select>
                  </TableCell>
                  <TableCell>{/* Empty Question Column */}</TableCell>
                  <TableCell>
                    <Autocomplete
                      data-cy="filter-classifier"
                      options={mentorAnswers || []}
                      value={feedbackSearchParams.filter.classifierAnswer}
                      getOptionLabel={(option: Answer) =>
                        getValueIfKeyExists(option.question, mentorQuestions)
                          ?.question?.question || ""
                      }
                      onChange={(e, v) =>
                        filterFeedback({
                          ...feedbackSearchParams.filter,
                          classifierAnswer: v?._id || undefined,
                        })
                      }
                      style={{ minWidth: 300 }}
                      renderOption={(option) => (
                        <Typography align="left">
                          {getValueIfKeyExists(option.question, mentorQuestions)
                            ?.question?.question || ""}
                        </Typography>
                      )}
                      renderInput={(params) => (
                        <TextField {...params} variant="outlined" />
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Autocomplete
                      data-cy="filter-grader"
                      options={mentorAnswers || []}
                      getOptionLabel={(option: Answer) =>
                        getValueIfKeyExists(option.question, mentorQuestions)
                          ?.question?.question || ""
                      }
                      onChange={(e, v) =>
                        filterFeedback({
                          ...feedbackSearchParams.filter,
                          graderAnswer: v || undefined,
                        })
                      }
                      style={{ minWidth: 300 }}
                      renderOption={(option) => (
                        <Typography align="left">
                          {getValueIfKeyExists(option.question, mentorQuestions)
                            ?.question?.question || ""}
                        </Typography>
                      )}
                      renderInput={(params) => (
                        <TextField {...params} variant="outlined" />
                      )}
                    />
                  </TableCell>
                  <TableCell>{/* Empty Date column */}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody data-cy="feedbacks">{feedbackItems}</TableBody>
            </Table>
          </TableContainer>
        </Paper>
        <AppBar position="sticky" color="default" className={classes.appBar}>
          <Toolbar style={{ width: "fit-content" }}>
            <IconButton
              data-cy="prev-page"
              disabled={!feedback?.pageInfo.hasPreviousPage}
              onClick={feedbackPrevPage}
            >
              <KeyboardArrowLeftIcon />
            </IconButton>
            <IconButton
              data-cy="next-page"
              disabled={!feedback?.pageInfo.hasNextPage}
              onClick={feedbackNextPage}
            >
              <KeyboardArrowRightIcon />
            </IconButton>
            <span style={{ margin: "15px" }}>
              <Switch
                data-cy="filter-feedback-switch"
                {...label}
                onChange={onViewAllQuestions}
              />
              Show All Questions
            </span>
            <span style={{ margin: "15px" }}>
              <Switch
                data-cy="show-exact-confidence-switch"
                {...label}
                onChange={onShowExactConfidence}
              />
              Show Exact Confidence
            </span>
          </Toolbar>
          <Fab
            data-cy="train-button"
            variant="extended"
            color="primary"
            className={classes.fab}
            onClick={() => {
              if (mentorId) startTraining(mentorId);
            }}
            disabled={isTraining || isMentorLoading || isFeedbackLoading}
          >
            Train Mentor
          </Fab>
        </AppBar>
      </div>
      <LoadingDialog
        title={
          isMentorLoading || isFeedbackLoading
            ? "Loading..."
            : isTraining
            ? "Building mentor..."
            : ""
        }
      />
      <ErrorDialog error={mentorError || trainError} />
    </div>
  );
}

export default withAuthorizationOnly(FeedbackPage);
