/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState } from "react";
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
import { updateUserQuestion } from "api";
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
  } = props;
  const [customQuestionModalOpen, setCustomQuestionModalOpen] =
    useState<boolean>(false);
  const [feedbackQuestionDocId, setFeedbackQuestionDocId] =
    useState<string>("");

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

  // TODO: MOVE THIS TO A HOOK
  async function onUpdateAnswer(answer?: Answer) {
    await updateUserQuestion(
      feedback._id,
      answer?._id,
      answer?.question,
      mentor._id
    );
    onUpdated();
  }

  const userQuestionButton = () => {
    const questionDocId =
      feedbackQuestionDocId ||
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
      Boolean(feedback.graderAnswer?.question) ||
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
      (mentorAnswer) => mentorAnswer._id === feedback.graderAnswer?._id
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
              key={`${feedback._id}-${feedback.updatedAt}-${feedback.graderAnswer?._id}`}
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
                <TextField {...params} variant="outlined"></TextField>
              )}
            />
            <IconButton
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
          title={feedback.graderAnswer?.transcript || ""}
        >
          <Typography variant="body2">
            {(feedback.graderAnswer &&
              getValueIfKeyExists(
                feedback.graderAnswer.question,
                mentorQuestions
              )?.question?.question) ||
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
