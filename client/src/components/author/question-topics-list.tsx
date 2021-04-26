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
import { Topic } from "types";

export function TopicsList(props: {
  classes: Record<string, string>;
  allTopics: Topic[];
  questionTopics: Topic[];
  updateTopics: (val: Topic[]) => void;
}): JSX.Element {
  const { classes, questionTopics, allTopics } = props;
  const [topicSearch, setTopicSearch] = useState<Topic>();

  function addTopic(val: Topic) {
    props.updateTopics([...questionTopics, val]);
  }

  const removeTopic = (val: Topic) => {
    const idx = questionTopics.findIndex((t) => t.id === val.id);
    if (idx !== -1) {
      questionTopics.splice(idx, 1);
      props.updateTopics([...questionTopics]);
    }
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
      <List data-cy="question-topics-list">
        <ListSubheader>Topics</ListSubheader>
        {questionTopics.map((t, i) => {
          const topicName =
            allTopics.find((topic) => topic.id === t.id)?.name || "";
          return (
            <ListItem key={`topic-${i}`} data-cy={`topic-${i}`}>
              <div>
                <ListItemText
                  data-cy="topic-name"
                  data-test={topicName}
                  primary={topicName}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    data-cy="delete-topic"
                    edge="end"
                    size="small"
                    onClick={() => removeTopic(t)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </div>
            </ListItem>
          );
        })}
      </List>
      <div className={classes.row} style={{ marginLeft: 5 }}>
        <Autocomplete
          data-cy="topic-input"
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
          data-cy="question-topics-list-add-topic"
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
