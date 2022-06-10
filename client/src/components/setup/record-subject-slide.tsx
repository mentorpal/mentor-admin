/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { navigate } from "gatsby";
import React from "react";
import { Typography, Button } from "@material-ui/core";
import { Status, Subject, Answer } from "types";
import { Slide } from "./slide";
import { urlBuild } from "helpers";

export function RecordSubjectSlide(props: {
  classes: Record<string, string>;
  subject: Subject;
  questions: Answer[];
  i: number;
  customTitle?: string; // pass in optional slide title
}): JSX.Element {
  const { classes, subject, questions, i } = props;
  const recorded = questions.filter((q) => q.status === Status.COMPLETE);
  const isRecorded = questions.length === recorded.length;

  function onRecord() {
    navigate(
      urlBuild("/record", {
        subject: subject._id,
        back: urlBuild("/setup", { i: String(i) }),
      })
    );
  }

  return (
    <Slide
      classes={classes}
      title={
        props.customTitle ? props.customTitle : `${subject.name} questions`
      }
      content={
        <div>
          <Typography variant="h6" className={classes.text}>
            {subject.description}
          </Typography>
          <Button
            data-cy="record-btn"
            variant="contained"
            color={isRecorded ? "primary" : "secondary"}
            onClick={onRecord}
            className={classes.button}
          >
            Record
          </Button>
          <Typography variant="h6" className={classes.text}>
            {recorded.length} / {questions.length}
          </Typography>
        </div>
      }
    />
  );
}
