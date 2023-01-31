/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import {
  AppBar,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  List,
  ListSubheader,
  Toolbar,
  Typography,
  Theme,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import CloseIcon from "@mui/icons-material/Close";
import { useWithSubjects } from "hooks/graphql/use-with-subjects";
import { UseWithImportExport } from "hooks/graphql/use-with-import-export";
import SubjectImport from "./import-subject";
import AnswerImport from "./import-answer";
import { LoadingDialog } from "components/dialog";
import { EditType } from "types";

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: 0,
  },
  list: {
    width: "90%",
    background: "#F5F5F5",
  },
  toolbar: theme.mixins.toolbar,
}));

export default function ImportView(props: {
  useImportExport: UseWithImportExport;
  mentorName: string;
  mentorId: string;
}): JSX.Element {
  const classes = useStyles();
  const {
    importedJson,
    importPreview,
    onCancelImport: cancelImport,
    onConfirmImport: confirmImport,
    onMapSubject: mapSubject,
    onMapQuestion: mapQuestion,
    onMapCategory: mapCategory,
    onMapTopic: mapTopic,
    onSaveSubjectName: saveSubjectName,
    oldQuestionsToRemove,
    toggleRemoveOldAnswer,
    oldAnswersToRemove,
    onToggleRemoveAllOldAnswers,
    onReplaceNewAnswer: replaceNewAnswer,
    toggleRemoveOldFollowup: toggleRemoveOldFollowup,
    onMapQuestionToSubject: mapQuestionToSubject,
    onMapSubjectType,
    onMapQuestionType,
    isUpdating,
    onToggleReplaceEntireMentor: replaceEntireMentor,
  } = props.useImportExport;
  const { data: subjects } = useWithSubjects();
  const { mentorName, mentorId } = props;
  if (!importedJson || !importPreview) {
    return <LoadingDialog title={isUpdating ? "Loading..." : ""} />;
  }

  const newAnswers = importPreview?.answers?.filter(
    (a) => a.editType === EditType.ADDED || a.editType === EditType.CREATED
  );

  const changedAnswers = importPreview?.answers?.filter(
    (a) => a.editType === EditType.NONE
  );

  const oldAnswers = importPreview?.answers?.filter(
    (a) => a.editType === EditType.OLD_ANSWER
  );
  return (
    <Dialog fullScreen open={Boolean(importPreview)} onClose={cancelImport}>
      <AppBar>
        <Toolbar>
          <IconButton
            data-cy="cancel-import"
            edge="start"
            color="inherit"
            aria-label="close"
            onClick={cancelImport}
            size="large"
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" style={{ flex: 1 }}>
            Confirm Import?
          </Typography>
          <Button
            data-cy="confirm-import"
            autoFocus
            color="inherit"
            onClick={confirmImport}
          >
            Confirm
          </Button>
        </Toolbar>
      </AppBar>
      <div className={classes.toolbar} /> {/* create space below app bar */}
      <DialogContent className={classes.root}>
        <Typography data-cy="mentor-name">
          <span>
            Mentor being replaced: {<br />}
            {mentorName ? `Name: ${mentorName}` : ""} {<br />}
            {mentorId ? `Mentor ID: ${mentorId}` : ""}
          </span>
        </Typography>
        <Button
          data-cy="remove-all-old-mentor-data"
          style={{
            backgroundColor: "#ff8080",
            padding: "3px",
            fontWeight: "bold",
            borderRadius: "10px",
          }}
          onClick={() => replaceEntireMentor()}
        >
          Toggle Remove All Previous Mentor Data
        </Button>
        <Typography style={{ marginBottom: 10 }}>
          The following changes will be made to your mentor if you import this
          JSON:
        </Typography>
        <List
          data-cy="subjects"
          className={classes.list}
          subheader={<ListSubheader>My Subjects</ListSubheader>}
        >
          {importPreview?.subjects?.map((s, i) => {
            return (
              <SubjectImport
                key={`subject-${i}`}
                preview={s}
                subjects={subjects?.edges.map((e) => e.node) || []}
                mapSubject={mapSubject}
                mapQuestion={mapQuestion}
                mapCategory={mapCategory}
                toggleRemoveOldFollowup={toggleRemoveOldFollowup}
                oldQuestionsToRemove={oldQuestionsToRemove}
                mapTopic={mapTopic}
                onMapSubjectType={onMapSubjectType}
                onMapQuestionType={onMapQuestionType}
                mapQuestionToSubject={mapQuestionToSubject}
                saveSubjectName={saveSubjectName}
                previewQuestions={importPreview.questions}
              />
            );
          })}
        </List>
        <p />
        <List data-cy="answers" className={classes.list}>
          <List data-cy="changed-answers">
            Changed Answers
            {changedAnswers.map((a, i) => {
              return (
                <AnswerImport
                  key={`answer-${i}`}
                  preview={a}
                  oldAnswersToRemove={oldAnswersToRemove}
                  toggleRemoveOldAnswer={toggleRemoveOldAnswer}
                  replaceNewAnswer={replaceNewAnswer}
                />
              );
            })}
          </List>
          <List data-cy="old-answers">
            Old Answers
            {
              <Button
                style={{
                  position: "absolute",
                  right: 50,
                  top: 0,
                  padding: "5px",
                  backgroundColor: "lightblue",
                  fontWeight: "bold",
                }}
                onClick={() => onToggleRemoveAllOldAnswers()}
              >
                Toggle All
              </Button>
            }
            {oldAnswers.map((a, i) => {
              return (
                <AnswerImport
                  key={`answer-${i}`}
                  preview={a}
                  oldAnswersToRemove={oldAnswersToRemove}
                  toggleRemoveOldAnswer={toggleRemoveOldAnswer}
                  replaceNewAnswer={replaceNewAnswer}
                />
              );
            })}
          </List>
          <List data-cy="new-answers">
            New Answers
            {newAnswers.map((a, i) => {
              return (
                <AnswerImport
                  key={`answer-${i}`}
                  preview={a}
                  oldAnswersToRemove={oldAnswersToRemove}
                  toggleRemoveOldAnswer={toggleRemoveOldAnswer}
                  replaceNewAnswer={replaceNewAnswer}
                />
              );
            })}
          </List>
        </List>
      </DialogContent>
      <LoadingDialog title={isUpdating ? "Loading..." : ""} />
    </Dialog>
  );
}
