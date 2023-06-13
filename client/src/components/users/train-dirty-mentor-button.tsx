/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { Icon, IconButton, Theme, Tooltip } from "@mui/material";
import { trainMentor } from "api";
import { useWithConfig } from "store/slices/config/useWithConfig";
import { makeStyles } from "tss-react/mui";
import { Mentor, MentorDirtyReason } from "types";
import {
  Construction as RepairIcon,
  VideoSettings as NewVideosIcon,
  Hardware as BuildIcon,
  Check as SuccessIcon,
  PublishedWithChanges as ProgressIcon,
} from "@mui/icons-material";
import { useState } from "react";

const useStyles = makeStyles({ name: { TrainDirtyMentorButton } })(
  (theme: Theme) => ({
    normalButton: {
      "&:hover": {
        color: theme.palette.primary.main,
      },
    },
  })
);

export function TrainDirtyMentorButton(props: {
  mentor: Mentor;
  accessToken: string;
}): JSX.Element {
  enum RequestState {
    IDLE = "IDLE",
    IN_PROGRESS = "IN_PROGRESS",
    SUCCESS = "SUCCESS",
    ERROR = "ERROR",
  }

  const { mentor, accessToken } = props;
  const { state: configState } = useWithConfig();
  const { classes: styles } = useStyles();
  const { isDirty, dirtyReason } = mentor;
  const [requestState, setRequestState] = useState<RequestState>(
    RequestState.IDLE
  );

  return (
    <span>
      {isDirty ? (
        <span>
          {requestState === RequestState.IN_PROGRESS ? (
            <Icon data-cy="success-icon" className={styles.normalButton}>
              <ProgressIcon className={styles.normalButton} />
            </Icon>
          ) : requestState === RequestState.SUCCESS ? (
            <Tooltip title="Request Sent" arrow>
              <Icon data-cy="success-icon" className={styles.normalButton}>
                <SuccessIcon style={{ color: "green" }} />
              </Icon>
            </Tooltip>
          ) : (
            <Tooltip style={{ margin: 10 }} title="Request Sent" arrow>
              <IconButton
                data-cy={`train-mentor-${mentor._id}`}
                onClick={() => {
                  setRequestState(RequestState.IN_PROGRESS);
                  trainMentor(
                    mentor._id,
                    accessToken,
                    configState.config?.classifierLambdaEndpoint || ""
                  )
                    .then(() => {
                      setRequestState(RequestState.SUCCESS);
                    })
                    .catch(() => {
                      setRequestState(RequestState.ERROR);
                    });
                }}
                className={styles.normalButton}
                size="large"
              >
                {dirtyReason === MentorDirtyReason.ANSWERS_ADDED ? (
                  <NewVideosIcon />
                ) : dirtyReason === MentorDirtyReason.ANSWERS_REMOVED ? (
                  <RepairIcon />
                ) : (
                  <BuildIcon />
                )}
              </IconButton>
            </Tooltip>
          )}
        </span>
      ) : undefined}
    </span>
  );
}
