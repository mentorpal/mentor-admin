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
  InputLabel,
} from "@material-ui/core";
import { Mentor, Organization, OrgPermissionType } from "types";
import { Slide } from "./slide";
import { copyAndSet } from "helpers";

export function MentorPrivacySlide(props: {
  classes: Record<string, string>;
  mentor?: Mentor;
  orgs: Organization[];
  isMentorLoading: boolean;
  editMentor: (edits: Partial<Mentor>) => void;
}): JSX.Element {
  const { classes, mentor, orgs, isMentorLoading, editMentor } = props;
  const [org, setOrg] = useState<Organization>();
  const [orgPermission, setOrgPermission] = useState<OrgPermissionType>();

  function setPermission(p: OrgPermissionType): void {
    if (!org || !mentor) {
      return;
    }
    setOrgPermission(p);
    const idx =
      mentor.orgPermissions?.findIndex((op) => op.org === org._id) || -1;
    if (idx === -1) {
      editMentor({
        orgPermissions: [
          ...(mentor.orgPermissions || []),
          { org: org._id, orgName: org.name, permission: p },
        ],
      });
    } else {
      editMentor({
        orgPermissions: copyAndSet(mentor.orgPermissions || [], idx, {
          ...mentor.orgPermissions[idx],
          permission: p,
        }),
      });
    }
  }

  useEffect(() => {
    if (orgs.length > 0 && !org) {
      setOrg(orgs[0]);
    }
  }, [orgs]);

  useEffect(() => {
    if (org && mentor) {
      setOrgPermission(
        mentor.orgPermissions?.find((op) => op.org === org._id)?.permission ||
          OrgPermissionType.NONE
      );
    }
  }, [org, mentor]);

  if (!mentor || isMentorLoading) {
    return <div />;
  }

  return (
    <Slide
      classes={classes}
      title="Set privacy settings."
      content={
        <div>
          <Select
            data-cy="select-privacy"
            label="Privacy"
            value={mentor.isPrivate ? "private" : "public"}
            style={{ width: 200 }}
            onChange={(
              event: React.ChangeEvent<{
                name?: string | undefined;
                value: unknown;
              }>
            ) => {
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
          <Typography style={{ marginBottom: 20 }}>
            {mentor.isPrivate
              ? "You can only be viewed by admins or organizations you Share to."
              : "You can be viewed by everyone except organizations you have Hidden from."}
          </Typography>
          {org && orgPermission ? (
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
                    onChange={(
                      event: React.ChangeEvent<{
                        value: unknown;
                        name?: unknown;
                      }>
                    ) =>
                      setOrg(
                        orgs.find(
                          (o) => o._id === (event.target.value as string)
                        )
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
                <FormControl style={{ width: 150 }}>
                  <InputLabel>Permission</InputLabel>
                  <Select
                    data-cy="select-org-permission"
                    label="Org"
                    value={orgPermission}
                    cy-value={orgPermission}
                    onChange={(
                      event: React.ChangeEvent<{
                        value: unknown;
                        name?: unknown;
                      }>
                    ) => setPermission(event.target.value as OrgPermissionType)}
                  >
                    <MenuItem
                      data-cy="org-permission-none"
                      value={OrgPermissionType.NONE}
                    >
                      None
                    </MenuItem>
                    <MenuItem
                      data-cy="org-permission-hidden"
                      value={OrgPermissionType.HIDDEN}
                    >
                      Hidden
                    </MenuItem>
                    <MenuItem
                      data-cy="org-permission-share"
                      value={OrgPermissionType.SHARE}
                    >
                      Share
                    </MenuItem>
                    <MenuItem
                      data-cy="org-permission-manage"
                      value={OrgPermissionType.MANAGE}
                    >
                      Manage
                    </MenuItem>
                    <MenuItem
                      data-cy="org-permission-admin"
                      value={OrgPermissionType.ADMIN}
                    >
                      Admin
                    </MenuItem>
                  </Select>
                </FormControl>
              </div>
              <Typography>
                {org.name} will{" "}
                {orgPermission === OrgPermissionType.NONE
                  ? "have the same permissions as your default privacy settings."
                  : orgPermission === OrgPermissionType.HIDDEN
                  ? "not be able to view your mentor."
                  : orgPermission === OrgPermissionType.SHARE
                  ? "be able to view your mentor."
                  : orgPermission === OrgPermissionType.ADMIN
                  ? "be able to edit your mentor and permissions."
                  : "be able to edit your mentor."}
              </Typography>
            </div>
          ) : undefined}
        </div>
      }
    />
  );
}
