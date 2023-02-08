/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { navigate } from "gatsby";
import React, { useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import {
  AppBar,
  Button,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Fab,
  FormControlLabel,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListSubheader,
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
  Typography,
  Theme,
  SelectChangeEvent,
} from "@mui/material";
import { makeStyles } from "tss-react/mui";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { Autocomplete } from "@mui/material";

import { ColumnDef, ColumnHeader } from "components/column-header";
import NavBar from "components/nav-bar";
import { ErrorDialog, LoadingDialog } from "components/dialog";
import withAuthorizationOnly from "hooks/wrap-with-authorization-only";
import {
  UseOrganizationData,
  useWithOrganizations,
} from "hooks/graphql/use-with-organizations";
import { UseUserData, useWithUsers } from "hooks/graphql/use-with-users";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import { Organization, User, UserRole } from "types";
import withLocation from "wrap-with-location";
import {
  canEditOrganization,
  copyAndRemove,
  copyAndSet,
  getOrgHomeUrl,
} from "../helpers";
import { uuid4 } from "@sentry/utils";

const reservedSubdomains = [
  "newdev",
  "api-dev",
  "static-newdev",
  "v2",
  "api-qa",
  "sbert-qa",
  "static-v2",
  "careerfair",
  "api",
  "sbert",
  "static-careerfair",
  "local",
  "uscquestions",
  "static-uscquestions",
];

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
  list: {
    background: "#F5F5F5",
  },
  dropdown: {
    width: 170,
  },
  actionItem: {
    margin: 10,
  },
  fab: {
    position: "absolute",
    right: theme.spacing(1),
    zIndex: 1,
  },
  button: {
    width: 200,
    padding: 5,
    margin: theme.spacing(2),
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
    id: "subdomain",
    label: "Subdomain",
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
  user: User;
  pagin: UseOrganizationData;
  onCreateOrg: () => void;
}): JSX.Element {
  const { classes: styles } = useStyles();
  const { user, pagin } = props;
  const hasPreviousPage = pagin.pageData?.pageInfo.hasPreviousPage || false;
  const hasNextPage = pagin.pageData?.pageInfo.hasNextPage || false;
  const canCreate =
    user.userRole === UserRole.SUPER_ADMIN ||
    user.userRole === UserRole.SUPER_CONTENT_MANAGER;

  return (
    <AppBar position="sticky" color="default" className={styles.appBar}>
      <Toolbar>
        <div className={styles.paging}>
          <IconButton
            data-cy="prev-page"
            disabled={!hasPreviousPage}
            onClick={pagin.prevPage}
            size="large"
          >
            <KeyboardArrowLeftIcon />
          </IconButton>
          <Autocomplete
            data-cy="filter"
            freeSolo
            options={(pagin.data?.edges || []).map((e) => e.node.name)}
            onChange={(e, v) => pagin.filter({ name: v || "" })}
            style={{ width: 300 }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                placeholder="Search organizations"
              />
            )}
            renderOption={(params, option) => (
              <Typography {...params} key={`${option}${uuid4()}`}>
                {option}
              </Typography>
            )}
          />
          <IconButton
            data-cy="next-page"
            disabled={!hasNextPage}
            onClick={pagin.nextPage}
            size="large"
          >
            <KeyboardArrowRightIcon />
          </IconButton>
          {canCreate ? (
            <Fab
              data-cy="create"
              variant="extended"
              color="primary"
              className={styles.fab}
              onClick={props.onCreateOrg}
            >
              <AddIcon />
              Create Org
            </Fab>
          ) : undefined}
        </div>
      </Toolbar>
    </AppBar>
  );
}

