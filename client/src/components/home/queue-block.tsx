/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
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
} from "@material-ui/core";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import { QuestionState } from "store/slices/questions";
import clsx from "clsx";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

export default function QueueBlockItem(props: {
  classes: Record<string, string>;
  queueIDList: unknown;
  mentorQuestions: Record<string, QuestionState>;
  onRecordAll: () => void;
  onRecordOne: () => void;
}): JSX.Element {
  const [isExpanded, setExpanded] = React.useState(false);
  const { classes, queueIDList, mentorQuestions, onRecordAll, onRecordOne } = props;
  const queueQus = getQueueQuestions(queueIDList, mentorQuestions);

  function getQueueQuestions(
    queueIDList: unknown,
    mentorQuestions: Record<string, QuestionState>
  ) {
    const queueQuestions: string[] = [];
    {
      for (var i = 0; i < (queueIDList as string[]).length; i++) {
        queueQuestions.push(
          mentorQuestions[(queueIDList as string[])[i]].question?.question || ""
        );
      }
    }
    return queueQuestions;
  }

  return (
    <Paper className={classes.paper}>
      <div
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
                    data-cy="expand-btn"
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
                  Queued ({queueQus.length})
                </Typography>
                <CardActions>
                  <Button
                    data-cy="record-all"
                    variant="outlined"
                    onClick={onRecordAll}
                    disabled={(queueIDList as string[]).length === 0}
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
                <List data-cy="question-list" style={{ border: 1 }}>
                  {queueQus.map((qu, i) => {
                    return (
                      <ListItem
                        key={`item-${i}-${qu}`}
                        style={{ backgroundColor: "#eee" }}
                      >
                        <div>
                          <ListItemText
                            primary={"This Question"} // question goes here
                            style={{ marginRight: 100 }}
                          />
                          <ListItemSecondaryAction>
                            <Button
                              data-cy="record-one"
                              variant="outlined"
                              endIcon={<PlayArrowIcon />}
                              onClick={() => onRecordOne()}
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
