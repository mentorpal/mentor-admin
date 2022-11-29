/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useState } from "react";
import {
  AppBar,
  Checkbox,
  IconButton,
  Paper,
  Switch,
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

import { Subject, SubjectTypes, UserRole } from "types";
import { ColumnDef, ColumnHeader } from "components/column-header";
import { ErrorDialog, LoadingDialog } from "components/dialog";
import NavBar from "components/nav-bar";
import withAuthorizationOnly from "hooks/wrap-with-authorization-only";
import { useWithSubjects } from "hooks/graphql/use-with-subjects";
import { copyAndRemove } from "helpers";
import { navigate } from "gatsby";
import withLocation from "wrap-with-location";
import { useMentorEdits } from "store/slices/mentor/useMentorEdits";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import ButtonGroupDropdown from "components/ButtonGroupDropdown";
import { convertSubjectGQL } from "types-gql";
import { useWithLogin } from "store/slices/login/useWithLogin";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexFlow: "column",
    height: "100vh",
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
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  const {
    isLoading: isMentorLoading,
    isSaving: isMentorSaving,
    error: mentorError,
  } = useActiveMentor();
  const [viewUtteranceSubjects, setViewUtteranceSubjects] =
    useState<boolean>(false);
  const { state } = useWithLogin();
  const canManageContent =
    state.user?.userRole === UserRole.ADMIN ||
    state.user?.userRole === UserRole.CONTENT_MANAGER;
  const [viewArchivedSubjects, setViewArchivedSubjects] =
    useState<boolean>(false);
  const { editedMentor, isMentorEdited, editMentor, saveMentorSubjects } =
    useMentorEdits();
  const mentorSubjectIds =
    editedMentor?.subjects.map((subject) => subject._id) || [];
  const {
    pageData: subjects,
    isLoading: isSubjectsLoading,
    searchParams: subjectSearchParams,
    error: subjectsError,
    sortBy: subjectsSortBy,
    nextPage: subjectsNextPage,
    prevPage: subjectsPrevPage,
    filter: filterSubjects,
  } = useWithSubjects();

  useEffect(() => {
    if (viewArchivedSubjects) {
      filterSubjects({
        type: viewUtteranceSubjects
          ? SubjectTypes.UTTERANCES
          : SubjectTypes.SUBJECT,
      });
    } else {
      filterSubjects({
        $and: [
          {
            type: viewUtteranceSubjects
              ? SubjectTypes.UTTERANCES
              : SubjectTypes.SUBJECT,
          },
          { $or: [{ isArchived: false }, { _id: { $in: mentorSubjectIds } }] },
        ],
      });
    }
  }, [viewArchivedSubjects, viewUtteranceSubjects, mentorSubjectIds.length]);

  function toggleSubject(subject: Subject) {
    if (!editedMentor) {
      return;
    }
    const i = editedMentor.subjects.findIndex((s) => s._id === subject._id);
    editMentor({
      subjects:
        i === -1
          ? [...editedMentor.subjects, subject]
          : copyAndRemove(editedMentor.subjects, i),
      defaultSubject:
        editedMentor.defaultSubject?._id === subject._id
          ? undefined
          : editedMentor.defaultSubject,
    });
  }

  function toggleDefaultSubject(subject: Subject) {
    if (!editedMentor) {
      return;
    }
    editMentor({
      defaultSubject:
        editedMentor.defaultSubject?._id === subject._id ? undefined : subject,
    });
  }

  function onToggleViewArchivedSubjects(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setViewArchivedSubjects(event.target.checked);
  }

  function onToggleViewSubjectType(event: React.ChangeEvent<HTMLInputElement>) {
    setViewUtteranceSubjects(event.target.checked);
  }

  const onBack = () => {
    props.search.back ? navigate(decodeURI(props.search.back)) : navigate("/");
  };

  const label = { inputProps: { "aria-label": "Switch demo" } };
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
                        {subject.isArchived ? (
                          <span style={{ color: "orangered" }}>
                            <i> Archived</i>
                          </span>
                        ) : undefined}
                      </TableCell>
                      <TableCell data-cy="description" align="left">
                        {subject.description}
                      </TableCell>
                      <TableCell data-cy="select" align="center">
                        <Checkbox
                          checked={
                            editedMentor?.subjects.find(
                              (s) => s._id === subject._id
                            ) !== undefined
                          }
                          disabled={subject.isRequired}
                          color="primary"
                          onClick={() =>
                            toggleSubject(convertSubjectGQL(subject))
                          }
                        />
                      </TableCell>
                      <TableCell data-cy="default" align="center">
                        <Checkbox
                          checked={
                            subject._id === editedMentor?.defaultSubject?._id
                          }
                          disabled={
                            editedMentor?.subjects.find(
                              (s) => s._id === subject._id
                            ) === undefined
                          }
                          color="secondary"
                          onClick={() =>
                            toggleDefaultSubject(convertSubjectGQL(subject))
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
          <Toolbar style={{ width: "fit-content" }}>
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
          {canManageContent ? (
            <span style={{ margin: "15px" }}>
              <span>
                View Archived Subjects
                <Switch
                  data-cy="archived-subject-view-switch"
                  onChange={onToggleViewArchivedSubjects}
                />
              </span>
            </span>
          ) : undefined}
          <span style={{ margin: "15px" }}>
            <span>
              Subjects
              <Switch
                data-cy="subject-type-switch"
                {...label}
                onChange={onToggleViewSubjectType}
              />
              Utterances
            </span>
          </span>
          <ButtonGroupDropdown
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
