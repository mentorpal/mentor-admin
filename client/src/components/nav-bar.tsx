/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { navigate } from "gatsby";
import React, { useMemo } from "react";
import {
  AppBar,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  SwipeableDrawer,
  Theme,
  Toolbar,
  Typography,
} from "@mui/material";
import { makeStyles } from "tss-react/mui";
import {
  AccountCircle,
  Build as BuildIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  ExitToApp as ExitToAppIcon,
  Group as GroupIcon,
  GetApp as GetAppIcon,
  Menu as MenuIcon,
  Mic as MicIcon,
  Person as PersonIcon,
  PublishRounded as PublishRoundedIcon,
  QuestionAnswer as QuestionAnswerIcon,
  RateReview as RateReviewIcon,
  Settings as SettingsIcon,
  Subject as SubjectIcon,
  Pageview as LRSIcon,
} from "@mui/icons-material";

import { useWithLogin } from "store/slices/login/useWithLogin";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import withLocation from "wrap-with-location";
import { Mentor, UploadTask } from "types";
import { canEditContent, isAdmin, launchMentor, managesOrg } from "helpers";
import {
  areAllTasksDone,
  isATaskCancelled,
} from "hooks/graphql/upload-status-helpers";
import { useWithImportStatus } from "hooks/graphql/use-with-import-status";
import ImportInProgressDialog from "./import-export/import-in-progress";
import { useAppSelector } from "store/hooks";
import { useWithOrganizations } from "hooks/graphql/use-with-organizations";

const useStyles = makeStyles({ name: { Login } })((theme: Theme) => ({
  toolbar: {
    minHeight: 64,
  },
  root: {
    flexGrow: 1,
  },
  menu: {
    width: 300,
  },
  menuHeader: {
    color: "#999",
    textAlign: "left",
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    textAlign: "center",
    flexGrow: 1,
  },
  login: {
    float: "right",
    right: theme.spacing(1),
  },
  uploadsButton: {
    float: "right",
    color: "white",
    textTransform: "none",
    marginRight: "10px",
  },
}));

function Login(props: { classes: Record<string, string> }): JSX.Element {
  const { classes } = props;
  const [anchorEl, setAnchorEl] = React.useState<
    EventTarget & HTMLButtonElement
  >();
  const open = Boolean(anchorEl);
  const { state: loginState, logout } = useWithLogin();
  const { getData } = useActiveMentor();
  const mentorName = getData(
    (ms) => ms.data?.name || loginState.user?.name || ""
  );

  function handleMenu(e: React.MouseEvent<HTMLButtonElement>): void {
    setAnchorEl(e.currentTarget);
  }

  function handleClose(): void {
    setAnchorEl(undefined);
  }

  function onLogout(): void {
    logout();
    navigate("/");
  }

  return (
    <div className={classes.login}>
      <Button
        data-cy="login-option"
        onClick={handleMenu}
        startIcon={<AccountCircle />}
        style={{ color: "white" }}
      >
        {mentorName}
      </Button>
      <Menu
        data-cy="login-menu"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        open={open}
        onClose={handleClose}
      >
        <MenuItem data-cy="logout-button" onClick={onLogout}>
          Logout
        </MenuItem>
      </Menu>
    </div>
  );
}

function NavItem(props: {
  icon: JSX.Element;
  text: string;
  link: string;
  onNav?: (cb: () => void) => void;
}): JSX.Element {
  return (
    <ListItem
      data-cy={`${props.text.replace(/\s/g, "-")}-menu-button`}
      button
      selected={location.pathname === props.link}
      onClick={() => {
        if (props.onNav) {
          props.onNav(() => navigate(props.link));
        } else {
          navigate(props.link);
        }
      }}
    >
      <ListItemIcon>{props.icon}</ListItemIcon>
      <ListItemText primary={props.text} />
    </ListItem>
  );
}

