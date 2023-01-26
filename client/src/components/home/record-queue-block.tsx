/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect } from "react";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import clsx from "clsx";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import { navigate } from "gatsby-link";
import { urlBuild } from "helpers";
import { Answer } from "types";
import useQuestions from "store/slices/questions/useQuestions";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import { QuestionState } from "store/slices/questions";

export default function RecordQueueBlock(props: {
  classes: Record<string, string>;
  accessToken: string;
  recordQueue: string[];
  removeFromQueue: (questionId: string) => void;
  expandLists: boolean;
}): JSX.Element {
  const { recordQueue, removeFromQueue } = props;
  const { getData } = useActiveMentor();
  const mentorAnswers: Answer[] = getData((state) => state.data?.answers);
  const mentorQuestions = useQuestions(
    (state) => state.questions,
    mentorAnswers?.map((a) => a.question)
  );

  const [isExpanded, setExpanded] = React.useState(false);
  const [recordQueueTexts, setRecordQueueTexts] = React.useState<string[]>([]);
  const { classes } = props;

  useEffect(() => {
    setExpanded(props.expandLists);
  }, [props.expandLists]);

  function onRecordOne(questionId: string) {
    navigate(
      urlBuild("/record", {
        videoId: questionId,
        back: urlBuild("/", {}),
      })
    );
  }

  function onRecordAll(recordQueue: string[]) {
    let link = "/record?";
    for (let i = 0; i < recordQueue.length; i++) {
      link += "videoId=" + recordQueue[i];
      if (i != recordQueue.length - 1) {
        link += "&";
      }
    }
    navigate(link);
  }

  function getQueueQuestions(
    queueIDList: string[],
    mentorQuestions: Record<string, QuestionState>
  ) {
    return queueIDList.map(
      (id) => mentorQuestions[id]?.question?.question || ""
    );
  }

  useEffect(() => {
    if (!mentorQuestions) {
      return;
    }
    setRecordQueueTexts(getQueueQuestions(recordQueue, mentorQuestions));
  }, [recordQueue, mentorQuestions]);

  return (
    <Paper className={classes.paper}>
      <div
        data-cy="queue-block"
        style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
      >
        <Typography data-cy="block-name" variant="h6" className={classes.title}>
          My Priorities
        </Typography>
      </div>
      <Typography data-cy="block-description" className={classes.subtitle}>
        These are question you flagged as important to answer.
      </Typography>
      <div style={{ marginTop: 10 }}>
        <div style={{ flex: "auto" }}>
          <Card elevation={0} style={{ textAlign: "left" }}>
            <CardContent style={{ padding: 0 }}>
              <div style={{ display: "flex", flexDirection: "row" }}>
                <CardActions>
                  <IconButton
                    data-cy="queue-expand-btn"
                    size="small"
                    aria-expanded={isExpanded}
                    className={clsx(classes.expand, {
                      [classes.expandOpen]: isExpanded,
                    })}
                    onClick={() => setExpanded(!isExpanded)}
                  >
                    <ExpandMoreIcon />
                  </IconButton>
                </CardActions>
                <Typography
                  data-cy="header"
                  variant="h6"
                  style={{ padding: 15 }}
                >
                  Queued ({recordQueueTexts.length})
                </Typography>
                <CardActions>
                  <Button
                    data-cy="record-all-queue"
                    variant="outlined"
                    onClick={() => onRecordAll(recordQueue)}
                    disabled={!recordQueueTexts.length}
                  >
                    Record All
                  </Button>
                </CardActions>
              </div>
              <Collapse
                in={isExpanded}
                timeout="auto"
                unmountOnExit
                style={{ paddingLeft: 15, paddingTop: 10 }}
              >
                <List data-cy="queue-list" style={{ border: 1 }}>
                  {recordQueueTexts.map((questionText, i) => {
                    return (
                      <ListItem
                        data-cy={`question-${i}`}
                        key={`item-${i}-${questionText}`}
                        style={{ backgroundColor: "#eee" }}
                      >
                        <div>
                          <ListItemText
                            primary={
                              <>
                                <Button
                                  onClick={() => {
                                    removeFromQueue(recordQueue[i]);
                                  }}
                                >
                                  <CloseIcon />
                                </Button>
                                {questionText}
                              </>
                            }
                            style={{ marginRight: 100 }}
                          />
                          <ListItemSecondaryAction>
                            <Button
                              data-cy={`record-one-${i}`}
                              variant="outlined"
                              endIcon={<PlayArrowIcon />}
                              onClick={() => onRecordOne(recordQueue[i])}
                            >
                              Record
                            </Button>
                          </ListItemSecondaryAction>
                        </div>
                      </ListItem>
                    );
                  })}
                </List>
              </Collapse>
            </CardContent>
          </Card>
        </div>
      </div>
    </Paper>
  );
}
