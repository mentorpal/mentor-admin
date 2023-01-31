/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import PropTypes from "prop-types";
import { Typography, Snackbar } from "@mui/material";
import MuiAlert from "@mui/material/Alert";

export default function StageToast(props: {
  value: number;
  floor: number;
  name: string;
}): JSX.Element {
  const [open, setOpen] = React.useState(
    props.floor == props.value && props.floor != 0
  );

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
          Your mentor has reached the {props.name} stage!
        </Typography>
        <Typography variant="body2">
          You have {props.value} total questions.
        </Typography>
      </MuiAlert>
    </Snackbar>
  );
}

StageToast.propTypes = {
  value: PropTypes.number.isRequired,
  floor: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
};
