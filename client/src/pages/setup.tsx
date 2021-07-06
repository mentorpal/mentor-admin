/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import Carousel from "react-material-ui-carousel";
import { IconButton } from "@material-ui/core";
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
import { RecordIdleSlide } from "components/setup/record-idle-slide";
import { RecordSubjectSlide } from "components/setup/record-subject-slide";
import { BuildMentorSlide } from "components/setup/build-mentor-slide";
import withAuthorizationOnly from "hooks/wrap-with-authorization-only";
import { SetupStepType, useWithSetup } from "hooks/graphql/use-with-setup";
import withLocation from "wrap-with-location";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: "#eee",
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
    width: "100%",
  },
  card: {
    minHeight: 450,
    padding: 25,
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
}));

function SetupPage(props: {
  user: User;
  accessToken: string;
  search: { i?: string };
}): JSX.Element {
  const classes = useStyles();
  const {
    setupStatus: status,
    setupStep: idx,
    setupSteps: steps,
    mentor,
    isLoading,
    isSaving,
    isTraining,
    error,
    editMentor,
    startTraining,
    nextStep,
    prevStep,
    toStep,
    clearError,
  } = useWithSetup(props.accessToken, props.search);

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
      case SetupStepType.IDLE:
        return (
          <RecordIdleSlide
            key="idle"
            classes={classes}
            idle={status.idle!.idle}
            i={idx}
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
          />
        );
      case SetupStepType.BUILD:
        return (
          <BuildMentorSlide
            key="build"
            classes={classes}
            mentor={mentor}
            isBuildable={status.isBuildable}
            isBuilt={status.isSetupComplete}
            startTraining={startTraining}
          />
        );
      default:
        return <div />;
    }
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
        next={() => nextStep()}
        prev={() => prevStep()}
        NavButton={({ onClick, className, style, next, prev }) => {
          return (
            // @ts-ignore
            <IconButton
              data-cy={next ? "next-btn" : "back-btn"}
              onClick={onClick}
              className={className}
              style={style}
            >
              {next && <ArrowForwardIcon />}
              {prev && <ArrowBackIcon />}
            </IconButton>
          );
        }}
        onChange={(idx: number) => toStep(idx)}
        IndicatorIcon={<FiberManualRecordIcon data-cy="radio" />}
        activeIndicatorIconButtonProps={{
          className: "",
          style: {
            color: steps[idx]?.complete ? "green" : "red",
          },
        }}
      >
        {steps.map((s, i) => (
          <div data-cy="slide" key={`slide-${i}`}>
            {renderSlide(idx)}
          </div>
        ))}
      </Carousel>
      <LoadingDialog
        title={
          isLoading
            ? "Loading..."
            : isSaving
            ? "Saving..."
            : isTraining
            ? "Building your mentor..."
            : ""
        }
      />
      <ErrorDialog error={error} clearError={clearError} />
    </div>
  );
}

export default withAuthorizationOnly(withLocation(SetupPage));
