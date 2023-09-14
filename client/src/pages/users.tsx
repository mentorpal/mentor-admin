/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useState } from "react";
import { navigate } from "gatsby";
import {
  AppBar,
  CircularProgress,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Toolbar,
  Tooltip,
  Theme,
  SelectChangeEvent,
  Checkbox,
  Button,
  Typography,
} from "@mui/material";
import { makeStyles } from "tss-react/mui";
import {
  Edit as EditIcon,
  GetApp as GetAppIcon,
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  Launch as LaunchIcon,
  ImportExport,
} from "@mui/icons-material";
import { Autocomplete } from "@mui/material";

import { ColumnDef, ColumnHeader } from "components/column-header";
import NavBar from "components/nav-bar";
import { ErrorDialog, LoadingDialog } from "components/dialog";
import { UseUserData, useWithUsers } from "hooks/graphql/use-with-users";
import { exportMentor } from "hooks/graphql/use-with-import-export";
import withAuthorizationOnly from "hooks/wrap-with-authorization-only";
import {
  Edge,
  JobState,
  Mentor,
  Organization,
  OrgEditPermissionType,
  User,
  UserRole,
} from "types";
import withLocation from "wrap-with-location";
import {
  canEditMentor,
  canEditMentorPrivacy,
  canEditUserRole,
  isDateWithinLastMonth,
  launchMentor,
} from "../helpers";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import { useWithOrganizations } from "hooks/graphql/use-with-organizations";
import { uuid4 } from "@sentry/utils";
import { TrainDirtyMentorButton } from "components/users/train-dirty-mentor-button";
import { useWithMentorTrainStatus } from "hooks/users/mentor-train-status";

const useStyles = makeStyles({ name: { TableFooter } })((theme: Theme) => ({
  root: {
    display: "flex",
    flexFlow: "column",
  },
  container: {
    flexGrow: 1,
  },
  appBar: {
    height: "10%",
    top: "auto",
    bottom: 0,
  },
  progress: {
    position: "fixed",
    top: "50%",
    left: "50%",
  },
  paging: {
    display: "flex",
    flexDirection: "row",
    marginLeft: "auto",
    marginRight: "auto",
  },
  dropdown: {
    width: 170,
  },
  actionItem: {
    margin: 10,
  },
  normalButton: {
    "&:hover": {
      color: theme.palette.primary.main,
    },
  },
}));

function getTableColumns(
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
      (c) => c.label !== "Disabled" && c.label !== "Disabled"
    );
  }
  return columns;
}

