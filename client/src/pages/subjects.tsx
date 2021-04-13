/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { navigate } from "gatsby";
import React, { useContext, useState } from "react";
import { useCookies } from "react-cookie";
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
import Context from "context";
import { Connection, Mentor, Subject } from "types";
import { fetchMentor, fetchSubjects, updateMentor } from "api";

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

function SubjectsPage(): JSX.Element {
  const classes = useStyles();
  const context = useContext(Context);
  const [cookies] = useCookies(["accessToken"]);
  const [mentor, setMentor] = useState<Mentor>();
  const [allSubjects, setAllSubjects] = useState<Connection<Subject>>();
  const [subjects, setSubjects] = useState<Subject[]>();
  const [defaultSubject, setDefaultSubject] = useState<Subject>();
  const [cursor, setCursor] = React.useState("");
  const [sortBy, setSortBy] = React.useState("name");
  const [sortAscending, setSortAscending] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const limit = 20;

  React.useEffect(() => {
    if (!cookies.accessToken) {
      navigate("/login");
    }
  }, [cookies]);

  React.useEffect(() => {
    if (!context.user) {
      return;
    }
    fetchMentor(cookies.accessToken).then((m) => setMentor(m));
  }, [context.user]);

  React.useEffect(() => {
    if (!mentor) {
      return;
    }
    setSubjects(mentor.subjects);
    setDefaultSubject(mentor.defaultSubject);
  }, [mentor]);

  React.useEffect(() => {
    if (!context.user) {
      return;
    }
    fetchSubjects({ cursor, limit, sortBy, sortAscending }).then((subjects) => {
      setAllSubjects(subjects);
    });
  }, [context.user, cursor, sortBy, sortAscending, limit]);

  function setSort(id: string) {
    if (sortBy === id) {
      setSortAscending(!sortAscending);
    } else {
      setSortBy(id);
    }
    setCursor("");
  }

  function toggleSubject(subject: Subject) {
    if (!subjects) {
      return;
    }
    const i = subjects.findIndex((s) => s._id === subject._id);
    const _subjects = [...subjects];
    if (i === -1) {
      _subjects.push(subject);
    } else {
      _subjects.splice(i, 1);
      if (defaultSubject?._id === subject._id) {
        setDefaultSubject(undefined);
      }
    }
    setSubjects(_subjects);
  }

  function toggleDefaultSubject(subject: Subject) {
    if (defaultSubject?._id === subject._id) {
      setDefaultSubject(undefined);
    } else {
      setDefaultSubject(subject);
    }
  }

  async function saveMentor() {
    if (!subjects || !mentor) {
      return;
    }
    setIsSaving(true);
    await updateMentor(
      {
        ...mentor,
        defaultSubject,
        subjects: subjects,
      },
      cookies.accessToken
    );
    setMentor(await fetchMentor(cookies.accessToken));
    setIsSaving(false);
  }

  if (!context.user || !allSubjects || !subjects) {
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
                {allSubjects.edges.map((edge) => {
                  const subject = edge.node;
                  return (
                    <TableRow
                      id={`subject-${subject._id}`}
                      key={`${subject._id}`}
                      hover
                      role="checkbox"
                      tabIndex={-1}
                    >
                      <TableCell id="name" align="left">
                        {subject.name}
                      </TableCell>
                      <TableCell id="description" align="left">
                        {subject.description}
                      </TableCell>
                      <TableCell id="select" align="center">
                        <Checkbox
                          checked={
                            subjects.find((s) => s._id === subject._id) !==
                            undefined
                          }
                          disabled={subject.isRequired}
                          color="primary"
                          onClick={() => toggleSubject(subject)}
                        />
                      </TableCell>
                      <TableCell id="default" align="center">
                        <Checkbox
                          checked={subject._id === defaultSubject?._id}
                          disabled={
                            subjects.find((s) => s._id === subject._id) ===
                            undefined
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
              id="prev-page"
              disabled={!allSubjects.pageInfo.hasPreviousPage}
              onClick={() =>
                setCursor("prev__" + allSubjects.pageInfo.startCursor)
              }
            >
              <KeyboardArrowLeftIcon />
            </IconButton>
            <IconButton
              id="next-page"
              disabled={!allSubjects.pageInfo.hasNextPage}
              onClick={() =>
                setCursor("next__" + allSubjects.pageInfo.endCursor)
              }
            >
              <KeyboardArrowRightIcon />
            </IconButton>
            <Fab
              id="save-button"
              variant="extended"
              color="primary"
              className={classes.fab}
              onClick={saveMentor}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </Fab>
          </Toolbar>
        </AppBar>
      </div>
    </div>
  );
}

export default SubjectsPage;
