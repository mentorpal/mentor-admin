/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import Carousel from "react-material-ui-carousel";
import { Avatar, IconButton } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import ArrowForwardIcon from "@material-ui/icons/ArrowForward";
import FiberManualRecordIcon from "@material-ui/icons/FiberManualRecord";

import { User } from "types";
import NavBar from "components/nav-bar";
import { ErrorDialog, LoadingDialog } from "components/dialog";
import { WelcomeSlide } from "components/setup/welcome-slide";
import { MentorInfoSlide } from "components/setup/mentor-info-slide";
import { MentorTypeSlide } from "components/setup/mentor-type-slide";
import { IntroductionSlide } from "components/setup/introduction-slide";
import { SelectSubjectsSlide } from "components/setup/select-subjects-slide";
import { IdleTipsSlide } from "components/setup/idle-tips-slide";
import { RecordSubjectSlide } from "components/setup/record-subject-slide";
import { FinalSetupSlide } from "components/setup/final-setup-slide";
import withAuthorizationOnly from "hooks/wrap-with-authorization-only";
import { SetupStepType, useWithSetup } from "hooks/graphql/use-with-setup";
import withLocation from "wrap-with-location";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#eee",
    overflow: "visible",
  },
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
  },
  column: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "100%",
  },
  carousel: {
    display: "flex",
    flexDirection: "column",
    justifyItems: "center",
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
    height: "100%",
    width: "fit-content",
    overflow: "visible",
  },
  card: {
    minHeight: 450,
    maxWidth: "85%",
    padding: 10,
  },
  title: {
    fontWeight: "bold",
    margin: 15,
  },
  text: {
    marginBottom: 15,
  },
  inputField: {
    width: "100%",
    margin: 10,
  },
  button: {
    width: 100,
    margin: 5,
  },
  navButton: {
    top: "calc(50% - 20px) !important",
    width: 100,
    height: 100,
  },
  avatar: {
    width: "50px",
    height: "50px",
  },
  arrow: {
    width: "40px",
    height: "40px",
  },
  progress: {
    position: "fixed",
    top: "50%",
    left: "50%",
  },
}));

