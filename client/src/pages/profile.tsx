/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import {
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import NavBar from "components/nav-bar";
import withAuthorizationOnly from "hooks/wrap-with-authorization-only";
import { useWithMentor } from "hooks/graphql/use-with-mentor";
import { ErrorDialog, LoadingDialog } from "components/dialog";
import { MentorType } from "types";

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

function ProfilePage(props: { accessToken: string }): JSX.Element {
  const classes = useStyles();
  const {
    editedMentor,
    mentorError,
    isMentorLoading,
    isMentorSaving,
    isMentorEdited,
    clearMentorError,
    saveMentorDetails,
    editMentor,
  } = useWithMentor(props.accessToken);

  return (
    <div className={classes.root}>
      <NavBar title="Mentor Studio" mentorId={editedMentor?._id} />
      <Paper className={classes.paper}>
        <Typography variant="h6" className={classes.title}>
          My Profile
        </Typography>
        <TextField
          data-cy="mentor-name"
          label="Name"
          variant="outlined"
          value={editedMentor?.name || ""}
          onChange={(e) => editMentor({ name: e.target.value })}
          className={classes.inputField}
        />
        <TextField
          data-cy="mentor-first-name"
          label="First Name"
          variant="outlined"
          value={editedMentor?.firstName || ""}
          onChange={(e) => editMentor({ firstName: e.target.value })}
          className={classes.inputField}
        />
        <TextField
          data-cy="mentor-job-title"
          label="Job Title"
          variant="outlined"
          value={editedMentor?.title || ""}
          onChange={(e) => editMentor({ title: e.target.value })}
          className={classes.inputField}
        />
        <TextField
          data-cy="mentor-email"
          label="Email"
          type="email"
          variant="outlined"
          helperText="Leave blank if you don't want anyone to contact you"
          value={editedMentor?.email || ""}
          onChange={(e) => editMentor({ email: e.target.value })}
          className={classes.inputField}
        />
        <div className={classes.inputField}>
          <FormControl>
            <InputLabel>Mentor Type</InputLabel>
            <Select
              data-cy="select-chat-type"
              label="Mentor Type"
              value={editedMentor?.mentorType}
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
            <FormHelperText>
              {editedMentor?.mentorType === MentorType.CHAT
                ? "Respond with text-only chat bubbles"
                : editedMentor?.mentorType === MentorType.VIDEO
                ? "Respond with pre-recorded videos"
                : ""}
            </FormHelperText>
          </FormControl>
        </div>
        <Button
          data-cy="update-btn"
          variant="contained"
          color="primary"
          disabled={!isMentorEdited}
          onClick={saveMentorDetails}
        >
          Save Changes
        </Button>
      </Paper>
      <LoadingDialog
        title={isMentorLoading ? "Loading" : isMentorSaving ? "Saving" : ""}
      />
      <ErrorDialog error={mentorError} clearError={clearMentorError} />
    </div>
  );
}

export default withAuthorizationOnly(ProfilePage);
