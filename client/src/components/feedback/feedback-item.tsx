/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useState } from "react";
import {
  Button,
  IconButton,
  TableCell,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import ThumbUpIcon from "@material-ui/icons/ThumbUp";
import ThumbDownIcon from "@material-ui/icons/ThumbDown";
import { Autocomplete } from "@material-ui/lab";

//IMPORT FUNCTIONS
import { updateDismissUserQuestion, updateUserQuestion } from "api";
import {
  Answer,
  ClassifierAnswerType,
  Feedback,
  Mentor,
  Status,
  MentorType,
  UserQuestion,
} from "types";
import { getValueIfKeyExists, isAnswerComplete } from "helpers";
import { QuestionState } from "store/slices/questions";
import EditQuestionForQueueModal from "components/feedback/edit-question-for-queue-modal";

function FeedbackItem(props: {
  mentor: Mentor;
  accessToken?: string;
  feedback: UserQuestion;
  mentorType: MentorType;
  mentorAnswers: Answer[];
  mentorQuestions: Record<string, QuestionState>;
  queueList: string[];
  removeQuestionFromQueue: (id: string) => void;
  addQuestionToQueue: (id: string) => void;
  onUpdated: () => void;
  viewingAll: boolean;
}): JSX.Element {
  const {
    mentor,
    accessToken,
    feedback,
    mentorAnswers,
    mentorQuestions,
    onUpdated,
    queueList,
    removeQuestionFromQueue,
    addQuestionToQueue,
    viewingAll,
  } = props;
  const [customQuestionModalOpen, setCustomQuestionModalOpen] =
    useState<boolean>(false);
  const [feedbackQuestionDocId, setFeedbackQuestionDocId] =
    useState<string>("");
  const [currentGraderAnswer, setCurrentGraderAnswer] = useState<
    Answer | undefined
  >(feedback.graderAnswer);
  const [dismissedValue, setDismissedValue] = useState<boolean>(
    Boolean(feedback.dismissed)
  );
  const [dismissInProgress, setDismissInProgress] = useState<boolean>(false);

  useEffect(() => {
    if (
      feedback.graderAnswer &&
      currentGraderAnswer?._id !== feedback.graderAnswer._id
    ) {
      setCurrentGraderAnswer(feedback.graderAnswer);
    }
    if (dismissedValue !== Boolean(feedback.dismissed)) {
      setDismissedValue(Boolean(feedback.dismissed));
    }
  }, [feedback.graderAnswer, feedback.dismissed]);

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

  const handleClose = () => {
    setCustomQuestionModalOpen(false);
    onUpdated();
  };

  async function onUpdateAnswer(answer?: Answer) {
    await updateUserQuestion(
      feedback._id,
      answer?._id,
      answer?.question,
      mentor._id
    );
    setCurrentGraderAnswer(answer);
  }

  const userQuestionButton = () => {
    const mentorQuestionsInQueue = queueList.reduce(
      (acc: Record<string, QuestionState>, cur: string) => {
        if (cur in mentorQuestions) {
          acc[cur] = mentorQuestions[cur];
        }
        return acc;
      },
      {}
    );
    const questionDocId =
      feedbackQuestionDocId ||
      // First check mentorQuestions that are in queue
      Object.values(mentorQuestionsInQueue).find(
        (question) => question.question?.question === feedback.question
      )?.question?._id ||
      // Then check all mentorQuestions
      Object.values(mentorQuestions).find(
        (question) => question.question?.question === feedback.question
      )?.question?._id;
    const userQuestionAlreadyAnswered = Boolean(
      questionDocId &&
        mentorAnswers.find((answer) => {
          return (
            answer.question === questionDocId &&
            isAnswerComplete(answer, undefined, props.mentorType)
          );
        })
    );
    if (
      Boolean(currentGraderAnswer?.question) ||
      feedback.classifierAnswerType === ClassifierAnswerType.EXACT_MATCH ||
      userQuestionAlreadyAnswered
    ) {
      return <></>;
    }
    const questionIsInQueue = Boolean(
      questionDocId &&
        queueList.find((questionId) => questionId === questionDocId)
    );
    return (
      <Button
        data-cy="user-question-queue-btn"
        color="primary"
        style={{ fontSize: "12px" }}
        onClick={() => {
          if (questionIsInQueue && questionDocId) {
            removeQuestionFromQueue(questionDocId);
          } else {
            const questionId = questionDocId;
            if (questionId) {
              //if question doc already exists
              addQuestionToQueue(questionId);
            } else {
              //question doc does not already exist
              setCustomQuestionModalOpen(true);
            }
          }
        }}
      >
        {questionIsInQueue ? "Remove from queue" : "Add to queue"}
      </Button>
    );
  };

  const graderAnswerButton = () => {
    const answerDoc = mentorAnswers.find(
      (mentorAnswer) => mentorAnswer._id === currentGraderAnswer?._id
    );
    if (
      !answerDoc ||
      isAnswerComplete(answerDoc, undefined, props.mentorType) ||
      feedback.classifierAnswerType === ClassifierAnswerType.EXACT_MATCH
    ) {
      return <></>;
    }
    // There is a grader answer that is not complete
    const questionIsInQueue = Boolean(
      queueList.find((questionId) => questionId === answerDoc.question)
    );
    return (
      <Button
        data-cy="grader-answer-queue-btn"
        color="primary"
        onClick={() => {
          if (questionIsInQueue) {
            removeQuestionFromQueue(answerDoc.question);
          } else {
            addQuestionToQueue(answerDoc.question);
          }
        }}
      >
        {questionIsInQueue ? "Remove from queue" : "Add to queue"}
      </Button>
    );
  };

  function onDismissed(): void {
    setDismissInProgress(true);
    const oldDismissedValue = dismissedValue;
    const newDismissedValue = !dismissedValue;
    setDismissedValue(newDismissedValue);
    updateDismissUserQuestion(
      feedback._id,
      newDismissedValue,
      accessToken || ""
    )
      .then(() => {
        setDismissInProgress(false);
      })
      .catch((err) => {
        console.error("Failed to update dismissedvalue value", err);
        setDismissedValue(oldDismissedValue);
        setDismissInProgress(false);
      });
  }

  return (
    <TableRow
      hover
      role="checkbox"
      tabIndex={-1}
      data-cy={`row-${feedback._id}`}
      style={{ opacity: dismissedValue && !viewingAll ? 0.4 : 1 }}
    >
      {viewingAll ? undefined : (
        <TableCell>
          <Button disabled={dismissInProgress} onClick={onDismissed}>
            {dismissedValue ? "Enable" : "Dismiss"}
          </Button>
        </TableCell>
      )}
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
        {feedback.question} {userQuestionButton()}
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
              key={`${feedback._id}-${feedback.updatedAt}-${currentGraderAnswer?._id}`}
              data-cy="select-answer"
              options={formatMentorQuestions(mentorAnswers, mentorQuestions)}
              getOptionLabel={(option: Answer) =>
                getValueIfKeyExists(option.question, mentorQuestions)?.question
                  ?.question || ""
              }
              onChange={(e, v) => {
                v && onUpdateAnswer(v);
              }}
              style={{
                minWidth: 300,
                background: currentGraderAnswer ? "#eee" : "",
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
                <TextField {...params} variant="outlined"></TextField>
              )}
            />
            <IconButton
              data-cy="clear-answer-button"
              onClick={() => {
                onUpdateAnswer(undefined);
              }}
            >
              <CloseIcon />
            </IconButton>
            {/* {modal} */}
            <EditQuestionForQueueModal
              handleClose={handleClose}
              addQuestionToQueue={addQuestionToQueue}
              setFeedbackQuestionDocId={setFeedbackQuestionDocId}
              open={customQuestionModalOpen}
              mentor={mentor}
              userQuestion={feedback.question}
              accessToken={accessToken || ""}
            />
          </div>
        )}
        <Tooltip
          placement="top-start"
          title={currentGraderAnswer?.transcript || ""}
        >
          <Typography variant="body2" data-cy="grader-answer-question-text">
            {(currentGraderAnswer &&
              getValueIfKeyExists(currentGraderAnswer.question, mentorQuestions)
                ?.question?.question) ||
              ""}
            {graderAnswerButton()}
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

export default FeedbackItem;
