/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Link, navigate } from "gatsby";
import React, { useState } from "react";
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

import { fetchMentorId, fetchQuestions } from "api";
import { Connection, Mentor, Question } from "types";
import { ColumnDef, ColumnHeader } from "components/column-header";
import NavBar from "components/nav-bar";
import withAuthorizationOnly from "wrap-with-authorization-only";

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
    id: "question",
    label: "Question",
    minWidth: 200,
    align: "left",
    sortable: true,
  },
  { id: "type", label: "Type", minWidth: 200, align: "left", sortable: true },
  { id: "name", label: "Tag", minWidth: 200, align: "left", sortable: true },
  {
    id: "delete",
    label: "Delete",
    minWidth: 0,
    align: "center",
    sortable: false,
  },
];

function QuestionsPage(props: { accessToken: string }): JSX.Element {
  const classes = useStyles();
  const [mentor, setMentor] = React.useState<Mentor>();
  const [questions, setQuestions] = useState<Connection<Question>>();
  const [cursor, setCursor] = React.useState("");
  const [sortBy, setSortBy] = React.useState("question");
  const [sortAscending, setSortAscending] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<
    EventTarget & HTMLButtonElement
  >();
  const deleteMenuOpen = Boolean(anchorEl);
  const limit = 10;

  React.useState(() => {
    let mounted = true;
    fetchMentorId(props.accessToken)
      .then((m) => {
        if (!mounted) {
          return;
        }
        setMentor(m);
      })
      .catch((err) => console.error(err));
    return () => {
      mounted = false;
    };
  });

  React.useEffect(() => {
    let mounted = true;
    fetchQuestions({ cursor, limit, sortBy, sortAscending })
      .then((q) => {
        if (!mounted) {
          return;
        }
        setQuestions(q);
      })
      .catch((err) => console.error(err));
    return () => {
      mounted = false;
    };
  }, [cursor, sortBy, sortAscending]);

  function onClickDelete(e: React.MouseEvent<HTMLButtonElement>) {
    setAnchorEl(e.currentTarget);
  }

  function onCloseDelete() {
    setAnchorEl(undefined);
  }

  async function deleteQuestion() {
    toast("Deleting...");
    setAnchorEl(undefined);
  }

  function setSort(id: string) {
    if (sortBy === id) {
      setSortAscending(!sortAscending);
    } else {
      setSortBy(id);
    }
    setCursor("");
  }

  if (!questions) {
    return (
      <div>
        <NavBar title="Questions" mentorId={mentor?._id} />
        <CircularProgress />
      </div>
    );
  }

  return (
    <div>
      <NavBar title="Questions" mentorId={mentor?._id} />
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
              <TableBody data-cy="questions">
                {questions.edges.map((row, i) => (
                  <TableRow
                    key={`question-${i}`}
                    data-cy={`question-${i}`}
                    hover
                    role="checkbox"
                    tabIndex={-1}
                  >
                    <TableCell data-cy="question" align="left">
                      <Link to={`/author/question?data-cy=${row.node._id}`}>
                        {row.node.question}
                      </Link>
                    </TableCell>
                    <TableCell data-cy="type" align="left">
                      {row.node.type}
                    </TableCell>
                    <TableCell data-cy="name" align="left">
                      {row.node.name}
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
                        onClick={deleteQuestion}
                      >
                        Confirm
                      </MenuItem>
                      <MenuItem data-cy="cancel-delete" onClick={onCloseDelete}>
                        Cancel
                      </MenuItem>
                    </Menu>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        <AppBar position="sticky" color="default" className={classes.appBar}>
          <Toolbar>
            <IconButton
              data-cy="prev-page"
              disabled={!questions.pageInfo.hasPreviousPage}
              onClick={() =>
                setCursor("prev__" + questions.pageInfo.startCursor)
              }
            >
              <KeyboardArrowLeftIcon />
            </IconButton>
            <IconButton
              data-cy="next-page"
              disabled={!questions.pageInfo.hasNextPage}
              onClick={() => setCursor("next__" + questions.pageInfo.endCursor)}
            >
              <KeyboardArrowRightIcon />
            </IconButton>
            <Fab
              data-cy="create-button"
              variant="extended"
              color="primary"
              className={classes.fab}
              onClick={() => navigate(`/author/question`)}
            >
              <AddIcon />
              Create Question
            </Fab>
          </Toolbar>
        </AppBar>
        <ToastContainer />
      </div>
    </div>
  );
}

export default withAuthorizationOnly(QuestionsPage);
