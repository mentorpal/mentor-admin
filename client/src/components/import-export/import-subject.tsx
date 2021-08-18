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
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import {
  ExpandMore as ExpandMoreIcon,
  FindReplace as FindReplaceIcon,
} from "@material-ui/icons";
import { Autocomplete } from "@material-ui/lab";
import { ChangeIcon } from "./icons";
import { ImportPreview, Category, EditType, Topic, Question } from "types";
import { SubjectGQL } from "types-gql";

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
  subjects: SubjectGQL[];
  mapSubject: (curSubject: SubjectGQL, newSubject: SubjectGQL) => void;
}): JSX.Element {
  const classes = useStyles();
  const [isExpanded, setIsExpanded] = useState(false);
  const [subjectSearch, setSubjectSearch] = useState<SubjectGQL>();
  const { preview, subjects, mapSubject } = props;
  const { editType, importData: subject, curData: curSubject } = preview;

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
  subject?.questions?.forEach((q) => {
    const curQuestion = curSubject?.questions?.find(
      (qq) => qq.question?._id === q.question?._id
    );
    questions.push({
      editType: !curQuestion ? EditType.ADDED : EditType.NONE,
      importData: q.question,
      curData: curQuestion?.question,
    });
  });
  curSubject?.questions
    ?.filter(
      (qq) =>
        !subject?.questions?.find((q) => q.question?._id === qq.question?._id)
    )
    .forEach((q) => {
      questions.push({
        editType:
          editType === EditType.REMOVED ? EditType.NONE : EditType.REMOVED,
        importData: undefined,
        curData: q.question,
      });
    });

  return (
    <Card data-cy="subject" className={classes.root}>
      <div className={classes.row}>
        <ChangeIcon preview={preview} />
        <div style={{ marginRight: 10 }}>
          <Typography align="left" variant="body1">
            {subject?.name || curSubject?.name}
          </Typography>
          <Typography align="left" variant="caption">
            {subject?.description || curSubject?.description}
          </Typography>
        </div>
        <div
          className={classes.row}
          style={{ position: "absolute", right: 20 }}
        >
          {editType === EditType.CREATED ? (
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
                  placeholder="Remap to existing subject?"
                />
              )}
              renderOption={(option) => (
                <ListItemText
                  primary={option.name}
                  secondary={option.description}
                />
              )}
            />
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
        <List data-cy="subject-questions" dense disablePadding>
          {questions.map((q, i) => {
            return (
              <ListItem
                key={`subject-question-${i}`}
                data-cy={`subject-question-${i}`}
              >
                <ListItemIcon>
                  <ChangeIcon preview={q} />
                </ListItemIcon>
                <ListItemText
                  primary={q.importData?.question || q.curData?.question}
                />
              </ListItem>
            );
          })}
        </List>
      </Collapse>
    </Card>
  );
}
