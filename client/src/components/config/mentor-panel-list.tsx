/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState } from "react";
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
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  TextField,
  Theme,
  Typography,
} from "@mui/material";
import { makeStyles } from "tss-react/mui";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import { Autocomplete } from "@mui/material";

import { copyAndMove, copyAndRemove } from "helpers";
import { useWithWindowSize } from "hooks/use-with-window-size";
import { Config, MentorPanel, Organization } from "types";
import { MentorGQL, SubjectGQL } from "types-gql";
import { MentorPanelItem } from "./mentor-panel-item";
import { DeletePanelDialog } from "./delete-panel-dialog";

const useStyles = makeStyles({ name: { EditMentorPanelDialog } })(
  (theme: Theme) => ({
    button: {
      width: 300,
      padding: 5,
      margin: theme.spacing(2),
    },
    list: {
      background: "#F5F5F5",
    },
  })
);

function EditMentorPanelDialog(props: {
  mentorPanel: MentorPanel | undefined;
  mentors: MentorGQL[];
  subjects: SubjectGQL[];
  organizations: Organization[];
  edit: (mentorPanel: Partial<MentorPanel>) => void;
  save: () => void;
  cancel: () => void;
  delete: () => void;
}): JSX.Element {
  const { classes: styles } = useStyles();
  const { mentorPanel, mentors, subjects, edit } = props;
  const org = props.organizations.find((o) => o._id === mentorPanel?.org);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  function onDragMentor(result: DropResult) {
    if (!result.destination || !mentorPanel) {
      return;
    }
    edit({
      mentors: copyAndMove(
        mentorPanel.mentors || [],
        result.source.index,
        result.destination.index
      ),
    });
  }

  if (!mentorPanel) {
    return <div />;
  }
  return (
    <Dialog
      data-cy="edit-mentor-panel"
      maxWidth="sm"
      fullWidth={true}
      open={Boolean(mentorPanel)}
    >
      <DialogTitle>Edit Mentor Panel</DialogTitle>
      <DialogContent>
        <TextField
          data-cy="panel-title"
          label="Title"
          variant="outlined"
          value={mentorPanel.title}
          data-test={mentorPanel.title}
          onChange={(e) => edit({ title: e.target.value })}
          fullWidth
          multiline
        />
        <TextField
          data-cy="panel-subtitle"
          label="Subtitle"
          variant="outlined"
          value={mentorPanel.subtitle}
          data-test={mentorPanel.subtitle}
          onChange={(e) => edit({ subtitle: e.target.value })}
          style={{ marginTop: 10 }}
          fullWidth
          multiline
        />
        <Autocomplete
          data-cy="panel-subject"
          options={subjects}
          getOptionLabel={(option: SubjectGQL) => option.name}
          value={subjects.find((s) => s._id === mentorPanel.subject)}
          data-test={mentorPanel.subject}
          onChange={(e, v) => edit({ subject: v?._id || "" })}
          style={{ width: "100%", marginTop: 10 }}
          renderOption={(props, option) => (
            <Typography
              {...props}
              data-cy={`panel-subject-${option._id}`}
              key={`${option._id}`}
            >
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
        {org ? (
          <Typography style={{ marginTop: 10 }}>
            Organization: {org.name}
          </Typography>
        ) : undefined}
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
                {mentorPanel.mentors.map((mId, i) => {
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
                                        edit({
                                          mentors: copyAndRemove(
                                            mentorPanel?.mentors || [],
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
            Boolean(mentorPanel?.mentors.includes(option._id))
          }
          onChange={(e, v) => {
            if (v)
              edit({
                mentors: [...(mentorPanel?.mentors || []), v._id],
              });
          }}
          style={{ width: "100%" }}
          renderOption={(props, option) => (
            <Typography {...props} data-cy={`panel-mentor-${option._id}`}>
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
            onClick={props.save}
          >
            Save
          </Button>
          <Button
            data-cy="cancel-mentor-panel"
            color="secondary"
            variant="outlined"
            className={styles.button}
            onClick={props.cancel}
          >
            Cancel
          </Button>
          {mentorPanel._id ? (
            <Button
              data-cy="delete-mentor-panel"
              color="error"
              variant="outlined"
              className={styles.button}
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </Button>
          ) : undefined}
        </div>

        <Dialog
          data-cy="delete-mentor-panel-confirmation"
          maxWidth="sm"
          open={Boolean(confirmDelete)}
        >
          <DialogTitle>Delete Mentor Panel?</DialogTitle>
          <DialogContent>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              <Button
                data-cy="confirm-delete"
                color="primary"
                variant="outlined"
                className={styles.button}
                onClick={() => {
                  props.delete();
                  setConfirmDelete(false);
                  props.cancel();
                }}
              >
                Confirm
              </Button>
              <Button
                data-cy="cancel-delete"
                color="secondary"
                variant="outlined"
                className={styles.button}
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}

export function MentorPanelList(props: {
  accessToken: string;
  config: Config;
  org: Organization | undefined;
  mentors: MentorGQL[];
  mentorPanels: MentorPanel[];
  organizations: Organization[];
  subjects: SubjectGQL[];
  move: (toMove: number, moveTo: number) => void;
  toggleActive: (id: string) => void;
  toggleFeatured: (id: string) => void;
  saveMentorPanel: (panel: MentorPanel) => void;
  deleteMentorPanel: (id: string) => void;
}): JSX.Element {
  const { classes: styles } = useStyles();
  const { mentorPanels, organizations, saveMentorPanel } = props;
  const { height: windowHeight } = useWithWindowSize();
  const [editMentorPanel, setEditMentorPanel] = useState<MentorPanel>();
  const [mpToDelete, setMpToDelete] = useState<MentorPanel>();

  function onDragEnd(result: DropResult) {
    if (!result.destination) {
      return;
    }
    props.move(result.source.index, result.destination.index);
  }

  function onCopyMentorPanel(mp: MentorPanel) {
    const copiedMp = {
      ...mp,
      _id: "",
      org: props.org?._id || "",
    };
    saveMentorPanel(copiedMp);
  }

  function onDeleteMentorPanel(mp: MentorPanel) {
    setMpToDelete(mp);
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
                        <MentorPanelItem
                          config={props.config}
                          mentorPanel={mp}
                          org={props.org}
                          ownerOrg={organizations.find((o) => o._id === mp.org)}
                          toggleActive={props.toggleActive}
                          toggleFeatured={props.toggleFeatured}
                          onEdit={setEditMentorPanel}
                          onCopy={onCopyMentorPanel}
                          onDelete={onDeleteMentorPanel}
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
      <Button
        data-cy="add-mentor-panel"
        color="primary"
        variant="outlined"
        startIcon={<AddIcon />}
        className={styles.button}
        onClick={() =>
          setEditMentorPanel({
            _id: "",
            org: props.org?._id || "",
            title: "",
            subtitle: "",
            subject: "",
            mentors: [],
          })
        }
      >
        Create Mentor Panel
      </Button>
      <EditMentorPanelDialog
        mentorPanel={editMentorPanel}
        mentors={props.mentors}
        subjects={props.subjects}
        organizations={props.organizations}
        edit={(mp) => setEditMentorPanel({ ...editMentorPanel!, ...mp })}
        save={() => {
          props.saveMentorPanel(editMentorPanel!);
          setEditMentorPanel(undefined);
        }}
        cancel={() => setEditMentorPanel(undefined)}
        delete={() => {
          if (editMentorPanel?._id)
            props.deleteMentorPanel(editMentorPanel._id);
        }}
      />
      <DeletePanelDialog
        closeDialog={() => setMpToDelete(undefined)}
        mpToDelete={mpToDelete}
        organizationsUsing={organizations.filter(
          (o) =>
            mpToDelete &&
            (o.config.featuredMentorPanels.includes(mpToDelete._id) ||
              o.config.activeMentorPanels.includes(mpToDelete._id))
        )}
        deleteMentorPanel={(id: string) => {
          props.deleteMentorPanel(id);
          setMpToDelete(undefined);
        }}
      />
    </div>
  );
}
