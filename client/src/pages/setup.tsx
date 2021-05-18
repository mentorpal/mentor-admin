/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { navigate } from "gatsby";
import React, { useState } from "react";
import { Button, CircularProgress, Radio } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { User } from "types";
import NavBar from "components/nav-bar";
import withAuthorizationOnly from "hooks/wrap-with-authorization-only";
import withLocation from "hooks/wrap-with-location";
import { useWithSetup } from "hooks/graphql/use-with-setup";
import { LoadingDialog } from "components/dialog";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: "#eee",
  },
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
  },
  card: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginLeft: 25,
    marginRight: 25,
    padding: 25,
    flexGrow: 1,
  },
  column: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    width: "100%",
  },
  title: {
    fontWeight: "bold",
    margin: 15,
  },
  text: {
    marginBottom: 15,
  },
  inputField: {
    width: "100%",
    margin: 10,
  },
  button: {
    width: 100,
    margin: 5,
  },
}));

function SetupPage(props: {
  user: User;
  accessToken: string;
  search: { i?: string };
}): JSX.Element {
  const classes = useStyles();
  const [slideIdx, setSlideIdx] = useState(
    props.search.i ? parseInt(props.search.i) : 0
  );
  const {
    slides,
    mentor,
    isSetupComplete,
    isSetupLoading,
    isSetupSaving,
  } = useWithSetup(props.accessToken, {
    classes,
    user: props.user,
  });

  if (!mentor || !slides) {
    return (
      <div>
        <NavBar title="Mentor Setup" />
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <NavBar title="Mentor Setup" mentorId={mentor._id} />
      <div data-cy="slide">
        {slideIdx >= slides.length ? "Invalid slide" : slides[slideIdx].element}
      </div>
      <div className={classes.row} style={{ height: 150 }}>
        <Button
          data-cy="back-btn"
          variant="contained"
          className={classes.button}
          disabled={slideIdx === 0}
          onClick={() => setSlideIdx(slideIdx - 1)}
        >
          Back
        </Button>
        <Button
          data-cy="done-btn"
          variant="contained"
          color="secondary"
          className={classes.button}
          disabled={!isSetupComplete}
          onClick={() => navigate("/")}
        >
          Done
        </Button>
        <Button
          data-cy="next-btn"
          variant="contained"
          color="primary"
          className={classes.button}
          onClick={() => setSlideIdx(slideIdx + 1)}
          disabled={slideIdx === slides.length - 1}
        >
          Next
        </Button>
      </div>
      <div className={classes.row}>
        {slides.map((s, i) => (
          <Radio
            data-cy={`radio-${i}`}
            key={i}
            checked={i === slideIdx}
            onClick={() => setSlideIdx(i)}
            color={s.status ? "primary" : "default"}
            style={{ color: s.status ? "" : "red" }}
          />
        ))}
      </div>
      <LoadingDialog
        title={isSetupLoading ? "Loading" : isSetupSaving ? "Saving" : ""}
      />
    </div>
  );
}

export default withAuthorizationOnly(withLocation(SetupPage));
