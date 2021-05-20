/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState } from "react";
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

import NavBar from "components/nav-bar";
import QuestionsList from "components/author/questions-list";
import TopicsList from "components/author/topics-list";
import withLocation from "hooks/wrap-with-location";
import withAuthorizationOnly from "hooks/wrap-with-authorization-only";
import { useWithWindowSize } from "hooks/use-with-window-size";
import { useWithMentor } from "hooks/graphql/use-with-mentor";
import { useWithSubject } from "hooks/graphql/use-with-subject";
import { ErrorDialog, LoadingDialog } from "components/dialog";

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

function SubjectPage(props: {
  accessToken: string;
  search: { id?: string };
}): JSX.Element {
  const classes = useStyles();
  const [isSubjectInfoExpanded, setIsSubjectInfoExpanded] = useState(true);
  const [isTopicsExpanded, setIsTopicsExpanded] = useState(false);
  const [isQuestionsExpanded, setIsQuestionsExpanded] = useState(false);

  const { mentor, isMentorLoading } = useWithMentor(props.accessToken);
  const {
    editedSubject,
    subjectError,
    isSubjectEdited,
    isSubjectLoading,
    isSubjectSaving,
    clearSubjectError,
    saveSubject,
    editSubject,
    addCategory,
    updateCategory,
    removeCategory,
    addTopic,
    updateTopic,
    removeTopic,
    moveTopic,
    addQuestion,
    updateQuestion,
    removeQuestion,
    moveQuestion,
  } = useWithSubject(props.search.id || "", props.accessToken);
  const { windowHeight } = useWithWindowSize();

  function toggleExpand(s: boolean, t: boolean, q: boolean) {
    setIsSubjectInfoExpanded(s);
    setIsTopicsExpanded(t);
    setIsQuestionsExpanded(q);
  }

  if (!mentor || !editedSubject) {
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
      <NavBar title="Edit Subject" mentorId={mentor._id} />
      <Card
        elevation={0}
        className={classes.flexChild}
        style={{ maxHeight: maxChildHeight }}
      >
        <div className={classes.row}>
          <IconButton
            data-cy="toggle-info"
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
              data-cy="subject-name"
              variant="outlined"
              label="Subject Name"
              placeholder="Display name for the subject"
              value={editedSubject.name}
              onChange={(e) => editSubject({ name: e.target.value })}
              style={{ marginTop: 20, marginBottom: 20 }}
              fullWidth
              multiline
            />
            <TextField
              data-cy="subject-description"
              variant="outlined"
              label="Subject Description"
              placeholder="Description about the types of questions in the subject"
              value={editedSubject.description}
              onChange={(e) => editSubject({ description: e.target.value })}
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
        topics={editedSubject.topics}
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
        categories={editedSubject.categories}
        questions={editedSubject.questions.filter(
          (q) => !q.question.mentor || q.question.mentor === mentor._id
        )}
        topics={editedSubject.topics}
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
          data-cy="save-button"
          variant="contained"
          color="primary"
          className={classes.button}
          disabled={!isSubjectEdited}
          onClick={() => saveSubject()}
        >
          Save
        </Button>
      </div>
      <LoadingDialog
        title={
          isMentorLoading || isSubjectLoading
            ? "Loading"
            : isSubjectSaving
            ? "Saving"
            : ""
        }
      />
      <ErrorDialog error={subjectError} clearError={clearSubjectError} />
    </div>
  );
}

export default withAuthorizationOnly(withLocation(SubjectPage));
