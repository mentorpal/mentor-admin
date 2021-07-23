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
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  makeStyles,
  TextField,
  Typography,
} from "@material-ui/core";
import { ExpandMore as ExpandMoreIcon } from "@material-ui/icons";
import { Answer } from "types";
import { ChangeIcon } from "./import-subject";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    justifyContent: "flex-start",
    padding: 10,
    margin: 10,
  },
  row: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
}));

export default function AnswerImport(props: {
  answer: Answer;
  curAnswer: Answer | undefined;
}): JSX.Element {
  const classes = useStyles();
  const { answer, curAnswer } = props;
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className={classes.root}>
      <div className={classes.row}>
        <ChangeIcon i={answer} e={curAnswer} />
        <Typography variant="body2">{answer?.question?.question}</Typography>
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
        <div className={classes.row} style={{ marginLeft: 20 }}>
          <ChangeIcon i={answer?.transcript} e={curAnswer?.transcript} />
          <TextField
            data-cy="transcript"
            variant="outlined"
            label="Transcript"
            fullWidth
            multiline
            disabled
            value={answer?.transcript}
            style={{ marginTop: 20, marginBottom: 20 }}
            InputLabelProps={{ shrink: true }}
          />
        </div>
        <div className={classes.row} style={{ marginLeft: 20 }}>
          <ChangeIcon i={answer?.status} e={curAnswer?.status} />
          <TextField
            data-cy="status"
            variant="outlined"
            label="Status"
            fullWidth
            multiline
            disabled
            value={answer?.status}
            style={{ marginTop: 20, marginBottom: 20 }}
            InputLabelProps={{ shrink: true }}
          />
        </div>
        <ListSubheader>Media</ListSubheader>
        <List data-cy="answer-media" dense disablePadding>
          {answer?.media?.map((m, i) => {
            const curMedia = curAnswer?.media?.find(
              (mm) => mm.tag === m.tag && mm.type === m.type
            );
            return (
              <ListItem key={`answer-media-${i}`} data-cy={`answer-media-${i}`}>
                <ListItemIcon>
                  <ChangeIcon i={m} e={curMedia} />
                </ListItemIcon>
                <ListItemText
                  primary={`${m.type} ${m.tag}`}
                  secondary={m.url}
                />
              </ListItem>
            );
          })}
          {curAnswer?.media
            ?.filter(
              (mm) =>
                !answer?.media?.find(
                  (m) => m.tag === mm.tag && m.type === mm.type
                )
            )
            .map((m, i) => {
              return (
                <ListItem
                  key={`removed-answer-media-${i}`}
                  data-cy={`removed-answer-media-${i}`}
                >
                  <ListItemIcon>
                    <ChangeIcon i={undefined} e={m} />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${m.tag} ${m.type}`}
                    secondary={m.url}
                  />
                </ListItem>
              );
            })}
        </List>
      </Collapse>
    </Card>
  );
}
