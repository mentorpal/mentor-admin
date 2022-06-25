import React from "react";
import { Paper, Typography } from "@material-ui/core";
import { Answer, Status } from "types";
import AnswerList from "components/home/answer-list";
import ProgressChecks from "components/progress-checks";
import {
  QuestionEdits,
  RecordingBlock,
} from "hooks/graphql/use-with-review-answer-state";

export default function QueueBlockItem(props: {
  classes: Record<string, string>;
  mentorId: string;
  getAnswers: () => Answer[];
  getQuestions: () => QuestionEdits[];
  recordAnswers: (status: Status, subject: string, category: string) => void;
  recordAnswer: (question: QuestionEdits) => void;
  editQuestion: (question: QuestionEdits) => void;
}): JSX.Element {
  const { classes } = props;
  const answers = props
    .getAnswers() 
    .filter((a) => block.questions.includes(a.question));
  const complete = answers.filter((a) => a.status === Status.COMPLETE);
  const incomplete = answers.filter((a) => a.status === Status.INCOMPLETE);

  return (
    <Paper className={classes.paper}>
      <div
        style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
      >
        <Typography data-cy="block-name" variant="h6" className={classes.title}>
          Queue Record List
        </Typography>
        <div
          data-cy="block-progress"
          style={{ flexGrow: 1, marginLeft: 25, marginRight: 25 }}
        >
          <ProgressChecks value={complete.length} total={answers.length} />
        </div>
      </div>
      <div style={{ marginTop: 10 }}>
        <div style={{ flex: "auto" }}>
          <AnswerList
            classes={classes}
            mentorId={props.mentorId}
            header="Complete"
            answers={complete}
            questions={props.getQuestions()}
            onRecordAll={() =>
              props.recordAnswers(
                Status.COMPLETE,
                block.subject,
                block.category || ""
              )
            }
            onRecordOne={props.recordAnswer}
            onEditQuestion={props.editQuestion}
          />
          <AnswerList
            classes={classes}
            header="Incomplete"
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
}
