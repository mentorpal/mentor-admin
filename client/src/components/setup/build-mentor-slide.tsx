/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { Typography, Button } from "@material-ui/core";
import { CLIENT_ENDPOINT } from "api";
import { Mentor } from "types";
import { Slide } from "./slide";

export function BuildMentorSlide(props: {
  classes: Record<string, string>;
  mentor: Mentor;
  isBuildable: boolean;
  isBuilt: boolean;
  startTraining: () => void;
}): JSX.Element {
  const { classes, mentor, isBuildable, isBuilt, startTraining } = props;

  function renderMessage(): JSX.Element {
    if (!isBuildable) {
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
    if (isBuilt) {
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

  if (!mentor) {
    return <div />;
  }

  return (
    <Slide
      classes={classes}
      title={
        isBuildable
          ? "Great job! You're ready to build your mentor!"
          : "Oops! Your mentor is not ready yet."
      }
      content={
        <div>
          <div>{renderMessage()}</div>
          <div className={classes.row}>
            <Button
              data-cy="train-btn"
              variant="contained"
              color="primary"
              disabled={!isBuildable}
              className={classes.button}
              onClick={startTraining}
            >
              Build
            </Button>
            {isBuilt ? (
              <Button
                data-cy="preview-btn"
                variant="contained"
                color="secondary"
                className={classes.button}
                disabled={!isBuildable}
                onClick={() => {
                  const path = `${location.origin}${CLIENT_ENDPOINT}?mentor=${mentor._id}`;
                  window.location.href = path;
                }}
              >
                Preview
              </Button>
            ) : undefined}
          </div>
        </div>
      }
    />
  );
}
