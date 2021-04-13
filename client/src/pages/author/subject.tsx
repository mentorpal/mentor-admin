/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { navigate } from "gatsby";
import React, { useContext, useState } from "react";
import { useCookies } from "react-cookie";
import { toast, ToastContainer } from "react-toastify";
import { v4 as uuid } from "uuid";
import {
  Button,
  Card,
  CardContent,
  CircularProgress,
  Collapse,
  IconButton,
  TextField,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import Context from "context";
import { fetchMentorId, fetchSubject, updateSubject } from "api";
import { Subject, Category, Topic, SubjectQuestion, QuestionType } from "types";
import NavBar from "components/nav-bar";
import QuestionsList from "components/author/questions-list";
import TopicsList from "components/author/topics-list";
import withLocation from "wrap-with-location";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: 0,
  },
  flexChild: {
    width: "calc(100% - 40px)",
    textAlign: "left",
    padding: 0,
    margin: 0,
  },
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    width: 200,
    margin: theme.spacing(2),
  },
  list: {
    background: "#F5F5F5",
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

function SubjectPage(props: { search: { id?: string } }): JSX.Element {
  const classes = useStyles();
  const context = useContext(Context);
  const [cookies] = useCookies(["accessToken"]);
  const [subjectEdit, setSubjectEdit] = useState<Subject>({
    _id: "",
    name: "",
    description: "",
    isRequired: false,
    categories: [],
    topics: [],
    questions: [],
  });
  const [subject, setSubject] = useState<Subject>();
  const [mentorId, setMentorId] = useState<string>();
  const [isSubjectInfoExpanded, setIsSubjectInfoExpanded] = useState(true);
  const [isTopicsExpanded, setIsTopicsExpanded] = useState(false);
  const [isQuestionsExpanded, setIsQuestionsExpanded] = useState(false);
  const [windowHeight, setWindowHeight] = React.useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    setWindowHeight(window.innerHeight);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  React.useEffect(() => {
    if (!cookies.accessToken) {
      navigate("/login");
    }
  }, [cookies]);

  React.useEffect(() => {
    setSubject(JSON.parse(JSON.stringify(subjectEdit)));
    if (context.user) {
      fetchMentorId(cookies.accessToken).then((m) => {
        setMentorId(m._id);
        if (props.search.id) {
          loadSubject(props.search.id);
        }
      });
    }
  }, [context.user]);

  function toggleExpand(s: boolean, t: boolean, q: boolean) {
    setIsSubjectInfoExpanded(s);
    setIsTopicsExpanded(t);
    setIsQuestionsExpanded(q);
  }

  async function loadSubject(id: string) {
    const s = await fetchSubject(id);
    setSubject(JSON.parse(JSON.stringify(s)));
    setSubjectEdit(s);
  }

  function addCategory() {
    setSubjectEdit({
      ...subjectEdit,
      categories: [
        ...subjectEdit.categories,
        {
          id: uuid(),
          name: "",
          description: "",
        },
      ],
    });
  }

  function updateCategory(val: Category) {
    const idx = subjectEdit.categories.findIndex((c) => c.id === val.id);
    if (idx !== -1) {
      subjectEdit.categories[idx] = val;
      setSubjectEdit({ ...subjectEdit });
    }
  }

  function removeCategory(val: Category) {
    const idx = subjectEdit.categories.findIndex((c) => c.id === val.id);
    if (idx !== -1) {
      subjectEdit.categories.splice(idx, 1);
      subjectEdit.questions = [
        ...subjectEdit.questions.map((q) => {
          if (q.category?.id === val.id) {
            return {
              ...q,
              category: undefined,
            };
          }
          return q;
        }),
      ];
      setSubjectEdit({ ...subjectEdit });
    }
  }

  function addTopic() {
    setSubjectEdit({
      ...subjectEdit,
      topics: [
        ...subjectEdit.topics,
        {
          id: uuid(),
          name: "",
          description: "",
        },
      ],
    });
  }

  function updateTopic(val: Topic) {
    const idx = subjectEdit.topics.findIndex((t) => t.id === val.id);
    if (idx !== -1) {
      subjectEdit.topics[idx] = val;
      setSubjectEdit({ ...subjectEdit });
    }
  }

  function removeTopic(val: Topic) {
    const idx = subjectEdit.topics.findIndex((t) => t.id === val.id);
    if (idx !== -1) {
      subjectEdit.topics.splice(idx, 1);
      setSubjectEdit({ ...subjectEdit });
    }
  }

  function moveTopic(toMove: number, moveTo: number) {
    const [removed] = subjectEdit.topics.splice(toMove, 1);
    subjectEdit.topics.splice(moveTo, 0, removed);
    setSubjectEdit({ ...subjectEdit });
  }

  function addQuestion() {
    setSubjectEdit({
      ...subjectEdit,
      questions: [
        ...subjectEdit.questions,
        {
          question: {
            _id: uuid(),
            question: "",
            paraphrases: [],
            type: QuestionType.QUESTION,
            name: "",
          },
          category: undefined,
          topics: [],
        },
      ],
    });
  }

  function updateQuestion(val: SubjectQuestion) {
    const idx = subjectEdit.questions.findIndex(
      (q) => q.question._id === val.question._id
    );
    if (idx !== -1) {
      subjectEdit.questions[idx] = val;
      setSubjectEdit({ ...subjectEdit });
    }
  }

  function removeQuestion(val: SubjectQuestion) {
    const idx = subjectEdit.questions.findIndex(
      (q) => q.question._id === val.question._id
    );
    if (idx !== -1) {
      subjectEdit.questions.splice(idx, 1);
      setSubjectEdit({ ...subjectEdit });
    }
  }

  function moveQuestion(
    toMove: string,
    moveTo: string | undefined,
    category: string | undefined
  ) {
    const qToMove = subjectEdit.questions.findIndex(
      (q) => q.question._id === toMove
    );
    if (qToMove === -1) {
      return;
    }
    const question = subjectEdit.questions[qToMove];
    question.category = subjectEdit.categories.find((c) => c.id === category);
    const qMoveTo = subjectEdit.questions.findIndex(
      (q) => q.question._id === moveTo
    );
    if (qMoveTo !== -1) {
      subjectEdit.questions.splice(qToMove, 1);
      subjectEdit.questions.splice(qMoveTo, 0, question);
    }
    setSubjectEdit({ ...subjectEdit });
  }

  async function saveSubject() {
    try {
      setIsSaving(true);
      const updated = await updateSubject(subjectEdit, cookies.accessToken);
      await loadSubject(updated._id);
      setIsSaving(false);
    } catch (err) {
      console.error(err);
      setIsSaving(false);
      toast("Failed to save");
    }
  }

  if (!context.user) {
    return (
      <div>
        <NavBar title="Edit Subject" />
        <CircularProgress />
      </div>
    );
  }

  const maxChildHeight = windowHeight - 65 - 30 - 30 - 30 - 65 - 50;
  return (
    <div className={classes.root}>
      <NavBar title="Edit Subject" />
      <Card
        elevation={0}
        className={classes.flexChild}
        style={{ maxHeight: maxChildHeight }}
      >
        <div className={classes.row}>
          <IconButton
            id="toggle-info"
            size="small"
            aria-expanded={isSubjectInfoExpanded}
            onClick={() => toggleExpand(!isSubjectInfoExpanded, false, false)}
          >
            <ExpandMoreIcon
              style={{
                transform: isSubjectInfoExpanded
                  ? "rotate(180deg)"
                  : "rotate(0deg)",
              }}
            />
          </IconButton>
          <Typography variant="body2">Subject Info</Typography>
        </div>
        <CardContent style={{ padding: 0 }}>
          <Collapse in={isSubjectInfoExpanded} timeout="auto" unmountOnExit>
            <TextField
              id="name"
              variant="outlined"
              label="Subject Name"
              placeholder="Display name for the subject"
              value={subjectEdit.name}
              onChange={(e) =>
                setSubjectEdit({ ...subjectEdit, name: e.target.value })
              }
              style={{ marginTop: 20, marginBottom: 20 }}
              fullWidth
              multiline
            />
            <TextField
              id="description"
              variant="outlined"
              label="Subject Description"
              placeholder="Description about the types of questions in the subject"
              value={subjectEdit.description}
              onChange={(e) =>
                setSubjectEdit({ ...subjectEdit, description: e.target.value })
              }
              fullWidth
              multiline
            />
          </Collapse>
        </CardContent>
      </Card>
      <TopicsList
        classes={classes}
        maxHeight={maxChildHeight}
        expanded={isTopicsExpanded}
        topics={subjectEdit.topics}
        toggleExpanded={() => toggleExpand(false, !isTopicsExpanded, false)}
        addTopic={addTopic}
        editTopic={updateTopic}
        removeTopic={removeTopic}
        moveTopic={moveTopic}
      />
      <QuestionsList
        classes={classes}
        maxHeight={maxChildHeight}
        expanded={isQuestionsExpanded}
        categories={subjectEdit.categories}
        questions={subjectEdit.questions.filter(
          (q) => !q.question.mentor || q.question.mentor === mentorId
        )}
        topics={subjectEdit.topics}
        toggleExpanded={() => toggleExpand(false, false, !isQuestionsExpanded)}
        addCategory={addCategory}
        editCategory={updateCategory}
        removeCategory={removeCategory}
        addQuestion={addQuestion}
        editQuestion={updateQuestion}
        removeQuestion={removeQuestion}
        moveQuestion={moveQuestion}
      />
      <div style={{ height: 65 }}>
        <Button
          id="save-button"
          variant="contained"
          color="primary"
          className={classes.button}
          disabled={JSON.stringify(subjectEdit) === JSON.stringify(subject)}
          onClick={saveSubject}
        >
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
      <ToastContainer />
    </div>
  );
}

export default withLocation(SubjectPage);
