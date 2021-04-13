/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import {
  Card,
  CardContent,
  TextField,
  CardActions,
  IconButton,
} from "@material-ui/core";
import ClearOutlinedIcon from "@material-ui/icons/ClearOutlined";
import DeleteIcon from "@material-ui/icons/Delete";

import { SubjectQuestion } from "types";

export function QuestionListItem(props: {
  isSelected: boolean;
  question: SubjectQuestion;
  updateQuestion: (newVal: SubjectQuestion) => void;
  removeQuestion: (val: SubjectQuestion) => void;
  selectQuestion: (val: SubjectQuestion) => void;
  deselectQuestion: () => void;
}) {
  const {
    question,
    isSelected,
    updateQuestion,
    removeQuestion,
    selectQuestion,
    deselectQuestion,
  } = props;
  return (
    <Card
      elevation={0}
      style={{
        width: "100%",
        backgroundColor: isSelected ? "#FFF8CD" : undefined,
      }}
    >
      <CardContent style={{ display: "flex", flexDirection: "row" }}>
        <TextField
          id="question"
          label="Question"
          variant="outlined"
          fullWidth
          multiline
          value={question.question.question}
          onChange={(e) =>
            updateQuestion({
              ...question,
              question: { ...question.question, question: e.target.value },
            })
          }
          onFocus={() => selectQuestion(question)}
        />
        <CardActions>
          <IconButton
            id="delete-question"
            size="small"
            onClick={() => removeQuestion(question)}
          >
            <DeleteIcon />
          </IconButton>
          {isSelected ? (
            <IconButton id="close" size="small" onClick={deselectQuestion}>
              <ClearOutlinedIcon />
            </IconButton>
          ) : undefined}
        </CardActions>
      </CardContent>
    </Card>
  );
}

export default QuestionListItem;
