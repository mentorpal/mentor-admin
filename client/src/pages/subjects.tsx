/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import {
  AppBar,
  Checkbox,
  CircularProgress,
  Fab,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Toolbar,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";

import { ColumnDef, ColumnHeader } from "components/column-header";
import NavBar from "components/nav-bar";
import withAuthorizationOnly from "hooks/wrap-with-authorization-only";
import { useWithMentor } from "hooks/graphql/use-with-mentor";
import { useWithSubjects } from "hooks/graphql/use-with-subjects";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexFlow: "column",
  },
  container: {
    flex: 1,
    flexGrow: 1,
  },
  button: {
    margin: theme.spacing(1),
  },
  appBar: {
    height: "10%",
    top: "auto",
    bottom: 0,
  },
  fab: {
    position: "absolute",
    right: theme.spacing(1),
    zIndex: 1,
    width: 100,
  },
}));

const columns: ColumnDef[] = [
  {
    id: "name",
    label: "Name",
    minWidth: 200,
    align: "left",
    sortable: true,
  },
  {
    id: "description",
    label: "Description",
    minWidth: 200,
    align: "left",
    sortable: true,
  },
  {
    id: "select",
    label: "Add subject?",
    minWidth: 0,
    align: "center",
    sortable: false,
  },
  {
    id: "default",
    label: "Set to primary?",
    minWidth: 0,
    align: "center",
    sortable: false,
  },
];

function SubjectsPage(props: { accessToken: string }): JSX.Element {
  const classes = useStyles();
  const {
    editedMentor,
    isMentorLoading,
    isMentorSaving,
    editMentor,
    saveMentor,
  } = useWithMentor(props.accessToken);
  const {
    subjects,
    isSubjectsLoading,
    subjectSearchParams,
    sortSubjects: subjectsSortBy,
    subjectsNextPage,
    subjectsPrevPage,
  } = useWithSubjects();

  if (
    !editedMentor ||
    isMentorLoading ||
    isMentorSaving ||
    !subjects ||
    isSubjectsLoading
  ) {
    return (
      <div>
        <NavBar title="Subjects" mentor={editedMentor?._id} />
        <CircularProgress />
      </div>
    );
  }

  return (
    <div>
      <NavBar title="Subjects" mentor={editedMentor._id} />
      <div className={classes.root}>
        <Paper className={classes.container}>
          <TableContainer>
            <Table stickyHeader aria-label="sticky table">
              <ColumnHeader
                columns={columns}
                sortBy={subjectSearchParams.sortBy}
                sortAsc={subjectSearchParams.sortAscending}
                onSort={subjectsSortBy}
              />
              <TableBody data-cy="subjects">
                {subjects.edges.map((edge, i) => {
                  const subject = edge.node;
                  return (
                    <TableRow
                      data-cy={`subject-${i}`}
                      key={`${subject._id}`}
                      hover
                      role="checkbox"
                      tabIndex={-1}
                    >
                      <TableCell data-cy="name" align="left">
                        {subject.name}
                      </TableCell>
                      <TableCell data-cy="description" align="left">
                        {subject.description}
                      </TableCell>
                      <TableCell data-cy="select" align="center">
                        <Checkbox
                          checked={
                            editedMentor.subjects.find(
                              (s) => s._id === subject._id
                            ) !== undefined
                          }
                          disabled={subject.isRequired}
                          color="primary"
                          onClick={() => {
                            const i = editedMentor.subjects.findIndex(
                              (s) => s._id === subject._id
                            );
                            if (i === -1) {
                              editedMentor.subjects.push(subject);
                            } else {
                              editedMentor.subjects.splice(i, 1);
                            }
                            editMentor({
                              subjects: editedMentor.subjects,
                              defaultSubject:
                                editedMentor.defaultSubject?._id === subject._id
                                  ? undefined
                                  : editedMentor.defaultSubject,
                            });
                          }}
                        />
                      </TableCell>
                      <TableCell data-cy="default" align="center">
                        <Checkbox
                          checked={
                            subject._id === editedMentor.defaultSubject?._id
                          }
                          disabled={
                            editedMentor.subjects.find(
                              (s) => s._id === subject._id
                            ) === undefined
                          }
                          color="secondary"
                          onClick={() =>
                            editMentor({
                              defaultSubject:
                                editedMentor.defaultSubject?._id === subject._id
                                  ? undefined
                                  : subject,
                            })
                          }
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        <AppBar position="sticky" color="default" className={classes.appBar}>
          <Toolbar>
            <IconButton
              data-cy="prev-page"
              disabled={!subjects.pageInfo.hasPreviousPage}
              onClick={subjectsPrevPage}
            >
              <KeyboardArrowLeftIcon />
            </IconButton>
            <IconButton
              data-cy="next-page"
              disabled={!subjects.pageInfo.hasNextPage}
              onClick={subjectsNextPage}
            >
              <KeyboardArrowRightIcon />
            </IconButton>
            <Fab
              data-cy="save-button"
              variant="extended"
              color="primary"
              className={classes.fab}
              onClick={saveMentor}
            >
              Save
            </Fab>
          </Toolbar>
        </AppBar>
      </div>
    </div>
  );
}

export default withAuthorizationOnly(SubjectsPage);
