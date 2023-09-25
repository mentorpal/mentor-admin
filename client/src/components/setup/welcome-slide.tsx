/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { Typography } from "@mui/material";
import { Slide } from "./slide";
import { MentorConfig } from "types-gql";

export function WelcomeSlide(props: {
  classes: Record<string, string>;
  userName: string;
  docSetupUrl: string;
  mentorConfig?: MentorConfig;
}): JSX.Element {
  const { classes, docSetupUrl, mentorConfig } = props;
  function generateWelcomeTextDisplay(welcomeText: string): JSX.Element {
    return (
      <div>
        {welcomeText
          .split(".")
          .filter((text) => text.length > 1)
          .map((text, index) => (
            <Typography variant="h6" className={classes.text} key={index}>
              {text}.
            </Typography>
          ))}
      </div>
    );
  }
  return (
    <Slide
      classes={classes}
      title={mentorConfig?.welcomeSlideHeader || "Welcome to MentorStudio!"}
      content={
        <div>
          <Typography variant="h6" className={classes.text}>
            It&apos;s nice to meet you, {props.userName}!
          </Typography>
          <Typography variant="h6" className={classes.text}>
            {generateWelcomeTextDisplay(
              mentorConfig?.welcomeSlideText ||
                "Let's get started setting up your new mentor."
            )}
          </Typography>
          <Typography
            data-cy="walkthrough-intro"
            variant="h6"
            className={classes.text}
            style={{
              opacity: docSetupUrl ? "100" : "0",
            }}
          >
            {"If you'd like to view a walkthrough, "}
            <a data-cy="click-here-url" href={docSetupUrl} target="blank">
              click here.
            </a>
          </Typography>
        </div>
      }
    />
  );
}
