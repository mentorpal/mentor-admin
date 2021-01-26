/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { List, ListItem, Button } from "@material-ui/core";
import { Alert, AlertTitle, AlertProps } from "@material-ui/lab";

export interface IAlert {
  severity?: AlertProps["severity"];
  title?: string;
  message?: string;
  actionText?: string;
  actionFunction?: () => void;
}

export function AlertItem(props: {
  severity?: AlertProps["severity"];
  title?: string;
  message?: string;
  action?: any;
}): JSX.Element {
  return (
    <Alert severity={props.severity} action={props.action}>
      {props.title ? <AlertTitle>{props.title}</AlertTitle> : undefined}
      {props.message}
    </Alert>
  );
}

export function Alerts(props: { alerts: IAlert[] }): JSX.Element {
  const { alerts } = props;

  return (
    <List id="alerts">
      {alerts.map((alert: IAlert, i: number) => {
        return (
          <ListItem
            id={`alert-${i}`}
            key={`alert-${i}`}
            style={{ width: "100%" }}
          >
            <AlertItem
              severity={alert.severity}
              title={alert.title}
              message={alert.message}
              action={
                alert.actionFunction ? (
                  <Button
                    id="alert-btn"
                    variant="outlined"
                    color="inherit"
                    size="small"
                    disableElevation
                    onClick={() => {
                      alert.actionFunction!();
                    }}
                  >
                    {alert.actionText}
                  </Button>
                ) : undefined
              }
            />
          </ListItem>
        );
      })}
    </List>
  );
}

export default Alerts;
