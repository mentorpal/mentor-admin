/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import {
  Card,
  CardActions,
  CardContent,
  Checkbox,
  FormControlLabel,
  IconButton,
  ListItemText,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import LaunchIcon from "@mui/icons-material/Launch";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import { launchMentorPanel } from "helpers";
import { Config, MentorPanel, Organization } from "types";

export function MentorPanelItem(props: {
  config: Config;
  mentorPanel: MentorPanel;
  org: Organization | undefined;
  ownerOrg: Organization | undefined;
  toggleActive: (id: string) => void;
  toggleFeatured: (id: string) => void;
  onEdit: (mp: MentorPanel) => void;
  onCopy: (mp: MentorPanel) => void;
  onDelete: (mp: MentorPanel) => void;
}): JSX.Element {
  const { config, mentorPanel, org: currentOrg, ownerOrg } = props;
  const featuredMentorPanels = config.featuredMentorPanels || [];
  const activeMentorPanels = config.activeMentorPanels || [];
  function canEditMentorPanel(): boolean {
    if (mentorPanel.org) {
      return currentOrg?._id === mentorPanel.org;
    } else {
      return !currentOrg;
    }
  }

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
              !config.activeMentorPanels.includes(mentorPanel._id) &&
              !config.featuredMentorPanels.includes(mentorPanel._id)
            }
          >
            <DragHandleIcon />
          </IconButton>
        </CardActions>
        <ListItemText
          data-cy="name"
          data-test={mentorPanel.title}
          primary={mentorPanel.title}
          secondary={
            <span>
              {mentorPanel.subtitle}
              <br />
              <span style={{ color: "lightgray" }}>
                {ownerOrg?.name ? `Owned by ${ownerOrg.name}` : ""}
              </span>
            </span>
          }
          style={{ flexGrow: 1 }}
        />
        <CardActions>
          <FormControlLabel
            control={
              <Checkbox
                data-cy="toggle-featured"
                checked={featuredMentorPanels.includes(mentorPanel._id)}
                onChange={() => props.toggleFeatured(mentorPanel._id)}
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
                checked={activeMentorPanels.includes(mentorPanel._id)}
                onChange={() => props.toggleActive(mentorPanel._id)}
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
                data-cy={`launch-mentor-panel-${mentorPanel.mentors.join("-")}`}
                size="small"
                onClick={() =>
                  launchMentorPanel(
                    mentorPanel.mentors,
                    true,
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
          <FormControlLabel
            control={
              <IconButton
                data-cy="edit-mentor-panel"
                size="small"
                onClick={() => props.onEdit(mentorPanel)}
              >
                <EditIcon />
              </IconButton>
            }
            disabled={!canEditMentorPanel()}
            label="Edit"
            labelPlacement="top"
          />
          <FormControlLabel
            control={
              <IconButton
                data-cy="copy-mentor-panel"
                size="small"
                onClick={() => props.onCopy(mentorPanel)}
              >
                <ContentCopyIcon />
              </IconButton>
            }
            label="Copy"
            labelPlacement="top"
          />
          <FormControlLabel
            control={
              <IconButton
                data-cy="delete-mentor-panel"
                size="small"
                onClick={() => props.onDelete(mentorPanel)}
              >
                <DeleteIcon />
              </IconButton>
            }
            disabled={!canEditMentorPanel()}
            label="Delete"
            labelPlacement="top"
          />
        </CardActions>
      </CardContent>
    </Card>
  );
}
