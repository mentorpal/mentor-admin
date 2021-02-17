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
import { addQuestionSet, fetchMentor, fetchSubjects } from "api";
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
  RecordQuestionSlide,
  RecordSubjectSlide,
  BuildMentorSlide,
  BuildErrorSlide,
  AddQuestionSetSlide,
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
    const load = async () => {
      if (!context.user) {
        return;
      }
      const s = await fetchSubjects({
        sortBy: "name",
        sortAscending: true,
      });
      const subjects = s.edges.map((e: Edge<Subject>) => e.node);
      let mentor = await fetchMentor(cookies.accessToken);
      for (const subject of subjects) {
        if (
          subject.isRequired &&
          !mentor.subjects.find((s) => s._id === subject._id)
        ) {
          await addQuestionSet(mentor._id, subject._id, cookies.accessToken);
          mentor = await fetchMentor(cookies.accessToken);
        }
      }
      setSubjects(subjects);
      setMentor(mentor);
    };
    load();
  }, [context.user]);

  React.useEffect(() => {
    if (!mentor) {
      return;
    }
    const _slides = [];
    _slides.push(Slide(true, <WelcomeSlide key="welcome" classes={classes} />));

    const mentorFilled = Boolean(
      mentor.name && mentor.firstName && mentor.title
    );
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
    const idle = mentor.answers.find((a) => a.question.name === "Idle");
    const idleRecorded = idle === undefined || idle.status === Status.COMPLETE;
    if (idle) {
      _slides.push(
        Slide(
          idleRecorded,
          <RecordQuestionSlide
            key="idle"
            classes={classes}
            isRecorded={idleRecorded}
            id={idle.question._id}
            name={"Idle"}
            description={"Let's record a short idle calibration video."}
            i={_slides.length}
          />
        )
      );
    }

    let requiredSubjectsRecorded = true;
    mentor.subjects.forEach((s) => {
      if (s.isRequired) {
        const questions = mentor.answers.filter((a) =>
          s.questions.map((q) => q._id).includes(a.question._id)
        );
        const isRecorded = questions.every((a) => a.status === Status.COMPLETE);
        if (!isRecorded) {
          requiredSubjectsRecorded = false;
        }
        _slides.push(
          Slide(
            isRecorded,
            <RecordSubjectSlide
              key={`${s.name}`}
              classes={classes}
              subject={s}
              questions={questions}
              isRecorded={isRecorded}
              i={_slides.length}
            />
          )
        );
      }
    });

    const isBuildReady =
      mentorFilled && idleRecorded && requiredSubjectsRecorded;
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
          <AddQuestionSetSlide
            classes={classes}
            mentor={mentor}
            subjects={subjects}
            onUpdated={loadMentor}
          />
        )
      );
    }
    setSlides(_slides);
  }, [mentor]);

  async function loadMentor() {
    setMentor(await fetchMentor(cookies.accessToken));
  }

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
