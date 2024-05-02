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
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { Answer } from "types";
import { onTextInputChanged } from "helpers";
import { QuestionEdits } from "hooks/graphql/use-with-review-answer-state";

function AnswerItem(props: {
  mentorId: string;
  answer: Answer;
  question: QuestionEdits;
  onEditQuestion: (question: QuestionEdits) => void;
  onRecordOne: (question: QuestionEdits) => void;
}): JSX.Element {
  const { mentorId, answer, question, onEditQuestion, onRecordOne } = props;
  const [questionInput, setQuestionInput] = useState<string>(
    question.newQuestionText
  );
  const [inputEvent, setInputEvent] =
    useState<React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>>();

  useEffect(() => {
    const timeOutId = setTimeout(() => {
      if (inputEvent && question) {
        onTextInputChanged(inputEvent, () => {
          onEditQuestion({
            originalQuestion: question.originalQuestion,
            newQuestionText: questionInput,
            unsavedChanges:
              questionInput !== question.originalQuestion.question,
          });
        });
      }
    }, 500);
    return () => clearTimeout(timeOutId);
  }, [questionInput]);

  return (
    <div>
      {question.originalQuestion.mentor === mentorId ? (
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
          {question.unsavedChanges ? (
            <span
              data-cy="unsaved-changes-warning"
              style={{ color: "red", whiteSpace: "nowrap" }}
            >
              Unsaved changes
            </span>
          ) : undefined}
        </span>
      ) : (
        <ListItemText
          primary={
            question?.customQuestionText || question.originalQuestion.question
          }
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
          disabled={!question.newQuestionText}
          endIcon={<PlayArrowIcon />}
          onClick={() => onRecordOne(question)}
        >
          Record
        </Button>
      </ListItemSecondaryAction>
    </div>
  );
}

export default AnswerItem;
