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
  makeStyles,
  Toolbar,
  Typography,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { useWithSubjects } from "hooks/graphql/use-with-subjects";
import { UseWithImportExport } from "hooks/graphql/use-with-import-export";
import SubjectImport from "./import-subject";
import AnswerImport from "./import-answer";
import { LoadingDialog } from "components/dialog";

const useStyles = makeStyles((theme) => ({
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
}): JSX.Element {
  const classes = useStyles();
  const {
    importedJson,
    importPreview,
    onCancelImport: cancelImport,
    onConfirmImport: confirmImport,
    onMapSubject: mapSubject,
    onMapQuestion: mapQuestion,
    isUpdating,
  } = props.useImportExport;
  const { data: subjects } = useWithSubjects();

  if (!importedJson || !importPreview) {
    return <LoadingDialog title={isUpdating ? "Loading..." : ""} />;
  }

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
                previewQuestions={importPreview.questions}
              />
            );
          })}
        </List>
        <p />
        <List
          data-cy="answers"
          className={classes.list}
          subheader={<ListSubheader>My Answers</ListSubheader>}
        >
          {importPreview?.answers?.map((a, i) => {
            return <AnswerImport key={`answer-${i}`} preview={a} />;
          })}
        </List>
      </DialogContent>
      <LoadingDialog title={isUpdating ? "Loading..." : ""} />
    </Dialog>
  );
}
