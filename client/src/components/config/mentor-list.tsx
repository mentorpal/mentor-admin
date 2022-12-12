/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import {
  Card,
  CardActions,
  CardContent,
  Checkbox,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemText,
  makeStyles,
} from "@material-ui/core";
import LaunchIcon from "@material-ui/icons/Launch";
import DragHandleIcon from "@material-ui/icons/DragHandle";

import { launchMentor } from "helpers";
import { useWithWindowSize } from "hooks/use-with-window-size";
import { Config } from "types";
import { MentorGQL } from "types-gql";

const useStyles = makeStyles((theme) => ({
  button: {
    width: 200,
    padding: 5,
    margin: theme.spacing(2),
  },
  list: {
    background: "#F5F5F5",
  },
}));

function MentorItem(props: {
  config: Config;
  mentor: MentorGQL;
  toggleActive: (id: string) => void;
  toggleFeatured: (id: string) => void;
}): JSX.Element {
  const { config, mentor } = props;
  const featuredMentors = config.featuredMentors || [];
  const activeMentors = config.activeMentors || [];

  return (
    <Card style={{ width: "100%" }}>
      <CardContent
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <CardActions>
          <IconButton
            size="small"
            disabled={
              !config.activeMentors.includes(mentor._id) &&
              !config.featuredMentors.includes(mentor._id)
            }
          >
            <DragHandleIcon />
          </IconButton>
        </CardActions>
        <ListItemText
          data-cy="name"
          data-test={mentor.name}
          primary={mentor.name}
          secondary={mentor.title}
          style={{ flexGrow: 1 }}
        />
        <CardActions>
          <FormControlLabel
            control={
              <Checkbox
                data-cy="toggle-featured"
                checked={featuredMentors.includes(mentor._id)}
                onChange={() => props.toggleFeatured(mentor._id)}
                color="primary"
                style={{ padding: 0 }}
              />
            }
            label="Featured"
            labelPlacement="top"
          />
          <FormControlLabel
            control={
              <Checkbox
                data-cy="toggle-active"
                checked={activeMentors.includes(mentor._id)}
                onChange={() => props.toggleActive(mentor._id)}
                color="secondary"
                style={{ padding: 0 }}
              />
            }
            label="Active"
            labelPlacement="top"
          />
          <FormControlLabel
            control={
              <IconButton
                data-cy="launch-mentor"
                size="small"
                onClick={() => launchMentor(mentor._id, true)}
              >
                <LaunchIcon />
              </IconButton>
            }
            label="Launch"
            labelPlacement="top"
          />
        </CardActions>
      </CardContent>
    </Card>
  );
}

export function MentorList(props: {
  config: Config;
  mentors: MentorGQL[];
  move: (toMove: number, moveTo: number) => void;
  toggleActive: (id: string) => void;
  toggleFeatured: (id: string) => void;
}): JSX.Element {
  const styles = useStyles();
  const { mentors } = props;
  const { height: windowHeight } = useWithWindowSize();

  function onDragEnd(result: DropResult) {
    if (!result.destination) {
      return;
    }
    props.move(result.source.index, result.destination.index);
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable-mentors">
        {(provided) => (
          <List
            data-cy="mentors-list"
            ref={provided.innerRef}
            className={styles.list}
            style={{ height: windowHeight - 300, overflow: "auto" }}
            {...provided.droppableProps}
          >
            {mentors.map((m, i) => (
              <Draggable
                index={i}
                key={`mentor-${i}`}
                draggableId={`mentor-${i}`}
                isDragDisabled={
                  !props.config.activeMentors.includes(m._id) &&
                  !props.config.featuredMentors.includes(m._id)
                }
              >
                {(provided) => (
                  <ListItem
                    data-cy={`mentor-${i}`}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <MentorItem
                      mentor={m}
                      config={props.config}
                      toggleActive={props.toggleActive}
                      toggleFeatured={props.toggleFeatured}
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
  );
}
