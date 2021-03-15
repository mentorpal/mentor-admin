/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { navigate, Link } from "gatsby";
import React, { useContext } from "react";
import { useCookies } from "react-cookie";
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
import AccountCircle from "@material-ui/icons/AccountCircle";
import CloseIcon from "@material-ui/icons/Close";
import MenuIcon from "@material-ui/icons/Menu";

import { CLIENT_ENDPOINT, fetchMentor } from "api";
import Context from "context";
import withLocation from "wrap-with-location";

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
    textAlign: "left",
    flexGrow: 1,
  },
  login: {
    position: "absolute",
    right: theme.spacing(1),
  },
}));

function Login(props: { classes: any }): JSX.Element {
  const { classes } = props;
  const [cookies, setCookie, removeCookie] = useCookies(["accessToken"]);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const context = useContext(Context);

  function handleMenu(e: any): void {
    setAnchorEl(e.currentTarget);
  }

  function handleClose(): void {
    setAnchorEl(null);
  }

  function onLogout(): void {
    removeCookie("accessToken", { path: "/" });
    navigate("/");
  }

  if (!context.user) {
    return <div></div>;
  }

  return (
    <div className={classes.login}>
      <Button
        id="login-option"
        onClick={handleMenu}
        startIcon={<AccountCircle />}
        style={{ color: "white" }}
      >
        {context.user.name}
      </Button>
      <Menu
        id="login-menu"
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
        <MenuItem id="logout-button" onClick={onLogout}>
          Logout
        </MenuItem>
      </Menu>
    </div>
  );
}

function NavMenu(props: { classes: any }): JSX.Element {
  const { classes } = props;
  const [cookies, setCookie, removeCookie] = useCookies(["accessToken"]);

  async function openChat() {
    const mentor = await fetchMentor(cookies.accessToken);
    const path = `${location.origin}${CLIENT_ENDPOINT}?mentor=${mentor._id}`;
    window.location.href = path;
  }

  function onLogout(): void {
    removeCookie("accessToken", { path: "/" });
    navigate("/");
  }

  return (
    <List dense className={classes.menu}>
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
        to={"/setup"}
        selected={location.pathname === "/setup"}
      >
        <ListItemText primary="Setup" />
      </ListItem>

      <Divider style={{ marginTop: 15 }} />
      <ListSubheader className={classes.menuHeader}>Build Mentor</ListSubheader>

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
        to={"/"}
        selected={location.pathname === "/"}
      >
        <ListItemText primary="Review Answers" />
      </ListItem>

      <ListItem
        button
        component={Link}
        to={"/feedback"}
        selected={location.pathname.includes("/feedback")}
      >
        <ListItemText primary="Corrections and User Feedback" />
      </ListItem>

      <ListItem button onClick={openChat}>
        <ListItemText primary="Chat with Mentor" />
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
        <ListItemText primary="Subjects Areas" />
      </ListItem>
      <ListItem
        button
        component={Link}
        to={"/author/topics"}
        selected={location.pathname.includes("/author/topic")}
      >
        <ListItemText primary="Topics" />
      </ListItem>

      <ListItem
        button
        component={Link}
        to={"/author/questions"}
        selected={location.pathname.includes("/author/question")}
      >
        <ListItemText primary="Questions" />
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
  title: string;
  search: {
    back?: string;
  };
}): JSX.Element {
  const classes = useStyles();
  const { back } = props.search;
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);
  const context = useContext(Context);

  function toggleDrawer(tf: boolean): void {
    setIsDrawerOpen(tf);
  }

  return (
    <div id="nav-bar" className={classes.root}>
      <AppBar position="fixed">
        <Toolbar>
          {context.user ? (
            <IconButton
              id={back ? "back-button" : "menu-button"}
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
          ) : undefined}
          <Typography id="title" variant="h6" className={classes.title}>
            {props.title}
          </Typography>
          <Login classes={classes} />
        </Toolbar>
      </AppBar>
      <SwipeableDrawer
        id="drawer"
        anchor="left"
        open={isDrawerOpen}
        onClose={() => toggleDrawer(false)}
        onOpen={() => toggleDrawer(true)}
      >
        <Toolbar />
        <NavMenu classes={classes} />
      </SwipeableDrawer>
      <div className={classes.toolbar} /> {/* create space below app bar */}
    </div>
  );
}

export default withLocation(NavBar);
