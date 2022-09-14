/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  makeStyles,
  Typography,
} from "@material-ui/core";
import {
  Autorenew,
  HourglassEmptyTwoTone,
  ErrorOutline,
  CheckBox,
} from "@material-ui/icons";
import {
  ImportGraphQLUpdate,
  ImportS3VideoMigrate,
  ImportTask,
  ImportTaskStatus,
} from "types";
import { useWithLogin } from "store/slices/login/useWithLogin";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import { isImportComplete } from "hooks/graphql/use-with-import-status";
import { navigate } from "@reach/router";

const useStyles = makeStyles(() => ({
  progressIcon: {
    animation: "$spin 3000ms",
    // animationName: "spin",
    animationDuration: "1000ms",
    animationIterationCount: "infinite",
    animationTimingFunction: "linear",
  },
  "@keyframes spin": {
    from: {
      transform: "rotate(0deg)",
    },
    to: {
      transform: "rotate(360deg)",
    },
  },
}));

export default function ImportInProgressDialog(props: {
  importTask: ImportTask;
}): JSX.Element {
  const { logout } = useWithLogin();
  const classes = useStyles();
  const { loadMentor } = useActiveMentor();
  const { importTask } = props;
  const [open, setOpen] = useState<boolean>(true);

  useEffect(() => {
    setOpen(Boolean(importTask));
  }, [importTask]);

  function getIcon(status: ImportTaskStatus) {
    switch (status) {
      case ImportTaskStatus.QUEUED:
        return <HourglassEmptyTwoTone />;
      case ImportTaskStatus.IN_PROGRESS:
        return <Autorenew className={classes.progressIcon} />;
      case ImportTaskStatus.FAILED:
        return <ErrorOutline style={{ color: "red" }} />;
      case ImportTaskStatus.DONE:
        return <CheckBox style={{ color: "green" }} />;
    }
  }

  function GraphQLUpdateDisplay(graphQLTask: ImportGraphQLUpdate) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          borderBottom: "1px black solid",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ width: "40%" }}>GraphQL Update</div>
          <div style={{ width: "40%" }}>{graphQLTask.status}</div>
          <div style={{ width: "10%" }}>{getIcon(graphQLTask.status)}</div>
        </div>

        {graphQLTask.errorMessage ? (
          <div style={{ color: "red", margin: "10px" }}>
            {graphQLTask.errorMessage}
          </div>
        ) : undefined}
      </div>
    );
  }

  function VideoMigrationDisplay(videoMigration: ImportS3VideoMigrate) {
    const importErrors = importTask.migrationErrors;
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          borderBottom: "1px black solid",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ width: "40%" }}>s3 Media Transfers</div>
          <div style={{ width: "40%" }}>{videoMigration.status}</div>
          <div style={{ width: "10%" }}>{getIcon(videoMigration.status)}</div>
        </div>

        {videoMigration.errorMessage ? (
          <div style={{ color: "red", margin: "10px" }}>
            {videoMigration.errorMessage}
          </div>
        ) : undefined}

        {importErrors.length ? (
          <div data-cy="transfer-fails-display">
            <h4 style={{ color: "red", margin: "5px" }}>
              {`${importErrors.length} Failed Transfer(s):`}
            </h4>
            {importErrors.map((error) => {
              return <div key={error}>{error}</div>;
            })}
          </div>
        ) : undefined}
      </div>
    );
  }

  function onClose() {
    loadMentor();
    setOpen(false);
    navigate("/admin/");
  }

  return (
    <Dialog
      data-cy="import-progress-dialog"
      open={open}
      fullWidth={true}
      maxWidth={"sm"}
    >
      <DialogContent>
        <Typography
          style={{ fontWeight: "bold", fontSize: "18px", marginBottom: "10px" }}
        >
          Mentor import{" "}
          {isImportComplete(props.importTask) ? " complete" : " in progress"}
        </Typography>
        {GraphQLUpdateDisplay(props.importTask.graphQLUpdate)}
        {VideoMigrationDisplay(props.importTask.s3VideoMigrate)}

        {isImportComplete(props.importTask) ? (
          <Button
            data-cy="close-button"
            onClick={() => onClose()}
            style={{ marginTop: "20px" }}
          >
            Close
          </Button>
        ) : (
          <Button
            data-cy="import-logout-button"
            onClick={() => logout()}
            style={{ marginTop: "20px" }}
          >
            Logout
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
}
