/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { Paper, Typography } from "@mui/material";

export function Slide(props: {
  classes: Record<string, string>;
  title: string;
  content: JSX.Element;
}): JSX.Element {
  const { classes } = props;
  return (
    <Paper
      className={classes.card}
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography
        variant="h2"
        data-cy="slide-title"
        className={classes.title}
        style={{ flexGrow: 0 }}
      >
        {props.title}
      </Typography>
      <div
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        {props.content}
      </div>
    </Paper>
  );
}
