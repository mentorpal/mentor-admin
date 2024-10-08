/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useState } from "react";
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
  Switch,
  TextField,
  Theme,
  Typography,
} from "@mui/material";
import { makeStyles } from "tss-react/mui";
import LaunchIcon from "@mui/icons-material/Launch";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import { Autocomplete } from "@mui/material";

import { launchMentor } from "helpers";
import { useWithWindowSize } from "hooks/use-with-window-size";
import { Config, Organization } from "types";
import { MentorGQL } from "types-gql";
import { uuid4 } from "@sentry/utils";

const useStyles = makeStyles({ name: { MentorItem } })((theme: Theme) => ({
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
  org: Organization | undefined;
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
          primary={
            mentor.isArchived ? `${mentor.name} (Archived)` : mentor.name
          }
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
                data-cy={`launch-mentor-${mentor._id}`}
                size="small"
                onClick={() =>
                  launchMentor(
                    mentor._id,
                    true,
                    undefined,
                    props.org?.subdomain
                  )
                }
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
  org: Organization | undefined;
  mentors: MentorGQL[];
  move: (toMove: number, moveTo: number) => void;
  toggleActive: (id: string) => void;
  toggleFeatured: (id: string) => void;
}): JSX.Element {
  const { classes: styles } = useStyles();
  const { mentors } = props;
  const { height: windowHeight } = useWithWindowSize();
  const [_mentors, setMentors] = useState<MentorGQL[]>(mentors);
  const [filter, setFilter] = useState<string>();
  const [viewArchivedMentors, setViewArchivedMentors] =
    useState<boolean>(false);

  useEffect(() => {
    if (viewArchivedMentors) {
      setMentors(
        [...mentors].sort((a, b) => {
          if (a.isArchived === b.isArchived) {
            return 0;
          }
          if (a.isArchived) {
            return 1;
          }
          return -1;
        })
      );
    } else {
      setMentors(mentors.filter((m) => !m.isArchived));
    }
  }, [mentors, viewArchivedMentors]);

  function onDragEnd(result: DropResult) {
    if (!result.destination) {
      return;
    }
    props.move(result.source.index, result.destination.index);
  }

  return (
    <div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable-mentors">
          {(provided) => (
            <List
              data-cy="mentors-list"
              ref={provided.innerRef}
              className={styles.list}
              style={{ height: windowHeight - 350, overflow: "auto" }}
              {...provided.droppableProps}
            >
              {_mentors
                .filter(
                  (m) =>
                    filter === undefined ||
                    m.name.toLowerCase().includes(filter.toLowerCase())
                )
                .map((m, i) => (
                  <Draggable
                    index={i}
                    key={`mentor-${i}`}
                    draggableId={`mentor-${i}`}
                    isDragDisabled={
                      Boolean(filter) ||
                      (!props.config.activeMentors.includes(m._id) &&
                        !props.config.featuredMentors.includes(m._id))
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
                          org={props.org}
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
      <Autocomplete
        data-cy="mentor-filter"
        freeSolo
        options={_mentors.map((e) => e.name)}
        onChange={(e, v) => setFilter(v || "")}
        style={{ width: "100%" }}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder="Search mentors"
          />
        )}
        renderOption={(props, option) => (
          <Typography
            {...props}
            data-cy={`panel-subject-${option}`}
            key={`${option}${uuid4()}`}
          >
            {option}
          </Typography>
        )}
      />
      <span style={{ margin: "15px" }}>
        View Archived Mentors
        <Switch
          data-cy="archive-mentor-switch"
          data-test={viewArchivedMentors}
          checked={viewArchivedMentors}
          onChange={() => setViewArchivedMentors(!viewArchivedMentors)}
        />
      </span>
    </div>
  );
}
