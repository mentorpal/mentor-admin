/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { navigate } from "gatsby";
import React from "react";
import { Typography, Button } from "@material-ui/core";
import { Answer, Status } from "types";
import { Slide } from "./slide";
import { urlBuild } from "helpers";

export function RecordIdleSlide(props: {
  classes: Record<string, string>;
  idle: Answer;
  i: number;
}): JSX.Element {
  const { classes, idle, i } = props;
  const isRecorded = idle.status === Status.COMPLETE;

  function onRecord() {
    navigate(
      urlBuild("/record", {
        videoId: idle.question,
        back: urlBuild("/setup", { i: String(i) }),
      })
    );
  }

  return (
    <Slide
      classes={classes}
      title="Idle"
      content={
        <div>
          <Typography variant="h6" className={classes.text}>
            Let&apos;s record a short idle calibration video.
          </Typography>
          <Typography variant="h6" className={classes.text}>
            Click the record button and you&apos;ll be taken to a recording
            screen.
          </Typography>
          <Button
            data-cy="record-btn"
            variant="contained"
            color = "primary"
            //color={isRecorded ? "primary" : "secondary"}
            onClick={onRecord}
            className={classes.button}
          >
            Record
          </Button>
          <Typography variant="h6" className={classes.text}>
            {isRecorded ? 1 : 0} / 1
          </Typography>
        </div>
      }
    />
  );
}
