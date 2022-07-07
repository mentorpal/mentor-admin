/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "react-beautiful-dnd";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  makeStyles,
  Tab,
  TextField,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import LaunchIcon from "@material-ui/icons/Launch";
import { Autocomplete, TabContext, TabList, TabPanel } from "@material-ui/lab";

import NavBar from "components/nav-bar";
import { ErrorDialog, LoadingDialog } from "components/dialog";
import { launchMentor } from "helpers";
import { useWithMentorPanels } from "hooks/graphql/use-with-mentor-panels";
import { useWithConfig } from "hooks/graphql/use-with-config";
import { useWithMentors } from "hooks/graphql/use-with-mentors";
import { useWithWindowSize } from "hooks/use-with-window-size";
import withAuthorizationOnly from "hooks/wrap-with-authorization-only";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import { Config, MentorPanel, User, UserRole } from "types";
import { MentorGQL } from "types-gql";
import withLocation from "wrap-with-location";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: 0,
  },
  progress: {
    position: "fixed",
    top: "50%",
    left: "50%",
  },
  button: {
    width: 200,
    padding: 5,
    margin: theme.spacing(2),
  },
  tab: {
    width: "95%",
  },
  list: {
    background: "#F5F5F5",
  },
}));

function FeaturedMentors(props: {
  styles: Record<string, string>;
  config: Config;
  mentors: MentorGQL[];
  add: (id: string) => void;
  remove: (idx: number) => void;
  move: (toMove: number, moveTo: number) => void;
}): JSX.Element {
  const { styles, mentors } = props;
  const featuredMentors = props.config.featuredMentors || [];
  const { height: windowHeight } = useWithWindowSize();
  const [input, setInput] = useState<string>("");

  function onDragEnd(result: DropResult) {
    if (!result.destination) {
      return;
    }
    props.move(result.source.index, result.destination.index);
  }

  return (
    <div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <List
              data-cy="featured-mentors-list"
              ref={provided.innerRef}
              className={styles.list}
              style={{ height: windowHeight - 400, overflow: "auto" }}
              {...provided.droppableProps}
            >
              {featuredMentors.map((mId, i) => {
                const mentor = mentors.find((m) => m._id === mId);
                return (
                  <Draggable
                    index={i}
                    key={`featured-mentor-${i}`}
                    draggableId={`featured-mentor-${i}`}
                  >
                    {(provided) => (
                      <ListItem
                        data-cy={`featured-mentor-${i}`}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <Card style={{ width: "100%" }}>
                          <CardContent
                            style={{ display: "flex", flexDirection: "row" }}
                          >
                            <div style={{ flexGrow: 1 }}>
                              <ListItemText
                                primary={mentor?.name}
                                secondary={mentor?.title}
                              />
                            </div>
                            <CardActions>
                              <IconButton
                                data-cy="launch-featured-mentor"
                                size="small"
                                onClick={() => launchMentor(mId, true)}
                              >
                                <LaunchIcon />
                              </IconButton>
                              <IconButton
                                data-cy="delete-featured-mentor"
                                size="small"
                                onClick={() => props.remove(i)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </CardActions>
                          </CardContent>
                        </Card>
                      </ListItem>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>
      <Autocomplete
        data-cy="select-featured-mentor"
        style={{ marginTop: "10" }}
        options={mentors || []}
        onChange={(e, v) => setInput(v?._id || "")}
        getOptionLabel={(option: MentorGQL) => option.name}
        getOptionDisabled={(option: MentorGQL) =>
          featuredMentors.includes(option._id)
        }
        renderInput={(params) => (
          <TextField
            {...params}
            style={{ minWidth: 300, flexGrow: 1, marginTop: 10 }}
            variant="outlined"
          />
        )}
        renderOption={(option) => (
          <ListItemText primary={option.name} secondary={option.title} />
        )}
      />
      <Button
        data-cy="add-featured-mentor"
        color="primary"
        variant="outlined"
        startIcon={<AddIcon />}
        className={styles.button}
        disabled={!input || featuredMentors.includes(input)}
        onClick={() => props.add(input)}
      >
        Add Featured Mentor
      </Button>
    </div>
  );
}

function ActiveMentors(props: {
  styles: Record<string, string>;
  config: Config;
  mentors: MentorGQL[];
  add: (id: string) => void;
  remove: (idx: number) => void;
  move: (toMove: number, moveTo: number) => void;
}): JSX.Element {
  const { styles, mentors } = props;
  const activeMentors = props.config.activeMentors || [];
  const { height: windowHeight } = useWithWindowSize();
  const [input, setInput] = useState<string>("");

  function onDragEnd(result: DropResult) {
    if (!result.destination) {
      return;
    }
    props.move(result.source.index, result.destination.index);
  }

  return (
    <div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <List
              data-cy="active-mentors-list"
              ref={provided.innerRef}
              className={styles.list}
              style={{ height: windowHeight - 400, overflow: "auto" }}
              {...provided.droppableProps}
            >
              {activeMentors.map((mId, i) => {
                const mentor = mentors.find((m) => m._id === mId);
                return (
                  <Draggable
                    index={i}
                    key={`active-mentor-${i}`}
                    draggableId={`active-mentor-${i}`}
                  >
                    {(provided) => (
                      <ListItem
                        data-cy={`active-mentor-${i}`}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <Card style={{ width: "100%" }}>
                          <CardContent
                            style={{ display: "flex", flexDirection: "row" }}
                          >
                            <div style={{ flexGrow: 1 }}>
                              <ListItemText
                                primary={mentor?.name}
                                secondary={mentor?.title}
                              />
                            </div>
                            <CardActions>
                              <IconButton
                                data-cy="launch-active-mentor"
                                size="small"
                                onClick={() => launchMentor(mId, true)}
                              >
                                <LaunchIcon />
                              </IconButton>
                              <IconButton
                                data-cy="delete-active-mentor"
                                size="small"
                                onClick={() => props.remove(i)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </CardActions>
                          </CardContent>
                        </Card>
                      </ListItem>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>
      <Autocomplete
        data-cy="select-active-mentor"
        style={{ marginTop: "10" }}
        options={mentors || []}
        onChange={(e, v) => setInput(v?._id || "")}
        getOptionLabel={(option: MentorGQL) => option.name}
        getOptionDisabled={(option: MentorGQL) =>
          activeMentors.includes(option._id)
        }
        renderInput={(params) => (
          <TextField
            {...params}
            style={{ minWidth: 300, flexGrow: 1, marginTop: 10 }}
            variant="outlined"
          />
        )}
        renderOption={(option) => (
          <ListItemText primary={option.name} secondary={option.title} />
        )}
      />
      <Button
        data-cy="add-active-mentor"
        color="primary"
        variant="outlined"
        startIcon={<AddIcon />}
        className={styles.button}
        disabled={!input || activeMentors.includes(input)}
        onClick={() => props.add(input)}
      >
        Add Active Mentor
      </Button>
    </div>
  );
}

function FeaturedMentorPanels(props: {
  styles: Record<string, string>;
  config: Config;
  mentors: MentorGQL[];
  mentorPanels: MentorPanel[];
  add: (id: string) => void;
  remove: (idx: number) => void;
  move: (toMove: number, moveTo: number) => void;
}): JSX.Element {
  const { styles, mentorPanels } = props;
  const featuredMentorPanels = props.config.featuredMentorPanels || [];
  const { height: windowHeight } = useWithWindowSize();
  const [input, setInput] = useState<string>("");

  function onDragEnd(result: DropResult) {
    if (!result.destination) {
      return;
    }
    props.move(result.source.index, result.destination.index);
  }

  return (
    <div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <List
              data-cy="featured-mentor-panels-list"
              ref={provided.innerRef}
              className={styles.list}
              style={{ height: windowHeight - 400, overflow: "auto" }}
              {...provided.droppableProps}
            >
              {featuredMentorPanels.map((mId, i) => {
                const panel = mentorPanels.find((m) => m._id === mId);
                return (
                  <Draggable
                    index={i}
                    key={`featured-mentor-panel-${i}`}
                    draggableId={`featured-mentor-panel-${i}`}
                  >
                    {(provided) => (
                      <ListItem
                        data-cy={`featured-mentor-panel-${i}`}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <MentorPanelCard
                          panel={panel!}
                          i={i}
                          styles={styles}
                          remove={props.remove}
                        />
                      </ListItem>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </List>
          )}
        </Droppable>
      </DragDropContext>
      <Autocomplete
        data-cy="select-featured-mentor-panel"
        style={{ marginTop: "10" }}
        options={mentorPanels || []}
        onChange={(e, v) => setInput(v?._id || "")}
        getOptionLabel={(option: MentorPanel) => option.title}
        getOptionDisabled={(option: MentorPanel) =>
          featuredMentorPanels.includes(option._id)
        }
        renderInput={(params) => (
          <TextField
            {...params}
            style={{ minWidth: 300, flexGrow: 1, marginTop: 10 }}
            variant="outlined"
          />
        )}
        renderOption={(option) => (
          <ListItemText primary={option.title} secondary={option.subtitle} />
        )}
      />
      <Button
        data-cy="add-featured-mentor"
        color="primary"
        variant="outlined"
        startIcon={<AddIcon />}
        className={styles.button}
        disabled={!input || featuredMentorPanels.includes(input)}
        onClick={() => props.add(input)}
      >
        Add Featured Mentor Panel
      </Button>
    </div>
  );
}

function MentorPanelCard(props: {
  styles: Record<string, string>;
  i: number;
  panel: MentorPanel;
  remove: (idx: number) => void;
}): JSX.Element {
  const { styles, panel } = props;
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Card style={{ width: "100%" }}>
      <CardContent style={{ display: "flex", flexDirection: "row" }}>
        <div style={{ flexGrow: 1 }}>
          <ListItemText primary={panel?.title} secondary={panel?.subtitle} />
        </div>
        <CardActions>
          <IconButton
            data-cy="toggle-mentor-panel"
            size="small"
            className={clsx(styles.expand, {
              [styles.expandOpen]: expanded,
            })}
            onClick={() => setExpanded(!expanded)}
          >
            <ExpandMoreIcon />
          </IconButton>
          <IconButton
            data-cy="launch-featured-mentor-panel"
            size="small"
            // onClick={() => launchMentor(mId, true)}
          >
            <LaunchIcon />
          </IconButton>
          <IconButton
            data-cy="delete-featured-mentor-panel"
            size="small"
            onClick={() => props.remove(props.i)}
          >
            <DeleteIcon />
          </IconButton>
        </CardActions>
      </CardContent>
    </Card>
  );
}

function ConfigPage(props: { accessToken: string; user: User }): JSX.Element {
  const styles = useStyles();
  const mentors = useWithMentors(props.accessToken);
  const mentorPanels = useWithMentorPanels();
  const config = useWithConfig(props.accessToken);
  const { switchActiveMentor } = useActiveMentor();
  const { height } = useWithWindowSize();

  const permissionToView =
    props.user.userRole === UserRole.ADMIN ||
    props.user.userRole === UserRole.CONTENT_MANAGER;
  const mentorArray = mentors.data?.edges.map((n) => n.node) || [];
  const mentorPanelArray = mentorPanels?.data?.edges.map((n) => n.node) || [];
  const [tab, setTab] = useState<string>("featured-mentors");

  useEffect(() => {
    switchActiveMentor();
  }, []);

  if (!permissionToView) {
    return (
      <div>You must be an admin or content manager to view this page.</div>
    );
  }
  if (!mentorPanels.data || !config.editedData || !mentors.data) {
    return (
      <div className={styles.root}>
        <CircularProgress className={styles.progress} />
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <NavBar title="Manage Config" />
      <TabContext value={tab}>
        <TabList onChange={(event, newValue) => setTab(newValue)}>
          <Tab
            label="Featured Mentors"
            value="featured-mentors"
            data-cy="toggle-featured-mentors"
          />
          <Tab
            label="Active Mentors"
            value="active-mentors"
            data-cy="toggle-active-mentors"
          />
          <Tab
            label="Featured Mentor Panels"
            value="featured-mentor-panels"
            data-cy="toggle-featured-mentor-panels"
          />
        </TabList>
        <TabPanel
          className={styles.tab}
          style={{ height: height - 250, overflow: "auto" }}
          value="featured-mentors"
        >
          <FeaturedMentors
            styles={styles}
            config={config.editedData}
            mentors={mentorArray}
            add={config.addFeaturedMentor}
            remove={config.removeFeaturedMentor}
            move={config.moveFeaturedMentor}
          />
        </TabPanel>
        <TabPanel
          className={styles.tab}
          style={{ height: height - 250, overflow: "auto" }}
          value="active-mentors"
        >
          <ActiveMentors
            styles={styles}
            config={config.editedData}
            mentors={mentorArray}
            add={config.addActiveMentor}
            remove={config.removeActiveMentor}
            move={config.moveActiveMentor}
          />
        </TabPanel>
        <TabPanel
          className={styles.tab}
          style={{ height: height - 250, overflow: "auto" }}
          value="featured-mentor-panels"
        >
          <FeaturedMentorPanels
            styles={styles}
            config={config.editedData}
            mentors={mentorArray}
            mentorPanels={mentorPanelArray}
            add={config.addFeaturedMentorPanel}
            remove={config.removeFeaturedMentorPanel}
            move={config.moveFeaturedMentorPanel}
          />
        </TabPanel>
      </TabContext>
      <Button
        data-cy="save-button"
        variant="contained"
        color="primary"
        className={styles.button}
        disabled={!config.isEdited}
        onClick={() => config.saveConfig()}
      >
        Save
      </Button>
      <ErrorDialog error={config.error} />
      <LoadingDialog title={config.isLoading ? "Loading..." : ""} />
    </div>
  );
}

export default withAuthorizationOnly(withLocation(ConfigPage));
