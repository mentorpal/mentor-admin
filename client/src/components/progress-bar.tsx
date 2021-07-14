/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";

import { Box, Radio, Typography } from "@material-ui/core";

export default function ProgressBar(props: {
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

  return (
    <Box display="flex" alignItems="center">
      <Box width="100%" mr={1}>
        {questions.map((q, i) => (
          <Radio
            data-cy={`radio-${i}`}
            key={i}
            checked={q.complete}
            color={q.complete ? "primary" : "default"}
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
