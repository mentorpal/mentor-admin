/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import PropTypes from "prop-types";
import { Typography, Snackbar } from "@material-ui/core";
import MuiAlert from "@material-ui/lab/Alert";
export default function StageToast(props: { value: number }): JSX.Element {
  const toastLandmarks = new Map([
    [
      5,
      {
        name: "Scripted",
        description: "This Mentor can select questions from a list",
      },
    ],
    [
      20,
      {
        name: "Interactive",
        description: "This Mentor can respond to simple questions.",
      },
    ],
    [
      50,
      {
        name: "Specialist",
        description:
          "This mentor can answer questions within a specific topic.",
      },
    ],
    [
      150,
      {
        name: "Conversational",
        description: "This mentor can respond to questions with some nuance.",
      },
    ],
    [
      250,
      {
        name: "Full-Subject",
        description:
          "Your mentor is equipped to answer questions within a broad subject.",
      },
    ],
    [
      1000,
      {
        name: "Life-Story",
        description:
          "Your mentor can hold a natural conversation. Congratulations!",
      },
    ],
  ]);
  const [open, setOpen] = React.useState(toastLandmarks.has(props.value));
  const toast = toastLandmarks.get(props.value);
  console.log(props.value, open, toast);

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      autoHideDuration={6000}
      onClose={() => {
        setOpen(false);
      }}
    >
      <MuiAlert
        elevation={6}
        variant="filled"
        severity="success"
        data-cy="stage-toast"
      >
        <Typography variant="body1">
          You have reached {props.value} total questions!
        </Typography>
        <Typography variant="body2">
          {toast?.name}: {toast?.description}
        </Typography>
      </MuiAlert>
    </Snackbar>
  );
}

StageToast.propTypes = {
  value: PropTypes.number.isRequired,
};
