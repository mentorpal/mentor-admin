import { navigate } from "gatsby";
import React, { useContext } from "react";
import { useCookies } from "react-cookie";
import {
  AppBar,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Toolbar,
  Typography,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import Context from "context";

const useStyles = makeStyles((theme) => ({
  loadingDialog: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const PrivateRoute = ({ component: Component, location, ...rest }) => {
  const classes = useStyles();
  const [cookies] = useCookies(["accessToken"]);
  const context = useContext(Context);

  if (!cookies.accessToken) {
    navigate("/");
    return null;
  }

  if (!context.user) {
    return (
      <div>
        <AppBar position="fixed">
          <Toolbar>
            <Typography id="title" variant="h6">
              Mentor Studio
            </Typography>
          </Toolbar>
        </AppBar>
        <Dialog open>
          <DialogTitle>Signing In...</DialogTitle>
          <DialogContent className={classes.loadingDialog}>
            <CircularProgress />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return <Component {...rest} />;
};

export default PrivateRoute;