function TableFooter(props: {
  userPagin: UseUserData;
  user: User;
  orgs: Organization[];
  viewArchivedMentors: boolean;
  viewUnapprovedMentors: boolean;
  onToggleArchivedMentors: (v: boolean) => void;
  onToggleViewUnapprovedMentors: (v: boolean) => void;
}): JSX.Element {
  const { userPagin, viewUnapprovedMentors } = props;
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

function UserItem(props: {
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
        {userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN ? (
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
              data-cy={`role-dropdown-${UserRole.CONTENT_MANAGER}`}
              value={UserRole.CONTENT_MANAGER}
              disabled={
                !canEditUserRole(
                  props.user,
                  edge.node,
                  UserRole.CONTENT_MANAGER
                )
              }
            >
              Content Manager
            </MenuItem>
            <MenuItem
              data-cy={`role-dropdown-${UserRole.ADMIN}`}
              value={UserRole.ADMIN}
              disabled={!canEditUserRole(props.user, edge.node, UserRole.ADMIN)}
            >
              Admin
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
        {mentor.updatedAt ? new Date(mentor.updatedAt).toLocaleString() : "N/A"}
      </TableCell>
      <TableCell data-cy="actions" align="right">
        <TrainDirtyMentorButton
          mentor={mentor}
          accessToken={props.accessToken}
          mentorTrainStatusDict={mentorTrainStatusDict}
          addMentorToPoll={addMentorToPoll}
        />

        <Tooltip style={{ margin: 10 }} title="Launch Mentor" arrow>
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
        <Tooltip style={{ margin: 10 }} title="Import" arrow>
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
        <Tooltip style={{ margin: 10 }} title="Export Mentor" arrow>
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
        <Tooltip style={{ margin: 10 }} title="Edit Mentor" arrow>
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

function UsersTable(props: {
  accessToken: string;
  orgs: Organization[];
  userPagin: UseUserData;
  user: User;
  viewArchivedMentors: boolean;
  viewUnapprovedMentors: boolean;
  onToggleArchivedMentors: (v: boolean) => void;
  onToggleViewUnapprovedMentors: (v: boolean) => void;
}): JSX.Element {
  const { viewUnapprovedMentors, onToggleViewUnapprovedMentors } = props;
  const { classes: styles } = useStyles();
  const [columns, setColumns] = useState<ColumnDef[]>([]);
  const { addMentorToPoll, mentorTrainStatusDict } = useWithMentorTrainStatus({
    mentors: props.userPagin.data?.edges.map((edge) => edge.node.defaultMentor),
  });

  useEffect(() => {
    const isAdmin =
      props.user.userRole === UserRole.ADMIN ||
      props.user.userRole === UserRole.SUPER_ADMIN;
    setColumns([...getTableColumns(props.viewArchivedMentors, isAdmin)]);
  }, [props.user, props.viewArchivedMentors]);

  return (
    <div className={styles.root}>
      <Paper className={styles.container}>
        <TableContainer style={{ height: "calc(100vh - 128px)" }}>
          <Table stickyHeader aria-label="sticky table">
            <ColumnHeader
              columns={columns}
              sortBy={props.userPagin.pageSearchParams.sortBy}
              sortSub={props.userPagin.pageSearchParams.sortBySub}
              sortAsc={props.userPagin.pageSearchParams.sortAscending}
              onSort={props.userPagin.sortBy}
            />
            <TableBody data-cy="users">
              {props.userPagin.pageData?.edges.map((edge, i) => (
                <UserItem
                  key={i}
                  edge={edge}
                  i={i}
                  accessToken={props.accessToken}
                  mentorTrainStatusDict={mentorTrainStatusDict}
                  addMentorToPoll={addMentorToPoll}
                  orgs={props.orgs}
                  userPagin={props.userPagin}
                  user={props.user}
                  viewArchivedMentors={props.viewArchivedMentors}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <TableFooter
        user={props.user}
        orgs={props.orgs}
        userPagin={props.userPagin}
        viewArchivedMentors={props.viewArchivedMentors}
        viewUnapprovedMentors={viewUnapprovedMentors}
        onToggleArchivedMentors={props.onToggleArchivedMentors}
        onToggleViewUnapprovedMentors={onToggleViewUnapprovedMentors}
      />
    </div>
  );
}

function UsersPage(props: { accessToken: string; user: User }): JSX.Element {
  const userPagin = useWithUsers(props.accessToken);
  const orgsPagin = useWithOrganizations(props.accessToken);
  const { classes: styles } = useStyles();
  const { switchActiveMentor } = useActiveMentor();
  const [viewArchivedMentors, setViewArchivedMentors] =
    useState<boolean>(false);
  const [viewUnapprovedMentors, setViewUnapprovedMentors] =
    useState<boolean>(false);
  const orgs = orgsPagin.data?.edges.map((e) => e.node) || [];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const viewUnapprovedMentors = params.get("unapproved");
    if (viewUnapprovedMentors === "true") {
      setViewUnapprovedMentors(true);
    }
    switchActiveMentor();
  }, []);

  useEffect(() => {
    if (!viewUnapprovedMentors) {
      userPagin.setPreFilter({ filter: filterEditableUsers });
    } else {
      userPagin.setPreFilter({
        filter: (u) => {
          return !u.defaultMentor.isPublicApproved && filterEditableUsers(u);
        },
      });
    }
  }, [
    location.search,
    orgsPagin.data,
    viewArchivedMentors,
    viewUnapprovedMentors,
  ]);

  useEffect(() => {
    if (viewArchivedMentors) {
      userPagin.setPostSort({ sort: sortArchivedMentors });
    } else {
      userPagin.setPostSort();
    }
  }, [viewArchivedMentors, userPagin.pageSearchParams]);

  function onToggleArchivedMentors(tf: boolean) {
    setViewArchivedMentors(tf);
  }

  function onToggleViewUnapprovedMentors(tf: boolean) {
    setViewUnapprovedMentors(tf);
  }

  function filterEditableUsers(u: User): boolean {
    if (!viewArchivedMentors && u.defaultMentor.isArchived) {
      return false;
    }
    const params = new URLSearchParams(location.search);
    // filter users related to org only (member or gave permission to org)
    if (params.get("org")) {
      const org = orgs.find((o) => o._id === params.get("org"));
      if (org) {
        const isMember = org.members.find((m) => m.user._id === u._id);
        if (isMember) {
          return true;
        }
        const hasOrgPerms = u.defaultMentor.orgPermissions.find(
          (op) => op.orgId === org._id
        );
        if (hasOrgPerms) {
          return (
            hasOrgPerms.editPermission === OrgEditPermissionType.ADMIN ||
            hasOrgPerms.editPermission === OrgEditPermissionType.MANAGE
          );
        }
        return false;
      }
    }
    return canEditMentor(u.defaultMentor, props.user, orgs);
  }

  function sortArchivedMentors(a: User, b: User): number {
    if (a.defaultMentor.isArchived === b.defaultMentor.isArchived) {
      return 0;
    }
    const sortByArchived =
      userPagin.pageSearchParams.sortBySub?.includes("isArchived");
    const sortAscending = userPagin.pageSearchParams.sortAscending;
    if (a.defaultMentor.isArchived) {
      if (sortByArchived) {
        return sortAscending ? -1 : 1;
      }
      return 1;
    } else {
      if (sortByArchived) {
        return sortAscending ? 1 : -1;
      }
      return -1;
    }
  }

  if (!userPagin.data) {
    return (
      <div className={styles.root}>
        <CircularProgress className={styles.progress} />
      </div>
    );
  }

  return (
    <div>
      <NavBar title="Manage Users" />
      <UsersTable
        accessToken={props.accessToken}
        user={props.user}
        userPagin={userPagin}
        orgs={orgs}
        viewArchivedMentors={viewArchivedMentors}
        viewUnapprovedMentors={viewUnapprovedMentors}
        onToggleViewUnapprovedMentors={onToggleViewUnapprovedMentors}
        onToggleArchivedMentors={onToggleArchivedMentors}
      />
      <ErrorDialog error={userPagin.userDataError} />
      <LoadingDialog title={userPagin.isLoading ? "Loading..." : ""} />
    </div>
  );
}

export default withAuthorizationOnly(withLocation(UsersPage));
