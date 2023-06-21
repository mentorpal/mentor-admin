/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useState } from "react";
import { Icon, IconButton, Theme, Tooltip } from "@mui/material";
import { trainMentor } from "api";
import { useWithConfig } from "store/slices/config/useWithConfig";
import { makeStyles } from "tss-react/mui";
import { JobState, Mentor, MentorDirtyReason } from "types";
import {
  Construction as RepairIcon,
  VideoSettings as NewVideosIcon,
  Hardware as BuildIcon,
  Check as SuccessIcon,
  PublishedWithChanges as ProgressIcon,
} from "@mui/icons-material";

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
  mentorTrainStatusDict: Record<string, JobState>;
  addMentorToPoll: (m: Mentor) => void;
}): JSX.Element {
  const { mentor, accessToken, mentorTrainStatusDict, addMentorToPoll } = props;
  const { state: configState } = useWithConfig();
  const { classes: styles } = useStyles();
  const { isDirty, dirtyReason } = mentor;
  const trainStatus: JobState = Object.keys(mentorTrainStatusDict).find(
    (key) => key === mentor._id
  )
    ? mentorTrainStatusDict[mentor._id]
    : JobState.NONE;

  const [trainInProgressFound, setTrainInProgressFound] = useState(
    trainStatus === JobState.IN_PROGRESS
  );
  const [trainSuccessFound, setTrainSuccessFound] = useState(
    trainInProgressFound && trainStatus === JobState.SUCCESS
  );
  const [localDirty, setLocalDirty] = useState(isDirty);

  useEffect(() => {
    // Determine if a train was successflly completed here
    setTrainInProgressFound(
      trainInProgressFound || trainStatus === JobState.IN_PROGRESS
    );
    setTrainSuccessFound(
      trainSuccessFound ||
        (trainInProgressFound && trainStatus === JobState.SUCCESS)
    );
    if (trainInProgressFound && trainSuccessFound) {
      setLocalDirty(false);
    }
  }, [trainInProgressFound, trainSuccessFound, trainStatus]);

  return (
    <span>
      {trainStatus === JobState.IN_PROGRESS && localDirty ? (
        <Tooltip title="Training In Progress" arrow>
          <Icon data-cy="progress-icon" className={styles.normalButton}>
            <ProgressIcon className={styles.normalButton} />
          </Icon>
        </Tooltip>
      ) : (trainStatus === JobState.SUCCESS && !localDirty) || !localDirty ? (
        <Tooltip title="Up To Date" arrow>
          <Icon data-cy="success-icon" className={styles.normalButton}>
            <SuccessIcon style={{ color: "green" }} />
          </Icon>
        </Tooltip>
      ) : (
        <Tooltip
          style={{ margin: 10 }}
          title={`Train Mentor (${
            dirtyReason === MentorDirtyReason.ANSWERS_ADDED
              ? "Answers Added"
              : dirtyReason === MentorDirtyReason.ANSWERS_REMOVED
              ? "Answers Removed"
              : "Edited Content"
          })`}
          arrow
        >
          <IconButton
            data-cy={`train-mentor-${mentor._id}`}
            onClick={() => {
              trainMentor(
                mentor._id,
                accessToken,
                configState.config?.classifierLambdaEndpoint || ""
              ).then(() => {
                addMentorToPoll(mentor);
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
  );
}
