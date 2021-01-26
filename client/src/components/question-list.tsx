/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import clsx from "clsx";
import React from "react";
import {
  Card,
  CardActions,
  CardContent,
  Checkbox,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { Question, Topic } from "types";

function QuestionItem(props: { question: Question; i: number }): JSX.Element {
  const { question, i } = props;
  return (
    <ListItem id={`item-${i}`} style={{ backgroundColor: "#eee" }}>
      <ListItemIcon>
        <Checkbox id="check" edge="start" />
      </ListItemIcon>
      <ListItemText
        primary={question.question}
        secondary={`${question.topics
          .map((topic: Topic) => {
            return topic.name;
          })
          .join(", ")}`}
      />
    </ListItem>
  );
}

function QuestionList(props: {
  id: string;
  header: string;
  questions: Question[];
  classes: any;
}): JSX.Element {
  const { id, header, questions, classes } = props;
  const [isExpanded, setExpanded] = React.useState(questions.length > 0);

  return (
    <Card id={id} elevation={0} style={{ textAlign: "left" }}>
      <CardContent style={{ padding: 0 }}>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <CardActions>
            <IconButton
              id="expand-btn"
              size="small"
              aria-expanded={isExpanded}
              className={clsx(classes.expand, {
                [classes.expandOpen]: isExpanded,
              })}
              onClick={() => setExpanded(!isExpanded)}
            >
              <ExpandMoreIcon />
            </IconButton>
          </CardActions>
          <Typography variant="h6" style={{ padding: 15 }}>
            {header} ({questions.length})
          </Typography>
        </div>
        <Collapse
          in={isExpanded}
          timeout="auto"
          unmountOnExit
          style={{ paddingLeft: 15, paddingTop: 10 }}
        >
          <List id="list" style={{ border: 1 }}>
            {questions.map((question: Question, i: number) => (
              <QuestionItem question={question} i={i} />
            ))}
          </List>
        </Collapse>
      </CardContent>
    </Card>
  );
}

export default QuestionList;
