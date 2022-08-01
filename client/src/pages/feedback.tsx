/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useState } from "react";
import {
  AppBar,
  Button,
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
  customQuestionModalOpen: boolean;
  setCustomQuestionModalOpen: (customQuestionModalOpen: boolean) => void;
  mentor: Mentor;
  accessToken?: string;
  feedback: UserQuestion;
  mentorType: MentorType;
  mentorAnswers?: Answer[];
  mentorQuestions: Record<string, QuestionState>;
  onUpdated: () => void;
  queueList: string[];
  setQueueList: (queueList: string[]) => void;
}): JSX.Element {
  const {
    customQuestionModalOpen,
    setCustomQuestionModalOpen,
    mentor,
    accessToken,
    feedback,
    mentorAnswers,
    mentorQuestions,
    onUpdated,
    queueList,
    setQueueList,
  } = props;
  const [selectedAnswerStatus, setSelectedAnswerStatus] =
    React.useState<Status>(); // for disabling/enabling queue button
  const [selectedAnswerID, setSelectedAnswerID] = React.useState<string>();

  function formatMentorQuestions(
    mentorAnswers: Answer[],
    mentorQuestions: Record<string, QuestionState>
  ) {
    if (!mentorAnswers.length || !Object.keys(mentorQuestions).length) {
      return mentorAnswers;
    }
    const completeAnswers = mentorAnswers?.filter((mentorAnswer) =>
                    isAnswerComplete(mentorAnswer, undefined, props.mentorType)
                  ) || []
    const incompleteAnswers = mentorAnswers?.filter((mentorAnswer) =>
                    !isAnswerComplete(mentorAnswer, undefined, props.mentorType)
                  ) || []
  
    return completeAnswers.concat(incompleteAnswers);
  }

  // function to add/remove from queue
  async function queueButtonClicked(
    selectedAnswerID: string,
    accessToken: string
  ) {
    if (queueList.includes(selectedAnswerID)) {
      setQueueList(
        await removeQuestionFromRecordQueue(selectedAnswerID, accessToken)
      );
    } else if (!selectedAnswerID) {
      setCustomQuestionModalOpen(true);
    } else {
      setQueueList(
        await addQuestionToRecordQueue(selectedAnswerID, accessToken)
      );
    }
  }

  const handleClose = () => {
    setCustomQuestionModalOpen(false);
  };

  // TODO: MOVE THIS TO A HOOK
  async function onUpdateAnswer(answerId?: string) {
    setSelectedAnswerID(answerId || "");
    await updateUserQuestion(feedback._id, answerId || "");
    onUpdated();
  }

  return (
    <TableRow hover role="checkbox" tabIndex={-1}>
      <TableCell data-cy="grade" align="center">
        {feedback.feedback === Feedback.BAD ? (
          <ThumbDownIcon style={{ color: "red" }} />
        ) : feedback.feedback === Feedback.GOOD ? (
          <ThumbUpIcon style={{ color: "green" }} />
        ) : undefined}
      </TableCell>
      <TableCell data-cy="confidence" align="center">
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
      <TableCell data-cy="question" align="left">
        {feedback.question}
      </TableCell>
      <TableCell data-cy="classifierAnswer" align="left">
        <Tooltip title={feedback.classifierAnswer?.transcript || ""}>
          <Typography variant="body2">
            {getValueIfKeyExists(
              feedback.classifierAnswer.question,
              mentorQuestions
            )?.question?.question || ""}
          </Typography>
        </Tooltip>
      </TableCell>
      <TableCell data-cy="graderAnswer" align="left">
        {feedback.classifierAnswerType ===
        ClassifierAnswerType.EXACT_MATCH ? undefined : (
          <div style={{ display: "flex", flexDirection: "row" }}>
            <Autocomplete
              key={`${feedback._id}-${feedback.updatedAt}`}
              data-cy="select-answer"
              options={formatMentorQuestions(
                mentorAnswers || [],
                mentorQuestions
              )}
              getOptionLabel={(option: Answer) =>
                getValueIfKeyExists(option.question, mentorQuestions)?.question
                  ?.question || ""
              }
              onChange={(e, v) => {
                setSelectedAnswerStatus(v?.status);
                onUpdateAnswer(v?._id);
              }}
              style={{
                minWidth: 300,
                background: feedback.graderAnswer ? "#eee" : "",
                flexGrow: 1,
              }}
              renderOption={(option) => (
                <Typography
                  style={{
                    color:
                      option.status === Status.INCOMPLETE ? "grey" : "black",
                  }}
                  data-cy={`Drop-down-qu-${option._id}`}
                  align="left"
                >
                  {getValueIfKeyExists(option.question, mentorQuestions)
                    ?.question?.question || ""}
                </Typography>
              )}
              renderInput={(params) => (
                <TextField {...params} variant="outlined" />
              )}
            />
            <IconButton onClick={() => onUpdateAnswer(undefined)}>
              <CloseIcon />
            </IconButton>

            {accessToken ? (
              <Button
                data-cy="queue-btn"
                color="primary"
                disabled={selectedAnswerStatus === Status.COMPLETE}
                onClick={() => {
                  queueButtonClicked(selectedAnswerID || "", accessToken);
                }}
              >
                {queueList.includes(selectedAnswerID || "")
                  ? "Remove from Queue"
                  : "Add to Queue"}
              </Button>
            ) : undefined}

            {/* {modal} */}
            <EditQuestionForQueueModal
              handleClose={handleClose}
              open={customQuestionModalOpen}
              mentor={mentor}
              userQuestion={feedback.question}
              accessToken={accessToken || ""}
            />
          </div>
        )}
        <Tooltip
          placement="top-start"
          title={feedback.graderAnswer?.transcript || ""}
        >
          <Typography variant="body2">
            {getValueIfKeyExists(
              feedback.graderAnswer?.question,
              mentorQuestions
            )?.question?.question || ""}
          </Typography>
        </Tooltip>
      </TableCell>
      <TableCell data-cy="date" align="center">
        {feedback.updatedAt
          ? new Date(feedback.updatedAt).toLocaleString()
          : ""}
      </TableCell>
    </TableRow>
  );
}

