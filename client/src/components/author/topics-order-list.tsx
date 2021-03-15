/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState } from "react";
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
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import DragHandleIcon from "@material-ui/icons/DragHandle";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { Subject, Topic } from "types";

export function TopicsOrderList(props: {
  classes: any;
  subject: Subject;
  updateTopics: (val: Topic[]) => void;
}): JSX.Element {
  const { classes, subject, updateTopics } = props;
  const [topicSearch, setTopicSearch] = useState<Topic>();
  const [expanded, setExpanded] = useState(false);
  const topics = subject.topicsOrder;
  const topicOptions = (subject.topics || []).filter(
    (t) => topics.find((x) => x._id === t._id) === undefined
  );

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

  function addTopic(val: Topic) {
    updateTopics([...topics, val]);
    setTopicSearch(undefined);
  }

  const removeTopic = (idx: number) => {
    topics.splice(idx, 1);
    updateTopics([...topics]);
  };

  return (
    <Card
      elevation={0}
      className={classes.flexFixedChild}
      style={{ textAlign: "left" }}
    >
      <div style={{ display: "flex", flexDirection: "row" }}>
        <Typography variant="body2" style={{ flexShrink: 0, padding: 15 }}>
          Topic Order
        </Typography>
        <IconButton
          id="expand"
          size="small"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          <ExpandMoreIcon
            style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
          />
        </IconButton>
      </div>
      <CardContent style={{ padding: 0 }}>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
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
                          <Card style={{ width: "100%" }}>
                            <CardContent
                              style={{ display: "flex", flexDirection: "row" }}
                            >
                              <DragHandleIcon style={{ marginRight: 15 }} />
                              <Typography style={{ flexGrow: 1 }}>
                                {t.name}
                              </Typography>
                              <IconButton
                                onClick={() => removeTopic(i)}
                                style={{ padding: 0 }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </CardContent>
                          </Card>
                        </ListItem>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </List>
              )}
            </Droppable>
          </DragDropContext>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <Autocomplete
              id="topic-input"
              options={topicOptions}
              getOptionLabel={(option: Topic) => option.name}
              onChange={(e, v) => {
                setTopicSearch(v || undefined);
              }}
              style={{ width: "100%" }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder="Choose an existing topic to add?"
                />
              )}
            />
            <Button
              id="add-topic"
              startIcon={<AddIcon />}
              className={classes.button}
              disabled={topicSearch === undefined}
              onClick={() => addTopic(topicSearch!)}
            >
              Add Topic
            </Button>
          </div>
        </Collapse>
      </CardContent>
    </Card>
  );
}

export default TopicsOrderList;
