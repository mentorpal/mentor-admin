/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import {
  AppBar,
  Toolbar,
  Select,
  SelectChangeEvent,
  MenuItem,
  IconButton,
  Autocomplete,
  TextField,
  Switch,
} from "@mui/material";
import { ColumnDef } from "components/column-header";
import { UseUserData } from "hooks/graphql/use-with-users";
import { makeStyles } from "tss-react/mui";
import { User, Organization } from "types";
import {
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
} from "@mui/icons-material";
import { v4 as uuid4 } from "uuid";
import { managesOrg } from "helpers";
const useStyles = makeStyles({ name: { TableFooter } })(() => ({
  appBar: {
    height: "10%",
    top: "auto",
    bottom: 0,
  },
  paging: {
    display: "flex",
    flexDirection: "row",
    marginLeft: "auto",
    marginRight: "auto",
  },
}));

export const ALL_ORGS = "All Orgs";

export function getTableColumns(
  viewArchivedMentors: boolean,
  isAdmin: boolean
): ColumnDef[] {
  let columns: ColumnDef[] = [
    {
      id: "defaultMentor",
      subField: ["isPublicApproved"],
      label: "Approval",
      minWidth: 0,
      align: "left",
      sortable: true,
    },
    {
      id: "name",
      label: "Name",
      minWidth: 0,
      align: "left",
      sortable: true,
    },
    {
      id: "defaultMentor",
      subField: ["name"],
      label: "Mentor",
      minWidth: 0,
      align: "left",
      sortable: true,
    },
    {
      id: "email",
      label: "Email",
      minWidth: 0,
      align: "left",
      sortable: true,
    },
    {
      id: "userRole",
      label: "Role",
      minWidth: 0,
      align: "left",
      sortable: true,
    },
    {
      id: "defaultMentor",
      subField: ["isPrivate"],
      label: "Privacy",
      minWidth: 0,
      align: "left",
      sortable: true,
    },
    {
      id: "isDisabled",
      label: "Disabled",
      minWidth: 0,
      align: "left",
      sortable: true,
    },
    {
      id: "defaultMentor",
      subField: ["isAdvanced"],
      label: "Advanced",
      minWidth: 0,
      align: "left",
      sortable: true,
    },
    {
      id: "defaultMentor",
      subField: ["isArchived"],
      label: "Archived",
      minWidth: 0,
      align: "left",
      sortable: true,
    },
    {
      id: "defaultMentor",
      subField: ["lockedToConfig"],
      label: "Locked",
      minWidth: 0,
      align: "left",
      sortable: true,
    },
    {
      id: "defaultMentor",
      subField: ["updatedAt"],
      label: "Last Updated",
      minWidth: 0,
      align: "left",
      sortable: true,
    },
    {
      id: "actions",
      label: "",
      minWidth: 0,
      align: "left",
      sortable: false,
    },
  ];
  if (!viewArchivedMentors) {
    columns = columns.filter((c) => c.label !== "Archived");
  }
  if (!isAdmin) {
    columns = columns.filter(
      (c) =>
        c.label !== "Disabled" &&
        c.label !== "Disabled" &&
        c.label !== "Locked" &&
        c.label !== "Advanced"
    );
  }
  return columns;
}

export function TableFooter(props: {
  userPagin: UseUserData;
  user: User;
  orgs: Organization[];
  selectedOrg: string;
  setSelectedOrg: (orgId: string) => void;
  viewArchivedMentors: boolean;
  viewUnapprovedMentors: boolean;
  onToggleArchivedMentors: (v: boolean) => void;
  onToggleViewUnapprovedMentors: (v: boolean) => void;
}): JSX.Element {
  const {
    userPagin,
    viewUnapprovedMentors,
    setSelectedOrg,
    orgs,
    selectedOrg,
  } = props;
  const orgsUserManages = orgs.filter((o) => managesOrg(o, props.user));
  const _selectedOrg = orgs.find((o) => o._id === selectedOrg);
  const { classes: styles } = useStyles();
  const edges = userPagin.searchData?.edges || [];
  const hasNext = userPagin.pageData?.pageInfo.hasNextPage || false;
  const hasPrev = userPagin.pageData?.pageInfo.hasPreviousPage || false;
  const pageSizes = [10, 20, 50, 100];

  return (
    <AppBar position="sticky" color="default" className={styles.appBar}>
      <Toolbar>
        <div className={styles.paging}>
          <Select
            value={userPagin.pageSize || 0}
            onChange={(e: SelectChangeEvent<number>) =>
              userPagin.setPageSize(e.target.value as number)
            }
          >
            {pageSizes.map((p) => (
              <MenuItem key={p} value={p}>
                {p}
              </MenuItem>
            ))}
          </Select>
          <Select
            value={_selectedOrg?.name || ALL_ORGS}
            onChange={(e: SelectChangeEvent<string>) => {
              const org = orgs.find((o) => o.name === e.target.value);
              setSelectedOrg(org?._id || "");
            }}
          >
            <MenuItem value={ALL_ORGS}>All Orgs</MenuItem>
            {orgsUserManages.map((org) => (
              <MenuItem key={org.name} value={org.name}>
                {org.name}
              </MenuItem>
            ))}
          </Select>
          <IconButton
            data-cy="prev-page"
            disabled={!hasPrev}
            onClick={userPagin.prevPage}
            size="large"
          >
            <KeyboardArrowLeftIcon />
          </IconButton>
          <IconButton
            data-cy="next-page"
            disabled={!hasNext}
            onClick={userPagin.nextPage}
            size="large"
          >
            <KeyboardArrowRightIcon />
          </IconButton>
          <Autocomplete
            data-cy="user-filter"
            freeSolo
            options={edges.map((e) => e.node.name)}
            onChange={(e, v) => {
              const value = v || "";
              userPagin.filter(
                value
                  ? {
                      $or: [
                        { name: value },
                        { defaultMentor: { name: value } },
                      ],
                    }
                  : {}
              );
            }}
            style={{ width: 300 }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Search users"
              />
            )}
            renderOption={(props, option) => (
              <li {...props} key={`${option}${uuid4()}`}>
                {option}
              </li>
            )}
          />
          <span style={{ margin: "15px" }}>
            View Archived Mentors
            <Switch
              data-cy="archive-mentor-switch"
              data-test={props.viewArchivedMentors}
              checked={props.viewArchivedMentors}
              onChange={(e) => props.onToggleArchivedMentors(e.target.checked)}
            />
          </span>
          <span style={{ margin: "15px" }}>
            View Unapproved Mentors Only
            <Switch
              data-cy="mentors-approval-switch"
              data-test={viewUnapprovedMentors}
              checked={viewUnapprovedMentors}
              onChange={(e) =>
                props.onToggleViewUnapprovedMentors(e.target.checked)
              }
            />
          </span>
        </div>
      </Toolbar>
    </AppBar>
  );
}
