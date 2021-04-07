/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState } from "react";
import {
  Paper,
  List,
  ListItem,
  Button,
  IconButton,
  TextField,
  ListItemText,
  ListItemSecondaryAction,
  ListSubheader,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import { Subject, Topic } from "types";

export function TopicsList(props: {
  classes: any;
  subject: Subject;
  topics: Topic[];
  updateTopics: (val: Topic[]) => void;
}): JSX.Element {
  const { classes, subject, topics, updateTopics } = props;
  const [topicSearch, setTopicSearch] = useState<Topic>();
  const allTopics = subject.topics;

  function addTopic(val: Topic) {
    updateTopics([...topics, val]);
  }

  const removeTopic = (idx: number) => {
    topics.splice(idx, 1);
    updateTopics([...topics]);
  };

  return (
    <Paper
      elevation={0}
      style={{
        textAlign: "left",
        borderRadius: 10,
        border: "1px solid #ccc",
        marginTop: 25,
      }}
    >
      <List id="topics">
        <ListSubheader>Topics</ListSubheader>
        {topics.map((t, i) => (
          <ListItem key={`topic-${i}`} id={`topic-${i}`}>
            <ListItemText primary={t.name} />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                size="small"
                onClick={() => {
                  removeTopic(i);
                }}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          marginLeft: 5,
        }}
      >
        <Autocomplete
          id="topic-input"
          options={allTopics}
          getOptionLabel={(option: Topic) => option.name}
          onChange={(e, v) => {
            setTopicSearch(v || undefined);
          }}
          style={{ width: "100%" }}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              placeholder="Choose a topic to add"
            />
          )}
        />
        <Button
          id="add-topic"
          startIcon={<AddIcon />}
          className={classes.button}
          disabled={!topicSearch}
          onClick={() => addTopic(topicSearch!)}
        >
          Add Topic
        </Button>
      </div>
    </Paper>
  );
}

export default TopicsList;
