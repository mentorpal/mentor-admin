/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  CircularProgress,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@material-ui/core";
import { ColumnDef, ColumnHeader } from "components/column-header";
import NavBar from "components/nav-bar";
import { UseUserData, useWithUsers } from "hooks/graphql/use-with-users";
import withAuthorizationOnly from "hooks/wrap-with-authorization-only";
import React from "react";
import { Connection, Edge, User, UserRole } from "types";
import withLocation from "wrap-with-location";

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
    position: "absolute",
    right: theme.spacing(1),
  },
  dropdown: {
    width: 170,
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
];

function UserItem(props: {
  row: Edge<User>;
  i: number;
  userPagin: UseUserData;
}): JSX.Element {
  const { row, i } = props;
  const styles = useStyles();

  function handleRoleChange(user: string, permission: string) {
    try {
      props.userPagin.onUpdateUserPermissions(user, permission);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <TableRow data-cy={`user-${i}`} hover role="checkbox" tabIndex={-1}>
      <TableCell data-cy="name" align="left">
        {row.node.name}
      </TableCell>
      <TableCell data-cy="email" align="left">
        {row.node.email}
      </TableCell>
      <TableCell data-cy="role" align="left">
        <Select
          data-cy="select-role"
          value={row.node.userRole}
          onChange={(
            event: React.ChangeEvent<{ value: unknown; name?: unknown }>
          ) => {
            handleRoleChange(row.node._id, event.target.value as string);
          }}
          className={styles.dropdown}
        >
          <MenuItem
            data-cy={`role-dropdown-${UserRole.USER}`}
            value={UserRole.USER}
          >
            Author
          </MenuItem>
          <MenuItem
            data-cy={`role-dropdown-${UserRole.CONTENT_MANAGER}`}
            value={UserRole.CONTENT_MANAGER}
          >
            Content Manager
          </MenuItem>
          <MenuItem
            data-cy={`role-dropdown-${UserRole.ADMIN}`}
            value={UserRole.ADMIN}
          >
            Admin
          </MenuItem>
        </Select>
      </TableCell>
    </TableRow>
  );
}

function UsersTable(props: {
  userData: Connection<User>;
  userPagin: UseUserData;
}): JSX.Element {
  const styles = useStyles();
  //const [users, setUsers] = React.useState<Connection<User>>();
  const users = props.userData.edges;

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
              {users.map((row, i) => (
                <UserItem
                  key={row.node._id}
                  row={row}
                  i={i}
                  userPagin={props.userPagin}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
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
      <UsersTable userData={userPagin.data} userPagin={userPagin} />
    </div>
  );
}

export default withAuthorizationOnly(withLocation(UsersPage));