function FeedbackPage(): JSX.Element {
  const classes = useStyles();
  const {
    getData,
    isLoading: isMentorLoading,
    error: mentorError,
  } = useActiveMentor();
  const { state: loginState } = useWithLogin();
  const mentorId = getData((state) => state.data?._id);
  const mentor = getData((state) => state.data);
  const mentorType = getData((state) => state.data?.mentorType);
  const mentorAnswers: Answer[] = getData((state) => state.data?.answers);
  const [needsFiltering, setNeedsFiltering] = useState<boolean>(false);

  const mentorQuestions = useQuestions(
    (state) => state.questions,
    (mentorAnswers || []).map((a) => a.question)
  );

  const questionsLoading = isQuestionsLoading(
    (mentorAnswers || []).map((a) => a.question)
  );

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
  } = useWithFeedback();

  const [customQuestionModalOpen, setCustomQuestionModalOpen] =
    useState<boolean>(false); // condition for opening modal
  const [initialLoad, setInitialLoad] = useState<boolean>(false);
  const [queueList, setQueueList] = useState<string[]>([]);
  useEffect(() => {
    fetchMentorRecordQueue(loginState.accessToken || "").then((queueList) => {
      setQueueList(queueList);
    });
  }, []);

  useEffect(() => {
    if (mentorId) {
      if (!isFeedbackLoading) {
        filterFeedback({ mentor: mentorId });
      } else {
        setNeedsFiltering(true);
      }
    }
  }, [mentorId]);

  useEffect(() => {
    if (!isFeedbackLoading && needsFiltering) {
      filterFeedback({ mentor: mentorId });
      setNeedsFiltering(false);
    }
  }, [needsFiltering, isFeedbackLoading]);

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

  return (
    <div>
      <NavBar title="Feedback" mentorId={mentorId} />
      <div className={classes.root}>
        <Paper className={classes.container}>
          <TableContainer>
            <Table stickyHeader aria-label="sticky table">
              <ColumnHeader
                columns={columnHeaders}
                sortBy={feedbackSearchParams.sortBy}
                sortAsc={feedbackSearchParams.sortAscending}
                onSort={sortFeedback}
              />
              <TableHead data-cy="column-filter">
                <TableRow>
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
                  <TableCell />
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
                          classifierAnswer: v || undefined,
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
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody data-cy="feedbacks">
                {feedback?.edges.map((row, i) => (
                  <FeedbackItem
                    key={`feedback-${i}`}
                    accessToken={loginState.accessToken}
                    data-cy={`feedback-${i}`}
                    feedback={row.node}
                    mentorType={mentorType}
                    mentorAnswers={mentorAnswers}
                    mentorQuestions={mentorQuestions}
                    onUpdated={reloadFeedback}
                    queueList={queueList}
                    setQueueList={setQueueList}
                    setCustomQuestionModalOpen={setCustomQuestionModalOpen}
                    customQuestionModalOpen={customQuestionModalOpen}
                    mentor={mentor}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        <AppBar position="sticky" color="default" className={classes.appBar}>
          <Toolbar>
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
          </Toolbar>
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
