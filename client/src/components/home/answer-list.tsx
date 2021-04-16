/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import clsx from "clsx";
import React from "react";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  TextField,
  Typography,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import { Answer, Question } from "types";

function AnswerList(props: {
  classes: Record<string, string>;
  mentorId: string;
  header: string;
  answers: Answer[];
  onRecordAll: () => void;
  onRecordOne: (answer: Answer) => void;
  onEditQuestion: (question: Question) => void;
  onAddQuestion?: () => void;
}): JSX.Element {
  const {
    classes,
    header,
    answers,
    onRecordAll,
    onRecordOne,
    onEditQuestion,
    onAddQuestion,
  } = props;
  const [isExpanded, setExpanded] = React.useState(false);

  return (
    <Card id={`answers-${header}`} elevation={0} style={{ textAlign: "left" }}>
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
          <Typography id="header" variant="h6" style={{ padding: 15 }}>
            {header} ({answers.length})
          </Typography>
          <CardActions>
            <Button
              id="record-all"
              variant="outlined"
              onClick={onRecordAll}
              disabled={answers.length === 0}
            >
              Record All
            </Button>
            {onAddQuestion ? (
              <Button
                id="add-question"
                color="primary"
                variant="outlined"
                startIcon={<AddIcon />}
                className={classes.button}
                onClick={onAddQuestion}
              >
                Question
              </Button>
            ) : undefined}
          </CardActions>
        </div>
        <Collapse
          in={isExpanded}
          timeout="auto"
          unmountOnExit
          style={{ paddingLeft: 15, paddingTop: 10 }}
        >
          <List id="list" style={{ border: 1 }}>
            {answers.map((answer: Answer, i: number) => (
              <ListItem
                key={`item-${i}`}
                id={`item-${i}`}
                style={{ backgroundColor: "#eee" }}
              >
                {answer.question.mentor === props.mentorId ? (
                  <TextField
                    id="edit-question"
                    placeholder="New question"
                    fullWidth
                    multiline
                    value={answer.question.question}
                    style={{ marginRight: 100 }}
                    onChange={(e) =>
                      onEditQuestion({
                        ...answer.question,
                        question: e.target.value,
                      })
                    }
                  />
                ) : (
                  <ListItemText
                    primary={answer.question.question}
                    secondary={`${answer.transcript.substring(0, 100)}${
                      answer.transcript.length > 100 ? "..." : ""
                    }`}
                    style={{ marginRight: 100 }}
                  />
                )}
                <ListItemSecondaryAction>
                  <Button
                    id="record-one"
                    variant="outlined"
                    endIcon={<PlayArrowIcon />}
                    onClick={() => onRecordOne(answer)}
                  >
                    Record
                  </Button>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Collapse>
      </CardContent>
    </Card>
  );
}

export default AnswerList;
