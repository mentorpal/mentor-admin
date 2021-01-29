/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { navigate } from "gatsby";
import React, { useContext, useState } from "react";
import { useCookies } from "react-cookie";
import { Button, CircularProgress, Radio } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { fetchMentor, fetchSubjects } from "api";
import { Mentor, Subject, Status, Edge } from "types";
import Context from "context";
import NavBar from "components/nav-bar";
import withLocation from "wrap-with-location";
import {
  Slide,
  SlideType,
  WelcomeSlide,
  MentorSlide,
  IntroductionSlide,
  IdleSlide,
  RecordSlide,
  BuildMentorSlide,
  BuildErrorSlide,
  QuestionSetSlide,
} from "components/setup-slides";

const useStyles = makeStyles((theme) => ({
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
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginLeft: 25,
    marginRight: 25,
    padding: 25,
    flexGrow: 1,
  },
  column: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "100%",
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

function SetupPage(props: { search: { i?: string } }): JSX.Element {
  const classes = useStyles();
  const context = useContext(Context);
  const [cookies] = useCookies(["accessToken"]);
  const [mentor, setMentor] = useState<Mentor>();
  const [slides, setSlides] = useState<SlideType[]>([]);
  const [idx, setIdx] = useState(props.search.i ? parseInt(props.search.i) : 0);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  React.useEffect(() => {
    if (!cookies.accessToken) {
      navigate("/login");
    }
  }, [cookies]);

  React.useEffect(() => {
    loadSubjects();
    loadMentor();
  }, [context.user]);

  async function loadSubjects() {
    const subjects = await fetchSubjects(cookies.accessToken, {
      sortBy: "name",
      sortAscending: true,
    });
    setSubjects(subjects.edges.map((e: Edge<Subject>) => e.node));
  }

  async function loadMentor() {
    if (!context.user) {
      return;
    }
    setMentor(await fetchMentor(cookies.accessToken));
  }

  React.useEffect(() => {
    if (!mentor) {
      return;
    }
    const mentorFilled =
      mentor.name !== "" && mentor.firstName !== "" && mentor.title !== "";
    // TODO: replace with checking isRequired subjects instead of checking hard-coded subject names
    let idleRecorded = true;
    let backgroundRecorded = true;
    let utteranceRecorded = true;
    mentor.questions.forEach((q) => {
      if (q.subject?.name === "Background" && q.status !== Status.COMPLETE) {
        backgroundRecorded = false;
      }
      if (q.subject?.name === "Repeat After Me") {
        if (q.status !== Status.COMPLETE) {
          utteranceRecorded = false;
        }
      }
    });
    const isBuildReady =
      mentorFilled && idleRecorded && backgroundRecorded && utteranceRecorded;

    const _slides = [];
    _slides.push(Slide(true, <WelcomeSlide key="welcome" classes={classes} />));
    _slides.push(
      Slide(
        mentorFilled,
        <MentorSlide
          key="mentor-info"
          classes={classes}
          mentor={mentor}
          onUpdated={loadMentor}
        />
      )
    );
    _slides.push(
      Slide(true, <IntroductionSlide key="introduction" classes={classes} />)
    );
    // TODO: we removed topics, so need another way of finding idle video
    _slides.push(
      Slide(
        idleRecorded,
        <IdleSlide key="idle" classes={classes} mentor={mentor} />
      )
    );
    // TODO: replace with checking isRequired subjects instead of checking hard-coded subject names
    const bgSubject = mentor.subjects.find((s) => s.name === "Background");
    _slides.push(
      Slide(
        backgroundRecorded,
        <RecordSlide
          key="background"
          classes={classes}
          mentor={mentor}
          subject={bgSubject!}
          i={_slides.length}
        />
      )
    );
    // TODO: replace with checking isRequired subjects instead of checking hard-coded subject names
    const utSubject = mentor.subjects.find((s) => s.name === "Repeat After Me");
    _slides.push(
      Slide(
        utteranceRecorded,
        <RecordSlide
          key="utterances"
          classes={classes}
          mentor={mentor}
          subject={utSubject!}
          i={_slides.length}
        />
      )
    );
    _slides.push(
      Slide(
        mentor.isBuilt,
        isBuildReady ? (
          <BuildMentorSlide
            key="build"
            classes={classes}
            mentor={mentor}
            onUpdated={loadMentor}
          />
        ) : (
          <BuildErrorSlide key="build-error" classes={classes} />
        )
      )
    );
    if (mentor.isBuilt) {
      _slides.push(
        Slide(
          true,
          <QuestionSetSlide
            classes={classes}
            mentor={mentor}
            subjects={subjects}
            onUpdated={loadMentor}
          />
        )
      );
    }
    setSlides(_slides);
  }, [mentor, subjects]);

  if (!mentor) {
    return (
      <div>
        <NavBar title="Mentor Setup" />
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <NavBar title="Mentor Setup" />
      {idx >= slides.length ? "Invalid slide" : slides[idx].element}
      <div className={classes.row} style={{ height: 150 }}>
        {idx > 0 ? (
          <Button
            id="back-btn"
            className={classes.button}
            variant="contained"
            onClick={() => {
              setIdx(idx - 1);
            }}
          >
            Back
          </Button>
        ) : undefined}
        {idx > 1 ? (
          <Button
            id="done-btn"
            className={classes.button}
            variant="contained"
            color="secondary"
            onClick={() => {
              navigate("/");
            }}
          >
            Done
          </Button>
        ) : undefined}
        {idx !== slides.length - 1 ? (
          <Button
            id="next-btn"
            className={classes.button}
            variant="contained"
            color="primary"
            onClick={() => {
              setIdx(idx + 1);
            }}
          >
            Next
          </Button>
        ) : undefined}
      </div>
      <div className={classes.row}>
        {slides.map((s, i) => (
          <Radio
            id={`radio-${i}`}
            key={i}
            checked={i === idx}
            onClick={() => setIdx(i)}
            color={s.status ? "primary" : "default"}
            style={{ color: s.status ? "" : "red" }}
          />
        ))}
      </div>
    </div>
  );
}

export default withLocation(SetupPage);