function SetupPage(props: { user: User; search: { i?: string } }): JSX.Element {
  const classes = useStyles();
  const {
    setupStatus: status,
    setupStep: idx,
    setupSteps: steps,
    docSetupUrl,
    idleTipsVideoUrl,
    mentor,
    isLoading,
    isSaving,
    readyToDisplay,
    error,
    editMentor,
    toStep,
  } = useWithSetup(props.search);
  if (!readyToDisplay) {
    return (
      <div className={classes.root}>
        <LoadingDialog title="Loading..." />
        <NavBar title="Mentor Setup" mentorId={mentor?._id} />
      </div>
    );
  }
  function renderSlide(idx: number): JSX.Element {
    if (!mentor || !status || idx >= steps.length || idx < 0) {
      return <div />;
    }
    const step = steps[idx];
    switch (step.type) {
      case SetupStepType.WELCOME:
        return (
          <WelcomeSlide
            key="welcome"
            classes={classes}
            userName={props.user.name}
            docSetupUrl={docSetupUrl}
          />
        );
      case SetupStepType.MENTOR_INFO:
        return (
          <MentorInfoSlide
            key="mentor-info"
            classes={classes}
            mentor={mentor}
            isMentorLoading={isLoading || isSaving}
            editMentor={editMentor}
          />
        );
      case SetupStepType.MENTOR_TYPE:
        return (
          <MentorTypeSlide
            key="chat-type"
            classes={classes}
            mentor={mentor}
            isMentorLoading={isLoading || isSaving}
            editMentor={editMentor}
          />
        );
      case SetupStepType.INTRODUCTION:
        return <IntroductionSlide key="introduction" classes={classes} />;
      case SetupStepType.SELECT_SUBJECTS:
        return <SelectSubjectsSlide classes={classes} i={idx} />;
      case SetupStepType.IDLE_TIPS:
        return (
          <IdleTipsSlide
            classes={classes}
            idleTipsVideoUrl={idleTipsVideoUrl}
          />
        );
      case SetupStepType.REQUIRED_SUBJECT:
        return (
          <RecordSubjectSlide
            key={`${
              status.requiredSubjects[steps.length - idx - 2].subject._id
            }`}
            classes={classes}
            subject={status.requiredSubjects[steps.length - idx - 2].subject}
            questions={status.requiredSubjects[steps.length - idx - 2].answers}
            i={idx}
            customTitle="Idle and Initial Recordings"
          />
        );
      case SetupStepType.FINISH_SETUP:
        return (
          <FinalSetupSlide
            key={"FinalSetupSlide"}
            classes={classes}
            mentor={mentor}
            setupStatus={status}
          />
        );
      default:
        return <div />;
    }
  }

  if (!readyToDisplay) {
    return (
      <div className={classes.root}>
        <LoadingDialog title="Loading..." />
        <NavBar title="Mentor Setup" mentorId={mentor?._id} />
      </div>
    );
  }
  return (
    <div className={classes.root}>
      <NavBar title="Mentor Setup" mentorId={mentor?._id} />
      <Carousel
        animation="slide"
        index={idx}
        autoPlay={false}
        navButtonsAlwaysVisible={true}
        className={classes.carousel}
        timeout={{
          appear: 300,
          enter: 300,
          exit: 100,
        }}
        onChange={(idx: number) => toStep(idx)}
        NavButton={({ onClick, style, next, prev }) => {
          if (idx == 0) {
            return (
              <IconButton
                data-cy={next ? "next-btn" : "back-btn"}
                onClick={() => onClick()}
                style={{
                  display: prev ? "none" : "block",
                  right: next ? "-35px" : "",
                }}
                size="medium"
                className={classes.navButton}
              >
                <Avatar
                  data-cy="nav-btn-avatar"
                  className={classes.avatar}
                  style={{
                    backgroundColor: steps[idx]?.complete ? "green" : "red",
                    padding: "10px",
                  }}
                >
                  {next && (
                    <ArrowForwardIcon className={classes.arrow} style={style} />
                  )}
                </Avatar>
              </IconButton>
            );
          }
          if (idx == steps.length - 1) {
            return (
              <IconButton
                data-cy={next ? "next-btn" : "back-btn"}
                style={{
                  display: next ? "none" : "block",
                  left: prev ? "-35px" : "",
                }}
                onClick={() => onClick()}
                className={classes.navButton}
              >
                <Avatar
                  data-cy="nav-btn-avatar"
                  className={classes.avatar}
                  style={{ padding: "10px" }}
                >
                  {prev && (
                    <ArrowBackIcon className={classes.arrow} style={style} />
                  )}
                </Avatar>
              </IconButton>
            );
          }
          return (
            <IconButton
              data-cy={next ? "next-btn" : "back-btn"}
              onClick={() => onClick()}
              style={{
                position: "relative",
                right: next ? "-35px" : "",
                left: prev ? "-35px" : "",
              }}
              className={classes.navButton}
            >
              <Avatar
                data-cy="nav-btn-avatar"
                className={classes.avatar}
                style={{
                  backgroundColor: next
                    ? steps[idx]?.complete
                      ? "green"
                      : "red"
                    : prev
                    ? "rgb(189, 189, 189)"
                    : "block",
                  padding: "10px",
                }}
              >
                {next && (
                  <ArrowForwardIcon className={classes.arrow} style={style} />
                )}
                {prev && (
                  <ArrowBackIcon className={classes.arrow} style={style} />
                )}
              </Avatar>
            </IconButton>
          );
        }}
        IndicatorIcon={
          <FiberManualRecordIcon data-cy="radio" fontSize="small" />
        }
        activeIndicatorIconButtonProps={{
          className: "",
          style: {
            color: steps[idx]?.complete ? "green" : "red",
          },
        }}
      >
        {steps.map((s, i) => (
          <div
            data-cy="slide"
            key={`slide-${i}`}
            style={{
              display: "flex",
              justifyItems: "center",
              justifyContent: "center",
              alignItems: "center",
              alignContent: "center",
            }}
          >
            {renderSlide(idx)}
          </div>
        ))}
      </Carousel>
      <LoadingDialog
        title={isLoading ? "Loading..." : isSaving ? "Saving..." : ""}
      />
      <ErrorDialog error={error} />
    </div>
  );
}

export default withAuthorizationOnly(withLocation(SetupPage));
