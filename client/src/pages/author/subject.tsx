/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { navigate } from "gatsby";
import React, { useContext, useState } from "react";
import { useCookies } from "react-cookie";
import { toast, ToastContainer } from "react-toastify";
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

import { fetchMentorId, fetchSubject, updateSubject } from "api";
import Context from "context";
import { Subject, Category, Topic, SubjectQuestion } from "types";
import withLocation from "wrap-with-location";
import NavBar from "components/nav-bar";
import QuestionsList from "components/author/questions-list";
import TopicsList from "components/author/topics-list";

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

interface SubjectUnderEdit {
  subject: Subject;
  dirty: boolean;
}

function SubjectPage(props: { search: { id?: string } }): JSX.Element {
  const classes = useStyles();
  const context = useContext(Context);
  const [cookies] = useCookies(["accessToken"]);
  const [mentorId, setMentorId] = useState<string>();
  const [subjectEdit, setSubjectEdit] = useState<SubjectUnderEdit>({
    subject: {
      _id: "",
      name: "",
      description: "",
      isRequired: false,
      categories: [],
      topics: [],
      questions: [],
    },
    dirty: false,
  });
  const [isSubjectInfoExpanded, setIsSubjectInfoExpanded] = useState(true);
  const [isTopicsExpanded, setIsTopicsExpanded] = useState(false);
  const [isQuestionsExpanded, setIsQuestionsExpanded] = useState(false);
  const [windowHeight, setWindowHeight] = React.useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  React.useEffect(() => {
    if (!cookies.accessToken) {
      navigate("/login");
    }
  }, [cookies]);

  React.useEffect(() => {
    if (context.user) {
      fetchMentorId(cookies.accessToken).then((m) => {
        setMentorId(m._id);
      });
    }
  }, [context.user]);

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
    if (props.search.id) {
      loadSubject(props.search.id, mentorId || "");
    }
  }, [mentorId]);

  async function loadSubject(id: string, mentor: string) {
    setSubjectEdit({ subject: await fetchSubject(id, mentor), dirty: false });
  }

  function editSubject(subject: Subject) {
    setSubjectEdit({ subject, dirty: true });
  }

  function toggleExpand(s: boolean, t: boolean, q: boolean) {
    setIsSubjectInfoExpanded(s);
    setIsTopicsExpanded(t);
    setIsQuestionsExpanded(q);
  }

  async function saveSubject() {
    try {
      setIsSaving(true);
      const updated = await updateSubject(
        subjectEdit.subject,
        cookies.accessToken
      );
      if (props.search.id !== updated._id) {
        navigate(`/author/subjects/subject?id=${updated._id}`);
      }
      await loadSubject(updated._id, mentorId || "");
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
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <IconButton
            id="expand"
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
              label="Subject Name"
              placeholder="Display name for the subject"
              fullWidth
              value={subjectEdit.subject.name || ""}
              onChange={(e) =>
                editSubject({ ...subjectEdit.subject, name: e.target.value })
              }
              style={{ marginTop: 20, marginBottom: 20 }}
              variant="outlined"
            />
            <TextField
              id="description"
              label="Subject Description"
              placeholder="Description about the types of questions in the subject"
              fullWidth
              multiline
              value={subjectEdit.subject.description || ""}
              onChange={(e) =>
                editSubject({
                  ...subjectEdit.subject,
                  description: e.target.value,
                })
              }
              variant="outlined"
            />
          </Collapse>
        </CardContent>
      </Card>
      <TopicsList
        classes={classes}
        topics={subjectEdit.subject.topics}
        maxHeight={maxChildHeight}
        expanded={isTopicsExpanded}
        toggleExpanded={() => toggleExpand(false, !isTopicsExpanded, false)}
        updateTopics={(ts: Topic[]) =>
          editSubject({
            ...subjectEdit.subject,
            topics: ts,
          })
        }
      />
      <QuestionsList
        classes={classes}
        subject={subjectEdit.subject}
        maxHeight={maxChildHeight}
        expanded={isQuestionsExpanded}
        toggleExpanded={() => toggleExpand(false, false, !isQuestionsExpanded)}
        updateCategories={(cs: Category[]) =>
          editSubject({
            ...subjectEdit.subject,
            categories: cs,
          })
        }
        updateQuestions={(qs: SubjectQuestion[]) =>
          editSubject({
            ...subjectEdit.subject,
            questions: qs,
          })
        }
      />
      <div style={{ height: 65 }}>
        <Button
          id="save-btn"
          variant="contained"
          color="primary"
          className={classes.button}
          disabled={!subjectEdit.dirty || isSaving}
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