function NavMenu(props: {
  mentorId: string;
  classes: Record<string, string>;
  mentorSubjectsLocked: boolean;
  onNav?: (cb: () => void) => void;
  managesOrgs: boolean;
}): JSX.Element {
  const { classes, mentorSubjectsLocked, managesOrgs } = props;
  const { logout, state } = useWithLogin();
  const isSuperManagerPlus = canEditContent(state.user);

  function onLogout(): void {
    logout();
    navigate("/");
  }

  return (
    <List dense className={classes.menu}>
      <ListSubheader className={classes.menuHeader}>
        Mentor Studio
      </ListSubheader>
      <NavItem
        text={"My Mentor"}
        link={"/"}
        icon={<AccountCircle />}
        onNav={props.onNav}
      />
      {mentorSubjectsLocked ? undefined : (
        <NavItem
          text={"Select Subjects"}
          link={"/subjects"}
          icon={<SubjectIcon />}
          onNav={props.onNav}
        />
      )}
      <NavItem
        text={"Export/Import"}
        link={"/importexport"}
        icon={<GetAppIcon />}
        onNav={props.onNav}
      />
      <Divider style={{ marginTop: 15 }} />
      <ListSubheader className={classes.menuHeader}>Build Mentor</ListSubheader>
      <NavItem
        text={"Setup"}
        link={"/setup"}
        icon={<BuildIcon />}
        onNav={props.onNav}
      />
      <NavItem
        text={"Record Answers"}
        link={"/record"}
        icon={<MicIcon />}
        onNav={props.onNav}
      />
      <NavItem
        text={"Review User Feedback"}
        link={"/feedback"}
        icon={<RateReviewIcon />}
        onNav={props.onNav}
      />
      <ListItem
        button
        disabled={!props.mentorId}
        onClick={() => {
          if (props.onNav) {
            props.onNav(() => launchMentor(props.mentorId, false, true));
          } else {
            launchMentor(props.mentorId, false, true);
          }
        }}
      >
        <ListItemIcon>
          <QuestionAnswerIcon />
        </ListItemIcon>
        <ListItemText primary="Chat with Mentor" />
      </ListItem>
      <Divider style={{ marginTop: 15 }} />

      {isSuperManagerPlus || managesOrgs ? (
        <ListSubheader className={classes.menuHeader}>
          Management Tools
        </ListSubheader>
      ) : undefined}

      {isSuperManagerPlus ? (
        <>
          <NavItem
            text={"Create/Edit Subjects"}
            link={"/author/subjects"}
            icon={<EditIcon />}
            onNav={props.onNav}
          />
          <NavItem
            text={"Config"}
            link={"/config"}
            icon={<SettingsIcon />}
            onNav={props.onNav}
          />
          <NavItem
            text={"LRS Reports"}
            link={"/lrsreports"}
            icon={<LRSIcon />}
            onNav={props.onNav}
          />
        </>
      ) : undefined}
      {isSuperManagerPlus || managesOrgs ? (
        <>
          <NavItem
            text={"Users"}
            link={"/users"}
            icon={<PersonIcon />}
            onNav={props.onNav}
          />
          <NavItem
            text={"Organizations"}
            link={"/organizations"}
            icon={<GroupIcon />}
            onNav={props.onNav}
          />
          <Divider style={{ marginTop: 15 }} />
        </>
      ) : undefined}
      <ListSubheader className={classes.menuHeader}>Account</ListSubheader>
      <ListItem button onClick={onLogout}>
        <ListItemIcon>
          <ExitToAppIcon />
        </ListItemIcon>
        <ListItemText primary="Log Out" />
      </ListItem>
      <Divider />
    </List>
  );
}

