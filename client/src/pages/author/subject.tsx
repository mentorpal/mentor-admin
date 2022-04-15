/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState } from "react";
import {
  Button,
  CircularProgress,
  ListItemText,
  Tab,
  TextField,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Autocomplete, TabContext, TabList, TabPanel } from "@material-ui/lab";

import NavBar from "components/nav-bar";
import QuestionsList from "components/author/questions-list";
import TopicsList from "components/author/topics-list";
import withLocation from "wrap-with-location";
import withAuthorizationOnly from "hooks/wrap-with-authorization-only";
import { useActiveMentor } from "store/slices/mentor/useActiveMentor";
import { useWithSubject } from "hooks/graphql/use-with-subject";
import { ErrorDialog, LoadingDialog } from "components/dialog";
import { onTextInputChanged } from "helpers";
import { useWithWindowSize } from "hooks/use-with-window-size";
import { SubjectTypes } from "types";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: 0,
  },
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  tab: {
    width: "95%",
  },
  button: {
    width: 200,
    margin: theme.spacing(2),
  },
  list: {
    background: "#F5F5F5",
  },
}));

function SubjectPage(props: {
  accessToken: string;
  search: { id?: string };
}): JSX.Element {
  const classes = useStyles();
  const [tab, setTab] = useState<string>("1");
  const { getData, isLoading: isMentorLoading } = useActiveMentor();
  const mentorId = getData((state) => state.data?._id);
  const {
    editedData: editedSubject,
    error: subjectError,
    isEdited: isSubjectEdited,
    isLoading: isSubjectLoading,
    isSaving: isSubjectSaving,
    editData: editSubject,
    saveSubject,
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
  const { height: windowHeight } = useWithWindowSize();

  if (!mentorId || !editedSubject) {
    return (
      <div>
        <NavBar title="Edit Subject" />
        <CircularProgress />
      </div>
    );
  }

  const isUtteranceSubject =
    editedSubject.type === SubjectTypes.UTTERANCE_GROUP;

  return (
    <div className={classes.root}>
      <NavBar title="Edit Subject" mentorId={mentorId} />
      <TabContext value={tab}>
        <TabList onChange={(event, newValue) => setTab(newValue)}>
          <Tab label="Subject Info" value="1" data-cy="toggle-info" />
          <Tab
            label="Topics"
            style={{ display: isUtteranceSubject ? "none" : "block" }}
            value="2"
            data-cy="toggle-topics"
          />
          <Tab label="Questions" value="3" data-cy="toggle-questions" />
        </TabList>
        <TabPanel
          className={classes.tab}
          style={{ height: windowHeight - 450, overflow: "auto" }}
          value="1"
        >
          <TextField
            data-cy="subject-name"
            variant="outlined"
            label="Subject Name"
            placeholder="Display name for the subject"
            value={editedSubject.name}
            onChange={(e) =>
              onTextInputChanged(e, () => {
                editSubject({ name: e.target.value });
              })
            }
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
            onChange={(e) =>
              onTextInputChanged(e, () => {
                editSubject({ description: e.target.value });
              })
            }
            fullWidth
            multiline
          />
          <Autocomplete
            data-cy="subject-type-map"
            style={{ marginTop: "15px" }}
            options={Object.values(SubjectTypes)}
            getOptionLabel={(option: string) => option}
            onChange={(e, v) => {
              if (v) {
                console.log("editing data to have type");
                editSubject({ type: v });
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                style={{ width: 300 }}
                variant="outlined"
                placeholder={editedSubject.type || SubjectTypes.TOPIC_GROUP}
              />
            )}
            renderOption={(option) => <ListItemText primary={option} />}
          />
        </TabPanel>
        <TabPanel className={classes.tab} value="2">
          <TopicsList
            classes={classes}
            topics={editedSubject.topics}
            addTopic={addTopic}
            editTopic={updateTopic}
            removeTopic={removeTopic}
            moveTopic={moveTopic}
          />
        </TabPanel>
        <TabPanel className={classes.tab} value="3">
          <QuestionsList
            classes={classes}
            categories={editedSubject.categories}
            questions={editedSubject.questions.filter(
              (q) =>
                q.question &&
                (!q.question.mentor || q.question.mentor === mentorId)
            )}
            topics={editedSubject.topics}
            addCategory={addCategory}
            editCategory={updateCategory}
            removeCategory={removeCategory}
            addQuestion={addQuestion}
            editQuestion={updateQuestion}
            removeQuestion={removeQuestion}
            moveQuestion={moveQuestion}
          />
        </TabPanel>
      </TabContext>
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
      <LoadingDialog
        title={
          isMentorLoading || isSubjectLoading
            ? "Loading"
            : isSubjectSaving
            ? "Saving"
            : ""
        }
      />
      <ErrorDialog error={subjectError} />
    </div>
  );
}

export default withAuthorizationOnly(withLocation(SubjectPage));
