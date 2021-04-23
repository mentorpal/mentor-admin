/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { navigate } from "gatsby";
import React, { useState } from "react";
import { v4 as uuid } from "uuid";
import {
  AppBar,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Fab,
  List,
  ListItem,
  MenuItem,
  Select,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import {
  fetchMentor,
  fetchTrainingStatus,
  trainMentor,
  updateSubject,
} from "api";
import {
  Answer,
  Category,
  Mentor,
  Question,
  QuestionType,
  Status,
  Subject,
  SubjectQuestion,
  TrainState,
} from "types";
import NavBar from "components/nav-bar";
import RecordingBlockItem, {
  RecordingBlock,
} from "components/home/recording-block";
import useInterval from "use-interval";
import withLocation from "wrap-with-location";
import { toast, ToastContainer } from "react-toastify";
import withAuthorizationOnly from "wrap-with-authorization-only";

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
  fab: {
    marginLeft: 10,
    marginRight: 10,
  },
}));

interface Progress {
  complete: number;
  total: number;
}

function HomePage(props: {
  accessToken: string;
  search: { subject?: string };
}): JSX.Element {
  const classes = useStyles();
  const [mentor, setMentor] = useState<Mentor>();
  const [selectedSubject, setSelectedSubject] = useState<string>();
  const [blocks, setBlocks] = useState<RecordingBlock[]>([]);
  const [progress, setProgress] = useState<Progress>({ complete: 0, total: 0 });
  const [editedSubjects, setEditedSubjects] = useState<string[]>([]);
  const [loadingMessage, setLoadingMessage] = useState<string>();
  const [statusUrl, setStatusUrl] = React.useState("");
  const [isBuilding, setIsBuilding] = useState(false);

  React.useEffect(() => {
    let mounted = true;
    setSelectedSubject(props.search.subject);
    setLoadingMessage("Loading mentor...");
    fetchMentor(props.accessToken)
      .then((m) => {
        if (!mounted) {
          return;
        }
        setMentor(m);
        setLoadingMessage(undefined);
      })
      .catch((err) => console.error(err));
    return () => {
      mounted = false;
    };
  }, []);

  React.useEffect(() => {
    loadAnswers();
  }, [mentor, selectedSubject, editedSubjects]);

  function loadAnswers() {
    if (!mentor) {
      return;
    }
    const _blocks: RecordingBlock[] = [];
    const subject = mentor.subjects.find((s) => s._id === selectedSubject);
    let answers = mentor.answers;
    if (subject) {
      answers = answers.filter((a) =>
        subject.questions.map((q) => q.question._id).includes(a.question._id)
      );
      subject.categories.forEach((c) => {
        const categoryAnswers = answers.filter((a) =>
          subject.questions
            .filter((q) => q.category?.id === c.id)
            .map((q) => q.question._id)
            .includes(a.question._id)
        );
        if (categoryAnswers.length > 0) {
          _blocks.push({
            name: c.name,
            description: c.description,
            answers: categoryAnswers,
            recordAll: (status) => onRecordAll(status, subject._id, c.id),
            recordOne: onRecordOne,
            addQuestion: () => onAddQuestion(subject, c),
            editQuestion: (question) => onEditQuestion(subject, question),
          });
        }
      });
      const uncategorizedAnswers = answers.filter((a) =>
        subject.questions
          .filter((q) => !q.category)
          .map((q) => q.question._id)
          .includes(a.question._id)
      );
      if (uncategorizedAnswers.length > 0) {
        _blocks.push({
          name: subject.name,
          description: subject.description,
          answers: uncategorizedAnswers,
          recordAll: (status) => onRecordAll(status, subject._id, "none"),
          recordOne: onRecordOne,
          addQuestion: () => onAddQuestion(subject, undefined),
          editQuestion: (question) => onEditQuestion(subject, question),
        });
      }
    } else {
      mentor.subjects.forEach((s) => {
        const subjectAnswers = answers.filter((a) =>
          s.questions.map((q) => q.question._id).includes(a.question._id)
        );
        _blocks.push({
          name: s.name,
          description: s.description,
          answers: subjectAnswers,
          recordAll: (status) => onRecordAll(status, s._id, undefined),
          recordOne: onRecordOne,
          addQuestion: () => onAddQuestion(s, undefined),
          editQuestion: (question) => onEditQuestion(s, question),
        });
      });
    }
    setProgress({
      complete: answers.filter((a) => a.status === Status.COMPLETE).length,
      total: answers.length,
    });
    setBlocks(_blocks);
  }

  function onRecordAll(
    status: Status,
    subject: string | undefined,
    category: string | undefined
  ) {
    navigate(
      `/record?back=${encodeURI(
        `/?subject=${selectedSubject}`
      )}&status=${status}&subject=${subject || ""}&category=${category || ""}`
    );
  }

  function onRecordOne(answer: Answer) {
    navigate(
      `/record?back=${encodeURI(`/?subject=${selectedSubject}`)}&videoId=${
        answer.question._id
      }`
    );
  }

  function onAddQuestion(subject: Subject, category: Category | undefined) {
    const subjectIdx =
      mentor?.subjects.findIndex((s) => s._id === subject._id) || -1;
    if (!mentor || subjectIdx === -1) {
      return;
    }
    const newQuestion: SubjectQuestion = {
      question: {
        _id: uuid(),
        question: "",
        paraphrases: [],
        type: QuestionType.QUESTION,
        name: "",
        mentor: mentor?._id,
      },
      category: category,
      topics: [],
    };
    mentor.subjects[subjectIdx].questions = [newQuestion, ...subject.questions];
    mentor.answers = [
      {
        _id: uuid(),
        question: newQuestion.question,
        transcript: "",
        status: Status.INCOMPLETE,
        recordedAt: "",
      },
      ...mentor.answers,
    ];
    if (!editedSubjects.includes(subject._id)) {
      setEditedSubjects([...editedSubjects, subject._id]);
    }
    setMentor({ ...mentor });
  }

  function onEditQuestion(subject: Subject, question: Question) {
    const subjectIdx =
      mentor?.subjects.findIndex((s) => s._id === subject._id) || -1;
    if (!mentor || subjectIdx === -1) {
      return;
    }
    const questionIdx = subject.questions.findIndex(
      (q) => q.question._id === question._id
    );
    if (questionIdx === -1) {
      return;
    }
    mentor.subjects[subjectIdx].questions[questionIdx].question = question;
    const answerIdx = mentor.answers.findIndex(
      (a) => a.question._id === question._id
    );
    if (answerIdx === -1) {
      return;
    }
    mentor.answers[answerIdx].question = question;
    if (!editedSubjects.includes(subject._id)) {
      setEditedSubjects([...editedSubjects, subject._id]);
    }
    setMentor({ ...mentor });
  }

  function onSave() {
    if (!mentor) {
      return;
    }
    console.warn(
      "MUST FIX: batch the sequence of updateSubject async calls below into a single batch GQL update/request"
    );
    setLoadingMessage("Saving changes...");
    Promise.all(
      editedSubjects.map((sId) => {
        const subject = mentor.subjects.find((s) => s._id === sId);
        if (subject) {
          // don't save empty questions
          for (const [i, sQuestion] of subject.questions.entries()) {
            if (!sQuestion.question.question) {
              subject.questions.splice(i, 1);
            }
          }
          return updateSubject(subject, props.accessToken);
        }
      })
    )
      .then(() => {
        return fetchMentor(props.accessToken);
      })
      .then((m) => {
        setMentor(m);
        setLoadingMessage(undefined);
      })
      .catch((err) => console.error(err));
  }

  function trainAndBuild() {
    if (!mentor) {
      return;
    }
    setLoadingMessage("Training mentor...");
    trainMentor(mentor._id)
      .then((trainJob) => {
        setStatusUrl(trainJob.statusUrl);
        setIsBuilding(true);
      })
      .catch((err) => {
        toast(`Training failed: ${err.message || err}`);
        setLoadingMessage(undefined);
        setIsBuilding(false);
      });
  }

  useInterval(
    (isCancelled) => {
      fetchTrainingStatus(statusUrl)
        .then((trainStatus) => {
          if (isCancelled()) {
            setIsBuilding(false);
            setLoadingMessage(undefined);
            return;
          }
          if (trainStatus.state === TrainState.SUCCESS) {
            toast(`Training succeeded!`);
            setIsBuilding(false);
            setLoadingMessage(undefined);
          }
          if (trainStatus.state === TrainState.FAILURE) {
            toast(`Training failed`);
            setIsBuilding(false);
            setLoadingMessage(undefined);
          }
        })
        .catch((err: Error) => {
          toast(`Training failed: ${err.message || err}`);
          setIsBuilding(false);
          setLoadingMessage(undefined);
        });
    },
    isBuilding ? 1000 : null
  );

  return (
    <div className={classes.root}>
      <div style={{ flexShrink: 0 }}>
        <NavBar title="Mentor Studio" mentorId={mentor?._id} />
        <Select
          data-cy="select-subject"
          value={mentor?.subjects.find((s) => s._id === selectedSubject)}
          displayEmpty
          renderValue={() => (
            <Typography variant="h6" className={classes.title}>
              {mentor?.subjects.find((s) => s._id === selectedSubject)?.name ||
                "All Answers"}{" "}
              ({progress.complete} / {progress.total})
            </Typography>
          )}
          onChange={(
            event: React.ChangeEvent<{ value: unknown; name?: unknown }>
          ) => {
            setSelectedSubject(event.target.value as string);
          }}
        >
          <MenuItem data-cy="all-subjects" value={undefined}>
            Show All Subjects
          </MenuItem>
          {mentor?.subjects.map((s) => (
            <MenuItem key={s._id} data-cy={`select-${s._id}`} value={s._id}>
              {s.name}
            </MenuItem>
          ))}
        </Select>
      </div>
      <List
        data-cy="recording-blocks"
        style={{
          flex: "auto",
          backgroundColor: "#eee",
        }}
      >
        {blocks.map((b, i) => (
          <ListItem key={b.name} data-cy={`block-${i}`}>
            <RecordingBlockItem
              classes={classes}
              block={b}
              mentorId={mentor?._id || ""}
            />
          </ListItem>
        ))}
      </List>
      <div className={classes.toolbar} />
      <AppBar position="fixed" color="default" className={classes.appBar}>
        <Toolbar
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
          }}
        >
          <Fab
            data-cy="save-button"
            variant="extended"
            color="secondary"
            disabled={editedSubjects.length === 0}
            onClick={onSave}
            className={classes.fab}
          >
            Save Changes
          </Fab>
          <Fab
            data-cy="train-button"
            variant="extended"
            color="primary"
            disabled={isBuilding}
            onClick={trainAndBuild}
            className={classes.fab}
          >
            Build Mentor
          </Fab>
        </Toolbar>
      </AppBar>
      <Dialog open={loadingMessage !== undefined}>
        <DialogTitle>{loadingMessage}</DialogTitle>
        <DialogContent>
          <CircularProgress />
        </DialogContent>
      </Dialog>
      <ToastContainer />
    </div>
  );
}

export default withAuthorizationOnly(withLocation(HomePage));
