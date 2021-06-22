/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect } from "react";
import { MentorType, Status, UtteranceName } from "types";
import { navigate } from "gatsby";
import {
  AppBar,
  CircularProgress,
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
import { useWithSetup } from "hooks/graphql/use-with-setup";
import { useWithReviewAnswerState } from "hooks/graphql/use-with-review-answer-state";
import { ErrorDialog, LoadingDialog } from "components/dialog";

import StageCard from "components/stage-card";

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
}): JSX.Element {
  const classes = useStyles();
  const {
    mentor,
    isLoading,
    isMentorEdited,
    selectedSubject,
    blocks,
    progress,
    isSaving,
    isTraining,
    error,
    clearError,
    selectSubject,
    saveChanges,
    startTraining,
  } = useWithReviewAnswerState(props.accessToken, props.search);
  const { setupStatus } = useWithSetup(props.accessToken);
  const idleAnswer = mentor
    ? mentor.answers.find((a) => a.question.name === UtteranceName.IDLE)
    : undefined;
  const idle = mentor
    ? mentor.mentorType === MentorType.VIDEO && idleAnswer
      ? { idle: idleAnswer, complete: idleAnswer.status === Status.COMPLETE }
      : undefined
    : undefined;
  const idleUrl =
    idle?.complete && idleAnswer!.media!
      ? idleAnswer!.media![0].url
      : undefined;

  useEffect(() => {
    if (setupStatus?.isSetupComplete === false) {
      navigate(`/setup`);
    }
  }, [setupStatus]);

  if (!setupStatus) {
    return (
      <div>
        <NavBar title="Mentor Studio" mentorId={mentor?._id} />
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <div>
        <NavBar title="Mentor Studio" mentorId={mentor?._id} />
        <StageCard
          name={mentor!.name || "Unnamed"}
          type={mentor!.mentorType}
          title={mentor!.title || "none"}
          lastTrainedAt={mentor!.lastTrainedAt || "never"}
          value={
            mentor?.answers.filter((a) => a.status === "COMPLETE").length || 0
          }
          thumbnail={idleUrl}
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
            disabled={isTraining || isLoading || isSaving}
            onClick={() => startTraining(mentor!._id)}
            className={classes.fab}
          >
            Build Mentor
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
      <ErrorDialog error={error} clearError={clearError} />
    </div>
  );
}

export default withAuthorizationOnly(withLocation(HomePage));
