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
  Typography,
} from "@material-ui/core";
import {
  Add as AddIcon,
  ChangeHistory as ChangeHistoryIcon,
  ExpandMore as ExpandMoreIcon,
  Remove as RemoveIcon,
} from "@material-ui/icons";
import { Subject } from "types";
import { equals } from "helpers";

const useStyles = makeStyles((theme) => ({
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
  list: {},
}));

export function ChangeIcon(props: {
  i: any | undefined;
  e: any | undefined;
}): JSX.Element {
  const { i, e } = props;
  if (!e && !i) {
    return (
      <ChangeHistoryIcon style={{ visibility: "hidden", marginRight: 5 }} />
    );
  }
  if (!e) {
    return <AddIcon style={{ color: "green", marginRight: 5 }} />;
  }
  if (!i) {
    return <RemoveIcon style={{ color: "red", marginRight: 5 }} />;
  }
  if (!equals(i, e)) {
    return <ChangeHistoryIcon style={{ color: "orange", marginRight: 5 }} />;
  }
  return <ChangeHistoryIcon style={{ visibility: "hidden", marginRight: 5 }} />;
}

export default function SubjectImport(props: {
  subject: Subject | undefined;
  curSubject: Subject | undefined;
}): JSX.Element {
  const classes = useStyles();
  const { subject, curSubject } = props;
  const [isExpanded, setIsExpanded] = useState(false);

  if (subject === undefined && curSubject === undefined) {
    return <div />;
  }
  return (
    <Card className={classes.root}>
      <div className={classes.row}>
        <ChangeIcon i={subject} e={curSubject} />
        <Typography variant="body2">
          {subject?.name || curSubject?.name}
        </Typography>
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
      <Collapse
        in={isExpanded}
        timeout="auto"
        unmountOnExit
        style={{ width: "100%" }}
      >
        <ListSubheader>Categories</ListSubheader>
        <List
          data-cy="subject-categories"
          dense
          disablePadding
          className={classes.list}
        >
          {subject?.categories?.map((c, i) => {
            const curCategory = curSubject?.categories?.find(
              (cat) => cat.id === c.id
            );
            return (
              <ListItem
                key={`subject-category-${i}`}
                data-cy={`subject-category-${i}`}
              >
                <ListItemIcon>
                  <ChangeIcon i={c} e={curCategory} />
                </ListItemIcon>
                <ListItemText primary={c.name} secondary={c.description} />
              </ListItem>
            );
          })}
          {curSubject?.categories
            ?.filter(
              (cc) => !subject?.categories?.map((c) => c.id).includes(cc.id)
            )
            .map((c, i) => {
              return (
                <ListItem
                  key={`subject-removed-category-${i}`}
                  data-cy={`subject-removed-category-${i}`}
                >
                  <ListItemIcon>
                    <ChangeIcon i={undefined} e={c} />
                  </ListItemIcon>
                  <ListItemText primary={c.name} secondary={c.description} />
                </ListItem>
              );
            })}
        </List>
        <Divider />
        <ListSubheader>Topics</ListSubheader>
        <List
          data-cy="subject-topics"
          dense
          disablePadding
          className={classes.list}
        >
          {subject?.topics?.map((t, i) => {
            const curTopic = curSubject?.topics?.find((top) => top.id === t.id);
            return (
              <ListItem
                key={`subject-topic-${i}`}
                data-cy={`subject-topic-${i}`}
              >
                <ListItemIcon>
                  <ChangeIcon i={t} e={curTopic} />
                </ListItemIcon>
                <ListItemText primary={t.name} secondary={t.description} />
              </ListItem>
            );
          })}
          {curSubject?.topics
            ?.filter((tt) => !subject?.topics?.map((t) => t.id).includes(tt.id))
            .map((t, i) => {
              return (
                <ListItem
                  key={`subject-removed-topic-${i}`}
                  data-cy={`subject-removed-topic-${i}`}
                >
                  <ListItemIcon>
                    <ChangeIcon i={undefined} e={t} />
                  </ListItemIcon>
                  <ListItemText primary={t.name} secondary={t.description} />
                </ListItem>
              );
            })}
        </List>
        <Divider />
        <ListSubheader>Questions</ListSubheader>
        <List
          data-cy="subject-questions"
          dense
          disablePadding
          className={classes.list}
        >
          {subject?.questions?.map((q, i) => {
            const curQuestion = curSubject?.questions?.find(
              (que) => que.question._id === q.question._id
            );
            return (
              <ListItem key={`subject-question-${i}`}>
                <ListItemIcon>
                  <ChangeIcon i={q} e={curQuestion} />
                </ListItemIcon>
                <ListItemText
                  primary={q.question.question}
                  secondary={q.topics?.map((t) => t.name).join(", ")}
                />
              </ListItem>
            );
          })}
          {curSubject?.questions
            ?.filter(
              (qq) =>
                !subject?.questions
                  ?.map((q) => q.question._id)
                  .includes(qq.question._id)
            )
            .map((q, i) => {
              return (
                <ListItem
                  key={`subject-removed-question-${i}`}
                  data-cy={`subject-removed-question-${i}`}
                >
                  <ListItemIcon>
                    <ChangeIcon i={q} e={q} />
                  </ListItemIcon>
                  <ListItemText
                    primary={q.question.question}
                    secondary={q.topics?.map((t) => t.name).join(", ")}
                  />
                </ListItem>
              );
            })}
        </List>
      </Collapse>
    </Card>
  );
}
