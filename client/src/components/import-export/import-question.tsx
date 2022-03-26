/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import {
  Card,
  ListItemText,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { Question, ImportPreview, EditType, Category } from "types";
import { ChangeIcon } from "./icons";
import { SubjectQuestionGQL } from "types-gql";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    padding: 10,
    margin: 10,
  },
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
}));

export default function QuestionImport(props: {
  preview: ImportPreview<Question>;
  subjectQuestion?: SubjectQuestionGQL;
  questions: Question[];
  categories: Category[];
  mapQuestion: (curQuestion: Question, newQuestion: Question) => void;
  mapCategory: (questionBeingReplaced: Question, category: Category) => void;
}): JSX.Element {
  const classes = useStyles();
  const {
    preview,
    questions,
    mapQuestion,
    mapCategory,
    categories,
    subjectQuestion,
  } = props;
  const { editType, importData: question, curData: curQuestion } = preview;
  return (
    <Card data-cy="question" className={classes.root}>
      <div className={classes.row}>
        <ChangeIcon preview={preview} />
        <Typography align="left" variant="body1" style={{ marginRight: 10 }}>
          {question?.question || curQuestion?.question}
        </Typography>
        <div
          className={classes.row}
          style={{ position: "absolute", right: 20 }}
        >
          {editType === EditType.CREATED && questions.length ? (
            <>
              <Autocomplete
                data-cy="category-remap-input"
                options={categories}
                getOptionLabel={(option: Category) => option.name}
                onChange={(e, v) => {
                  v && question && mapCategory(question, v);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    style={{ width: 300 }}
                    variant="outlined"
                    placeholder={
                      subjectQuestion?.category?.name || "Add a category?"
                    }
                  />
                )}
                renderOption={(option) => (
                  <ListItemText primary={option.name} />
                )}
              />
              <Autocomplete
                key={preview.importData?._id}
                data-cy="question-input"
                options={questions}
                getOptionLabel={(option: Question) => option.question}
                onChange={(e, v) => {
                  question && v && mapQuestion(question, v);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    style={{ width: 300 }}
                    variant="outlined"
                    placeholder="Remap to existing question?"
                  />
                )}
                renderOption={(option) => (
                  <ListItemText primary={option.question} />
                )}
              />
            </>
          ) : undefined}
        </div>
      </div>
    </Card>
  );
}
