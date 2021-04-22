/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable  "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { navigate } from "gatsby";
import React, { useState } from "react";
import { Button, CircularProgress, Radio } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { fetchMentor } from "api";
import { Mentor, Status, UtteranceName, MentorType, User } from "types";
import NavBar from "components/nav-bar";
import {
  Slide,
  SlideType,
  WelcomeSlide,
  MentorInfoSlide,
  IntroductionSlide,
  RecordIdleSlide,
  RecordSubjectSlide,
  BuildMentorSlide,
  SelectSubjectsSlide,
  MentorTypeSlide,
} from "components/setup-slides";
import withAuthorizationOnly from "wrap-with-authorization-only";
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

interface MentorState {
  mentor?: Mentor;
  reload?: boolean;
}

function SetupPage(props: {
  accessToken: string;
  user: User;
  search: { i?: string };
}): JSX.Element {
  const { search } = props;
  const classes = useStyles();
  const [mentorState, setMentorState] = useState<MentorState>({ reload: true });
  const [slides, setSlides] = useState<SlideType[]>([]);
  const [idx, setIdx] = useState(search.i ? parseInt(search.i, 10) : 0);
  const { mentor, reload } = mentorState;

  function loadMentor() {
    setMentorState({ ...mentorState, reload: true });
  }

  React.useEffect(() => {
    if (!reload) {
      return () => {};
    }
    let mounted = true;
    fetchMentor(props.accessToken)
      .then((m) => {
        if (!mounted) {
          return;
        }
        setMentorState({
          mentor: m,
          reload: false,
        });
      })
      .catch((err) => console.error(err));
    return () => {
      mounted = false;
    };
  }, [reload]);

  React.useEffect(() => {
    if (!mentor) {
      return;
    }
    const slidesUpdated = [
      Slide(
        true,
        <WelcomeSlide
          key="welcome"
          classes={classes}
          userName={props.user.name}
        />
      ),
      Slide(
        Boolean(mentor.name && mentor.firstName && mentor.title),
        <MentorInfoSlide
          key="mentor-info"
          classes={classes}
          mentor={mentor}
          accessToken={props.accessToken}
          onUpdated={loadMentor}
        />
      ),
      Slide(
        Boolean(mentor.mentorType),
        <MentorTypeSlide
          key="chat-type"
          accessToken={props.accessToken}
          classes={classes}
          mentor={mentor}
          onUpdated={loadMentor}
        />
      ),
      Slide(true, <IntroductionSlide key="introduction" classes={classes} />),
      Slide(true, <SelectSubjectsSlide classes={classes} i={4} />),
    ];
    if (mentor.mentorType === MentorType.VIDEO) {
      const idle = mentor.answers.find(
        (a) => a.question.name === UtteranceName.IDLE
      );
      if (idle) {
        slidesUpdated.push(
          Slide(
            idle.status === Status.COMPLETE,
            <RecordIdleSlide
              key="idle"
              classes={classes}
              idle={idle}
              i={slidesUpdated.length}
            />
          )
        );
      }
    }
    mentor.subjects.forEach((s) => {
      const answers = mentor.answers.filter((a) =>
        s.questions.map((q) => q.question._id).includes(a.question._id)
      );
      slidesUpdated.push(
        Slide(
          answers.every((a) => a.status === Status.COMPLETE),
          <RecordSubjectSlide
            key={`${s.name}`}
            classes={classes}
            subject={s}
            questions={answers}
            i={slidesUpdated.length}
          />
        )
      );
    });
    slidesUpdated.push(
      Slide(
        Boolean(mentor.lastTrainedAt),
        <BuildMentorSlide
          key="build"
          classes={classes}
          mentor={mentor}
          onUpdated={loadMentor}
        />
      )
    );
    setSlides(slidesUpdated);
  }, [mentor]);

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
      <NavBar title="Mentor Setup" mentorId={mentor._id} />
      <div data-cy="slide">
        {idx >= slides.length ? "Invalid slide" : slides[idx].element}
      </div>
      <div className={classes.row} style={{ height: 150 }}>
        {idx > 0 ? (
          <Button
            data-cy="back-btn"
            className={classes.button}
            variant="contained"
            onClick={() => setIdx(idx - 1)}
          >
            Back
          </Button>
        ) : undefined}
        {idx > 2 ? (
          <Button
            data-cy="done-btn"
            className={classes.button}
            variant="contained"
            color="secondary"
            onClick={() => navigate("/")}
          >
            Done
          </Button>
        ) : undefined}
        {idx !== slides.length - 1 ? (
          <Button
            data-cy="next-btn"
            className={classes.button}
            variant="contained"
            color="primary"
            onClick={() => setIdx(idx + 1)}
          >
            Next
          </Button>
        ) : undefined}
      </div>
      <div className={classes.row}>
        {slides.map((s, i) => (
          <Radio
            data-cy={`radio-${i}`}
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

export default withAuthorizationOnly(
  withLocation(SetupPage as React.FunctionComponent)
);
