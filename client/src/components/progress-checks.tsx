/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";

import { Box, Radio, Typography } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

const useStyles = makeStyles(() =>
  createStyles({
    smallRadioButton: {
      "& svg": {
        width: "0.7em",
        height: "0.7em",
      },
    },
    smallRadioButtonProgess: {
      "& svg": {
        width: "0.9em",
        height: "0.9em",
      },
    },
  })
);

export default function ProgressChecks(props: {
  value: number;
  total: number;
}): JSX.Element {
  const percent = Math.round((props.value / props.total) * 100);
  const questions = [
    ...Array(props.total)
      .fill(0)
      .map((q, i) => {
        return { complete: i < props.value };
      }),
  ];

  const classes = useStyles();
  const progressColor = "#FFE194";
  const completeColor = "#57CC99 ";

  return (
    <Box display="flex" alignItems="center">
      <Box width="100%" mr={1}>
        {questions.map((q, i) => (
          <Radio
            data-cy={`radio-${i}`}
            disableRipple
            icon={<RadioButtonUncheckedIcon />}
            checkedIcon={<FiberManualRecordIcon />}
            key={i}
            checked={q.complete}
            style={
              q.complete
                ? { color: completeColor }
                : { color: progressColor, fontSize: 15 }
            }
            size="small"
            className={
              q.complete
                ? classes.smallRadioButton
                : classes.smallRadioButtonProgess
            }
          />
        ))}
      </Box>
      <Box minWidth={100}>
        <Typography variant="body2" color="textSecondary">
          {props.value} / {props.total} ({percent}%)
        </Typography>
      </Box>
    </Box>
  );
}
