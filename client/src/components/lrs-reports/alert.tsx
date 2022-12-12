/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import Alert from "@mui/material/Alert";

interface AlertPopUpProps {
  type: AlertTypes;
  message: string;
}

export enum AlertTypes {
  ERROR = "ERROR",
  WARNING = "WARNING",
  INFO = "INFO",
  SUCCESS = "SUCCESS",
}

const AlertComponent = (props: {
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  severity: any;
}): JSX.Element => {
  const { message, severity } = props;
  return (
    <div>
      <Alert
        style={{ width: 500, borderRadius: 10 }}
        variant="filled"
        severity={severity}
      >
        {message}
      </Alert>
    </div>
  );
};

function AlertPopUp(props: AlertPopUpProps): JSX.Element {
  const { type, message } = props;

  const getAlert = (): JSX.Element => {
    switch (type as AlertTypes) {
      case AlertTypes.SUCCESS:
        return <AlertComponent message={message} severity={"success"} />;

      case AlertTypes.ERROR:
        return <AlertComponent message={message} severity={"error"} />;

      case AlertTypes.WARNING:
        return <AlertComponent message={message} severity={"warning"} />;
      case AlertTypes.INFO:
        return <AlertComponent message={message} severity={"info"} />;

      default:
        <AlertComponent message={message} severity={"info"} />;
    }
    return (
      <div>
        <AlertComponent message={message} severity={"info"} />
      </div>
    );
  };
  return (
    <div style={{ position: "absolute", bottom: 30, right: 30 }}>
      {getAlert()}
    </div>
  );
}

export default AlertPopUp;
