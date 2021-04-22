/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import clsx from "clsx";
import React from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "react-beautiful-dnd";
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

export function TopicCard(props: {
  classes: Record<string, string>;
  topic: Topic;
  editTopic: (val: Topic) => void;
  removeTopic: (val: Topic) => void;
}): JSX.Element {
  const { classes, topic, editTopic, removeTopic } = props;
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Card style={{ width: "100%" }}>
      <CardContent>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <TextField
            data-cy="topic-name"
            data-test={topic.name}
            label="Topic"
            variant="outlined"
            value={topic.name}
            onChange={(e) => editTopic({ ...topic, name: e.target.value })}
            fullWidth
            multiline
          />
          <CardActions>
            <IconButton
              data-cy="toggle-topic"
              size="small"
              className={clsx(classes.expand, {
                [classes.expandOpen]: expanded,
              })}
              onClick={() => setExpanded(!expanded)}
            >
              <ExpandMoreIcon />
            </IconButton>
            <IconButton
              data-cy="delete-topic"
              size="small"
              onClick={() => removeTopic(topic)}
            >
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
            data-cy="topic-description"
            data-test={topic.description}
            label="Description"
            variant="outlined"
            value={topic.description}
            onChange={(e) =>
              editTopic({ ...topic, description: e.target.value })
            }
            fullWidth
            multiline
          />
        </Collapse>
      </CardContent>
    </Card>
  );
}

export function TopicsList(props: {
  classes: Record<string, string>;
  maxHeight: number;
  expanded: boolean;
  topics: Topic[];
  toggleExpanded: () => void;
  addTopic: () => void;
  editTopic: (val: Topic) => void;
  removeTopic: (val: Topic) => void;
  moveTopic: (toMove: number, moveTo: number) => void;
}): JSX.Element {
  const {
    classes,
    expanded,
    maxHeight,
    topics,
    toggleExpanded,
    addTopic,
    editTopic,
    removeTopic,
    moveTopic,
  } = props;

  function onDragEnd(result: DropResult) {
    if (!result.destination) {
      return;
    }
    moveTopic(result.source.index, result.destination.index);
  }

  return (
    <Card
      elevation={0}
      className={classes.flexChild}
      style={{ textAlign: "left" }}
    >
      <div className={classes.row}>
        <IconButton
          data-cy="toggle-topics"
          size="small"
          onClick={props.toggleExpanded}
        >
          <ExpandMoreIcon
            style={{
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            }}
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
                {(provided) => (
                  <List
                    data-cy="topics-list"
                    ref={provided.innerRef}
                    className={classes.list}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...provided.droppableProps}
                  >
                    {topics.map((t, i) => (
                      <Draggable
                        index={i}
                        key={`topic-${i}`}
                        draggableId={`topic-${i}`}
                      >
                        {(p) => (
                          <ListItem
                            data-cy={`topic-${i}`}
                            ref={provided.innerRef}
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...provided.draggableProps}
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...provided.dragHandleProps}
                          >
                            <TopicCard
                              classes={classes}
                              topic={t}
                              editTopic={editTopic}
                              removeTopic={removeTopic}
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
              data-cy="topics-list-add-topic"
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
