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
  Button,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  makeStyles,
  Tab,
  TextField,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import LaunchIcon from "@material-ui/icons/Launch";
import DragHandleIcon from "@material-ui/icons/DragHandle";
import { Autocomplete, TabContext, TabList, TabPanel } from "@material-ui/lab";

import NavBar from "components/nav-bar";
import { ErrorDialog, LoadingDialog } from "components/dialog";
import {
  copyAndMove,
  copyAndRemove,
  launchMentor,
  launchMentorPanel,
} from "helpers";
import { useWithConfig } from "hooks/graphql/use-with-config";
import { useWithWindowSize } from "hooks/use-with-window-size";
import withAuthorizationOnly from "hooks/wrap-with-authorization-only";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import { Config, MentorPanel, User, UserRole } from "types";
import { MentorGQL, SubjectGQL } from "types-gql";
import withLocation from "wrap-with-location";
import { useWithSubjects } from "hooks/graphql/use-with-subjects";

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
  expand: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: "rotate(180deg)",
  },
}));

function MentorList(props: {
  styles: Record<string, string>;
  config: Config;
  mentors: MentorGQL[];
  moveMentor: (toMove: number, moveTo: number) => void;
  toggleActive: (id: string) => void;
  toggleFeatured: (id: string) => void;
}): JSX.Element {
  const { styles, mentors } = props;
  const featuredMentors = props.config.featuredMentors || [];
  const activeMentors = props.config.activeMentors || [];
  const { height: windowHeight } = useWithWindowSize();

  function onDragEnd(result: DropResult) {
    if (!result.destination) {
      return;
    }
    props.moveMentor(result.source.index, result.destination.index);
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
              >
                {(provided) => (
                  <ListItem
                    data-cy={`mentor-${i}`}
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <Card style={{ width: "100%" }}>
                      <CardContent
                        style={{
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <CardActions>
                          <IconButton size="small">
                            <DragHandleIcon />
                          </IconButton>
                        </CardActions>
                        <ListItemText
                          primary={m.name}
                          secondary={m.title}
                          style={{ flexGrow: 1 }}
                        />
                        <CardActions>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={featuredMentors.includes(m._id)}
                                onChange={() => props.toggleFeatured(m._id)}
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
                                checked={activeMentors.includes(m._id)}
                                onChange={() => props.toggleActive(m._id)}
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
                                onClick={() => launchMentor(m._id, true)}
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

function MentorPanelList(props: {
  styles: Record<string, string>;
  config: Config;
  mentors: MentorGQL[];
  mentorPanels: MentorPanel[];
  subjects: SubjectGQL[];
  moveMentorPanel: (toMove: number, moveTo: number) => void;
  toggleFeatured: (id: string) => void;
  saveMentorPanel: (panel: MentorPanel) => void;
}): JSX.Element {
  const { styles, mentors, mentorPanels, subjects } = props;
  const featuredMentorPanels = props.config.featuredMentorPanels || [];
  const { height: windowHeight } = useWithWindowSize();
  const [editMentorPanel, setEditMentorPanel] = useState<MentorPanel>();

  function onDragEnd(result: DropResult) {
    if (!result.destination) {
      return;
    }
    props.moveMentorPanel(result.source.index, result.destination.index);
  }

  function onDragMentor(result: DropResult) {
    if (!result.destination) {
      return;
    }
    setEditMentorPanel({
      ...editMentorPanel!,
      mentors: copyAndMove(
        editMentorPanel?.mentors || [],
        result.source.index,
        result.destination.index
      ),
    });
  }

  return (
    <div>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable-mentor-panels">
          {(provided) => (
            <List
              data-cy="mentor-panels-list"
              ref={provided.innerRef}
              className={styles.list}
              style={{ height: windowHeight - 350, overflow: "auto" }}
              {...provided.droppableProps}
            >
              {mentorPanels.map((panel, i) => {
                return (
                  <Draggable
                    index={i}
                    key={`mentor-panel-${i}`}
                    draggableId={`mentor-panel-${i}`}
                  >
                    {(provided) => (
                      <ListItem
                        data-cy={`mentor-panel-${i}`}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <Card style={{ width: "100%" }}>
                          <CardContent
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <CardActions>
                              <IconButton size="small">
                                <DragHandleIcon />
                              </IconButton>
                            </CardActions>
                            <ListItemText
                              primary={panel?.title}
                              secondary={panel?.subtitle}
                              style={{ flexGrow: 1 }}
                            />
                            <CardActions>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={featuredMentorPanels.includes(
                                      panel._id
                                    )}
                                    onChange={() =>
                                      props.toggleFeatured(panel._id)
                                    }
                                    color="primary"
                                    style={{ padding: 0 }}
                                  />
                                }
                                label="Featured"
                                labelPlacement="top"
                              />
                              <FormControlLabel
                                control={
                                  <IconButton
                                    data-cy="launch-mentor-panel"
                                    size="small"
                                    onClick={() =>
                                      launchMentorPanel(panel.mentors, true)
                                    }
                                  >
                                    <LaunchIcon />
                                  </IconButton>
                                }
                                label="Launch"
                                labelPlacement="top"
                              />
                              <FormControlLabel
                                control={
                                  <IconButton
                                    data-cy="edit-mentor-panel"
                                    size="small"
                                    onClick={() => setEditMentorPanel(panel)}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                }
                                label="Edit"
                                labelPlacement="top"
                              />
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
      <Button
        data-cy="add-mentor-panel"
        color="primary"
        variant="outlined"
        startIcon={<AddIcon />}
        className={styles.button}
        onClick={() =>
          setEditMentorPanel({
            _id: "",
            title: "",
            subtitle: "",
            subject: "",
            mentors: [],
          })
        }
      >
        Create Mentor Panel
      </Button>
      <Dialog
        data-cy="edit-mentor-panel"
        maxWidth="sm"
        fullWidth={true}
        open={Boolean(editMentorPanel)}
      >
        <DialogTitle>Edit Mentor Panel</DialogTitle>
        <DialogContent>
          <TextField
            data-cy="panel-title"
            data-test={editMentorPanel?.title}
            label="Title"
            variant="outlined"
            value={editMentorPanel?.title}
            onChange={(e) =>
              setEditMentorPanel({ ...editMentorPanel!, title: e.target.value })
            }
            fullWidth
            multiline
          />
          <TextField
            data-cy="panel-subtitle"
            data-test={editMentorPanel?.subtitle}
            label="Subtitle"
            variant="outlined"
            value={editMentorPanel?.subtitle}
            onChange={(e) =>
              setEditMentorPanel({
                ...editMentorPanel!,
                subtitle: e.target.value,
              })
            }
            style={{ marginTop: 10 }}
            fullWidth
            multiline
          />
          <Autocomplete
            data-cy="panel-subject"
            options={subjects}
            getOptionLabel={(option: SubjectGQL) => option.name}
            value={subjects.find((s) => s._id === editMentorPanel?.subject)}
            onChange={(e, v) =>
              setEditMentorPanel({ ...editMentorPanel!, subject: v?._id || "" })
            }
            style={{ width: "100%", marginTop: 10 }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Choose a subject"
                label="Subject"
              />
            )}
          />
          <DragDropContext onDragEnd={onDragMentor}>
            <Droppable droppableId="droppable-mentor-panel-mentors">
              {(provided) => (
                <List
                  data-cy="mentor-panels-mentors"
                  ref={provided.innerRef}
                  className={styles.list}
                  style={{ height: 300, overflow: "auto", marginTop: 10 }}
                  subheader={<ListSubheader>Mentors</ListSubheader>}
                  {...provided.droppableProps}
                >
                  {editMentorPanel?.mentors.map((mId, i) => {
                    const mentor = mentors.find((m) => m._id === mId);
                    return (
                      <Draggable
                        index={i}
                        key={`mentor-panel-mentor-${i}`}
                        draggableId={`mentor-panel-mentor-${i}`}
                      >
                        {(provided) => (
                          <ListItem
                            data-cy={`mentor-panel-mentor-${i}`}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <Card style={{ width: "100%" }}>
                              <CardContent
                                style={{
                                  display: "flex",
                                  flexDirection: "row",
                                  alignItems: "center",
                                }}
                              >
                                <CardActions>
                                  <IconButton size="small">
                                    <DragHandleIcon />
                                  </IconButton>
                                </CardActions>
                                <ListItemText
                                  primary={mentor?.name}
                                  secondary={mentor?.title}
                                  style={{ flexGrow: 1 }}
                                />
                                <CardActions>
                                  <FormControlLabel
                                    control={
                                      <IconButton
                                        data-cy="remove-mentor-panel-mentor"
                                        size="small"
                                        onClick={() =>
                                          setEditMentorPanel({
                                            ...editMentorPanel!,
                                            mentors: copyAndRemove(
                                              editMentorPanel?.mentors || [],
                                              i
                                            ),
                                          })
                                        }
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    }
                                    label="Remove"
                                    labelPlacement="top"
                                  />
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
            data-cy="panel-mentors"
            options={mentors}
            getOptionLabel={(option: MentorGQL) => option.name}
            getOptionDisabled={(option: MentorGQL) =>
              Boolean(editMentorPanel?.mentors.includes(option._id))
            }
            onChange={(e, v) => {
              if (v)
                setEditMentorPanel({
                  ...editMentorPanel!,
                  mentors: [...(editMentorPanel?.mentors || []), v._id],
                });
            }}
            style={{ width: "100%" }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Choose a mentor"
                label="Add Mentor"
              />
            )}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
            }}
          >
            <Button
              data-cy="save-mentor-panel"
              color="primary"
              variant="outlined"
              className={styles.button}
              onClick={() =>
                setEditMentorPanel({
                  _id: "",
                  title: "",
                  subtitle: "",
                  subject: "",
                  mentors: [],
                })
              }
            >
              Save
            </Button>
            <Button
              data-cy="cancel-mentor-panel"
              color="secondary"
              variant="outlined"
              className={styles.button}
              onClick={() => setEditMentorPanel(undefined)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ConfigPage(props: { accessToken: string; user: User }): JSX.Element {
  const styles = useStyles();
  const {
    config,
    mentors,
    mentorPanels,
    error,
    isEdited,
    isLoading,
    isSaving,
    saveConfig,
    moveMentor,
    moveMentorPanel,
    toggleActiveMentor,
    toggleFeaturedMentor,
    toggleFeaturedMentorPanel,
    saveMentorPanel,
  } = useWithConfig(props.accessToken);
  const { switchActiveMentor } = useActiveMentor();
  const { height } = useWithWindowSize();
  const { data: subjects } = useWithSubjects();

  const permissionToView =
    props.user.userRole === UserRole.ADMIN ||
    props.user.userRole === UserRole.CONTENT_MANAGER;
  const [tab, setTab] = useState<string>("featured-mentors");

  useEffect(() => {
    switchActiveMentor();
  }, []);

  if (!permissionToView) {
    return (
      <div>You must be an admin or content manager to view this page.</div>
    );
  }
  if (isLoading || !config) {
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
          <MentorList
            styles={styles}
            config={config}
            mentors={mentors}
            moveMentor={moveMentor}
            toggleActive={toggleActiveMentor}
            toggleFeatured={toggleFeaturedMentor}
          />
        </TabPanel>
        <TabPanel
          className={styles.tab}
          style={{ height: height - 250, overflow: "auto" }}
          value="featured-mentor-panels"
        >
          <MentorPanelList
            styles={styles}
            config={config}
            mentors={mentors}
            subjects={subjects?.edges.map((s) => s.node) || []}
            mentorPanels={mentorPanels}
            moveMentorPanel={moveMentorPanel}
            toggleFeatured={toggleFeaturedMentorPanel}
            saveMentorPanel={saveMentorPanel}
          />
        </TabPanel>
      </TabContext>
      <Button
        data-cy="save-button"
        variant="contained"
        color="primary"
        className={styles.button}
        disabled={!isEdited || isSaving}
        onClick={saveConfig}
      >
        Save
      </Button>
      <ErrorDialog error={error} />
      <LoadingDialog title={isLoading ? "Loading..." : ""} />
    </div>
  );
}

export default withAuthorizationOnly(withLocation(ConfigPage));
