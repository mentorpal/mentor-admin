/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { navigate } from "gatsby";
import React, { useContext, useState } from "react";
import { useCookies } from "react-cookie";
import { toast, ToastContainer } from "react-toastify";
import { Button, CircularProgress, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import NavBar from "components/nav-bar";
import QuestionsList from "components/author/questions-list";
import { fetchSubject, updateSubject } from "api";
import Context from "context";
import { Question, Subject, Topic } from "types";
import withLocation from "wrap-with-location";
import TopicsOrderList from "components/author/topics-order-list";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: 0,
  },
  flexFixedChild: {
    flexShrink: 0,
    width: "calc(100% - 40px)",
  },
  flexExpandChild: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    width: "calc(100% - 40px)",
    minHeight: 50,
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
  const [subjectEdit, setSubjectEdit] = useState<SubjectUnderEdit>({
    subject: {
      _id: "",
      name: "",
      description: "",
      isRequired: false,
      topicsOrder: [],
      questions: [],
    },
    dirty: false,
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);

  React.useEffect(() => {
    if (!cookies.accessToken) {
      navigate("/login");
    }
  }, [cookies]);

  React.useEffect(() => {
    if (props.search.id) {
      loadSubject(props.search.id);
    }
  }, []);

  async function loadSubject(id: string) {
    setSubjectEdit({ subject: await fetchSubject(id), dirty: false });
  }

  function editSubject(subject: Subject) {
    setSubjectEdit({ subject, dirty: true });
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
      await loadSubject(updated._id);
      setIsSaving(false);
    } catch (err) {
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

  return (
    <div className={classes.root}>
      <NavBar title="Edit Subject" />
      <div className={classes.flexFixedChild}>
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
            editSubject({ ...subjectEdit.subject, description: e.target.value })
          }
          variant="outlined"
        />
      </div>
      <TopicsOrderList
        classes={classes}
        subject={subjectEdit.subject}
        updateTopics={(ts: Topic[]) =>
          editSubject({
            ...subjectEdit.subject,
            topicsOrder: ts,
          })
        }
      />
      <QuestionsList
        classes={classes}
        questions={subjectEdit.subject.questions || []}
        updateQuestions={(qs: Question[]) =>
          editSubject({
            ...subjectEdit.subject,
            questions: qs,
          })
        }
      />
      <div className={classes.flexFixedChild}>
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
