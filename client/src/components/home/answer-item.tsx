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
import { EditableQuestion } from "hooks/graphql/use-with-review-answer-state";

function AnswerItem(props: {
  mentorId: string;
  answer: Answer;
  question: EditableQuestion;
  onEditQuestion: (question: EditableQuestion) => void;
  onRecordOne: (question: string) => void;
}): JSX.Element {
  const { mentorId, answer, question, onEditQuestion, onRecordOne } = props;
  const [questionInput, setQuestionInput] = useState<string>(
    question.newQuestionText
  );
  const [inputEvent, setInputEvent] =
    useState<React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>>();

  const [waitingForId, setWaitingForId] = useState<boolean>(false);
  useEffect(() => {
    const timeOutId = setTimeout(() => {
      if (inputEvent && question) {
        onTextInputChanged(inputEvent, () => {
          onEditQuestion({
            question: question.question,
            newQuestionText: questionInput,
          });
        });
      }
    }, 500);
    return () => clearTimeout(timeOutId);
  }, [questionInput]);

  const unsavedChanges =
    question.question.question !== question.newQuestionText;

  return (
    <div>
      {question.question.mentor === mentorId ? (
        <span
          style={{
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          <TextField
            data-cy="edit-question"
            placeholder="New question"
            fullWidth
            multiline
            value={questionInput}
            onChange={(e) => {
              setQuestionInput(e.target.value);
              setInputEvent(e);
            }}
          />
          {unsavedChanges ? (
            <span style={{ color: "red", whiteSpace: "nowrap" }}>
              Unsaved changes
            </span>
          ) : undefined}
        </span>
      ) : (
        <ListItemText
          primary={question?.question.question}
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
          // we can detect here if saving is required..
          onClick={() => onRecordOne(question.question._id)}
        >
          Record
        </Button>
      </ListItemSecondaryAction>
    </div>
  );
}

export default AnswerItem;
