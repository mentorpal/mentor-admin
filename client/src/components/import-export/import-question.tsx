/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { Button, Card, TextField, Typography } from "@mui/material";
import { makeStyles } from "tss-react/mui";
import { Autocomplete } from "@mui/material";
import {
  Question,
  ImportPreview,
  EditType,
  Category,
  Topic,
  QuestionType,
} from "types";
import { ChangeIcon } from "./icons";
import { SubjectGQL, SubjectQuestionGQL } from "types-gql";
import { uuid4 } from "@sentry/utils";

const useStyles = makeStyles({ name: { QuestionImport } })(() => ({
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
  topics: Topic[];
  subjects: SubjectGQL[];
  oldQuestionsToRemove: Question[];
  mapQuestion: (curQuestion: Question, newQuestion: Question) => void;
  onMapQuestionType: (
    questionToUpdate: Question,
    newType: QuestionType
  ) => void;
  mapCategory: (questionBeingReplaced: Question, category: Category) => void;
  toggleRemoveOldFollowup: (q: Question) => void;
  mapTopic: (questionBeingUpdated: Question, topic: Topic) => void;
  mapQuestionToSubject: (
    questionBeingMapped: Question,
    targetSubject: SubjectGQL
  ) => void;
}): JSX.Element {
  const { classes } = useStyles();
  const {
    preview,
    questions,
    mapQuestion,
    mapCategory,
    mapTopic,
    mapQuestionToSubject,
    categories,
    subjectQuestion,
    onMapQuestionType,
    subjects,
    toggleRemoveOldFollowup,
    oldQuestionsToRemove,
    topics,
  } = props;
  const { editType, importData: question, curData: curQuestion } = preview;
  const questionPendingRemoval = Boolean(
    oldQuestionsToRemove.find((qToRemove) => qToRemove._id === curQuestion?._id)
  );
  const inputWidth = 300;

  return (
    <Card
      key={question?._id}
      data-cy="question"
      className={classes.root}
      style={{ opacity: questionPendingRemoval ? 0.5 : 1 }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignContent: "space-between",
          width: "100%",
          alignItems: "space-between",
          justifyContent: "space-between",
        }}
      >
        <span className={classes.row}>
          <ChangeIcon preview={preview} />
          <Typography align="left" variant="body1">
            {question?.question || curQuestion?.question}
          </Typography>
        </span>
        <div
          className={classes.row}
          style={{ display: "flex", width: "700px", flexWrap: "wrap" }}
        >
          {editType === EditType.CREATED ? (
            <>
              <Autocomplete
                data-cy="remap-question-subject-input"
                options={subjects}
                getOptionLabel={(option: SubjectGQL) => option.name}
                onChange={(e, v) => {
                  v && question && mapQuestionToSubject(question, v);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    style={{ width: inputWidth }}
                    variant="outlined"
                    placeholder={"Map to a subject?"}
                  />
                )}
                renderOption={(props, option) => (
                  <Typography {...props} key={option._id}>
                    {" "}
                    {option.name}
                  </Typography>
                )}
              />
              <Autocomplete
                data-cy="remap-question-type-input"
                options={Object.values(QuestionType)}
                getOptionLabel={(option: string) => option}
                onChange={(e, v) => {
                  v && question && onMapQuestionType(question, v);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    style={{ width: inputWidth }}
                    variant="outlined"
                    placeholder={question?.type || "Map to a question type?"}
                  />
                )}
                renderOption={(props, option) => (
                  <Typography {...props} key={uuid4()}>
                    {option}
                  </Typography>
                )}
              />
            </>
          ) : undefined}
          {editType === EditType.CREATED && questions.length ? (
            <>
              {categories.length ? (
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
                      style={{ width: inputWidth }}
                      variant="outlined"
                      placeholder={
                        subjectQuestion?.category?.name || "Add a category?"
                      }
                    />
                  )}
                  renderOption={(props, option) => (
                    <Typography {...props} key={option.id}>
                      {option.name}
                    </Typography>
                  )}
                />
              ) : undefined}
              {topics.length ? (
                <Autocomplete
                  data-cy="topic-remap-input"
                  options={topics}
                  getOptionLabel={(option: Topic) => option.name}
                  onChange={(e, v) => {
                    v && question && mapTopic(question, v);
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      style={{ width: inputWidth }}
                      variant="outlined"
                      placeholder={
                        subjectQuestion?.topics?.length
                          ? subjectQuestion.topics[0].name
                          : "Map to a topic?"
                      }
                    />
                  )}
                  renderOption={(props, option) => (
                    <Typography {...props} key={option.id}>
                      {option.name}
                    </Typography>
                  )}
                />
              ) : undefined}
              <Autocomplete
                key={preview.importData?._id}
                data-cy="question-remap-input"
                options={questions}
                getOptionLabel={(option: Question) => option.question}
                onChange={(e, v) => {
                  question && v && mapQuestion(question, v);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    style={{ width: inputWidth }}
                    variant="outlined"
                    placeholder="Map to existing question?"
                  />
                )}
                renderOption={(props, option) => (
                  <Typography {...props} key={option._id}>
                    {option.question}
                  </Typography>
                )}
              />
            </>
          ) : undefined}
          {editType === EditType.OLD_FOLLOWUP && curQuestion ? (
            <>
              {questionPendingRemoval ? "Flagged for removal" : ""}
              <Button
                data-cy="remove-old-question"
                variant="contained"
                style={{
                  backgroundColor: questionPendingRemoval ? "lightblue" : "red",
                  padding: "3px",
                  margin: "3px",
                }}
                onClick={() => {
                  toggleRemoveOldFollowup(curQuestion);
                }}
              >
                {questionPendingRemoval ? "Undo" : "Remove"}
              </Button>
            </>
          ) : undefined}
        </div>
      </div>
    </Card>
  );
}
