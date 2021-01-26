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
  const [steps, setSteps] = useState<boolean[]>([]);
  const [idx, setIdx] = useState(props.search.i ? parseInt(props.search.i) : 0);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isBuildReady, setBuildReady] = useState(false);

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
      const subjects = await fetchSubjects(cookies.accessToken, {
        sortBy: "name",
        sortAscending: true,
      });
      setSubjects(subjects.edges.map((e: Edge<Subject>) => e.node));
      setMentor(await fetchMentor(context.user._id, cookies.accessToken));
    };
    load();
  }, [context.user]);

  React.useEffect(() => {
    if (!mentor) {
      return;
    }
    const mentorFilled =
      mentor.name !== "" && mentor.firstName !== "" && mentor.title !== "";
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
        if (
          q.topics.find((t) => t.name === "Idle") &&
          q.status !== Status.COMPLETE
        ) {
          idleRecorded = false;
        }
      }
    });
    const _slideStatus = [
      true,
      mentorFilled,
      true,
      idleRecorded,
      backgroundRecorded,
      utteranceRecorded,
      mentor.isBuilt,
    ];
    if (mentor.isBuilt) {
      _slideStatus.push(true);
    }
    setSteps(_slideStatus);
    setBuildReady(
      mentorFilled && idleRecorded && backgroundRecorded && utteranceRecorded
    );
  }, [mentor, subjects]);

  function renderButtons(): JSX.Element {
    return (
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
        {idx !== steps.length - 1 ? (
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
    );
  }

  function renderSlide(): JSX.Element {
    if (!mentor) {
      return <div>ERROR: NO MENTOR</div>;
    }
    if (idx === 0) {
      return <WelcomeSlide key="welcome" classes={classes} />;
    }
    if (idx === 1) {
      return (
        <MentorSlide
          key="mentor-info"
          classes={classes}
          mentor={mentor}
          onUpdated={setMentor}
        />
      );
    }
    if (idx === 2) {
      return <IntroductionSlide key="introduction" classes={classes} />;
    }
    if (idx === 3) {
      return <IdleSlide key="idle" classes={classes} mentor={mentor} />;
    }
    if (idx === 4) {
      const subject = mentor.subjects.find((s) => s.name === "Background");
      return subject ? (
        <RecordSlide
          key="background"
          classes={classes}
          mentor={mentor}
          subject={subject}
          i={4}
        />
      ) : (
        <div>ERROR: NO BACKGROUND</div>
      );
    }
    if (idx === 5) {
      const subject = mentor.subjects.find((s) => s.name === "Repeat After Me");
      return subject ? (
        <RecordSlide
          key="utterances"
          classes={classes}
          mentor={mentor}
          subject={subject}
          i={5}
        />
      ) : (
        <div>ERROR: NO UTTERANCES</div>
      );
    }
    if (idx === 6) {
      return isBuildReady ? (
        <BuildMentorSlide
          key="build"
          classes={classes}
          mentor={mentor}
          onUpdated={setMentor}
        />
      ) : (
        <BuildErrorSlide key="build-error" classes={classes} />
      );
    }
    if (idx === 7) {
      return (
        <QuestionSetSlide
          classes={classes}
          mentor={mentor}
          subjects={subjects}
          onUpdated={setMentor}
        />
      );
    }
    return <div>ERROR: INVALID SLIDE NUMBER</div>;
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
      {renderSlide()}
      {renderButtons()}
      <div className={classes.row}>
        {steps.map((done, i) => (
          <Radio
            id={`radio-${i}`}
            key={i}
            checked={i === idx}
            onClick={() => setIdx(i)}
            color={done ? "primary" : "default"}
            style={{ color: done ? "" : "red" }}
          />
        ))}
      </div>
    </div>
  );
}

export default withLocation(SetupPage);
