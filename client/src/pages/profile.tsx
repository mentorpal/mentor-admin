/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useContext, useState } from "react";
import { useCookies } from "react-cookie";
import { ToastContainer, toast } from "react-toastify";
import { navigate } from "gatsby";
import {
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { updateMentor, fetchMentor } from "api";
import { Mentor } from "types";
import Context from "context";
import NavBar from "components/nav-bar";
import "react-toastify/dist/ReactToastify.css";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: "#ddd",
    width: "100%",
    height: "100%",
  },
  paper: {
    flexGrow: 1,
    height: "100%",
    padding: 25,
    margin: 25,
  },
  title: {
    fontWeight: "bold",
  },
  inputField: {
    width: "100%",
    margin: 10,
  },
}));

function IndexPage(): JSX.Element {
  const classes = useStyles();
  const context = useContext(Context);
  const [cookies] = useCookies(["accessToken"]);
  const [mentor, setMentor] = useState<Mentor>();

  React.useEffect(() => {
    if (!cookies.accessToken) {
      navigate("/");
    }
  }, [cookies]);

  React.useEffect(() => {
    loadMentor();
  }, [context.user]);

  async function loadMentor() {
    if (!context.user) {
      return;
    }
    setMentor(await fetchMentor(cookies.accessToken));
  }

  async function updateProfile() {
    const updated = await updateMentor(mentor!, cookies.accessToken);
    if (!updated) {
      toast("Failed to save changes");
    } else {
      loadMentor();
      toast("Profile updated!");
    }
  }

  if (!mentor) {
    return (
      <div>
        <NavBar title="Mentor Studio" />
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <NavBar title="Mentor Studio" />
      <Paper id="mentor" className={classes.paper}>
        <Typography variant="h6" className={classes.title}>
          My Profile
        </Typography>
        <TextField
          id="name"
          label="Name"
          variant="outlined"
          value={mentor.name}
          onChange={(e) => {
            setMentor({ ...mentor, name: e.target.value });
          }}
          className={classes.inputField}
        />
        <TextField
          id="first-name"
          label="First Name"
          variant="outlined"
          value={mentor.firstName}
          onChange={(e) => {
            setMentor({ ...mentor, firstName: e.target.value });
          }}
          className={classes.inputField}
        />
        <TextField
          id="job-title"
          label="Job Title"
          variant="outlined"
          value={mentor.title}
          onChange={(e) => {
            setMentor({ ...mentor, title: e.target.value });
          }}
          className={classes.inputField}
        />
        <Button
          id="update-btn"
          variant="contained"
          color="primary"
          onClick={updateProfile}
        >
          Save Changes
        </Button>
      </Paper>
      <ToastContainer />
    </div>
  );
}

export default IndexPage;
