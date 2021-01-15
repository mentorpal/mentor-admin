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
