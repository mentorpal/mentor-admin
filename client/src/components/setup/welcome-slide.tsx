/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { Typography } from "@material-ui/core";
import { Slide } from "./slide";

export function WelcomeSlide(props: {
  classes: Record<string, string>;
  userName: string;
}): JSX.Element {
  const { classes } = props;
  return (
    <Slide
      classes={classes}
      title="Welcome to MentorStudio!"
      content={
        <div>
          <Typography variant="h6" className={classes.text}>
            It&apos;s nice to meet you, {props.userName}!
          </Typography>
          <Typography variant="h6" className={classes.text}>
            Let&apos;s get started setting up your new mentor.
          </Typography>
          <Typography variant="h6" className={classes.text}>
            {"If you'd like to view a walkthrough, "}
            <a data-cy="click-here-url" href="https://docs.google.com/document/d/1fATgURjlHda7WZaUCv4qYeouep8JoQrKcJtrTzBXGJs/edit?usp=sharing" target="blank">
                click here.
            </a>
          </Typography>
         
        </div>
      }
    />
  );
}
