/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { Typography, Button } from "@material-ui/core";
import { Mentor, SetupStatus } from "types";
import { Slide } from "./slide";
import { navigate } from "@reach/router";

export function FinalSetupSlide(props: {
  classes: Record<string, string>;
  mentor: Mentor;
  setupStatus: SetupStatus;
}): JSX.Element {
  const { classes, mentor, setupStatus } = props;
  function renderMessage(): JSX.Element {
    if (!setupStatus.isMentorInfoDone) {
      return (
        <div>
          <Typography variant="h6" className={classes.text}>
            Mentor setup incomplete.
          </Typography>
          <Typography variant="h6" className={classes.text}>
            Please enter your Mentor Info before proceeding.
          </Typography>
        </div>
      );
    }
    return (
      <div>
        <Typography variant="h6" className={classes.text}>
          Your mentor is coming together!
        </Typography>
        <Typography variant="h6" className={classes.text}>
          Visit the My Mentor page using the button below to continue working on
          your mentor.
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
      title={setupStatus.isMentorInfoDone ? "Good work!" : "Oops!"}
      content={
        <div>
          <div>{renderMessage()}</div>
          <div className={classes.row}>
            {setupStatus.isMentorInfoDone ? (
              <Button
                data-cy="go-to-my-mentor-button"
                variant="contained"
                color="primary"
                className={classes.button}
                style={{ width: "150px" }}
                onClick={() => {
                  navigate("/admin");
                }}
              >
                Done
              </Button>
            ) : undefined}
          </div>
        </div>
      }
    />
  );
}
