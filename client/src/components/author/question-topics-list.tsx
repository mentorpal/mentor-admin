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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { Category, Topic } from "types";
import { RowDiv } from "components/styled-components";
import { UseDefaultTopics } from "types-gql";

export function TopicsList(props: {
  classes: Record<string, string>;
  useDefaultTopics: UseDefaultTopics;
  updateUseDefaultTopics: (val: UseDefaultTopics) => void;
  allTopics: Topic[];
  questionTopics: Topic[];
  questionCategory?: Category;
  updateTopics: (val: Topic[]) => void;
}): JSX.Element {
  const {
    classes,
    questionTopics,
    allTopics,
    useDefaultTopics,
    updateUseDefaultTopics,
    questionCategory,
  } = props;
  const [topicSearch, setTopicSearch] = useState<Topic>();
  const shouldUseDefaultTopics =
    useDefaultTopics === UseDefaultTopics.TRUE ||
    (useDefaultTopics === UseDefaultTopics.DEFAULT &&
      questionTopics.length === 0);

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
        <RowDiv>
          <ListSubheader>Topics</ListSubheader>
          {questionCategory ? (
            <FormControl variant="standard" style={{ width: "150px" }}>
              <InputLabel id="select-default-topic-config-label">
                Use Default Topics
              </InputLabel>
              <Select
                labelId="select-default-topic-config-label"
                id="select-default-topic-config"
                value={useDefaultTopics}
                label="Age"
                onChange={(e) =>
                  updateUseDefaultTopics(e.target.value as UseDefaultTopics)
                }
              >
                <MenuItem value={UseDefaultTopics.DEFAULT}>DEFAULT</MenuItem>
                <MenuItem value={UseDefaultTopics.TRUE}>TRUE</MenuItem>
                <MenuItem value={UseDefaultTopics.FALSE}>FALSE</MenuItem>
              </Select>
            </FormControl>
          ) : undefined}
        </RowDiv>
        {shouldUseDefaultTopics &&
          questionCategory?.defaultTopics?.map((t, i) => {
            const topicName =
              allTopics.find((topic) => topic.id === t)?.name ||
              questionCategory.name;
            return (
              <ListItem key={`topic-${i}`} data-cy={`topic-${i}`}>
                <div>
                  <ListItemText
                    data-cy="topic-name"
                    data-test={`(Default) ${topicName}`}
                    primary={`(Default) ${topicName}`}
                  />
                </div>
              </ListItem>
            );
          })}
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
          options={allTopics.filter(
            (t) =>
              !questionCategory?.defaultTopics?.find((qt) => qt === t.id) &&
              !questionTopics.find((qt) => qt.id === t.id) &&
              !t.categoryParent // category specific topic should not be added
          )}
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
          onClick={() => {
            if (topicSearch) addTopic(topicSearch);
          }}
        >
          Add Topic
        </Button>
      </div>
    </Paper>
  );
}

export default TopicsList;
