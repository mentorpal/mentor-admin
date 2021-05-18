/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Link, navigate } from "gatsby";
import React from "react";
import {
  AppBar,
  CircularProgress,
  Fab,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Toolbar,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";

import { Subject } from "types";
import { ColumnDef, ColumnHeader } from "components/column-header";
import NavBar from "components/nav-bar";
import withAuthorizationOnly from "hooks/wrap-with-authorization-only";
import { useWithSubjects } from "hooks/graphql/use-with-subjects";
import { useWithMentor } from "hooks/graphql/use-with-mentor";
import { LoadingDialog, ErrorDialog } from "components/dialog";

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
  {
    id: "delete",
    label: "Delete",
    minWidth: 0,
    align: "center",
    sortable: false,
  },
];

function SubjectItem(props: {
  subject: Subject;
  onDelete: (id: string) => void;
}): JSX.Element {
  const { subject, onDelete } = props;
  const [anchorEl, setAnchorEl] = React.useState<
    EventTarget & HTMLButtonElement
  >();
  const deleteMenuOpen = Boolean(anchorEl);

  function onClickDelete(e: React.MouseEvent<HTMLButtonElement>) {
    setAnchorEl(e.currentTarget);
  }

  function onCloseDelete() {
    setAnchorEl(undefined);
  }

  async function deleteSubject(id: string) {
    setAnchorEl(undefined);
    onDelete(id);
  }

  return (
    <TableRow
      data-cy={`subject-${subject._id}`}
      hover
      role="checkbox"
      tabIndex={-1}
    >
      <TableCell data-cy="name" align="left">
        <Link to={`/author/subject?id=${subject._id}`}>{subject.name}</Link>
      </TableCell>
      <TableCell data-cy="description" align="left">
        {subject.description}
      </TableCell>
      <TableCell data-cy="delete" align="center">
        <IconButton onClick={onClickDelete}>
          <DeleteIcon />
        </IconButton>
      </TableCell>
      <Menu
        data-cy="delete-menu"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={deleteMenuOpen}
        onClose={onCloseDelete}
      >
        <MenuItem
          data-cy="confirm-delete"
          onClick={() => deleteSubject(subject._id)}
        >
          Confirm
        </MenuItem>
        <MenuItem data-cy="cancel-delete" onClick={onCloseDelete}>
          Cancel
        </MenuItem>
      </Menu>
    </TableRow>
  );
}

function SubjectsPage(props: { accessToken: string }): JSX.Element {
  const classes = useStyles();
  const {
    mentor,
    isMentorLoading,
    mentorError,
    clearMentorError,
  } = useWithMentor(props.accessToken);
  const {
    subjects,
    subjectsError,
    isSubjectsLoading,
    subjectSearchParams,
    sortSubjects: subjectsSortBy,
    clearSubjectsError,
    subjectsNextPage,
    subjectsPrevPage,
  } = useWithSubjects();

  function deleteSubject(id: string) {
    // TODO
  }

  if (!subjects) {
    return (
      <div>
        <NavBar title="Subjects" />
        <CircularProgress />
      </div>
    );
  }

  return (
    <div>
      <NavBar title="Subjects" mentorId={mentor?._id} />
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
                {subjects.edges.map((row, i) => (
                  <SubjectItem
                    key={`subject-${i}`}
                    subject={row.node}
                    onDelete={deleteSubject}
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
        <ErrorDialog
          error={mentorError || subjectsError}
          clearError={mentorError ? clearMentorError : clearSubjectsError}
        />
      </div>
    </div>
  );
}

export default withAuthorizationOnly(SubjectsPage);
