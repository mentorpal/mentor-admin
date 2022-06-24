import {
  Avatar,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from "@material-ui/core";
import React from "react";
import CreateIcon from "@material-ui/icons/Create";
import CloseIcon from "@material-ui/icons/Close";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import { withStyles, makeStyles, Theme } from "@material-ui/core/styles";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import { Mentor } from "types";
import EditMentorInfoModal from "./edit-mentor-info-modal";

const ColorTooltip = withStyles({
  tooltip: {
    backgroundColor: "secondary",
  },
})(Tooltip);

const useStyles = makeStyles((theme: Theme) => ({
  homeThumbnail: {
    position: "relative",
    width: "60%",
    height: 180,
  },
  siteThumbnail: {
    width: 180,
    height: 135,
  },
  title: {
    fontWeight: "bold",
  },
  inputField: {
    width: "100%",
    margin: 10,
  },
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    maxWidth: "50%",
  },
}));

function MentorThumbnail(props: {
  handleOpen: () => void;
  editedMentor: Mentor;
  handleClose: () => void;
  editMentor: (edits: Partial<Mentor>) => void;
  open: boolean;
  openProfile: boolean;
  setOpenProfile: (active: boolean) => void;
  setOpenStatus: (active: boolean) => void;
  thumbnail: string;
  updateThumbnail: (file: File) => void;
}): JSX.Element {
  const {
    handleOpen,
    editedMentor,
    handleClose,
    editMentor,
    open,
    openProfile,
    setOpenProfile,
    setOpenStatus,
    thumbnail,
    updateThumbnail,
  } = props;
  const { getData } = useActiveMentor();
  const mentorId = getData((ms) => ms.data?._id || "");
  const classes = useStyles();

  function closeProfileTooltip() {
    setOpenProfile(!openProfile);
    setOpenStatus(true);
  }

  if (!mentorId || !editedMentor) {
    return <div />;
  }

  return (
    <Grid item container alignItems="center" justify="center" xs={3} md={12}>
      {/* Mentor info / left column */}
      <Grid
        alignItems="center"
        data-cy="thumbnail-wrapper"
        thumbnail-src={thumbnail}
        item
        xs={10}
      >
        <Typography
          gutterBottom
          variant="h5"
          component="h2"
          className="mentorName"
        >
          <div style={{ display: "flex" }}>
            {/* this is the pencil editing icon */}
            <div style={{ margin: "10px 0 0 0" }}>
              <IconButton
                data-cy="edit-mentor-data"
                color="primary"
                aria-label="edit mentor"
                component="span"
                className="edit-pencil-icon"
                //onClick={handleOpen}
              >
                <CreateIcon />
              </IconButton>

              <ColorTooltip
                data-cy="profile-tooltip"
                interactive={true}
                open={openProfile}
                onClose={() => setOpenProfile(false)}
                disableHoverListener
                arrow
                placement="right"
                enterDelay={100000}
                title={
                  <React.Fragment>
                    <IconButton
                      data-cy="profile-tooltip-close-btn"
                      color="inherit"
                      size="small"
                      text-align="right"
                      align-content="right"
                      onClick={closeProfileTooltip}
                    >
                      <CloseIcon />
                    </IconButton>
                    <Typography
                      color="inherit"
                      align="center"
                      data-cy="profile-tooltip-title"
                    >
                      Profile
                    </Typography>
                    <p style={{ textAlign: "center" }}>
                      This is where you can set how you will be displayed (name,
                      job title, thumbnail).
                    </p>
                  </React.Fragment>
                }
                PopperProps={{
                  style: { maxWidth: 250, textAlign: "right" },
                }}
              >
                <b style={{ margin: "0 0 0 12px" }}>{editedMentor.name}</b>
              </ColorTooltip>
            </div>

            <EditMentorInfoModal
              handleClose={handleClose}
              editMentor={editMentor}
              editedMentor={editedMentor}
              open={open}
            />
          </div>
        </Typography>
        <Typography
          gutterBottom
          variant="h6"
          component="h4"
          className="mentorTitle"
          style={{ margin: "0 0 0 38px" }}
        >
          {editedMentor.title}
        </Typography>
      </Grid>
      {/* Thumbnail */}
      <Grid
        justify="center"
        alignItems="center"
        data-cy="thumbnail-wrapper"
        thumbnail-src={thumbnail}
        item
        xs={10}
        className="thumbnail-wrapper"
      >
        <div className="upload-thumbnail"></div>
        {thumbnail ? (
          <div style={{ display: "flex" }}>
            <Avatar
              data-cy="uploaded-thumbnail"
              variant="rounded"
              className={classes.homeThumbnail}
              src={thumbnail}
            />
            <label
              htmlFor="icon-button-file"
              style={{
                position: "absolute",
                zIndex: 2,
                bottom: -2,
                right: 73,
              }}
            >
              <IconButton color="primary" component="span">
                <CloudUploadIcon />
              </IconButton>
            </label>
            <input
              id="icon-button-file"
              data-cy="upload-file"
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => {
                e.target.files instanceof FileList
                  ? updateThumbnail(e.target.files[0])
                  : undefined;
              }}
            />
          </div>
        ) : (
          <div style={{ display: "flex" }}>
            <Avatar
              data-cy="placeholder-thumbnail"
              variant="square"
              className={classes.homeThumbnail}
            />
            <label
              htmlFor="icon-button-file"
              style={{
                position: "absolute",
                zIndex: 2,
                bottom: -2,
                right: 73,
              }}
            >
              <IconButton color="primary" component="span">
                <CloudUploadIcon />
              </IconButton>
            </label>
            <input
              id="icon-button-file"
              data-cy="upload-file"
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => {
                e.target.files instanceof FileList
                  ? updateThumbnail(e.target.files[0])
                  : undefined;
              }}
            />
          </div>
        )}
      </Grid>
    </Grid>
  );
}

export default MentorThumbnail;
