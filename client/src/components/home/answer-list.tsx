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
  Typography,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { Answer, Question } from "types";
import AnswerItem from "./answer-item";
import { EditableQuestion } from "hooks/graphql/use-with-review-answer-state";

function AnswerList(props: {
  classes: Record<string, string>;
  mentorId: string;
  header: string;
  answers: Answer[];
  questions: EditableQuestion[];
  onRecordAll: () => void;
  onRecordOne: (question: string) => void;
  onEditQuestion: (question: EditableQuestion) => void;
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
    <Card
      data-cy={`answers-${header}`}
      elevation={0}
      style={{ textAlign: "left" }}
    >
      <CardContent style={{ padding: 0 }}>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <CardActions>
            <IconButton
              data-cy="expand-btn"
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
          <Typography data-cy="header" variant="h6" style={{ padding: 15 }}>
            {header} ({answers.length})
          </Typography>
          <CardActions>

            <Button
              data-cy="record-all"
              variant="outlined"
              onClick={onRecordAll}
              disabled={answers.length === 0}
            >
              Record All
            </Button>
            {onAddQuestion ? (
              <Button
                data-cy="add-question"
                color="primary"
                variant="outlined"
                startIcon={<AddIcon />}
                className={classes.button}
                onClick={() => {
                  onAddQuestion();
                  setExpanded(true);
                }}
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
          <List data-cy="answer-list" style={{ border: 1 }}>
            {answers
              // .slice(0)
              // .reverse()
              .map((answer, i) => {
                const question = props.questions.find(
                  (q) => q.question._id === answer.question
                );
                if (!question) {
                  return;
                }
                return (
                  <ListItem
                    data-cy={`answer-${i}`}
                    key={`item-${i}-${question.question._id}`}
                    style={{ backgroundColor: "#eee" }}
                  >
                    <AnswerItem
                      mentorId={props.mentorId}
                      answer={answer}
                      question={question}
                      onEditQuestion={onEditQuestion}
                      onRecordOne={onRecordOne}
                    />
                  </ListItem>
                );
              })}
          </List>
        </Collapse>
      </CardContent>
    </Card>
  );
}

export default AnswerList;
