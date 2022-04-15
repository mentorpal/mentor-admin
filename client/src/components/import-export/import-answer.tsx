/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState } from "react";
import {
  Button,
  Card,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  makeStyles,
  Typography,
} from "@material-ui/core";
import {
  ExpandMore as ExpandMoreIcon,
  ErrorOutline as ErrorOutlineIcon,
} from "@material-ui/icons";
import { EditType, ImportPreview, Media } from "types";
import { ChangeIcon } from "./icons";
import { AnswerGQL } from "types-gql";

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
    justifyContent: "space-evenly",
    width: "100%",
  },
}));

export default function AnswerImport(props: {
  preview: ImportPreview<AnswerGQL>;
  oldAnswersToRemove: AnswerGQL[];
  toggleRemoveOldAnswer: (a: AnswerGQL) => void;
  replaceNewAnswer: (a: AnswerGQL) => void;
}): JSX.Element {
  const classes = useStyles();
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    preview,
    oldAnswersToRemove,
    toggleRemoveOldAnswer,
    replaceNewAnswer,
  } = props;
  const { editType, importData: answer, curData: curAnswer } = preview;
  const [originalAnswer] = useState<AnswerGQL | undefined>(curAnswer);
  const [newAnswer] = useState<AnswerGQL | undefined>(answer);
  const originalTranscript = originalAnswer?.transcript || "";
  const newTranscript = newAnswer?.transcript || "";
  if (!(answer || curAnswer)) {
    return <div />;
  }

  const media: ImportPreview<Media>[] = [];
  answer?.media?.forEach((m) => {
    const curMedia = curAnswer?.media?.find(
      (mm) => mm.tag === m.tag && mm.type === m.type
    );
    media.push({
      editType: !curMedia ? EditType.ADDED : EditType.NONE,
      importData: m,
      curData: curMedia,
    });
  });
  curAnswer?.media
    ?.filter(
      (mm) =>
        !answer?.media?.find((m) => m.type === mm.type && m.tag === mm.tag)
    )
    .forEach((m) => {
      media.push({
        editType:
          editType === EditType.REMOVED ? EditType.NONE : EditType.REMOVED,
        importData: undefined,
        curData: m,
      });
    });
  const answerPendingRemoval = Boolean(
    oldAnswersToRemove.find(
      (oldAnswer) => oldAnswer.question._id === curAnswer?.question._id
    )
  );
  const changedAnswer = Boolean(
    originalAnswer &&
      newAnswer &&
      originalAnswer?.transcript !== newAnswer?.transcript
  );
  const newAnswerChosen = answer?.transcript !== originalAnswer?.transcript;
  return (
    <Card
      data-cy="answer"
      className={classes.root}
      style={{ opacity: answerPendingRemoval ? 0.5 : 1 }}
    >
      <div className={classes.row}>
        <ChangeIcon preview={preview} />
        <div
          style={{
            marginRight: 10,
            width: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Typography align="left" variant="body1">
            {answer?.question?.question || curAnswer?.question?.question}
          </Typography>
          {changedAnswer ? (
            <>
              <Typography
                align="left"
                variant="caption"
                style={{
                  opacity: !newAnswerChosen ? 0.5 : 1,
                  fontWeight: !newAnswerChosen ? "normal" : "bold",
                }}
              >
                {newTranscript
                  ? `${newTranscript.substring(0, 200)}${
                      newTranscript.length > 200 ? "..." : ""
                    }`
                  : "--no transcript--"}
              </Typography>
              <Button
                variant="contained"
                style={{
                  backgroundColor: "lightblue",
                  padding: 0,
                  textTransform: "none",
                  marginTop: "5px",
                  marginBottom: "5px",
                  width: "150px",
                }}
                onClick={() => {
                  if (newAnswerChosen && originalAnswer) {
                    replaceNewAnswer(originalAnswer);
                  } else if (!newAnswerChosen && newAnswer) {
                    replaceNewAnswer(newAnswer);
                  }
                }}
              >
                {newAnswerChosen
                  ? "Switch to old answer"
                  : "Switch to new answer"}
              </Button>
              <Typography
                align="left"
                variant="caption"
                style={{
                  opacity: newAnswerChosen ? 0.5 : 1,
                  fontWeight: newAnswerChosen ? "normal" : "bold",
                }}
              >
                {originalTranscript
                  ? `${originalTranscript.substring(0, 200)}${
                      originalTranscript.length > 200 ? "..." : ""
                    }`
                  : "--no transcript--"}
              </Typography>
            </>
          ) : (
            <Typography align="left" variant="caption">
              {`${(newTranscript || originalTranscript).substring(0, 200)}${
                (newTranscript || originalTranscript).length > 200 ? "..." : ""
              }`}
            </Typography>
          )}
        </div>
        {editType === EditType.OLD_ANSWER && curAnswer ? (
          <>
            {answerPendingRemoval ? "Flagged for removal" : ""}
            <Button
              data-cy="remove-old-answer"
              variant="contained"
              style={{
                backgroundColor: answerPendingRemoval ? "lightblue" : "red",
                padding: "3px",
                fontWeight: "bold",
              }}
              onClick={() => {
                toggleRemoveOldAnswer(curAnswer);
              }}
            >
              {answerPendingRemoval ? "Undo" : "Remove"}
            </Button>
          </>
        ) : undefined}
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
        {media?.filter((m) => m.importData?.needsTransfer)?.length || 0} needs
        transferring
        <List data-cy="answer-media" dense disablePadding>
          {media.map((m, i) => {
            return (
              <ListItem key={`media-${i}`} data-cy={`media-${i}`}>
                <ListItemIcon>
                  <ChangeIcon preview={m} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    m.importData
                      ? `${m.importData.type} ${m.importData.tag}`
                      : `${m.curData?.type} ${m.curData?.tag}`
                  }
                  secondary={m.importData?.url || m.curData?.url}
                />
                {m.importData?.needsTransfer ? (
                  <ListItemIcon>
                    <ErrorOutlineIcon />
                  </ListItemIcon>
                ) : undefined}
              </ListItem>
            );
          })}
        </List>
      </Collapse>
    </Card>
  );
}
