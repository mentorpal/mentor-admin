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
import { Connection, Question } from "types";
import { fetchQuestions } from "api";

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

function QuestionsPage(): JSX.Element {
  const classes = useStyles();
  const context = useContext(Context);
  const [cookies] = useCookies(["accessToken"]);
  const [questions, setQuestions] = useState<Connection<Question>>();
  const [cursor, setCursor] = React.useState("");
  const [sortBy, setSortBy] = React.useState("question");
  const [sortAscending, setSortAscending] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const deleteMenuOpen = Boolean(anchorEl);
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
    loadQuestions();
  }, [context.user, cursor, sortBy, sortAscending]);

  async function loadQuestions() {
    setQuestions(
      await fetchQuestions({ cursor, limit, sortBy, sortAscending })
    );
  }

  function onClickDelete(e: any) {
    setAnchorEl(e.currentTarget);
  }

  function onCloseDelete() {
    setAnchorEl(null);
  }

  async function deleteQuestion(id: string) {
    toast("Deleting...");
    setAnchorEl(null);
  }

  function setSort(id: string) {
    if (sortBy === id) {
      setSortAscending(!sortAscending);
    } else {
      setSortBy(id);
    }
    setCursor("");
  }

  if (!context.user || !questions) {
    return (
      <div>
        <NavBar title="Questions" />
        <CircularProgress />
      </div>
    );
  }

  return (
    <div>
      <NavBar title="Questions" />
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
              <TableBody id="questions">
                {questions.edges.map((row, i) => (
                  <TableRow
                    key={`question-${i}`}
                    id={`question-${i}`}
                    hover
                    role="checkbox"
                    tabIndex={-1}
                  >
                    <TableCell id="question" align="left">
                      <Link to={`/author/question?id=${row.node._id}`}>
                        {row.node.question}
                      </Link>
                    </TableCell>
                    <TableCell id="type" align="left">
                      {row.node.type}
                    </TableCell>
                    <TableCell id="name" align="left">
                      {row.node.name}
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
                        onClick={() => deleteQuestion(row.node._id)}
                      >
                        Confirm
                      </MenuItem>
                      <MenuItem id="cancel-delete" onClick={onCloseDelete}>
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
              id="prev-page"
              disabled={!questions.pageInfo.hasPreviousPage}
              onClick={() =>
                setCursor("prev__" + questions.pageInfo.startCursor)
              }
            >
              <KeyboardArrowLeftIcon />
            </IconButton>
            <IconButton
              id="next-page"
              disabled={!questions.pageInfo.hasNextPage}
              onClick={() => setCursor("next__" + questions.pageInfo.endCursor)}
            >
              <KeyboardArrowRightIcon />
            </IconButton>
            <Fab
              id="create-button"
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

export default QuestionsPage;
