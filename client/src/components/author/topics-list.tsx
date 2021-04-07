/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
import { v4 as uuid } from "uuid";
import {
  List,
  ListItem,
  Button,
  Card,
  CardContent,
  Collapse,
  IconButton,
  TextField,
  Typography,
  CardActions,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { Topic } from "types";
import clsx from "clsx";

export function TopicCard(props: {
  classes: any;
  topic: Topic;
  editTopic: (val: Topic) => void;
  removeTopic: () => void;
}) {
  const { classes, topic, editTopic, removeTopic } = props;
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Card style={{ width: "100%" }}>
      <CardContent>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <TextField
            id="edit-topic"
            label="Topic"
            variant="outlined"
            fullWidth
            value={topic.name || ""}
            onChange={(e) => editTopic({ ...topic, name: e.target.value })}
          />
          <CardActions>
            <IconButton
              size="small"
              className={clsx(classes.expand, {
                [classes.expandOpen]: expanded,
              })}
              onClick={() => setExpanded(!expanded)}
            >
              <ExpandMoreIcon />
            </IconButton>
            <IconButton size="small" onClick={removeTopic}>
              <DeleteIcon />
            </IconButton>
          </CardActions>
        </div>
        <Collapse
          in={expanded}
          timeout="auto"
          unmountOnExit
          style={{ padding: 25, paddingRight: 25 }}
        >
          <TextField
            id="edit-topic-description"
            label="Description"
            variant="outlined"
            fullWidth
            value={topic.description || ""}
            onChange={(e) =>
              editTopic({ ...topic, description: e.target.value })
            }
          />
        </Collapse>
      </CardContent>
    </Card>
  );
}

export function TopicsList(props: {
  classes: any;
  topics: Topic[];
  maxHeight: number;
  expanded: boolean;
  toggleExpanded: () => void;
  updateTopics: (val: Topic[]) => void;
}): JSX.Element {
  const {
    classes,
    topics,
    maxHeight,
    expanded,
    toggleExpanded,
    updateTopics,
  } = props;

  function addTopic() {
    updateTopics([
      ...topics,
      {
        id: uuid(),
        name: "",
        description: "",
      },
    ]);
  }

  function updateTopic(idx: number, newVal: Topic) {
    topics[idx] = newVal;
    updateTopics([...topics]);
  }

  const removeTopic = (idx: number) => {
    topics.splice(idx, 1);
    updateTopics([...topics]);
  };

  function onDragEnd(result: DropResult) {
    if (!result.destination) {
      return;
    }
    const startIdx = result.source.index;
    const endIdx = result.destination.index;
    const [removed] = topics.splice(startIdx, 1);
    topics.splice(endIdx, 0, removed);
    updateTopics([...topics]);
  }

  return (
    <Card
      elevation={0}
      className={classes.flexChild}
      style={{ textAlign: "left" }}
    >
      <div
        style={{ display: "flex", flexDirection: "row", alignItems: "center" }}
      >
        <IconButton
          id="expand"
          size="small"
          aria-expanded={expanded}
          onClick={toggleExpanded}
        >
          <ExpandMoreIcon
            style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </IconButton>
        <Typography variant="body2">Topics</Typography>
      </div>
      <CardContent style={{ padding: 0 }}>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <div
            style={{
              maxHeight: maxHeight - 70,
              overflow: "auto",
            }}
          >
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="droppable">
                {(provided, snapshot) => (
                  <List
                    {...provided.droppableProps}
                    id="topics"
                    ref={provided.innerRef}
                    className={classes.list}
                  >
                    {topics.map((t, i) => (
                      <Draggable
                        key={`topic-${i}`}
                        draggableId={`topic-${i}`}
                        index={i}
                      >
                        {(provided, snapshot) => (
                          <ListItem
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <TopicCard
                              classes={classes}
                              topic={t}
                              editTopic={(val: Topic) => {
                                updateTopic(i, val);
                              }}
                              removeTopic={() => {
                                removeTopic(i);
                              }}
                            />
                          </ListItem>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </List>
                )}
              </Droppable>
            </DragDropContext>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Button
              id="add-topic"
              startIcon={<AddIcon />}
              className={classes.button}
              variant="outlined"
              color="primary"
              onClick={addTopic}
            >
              Add Topic
            </Button>
          </div>
        </Collapse>
      </CardContent>
    </Card>
  );
}

export default TopicsList;
