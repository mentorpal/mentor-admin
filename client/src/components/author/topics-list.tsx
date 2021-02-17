import clsx from "clsx";
import React, { useState } from "react";
import {
  Paper,
  Typography,
  List,
  ListItem,
  Button,
  Card,
  CardActions,
  CardContent,
  Collapse,
  IconButton,
  TextField,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import AddIcon from "@material-ui/icons/Add";
import ClearOutlinedIcon from "@material-ui/icons/ClearOutlined";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import { Topic } from "types";
import { fetchTopics } from "api";

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
            <IconButton id="delete" size="small" onClick={removeTopic}>
              <ClearOutlinedIcon />
            </IconButton>
            <IconButton
              id="expand"
              size="small"
              aria-expanded={expanded}
              className={clsx(classes.expand, {
                [classes.expandOpen]: expanded,
              })}
              onClick={() => setExpanded(!expanded)}
            >
              <ExpandMoreIcon />
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
  updateTopics: (val: Topic[]) => void;
}): JSX.Element {
  const { classes, topics, updateTopics } = props;
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [topicSearch, setTopicSearch] = useState<Topic>();

  React.useEffect(() => {
    fetchTopics().then((t) => setAllTopics(t.edges.map((e) => e.node)));
  }, []);

  function replaceItem<T>(a: Array<T>, index: number, item: T): Array<T> {
    const newArr = [...a];
    newArr[index] = item;
    return newArr;
  }

  function updateTopic(val: Topic, idx: number) {
    updateTopics(
      replaceItem(topics, idx, {
        ...topics[idx],
        ...val,
      })
    );
  }

  function addTopic(val?: Topic) {
    updateTopics([
      ...topics,
      {
        _id: val?._id || "",
        name: val?.name || "",
        description: val?.description || "",
      },
    ]);
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
      <Typography variant="body2" style={{ padding: 15 }}>
        Topics
      </Typography>
      <List id="topics" className={classes.list}>
        {topics.map((t, i) => (
          <ListItem id={`topic-${i}`}>
            <TopicCard
              classes={classes}
              topic={t}
              editTopic={(val: Topic) => {
                updateTopic(val, i);
              }}
              removeTopic={() => {
                removeTopic(i);
              }}
            />
          </ListItem>
        ))}
      </List>
      <div style={{ display: "flex", flexDirection: "row" }}>
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
              placeholder="Choose an existing topic to add?"
            />
          )}
        />
        <Button
          id="add-topic"
          startIcon={<AddIcon />}
          className={classes.button}
          onClick={() => addTopic(topicSearch)}
        >
          {topicSearch ? "Add Topic" : "New Topic"}
        </Button>
      </div>
    </Paper>
  );
}

export default TopicsList;
