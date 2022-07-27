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
import clsx from "clsx";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { navigate } from "gatsby-link";
import { urlBuild } from "helpers";

export default function QueueBlockItem(props: {
  classes: Record<string, string>;
  queueIDList: unknown;
  queuedQuestions: string[];
}): JSX.Element {
  const [isExpanded, setExpanded] = React.useState(false);
  const { classes, queueIDList, queuedQuestions } = props;

  function onRecordOne(queueID: string) {
    navigate(
      urlBuild("/record", {
        videoId: queueID,
        back: urlBuild("/", {}),
      })
    );
  }

  function onRecordAll(queueIDList: string[]) {
    let link = "/record?";
    for (let i = 0; i < queueIDList.length; i++) {
      link += "videoId=" + queueIDList[i];
      if (i != queueIDList.length - 1) {
        link += "&";
      }
    }
    navigate(link);
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
                  Queued ({queuedQuestions.length})
                </Typography>
                <CardActions>
                  <Button
                    data-cy="record-all-queue"
                    variant="outlined"
                    onClick={() => onRecordAll(queueIDList as string[])}
                    disabled={
                      queuedQuestions.length == 0 ||
                      queuedQuestions == null ||
                      queuedQuestions == undefined
                    }
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
                  {queuedQuestions.map((qu, i) => {
                    return (
                      <ListItem
                        data-cy={`question-${i}`}
                        key={`item-${i}-${qu}`}
                        style={{ backgroundColor: "#eee" }}
                      >
                        <div>
                          <ListItemText
                            primary={qu}
                            style={{ marginRight: 100 }}
                          />
                          <ListItemSecondaryAction>
                            <Button
                              data-cy={`record-one-${i}`}
                              variant="outlined"
                              endIcon={<PlayArrowIcon />}
                              onClick={() =>
                                onRecordOne((queueIDList as string[])[i])
                              }
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
