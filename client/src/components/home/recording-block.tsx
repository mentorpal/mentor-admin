/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { Paper, Typography } from "@material-ui/core";
import { Answer, Question, Status } from "types";
import AnswerList from "components/home/answer-list";
import ProgressBar from "components/progress-bar";

export interface RecordingBlock {
  name: string;
  description: string;
  answers: Answer[];
  recordAll: (status: Status) => void;
  recordOne: (answer: Answer) => void;
  editQuestion: (question: Question) => void;
  addQuestion?: () => void;
}

export default function RecordingBlockItem(props: {
  classes: Record<string, string>;
  block: RecordingBlock;
  mentorId: string;
}): JSX.Element {
  const { classes, block } = props;
  const answers = block.answers;
  const complete = answers.filter((a) => a.status === Status.COMPLETE);
  const incomplete = answers.filter((a) => a.status === Status.INCOMPLETE);

  return (
    <Paper className={classes.paper}>
      <div
        style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
      >
        <Typography id="block-name" variant="h6" className={classes.title}>
          {block.name}
        </Typography>
        <div
          id="block-progress"
          style={{ flexGrow: 1, marginLeft: 25, marginRight: 25 }}
        >
          <ProgressBar value={complete.length} total={answers.length} />
        </div>
      </div>
      <Typography id="block-description" className={classes.subtitle}>
        {block.description}
      </Typography>
      <div style={{ marginTop: 10 }}>
        <div style={{ flex: "auto" }}>
          <AnswerList
            classes={classes}
            answers={complete}
            header="Complete"
            mentorId={props.mentorId}
            onRecordAll={() => block.recordAll(Status.COMPLETE)}
            onRecordOne={block.recordOne}
            onEditQuestion={block.editQuestion}
          />
          <AnswerList
            classes={classes}
            answers={incomplete}
            header="Incomplete"
            mentorId={props.mentorId}
            onRecordAll={() => block.recordAll(Status.INCOMPLETE)}
            onRecordOne={block.recordOne}
            onAddQuestion={block.addQuestion}
            onEditQuestion={block.editQuestion}
          />
        </div>
      </div>
    </Paper>
  );
}
