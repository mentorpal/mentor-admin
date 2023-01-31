/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState } from "react";
import Carousel from "react-material-ui-carousel";
import { Avatar, IconButton } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

import { User } from "types";
import NavBar from "components/nav-bar";
import { ErrorDialog, LoadingDialog } from "components/dialog";
import { WelcomeSlide } from "components/setup/welcome-slide";
import { MentorInfoSlide } from "components/setup/mentor-info-slide";
import { MentorTypeSlide } from "components/setup/mentor-type-slide";
import { MentorPrivacySlide } from "components/setup/mentor-privacy-slide";
import { MentorGoalSlide } from "components/setup/mentor-goal-slide";
import { IntroductionSlide } from "components/setup/introduction-slide";
import { SelectKeywordsSlide } from "components/setup/select-keywords-slide";
import { SelectSubjectsSlide } from "components/setup/select-subjects-slide";
import { IdleTipsSlide } from "components/setup/idle-tips-slide";
import { RecordSubjectSlide } from "components/setup/record-subject-slide";
import { FinalSetupSlide } from "components/setup/final-setup-slide";
import withAuthorizationOnly from "hooks/wrap-with-authorization-only";
import { SetupStepType, useWithSetup } from "hooks/graphql/use-with-setup";
import withLocation from "wrap-with-location";
import { useWithConfig } from "store/slices/config/useWithConfig";
import { useWithKeywords } from "hooks/graphql/use-with-keywords";
import { useWithOrganizations } from "hooks/graphql/use-with-organizations";

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
    width: "100%",
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

function SetupPage(props: {
  accessToken: string;
  user: User;
  search: { i?: string };
}): JSX.Element {
  const classes = useStyles();
  const {
    setupStatus: status,
    initialSetupStep,
    curSetupStep,
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
    virtualBackgroundUrls,
    defaultVirtualBackground,
    onLeave,
  } = useWithSetup(props.search);
  const accessToken = props.accessToken;
  const { data: keywords } = useWithKeywords();
  const { state: configState } = useWithConfig();
  const { data: orgs } = useWithOrganizations(accessToken);
  const uploadLambdaEndpoint = configState.config?.uploadLambdaEndpoint || "";
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  if (!readyToDisplay && !initialLoadComplete) {
    return (
      <div className={classes.root}>
        <LoadingDialog title="Loading..." />
        <NavBar title="Mentor Setup" mentorId={mentor?._id} />
      </div>
    );
  } else {
    !initialLoadComplete && setInitialLoadComplete(true);
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
            userName={props.user.name}
          />
        );
      case SetupStepType.MENTOR_TYPE:
        return (
          <MentorTypeSlide
            key="chat-type"
            classes={classes}
            mentor={mentor}
            virtualBackgroundUrls={virtualBackgroundUrls}
            defaultVirtualBackground={defaultVirtualBackground}
            editMentor={editMentor}
            accessToken={accessToken}
            uploadLambdaEndpoint={uploadLambdaEndpoint}
          />
        );
      case SetupStepType.MENTOR_PRIVACY:
        return (
          <MentorPrivacySlide
            key="mentor-privacy"
            classes={classes}
            mentor={mentor}
            orgs={orgs?.edges.map((e) => e.node) || []}
            editMentor={editMentor}
          />
        );
      case SetupStepType.MENTOR_GOAL:
        return (
          <MentorGoalSlide
            key="mentor-goal"
            classes={classes}
            mentor={mentor}
            editMentor={editMentor}
          />
        );
      case SetupStepType.SELECT_KEYWORDS:
        return (
          <SelectKeywordsSlide
            key="select-keywords"
            classes={classes}
            mentor={mentor}
            keywords={keywords?.edges.map((e) => e.node) || []}
            editMentor={editMentor}
          />
        );
      case SetupStepType.SELECT_SUBJECTS:
        return <SelectSubjectsSlide classes={classes} i={idx} />;
      case SetupStepType.INTRODUCTION:
        return <IntroductionSlide key="introduction" classes={classes} />;
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
            mentorType={mentor.mentorType}
            subject={status.requiredSubjects[steps.length - idx - 2].subject}
            answers={status.requiredSubjects[steps.length - idx - 2].answers}
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
          />
        );
      default:
        return <div />;
    }
  }

  return (
    <div className={classes.root}>
      <NavBar onNav={onLeave} title="Mentor Setup" mentorId={mentor?._id} />
      <Carousel
        // key={steps.length} // ensure carousel re-renders if # steps change
        animation="slide"
        index={initialSetupStep}
        autoPlay={false}
        swipe={false}
        navButtonsAlwaysVisible={true}
        changeOnFirstRender={false}
        className={classes.carousel}
        duration={300}
        onChange={(now: number | undefined) => {
          if (now !== undefined) {
            toStep(now);
          }
        }}
        NavButton={({ onClick, style, next, prev }) => {
          if (curSetupStep == 0) {
            return (
              <IconButton
                data-cy={next ? "next-btn" : "back-btn"}
                onClick={() => onClick()}
                style={{
                  display: prev ? "none" : "block",
                }}
                size="medium"
                className={classes.navButton}
              >
                <Avatar
                  data-cy="nav-btn-avatar"
                  className={classes.avatar}
                  style={{
                    backgroundColor: steps[curSetupStep]?.complete
                      ? "green"
                      : "red",
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
          if (curSetupStep == steps.length - 1) {
            return (
              <IconButton
                data-cy={next ? "next-btn" : "back-btn"}
                style={{
                  display: next ? "none" : "block",
                }}
                onClick={() => onClick()}
                className={classes.navButton}
                size="medium"
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
                display: "block",
              }}
              className={classes.navButton}
              size="medium"
            >
              <Avatar
                data-cy="nav-btn-avatar"
                className={classes.avatar}
                style={{
                  backgroundColor: next
                    ? steps[curSetupStep]?.complete
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
            color: steps[curSetupStep]?.complete ? "green" : "red",
          },
        }}
      >
        {steps.map((s, i) => (
          <div
            data-cy={`slide-${i}`}
            key={`slide-${i}`}
            style={{
              display: "flex",
              justifyItems: "center",
              justifyContent: "center",
              alignItems: "center",
              alignContent: "center",
            }}
          >
            {renderSlide(i)}
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
