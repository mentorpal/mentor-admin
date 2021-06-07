/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { Paper, Typography, TextField, Button } from "@material-ui/core";
import { Mentor } from "types";

export function MentorInfoSlide(props: {
  classes: Record<string, string>;
  mentor: Mentor | undefined;
  isMentorEdited: boolean;
  isMentorLoading: boolean;
  editMentor: (edits: Partial<Mentor>) => void;
  saveMentor: () => void;
}): JSX.Element {
  const {
    classes,
    mentor,
    isMentorEdited,
    isMentorLoading,
    editMentor,
    saveMentor,
  } = props;

  if (!mentor || isMentorLoading) {
    return <div />;
  }

  return (
    <Paper className={classes.card}>
      <Typography variant="h3" className={classes.title}>
        Tell us a little about yourself.
      </Typography>
      <div className={classes.column}>
        <TextField
          required
          data-cy="first-name"
          label="First Name"
          variant="outlined"
          value={mentor.firstName || ""}
          onChange={(e) => editMentor({ firstName: e.target.value })}
          className={classes.inputField}
        />
        <TextField
          required
          data-cy="name"
          label="Full Name"
          variant="outlined"
          value={mentor.name || ""}
          onChange={(e) => editMentor({ name: e.target.value })}
          className={classes.inputField}
        />
        <TextField
          required
          data-cy="title"
          label="Job Title"
          variant="outlined"
          value={mentor.title || ""}
          onChange={(e) => editMentor({ title: e.target.value })}
          className={classes.inputField}
        />
        <TextField
          data-cy="email"
          label="Email"
          type="email"
          variant="outlined"
          helperText="Leave blank if you don't want anyone to contact you"
          value={mentor.email || ""}
          onChange={(e) => editMentor({ email: e.target.value })}
          className={classes.inputField}
        />
        <Button
          data-cy="save-btn"
          variant="contained"
          color="primary"
          disabled={!isMentorEdited}
          onClick={saveMentor}
        >
          Save Changes
        </Button>
      </div>
    </Paper>
  );
}
