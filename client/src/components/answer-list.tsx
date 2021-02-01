/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import clsx from "clsx";
import React from "react";
import {
  Card,
  CardActions,
  CardContent,
  Checkbox,
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@material-ui/core";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { Answer } from "types";

function AnswerList(props: {
  id: string;
  header: string;
  answers: Answer[];
  classes: any;
}): JSX.Element {
  const { id, header, answers, classes } = props;
  const [isExpanded, setExpanded] = React.useState(answers.length > 0);

  return (
    <Card id={id} elevation={0} style={{ textAlign: "left" }}>
      <CardContent style={{ padding: 0 }}>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <CardActions>
            <IconButton
              id="expand-btn"
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
          <Typography variant="h6" style={{ padding: 15 }}>
            {header} ({answers.length})
          </Typography>
        </div>
        <Collapse
          in={isExpanded}
          timeout="auto"
          unmountOnExit
          style={{ paddingLeft: 15, paddingTop: 10 }}
        >
          <List id="list" style={{ border: 1 }}>
            {answers.map((answer: Answer, i: number) => (
              <ListItem
                key={`item-${i}`}
                id={`item-${i}`}
                style={{ backgroundColor: "#eee" }}
              >
                <ListItemIcon>
                  <Checkbox id="check" edge="start" />
                </ListItemIcon>
                <ListItemText
                  primary={answer.question.question}
                  secondary={answer.transcript}
                />
              </ListItem>
            ))}
          </List>
        </Collapse>
      </CardContent>
    </Card>
  );
}

export default AnswerList;
