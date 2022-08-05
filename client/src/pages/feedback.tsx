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
  mentor: Mentor;
  accessToken?: string;
  feedback: UserQuestion;
  viewAllQuestions: boolean;
  showExactConfidence: boolean;
  mentorType: MentorType;
  mentorAnswers?: Answer[];
  mentorQuestions: Record<string, QuestionState>;
  onUpdated: () => void;
  queueList: string[];
  setQueueList: (queueList: string[]) => void;
}): JSX.Element {
  const {
    mentor,
    accessToken,
    feedback,
    viewAllQuestions,
    showExactConfidence,
    mentorAnswers,
    mentorQuestions,
    onUpdated,
    queueList,
    setQueueList,
  } = props;
  const [selectedAnswer, setSelectedAnswer] = React.useState<Answer>();
  const [customQuestionModalOpen, setCustomQuestionModalOpen] =
    useState<boolean>(false);
  const [queueButtonText, setQueueButtonText] = useState<boolean>(false);

  // language-specific alphabetic sort ordering, ignoring cases or diacritics
  function formatMentorQuestions(
    mentorAnswers: Answer[],
    mentorQuestions: Record<string, QuestionState>
  ) {
    if (!mentorAnswers.length || !Object.keys(mentorQuestions).length) {
      return mentorAnswers;
    }
    const completeAnswers = Array.from(
      mentorAnswers.filter((mentorAnswer) =>
        isAnswerComplete(mentorAnswer, undefined, props.mentorType)
      )
    ).sort((a, b) => {
      return (
        mentorQuestions[a.question]?.question?.question || ""
      ).localeCompare(
        mentorQuestions[b.question]?.question?.question || "",
        "en",
        { sensitivity: "base" }
      );
    });
    const incompleteAnswers = Array.from(
      mentorAnswers.filter(
        (mentorAnswer) =>
          !isAnswerComplete(mentorAnswer, undefined, props.mentorType)
      )
    ).sort((a, b) => {
      return (
        mentorQuestions[a.question]?.question?.question || ""
      ).localeCompare(
        mentorQuestions[b.question]?.question?.question || "",
        "en",
        { sensitivity: "base" }
      );
    });
    return completeAnswers.concat(incompleteAnswers);
  }

  // function to add/remove from queue/create question
  async function queueButtonClicked() {
    if (!selectedAnswer) {
      setCustomQuestionModalOpen(true);
    } else if (props.queueList.includes(selectedAnswer.question)) {
      setQueueList(
        await removeQuestionFromRecordQueue(
          props.accessToken || "",
          selectedAnswer.question
        )
      );
      setQueueButtonText(false);
    } else {
      setQueueList(
        await addQuestionToRecordQueue(
          props.accessToken || "",
          selectedAnswer.question
        )
      );
      setQueueButtonText(true);
    }
  }

  const handleClose = () => {
    setQueueList(queueList);
    setCustomQuestionModalOpen(false);
  };

  // TODO: MOVE THIS TO A HOOK
  async function onUpdateAnswer(answer?: Answer) {
    setSelectedAnswer(answer);
    setQueueButtonText(queueList.includes(answer?.question || ""));
    !answer?._id
      ? await updateUserQuestion(
          feedback._id,
          "",
          answer?.question || "",
          mentor._id
        )
      : await updateUserQuestion(feedback._id, answer._id, "", "");
    if (viewAllQuestions) {
      onUpdated();
    }
  }

  function inConfidenceRange(min: number, max: number) {
    const confidence = Math.round(feedback.confidence * 100) / 100;
    return confidence >= min && confidence < max;
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
          {showExactConfidence
            ? feedback.classifierAnswerType === ClassifierAnswerType.EXACT_MATCH
              ? "Exact"
              : feedback.classifierAnswerType ===
                ClassifierAnswerType.PARAPHRASE
              ? "Paraphrase"
              : Math.round(feedback.confidence * 100) / 100
            : Math.round(feedback.confidence * 100) / 100 < -0.55
            ? "OFF TOPIC"
            : inConfidenceRange(-0.55, -0.45)
            ? "LOW"
            : inConfidenceRange(-0.45, -0.1)
            ? "MEDIUM"
            : "HIGH"}
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
              key={`${feedback._id}-${feedback.updatedAt}-${selectedAnswer?._id}`}
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
                onUpdateAnswer(v || undefined);
              }}
              style={{
                minWidth: 300,
                background: feedback.graderAnswer ? "#eee" : "",
                flexGrow: 1,
              }}
              renderOption={(option) => (
                <Typography
                  style={{
                    color: option.status === Status.COMPLETE ? "black" : "grey",
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
            <IconButton
              onClick={() => {
                onUpdateAnswer(undefined);
                setQueueButtonText(false);
              }}
            >
              <CloseIcon
                onClick={() => {
                  setSelectedAnswer(undefined);
                  setQueueButtonText(false);
                }}
              />
            </IconButton>

            {accessToken ? (
              <Button
                data-cy="queue-btn"
                color="primary"
                disabled={selectedAnswer?.status === Status.COMPLETE}
                onClick={() => {
                  queueButtonClicked();
                }}
              >
                {queueButtonText ? "Remove from Queue" : "Add to Queue"}
              </Button>
            ) : undefined}

            {/* {modal} */}
            <EditQuestionForQueueModal
              handleClose={handleClose}
              open={customQuestionModalOpen}
              mentor={mentor}
              accessToken={accessToken || ""}
              feedback={props.feedback}
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
    loadMentor,
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
  const [initialLoad, setInitialLoad] = useState<boolean>(false);
  const [queueList, _setQueueList] = useState<string[]>([]);
  const [questionsAddedToQueue, setQuestionsAddedToQueue] = useState(false);
  // TODO: On back, reload mentor if new questions were added to queue

  useEffect(() => {
    fetchMentorRecordQueue(loginState.accessToken || "").then((queueList) => {
      _setQueueList(queueList);
    });
  }, []);

  //Trending Feedback task:
  const [viewAllQuestions, setViewAllQuestions] = useState<boolean>(false);
  function onViewAllQuestions(event: React.ChangeEvent<HTMLInputElement>) {
    setViewAllQuestions(event.target.checked);
  }
  const [showExactConfidence, setShowExactConfidence] =
    useState<boolean>(false);
  function onShowExactConfidence(event: React.ChangeEvent<HTMLInputElement>) {
    setShowExactConfidence(event.target.checked);
  }
  const label = { inputProps: { "aria-label": "Switch demo" } };

  const questionsToDisplay = feedback?.edges.filter((edge) =>
    viewAllQuestions
      ? edge.node
      : (edge.node.feedback === Feedback.BAD ||
          edge.node.classifierAnswerType === ClassifierAnswerType.OFF_TOPIC ||
          edge.node.confidence <= -0.45) &&
        !edge.node.graderAnswer.question &&
        !edge.node.hasBeenUsedtoCreateNewQuestion
  );

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

  function setQueueList(queueList: string[]) {
    setQuestionsAddedToQueue(true);
    _setQueueList(queueList);
  }

  // TODO: This reload is a workaround. What we need is a redux dispatch to load a set of answers afters
  const reloadMentor = useCallback(
    (cb: () => void) => {
      if (!mentorId) {
        cb();
        return;
      }
      if (questionsAddedToQueue) {
        loadMentor();
      }
      cb();
    },
    [mentorId, questionsAddedToQueue]
  );

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
      <NavBar title="Feedback" mentorId={mentorId} onNav={reloadMentor} />
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
                      getOptionLabel={(option: Answer) =>
                        getValueIfKeyExists(option.question, mentorQuestions)
                          ?.question?.question || ""
                      }
                      onChange={(e, v) => {
                        console.log(v);
                        filterFeedback({
                          ...feedbackSearchParams.filter,
                          classifierAnswer: v || undefined,
                        });
                      }}
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
                {questionsToDisplay?.map((row, i) => (
                  <FeedbackItem
                    key={`feedback-${i}`}
                    accessToken={loginState.accessToken}
                    data-cy={`feedback-${i}`}
                    feedback={row.node}
                    viewAllQuestions={viewAllQuestions}
                    showExactConfidence={showExactConfidence}
                    onUpdated={reloadFeedback}
                    mentorType={mentorType}
                    mentorAnswers={mentorAnswers}
                    mentorQuestions={mentorQuestions}
                    queueList={queueList}
                    setQueueList={setQueueList}
                    mentor={mentor}
                  />
                ))}
              </TableBody>
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
