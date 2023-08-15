/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useState } from "react";
import {
  Typography,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
  InputLabel,
} from "@mui/material";
import {
  Mentor,
  Organization,
  OrgViewPermissionType,
  OrgEditPermissionType,
} from "types";
import { Slide } from "./slide";
import { copyAndSet } from "helpers";

export function MentorPrivacySlide(props: {
  classes: Record<string, string>;
  mentor: Mentor;
  orgs: Organization[];
  editMentor: (edits: Partial<Mentor>) => void;
}): JSX.Element {
  const { classes, mentor, orgs, editMentor } = props;
  const [org, setOrg] = useState<Organization>();

  useEffect(() => {
    if (!org && orgs.length > 0) {
      setOrg(orgs[0]);
    }
  }, [orgs]);

  function setPermission(p: {
    v?: OrgViewPermissionType;
    e?: OrgEditPermissionType;
  }): void {
    if (!org || !mentor) {
      return;
    }
    let orgPermissions = mentor.orgPermissions || [];
    for (const [i, op] of orgPermissions.entries()) {
      if (op.orgId === org._id) {
        editMentor({
          orgPermissions: copyAndSet(orgPermissions, i, {
            orgId: org._id,
            orgName: org.name,
            viewPermission: p.v || op.viewPermission,
            editPermission: p.e || op.editPermission,
          }),
        });
        return;
      }
    }
    orgPermissions = [
      ...orgPermissions,
      {
        orgId: org._id,
        orgName: org.name,
        viewPermission: p.v || OrgViewPermissionType.NONE,
        editPermission: p.e || OrgEditPermissionType.NONE,
      },
    ];
    editMentor({ orgPermissions });
  }

  function renderOrgPermission(): JSX.Element {
    if (!org || !mentor) {
      return <div />;
    }
    const orgViewPermission =
      mentor.orgPermissions?.find((op) => op.orgId === org._id)
        ?.viewPermission || OrgViewPermissionType.NONE;
    const orgEditPermission =
      mentor.orgPermissions?.find((op) => op.orgId === org._id)
        ?.editPermission || OrgEditPermissionType.NONE;
    return (
      <div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <FormControl style={{ width: 150, marginRight: 10 }}>
            <InputLabel>Org</InputLabel>
            <Select
              data-cy="select-org"
              label="Org"
              value={org._id}
              cy-value={org._id}
              onChange={(event: SelectChangeEvent<string>) =>
                setOrg(
                  orgs.find((o) => o._id === (event.target.value as string))
                )
              }
            >
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
          </FormControl>
          <FormControl style={{ width: 150, marginRight: 10 }}>
            <InputLabel>View</InputLabel>
            <Select
              label="View Permissions"
              value={orgViewPermission}
              onChange={(event: SelectChangeEvent<OrgViewPermissionType>) =>
                setPermission({
                  v: event.target.value as OrgViewPermissionType,
                })
              }
            >
              <MenuItem value={OrgViewPermissionType.NONE}>Default</MenuItem>
              <MenuItem value={OrgViewPermissionType.HIDDEN}>Hidden</MenuItem>
              <MenuItem value={OrgViewPermissionType.SHARE}>Share</MenuItem>
            </Select>
          </FormControl>
          <FormControl style={{ width: 150 }}>
            <InputLabel>Edit</InputLabel>
            <Select
              label="Edit Permissions"
              value={orgEditPermission}
              onChange={(event: SelectChangeEvent<OrgEditPermissionType>) =>
                setPermission({
                  e: event.target.value as OrgEditPermissionType,
                })
              }
            >
              <MenuItem value={OrgEditPermissionType.NONE}>No Editing</MenuItem>
              <MenuItem value={OrgEditPermissionType.MANAGE}>Manage</MenuItem>
              <MenuItem value={OrgEditPermissionType.ADMIN}>Admin</MenuItem>
            </Select>
          </FormControl>
        </div>
        <Typography variant="subtitle1">
          Your mentor{" "}
          {orgViewPermission === OrgViewPermissionType.SHARE
            ? "can"
            : orgViewPermission === OrgViewPermissionType.HIDDEN
            ? "cannot"
            : mentor.isPrivate
            ? "cannot"
            : "can"}{" "}
          be viewed on {org.name}&apos;s home page.
        </Typography>
        <Typography variant="subtitle1">
          Your mentor&apos;s{" "}
          {orgEditPermission === OrgEditPermissionType.ADMIN
            ? "data and privacy"
            : "data"}{" "}
          {orgEditPermission === OrgEditPermissionType.NONE ? "cannot" : "can"}{" "}
          be edited by {org.name}&apos;s members.
        </Typography>
      </div>
    );
  }

  return (
    <Slide
      classes={classes}
      title="Set privacy settings."
      content={
        <div>
          <Typography>Default Privacy Permissions:</Typography>
          <Select
            data-cy="select-privacy"
            label="Privacy"
            value={mentor.isPrivate ? "private" : "public"}
            style={{ width: 200 }}
            onChange={(event: SelectChangeEvent<"private" | "public">) => {
              editMentor({
                isPrivate: (event.target.value as string) === "private",
              });
            }}
          >
            <MenuItem data-cy="public" value="public">
              Public
            </MenuItem>
            <MenuItem data-cy="private" value="private">
              Private
            </MenuItem>
          </Select>
          <Typography style={{ marginTop: 20, marginBottom: 5 }}>
            Organization Privacy Permissions:
          </Typography>
          {renderOrgPermission()}
          {!mentor.isPublicApproved ? (
            <Typography variant="subtitle1" style={{ color: "red" }}>
              Your mentor is not yet approved to be public. They will not be
              visible to anyone until they are approved.
            </Typography>
          ) : undefined}
        </div>
      }
    />
  );
}
