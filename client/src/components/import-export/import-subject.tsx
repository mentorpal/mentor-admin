/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState } from "react";
import {
  Card,
  Collapse,
  Divider,
  FormControl,
  IconButton,
  Input,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  makeStyles,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";
import {
  ExpandMore as ExpandMoreIcon,
  FindReplace as FindReplaceIcon,
  Save as SaveIcon,
} from "@material-ui/icons";
import {
  Category,
  EditType,
  ImportPreview,
  Question,
  QuestionType,
  SubjectTypes,
  Topic,
} from "types";
import { Autocomplete } from "@material-ui/lab";
import { ChangeIcon } from "./icons";
import { SubjectGQL } from "types-gql";
import QuestionImport from "./import-question";
import { useWithQuestions } from "hooks/graphql/use-with-questions";
import useActiveMentor from "store/slices/mentor/useActiveMentor";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    padding: 10,
    margin: 10,
    minHeight: 40,
  },
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
}));

export default function SubjectImport(props: {
  preview: ImportPreview<SubjectGQL>;
  previewQuestions: ImportPreview<Question>[];
  subjects: SubjectGQL[];
  mapSubject: (curSubject: SubjectGQL, newSubject: SubjectGQL) => void;
  mapQuestion: (curQuestion: Question, newQuestion: Question) => void;
  onMapSubjectType: (
    subjectToUpdate: SubjectGQL,
    newType: SubjectTypes
  ) => void;
  onMapQuestionType: (
    questionToUpdate: Question,
    newType: QuestionType
  ) => void;
  mapCategory: (questionBeingReplaced: Question, category: Category) => void;
  mapTopic: (questionBeingUpdated: Question, topic: Topic) => void;
  oldQuestionsToRemove: Question[];
  toggleRemoveOldFollowup: (q: Question) => void;
  mapQuestionToSubject: (
    questionBeingMapped: Question,
    targetSubject: SubjectGQL
  ) => void;
  saveSubjectName: (subject: SubjectGQL, newName: string) => void;
}): JSX.Element {
  const { getData } = useActiveMentor();
  const mentorId = getData((m) => m.data?._id || "");
  const classes = useStyles();
  const [isExpanded, setIsExpanded] = useState(false);
  const [subjectSearch, setSubjectSearch] = useState<SubjectGQL>();
  const {
    preview,
    subjects,
    mapSubject,
    mapQuestion,
    mapCategory,
    previewQuestions,
    saveSubjectName,
    mapQuestionToSubject,
    onMapSubjectType,
    onMapQuestionType,
    mapTopic,
    toggleRemoveOldFollowup,
    oldQuestionsToRemove,
  } = props;
  const { editType, importData: subject, curData: curSubject } = preview;
  const { data: allQuestions } = useWithQuestions({ limit: 5000 });
  const [newSubjectName, setNewSubjectName] = useState<string>("");
  const subjectQuestions = allQuestions?.edges
    .map((edge) => edge.node)
    ?.filter((q) =>
      Boolean(subject?.questions.find((subjQ) => subjQ.question._id == q._id))
    );
  if (!subject && !curSubject) {
    return <div />;
  }

  const categories: ImportPreview<Category>[] = [];
  subject?.categories?.forEach((c) => {
    const curCategory = curSubject?.categories?.find((cc) => cc.id === c.id);
    categories.push({
      editType: !curCategory ? EditType.ADDED : EditType.NONE,
      importData: c,
      curData: curCategory,
    });
  });
  curSubject?.categories
    ?.filter((cc) => !subject?.categories?.find((c) => c.id === cc.id))
    .forEach((c) => {
      categories.push({
        editType:
          editType === EditType.REMOVED ? EditType.NONE : EditType.REMOVED,
        importData: undefined,
        curData: c,
      });
    });
  const topics: ImportPreview<Topic>[] = [];
  subject?.topics?.forEach((t) => {
    const curTopic = curSubject?.topics?.find((tt) => tt.id === t.id);
    topics.push({
      editType: !curTopic ? EditType.ADDED : EditType.NONE,
      importData: t,
      curData: curTopic,
    });
  });
  curSubject?.topics
    ?.filter((tt) => !subject?.topics?.find((t) => t.id === tt.id))
    .forEach((t) => {
      topics.push({
        editType:
          editType === EditType.REMOVED ? EditType.NONE : EditType.REMOVED,
        importData: undefined,
        curData: t,
      });
    });

  const questions: ImportPreview<Question>[] = [];
  // for all questions of the importing subject
  subject?.questions?.forEach((q) => {
    // Check if the imported subject question already exists in this subject
    const curQuestion = curSubject?.questions?.find(
      (qq) =>
        !q.question.mentor &&
        (qq.question?._id === q.question?._id ||
          qq.question.question === q.question.question)
    );
    // If the question is already in this subject, mark as no differences to be made
    questions.push({
      editType: curQuestion
        ? EditType.NONE
        : previewQuestions.find(
            (prevQ) => prevQ.importData?._id === q.question._id
          )?.editType || EditType.NONE,
      importData: q.question,
      curData: curQuestion?.question,
    });
  });

  // subject is the importingSubject
  // curSubject is the subject being replaced

  // Check if the current subject has some mentor specific questions that are not in the new subject
  curSubject?.questions
    ?.filter(
      (qq) =>
        !subject?.questions?.find(
          (q) => q.question?._id === qq.question?._id
        ) &&
        qq.question.mentor &&
        qq.question.mentor == mentorId
    )
    .forEach((q) => {
      questions.push({
        editType:
          editType === EditType.OLD_FOLLOWUP
            ? EditType.NONE
            : EditType.OLD_FOLLOWUP,
        importData: undefined,
        curData: q.question,
      });
    });

  const unchangedQuestions = questions.filter(
    (q) => q.editType === EditType.NONE
  );
  const newQuestions = questions.filter(
    (q) => q.editType === EditType.CREATED || q.editType === EditType.ADDED
  );
  const oldFollowups = questions.filter(
    (q) => q.editType === EditType.OLD_FOLLOWUP
  );

  const subjCategories = curSubject?.categories;
  const subjTopics = curSubject?.topics;

  const subjectName = curSubject?.name || subject?.name;

  console.log(JSON.stringify(previewQuestions));
  return (
    <Card
      key={`${curSubject?._id}-${subject?._id}`}
      data-cy="subject"
      className={classes.root}
    >
      <div className={classes.row}>
        <ChangeIcon preview={preview} />
        <div style={{ marginRight: 10, width: "100%" }}>
          <span style={{ display: "flex", flexDirection: "column" }}>
            <FormControl variant="outlined">
              <Input
                data-cy="subject-title-edit"
                multiline
                disabled={editType !== EditType.CREATED}
                defaultValue={subjectName}
                disableUnderline={editType !== EditType.CREATED}
                style={{ color: "black" }}
                onChange={(e) => {
                  setNewSubjectName(e.target.value);
                }}
              />
            </FormControl>
            <Typography align="left" variant="caption">
              {subject?.description || curSubject?.description}
            </Typography>
          </span>
        </div>
        {newSubjectName && newSubjectName !== subjectName ? (
          <IconButton
            data-cy="save-subject-name-icon"
            size="small"
            onClick={() => {
              if (subject) {
                saveSubjectName(subject, newSubjectName);
              }
            }}
          >
            <SaveIcon />
          </IconButton>
        ) : undefined}
        <div
          className={classes.row}
          style={{ position: "absolute", right: 20 }}
        >
          {editType === EditType.CREATED ? (
            <>
              <Autocomplete
                data-cy="subject-input"
                options={subjects}
                getOptionLabel={(option: SubjectGQL) => option.name}
                onChange={(e, v) => {
                  setSubjectSearch(v || undefined);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    style={{ width: 300 }}
                    variant="outlined"
                    placeholder="Map to existing subject?"
                  />
                )}
                renderOption={(option) => (
                  <ListItemText
                    primary={option.name}
                    secondary={option.description}
                  />
                )}
              />
              <Autocomplete
                data-cy="remap-subject-type-input"
                options={Object.values(SubjectTypes)}
                getOptionLabel={(option: string) => option}
                onChange={(e, v) => {
                  v && subject && onMapSubjectType(subject, v);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    style={{ width: 300 }}
                    variant="outlined"
                    placeholder={subject?.type || SubjectTypes.SUBJECT}
                  />
                )}
                renderOption={(option) => <ListItemText primary={option} />}
              />
            </>
          ) : undefined}
          {editType === EditType.CREATED ? (
            <IconButton
              data-cy="replace"
              size="small"
              onClick={() => {
                if (subject && subjectSearch) {
                  mapSubject(subject, subjectSearch);
                }
              }}
            >
              <FindReplaceIcon />
            </IconButton>
          ) : undefined}
          <IconButton
            data-cy="toggle"
            size="small"
            aria-expanded={isExpanded}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <ExpandMoreIcon
              style={{
                transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </IconButton>
        </div>
      </div>
      <Collapse
        in={isExpanded}
        timeout="auto"
        unmountOnExit
        style={{ width: "100%" }}
      >
        <ListSubheader>Categories</ListSubheader>
        <List data-cy="subject-categories" dense disablePadding>
          {categories.map((c, i) => {
            return (
              <ListItem
                key={`subject-category-${i}`}
                data-cy={`subject-category-${i}`}
              >
                <ListItemIcon>
                  <ChangeIcon preview={c} />
                </ListItemIcon>
                <ListItemText
                  primary={c.importData?.name || c.curData?.name}
                  secondary={
                    c.importData?.description || c.curData?.description
                  }
                />
              </ListItem>
            );
          })}
        </List>
        <Divider />
        <ListSubheader>Topics</ListSubheader>
        <List data-cy="subject-topics" dense disablePadding>
          {topics.map((t, i) => {
            return (
              <ListItem
                key={`subject-topic-${i}`}
                data-cy={`subject-topic-${i}`}
              >
                <ListItemIcon>
                  <ChangeIcon preview={t} />
                </ListItemIcon>
                <ListItemText
                  primary={t.importData?.name || t.curData?.name}
                  secondary={
                    t.importData?.description || t.curData?.description
                  }
                />
              </ListItem>
            );
          })}
        </List>
        <Divider />
        <ListSubheader>Questions</ListSubheader>
        <List data-cy="subject-questions">
          {oldFollowups.length ? (
            <List>
              Old Followups
              {oldFollowups.map((q, i) => {
                return (
                  <QuestionImport
                    key={`question-${i}`}
                    preview={q}
                    questions={subjectQuestions || []}
                    mapQuestion={mapQuestion}
                    mapQuestionToSubject={mapQuestionToSubject}
                    mapCategory={mapCategory}
                    onMapQuestionType={onMapQuestionType}
                    oldQuestionsToRemove={oldQuestionsToRemove}
                    toggleRemoveOldFollowup={toggleRemoveOldFollowup}
                    mapTopic={mapTopic}
                    categories={subjCategories || []}
                    topics={subjTopics || []}
                    subjects={subjects || []}
                  />
                );
              })}
            </List>
          ) : undefined}
          {newQuestions.length ? (
            <List data-cy="new-questions">
              New Followups
              {newQuestions.map((q, i) => {
                return (
                  <QuestionImport
                    key={`question-${i}`}
                    preview={q}
                    questions={subjectQuestions || []}
                    mapQuestion={mapQuestion}
                    mapCategory={mapCategory}
                    mapTopic={mapTopic}
                    onMapQuestionType={onMapQuestionType}
                    oldQuestionsToRemove={oldQuestionsToRemove}
                    toggleRemoveOldFollowup={toggleRemoveOldFollowup}
                    mapQuestionToSubject={mapQuestionToSubject}
                    categories={subjCategories || []}
                    topics={subjTopics || []}
                    subjects={subjects || []}
                    subjectQuestion={subject?.questions.find(
                      (subjQ) => subjQ.question._id == q.importData?._id
                    )}
                  />
                );
              })}
            </List>
          ) : undefined}

          {unchangedQuestions.length ? (
            <div>
              Unchanged
              <Paper
                style={{
                  maxHeight: 200,
                  overflow: "auto",
                  border: "1px solid lightgrey",
                }}
              >
                <List>
                  {unchangedQuestions.map((q, i) => {
                    return (
                      <QuestionImport
                        key={`question-${i}`}
                        preview={q}
                        questions={subjectQuestions || []}
                        mapQuestion={mapQuestion}
                        mapCategory={mapCategory}
                        mapTopic={mapTopic}
                        onMapQuestionType={onMapQuestionType}
                        oldQuestionsToRemove={oldQuestionsToRemove}
                        toggleRemoveOldFollowup={toggleRemoveOldFollowup}
                        subjects={subjects || []}
                        mapQuestionToSubject={mapQuestionToSubject}
                        categories={subjCategories || []}
                        topics={subjTopics || []}
                      />
                    );
                  })}
                </List>
              </Paper>
            </div>
          ) : undefined}
        </List>
      </Collapse>
    </Card>
  );
}
