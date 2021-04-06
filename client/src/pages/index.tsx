/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { navigate } from "gatsby";
import React, { useContext, useState } from "react";
import { useCookies } from "react-cookie";
import {
  AppBar,
  CircularProgress,
  Fab,
  List,
  ListItem,
  MenuItem,
  Select,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { fetchMentor, updateSubject } from "api";
import { Answer, Category, Mentor, QuestionType, Status, Subject } from "types";
import Context from "context";
import NavBar from "components/nav-bar";
import RecordingBlock, { Block } from "components/record/recording-block";
import withLocation from "wrap-with-location";

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
}));

interface Progress {
  complete: number;
  total: number;
}

function IndexPage(props: { search: { subject?: string } }): JSX.Element {
  const classes = useStyles();
  const context = useContext(Context);
  const [cookies] = useCookies(["accessToken"]);
  const [mentor, setMentor] = useState<Mentor>();
  const [selectedSubject, setSelectedSubject] = useState<string>();
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [progress, setProgress] = useState<Progress>({ complete: 0, total: 0 });

  React.useEffect(() => {
    if (!cookies.accessToken) {
      navigate("/login");
    }
  }, [cookies]);

  React.useEffect(() => {
    if (!context.user) {
      return;
    }
    if (props.search.subject) {
      setSelectedSubject(props.search.subject);
    }
    fetchMentor(cookies.accessToken).then((m) => {
      setMentor(m);
    });
  }, [context.user]);

  React.useEffect(() => {
    loadAnswers();
  }, [mentor, selectedSubject]);

  function onSelectSubject(id: string) {
    setSelectedSubject(id);
  }

  function onRecordAll(
    status: Status,
    subject: string | undefined,
    category: string | undefined
  ) {
    navigate(
      `/record?status=${status}&back=${encodeURI(`/?subject=${subject}`)}${
        subject !== undefined ? `&subject=${subject}` : ""
      }${category !== undefined ? `&category=${category}` : ""}`
    );
  }

  function onRecordOne(answer: Answer) {
    navigate(`/record?videoId=${answer.question._id}`);
  }

  async function onAddMentorQuestion(
    subject: Subject,
    category: Category | undefined
  ) {
    await updateSubject(
      {
        ...subject,
        questions: [
          ...subject.questions,
          {
            question: {
              _id: "",
              question: "",
              paraphrases: [],
              type: QuestionType.QUESTION,
              name: "",
              mentor: mentor?._id,
            },
            category: category,
            topics: [],
          },
        ],
      },
      cookies.accessToken
    );
    setMentor(await fetchMentor(cookies.accessToken));
  }

  async function loadAnswers() {
    if (!mentor) {
      return;
    }
    const _blocks: Block[] = [];
    let answers = mentor.answers;
    if (selectedSubject) {
      const subject = mentor.subjects.find((s) => s._id === selectedSubject);
      if (subject) {
        answers = answers.filter((a) =>
          subject.questions.map((q) => q.question._id).includes(a.question._id)
        );
        subject.categories.forEach((c) => {
          const questions = subject.questions.filter(
            (q) => q.category?.id === c.id
          );
          _blocks.push({
            name: c.name,
            description: c.description,
            answers: answers.filter((a) =>
              questions.map((q) => q.question._id).includes(a.question._id)
            ),
            recordAll: (status) => onRecordAll(status, subject._id, c.id),
            recordOne: onRecordOne,
            addQuestion: () => onAddMentorQuestion(subject, c),
          });
        });
        const uncategorizedQuestions = subject.questions.filter(
          (q) => !q.category
        );
        _blocks.push({
          name: subject.name,
          description: subject.description,
          answers: answers.filter((a) =>
            uncategorizedQuestions
              .map((q) => q.question._id)
              .includes(a.question._id)
          ),
          recordAll: (status) => onRecordAll(status, subject._id, ""),
          recordOne: onRecordOne,
          addQuestion: () => onAddMentorQuestion(subject, undefined),
        });
      }
    } else {
      mentor.subjects.forEach((s) => {
        _blocks.push({
          name: s.name,
          description: s.description,
          answers: answers.filter((a) =>
            s.questions.map((q) => q.question._id).includes(a.question._id)
          ),
          recordAll: (status) => onRecordAll(status, s._id, undefined),
          recordOne: onRecordOne,
          addQuestion: () => onAddMentorQuestion(s, undefined),
        });
      });
    }
    setProgress({
      complete: answers.filter((a) => a.status === Status.COMPLETE).length,
      total: answers.length,
    });
    setBlocks(_blocks);
  }

  if (!mentor) {
    return (
      <div className={classes.root}>
        <NavBar title="Mentor Studio" />
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <div style={{ flexShrink: 0 }}>
        <NavBar title="Mentor Studio" />
        <Select
          id="select-subject"
          value={mentor.subjects.find((s) => s._id === selectedSubject)}
          displayEmpty
          renderValue={() => (
            <Typography id="progress" variant="h6" className={classes.title}>
              {mentor.subjects.find((s) => s._id === selectedSubject)?.name ||
                "All Answers"}{" "}
              ({progress.complete} / {progress.total})
            </Typography>
          )}
          onChange={(
            event: React.ChangeEvent<{ value: unknown; name?: unknown }>
          ) => {
            onSelectSubject(event.target.value as string);
          }}
        >
          <MenuItem id="all-subjects" value={undefined}>
            Show All Subjects
          </MenuItem>
          {mentor.subjects.map((s) => (
            <MenuItem id="utterance" value={s._id}>
              {s.name}
            </MenuItem>
          ))}
        </Select>
      </div>
      <List
        style={{
          flex: "auto",
          backgroundColor: "#eee",
        }}
      >
        {blocks.map((b) => (
          <ListItem key={b.name}>
            <RecordingBlock classes={classes} block={b} />
          </ListItem>
        ))}
      </List>
      <div className={classes.toolbar} />
      <AppBar position="fixed" color="default" className={classes.appBar}>
        <Toolbar>
          <Fab
            id="build-button"
            variant="extended"
            color="primary"
            style={{ position: "absolute", right: 10 }}
          >
            Build Mentor
          </Fab>
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default withLocation(IndexPage);
