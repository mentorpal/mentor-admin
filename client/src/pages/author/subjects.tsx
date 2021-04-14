/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Link, navigate } from "gatsby";
import React, { useContext, useState } from "react";
import { useCookies } from "react-cookie";
import { toast, ToastContainer } from "react-toastify";
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

import { ColumnDef, ColumnHeader } from "components/column-header";
import NavBar from "components/nav-bar";
import Context from "context";
import { Connection, Subject } from "types";
import { fetchSubjects } from "api";

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
  id: string;
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
    toast("Deleting...");
    setAnchorEl(undefined);
    onDelete(id);
  }

  return (
    <TableRow id={props.id} hover role="checkbox" tabIndex={-1}>
      <TableCell id="name" align="left">
        <Link to={`/author/subject?id=${subject._id}`}>{subject.name}</Link>
      </TableCell>
      <TableCell id="description" align="left">
        {subject.description}
      </TableCell>
      <TableCell id="delete" align="center">
        <IconButton onClick={onClickDelete}>
          <DeleteIcon />
        </IconButton>
      </TableCell>
      <Menu
        id="delete-menu"
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
          id="confirm-delete"
          onClick={() => deleteSubject(subject._id)}
        >
          Confirm
        </MenuItem>
        <MenuItem id="cancel-delete" onClick={onCloseDelete}>
          Cancel
        </MenuItem>
      </Menu>
    </TableRow>
  );
}

function SubjectsPage(): JSX.Element {
  const classes = useStyles();
  const context = useContext(Context);
  const [cookies] = useCookies(["accessToken"]);
  const [subjects, setSubjects] = useState<Connection<Subject>>();
  const [cursor, setCursor] = React.useState("");
  const [sortBy, setSortBy] = React.useState("name");
  const [sortAscending, setSortAscending] = React.useState(false);
  const limit = 10;

  React.useEffect(() => {
    if (!cookies.accessToken) {
      navigate("/login");
    }
  }, [cookies]);

  React.useEffect(() => {
    if (!context.user) {
      return;
    }
    loadSubjects();
  }, [context.user, cursor, sortBy, sortAscending]);

  async function loadSubjects() {
    setSubjects(await fetchSubjects({ cursor, limit, sortBy, sortAscending }));
  }

  async function deleteSubject() {
    // TODO
  }

  function setSort(id: string) {
    if (sortBy === id) {
      setSortAscending(!sortAscending);
    } else {
      setSortBy(id);
    }
    setCursor("");
  }

  if (!context.user || !subjects) {
    return (
      <div>
        <NavBar title="Subjects" />
        <CircularProgress />
      </div>
    );
  }

  return (
    <div>
      <NavBar title="Subjects" />
      <div className={classes.root}>
        <Paper className={classes.container}>
          <TableContainer>
            <Table stickyHeader aria-label="sticky table">
              <ColumnHeader
                columns={columns}
                sortBy={sortBy}
                sortAsc={sortAscending}
                onSort={setSort}
              />
              <TableBody id="subjects">
                {subjects.edges.map((row, i) => (
                  <SubjectItem
                    key={`subject-${i}`}
                    id={`subject-${i}`}
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
              id="prev-page"
              disabled={!subjects.pageInfo.hasPreviousPage}
              onClick={() =>
                setCursor("prev__" + subjects.pageInfo.startCursor)
              }
            >
              <KeyboardArrowLeftIcon />
            </IconButton>
            <IconButton
              id="next-page"
              disabled={!subjects.pageInfo.hasNextPage}
              onClick={() => setCursor("next__" + subjects.pageInfo.endCursor)}
            >
              <KeyboardArrowRightIcon />
            </IconButton>
            <Fab
              id="create-button"
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
        <ToastContainer />
      </div>
    </div>
  );
}

export default SubjectsPage;
