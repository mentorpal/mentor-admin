/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Link, navigate } from "gatsby";
import React, { useEffect, useState } from "react";
import {
  AppBar,
  Fab,
  IconButton,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Toolbar,
  Theme,
} from "@mui/material";
import { makeStyles } from "tss-react/mui";
import AddIcon from "@mui/icons-material/Add";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";

import { Subject } from "types";
import { ColumnDef, ColumnHeader } from "components/column-header";
import NavBar from "components/nav-bar";
import withAuthorizationOnly from "hooks/wrap-with-authorization-only";
import { useWithSubjects } from "hooks/graphql/use-with-subjects";
import { useActiveMentor } from "store/slices/mentor/useActiveMentor";
import { LoadingDialog, ErrorDialog } from "components/dialog";
import { convertSubjectGQL } from "types-gql";
import { useWithLogin } from "store/slices/login/useWithLogin";
import { canEditContent } from "helpers";

const useStyles = makeStyles({ name: { SubjectsPage } })((theme: Theme) => ({
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
  },
  progress: {
    marginLeft: "50%",
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
];

function SubjectItem(props: { subject: Subject }): JSX.Element {
  const { subject } = props;

  return (
    <TableRow
      data-cy={`subject-${subject._id}`}
      hover
      role="checkbox"
      tabIndex={-1}
    >
      <TableCell data-cy="name" align="left">
        <Link to={`/author/subject?id=${subject._id}`}>{subject.name}</Link>
        {subject.isArchived ? (
          <span style={{ color: "orangered" }}>
            <i> Archived</i>
          </span>
        ) : undefined}
      </TableCell>
      <TableCell data-cy="description" align="left">
        {subject.description}
      </TableCell>
    </TableRow>
  );
}

function SubjectsPage(): JSX.Element {
  const { classes } = useStyles();
  const {
    getData,
    switchActiveMentor,
    isLoading: isMentorLoading,
    error: mentorError,
  } = useActiveMentor();
  const [viewArchivedSubjects, setViewArchivedSubjects] =
    useState<boolean>(false);
  const { state } = useWithLogin();
  const canManageContent = canEditContent(state.user);
  const mentorId = getData((state) => state.data?._id);
  const mentorSubjects: Subject[] =
    getData((state) => state.data?.subjects) || [];
  const mentorSubjectIds = mentorSubjects.map(
    (mentorSubject) => mentorSubject._id
  );
  const {
    pageData: subjects,
    error: subjectsError,
    isLoading: isSubjectsLoading,
    searchParams: subjectSearchParams,
    sortBy: subjectsSortBy,
    nextPage: subjectsNextPage,
    prevPage: subjectsPrevPage,
    setPreFilter,
    setPostSort,
  } = useWithSubjects();

  useEffect(() => {
    if (!state || canManageContent) return;
    switchActiveMentor();
  }, [state]);

  useEffect(() => {
    if (viewArchivedSubjects) {
      setPreFilter();
      setPostSort({
        sort: (a, b) => {
          if (a.isArchived === b.isArchived) {
            return 0;
          }
          if (a.isArchived) {
            return 1;
          }
          return -1;
        },
      });
    } else {
      setPreFilter({
        filter: (s) => !s.isArchived || mentorSubjectIds.includes(s._id),
      });
      setPostSort();
    }
  }, [viewArchivedSubjects, mentorSubjectIds.length]);

  function onToggleViewArchivedSubjects(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setViewArchivedSubjects(event.target.checked);
  }

  return (
    <div>
      <NavBar title="Subjects" mentorId={mentorId} />
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
                {subjects?.edges.map((row, i) => (
                  <SubjectItem
                    key={`subject-${i}`}
                    subject={convertSubjectGQL(row.node)}
                  />
                ))}
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
              size="large"
            >
              <KeyboardArrowLeftIcon />
            </IconButton>
            <IconButton
              data-cy="next-page"
              disabled={!subjects?.pageInfo.hasNextPage}
              onClick={subjectsNextPage}
              size="large"
            >
              <KeyboardArrowRightIcon />
            </IconButton>
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
            <Fab
              data-cy="create-button"
              variant="extended"
              color="primary"
              className={classes.fab}
              onClick={() => navigate(`/author/subject`)}
            >
              <AddIcon />
              Create Subject
            </Fab>
          </Toolbar>
        </AppBar>
        <LoadingDialog
          title={isMentorLoading || isSubjectsLoading ? "Loading" : ""}
        />
        <ErrorDialog error={mentorError || subjectsError} />
      </div>
    </div>
  );
}

export default withAuthorizationOnly(SubjectsPage);
