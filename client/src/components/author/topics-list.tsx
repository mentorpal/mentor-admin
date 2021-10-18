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
  CardActions,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { Topic } from "types";
import { onTextInputChanged } from "helpers";

export function TopicCard(props: {
  classes: Record<string, string>;
  topic: Topic;
  editTopic: (val: Topic) => void;
  removeTopic: (val: Topic) => void;
}): JSX.Element {
  const { classes, topic } = props;
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
            onChange={(e) =>
              onTextInputChanged(e, () => {
                props.editTopic({ ...topic, name: e.target.value });
              })
            }
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
              onClick={() => props.removeTopic(topic)}
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
              onTextInputChanged(e, () => {
                props.editTopic({ ...topic, description: e.target.value });
              })
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
  topics: Topic[];
  addTopic: () => void;
  editTopic: (val: Topic) => void;
  removeTopic: (val: Topic) => void;
  moveTopic: (toMove: number, moveTo: number) => void;
}): JSX.Element {
  const { classes } = props;

  function onDragEnd(result: DropResult) {
    if (!result.destination) {
      return;
    }
    props.moveTopic(result.source.index, result.destination.index);
  }

  return (
    <div style={{ width: "100%" }}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <List
              data-cy="topics-list"
              ref={provided.innerRef}
              className={classes.list}
              {...provided.droppableProps}
            >
              {props.topics.map((t, i) => (
                <Draggable
                  index={i}
                  key={`topic-${i}`}
                  draggableId={`topic-${i}`}
                >
                  {(provided) => (
                    <ListItem
                      data-cy={`topic-${i}`}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <TopicCard
                        classes={classes}
                        topic={t}
                        editTopic={props.editTopic}
                        removeTopic={props.removeTopic}
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
      <Button
        data-cy="topics-list-add-topic"
        startIcon={<AddIcon />}
        className={classes.button}
        variant="outlined"
        color="primary"
        onClick={props.addTopic}
      >
        Add Topic
      </Button>
    </div>
  );
}

export default TopicsList;
