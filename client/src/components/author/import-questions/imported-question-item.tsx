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
  Typography,
  Autocomplete,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { SubjectQuestionGQL } from "types-gql";
import { onTextInputChanged } from "helpers";
import { Category, Topic } from "types";
import ImportedQuestionParaphrases from "./imported-question-paraphrases";

export function ImportedQuestionItem(props: {
  classes: Record<string, string>;
  categories: Category[];
  topics: Topic[];
  question: SubjectQuestionGQL;
  editQuestion: (newVal: SubjectQuestionGQL) => void;
  removeQuestion: (val: SubjectQuestionGQL) => void;
}): JSX.Element {
  const {
    question,
    editQuestion,
    removeQuestion,
    categories,
    topics,
    classes,
  } = props;

  return (
    <Card
      elevation={0}
      style={{
        width: "100%",
      }}
    >
      <CardContent
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-around",
        }}
      >
        <TextField
          data-cy="question"
          label="Question"
          variant="outlined"
          multiline
          value={question.question.question}
          onChange={(e) =>
            onTextInputChanged(e, () => {
              editQuestion({
                ...question,
                question: { ...question.question, question: e.target.value },
              });
            })
          }
        />
        <Autocomplete
          data-cy="category-remap-input"
          options={categories}
          getOptionLabel={(option: Category) => option.name}
          onChange={(e, v) => {
            v &&
              editQuestion({
                ...question,
                category: v,
              });
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              style={{ width: "200px" }}
              variant="outlined"
              placeholder={question?.category?.name || "Add a category?"}
            />
          )}
          renderOption={(props, option) => (
            <Typography
              {...props}
              key={option.id}
              style={{ width: "fit-content" }}
            >
              {option.name}
            </Typography>
          )}
        />
        <Autocomplete
          data-cy="topic-remap-input"
          options={topics}
          getOptionLabel={(option: Topic) => option.name}
          onChange={(e, v) => {
            v &&
              editQuestion({
                ...question,
                topics: [v],
              });
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              style={{ width: "200px" }}
              variant="outlined"
              placeholder={
                question?.topics?.length
                  ? question.topics[0].name
                  : "Map to a topic?"
              }
            />
          )}
          renderOption={(props, option) => (
            <Typography
              {...props}
              key={option.id}
              style={{ width: "fit-content" }}
            >
              {option.name}
            </Typography>
          )}
        />
        <ImportedQuestionParaphrases
          classes={classes}
          paraphrases={question.question.paraphrases}
          updateParaphrases={(newParaphrases) => {
            editQuestion({
              ...question,
              question: { ...question.question, paraphrases: newParaphrases },
            });
          }}
        />
        <CardActions>
          <IconButton
            data-cy="delete-question"
            size="small"
            onClick={() => removeQuestion(question)}
          >
            <DeleteIcon />
          </IconButton>
        </CardActions>
      </CardContent>
    </Card>
  );
}

export default ImportedQuestionItem;
