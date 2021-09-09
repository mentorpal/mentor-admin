/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { navigate } from "gatsby";
import React, { useState, useEffect } from "react";
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
  TextField,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { LoadingDialog, ErrorDialog } from "components/dialog";
import MyMentorCard from "components/my-mentor-card";
import parseMentor, {
  defaultMentorInfo,
} from "components/my-mentor-card/mentor-info";
import NavBar from "components/nav-bar";
import { launchMentor, onTextInputChanged } from "helpers";
import { useWithReviewAnswerState } from "hooks/graphql/use-with-review-answer-state";
import { useWithSetup } from "hooks/graphql/use-with-setup";
import { useWithTraining } from "hooks/task/use-with-train";
import withAuthorizationOnly from "hooks/wrap-with-authorization-only";
import useActiveMentor, {
  useActiveMentorActions,
  isActiveMentorLoading,
} from "store/slices/mentor/useActiveMentor";
import { useMentorEdits } from "store/slices/mentor/useMentorEdits";
import { User, Subject, UserRole } from "types";
import withLocation from "wrap-with-location";
import RecordingBlockItem from "./recording-block";

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
  const reviewAnswerState = useWithReviewAnswerState(
    props.accessToken,
    props.search
  );
  const useMentor = useMentorEdits();
  const {
    isPolling: isTraining,
    error: trainError,
    startTask: startTraining,
    clearError: clearTrainingError,
  } = useWithTraining();
  const { loadMentor, clearMentorError } = useActiveMentorActions();
  const { setupStatus, navigateToMissingSetup } = useWithSetup();

  const mentorId = useActiveMentor((m) => m.data?._id || "");
  const mentorLoading = isActiveMentorLoading();
  const mentorError = useActiveMentor((state) => state.error);
  const mentorIsDirty = useActiveMentor((m) => Boolean(m.data?.isDirty));
  const defaultMentor = props.user.defaultMentor._id;
  const mentorOwnership = defaultMentor === mentorId;

  const classes = useStyles();
  const [showSetupAlert, setShowSetupAlert] = useState(true);
  const [activeMentorId, setActiveMentorId] = useState(defaultMentor);
  const mentorSubjectNamesById: Record<string, string> = useActiveMentor((m) =>
    (m.data?.subjects || []).reduce(
      (acc: Record<string, string>, cur: Subject) => {
        acc[cur._id] = cur.name;
        return acc;
      },
      {}
    )
  );
  const mentorInfo = useActiveMentor((ms) =>
    ms.data ? parseMentor(ms.data) : defaultMentorInfo
  );
  const continueAction = () =>
    mentorIsDirty ? startTraining(mentorId) : launchMentor(mentorId);

  useEffect(() => {
    if (!setupStatus || !showSetupAlert) {
      return;
    }
    setShowSetupAlert(!setupStatus.isBuildable);
  }, [setupStatus]);

  if (!(mentorId && setupStatus)) {
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

  return (
    <div
      data-cy="my-mentor-wrapper"
      className={classes.root}
      style={{ background: mentorOwnership ? "white" : "black" }}
    >
      <div>
        <NavBar
          title="My Mentor"
          mentorId={mentorId}
          userRole={props.user.userRole}
        />
        <MyMentorCard
          editDisabled={!mentorOwnership}
          continueAction={continueAction}
          useMentor={useMentor}
        />
        {props.user.userRole === UserRole.ADMIN && (
          <div data-cy="mentor-select">
            <TextField
              data-cy="switch-mentor-id"
              label="Active Mentor Id"
              value={activeMentorId}
              onChange={(e) =>
                onTextInputChanged(e, () => {
                  setActiveMentorId(e.target.value);
                })
              }
            />
            <Fab
              data-cy="switch-mentor-button"
              variant="extended"
              color="secondary"
              onClick={() => loadMentor(activeMentorId)}
              className={classes.fab}
            >
              Switch Mentor
            </Fab>
            <Fab
              data-cy="default-mentor-button"
              variant="extended"
              color="primary"
              onClick={() => {
                setActiveMentorId(defaultMentor);
                loadMentor();
              }}
              className={classes.fab}
            >
              Default Mentor
            </Fab>
          </div>
        )}
        <Select
          data-cy="select-subject"
          value={
            reviewAnswerState.selectedSubject
              ? mentorSubjectNamesById[reviewAnswerState.selectedSubject]
              : undefined
          }
          displayEmpty
          renderValue={() => (
            <Typography variant="h6" className={classes.title}>
              {reviewAnswerState.selectedSubject
                ? mentorSubjectNamesById[reviewAnswerState.selectedSubject]
                : "All Answers"}{" "}
              ({reviewAnswerState.progress.complete} /{" "}
              {reviewAnswerState.progress.total})
            </Typography>
          )}
          onChange={(
            event: React.ChangeEvent<{ value: unknown; name?: unknown }>
          ) => {
            reviewAnswerState.selectSubject(event.target.value as string);
          }}
        >
          <MenuItem data-cy="all-subjects" value={undefined}>
            Show All Subjects
          </MenuItem>
          {Object.entries(mentorSubjectNamesById).map(([id, name]) => (
            <MenuItem key={id} data-cy={`select-${id}`} value={id}>
              {name}
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
        {reviewAnswerState.getBlocks().map((b, i) => (
          <ListItem key={b.name} data-cy={`block-${i}`}>
            <RecordingBlockItem
              mentorId={mentorId || ""}
              classes={classes}
              block={b}
              getAnswers={reviewAnswerState.getAnswers}
              getQuestions={reviewAnswerState.getQuestions}
              recordAnswers={reviewAnswerState.recordAnswers}
              recordAnswer={reviewAnswerState.recordAnswer}
              addNewQuestion={reviewAnswerState.addNewQuestion}
              editQuestion={reviewAnswerState.editQuestion}
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
            justifyContent: "center",
          }}
        >
          <div className={"trainnig-stage-info"}>
            <Typography
              variant="body1"
              color="textSecondary"
              align="left"
              data-cy="mentor-card-trained"
            >
              Last Trained: {mentorInfo.lastTrainedAt.substring(0, 10)}
            </Typography>
          </div>
          <div className="page-buttons">
            <Fab
              data-cy="save-button"
              variant="extended"
              color="secondary"
              onClick={() => {
                reviewAnswerState.saveChanges();
                if (useMentor.isMentorEdited) {
                  useMentor.saveMentorDetails();
                }
              }}
              className={[classes.fab, "secondary-btn"].join(" ")}
            >
              Save Changes
            </Fab>
            <Fab
              data-cy="train-button"
              variant="extended"
              color="primary"
              disabled={
                !mentorId ||
                isTraining ||
                mentorLoading ||
                reviewAnswerState.isSaving
              }
              onClick={continueAction}
              className={classes.fab}
            >
              {mentorIsDirty ? "Build Mentor" : "Preview Mentor"}
            </Fab>
          </div>
        </Toolbar>
      </AppBar>
      <LoadingDialog
        title={
          mentorLoading
            ? "Loading..."
            : reviewAnswerState.isSaving
            ? "Saving..."
            : isTraining
            ? "Building..."
            : ""
        }
      />
      <ErrorDialog
        error={reviewAnswerState.error || trainError || mentorError}
        clearError={() => {
          clearTrainingError();
          clearMentorError();
          reviewAnswerState.clearError();
        }}
      />
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
