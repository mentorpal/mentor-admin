/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
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
  Paper,
  Typography,
} from "@material-ui/core";
import { Answer, Question, Status } from "types";
import AnswerList from "components/home/answer-list";
import {
  QuestionEdits,
  RecordingBlock,
} from "hooks/graphql/use-with-review-answer-state";
import { QuestionState } from "store/slices/questions";
import clsx from "clsx";
import AnswerItem from "./answer-item";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

export default function QueueBlockItem(props: {
  block: RecordingBlock;
  classes: Record<string, string>;
  mentorId: string;
  getAnswers: () => Answer[];
  getQuestions: () => QuestionEdits[];
  recordAnswers: (status: Status, subject: string, category: string) => void;
  recordAnswer: (question: QuestionEdits) => void;
  editQuestion: (question: QuestionEdits) => void;
  queueIDList: string[];
  mentorQuestions: Record<string, QuestionState>;
  onRecordAll: () => void;
  onRecordOne: () => void;
}): JSX.Element {
  const [isExpanded, setExpanded] = React.useState(false);
  const {
    classes,
    block,
    queueIDList,
    mentorQuestions,
    onRecordAll,
    onRecordOne,
  } = props;
  const answers = props
    .getAnswers()
    .filter((a) => block.questions.includes(a.question));

  function getQueueQuestions(
    queueIDList: string[],
    mentorQuestions: Record<string, QuestionState>
  ) {
    const queueQuestions: string[] = [];
    {
      for (var i = 0; i < queueIDList.length; i++) {
        queueQuestions.push(
          mentorQuestions[queueIDList[i]].question?.question || ""
        );
      }
    }
    return queueQuestions;
  }

  return (
    <Card elevation={0} style={{ textAlign: "left" }}>
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
            Incomplete ({answers.length})
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
          </CardActions>
        </div>
        <Collapse
          in={isExpanded}
          timeout="auto"
          unmountOnExit
          style={{ paddingLeft: 15, paddingTop: 10 }}
        >
          <List data-cy="question-list" style={{ border: 1 }}>
            {answers.map((answer, i) => {
              const question = props.questions.find(
                (q) => q.originalQuestion._id === answer.question
              );
              if (!question) {
                return;
              }
              return (
                <ListItem
                  key={`item-${i}-${question.originalQuestion._id}`}
                  style={{ backgroundColor: "#eee" }}
                >
                  <div>
                    <ListItemText
                      primary={question?.originalQuestion.question}
                      secondary={`${answer.transcript.substring(0, 100)}${
                        answer.transcript.length > 100 ? "..." : ""
                      }`}
                      style={{ marginRight: 100 }}
                    />
                    <ListItemSecondaryAction>
                      <Button
                        data-cy="record-one"
                        variant="outlined"
                        disabled={!question.newQuestionText}
                        endIcon={<PlayArrowIcon />}
                        onClick={() => onRecordOne()}
                      >
                        Record
                      </Button>
                    </ListItemSecondaryAction>
                  </div>
                </ListItem>
              );
            })}
          </List>
        </Collapse>
      </CardContent>
    </Card>
  );
  /** 
  return (
    <Paper className={classes.paper}>
      <div
        style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
      >
        <Typography data-cy="block-name" variant="h6" className={classes.title}>
          My priorities
        </Typography>
      </div>
      <Typography data-cy="block-description" className={classes.subtitle}>
      These are question you flagged as important to answer.
      </Typography>
      <div style={{ marginTop: 10 }}>
        <div style={{ flex: "auto" }}>
          <AnswerList
            classes={classes}
            header="Unrecorded questions"
            answers={incomplete}
            questions={props.getQuestions()}
            mentorId={props.mentorId}
            onRecordAll={() =>
              props.recordAnswers(
                Status.INCOMPLETE,
                block.subject,
                block.category || ""
              )
            }
            onRecordOne={props.recordAnswer}
            onEditQuestion={props.editQuestion}
          />
        </div>
      </div>
    </Paper>
  );
  */
}