export function NavBar(props: {
  mentorId: string;
  title: string;
  uploads?: UploadTask[];
  uploadsButtonVisible?: boolean;
  toggleUploadsButtonVisibility?: (b: boolean) => void;
  onNav?: (cb: () => void) => void;
  onBack?: () => void;
  checkForImportTask?: boolean;
}): JSX.Element {
  const { classes } = useStyles();
  const {
    uploads,
    uploadsButtonVisible,
    toggleUploadsButtonVisibility,
    onNav,
    onBack,
    checkForImportTask = true,
  } = props;
  const { getData } = useActiveMentor();
  const mentor: Mentor | undefined = getData((state) => state.data);
  const accessToken = useAppSelector((state) => state.login.accessToken);
  const { data: orgs } = useWithOrganizations(accessToken || "");
  const user = useAppSelector((state) => state.login.user);
  const lockedToConfig = mentor?.lockedToConfig && !isAdmin(user);
  const importStatus = useWithImportStatus();
  const { importTask } = importStatus;
  const numUploadsInProgress =
    uploads?.filter(
      (upload) => !areAllTasksDone(upload) && !isATaskCancelled(upload)
    ).length || 0;
  const numUploadsComplete =
    uploads?.filter((upload) => areAllTasksDone(upload)).length || 0;
  const managedOrgs = useMemo(() => {
    const orgNodes = orgs?.edges.map((e) => e.node) || [];
    if (!user) {
      return [];
    }
    return orgNodes.filter((org) => managesOrg(org, user));
  }, [orgs, Boolean(user)]);

  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  //if there are no uploads, defaults to true, else if there are any uploads that aren't yet cancelled, should not be disabled
  const disableUploadsButton = uploads
    ? Boolean(uploads.find((upload) => !isATaskCancelled(upload))) === false
    : true;

  function toggleDrawer(tf: boolean): void {
    setIsDrawerOpen(tf);
  }

  return (
    <div data-cy="nav-bar">
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            data-cy={onBack ? "back-button" : "menu-button"}
            edge="start"
            color="inherit"
            aria-label="menu"
            className={classes.menuButton}
            onClick={() => {
              if (onBack) {
                onBack();
              } else {
                toggleDrawer(true);
              }
            }}
            size="large"
          >
            {onBack ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
          <Typography data-cy="title" variant="h5" className={classes.title}>
            <div className="page-title">{props.title}</div>
          </Typography>
          {toggleUploadsButtonVisibility && uploads ? (
            <Button
              variant="outlined"
              disabled={disableUploadsButton}
              onClick={() => {
                toggleUploadsButtonVisibility(!uploadsButtonVisible);
              }}
              data-cy="header-uploads-button"
              className={classes.uploadsButton}
              style={{
                opacity:
                  disableUploadsButton || uploadsButtonVisible ? "50%" : "100%",
                width: "20%",
              }}
            >
              <PublishRoundedIcon style={{ paddingRight: 5 }} />
              {disableUploadsButton
                ? ""
                : numUploadsInProgress == 0
                ? "Uploads Complete"
                : `${numUploadsComplete} of ${
                    numUploadsInProgress + numUploadsComplete
                  } Uploads Complete`}
            </Button>
          ) : undefined}

          <Login classes={classes} />
        </Toolbar>
      </AppBar>
      <SwipeableDrawer
        data-cy="drawer"
        anchor="left"
        open={isDrawerOpen}
        onClose={() => toggleDrawer(false)}
        onOpen={() => toggleDrawer(true)}
        swipeAreaWidth={0}
      >
        <Toolbar />
        <NavMenu
          mentorSubjectsLocked={Boolean(
            lockedToConfig && mentor?.mentorConfig?.lockedToSubjects
          )}
          classes={classes}
          mentorId={props.mentorId}
          onNav={onNav}
          managesOrgs={managedOrgs.length > 0}
        />
      </SwipeableDrawer>
      {checkForImportTask && importTask ? (
        <ImportInProgressDialog importTask={importTask} />
      ) : undefined}
      <div className={classes.toolbar} /> {/* create space below app bar */}
    </div>
  );
}

export default React.memo(withLocation(NavBar));
