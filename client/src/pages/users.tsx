/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect } from "react";
import { navigate } from "gatsby";
import {
  AppBar,
  CircularProgress,
  IconButton,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Toolbar,
  Tooltip,
} from "@material-ui/core";
import {
  Edit as EditIcon,
  GetApp as GetAppIcon,
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  Launch as LaunchIcon,
  ImportExport,
} from "@material-ui/icons";
import { Autocomplete } from "@material-ui/lab";

import { ColumnDef, ColumnHeader } from "components/column-header";
import NavBar from "components/nav-bar";
import { ErrorDialog, LoadingDialog } from "components/dialog";
import { UseUserData, useWithUsers } from "hooks/graphql/use-with-users";
import { exportMentor } from "hooks/graphql/use-with-import-export";
import withAuthorizationOnly from "hooks/wrap-with-authorization-only";
import { Edge, Organization, User, UserRole } from "types";
import withLocation from "wrap-with-location";
import {
  canEditMentor,
  canEditMentorPrivacy,
  canEditUserRole,
  launchMentor,
} from "../helpers";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import { useWithOrganizations } from "hooks/graphql/use-with-organizations";

const useStyles = makeStyles((theme) => ({
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

const columns: ColumnDef[] = [
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
    id: "isPrivate",
    label: "Privacy",
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

function TableFooter(props: {
  edges: Edge<User>[];
  hasNext: boolean;
  hasPrev: boolean;
  onNext: () => void;
  onPrev: () => void;
  onFilter: (f: string) => void;
}): JSX.Element {
  const styles = useStyles();
  const { hasNext, hasPrev, onNext, onPrev } = props;
  return (
    <AppBar position="sticky" color="default" className={styles.appBar}>
      <Toolbar>
        <div className={styles.paging}>
          <IconButton data-cy="prev-page" disabled={!hasPrev} onClick={onPrev}>
            <KeyboardArrowLeftIcon />
          </IconButton>
          <Autocomplete
            data-cy="user-filter"
            freeSolo
            options={props.edges.map((e) => e.node.name)}
            onChange={(e, v) => props.onFilter(v || "")}
            style={{ width: 300 }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Search users"
              />
            )}
          />
          <IconButton data-cy="next-page" disabled={!hasNext} onClick={onNext}>
            <KeyboardArrowRightIcon />
          </IconButton>
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
}): JSX.Element {
  const { edge, i, user, orgs } = props;
  const styles = useStyles();
  const { switchActiveMentor } = useActiveMentor();
  const userRole = user.userRole;
  const mentor = edge.node.defaultMentor;

  function handleRoleChange(user: string, permission: string): void {
    props.userPagin.onUpdateUserPermissions(user, permission);
  }

  function handlePrivacyChange(mentor: string, isPrivate: boolean): void {
    props.userPagin.onUpdateMentorPrivacy(mentor, isPrivate);
  }

  return (
    <TableRow data-cy={`user-${i}`} hover role="checkbox" tabIndex={-1}>
      <TableCell data-cy="name" align="left">
        {edge.node.name}
      </TableCell>
      <TableCell data-cy="defaultMentor" align="left">
        {mentor?.name || ""}
      </TableCell>
      <TableCell data-cy="email" align="left">
        {edge.node.email}
      </TableCell>
      <TableCell data-cy="role" align="left">
        {userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN ? (
          <Select
            data-cy="select-role"
            value={edge.node.userRole}
            onChange={(
              event: React.ChangeEvent<{ value: unknown; name?: unknown }>
            ) => {
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
            onChange={(
              event: React.ChangeEvent<{ value: unknown; name?: unknown }>
            ) => {
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
      <TableCell data-cy="actions" align="right">
        <Tooltip style={{ margin: 10 }} title="Launch Mentor" arrow>
          <IconButton
            data-cy="launch-default-mentor"
            onClick={() => {
              if (mentor._id) launchMentor(mentor._id, true);
            }}
            className={styles.normalButton}
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
}): JSX.Element {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <Paper className={styles.container}>
        <TableContainer style={{ height: "calc(100vh - 128px)" }}>
          <Table stickyHeader aria-label="sticky table">
            <ColumnHeader
              columns={columns}
              sortBy={props.userPagin.pageSearchParams.sortBy}
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
                  orgs={props.orgs}
                  userPagin={props.userPagin}
                  user={props.user}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <TableFooter
        edges={props.userPagin.data?.edges || []}
        hasNext={props.userPagin.pageData?.pageInfo.hasNextPage || false}
        hasPrev={props.userPagin.pageData?.pageInfo.hasPreviousPage || false}
        onNext={props.userPagin.nextPage}
        onPrev={props.userPagin.prevPage}
        onFilter={(f) =>
          props.userPagin.filter(
            f ? { $or: [{ name: f }, { defaultMentor: { name: f } }] } : {}
          )
        }
      />
    </div>
  );
}

function UsersPage(props: { accessToken: string; user: User }): JSX.Element {
  const userPagin = useWithUsers(props.accessToken);
  const orgsPagin = useWithOrganizations(props.accessToken);
  const styles = useStyles();
  const { switchActiveMentor } = useActiveMentor();

  const mentors = userPagin.data?.edges.map((e) => e.node.defaultMentor) || [];
  const orgs = orgsPagin.data?.edges.map((e) => e.node) || [];
  const mentorsCanEdit = mentors.filter((m) =>
    canEditMentor(m, props.user, orgs)
  );

  useEffect(() => {
    switchActiveMentor();
  }, []);

  if (!userPagin.data) {
    return (
      <div className={styles.root}>
        <CircularProgress className={styles.progress} />
      </div>
    );
  }
  if (mentorsCanEdit.length === 0) {
    return (
      <div>You must be an admin or content manager to view this page.</div>
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
      />
      <ErrorDialog error={userPagin.userDataError} />
      <LoadingDialog title={userPagin.isLoading ? "Loading..." : ""} />
    </div>
  );
}

export default withAuthorizationOnly(withLocation(UsersPage));
