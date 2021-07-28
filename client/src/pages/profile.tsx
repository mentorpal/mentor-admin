/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import NavBar from "components/nav-bar";
import withAuthorizationOnly from "hooks/wrap-with-authorization-only";

import { ErrorDialog, LoadingDialog } from "components/dialog";
import { MentorType } from "types";
import { useActiveMentor } from "store/slices/mentor/useActiveMentor";

import { MentorStatus } from "store/slices/mentor";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#ddd",
    width: "100%",
    height: "100%",
  },
  paper: {
    flexGrow: 1,
    height: "100%",
    padding: 25,
    margin: 25,
  },
  title: {
    fontWeight: "bold",
  },
  inputField: {
    width: "100%",
    margin: 10,
  },
}));

function ProfilePage(): JSX.Element {
  const classes = useStyles();
  const { mentorState, saveMentor, editMentor } = useActiveMentor();

  if (!mentorState.editedData) {
    return <div />;
  }

  return (
    <div className={classes.root}>
      <NavBar title="My Profile" mentorId={mentorState.editedData?._id} />
      <Paper className={classes.paper}>
        <div className={classes.inputField}>
          <FormControl>
            <InputLabel>Mentor Type</InputLabel>
            <Select
              data-cy="select-chat-type"
              label="Mentor Type"
              value={mentorState.editedData.mentorType}
              style={{ width: 200 }}
              onChange={(
                event: React.ChangeEvent<{
                  name?: string | undefined;
                  value: unknown;
                }>
              ) => {
                editMentor({ mentorType: event.target.value as MentorType });
              }}
            >
              <MenuItem data-cy="chat" value={MentorType.CHAT}>
                Chat
              </MenuItem>
              <MenuItem data-cy="video" value={MentorType.VIDEO}>
                Video
              </MenuItem>
            </Select>
          </FormControl>
        </div>
        <TextField
          data-cy="mentor-name"
          label="Full Name"
          variant="outlined"
          value={mentorState.editedData.name}
          onChange={(e) => editMentor({ name: e.target.value })}
          className={classes.inputField}
        />
        <TextField
          data-cy="mentor-first-name"
          label="First Name"
          variant="outlined"
          value={mentorState.editedData.firstName}
          onChange={(e) => editMentor({ firstName: e.target.value })}
          className={classes.inputField}
        />
        <TextField
          data-cy="mentor-job-title"
          label="Job Title"
          variant="outlined"
          value={mentorState.editedData.title}
          onChange={(e) => editMentor({ title: e.target.value })}
          className={classes.inputField}
        />
        <TextField
          data-cy="mentor-email"
          label="Email"
          type="email"
          variant="outlined"
          value={mentorState.editedData.email}
          onChange={(e) => editMentor({ email: e.target.value })}
          className={classes.inputField}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={mentorState.editedData.allowContact}
              onChange={() =>
                editMentor({
                  allowContact: !mentorState.editedData?.allowContact,
                })
              }
              color="secondary"
            />
          }
          label="Allow people to contact me"
          style={{ width: "100%", marginLeft: 10, marginRight: 10 }}
        />
        <Button
          data-cy="update-btn"
          variant="contained"
          color="primary"
          disabled={!mentorState.isEdited}
          onClick={saveMentor}
        >
          Save Changes
        </Button>
      </Paper>
      <LoadingDialog
        title={
          mentorState.mentorStatus === MentorStatus.LOADING
            ? "Loading"
            : mentorState.mentorStatus === MentorStatus.SAVING
            ? "Saving"
            : ""
        }
      />
      <ErrorDialog error={mentorState.error} />
    </div>
  );
}

export default withAuthorizationOnly(ProfilePage);
