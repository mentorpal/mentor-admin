/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { navigate } from "gatsby";
import React, { useContext, useState } from "react";
import { useCookies } from "react-cookie";
import { Button, Radio } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { fetchMentor, fetchSubjects, updateMentor } from "api";
import {
  Mentor,
  Subject,
  Status,
  Edge,
  UtteranceName,
  MentorType,
} from "types";
import NavBar from "components/nav-bar";
import withLocation from "wrap-with-location";
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
} from "./setup-slides";
import Context from "context";

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

function SetupPage(props: { search: { i?: string } }): JSX.Element {
  const classes = useStyles();
  const context = useContext(Context);
  const [mentor, setMentor] = useState<Mentor>();
  const [slides, setSlides] = useState<SlideType[]>([]);
  const [idx, setIdx] = useState(props.search.i ? parseInt(props.search.i) : 0);

  React.useEffect(() => {
    if (!context.user?.accessToken) {
      return;
    }
    const accessToken = context.user.accessToken;
    const load = async () => {
      const mentor = await fetchMentor(accessToken);
      // check for any required subjects the mentor does not have
      // TODO: should this step be moved somewhere else?
      fetchSubjects({ filter: { isRequired: true } }).then((subjects) => {
        const requiredSubjects = subjects.edges.map(
          (e: Edge<Subject>) => e.node
        );
        const subjectIds = mentor.subjects.map((s) => s._id);
        // if any unassigned required subjects are found, assign them to the mentor
        if (requiredSubjects.find((s) => !subjectIds.includes(s._id))) {
          const subjects = [
            ...new Set([...requiredSubjects, ...mentor.subjects]),
          ];
          updateMentor({ ...mentor, subjects }, accessToken).then((updated) => {
            if (updated) {
              fetchMentor(accessToken).then((m) => setMentor(m));
            }
          });
        }
      });
      setMentor(mentor);
    };
    load();
  }, []);

  React.useEffect(() => {
    if (!mentor) {
      return;
    }
    console.log(`here in setup what is mentor?`);
    console.log(mentor);
    const _slides = [
      Slide(true, <WelcomeSlide key="welcome" classes={classes} />),
      Slide(
        Boolean(mentor.name && mentor.firstName && mentor.title),
        <MentorInfoSlide
          key="mentor-info"
          classes={classes}
          mentor={mentor}
          onUpdated={loadMentor}
        />
      ),
      Slide(
        Boolean(mentor.mentorType),
        <MentorTypeSlide
          key="chat-type"
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
        _slides.push(
          Slide(
            idle.status === Status.COMPLETE,
            <RecordIdleSlide
              key="idle"
              classes={classes}
              idle={idle}
              i={_slides.length}
            />
          )
        );
      }
    }
    mentor.subjects.forEach((s) => {
      const answers = mentor.answers.filter((a) =>
        s.questions.map((q) => q.question._id).includes(a.question._id)
      );
      _slides.push(
        Slide(
          answers.every((a) => a.status === Status.COMPLETE),
          <RecordSubjectSlide
            key={`${s.name}`}
            classes={classes}
            subject={s}
            questions={answers}
            i={_slides.length}
          />
        )
      );
    });
    _slides.push(
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
    setSlides(_slides);
  }, [mentor]);

  async function loadMentor() {
    if (!context.user?.accessToken) {
      return;
    }
    setMentor(await fetchMentor(context.user.accessToken));
  }

  if (!mentor) {
    return (
      <div>
        <NavBar title="Mentor Setup" />
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
        {idx > 2 ? (
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
