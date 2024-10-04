/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { ImportExport } from "@mui/icons-material";
import {
  TableRow,
  TableCell,
  Typography,
  Button,
  Select,
  SelectChangeEvent,
  MenuItem,
  Checkbox,
  Tooltip,
  IconButton,
  Theme,
} from "@mui/material";
import { exportMentor } from "api";
import { navigate } from "gatsby";
import {
  isDateWithinLastMonth,
  canEditUserRole,
  canEditMentorPrivacy,
  launchMentor,
  canEditMentor,
} from "helpers";
import { UseUserData } from "hooks/graphql/use-with-users";
import { useState, useEffect } from "react";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import { makeStyles } from "tss-react/mui";
import { Edge, User, Organization, JobState, Mentor, UserRole } from "types";
import { TrainDirtyMentorButton } from "./train-dirty-mentor-button";
import {
  Edit as EditIcon,
  GetApp as GetAppIcon,
  Launch as LaunchIcon,
} from "@mui/icons-material";
import { v4 as uuid } from "uuid";
const useStyles = makeStyles({ name: { UserItem } })((theme: Theme) => ({
  dropdown: {
    width: 170,
  },
  normalButton: {
    "&:hover": {
      color: theme.palette.primary.main,
    },
  },
}));

export function UserItem(props: {
  edge: Edge<User>;
  i: number;
  accessToken: string;
  userPagin: UseUserData;
  user: User;
  orgs: Organization[];
  viewArchivedMentors: boolean;
  mentorTrainStatusDict: Record<string, JobState>;
  addMentorToPoll: (m: Mentor) => void;
}): JSX.Element {
  const { edge, i, user, orgs, mentorTrainStatusDict, addMentorToPoll } = props;
  const { classes: styles } = useStyles();
  const { switchActiveMentor } = useActiveMentor();
  const userRole = user.userRole;
  const mentor = edge.node.defaultMentor;
  const [approvalText, setApprovalText] = useState<string>(
    mentor.isPublicApproved ? "Approved" : "Not Approved"
  );
  const [approvalTextColor, setApprovalTextColor] = useState<string>(
    mentor.isPublicApproved ? "green" : "red"
  );

  useEffect(() => {
    setApprovalText(mentor.isPublicApproved ? "Approved" : "Not Approved");
    setApprovalTextColor(mentor.isPublicApproved ? "green" : "red");
  }, [mentor.isPublicApproved]);

  const isAdmin =
    userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN;

  function handleRoleChange(user: string, permission: string): void {
    props.userPagin.onUpdateUserPermissions(user, permission);
  }

  function handlePublicApprovalChange(
    mentor: string,
    isPublicApproved: boolean
  ): void {
    props.userPagin.onUpdateMentorPublicApproved(mentor, isPublicApproved);
  }

  function handleDisabledChange(user: string, isDisabled: boolean): void {
    props.userPagin.onUpdateUserDisabled(user, isDisabled);
  }

  function handlePrivacyChange(mentor: string, isPrivate: boolean): void {
    props.userPagin.onUpdateMentorPrivacy(mentor, isPrivate);
  }

  function handleAdvancedChange(mentor: string, isAdvanced: boolean): void {
    props.userPagin.onUpdateMentorAdvanced(mentor, isAdvanced);
  }

  function handleSetMentorLock(mentor: string, locked: boolean): void {
    props.userPagin.onSetMentorLock(mentor, locked);
  }

  function handleArchiveChange(mentor: string, isArchived: boolean): void {
    props.userPagin.onArchiveMentor(mentor, isArchived);
  }

  return (
    <TableRow data-cy={`user-${i}`} hover role="checkbox" tabIndex={-1}>
      <TableCell data-cy="publicApproved" align="center" key={mentor._id}>
        <>
          {isDateWithinLastMonth(mentor.createdAt) &&
          !mentor.isPublicApproved ? (
            <Typography
              data-cy="new-mentor-indicator"
              style={{
                color: "lightgreen",
                fontStyle: "italic",
                textDecoration: "underline",
              }}
            >
              New Mentor
            </Typography>
          ) : undefined}
          <Button
            data-cy="publicApprovalButton"
            style={{
              color: approvalTextColor,
              cursor: "pointer",
              width: "95px",
              height: "50px",
            }}
            onMouseEnter={() => {
              if (mentor.isPublicApproved) {
                setApprovalText("Unapprove?");
                setApprovalTextColor("red");
              } else {
                setApprovalText("Approve?");
                setApprovalTextColor("green");
              }
            }}
            onMouseLeave={() => {
              if (mentor.isPublicApproved) {
                setApprovalText("Approved");
                setApprovalTextColor("green");
              } else {
                setApprovalText("Not Approved");
                setApprovalTextColor("red");
              }
            }}
            onClick={() => {
              handlePublicApprovalChange(mentor._id, !mentor.isPublicApproved);
            }}
          >
            <i>{approvalText}</i>
          </Button>
        </>
      </TableCell>
      <TableCell data-cy="name" align="left">
        {edge.node.name}
      </TableCell>
      <TableCell data-cy="defaultMentor" align="left">
        {mentor?.name || ""}
        {mentor.isArchived ? (
          <span style={{ color: "orangered" }}>
            <i> Archived</i>
          </span>
        ) : undefined}
      </TableCell>
      <TableCell data-cy="email" align="left" size="small" padding="none">
        {edge.node.email}
      </TableCell>
      <TableCell data-cy="role" align="left">
        {userRole === UserRole.SUPER_CONTENT_MANAGER ||
        userRole === UserRole.SUPER_ADMIN ? (
          <Select
            data-cy="select-role"
            value={edge.node.userRole || UserRole.USER}
            onChange={(event: SelectChangeEvent<UserRole>) => {
              handleRoleChange(edge.node._id, event.target.value as string);
            }}
            className={styles.dropdown}
          >
            <MenuItem
              data-cy={`role-dropdown-${UserRole.USER}`}
              value={UserRole.USER}
              disabled={!canEditUserRole(props.user, edge.node, UserRole.USER)}
            >
              User
            </MenuItem>
            <MenuItem
              data-cy={`role-dropdown-${UserRole.SUPER_CONTENT_MANAGER}`}
              value={UserRole.SUPER_CONTENT_MANAGER}
              disabled={
                !canEditUserRole(
                  props.user,
                  edge.node,
                  UserRole.SUPER_CONTENT_MANAGER
                )
              }
            >
              Super Content Manager
            </MenuItem>
            <MenuItem
              data-cy={`role-dropdown-${UserRole.SUPER_ADMIN}`}
              value={UserRole.SUPER_ADMIN}
              disabled={
                !canEditUserRole(props.user, edge.node, UserRole.SUPER_ADMIN)
              }
            >
              Super Admin
            </MenuItem>
          </Select>
        ) : (
          <div>{edge.node.userRole}</div>
        )}
      </TableCell>
      <TableCell data-cy="privacy" align="left">
        {canEditMentorPrivacy(mentor, props.user, props.orgs) ? (
          <Select
            data-cy="select-privacy"
            value={mentor.isPrivate ? "true" : "false"}
            onChange={(event: SelectChangeEvent<"false" | "true">) => {
              handlePrivacyChange(
                mentor._id,
                (event.target.value as string) === "true"
              );
            }}
            className={styles.dropdown}
          >
            <MenuItem data-cy={`privacy-dropdown-public`} value={"false"}>
              Public
            </MenuItem>
            <MenuItem data-cy={`privacy-dropdown-private`} value={"true"}>
              Private
            </MenuItem>
          </Select>
        ) : (
          <div>{mentor.isPrivate ? "Private" : "Public"}</div>
        )}
      </TableCell>
      {isAdmin ? (
        <>
          <TableCell data-cy="disabled" align="left">
            <Checkbox
              checked={edge.node.isDisabled}
              disabled={
                props.user.userRole !== UserRole.ADMIN &&
                props.user.userRole !== UserRole.SUPER_ADMIN
              }
              color="secondary"
              onClick={() =>
                handleDisabledChange(edge.node._id, !edge.node.isDisabled)
              }
            />
          </TableCell>
        </>
      ) : undefined}
      {isAdmin ? (
        <TableCell data-cy="advanced" align="left">
          <Checkbox
            checked={mentor.isAdvanced}
            disabled={
              props.user.userRole !== UserRole.ADMIN &&
              props.user.userRole !== UserRole.SUPER_ADMIN
            }
            color="secondary"
            onClick={() => handleAdvancedChange(mentor._id, !mentor.isAdvanced)}
          />
        </TableCell>
      ) : undefined}
      {isAdmin ? (
        <TableCell data-cy="set-mentor-lock" align="left">
          <Checkbox
            checked={Boolean(mentor.lockedToConfig)}
            disabled={
              !mentor.mentorConfig ||
              (props.user.userRole !== UserRole.ADMIN &&
                props.user.userRole !== UserRole.SUPER_ADMIN)
            }
            color="secondary"
            onClick={() =>
              handleSetMentorLock(mentor._id, !mentor.lockedToConfig)
            }
          />
        </TableCell>
      ) : undefined}
      {props.viewArchivedMentors ? (
        <TableCell data-cy="archived" align="left">
          <Checkbox
            checked={mentor.isArchived}
            disabled={!canEditMentorPrivacy(mentor, props.user, orgs)}
            color="secondary"
            onClick={() => handleArchiveChange(mentor._id, !mentor.isArchived)}
          />
        </TableCell>
      ) : undefined}
      <TableCell data-cy="updatedAt" align="left">
        {mentor.updatedAt ? (
          <>
            {new Date(mentor.updatedAt)
              .toLocaleString()
              .split(",")
              .map((s) => {
                return <div key={`${mentor.updatedAt}${uuid()}`}>{s}</div>;
              })}
          </>
        ) : (
          "N/A"
        )}
      </TableCell>
      <TableCell data-cy="actions" align="right" style={{ padding: 0 }}>
        <TrainDirtyMentorButton
          mentor={mentor}
          accessToken={props.accessToken}
          mentorTrainStatusDict={mentorTrainStatusDict}
          addMentorToPoll={addMentorToPoll}
        />

        <Tooltip style={{ margin: 0 }} title="Launch Mentor" arrow>
          <IconButton
            data-cy="launch-default-mentor"
            onClick={() => {
              if (mentor._id) launchMentor(mentor._id, true);
            }}
            className={styles.normalButton}
            size="large"
          >
            <LaunchIcon />
          </IconButton>
        </Tooltip>
        <Tooltip style={{ margin: 0 }} title="Import" arrow>
          <IconButton
            data-cy="import-button"
            onClick={() => {
              switchActiveMentor(mentor._id);
              navigate("/importexport");
            }}
            disabled={!canEditMentor(mentor, user, orgs)}
            className={styles.normalButton}
            size="large"
          >
            <ImportExport />
          </IconButton>
        </Tooltip>
        <Tooltip style={{ margin: 0 }} title="Export Mentor" arrow>
          <IconButton
            data-cy="export-button"
            onClick={() => exportMentor(mentor._id, props.accessToken)}
            disabled={!canEditMentor(mentor, user, orgs)}
            className={styles.normalButton}
            size="large"
          >
            <GetAppIcon />
          </IconButton>
        </Tooltip>
        <Tooltip style={{ margin: 0 }} title="Edit Mentor" arrow>
          <IconButton
            data-cy="edit-button"
            onClick={() => {
              switchActiveMentor(mentor._id);
              navigate("/");
            }}
            disabled={!canEditMentor(mentor, user, orgs)}
            className={styles.normalButton}
            size="large"
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}
