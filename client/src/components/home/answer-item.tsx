/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useState } from "react";
import {
  Button,
  ListItemSecondaryAction,
  ListItemText,
  TextField,
} from "@material-ui/core";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import { Answer, Question } from "types";
import { onTextInputChanged } from "helpers";

function AnswerItem(props: {
  mentorId: string;
  answer: Answer;
  question: Question | undefined;
  onEditQuestion: (question: Question) => void;
  onRecordOne: (question: string) => void;
}): JSX.Element {
  const { mentorId, answer, question, onEditQuestion, onRecordOne } = props;
  const [questionId, setQuestionId] = useState<string>("");
  const [questionInput, setQuestionInput] = useState<string>(
    question?.question || ""
  );
  const [inputEvent, setInputEvent] =
    useState<React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>>();

  const [waitingForId, setWaitingForId] = useState<boolean>(false);

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      if (inputEvent && question) {
        onTextInputChanged(inputEvent, () => {
          onEditQuestion({
            ...question,
            question: questionInput,
          });
        });
      }
    }, 500);
    return () => clearTimeout(timeOutId);
  }, [questionInput]);

  useEffect(() => {
    if (question) {
      if (questionId === question._id && questionInput !== question.question) {
        setQuestionInput(question.question);
      }
      if (questionId !== question._id) {
        setQuestionId(question._id);
        setQuestionInput(question.question);
      }
    }
  }, [question]);

  useEffect(() => {
    if (!waitingForId) {
      return;
    }
  }, [waitingForId]);

  function recordOne(qId?: string) {
    if (qId) {
      onRecordOne(qId);
    } else {
      setWaitingForId(true);
    }
  }

  return (
    <div>
      {question?.mentor === mentorId ? (
        <TextField
          data-cy="edit-question"
          placeholder="New question"
          fullWidth
          multiline
          value={questionInput}
          style={{ marginRight: 100 }}
          onChange={(e) => {
            setQuestionInput(e.target.value);
            setInputEvent(e);
          }}
        />
      ) : (
        <ListItemText
          primary={question?.question}
          secondary={`${answer.transcript.substring(0, 100)}${
            answer.transcript.length > 100 ? "..." : ""
          }`}
          style={{ marginRight: 100 }}
        />
      )}
      <ListItemSecondaryAction>
        <Button
          data-cy="record-one"
          variant="outlined"
          endIcon={<PlayArrowIcon />}
          onClick={() => recordOne(question?._id)}
        >
          Record
        </Button>
      </ListItemSecondaryAction>
    </div>
  );
}

export default AnswerItem;