function EditOrganization(props: {
  org: Partial<Organization> | undefined;
  orgPagin: UseOrganizationData;
  userPagin: UseUserData;
  edit: (org: Partial<Organization> | undefined) => void;
  save: () => void;
}): JSX.Element {
  const { classes: styles } = useStyles();
  const { org, orgPagin, userPagin, edit } = props;
  const [msg, setMsg] = useState<string>();
  const [shouldScroll, setShouldScroll] = useState<boolean>(false);
  const scrollRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    if (!org || !orgPagin.data) {
      return;
    }
    if (!org.uuid) {
      setMsg("* missing uuid");
    } else if (!org.name) {
      setMsg("* must have name");
    } else if (!org.subdomain) {
      setMsg("* must have subdomain");
    } else if (reservedSubdomains.includes(org.subdomain)) {
      setMsg("* subdomain is reserved");
    } else if (!/^[a-z0-9]{3,20}$/.test(org.subdomain)) {
      setMsg(
        "* subdomain must be lower-case, alpha-numerical, and 3-20 characters"
      );
    } else if (
      orgPagin.data.edges.find(
        (e) => e.node.subdomain === org.subdomain && e.node._id !== org._id
      )
    ) {
      setMsg("* subdomain is already in use by another organization");
    } else {
      setMsg(undefined);
    }
  }, [org]);

  useEffect(() => {
    if (shouldScroll && scrollRef && scrollRef.current) {
      scrollRef.current.scrollIntoView();
      setShouldScroll(false);
    }
  }, [org?.members?.length, shouldScroll]);

  return (
    <Dialog
      data-cy="edit-org"
      maxWidth="xl"
      fullWidth={true}
      open={Boolean(org)}
    >
      <DialogTitle>Edit Organization</DialogTitle>
      <DialogContent>
        <TextField
          data-cy="edit-name"
          data-test={org?.name}
          label="Name"
          variant="outlined"
          value={org?.name}
          onChange={(e) => edit({ ...org!, name: e.target.value })}
          fullWidth
          multiline
          required
        />
        <TextField
          data-cy="edit-subdomain"
          data-test={org?.subdomain}
          label="Subdomain"
          variant="outlined"
          value={org?.subdomain}
          onChange={(e) => edit({ ...org!, subdomain: e.target.value })}
          style={{ marginTop: 10 }}
          fullWidth
          multiline
          required
        />
        <FormControlLabel
          control={
            <Checkbox
              data-cy="edit-privacy"
              data-test={org?.isPrivate}
              checked={org?.isPrivate}
              onChange={() => edit({ ...org!, isPrivate: !org?.isPrivate })}
              color="secondary"
            />
          }
          label="Is Private (can only be viewed by members)"
          style={{ width: "100%", alignSelf: "left" }}
        />
        <List
          data-cy="edit-members"
          className={styles.list}
          style={{ height: 300, overflow: "auto", marginTop: 10 }}
          subheader={<ListSubheader>Members</ListSubheader>}
        >
          {org?.members?.map((m, i) => {
            return (
              <ListItem key={`member-${i}`} data-cy={`member-${i}`}>
                <Card style={{ width: "100%" }}>
                  <CardContent
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <ListItemText
                      data-cy="member-name"
                      data-test={m.user.name}
                      primary={m.user.defaultMentor.name}
                      secondary={m.user.email}
                      style={{ flexGrow: 1 }}
                    />
                    <Select
                      data-cy="member-select-role"
                      value={m.role}
                      onChange={(event: SelectChangeEvent<string>) =>
                        edit({
                          ...org!,
                          members: copyAndSet(org.members || [], i, {
                            ...m,
                            role: event.target.value as string,
                          }),
                        })
                      }
                      className={styles.dropdown}
                    >
                      <MenuItem data-cy={`role-admin`} value={UserRole.ADMIN}>
                        Admin
                      </MenuItem>
                      <MenuItem
                        data-cy={`role-content-manager`}
                        value={UserRole.CONTENT_MANAGER}
                      >
                        Content Manager
                      </MenuItem>
                      <MenuItem data-cy={`role-user`} value={UserRole.USER}>
                        User
                      </MenuItem>
                    </Select>
                    <CardActions>
                      <FormControlLabel
                        control={
                          <IconButton
                            data-cy="remove-member"
                            size="small"
                            onClick={() =>
                              edit({
                                ...org!,
                                members: copyAndRemove(org.members || [], i),
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
            );
          })}
          <li ref={scrollRef} />
        </List>
        <Autocomplete
          data-cy="member-search"
          options={userPagin.data?.edges.map((e) => e.node) || []}
          getOptionLabel={(option: User) => option.defaultMentor.name}
          getOptionDisabled={(option: User) =>
            Boolean(org!.members?.find((m) => m.user._id === option._id))
          }
          onChange={(e, v) => {
            if (v) {
              edit({
                ...org!,
                members: [
                  ...(org!.members || []),
                  { user: v, role: UserRole.USER },
                ],
              });
              setShouldScroll(true);
            }
          }}
          style={{ width: "100%" }}
          renderOption={(props, option) => (
            <Typography
              {...props}
              data-cy={`member-${option._id}`}
              key={option._id}
            >
              {option.defaultMentor.name} ({option.email})
            </Typography>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              placeholder="Choose a user"
              label="Add User"
            />
          )}
        />
        <Typography style={{ color: "red" }}>{msg}</Typography>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          <Button
            data-cy="cancel"
            color="secondary"
            variant="outlined"
            className={styles.button}
            onClick={() => edit(undefined)}
          >
            Cancel
          </Button>
          <Button
            data-cy="save"
            color="primary"
            variant="outlined"
            className={styles.button}
            onClick={props.save}
            disabled={Boolean(msg)}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function OrganizationItem(props: {
  org: Organization;
  user: User;
  i: number;
  onEdit: (org: Organization) => void;
}): JSX.Element {
  const { org, user } = props;
  const { classes: styles } = useStyles();
  const hasEditPermission = canEditOrganization(org, user);

  return (
    <TableRow data-cy={`org-${props.i}`} hover role="checkbox" tabIndex={-1}>
      <TableCell data-cy="name" align="left">
        {org.name}
      </TableCell>
      <TableCell data-cy="subdomain" align="left">
        <a href={getOrgHomeUrl(org.subdomain)} target="_blank" rel="noreferrer">
          {org.subdomain}
        </a>
      </TableCell>
      <TableCell data-cy="actions" align="right">
        <Tooltip style={{ margin: 10 }} title="Edit" arrow>
          <span>
            <IconButton
              data-cy="edit"
              onClick={() => props.onEdit(org)}
              className={styles.normalButton}
              disabled={!hasEditPermission}
              size="large"
            >
              <EditIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip style={{ margin: 10 }} title="Config" arrow>
          <span>
            <IconButton
              data-cy="config"
              onClick={() => navigate(`/config?org=${org._id}`)}
              className={styles.normalButton}
              disabled={!hasEditPermission}
              size="large"
            >
              <SettingsIcon />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip style={{ margin: 10 }} title="Users" arrow>
          <span>
            <IconButton
              data-cy="users"
              onClick={() => navigate(`/users?org=${org._id}`)}
              className={styles.normalButton}
              disabled={!hasEditPermission}
              size="large"
            >
              <PersonIcon />
            </IconButton>
          </span>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}

function OrganizationsTable(props: {
  accessToken: string;
  orgPagin: UseOrganizationData;
  userPagin: UseUserData;
  user: User;
}): JSX.Element {
  const { classes: styles } = useStyles();
  const [editOrg, setEditOrg] = useState<Partial<Organization>>();

  function onCreateOrg(): void {
    setEditOrg({
      _id: undefined,
      uuid: uuid(),
      name: "",
      subdomain: "",
      isPrivate: false,
      members: [],
    });
  }

  function onSaveOrg(): void {
    if (!editOrg) {
      return;
    }
    props.orgPagin.saveOrganization(editOrg);
    setEditOrg(undefined);
  }

  return (
    <div className={styles.root}>
      <Paper className={styles.container}>
        <TableContainer style={{ height: "calc(100vh - 128px)" }}>
          <Table stickyHeader aria-label="sticky table">
            <ColumnHeader
              columns={columns}
              sortBy={props.orgPagin.pageSearchParams.sortBy}
              sortAsc={props.orgPagin.pageSearchParams.sortAscending}
              onSort={props.orgPagin.sortBy}
            />
            <TableBody data-cy="orgs">
              {props.orgPagin.pageData?.edges.map((edge, i) => (
                <OrganizationItem
                  key={i}
                  i={i}
                  org={edge.node}
                  user={props.user}
                  onEdit={(org) => setEditOrg(org)}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <TableFooter
        user={props.user}
        pagin={props.orgPagin}
        onCreateOrg={onCreateOrg}
      />
      <EditOrganization
        org={editOrg}
        orgPagin={props.orgPagin}
        userPagin={props.userPagin}
        edit={(org) => setEditOrg(org)}
        save={onSaveOrg}
      />
    </div>
  );
}

function OrganizationsPage(props: {
  accessToken: string;
  user: User;
}): JSX.Element {
  const userPagin = useWithUsers(props.accessToken);
  const orgsPagin = useWithOrganizations(props.accessToken);
  const { classes: styles } = useStyles();
  const { switchActiveMentor } = useActiveMentor();

  useEffect(() => {
    switchActiveMentor();
  }, []);

  if (!orgsPagin.data) {
    return (
      <div className={styles.root}>
        <CircularProgress className={styles.progress} />
      </div>
    );
  }

  return (
    <div>
      <NavBar title="Organizations" />
      <OrganizationsTable
        accessToken={props.accessToken}
        orgPagin={orgsPagin}
        userPagin={userPagin}
        user={props.user}
      />
      <ErrorDialog error={orgsPagin.error} />
      <LoadingDialog title={orgsPagin.isLoading ? "Loading..." : ""} />
    </div>
  );
}

export default withAuthorizationOnly(withLocation(OrganizationsPage));
