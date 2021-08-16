/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { navigate } from "gatsby";
import React, { useState } from "react";
import {
  AppBar,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fab,
  List,
  ListItem,
  MenuItem,
  Select,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import NavBar from "components/nav-bar";
import RecordingBlockItem from "components/home/recording-block";
import withLocation from "wrap-with-location";
import withAuthorizationOnly from "hooks/wrap-with-authorization-only";
import { useWithReviewAnswerState } from "hooks/graphql/use-with-review-answer-state";
import { ErrorDialog, LoadingDialog } from "components/dialog";
import MyMentorCard from "components/my-mentor-card";
import { User } from "types";
import { launchMentor } from "helpers";
import { useWithSetup } from "hooks/graphql/use-with-setup";

const useStyles = makeStyles((theme) => ({
  toolbar: theme.mixins.toolbar,
  root: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    fontWeight: "bold",
  },
  subtitle: {
    marginLeft: 10,
    fontStyle: "italic",
  },
  paper: {
    width: "100%",
    padding: 25,
  },
  appBar: {
    top: "auto",
    bottom: 0,
    flexShrink: 0,
  },
  expand: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: "rotate(180deg)",
  },
  fab: {
    marginLeft: 10,
    marginRight: 10,
  },
}));

function HomePage(props: {
  accessToken: string;
  search: { subject?: string };
  user: User;
}): JSX.Element {
  const classes = useStyles();
  const {
    useMentor,
    isLoading,
    selectedSubject,
    blocks,
    progress,
    isSaving,
    isTraining,
    error,
    selectSubject,
    saveChanges,
    startTraining,
  } = useWithReviewAnswerState(props.accessToken, props.search);
  const { mentor, isMentorEdited } = useMentor;
  const { setupStatus, navigateToMissingSetup } = useWithSetup();
  const [showSetupAlert, setShowSetupAlert] = useState(true);

  React.useEffect(() => {
    if (!setupStatus || !showSetupAlert) {
      return;
    }
    setShowSetupAlert(!setupStatus.isSetupComplete);
  }, [setupStatus]);

  if (!mentor || !setupStatus) {
    return (
      <div>
        <NavBar title="Mentor Studio" mentorId={""} />
        <CircularProgress />
      </div>
    );
  }
  if (!setupStatus.isMentorInfoDone) {
    navigate("/setup");
  }

  const continueAction = () =>
    mentor.isDirty ? startTraining(mentor._id) : launchMentor(mentor._id);

  return (
    <div className={classes.root}>
      <div>
        <NavBar
          title="My Mentor"
          mentorId={mentor?._id}
          userRole={props.user.userRole}
        />
        <MyMentorCard
          accessToken={props.accessToken}
          continueAction={continueAction}
          useMentor={useMentor}
        />
        <Select
          data-cy="select-subject"
          value={mentor?.subjects.find((s) => s._id === selectedSubject)}
          displayEmpty
          renderValue={() => (
            <Typography variant="h6" className={classes.title}>
              {mentor?.subjects.find((s) => s._id === selectedSubject)?.name ||
                "All Answers"}{" "}
              ({progress.complete} / {progress.total})
            </Typography>
          )}
          onChange={(
            event: React.ChangeEvent<{ value: unknown; name?: unknown }>
          ) => {
            selectSubject(event.target.value as string);
          }}
        >
          <MenuItem data-cy="all-subjects" value={undefined}>
            Show All Subjects
          </MenuItem>
          {mentor?.subjects.map((s) => (
            <MenuItem key={s._id} data-cy={`select-${s._id}`} value={s._id}>
              {s.name}
            </MenuItem>
          ))}
        </Select>
      </div>
      <List
        data-cy="recording-blocks"
        style={{
          flex: "auto",
          backgroundColor: "#eee",
        }}
      >
        {blocks.map((b, i) => (
          <ListItem key={b.name} data-cy={`block-${i}`}>
            <RecordingBlockItem
              classes={classes}
              block={b}
              mentorId={mentor?._id || ""}
            />
          </ListItem>
        ))}
      </List>
      <div className={classes.toolbar} />
      <AppBar position="fixed" color="default" className={classes.appBar}>
        <Toolbar
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          <Fab
            data-cy="save-button"
            variant="extended"
            color="secondary"
            disabled={!isMentorEdited}
            onClick={saveChanges}
            className={classes.fab}
          >
            Save Changes
          </Fab>
          <Fab
            data-cy="train-button"
            variant="extended"
            color="primary"
            disabled={!mentor || isTraining || isLoading || isSaving}
            onClick={continueAction}
            className={classes.fab}
          >
            {mentor.isDirty ? "Build Mentor" : "Preview Mentor"}
          </Fab>
        </Toolbar>
      </AppBar>
      <LoadingDialog
        title={
          isLoading
            ? "Loading..."
            : isSaving
            ? "Saving..."
            : isTraining
            ? "Building..."
            : ""
        }
      />
      <ErrorDialog error={error} />
      <Dialog
        data-cy="setup-dialog"
        maxWidth="sm"
        fullWidth={true}
        open={setupStatus && !setupStatus.isSetupComplete && showSetupAlert}
        onClose={() => setShowSetupAlert(false)}
      >
        <DialogTitle data-cy="setup-dialog-title">Finish Setup?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            You have not finished setting up your mentor. Would you like to
            continue it?
          </DialogContentText>
        </DialogContent>
        <DialogContent>
          <Button data-cy="setup-yes" onClick={navigateToMissingSetup}>
            Yes
          </Button>
          <Button
            data-cy="setup-no"
            onClick={() => {
              setShowSetupAlert(false);
            }}
          >
            No
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default withAuthorizationOnly(withLocation(HomePage));
