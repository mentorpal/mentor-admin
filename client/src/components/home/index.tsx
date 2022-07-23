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
  IconButton,
  List,
  ListItem,
  MenuItem,
  Select,
  Toolbar,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
import { NotificationDialog } from "components/dialog";
import { LoadingDialog, ErrorDialog, TwoOptionDialog } from "components/dialog";
import MyMentorCard from "components/my-mentor-card";
import parseMentor, {
  defaultMentorInfo,
} from "components/my-mentor-card/mentor-info";
import NavBar from "components/nav-bar";
import { launchMentor } from "helpers";
import {
  QuestionEdits,
  useWithReviewAnswerState,
} from "hooks/graphql/use-with-review-answer-state";
import { useWithSetup } from "hooks/graphql/use-with-setup";
import { useWithTraining } from "hooks/task/use-with-train";
import withAuthorizationOnly from "hooks/wrap-with-authorization-only";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import { useMentorEdits } from "store/slices/mentor/useMentorEdits";
import { User, Subject, UserRole, Status } from "types";
import withLocation from "wrap-with-location";
import RecordingBlockItem from "./recording-block";
import { useWithRecordState } from "hooks/graphql/use-with-record-state";
import UploadingWidget from "components/record/uploading-widget";
import { useWithLogin } from "store/slices/login/useWithLogin";

const ColorTooltip = withStyles({
  tooltip: {
    backgroundColor: "secondary",
  },
})(Tooltip);

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

//order of the tooltips
export enum TooltipStep {
  PROFILE = 0,
  STATUS = 1,
  CATEGORIES = 2,
  RECOMMENDER = 3,
  BUILD = 4,
  PREVIEW = 5,
}

