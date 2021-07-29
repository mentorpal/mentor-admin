/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState } from "react";
import {
  Card,
  Collapse,
  IconButton,
  List,
  ListSubheader,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { ExpandMore as ExpandMoreIcon } from "@material-ui/icons";
import { Answer, ImportPreview } from "types";
import { ChangeIcon } from "./icons";

const useStyles = makeStyles(() => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    padding: 10,
    margin: 10,
    minHeight: 40,
  },
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
}));

export default function AnswerImport(props: {
  preview: ImportPreview<Answer>;
}): JSX.Element {
  const classes = useStyles();
  const [isExpanded, setIsExpanded] = useState(false);
  const { preview } = props;
  const { importData: answer, curData: curAnswer } = preview;
  const transcript = answer?.transcript || curAnswer?.transcript || "";

  return (
    <Card className={classes.root}>
      <div className={classes.row}>
        <ChangeIcon preview={preview} />
        <div style={{ marginRight: 10 }}>
          <Typography align="left" variant="body1">
            {answer?.question?.question || curAnswer?.question?.question}
          </Typography>
          <Typography align="left" variant="caption">
            {`${transcript.substring(0, 100)}${
              transcript.length > 100 ? "..." : ""
            }`}
          </Typography>
        </div>
        <IconButton
          data-cy="toggle"
          size="small"
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <ExpandMoreIcon
            style={{
              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
            }}
          />
        </IconButton>
      </div>
      <Collapse
        in={isExpanded}
        timeout="auto"
        unmountOnExit
        style={{ width: "100%" }}
      >
        <ListSubheader>Media</ListSubheader>
        <List data-cy="answer-media" dense disablePadding></List>
      </Collapse>
    </Card>
  );
}
