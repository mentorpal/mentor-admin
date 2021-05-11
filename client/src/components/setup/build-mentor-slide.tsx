/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { Paper, Typography, Button, CircularProgress } from "@material-ui/core";
import { CLIENT_ENDPOINT } from "api";
import { JobState, Mentor } from "types";
import { useWithTraining } from "hooks/task/use-with-train";

export function BuildMentorSlide(props: {
  classes: Record<string, string>;
  mentor: Mentor;
  isMentorLoading: boolean;
  isSetupComplete: boolean;
}): JSX.Element {
  const { classes, mentor, isMentorLoading, isSetupComplete } = props;
  const { isTraining, trainStatus, startTraining } = useWithTraining();

  function renderMessage(): JSX.Element {
    if (!isSetupComplete) {
      return (
        <div>
          <Typography variant="h6" className={classes.text}>
            You&apos;re still missing some steps before you can build your
            mentor.
          </Typography>
          <Typography variant="h6" className={classes.text}>
            Make sure you complete the previous slides first.
          </Typography>
        </div>
      );
    }
    if (isTraining) {
      return (
        <div>
          <Typography variant="h6" className={classes.text}>
            Building your mentor...
          </Typography>
          <CircularProgress />
        </div>
      );
    }
    if (trainStatus?.state === JobState.FAILURE) {
      return (
        <div>
          <Typography variant="h6" className={classes.text}>
            Oops, training failed. Please try again.
          </Typography>
        </div>
      );
    }
    if (
      Boolean(mentor?.lastTrainedAt) ||
      trainStatus?.state === JobState.SUCCESS
    ) {
      return (
        <div>
          <Typography variant="h6" className={classes.text}>
            Congratulations! Your brand-new mentor is ready!
          </Typography>
          <Typography variant="h6" className={classes.text}>
            Click the preview button to see your mentor.
          </Typography>
          <Typography variant="h6" className={classes.text}>
            Click the build button to retrain your mentor.
          </Typography>
        </div>
      );
    }
    return (
      <div>
        <Typography variant="h6" className={classes.text}>
          Click the build button to start building your mentor.
        </Typography>
        <Typography variant="h6" className={classes.text}>
          Once its complete, click preview to see your mentor.
        </Typography>
      </div>
    );
  }

  if (!mentor || isMentorLoading) {
    return <div />;
  }

  return (
    <Paper className={classes.card}>
      <Typography variant="h3" className={classes.title}>
        {isSetupComplete
          ? "Great job! You're ready to build your mentor!"
          : "Oops! Your mentor is not ready yet."}
      </Typography>
      <div className={classes.column}>{renderMessage()}</div>
      <div className={classes.row}>
        <Button
          data-cy="train-btn"
          variant="contained"
          color="primary"
          disabled={isTraining || !isSetupComplete}
          className={classes.button}
          onClick={() => startTraining(mentor._id)}
        >
          Build
        </Button>
        {mentor.lastTrainedAt ? (
          <Button
            data-cy="preview-btn"
            className={classes.button}
            variant="contained"
            color="secondary"
            disabled={isTraining || !isSetupComplete}
            onClick={() => {
              const path = `${location.origin}${CLIENT_ENDPOINT}?mentor=${mentor._id}`;
              window.location.href = path;
            }}
          >
            Preview
          </Button>
        ) : undefined}
      </div>
    </Paper>
  );
}