interface ConfirmSave {
  message: string;
  callback: () => void;
}

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
  const {
    getData,
    clearMentorError,
    switchActiveMentor,
    isLoading: mentorLoading,
    error: mentorError,
  } = useActiveMentor();

  const { setupStatus, navigateToMissingSetup } = useWithSetup();
  const mentorId = getData((m) => m.data?._id || "");
  const mentorType = getData((m) => m.data?.mentorType);
  const defaultMentor = props.user.defaultMentor._id;
  const classes = useStyles();
  const [showSetupAlert, setShowSetupAlert] = useState(true);

  const [idxTooltip, setIdxTooltip] = useState<number>(0);
  const [recordingItemBlocks, setRecordingItemBlocks] = useState<JSX.Element[]>(
    []
  );

  const mentorSubjectNamesById: Record<string, string> = getData((m) =>
    (m.data?.subjects || []).reduce(
      (acc: Record<string, string>, cur: Subject) => {
        acc[cur._id] = cur.name;
        return acc;
      },
      {}
    )
  );
  const mentorInfo = getData((ms) =>
    ms.data ? parseMentor(ms.data) : defaultMentorInfo
  );
  const recordState = useWithRecordState(props.accessToken, props.search);

  const [recordSubjectTooltipOpen, setRecordSubjectTooltipOpen] =
    useState<boolean>(false);
  const [profileTooltipOpen, setProfileTooltipOpen] = useState<boolean>(false);
  const [statusTooltipOpen, setStatusTooltipOpen] = useState<boolean>(false);
  const [buildTooltipOpen, setBuildTooltipOpen] = useState<boolean>(false);
  const [previewTooltipOpen, setPreviewTooltipOpen] = useState<boolean>(false);
  const [uploadingWidgetVisible, setUploadingWidgetVisible] = useState(false);
  const [confirmSaveBeforeCallback, setConfirmSaveBeforeCallback] =
    useState<ConfirmSave>();
  const [confirmSaveOnRecordOne, setConfirmSaveOnRecordOne] =
    useState<ConfirmSave>();

  const [localHasSeenSplash, setLocalHasSeenSplash] = useState(false);
  const [localHasSeenTooltips, setLocalHasSeenTooltips] = useState(false);

  const loginState = useWithLogin();
  const hasSeenSplash = Boolean(
    loginState.state.user?.firstTimeTracking.myMentorSplash ||
      localHasSeenSplash
  );
  const { userSawSplashScreen, userSawTooltips } = loginState;
  const hasSeenTooltips = Boolean(
    !hasSeenSplash ||
      loginState.state.user?.firstTimeTracking.tooltips ||
      localHasSeenTooltips
  );

  useEffect(() => {
    const blocks = reviewAnswerState.getBlocks().map((b, i) => (
      <ListItem key={b.name + String(i)} data-cy={`block-${i}`}>
        <RecordingBlockItem
          mentorId={mentorId || ""}
          mentorType={mentorType}
          classes={classes}
          block={b}
          getAnswers={reviewAnswerState.getAnswers}
          getQuestions={reviewAnswerState.getQuestions}
          recordAnswers={recordAnswers}
          recordAnswer={recordAnswer}
          addNewQuestion={reviewAnswerState.addNewQuestion}
          editQuestion={reviewAnswerState.editQuestion}
        />
      </ListItem>
    ));
    setRecordingItemBlocks(blocks);
  }, [reviewAnswerState.getBlocks()]);

  useEffect(() => {
    if (!setupStatus || !showSetupAlert) {
      return;
    }
    setShowSetupAlert(!setupStatus.isSetupComplete);
  }, [setupStatus]);

  if (!(mentorId && setupStatus)) {
    return (
      <div>
        <NavBar title="Mentor Studio" mentorId="" />
        <CircularProgress />
      </div>
    );
  }
  if (!setupStatus.isMentorInfoDone) {
    navigate("/setup");
  }

  function onLeave(cb: () => void, msg?: string) {
    if (reviewAnswerState.unsavedChanges()) {
      setConfirmSaveBeforeCallback({
        message:
          msg ||
          "You have unsaved changes, would you like to save them before leaving this page?",
        callback: cb,
      });
    } else {
      cb();
    }
  }

  async function saveBeforeCallback() {
    if (!confirmSaveBeforeCallback) {
      return;
    }
    if (reviewAnswerState.unsavedChanges()) {
      await reviewAnswerState.saveChanges();
    }
    confirmSaveBeforeCallback.callback();
    setConfirmSaveBeforeCallback(undefined);
  }

  function recordAnswers(status: Status, subject: string, category: string) {
    onLeave(() => {
      reviewAnswerState.recordAnswers(status, subject, category);
    }, "You have unsaved changes to questions. Would you like to save your changes before proceeding?");
  }

  function recordAnswer(question: QuestionEdits) {
    if (reviewAnswerState.unsavedChanges() || question.unsavedChanges) {
      setConfirmSaveOnRecordOne({
        message:
          "You have unsaved question changes, would you like to save your changes and proceed to recording?",
        callback: () =>
          reviewAnswerState.saveChanges()?.then(() => {
            reviewAnswerState.recordAnswer(question.originalQuestion.clientId);
          }),
      });
    } else {
      reviewAnswerState.recordAnswer(
        question.originalQuestion.clientId || question.originalQuestion._id
      );
    }
  }

  function incrementTooltip() {
    setIdxTooltip(idxTooltip + 1);
  }

  function closeDialog() {
    setLocalHasSeenSplash(true);
    userSawSplashScreen(props.accessToken);
  }

  function closePreviewTooltip() {
    incrementTooltip();
    setLocalHasSeenTooltips(true);
    userSawTooltips(props.accessToken);
  }

  return (
    <div data-cy="my-mentor-wrapper" className={classes.root}>
      <UploadingWidget
        visible={uploadingWidgetVisible}
        setUploadWidgetVisible={setUploadingWidgetVisible}
        onRecordPage={false}
        recordState={recordState}
      />
      <div>
        <NavBar
          title={
            mentorId === defaultMentor
              ? "My Mentor"
              : `${mentorInfo.name}'s Mentor`
          }
          mentorId={mentorId}
          userRole={props.user.userRole}
          uploads={recordState.uploads}
          uploadsButtonVisible={uploadingWidgetVisible}
          toggleUploadsButtonVisibility={setUploadingWidgetVisible}
          onNav={onLeave}
        />
        <MyMentorCard
          continueAction={() => startTraining(mentorId)}
          useMentor={useMentor}
          incrementTooltip={incrementTooltip}
          idxTooltip={idxTooltip}
          hasSeenTooltips={hasSeenTooltips}
          localHasSeenTooltips={localHasSeenTooltips}
          profileTooltipOpen={profileTooltipOpen}
          setProfileTooltipOpen={setProfileTooltipOpen}
          statusTooltipOpen={statusTooltipOpen}
          setStatusTooltipOpen={setStatusTooltipOpen}
        />
        {props.user.userRole === UserRole.ADMIN && (
          <Fab
            data-cy="default-mentor-button"
            variant="extended"
            color="primary"
            disabled={mentorId === defaultMentor}
            onClick={() => switchActiveMentor()}
            className={classes.fab}
          >
            Default Mentor
          </Fab>
        )}

        <ColorTooltip
          interactive={true}
          open={
            !hasSeenTooltips
              ? idxTooltip == TooltipStep.CATEGORIES
              : recordSubjectTooltipOpen
          }
          onClose={incrementTooltip}
          //if this is false then the tooltip doesn't respond to focus-visible elements
          disableHoverListener={!hasSeenTooltips}
          arrow
          placement="left"
          enterDelay={1500}
          //contains all text inside tooltip
          title={
            <React.Fragment>
              <IconButton
                data-cy="categories-tooltip-close-btn"
                color="inherit"
                size="small"
                text-align="right"
                align-content="right"
                onClick={incrementTooltip}
              >
                <CloseIcon />
              </IconButton>
              <Typography
                color="inherit"
                align="center"
                data-cy="categories-tooltip-title"
              >
                Recording Subjects
              </Typography>
              <p style={{ textAlign: "center" }}>
                The Subjects dropdown lets you review and add Subjects.
                Categories in a Subject help you record similar questions. You
                can add your own custom questions to a category.
              </p>
            </React.Fragment>
          }
          PopperProps={{
            style: { maxWidth: 300, textAlign: "right" },
          }}
        >
          <Select
            data-cy="select-subject"
            value={
              reviewAnswerState.selectedSubject
                ? mentorSubjectNamesById[reviewAnswerState.selectedSubject]
                : undefined
            }
            displayEmpty
            onMouseEnter={() => {
              hasSeenTooltips && setRecordSubjectTooltipOpen(true);
            }}
            onMouseLeave={() => {
              hasSeenTooltips && setRecordSubjectTooltipOpen(false);
            }}
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
        </ColorTooltip>
      </div>
      <List
        data-cy="recording-blocks"
        style={{
          flex: "auto",
          backgroundColor: "#eee",
        }}
      >
        {recordingItemBlocks}
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
          <div className="training-stage-info">
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

            <ColorTooltip
              data-cy="build-tooltip"
              interactive={true}
              open={
                !hasSeenTooltips
                  ? idxTooltip == TooltipStep.BUILD
                  : buildTooltipOpen
              }
              onClose={incrementTooltip}
              disableHoverListener={!hasSeenTooltips}
              enterDelay={1500}
              arrow
              title={
                <React.Fragment>
                  <IconButton
                    data-cy="build-tooltip-close-btn"
                    color="inherit"
                    size="small"
                    text-align="right"
                    align-content="right"
                    onClick={incrementTooltip}
                  >
                    <CloseIcon />
                  </IconButton>
                  <Typography
                    color="inherit"
                    align="center"
                    data-cy="build-tooltip-title"
                  >
                    Build
                  </Typography>
                  <p style={{ textAlign: "center" }}>
                    Build every time you change an answer so it is correct and
                    build after you add a batch of questions.
                  </p>
                </React.Fragment>
              }
              PopperProps={{
                style: { maxWidth: 250, textAlign: "right" },
              }}
            >
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
                onClick={() => startTraining(mentorId)}
                className={classes.fab}
                onMouseEnter={() => {
                  hasSeenTooltips && setBuildTooltipOpen(true);
                }}
                onMouseLeave={() => {
                  hasSeenTooltips && setBuildTooltipOpen(false);
                }}
              >
                Build Mentor
              </Fab>
            </ColorTooltip>

            <ColorTooltip
              data-cy="preview-tooltip"
              interactive={true}
              open={
                hasSeenTooltips
                  ? previewTooltipOpen
                  : idxTooltip == TooltipStep.PREVIEW
              }
              onClose={closePreviewTooltip}
              enterDelay={1500}
              disableHoverListener
              arrow
              title={
                <React.Fragment>
                  <IconButton
                    data-cy="preview-tooltip-close-btn"
                    color="inherit"
                    size="small"
                    text-align="right"
                    align-content="right"
                    onClick={closePreviewTooltip}
                  >
                    <CloseIcon />
                  </IconButton>
                  <Typography
                    color="inherit"
                    align="center"
                    data-cy="preview-tooltip-title"
                  >
                    Preview
                  </Typography>
                  <p style={{ textAlign: "center" }}>
                    Preview the mentor to ask it questions and see how it
                    responds. You can improve it later using the User Feedback,
                    in the upper-left menu.
                  </p>
                </React.Fragment>
              }
              PopperProps={{
                style: { maxWidth: 250, textAlign: "right" },
              }}
            >
              <Fab
                data-cy="preview-button"
                variant="extended"
                color="secondary"
                onClick={() => launchMentor(mentorId, true)}
                className={classes.fab}
                onMouseEnter={() => {
                  hasSeenTooltips && setPreviewTooltipOpen(true);
                }}
                onMouseLeave={() => {
                  hasSeenTooltips && setPreviewTooltipOpen(false);
                }}
              >
                Preview Mentor
              </Fab>
            </ColorTooltip>
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
      <NotificationDialog
        title={
          "The My Mentor page is your home page to create your mentor. It summarizes what you have recorded so far, and recommends next-steps to improve your mentor. At the start, you will mostly Record Questions and Build your mentor to try it out. However, as learners ask your mentor questions, you will review User Feedback to select or record better answers to new questions people ask."
        }
        open={!hasSeenSplash}
        closeDialog={() => closeDialog()}
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

      <TwoOptionDialog
        open={Boolean(confirmSaveBeforeCallback)}
        title={confirmSaveBeforeCallback?.message || ""}
        option1={{ display: "Yes", onClick: () => saveBeforeCallback() }}
        option2={{
          display: "No",
          onClick: () => {
            confirmSaveBeforeCallback?.callback();
            setConfirmSaveBeforeCallback(undefined);
          },
        }}
      />

      <TwoOptionDialog
        open={Boolean(confirmSaveOnRecordOne)}
        title={confirmSaveOnRecordOne?.message || ""}
        option1={{
          display: "Yes",
          onClick: () => confirmSaveOnRecordOne?.callback(),
        }}
        option2={{
          display: "No",
          onClick: () => setConfirmSaveOnRecordOne(undefined),
        }}
      />
    </div>
  );
}

export default withAuthorizationOnly(withLocation(HomePage));
