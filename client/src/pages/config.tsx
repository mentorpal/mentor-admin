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
import { PhotoshopPicker } from "react-color";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  Chip,
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
  MenuItem,
  Select,
  Tab,
  TextField,
  Typography,
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
  canEditContent,
  canEditOrganization,
  copyAndMove,
  copyAndRemove,
  launchMentor,
  launchMentorPanel,
} from "helpers";
import { useWithConfigEdits } from "hooks/graphql/use-with-config";
import { useWithWindowSize } from "hooks/use-with-window-size";
import withAuthorizationOnly from "hooks/wrap-with-authorization-only";
import { useWithSubjects } from "hooks/graphql/use-with-subjects";
import { useWithKeywords } from "hooks/graphql/use-with-keywords";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import { Config, Keyword, MentorPanel, User } from "types";
import { MentorGQL, SubjectGQL } from "types-gql";
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
  thumbnail: {
    boxSizing: "border-box",
    height: 56,
    padding: 5,
  },
}));

function MentorList(props: {
  styles: Record<string, string>;
  config: Config;
  mentors: MentorGQL[];
  move: (toMove: number, moveTo: number) => void;
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
                              !props.config.activeMentors.includes(m._id) &&
                              !props.config.featuredMentors.includes(m._id)
                            }
                          >
                            <DragHandleIcon />
                          </IconButton>
                        </CardActions>
                        <ListItemText
                          data-cy="name"
                          data-test={m.name}
                          primary={m.name}
                          secondary={m.title}
                          style={{ flexGrow: 1 }}
                        />
                        <CardActions>
                          <FormControlLabel
                            control={
                              <Checkbox
                                data-cy="toggle-featured"
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
                                data-cy="toggle-active"
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
  move: (toMove: number, moveTo: number) => void;
  toggleActive: (id: string) => void;
  toggleFeatured: (id: string) => void;
  saveMentorPanel: (panel: MentorPanel) => void;
}): JSX.Element {
  const { styles, mentors, mentorPanels, subjects } = props;
  const featuredMentorPanels = props.config.featuredMentorPanels || [];
  const activeMentorPanels = props.config.activeMentorPanels || [];
  const { height: windowHeight } = useWithWindowSize();
  const [editMentorPanel, setEditMentorPanel] = useState<MentorPanel>();

  function onDragEnd(result: DropResult) {
    if (!result.destination) {
      return;
    }
    props.move(result.source.index, result.destination.index);
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
              {mentorPanels.map((mp, i) => {
                return (
                  <Draggable
                    index={i}
                    key={`mentor-panel-${i}`}
                    draggableId={`mentor-panel-${i}`}
                    isDragDisabled={
                      !props.config.activeMentorPanels.includes(mp._id) &&
                      !props.config.featuredMentorPanels.includes(mp._id)
                    }
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
                              <IconButton
                                size="small"
                                disabled={
                                  !props.config.activeMentorPanels.includes(
                                    mp._id
                                  ) &&
                                  !props.config.featuredMentorPanels.includes(
                                    mp._id
                                  )
                                }
                              >
                                <DragHandleIcon />
                              </IconButton>
                            </CardActions>
                            <ListItemText
                              data-cy="name"
                              data-test={mp?.title}
                              primary={mp?.title}
                              secondary={mp?.subtitle}
                              style={{ flexGrow: 1 }}
                            />
                            <CardActions>
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    data-cy="toggle-featured"
                                    checked={featuredMentorPanels.includes(
                                      mp._id
                                    )}
                                    onChange={() =>
                                      props.toggleFeatured(mp._id)
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
                                  <Checkbox
                                    data-cy="toggle-active"
                                    checked={activeMentorPanels.includes(
                                      mp._id
                                    )}
                                    onChange={() => props.toggleActive(mp._id)}
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
                                    data-cy="launch-mentor-panel"
                                    size="small"
                                    onClick={() =>
                                      launchMentorPanel(mp.mentors, true)
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
                                    onClick={() => setEditMentorPanel(mp)}
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
            data-test={editMentorPanel?.subject}
            options={subjects}
            getOptionLabel={(option: SubjectGQL) => option.name}
            value={subjects.find((s) => s._id === editMentorPanel?.subject)}
            onChange={(e, v) =>
              setEditMentorPanel({ ...editMentorPanel!, subject: v?._id || "" })
            }
            style={{ width: "100%", marginTop: 10 }}
            renderOption={(option) => (
              <Typography data-cy={`panel-subject-${option._id}`}>
                {option.name}
              </Typography>
            )}
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
                                  data-cy="name"
                                  data-test={mentor?.name}
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
            renderOption={(option) => (
              <Typography data-cy={`panel-mentor-${option._id}`}>
                {option.name}
              </Typography>
            )}
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
              onClick={() => {
                props.saveMentorPanel(editMentorPanel!);
                setEditMentorPanel(undefined);
              }}
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

function HeaderStyle(props: {
  styles: Record<string, string>;
  config: Config;
  updateConfig: (c: Partial<Config>) => void;
}): JSX.Element {
  const { styles, config, updateConfig } = props;
  return (
    <div>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <TextField
          fullWidth
          data-cy="styleHeaderLogo"
          data-test={config.styleHeaderLogo}
          variant="outlined"
          label="Header Logo"
          value={config.styleHeaderLogo}
          onChange={(e) => updateConfig({ styleHeaderLogo: e.target.value })}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <img
          data-cy="image-thumbnail"
          className={styles.thumbnail}
          src={config.styleHeaderLogo}
          onClick={() => {
            window.open(config.styleHeaderLogo || "", "_blank");
          }}
        />
      </div>
      <Typography
        variant="subtitle1"
        data-cy="styleHeaderColor"
        data-test={config.styleHeaderColor}
        style={{ marginTop: 20, textAlign: "start" }}
      >
        Header Color: {config.styleHeaderColor}
      </Typography>
      <PhotoshopPicker
        color={config.styleHeaderColor}
        onChangeComplete={(color: { hex: string }) =>
          updateConfig({ styleHeaderColor: color.hex })
        }
      />
      <TextField
        fullWidth
        data-cy="styleHeaderText"
        data-test={config.styleHeaderText}
        variant="outlined"
        label="Header Text"
        value={config.styleHeaderText}
        onChange={(e) => updateConfig({ styleHeaderText: e.target.value })}
        style={{ marginTop: 20 }}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <Typography
        variant="subtitle1"
        data-cy="styleHeaderTextColor"
        data-test={config.styleHeaderTextColor}
        style={{ marginTop: 20, textAlign: "start" }}
      >
        Header Text Color: {config.styleHeaderTextColor}
      </Typography>
      <PhotoshopPicker
        color={config.styleHeaderTextColor}
        onChangeComplete={(color: { hex: string }) =>
          updateConfig({ styleHeaderTextColor: color.hex })
        }
      />
    </div>
  );
}

function Disclaimer(props: {
  config: Config;
  updateConfig: (c: Partial<Config>) => void;
}): JSX.Element {
  const { config, updateConfig } = props;
  return (
    <div>
      <TextField
        fullWidth
        data-cy="disclaimerTitle"
        data-test={config.disclaimerTitle}
        variant="outlined"
        label="Disclaimer Title"
        multiline={true}
        value={config.disclaimerTitle}
        onChange={(e) => updateConfig({ disclaimerTitle: e.target.value })}
        style={{ marginBottom: 20 }}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <TextField
        fullWidth
        data-cy="disclaimerText"
        data-test={config.disclaimerText}
        variant="outlined"
        label="Disclaimer Text"
        multiline={true}
        value={config.disclaimerText}
        onChange={(e) => updateConfig({ disclaimerText: e.target.value })}
        style={{ marginBottom: 20 }}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <FormControlLabel
        data-cy="disclaimerDisabled"
        data-test={config.disclaimerDisabled}
        control={
          <Checkbox
            checked={config.disclaimerDisabled}
            onChange={() =>
              updateConfig({
                disclaimerDisabled: !config.disclaimerDisabled,
              })
            }
            color="secondary"
          />
        }
        label="Disable Disclaimer Popup"
        style={{ justifySelf: "center" }}
      />
    </div>
  );
}

function Settings(props: {
  config: Config;
  keywords: Keyword[];
  subjects: SubjectGQL[];
  updateConfig: (c: Partial<Config>) => void;
}): JSX.Element {
  const featuredSubjects = props.subjects.filter((s) =>
    props.config.featuredSubjects?.includes(s._id)
  );
  const defaultSubject = props.subjects.find(
    (s) => props.config.defaultSubject === s._id
  );

  return (
    <div>
      <Autocomplete
        data-cy="keyword-input"
        multiple
        value={props.config.featuredKeywordTypes}
        options={
          props.keywords
            ?.map((k) => k.type)
            ?.filter((v, i, a) => a.indexOf(v) === i) || []
        }
        getOptionLabel={(option: string) => option}
        onChange={(e, v) => props.updateConfig({ featuredKeywordTypes: v })}
        renderTags={(value: readonly string[], getTagProps) =>
          value.map((option: string, index: number) => (
            <Chip
              key={`keyword-${option}`}
              data-cy={`keyword-${option}`}
              variant="default"
              label={option}
              {...getTagProps({ index })}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder="Featured Keyword Types"
          />
        )}
        renderOption={(option) => (
          <Typography align="left" data-cy={`keyword-option-${option}`}>
            {option}
          </Typography>
        )}
        style={{ width: "100%", marginBottom: 10 }}
      />
      <Autocomplete
        data-cy="subject-input"
        multiple
        value={featuredSubjects}
        options={props.subjects}
        getOptionLabel={(option: SubjectGQL) => option.name}
        onChange={(e, v) =>
          props.updateConfig({ featuredSubjects: v.map((s) => s._id) })
        }
        renderTags={(value: readonly SubjectGQL[], getTagProps) =>
          value.map((option: SubjectGQL, index: number) => (
            <Chip
              key={`subject-${option._id}`}
              data-cy={`subject-${option._id}`}
              variant="default"
              label={option.name}
              {...getTagProps({ index })}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder="Featured Subjects"
          />
        )}
        renderOption={(option) => (
          <Typography align="left" data-cy={`subject-option-${option._id}`}>
            {option.name}
          </Typography>
        )}
        style={{ width: "100%", marginBottom: 10 }}
      />
      <Autocomplete
        data-cy="default-subject-input"
        value={defaultSubject}
        options={featuredSubjects}
        getOptionLabel={(option: SubjectGQL) => option.name}
        onChange={(e, v) =>
          props.updateConfig({ defaultSubject: v?._id || undefined })
        }
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder="Default Subject"
          />
        )}
        renderOption={(option) => (
          <Typography
            align="left"
            data-cy={`default-subject-option-${option._id}`}
          >
            {option.name}
          </Typography>
        )}
        style={{ width: "100%", marginBottom: 10 }}
      />
    </div>
  );
}

function ConfigPage(props: { accessToken: string; user: User }): JSX.Element {
  const styles = useStyles();
  const {
    org,
    orgs,
    config,
    configData,
    mentors,
    mentorPanels,
    error,
    isLoading,
    isSaving,
    saveConfig,
    editConfig,
    moveMentor,
    moveMentorPanel,
    toggleActiveMentor,
    toggleFeaturedMentor,
    toggleFeaturedMentorPanel,
    toggleActiveMentorPanel,
    setOrganization,
    saveMentorPanel,
  } = useWithConfigEdits(props.accessToken, props.user);
  const { switchActiveMentor } = useActiveMentor();
  const { data: keywords } = useWithKeywords();
  const { data: subjects } = useWithSubjects();
  const { height } = useWithWindowSize();
  const [tab, setTab] = useState<string>("featured-mentors");

  useEffect(() => {
    switchActiveMentor();
  }, []);

  if (isLoading) {
    return (
      <div className={styles.root}>
        <CircularProgress className={styles.progress} />
      </div>
    );
  }
  const editableOrgs = orgs.filter((o) => canEditOrganization(o, props.user));
  if (
    !configData ||
    (!canEditContent(props.user) && editableOrgs.length === 0)
  ) {
    return (
      <div>You must be an admin or content manager to view this page.</div>
    );
  }

  return (
    <div className={styles.root}>
      <NavBar title={`Manage${org ? ` ${org.name} ` : " "}Config`} />
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
          <Tab
            label="Header Style"
            value="header-style"
            data-cy="toggle-header-style"
          />
          <Tab
            label="Disclaimer"
            value="disclaimer"
            data-cy="toggle-disclaimer"
          />
          <Tab label="Settings" value="settings" data-cy="toggle-settings" />
        </TabList>
        <TabPanel
          className={styles.tab}
          style={{ height: height - 250, overflow: "auto" }}
          value="featured-mentors"
        >
          <MentorList
            styles={styles}
            config={config!}
            mentors={mentors}
            move={moveMentor}
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
            config={config!}
            mentors={mentors}
            mentorPanels={mentorPanels}
            subjects={subjects?.edges.map((s) => s.node) || []}
            move={moveMentorPanel}
            toggleFeatured={toggleFeaturedMentorPanel}
            toggleActive={toggleActiveMentorPanel}
            saveMentorPanel={saveMentorPanel}
          />
        </TabPanel>
        <TabPanel
          className={styles.tab}
          style={{ height: height - 250, overflow: "auto" }}
          value="header-style"
        >
          <HeaderStyle
            styles={styles}
            config={config!}
            updateConfig={editConfig}
          />
        </TabPanel>
        <TabPanel
          className={styles.tab}
          style={{ height: height - 250, overflow: "auto" }}
          value="disclaimer"
        >
          <Disclaimer config={config!} updateConfig={editConfig} />
        </TabPanel>
        <TabPanel
          className={styles.tab}
          style={{ height: height - 250, overflow: "auto" }}
          value="settings"
        >
          <Settings
            config={config!}
            subjects={subjects?.edges.map((s) => s.node) || []}
            keywords={keywords?.edges.map((k) => k.node) || []}
            updateConfig={editConfig}
          />
        </TabPanel>
      </TabContext>
      {orgs.length > 0 ? (
        <Select
          data-cy="select-org"
          label="Organization"
          value={org?._id}
          cy-value={org?._id}
          onChange={(
            event: React.ChangeEvent<{ value: unknown; name?: unknown }>
          ) =>
            setOrganization(
              orgs.find((o) => (event.target.value as string) === o._id)
            )
          }
          style={{ width: 270, position: "absolute", bottom: 25, right: 25 }}
        >
          <MenuItem
            data-cy="org-none"
            value={undefined}
            disabled={!canEditContent(props.user)}
          >
            None
          </MenuItem>
          {orgs.map((o) => (
            <MenuItem
              data-cy={`org-${o._id}`}
              key={`org-${o._id}`}
              value={o._id}
            >
              {o.name}
            </MenuItem>
          ))}
        </Select>
      ) : undefined}
      <Button
        data-cy="save-button"
        variant="contained"
        color="primary"
        className={styles.button}
        disabled={isSaving}
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
