/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { navigate } from "gatsby";
import React from "react";
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
  Toolbar,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import {
  AccountCircle,
  Build as BuildIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  ExitToApp as ExitToAppIcon,
  Group,
  GetApp as GetAppIcon,
  Menu as MenuIcon,
  Mic as MicIcon,
  QuestionAnswer as QuestionAnswerIcon,
  RateReview as RateReviewIcon,
  Subject as SubjectIcon,
  PublishRounded as PublishRoundedIcon,
} from "@material-ui/icons";

import { useWithLogin } from "store/slices/login/useWithLogin";
import withLocation from "wrap-with-location";
import { UploadStatus, UploadTask, UserRole } from "types";
import { launchMentor } from "helpers";

const useStyles = makeStyles((theme) => ({
  toolbar: theme.mixins.toolbar,
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
        {loginState.user?.name || ""}
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
      data-cy={`${props.text}-menu-button`}
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
  onNav?: (cb: () => void) => void;
}): JSX.Element {
  const { classes } = props;
  const { logout, state } = useWithLogin();
  const editUsersPermission =
    state.user?.userRole === UserRole.ADMIN ||
    state.user?.userRole === UserRole.CONTENT_MANAGER;

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
      <NavItem
        text={"Select Subjects"}
        link={"/subjects"}
        icon={<SubjectIcon />}
        onNav={props.onNav}
      />
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
          launchMentor(props.mentorId);
        }}
      >
        <ListItemIcon>
          <QuestionAnswerIcon />
        </ListItemIcon>
        <ListItemText primary="Chat with Mentor" />
      </ListItem>

      <Divider style={{ marginTop: 15 }} />
      <ListSubheader className={classes.menuHeader}>Authoring</ListSubheader>
      <NavItem
        text={"Create Subject"}
        link={"/author/subjects"}
        icon={<EditIcon />}
        onNav={props.onNav}
      />
      {editUsersPermission ? (
        <NavItem
          text={"Users"}
          link={"/users"}
          icon={<Group />}
          onNav={props.onNav}
        />
      ) : undefined}
      <Divider style={{ marginTop: 15 }} />
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
  uploads: UploadTask[];
  uploadsButtonVisible: boolean;
  toggleUploadsButtonVisibility: (b: boolean) => void;
  onNav?: (cb: () => void) => void;
  onBack?: () => void;
}): JSX.Element {
  const classes = useStyles();
  const {
    uploads,
    uploadsButtonVisible,
    toggleUploadsButtonVisibility,
    onNav,
    onBack,
  } = props;
  const numUploadsInProgress = uploads?.filter(
    (upload) =>
      upload.uploadStatus !== UploadStatus.DONE &&
      upload.uploadStatus !== UploadStatus.CANCELLED
  ).length;
  const numUploadsComplete = uploads?.filter(
    (upload) => upload.uploadStatus == UploadStatus.DONE
  ).length;

  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  //if there are no uploads, defaults to true, else if there are any uploads that aren't yet cancelled, should not be disabled
  const disableUploadsButton = uploads
    ? Boolean(
        uploads.find((upload) => upload.uploadStatus !== UploadStatus.CANCELLED)
      ) === false
    : true;

  function toggleDrawer(tf: boolean): void {
    setIsDrawerOpen(tf);
  }

  return (
    <div data-cy="nav-bar" className={classes.root}>
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
          >
            {onBack ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
          <Typography data-cy="title" variant="h5" className={classes.title}>
            <div className="page-title">{props.title}</div>
          </Typography>
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

          <Login classes={classes} />
        </Toolbar>
      </AppBar>
      <SwipeableDrawer
        data-cy="drawer"
        anchor="left"
        open={isDrawerOpen}
        onClose={() => toggleDrawer(false)}
        onOpen={() => toggleDrawer(true)}
      >
        <Toolbar />
        <NavMenu classes={classes} mentorId={props.mentorId} onNav={onNav} />
      </SwipeableDrawer>
      <div className={classes.toolbar} /> {/* create space below app bar */}
    </div>
  );
}

export default withLocation(NavBar);
