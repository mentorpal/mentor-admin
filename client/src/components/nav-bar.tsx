/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { navigate, Link } from "gatsby";
import React, { useContext } from "react";
import {
  AppBar,
  Button,
  Divider,
  IconButton,
  List,
  ListItem,
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
  Close as CloseIcon,
  Menu as MenuIcon,
} from "@material-ui/icons";
import { UploadStatus, UploadTask } from "hooks/graphql/use-with-upload-status";
import { CLIENT_ENDPOINT } from "api";
import Context from "context";
import withLocation from "wrap-with-location";
import PublishRoundedIcon from "@material-ui/icons/PublishRounded";

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
  const context = useContext(Context);

  function handleMenu(e: React.MouseEvent<HTMLButtonElement>): void {
    setAnchorEl(e.currentTarget);
  }

  function handleClose(): void {
    setAnchorEl(undefined);
  }

  function onLogout(): void {
    context.logout();
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
        {context.user?.name || ""}
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

function NavMenu(props: {
  mentorId: string | undefined;
  classes: Record<string, string>;
}): JSX.Element {
  const { classes } = props;
  const context = useContext(Context);

  async function openChat() {
    const path = `${location.origin}${CLIENT_ENDPOINT}?mentor=${props.mentorId}`;
    window.location.href = path;
  }

  function onLogout(): void {
    context.logout();
    navigate("/");
  }

  return (
    <List dense className={classes.menu}>
      <ListSubheader className={classes.menuHeader}>Build Mentor</ListSubheader>
      <ListItem
        button
        component={Link}
        to={"/"}
        selected={location.pathname === "/"}
      >
        <ListItemText primary="My Mentor" />
      </ListItem>
      <ListItem
        button
        component={Link}
        to={"/record"}
        selected={location.pathname.includes("/record")}
      >
        <ListItemText primary="Record Questions" />
      </ListItem>

      <ListItem
        button
        component={Link}
        to={"/feedback"}
        selected={location.pathname.includes("/feedback")}
      >
        <ListItemText primary="Corrections and User Feedback" />
      </ListItem>
      <ListItem button disabled={!props.mentorId} onClick={openChat}>
        <ListItemText primary="Chat with Mentor" />
      </ListItem>
      <Divider style={{ marginTop: 15 }} />

      <ListSubheader className={classes.menuHeader}>Setup Mentor</ListSubheader>
      <ListItem
        button
        component={Link}
        to={"/profile"}
        selected={location.pathname === "/profile"}
      >
        <ListItemText primary="Profile" />
      </ListItem>
      <ListItem
        button
        component={Link}
        to={"/subjects"}
        selected={location.pathname === "/subjects"}
      >
        <ListItemText primary="Select Subjects" />
      </ListItem>
      <ListItem
        button
        component={Link}
        to={"/setup"}
        selected={location.pathname === "/setup"}
      >
        <ListItemText primary="Setup" />
      </ListItem>

      <Divider style={{ marginTop: 15 }} />

      <ListSubheader className={classes.menuHeader}>
        Subjects and Templates
      </ListSubheader>
      <ListItem
        button
        component={Link}
        to={"/author/subjects"}
        selected={location.pathname.includes("/author/subject")}
      >
        <ListItemText primary="Subjects" />
      </ListItem>
      <Divider style={{ marginTop: 15 }} />

      <ListSubheader className={classes.menuHeader}>Account</ListSubheader>
      <ListItem button onClick={onLogout}>
        <ListItemText primary="Log Out" />
      </ListItem>
      <Divider />
    </List>
  );
}
export function NavBar(props: {
  mentorId: string | undefined;
  title: string;
  search: {
    back?: string;
  };
  uploads: UploadTask[];
  uploadsButtonVisible: boolean;
  toggleUploadsButtonVisibility: (b: boolean) => void;
}): JSX.Element {
  const classes = useStyles();
  const { back } = props.search;
  const { uploads, uploadsButtonVisible, toggleUploadsButtonVisibility } =
    props;
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
            data-cy={back ? "back-button" : "menu-button"}
            edge="start"
            color="inherit"
            aria-label="menu"
            className={classes.menuButton}
            onClick={() => {
              if (back) {
                navigate(decodeURI(back));
              } else {
                toggleDrawer(true);
              }
            }}
          >
            {back ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
          <Typography data-cy="title" variant="h5" className={classes.title}>
            {props.title}
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
        <NavMenu classes={classes} mentorId={props.mentorId} />
      </SwipeableDrawer>
      <div className={classes.toolbar} /> {/* create space below app bar */}
    </div>
  );
}

export default withLocation(NavBar);
