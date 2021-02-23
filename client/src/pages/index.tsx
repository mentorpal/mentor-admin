/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useContext, useState } from "react";
import { useCookies } from "react-cookie";
import { navigate } from "gatsby";
import { Button, CircularProgress, Paper, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { fetchMentor } from "api";
import { Answer, Mentor, Status, Subject } from "types";
import Context from "context";
import NavBar from "components/nav-bar";
import ProgressBar from "components/progress-bar";
import AnswerList from "components/answer-list";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#ddd",
    width: "100%",
    height: "100%",
  },
  paper: {
    flexGrow: 1,
    height: "100%",
    padding: 25,
    margin: 25,
  },
  title: {
    fontWeight: "bold",
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
}));

function IndexPage(): JSX.Element {
  const classes = useStyles();
  const context = useContext(Context);
  const [cookies] = useCookies(["accessToken"]);
  const [mentor, setMentor] = useState<Mentor>();
  const [selectedSubjects, setSelectedSubjects] = useState<Subject[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Answer[]>([]);

  const complete = (mentor?.answers || []).filter((q) => {
    return q.status === Status.COMPLETE;
  });

  React.useEffect(() => {
    if (!cookies.accessToken) {
      navigate("/login");
    }
  }, [cookies]);

  React.useEffect(() => {
    loadMentor();
  }, [context.user]);

  React.useEffect(() => {
    if (!mentor) {
      return;
    }
    setSelectedAnswers(mentor.answers);
    setSelectedSubjects(mentor.subjects);
  }, [mentor]);

  async function loadMentor() {
    if (!context.user) {
      return;
    }
    setMentor(await fetchMentor(cookies.accessToken));
  }

  function onRecord() {
    navigate(
      `/record?${selectedAnswers
        .map((a) => `videoId=${a.question._id}`)
        .join("&")}`
    );
  }

  function onAnswerChecked(answer: Answer) {
    const i = selectedAnswers.findIndex((a) => a._id === answer._id);
    if (i === -1) {
      setSelectedAnswers([...selectedAnswers, answer]);
    } else {
      setSelectedAnswers([
        ...selectedAnswers.filter((a) => a._id !== answer._id),
      ]);
    }
  }

  if (!mentor) {
    return (
      <div>
        <NavBar title="Mentor Studio" />
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <NavBar title="Mentor Studio" />
      <Paper id="answers" className={classes.paper}>
        <Typography id="progress" variant="h6" className={classes.title}>
          My Answers ({complete.length} / {mentor.answers.length})
        </Typography>
        <ProgressBar value={(complete.length / mentor.answers.length) * 100} />
        <AnswerList
          classes={classes}
          header="Selected"
          answers={selectedAnswers}
          selected={selectedAnswers}
          onCheck={onAnswerChecked}
        />
        <AnswerList
          classes={classes}
          header="All"
          answers={mentor.answers}
          selected={selectedAnswers}
          onCheck={onAnswerChecked}
        />
        <Button
          id="record-btn"
          variant="contained"
          color="primary"
          onClick={onRecord}
        >
          Record Questions
        </Button>
      </Paper>
    </div>
  );
}

export default IndexPage;
