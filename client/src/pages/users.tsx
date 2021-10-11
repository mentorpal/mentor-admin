/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
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
  Toolbar,
  Tooltip,
} from "@material-ui/core";
import {
  GetApp as GetAppIcon,
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  Launch as LaunchIcon,
} from "@material-ui/icons";

import { ColumnDef, ColumnHeader } from "components/column-header";
import NavBar from "components/nav-bar";
import { ErrorDialog, LoadingDialog } from "components/dialog";
import { UseUserData, useWithUsers } from "hooks/graphql/use-with-users";
import { exportMentor } from "hooks/graphql/use-with-import-export";
import withAuthorizationOnly from "hooks/wrap-with-authorization-only";
import { Connection, Edge, User, UserRole } from "types";
import withLocation from "wrap-with-location";
import { launchMentor } from "../helpers";

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
    minWidth: 170,
    align: "left",
    sortable: true,
  },
  {
    id: "email",
    label: "Email",
    minWidth: 170,
    align: "left",
    sortable: true,
  },
  {
    id: "userRole",
    label: "Role",
    minWidth: 170,
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
  hasNext: boolean;
  hasPrev: boolean;
  onNext: () => void;
  onPrev: () => void;
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
  userPagin: UseUserData;
  userRole: UserRole;
}): JSX.Element {
  const { edge, i } = props;
  const styles = useStyles();
  const noEditPermission =
    props.userRole === UserRole.USER ||
    (edge.node.userRole === UserRole.ADMIN &&
      props.userRole !== UserRole.ADMIN);

  function handleRoleChange(user: string, permission: string) {
    props.userPagin.onUpdateUserPermissions(user, permission);
  }

  return (
    <TableRow data-cy={`user-${i}`} hover role="checkbox" tabIndex={-1}>
      <TableCell data-cy="name" align="left">
        {edge.node.name}
      </TableCell>
      <TableCell data-cy="email" align="left">
        {edge.node.email}
      </TableCell>
      <TableCell data-cy="role" align="left">
        {noEditPermission ? (
          edge.node.userRole
        ) : (
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
            >
              User
            </MenuItem>
            <MenuItem
              data-cy={`role-dropdown-${UserRole.CONTENT_MANAGER}`}
              value={UserRole.CONTENT_MANAGER}
            >
              Content Manager
            </MenuItem>
            {props.userRole === UserRole.ADMIN ? (
              <MenuItem
                data-cy={`role-dropdown-${UserRole.ADMIN}`}
                value={UserRole.ADMIN}
              >
                Admin
              </MenuItem>
            ) : undefined}
          </Select>
        )}
      </TableCell>
      <TableCell data-cy="actions" align="right">
        <Tooltip style={{ margin: 10 }} title="Launch Mentor" arrow>
          <IconButton
            data-cy="launch-default-mentor"
            onClick={() => {
              if (edge.node.defaultMentor._id)
                launchMentor(edge.node.defaultMentor._id);
            }}
            className={styles.normalButton}
          >
            <LaunchIcon />
          </IconButton>
        </Tooltip>
        <Tooltip style={{ margin: 10 }} title="Export" arrow>
          <IconButton
            data-cy="export-button"
            onClick={() => exportMentor(edge.node.defaultMentor._id)}
            className={styles.normalButton}
          >
            <GetAppIcon />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}

function UsersTable(props: {
  userData: Connection<User>;
  userPagin: UseUserData;
  userRole: UserRole;
}): JSX.Element {
  const styles = useStyles();
  const edges = props.userData.edges;

  return (
    <div className={styles.root}>
      <Paper className={styles.container}>
        <TableContainer style={{ height: "calc(100vh - 128px)" }}>
          <Table stickyHeader aria-label="sticky table">
            <ColumnHeader
              columns={columns}
              sortBy={props.userPagin.searchParams.sortBy}
              sortAsc={props.userPagin.searchParams.sortAscending}
              onSort={props.userPagin.sortBy}
            />
            <TableBody data-cy="users">
              {edges.map((edge, i) => (
                <UserItem
                  key={i}
                  edge={edge}
                  i={i}
                  userPagin={props.userPagin}
                  userRole={props.userRole}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <TableFooter
        hasNext={props.userPagin.data?.pageInfo.hasNextPage || false}
        hasPrev={props.userPagin.data?.pageInfo.hasPreviousPage || false}
        onNext={props.userPagin.nextPage}
        onPrev={props.userPagin.prevPage}
      />
    </div>
  );
}

function UsersPage(props: { accessToken: string; user: User }): JSX.Element {
  const userPagin = useWithUsers(props.accessToken);
  const styles = useStyles();
  const permissionToView =
    props.user.userRole === UserRole.ADMIN ||
    props.user.userRole === UserRole.CONTENT_MANAGER;
  if (!permissionToView) {
    return (
      <div>You must be an admin or content manager to view this page.</div>
    );
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
        userRole={props.user.userRole}
        userData={userPagin.data}
        userPagin={userPagin}
      />
      <ErrorDialog error={userPagin.userDataError} />
      <LoadingDialog title={userPagin.isLoading ? "Loading..." : ""} />
    </div>
  );
}

export default withAuthorizationOnly(withLocation(UsersPage));
