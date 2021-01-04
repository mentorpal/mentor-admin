/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { navigate } from "gatsby";
import React, { useContext } from "react";
import { useCookies } from "react-cookie";
import {
  AppBar,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import AccountCircle from "@material-ui/icons/AccountCircle";
import CloseIcon from "@material-ui/icons/Close";
import Context from "context";

const useStyles = makeStyles((theme) => ({
  toolbar: theme.mixins.toolbar,
  root: {
    flexGrow: 1,
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

  function onHome(): void {
    navigate("/");
  }

  if (!cookies.accessToken || !context.user) {
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
        <MenuItem id="home-button" onClick={onHome}>
          Home
        </MenuItem>
        <MenuItem id="logout-button" onClick={onLogout}>
          Logout
        </MenuItem>
      </Menu>
    </div>
  );
}

export function NavBar(props: {
  title: string;
  back?: boolean;
  onBack?: () => void;
}): JSX.Element {
  const { title, back, onBack } = props;
  const classes = useStyles();

  return (
    <div id="nav-bar" className={classes.root}>
      <AppBar position="fixed">
        <Toolbar>
          {
            back ?
              <IconButton
                id="back-button"
                edge="start"
                color="inherit"
                aria-label="menu"
                className={classes.menuButton}
                onClick={() => { onBack ? onBack() : navigate("/") }}
              >
                <CloseIcon />
              </IconButton>
              : undefined
          }
          <Typography id="title" variant="h6" className={classes.title}>
            {title}
          </Typography>
          <Login classes={classes} />
        </Toolbar>
      </AppBar>
      <div className={classes.toolbar} /> {/* create space below app bar */}
    </div>
  );
}

export default NavBar;
