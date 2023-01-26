/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { navigate } from "gatsby";
import React from "react";
import { Typography, Button } from "@mui/material";
import { Slide } from "./slide";
import { urlBuild } from "helpers";

export function SelectSubjectsSlide(props: {
  classes: Record<string, string>;
  i: number;
}): JSX.Element {
  const { classes, i } = props;

  function onClick() {
    navigate(
      urlBuild("/subjects", {
        back: urlBuild("/setup", { i: String(i) }),
      })
    );
  }

  return (
    <Slide
      classes={classes}
      title="Select subjects?"
      content={
        <div>
          <Typography variant="h6" className={classes.text}>
            These are question sets related to a particular field or topic.
          </Typography>
          <Typography variant="h6" className={classes.text}>
            Pick the ones you feel qualified to mentor in!
          </Typography>
          <Typography variant="h6" className={classes.text}>
            After recording a subject, you&apos;ll be placed in a panel with
            other mentors in your field.
          </Typography>
          <Button
            data-cy="button"
            variant="contained"
            color="primary"
            onClick={onClick}
          >
            View Subjects
          </Button>
        </div>
      }
    />
  );
}
