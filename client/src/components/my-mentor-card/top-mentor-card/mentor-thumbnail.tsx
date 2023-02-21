import { Avatar, Grid, IconButton, Tooltip, Typography } from "@mui/material";
import React, { useState } from "react";
import CreateIcon from "@mui/icons-material/Create";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { makeStyles, withStyles } from "tss-react/mui";

import { TooltipStep } from "components/home";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import { Mentor } from "types";
import EditMentorInfoModal from "./edit-mentor-info-modal";

const ColorTooltip = withStyles(Tooltip, {
  tooltip: {
    backgroundColor: "secondary",
  },
});

const useStyles = makeStyles({ name: { MentorThumbnail } })(() => ({
  homeThumbnail: {
    position: "relative",
    width: "60%",
    height: 180,
  },
}));

function MentorThumbnail(props: {
  handleOpen: () => void;
  editedMentor: Mentor;
  handleClose: () => void;
  editMentor: (edits: Partial<Mentor>) => void;
  open: boolean;
  thumbnail: string;
  updateThumbnail: (file: File) => void;
  incrementTooltip: () => void;
  idxTooltip: number;
  hasSeenTooltips: boolean;
}): JSX.Element {
  const {
    handleOpen,
    editedMentor,
    handleClose,
    editMentor,
    open,
    thumbnail,
    updateThumbnail,
    incrementTooltip,
    idxTooltip,
    hasSeenTooltips,
  } = props;
  const { getData } = useActiveMentor();
  const mentorId = getData((ms) => ms.data?._id || "");
  const isArchived = getData((ms) => ms.data?.isArchived);
  const { classes } = useStyles();
  const [profileTooltipOpen, setProfileTooltipOpen] = useState<boolean>(false);

  if (!mentorId || !editedMentor) {
    return <div />;
  }

  return (
    <Grid container alignItems="center" justifyContent="center">
      {/* Mentor info / left column */}
      <Grid data-cy="thumbnail-wrapper" thumbnail-src={thumbnail} item xs={10}>
        <Typography
          gutterBottom
          variant="h5"
          component="h2"
          className="mentorName"
        >
          <div style={{ display: "flex" }}>
            <div style={{ margin: "10px 0 0 0" }}>
              <IconButton
                data-cy="edit-mentor-data"
                color="primary"
                aria-label="edit mentor"
                component="span"
                className="edit-pencil-icon"
                onClick={handleOpen}
                size="large"
              >
                <CreateIcon />
              </IconButton>

              <ColorTooltip
                data-cy="profile-tooltip"
                open={
                  hasSeenTooltips
                    ? profileTooltipOpen
                    : idxTooltip == TooltipStep.PROFILE
                }
                onClose={incrementTooltip}
                disableHoverListener={!hasSeenTooltips}
                arrow
                placement="right"
                enterDelay={1500}
                title={
                  <React.Fragment>
                    <IconButton
                      data-cy="profile-tooltip-close-btn"
                      color="inherit"
                      size="small"
                      text-align="right"
                      align-content="right"
                      onClick={incrementTooltip}
                    >
                      <CloseIcon />
                    </IconButton>
                    <Typography
                      color="inherit"
                      align="center"
                      data-cy="profile-tooltip-title"
                    >
                      My Profile
                    </Typography>
                    <p style={{ textAlign: "center" }}>
                      Your profile shows how people will first see you on the
                      Home page, with your name, picture, and job description.
                      Try to pick something inviting!
                    </p>
                  </React.Fragment>
                }
                PopperProps={{
                  style: { maxWidth: 250, textAlign: "right" },
                }}
              >
                <b
                  style={{ margin: "0 0 0 12px" }}
                  onMouseEnter={() => {
                    hasSeenTooltips && setProfileTooltipOpen(true);
                  }}
                  onMouseLeave={() => {
                    hasSeenTooltips && setProfileTooltipOpen(false);
                  }}
                >
                  {editedMentor.name}
                </b>
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
        data-cy="thumbnail-wrapper"
        thumbnail-src={thumbnail}
        item
        xs={10}
        className="thumbnail-wrapper"
      >
        <div style={{ display: "flex" }}>
          <Avatar
            data-cy={thumbnail ? "uploaded-thumbnail" : "placeholder-thumbnail"}
            variant={thumbnail ? "rounded" : "square"}
            className={classes.homeThumbnail}
            src={thumbnail || ""}
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
            <IconButton color="primary" component="span" size="large">
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
              e.target.files instanceof FileList && e.target.files[0]
                ? updateThumbnail(e.target.files[0])
                : undefined;
            }}
          />
        </div>
      </Grid>
      <Grid
        container
        alignItems="flex-start"
        justifyContent="flex-start"
        style={{ marginTop: 5 }}
      >
        <Grid item>
          <label>
            Archived
            <input
              type="checkbox"
              data-cy="archive-mentor"
              defaultChecked={isArchived}
              onChange={(e) => editMentor({ isArchived: e.target.checked })}
            />
          </label>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default MentorThumbnail;
