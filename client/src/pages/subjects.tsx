/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { navigate } from "@reach/router";
import React from "react";
import {
  AppBar,
  Checkbox,
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

import ButtonGroupDropdown from "components/ButtonGroupDropdown";
import { ColumnDef, ColumnHeader } from "components/column-header";
import { LoadingDialog, ErrorDialog } from "components/dialog";
import NavBar from "components/nav-bar";
import { copyAndRemove } from "helpers";
import { useWithSubjects } from "hooks/graphql/use-with-subjects";
import withAuthorizationOnly from "hooks/wrap-with-authorization-only";
import useActiveMentor, {
  isActiveMentorLoading,
  isActiveMentorSaving,
} from "store/slices/mentor/useActiveMentor";
import { useMentorEdits } from "store/slices/mentor/useMentorEdits";
import withLocation from "wrap-with-location";
import { SubjectGQL } from "types-gql";

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

function SubjectsPage(props: {
  search: {
    back?: string;
  };
}): JSX.Element {
  const classes = useStyles();
  const mentorError = useActiveMentor((state) => state.error);
  const isMentorLoading = isActiveMentorLoading();
  const isMentorSaving = isActiveMentorSaving();

  const { editedMentor, isMentorEdited, editMentor, saveMentorSubjects } =
    useMentorEdits();
  const {
    data: subjects,
    isLoading: isSubjectsLoading,
    searchParams: subjectSearchParams,
    error: subjectsError,
    sortBy: subjectsSortBy,
    nextPage: subjectsNextPage,
    prevPage: subjectsPrevPage,
  } = useWithSubjects();

  function toggleSubject(subject: SubjectGQL) {
    if (!editedMentor) {
      return;
    }
    const i = editedMentor.subjects.findIndex((s) => s === subject._id);
    editMentor({
      subjects:
        i === -1
          ? [...editedMentor.subjects, subject._id]
          : copyAndRemove(editedMentor.subjects, i),
      defaultSubject:
        editedMentor.defaultSubject === subject._id
          ? undefined
          : editedMentor.defaultSubject,
    });
  }

  function toggleDefaultSubject(subject: SubjectGQL) {
    if (!editedMentor) {
      return;
    }
    editMentor({
      defaultSubject:
        editedMentor.defaultSubject === subject._id ? undefined : subject._id,
    });
  }

  const onBack = () => {
    props.search.back ? navigate(decodeURI(props.search.back)) : navigate("/");
  };

  return (
    <div>
      <NavBar title="Subjects" mentor={editedMentor?._id} onBack={onBack} />
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
                {subjects?.edges.map((edge, i) => {
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
                            editedMentor?.subjects.find(
                              (s) => s === subject._id
                            ) !== undefined
                          }
                          disabled={subject.isRequired}
                          color="primary"
                          onClick={() => toggleSubject(subject)}
                        />
                      </TableCell>
                      <TableCell data-cy="default" align="center">
                        <Checkbox
                          checked={subject._id === editedMentor?.defaultSubject}
                          disabled={
                            editedMentor?.subjects.find(
                              (s) => s === subject._id
                            ) === undefined
                          }
                          color="secondary"
                          onClick={() => toggleDefaultSubject(subject)}
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
              disabled={!subjects?.pageInfo.hasPreviousPage}
              onClick={subjectsPrevPage}
            >
              <KeyboardArrowLeftIcon />
            </IconButton>
            <IconButton
              data-cy="next-page"
              disabled={!subjects?.pageInfo.hasNextPage}
              onClick={subjectsNextPage}
            >
              <KeyboardArrowRightIcon />
            </IconButton>
          </Toolbar>
          <ButtonGroupDropdown
            styles={{ position: "absolute", top: "25%", right: 10 }}
            dropdownItems={[
              {
                title: "Exit",
                onClick: onBack,
                becomePrimary: !isMentorEdited,
              },
              {
                title: "Save",
                onClick: saveMentorSubjects,
                disabled: !isMentorEdited,
                becomePrimary: isMentorEdited,
              },
            ]}
          />
        </AppBar>
      </div>
      <LoadingDialog
        title={
          isMentorLoading || isSubjectsLoading
            ? "Loading..."
            : isMentorSaving
            ? "Saving..."
            : ""
        }
      />
      <ErrorDialog error={mentorError || subjectsError} />
    </div>
  );
}

export default withAuthorizationOnly(withLocation(SubjectsPage));
