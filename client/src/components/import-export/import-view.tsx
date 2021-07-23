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
  Slide,
  Toolbar,
  Typography,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { MentorExportJson } from "types";
import SubjectImport from "./import-subject";
import AnswerImport from "./import-answer";

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

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function ImportView(props: {
  exportedJson?: MentorExportJson;
  importedJson?: MentorExportJson;
  cancelImport: () => void;
  confirmImport: () => void;
}): JSX.Element {
  const classes = useStyles();
  const { exportedJson, importedJson, cancelImport, confirmImport } = props;

  if (importedJson === undefined) {
    return <div />;
  }
  return (
    <Dialog
      fullScreen
      open={Boolean(importedJson)}
      onClose={cancelImport}
      TransitionComponent={Transition}
    >
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
          {importedJson?.subjects?.map((s, i) => {
            const curSubject = exportedJson?.subjects?.find(
              (sub) => s._id === sub._id
            );
            return (
              <SubjectImport
                key={`subject-${i}`}
                subject={s}
                curSubject={curSubject}
              />
            );
          })}
          {exportedJson?.subjects
            ?.filter(
              (ss) =>
                !importedJson?.subjects?.map((s) => s._id).includes(ss._id)
            )
            .map((s, i) => {
              return (
                <SubjectImport
                  key={`subject-${i}`}
                  subject={undefined}
                  curSubject={s}
                />
              );
            })}
        </List>
        <p />
        <List
          data-cy="answer"
          className={classes.list}
          subheader={<ListSubheader>My Answers</ListSubheader>}
        >
          {importedJson?.answers?.map((a, i) => {
            const curAnswer = exportedJson?.answers?.find(
              (ans) => a._id === ans._id
            );
            return (
              <AnswerImport
                key={`answer-${i}`}
                answer={a}
                curAnswer={curAnswer}
              />
            );
          })}
        </List>
      </DialogContent>
    </Dialog>
  );
}
