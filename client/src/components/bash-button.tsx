/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Button, Typography } from "@material-ui/core";
import React from "react";
import PropTypes from "prop-types";

export default function BashButton(props: {
  thumbnail: boolean;
  idle: boolean;
}): JSX.Element {
  const bash = {
    text: "",
    reason: "",
    action: () => {
      undefined;
    },
  };
  switch (true) {
    case !props.thumbnail:
      bash.text = "Add a Thumbnail";
      bash.reason = "A thumbnail helps a user identify your mentor";
      bash.action = () => console.log("upload");
      break;
    case !props.idle:
      bash.text = "Record an Idle Video";
      bash.reason = "Users see your idle video while typing a question";
      bash.action = () => console.log("record idle");
      break;
    default:
      bash.text = "Add a Subject";
      bash.reason = "Add a subject to answer more questions";
      bash.action = () => console.log("add subject");
      break;
  }
  return (
    <div>
      <Button fullWidth data-cy="bash-button" onClick={bash.action}>
        {bash.text}
      </Button>
      <Typography variant="body1" color="textSecondary">
        {bash.reason}
      </Typography>
    </div>
  );
}

BashButton.propTypes = {
  thumbnail: PropTypes.bool.isRequired,
  idle: PropTypes.bool.isRequired,
};
