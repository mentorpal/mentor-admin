/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { Paper, Typography } from "@material-ui/core";
import { Answer, MentorType, Status } from "types";
import AnswerList from "components/home/answer-list";
import ProgressChecks from "components/progress-checks";
import {
  QuestionEdits,
  RecordingBlock,
} from "hooks/graphql/use-with-review-answer-state";
import { filterAnswersByStatus } from "helpers";

export default function RecordingBlockItem(props: {
  classes: Record<string, string>;
  block: RecordingBlock;
  mentorId: string;
  mentorType: MentorType;
  getAnswers: () => Answer[];
  getQuestions: () => QuestionEdits[];
  recordAnswers: (status: Status, subject: string, category: string) => void;
  recordAnswer: (question: QuestionEdits) => void;
  addNewQuestion: (subject: string, category?: string) => void;
  editQuestion: (question: QuestionEdits) => void;
}): JSX.Element {
  const { classes, block } = props;
  const answers = props
    .getAnswers()
    .filter((a) => block.questions.includes(a.question));
  const questions = props.getQuestions();
  const complete = filterAnswersByStatus(
    answers,
    questions.map((qe) => qe.originalQuestion),
    props.mentorType,
    Status.COMPLETE
  );
  const incomplete = filterAnswersByStatus(
    answers,
    questions.map((qe) => qe.originalQuestion),
    props.mentorType,
    Status.INCOMPLETE
  );

  return (
    <Paper className={classes.paper}>
      <div
        style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
      >
        <Typography data-cy="block-name" variant="h6" className={classes.title}>
          {block.name}
        </Typography>
        <div
          data-cy="block-progress"
          style={{ flexGrow: 1, marginLeft: 25, marginRight: 25 }}
        >
          <ProgressChecks value={complete.length} total={answers.length} />
        </div>
      </div>
      <Typography data-cy="block-description" className={classes.subtitle}>
        {block.description}
      </Typography>
      <div style={{ marginTop: 10 }}>
        <div style={{ flex: "auto" }}>
          <AnswerList
            classes={classes}
            mentorId={props.mentorId}
            header="Complete"
            answers={complete}
            questions={questions}
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
            questions={questions}
            mentorId={props.mentorId}
            onRecordAll={() =>
              props.recordAnswers(
                Status.INCOMPLETE,
                block.subject,
                block.category || ""
              )
            }
            onRecordOne={props.recordAnswer}
            onAddQuestion={() =>
              props.addNewQuestion(block.subject, block.category)
            }
            onEditQuestion={props.editQuestion}
          />
        </div>
      </div>
    </Paper>
  );
}
