import React from "react";
import {
  Button,
  Grid,
  IconButton,
  Tooltip,
  Typography,
  withStyles,
} from "@material-ui/core";
import StageProgress from "../stage-progress";
import RecommendedActionButton from "../recommended-action-button";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import parseMentor, { defaultMentorInfo } from "../mentor-info";
import CloseIcon from "@material-ui/icons/Close";

const ColorTooltip = withStyles({
  tooltip: {
    backgroundColor: "#A7C7E7",
  },
})(Tooltip);

function MentorStatus(props: {
  continueAction: () => void;
  updateThumbnail: (file: File) => void;
  openStatus: boolean;
  setOpenStatus: (active: boolean) => void;
  openCategories: boolean;
  setOpenCategories: (active: boolean) => void;
  openRecommender: boolean;
  setOpenRecommender: (active: boolean) => void;
  openSave: boolean;
  setOpenSave: (active: boolean) => void;
}): JSX.Element {
  const {
    openStatus,
    setOpenStatus,
    setOpenCategories,
    openRecommender,
    setOpenRecommender,
    openSave,
    setOpenSave,
  } = props;
  const { continueAction, updateThumbnail } = props;
  const { getData } = useActiveMentor();

  const mentorInfo = getData((ms) =>
    ms.data ? parseMentor(ms.data) : defaultMentorInfo
  );

  const leftColumnAlign = "left";

  function closeStatusTooltip() {
    setOpenStatus(!openStatus);
    setOpenCategories(true);
  }

  const currentStatus = (
    <Grid
      item
      alignItems="center"
      alignContent="flex-start"
      xs={12}
      md={10}
      className="status-item-wrapper"
    >
      <Typography
        variant="h6"
        color="textPrimary"
        data-cy="mentor-card-scope"
        align={leftColumnAlign}
      >
        <div className="stage-text">
          Current Status:{" "}
          <b style={{ color: "black" }}>{mentorInfo.currentStage.name}</b>
        </div>
      </Typography>
      <Typography
        variant="body1"
        color="textSecondary"
        data-cy="mentor-card-scope-description"
        className="stage-text"
        align={leftColumnAlign}
      >
        <div className="helpbox">
          <p>{mentorInfo.currentStage.description}</p>
        </div>
      </Typography>

      {mentorInfo.currentStage.floor != 1000 && (
        <StageProgress
          value={mentorInfo.value}
          max={mentorInfo.currentStage.max || 0}
          percent={mentorInfo.currentStage.percent || 0}
        />
      )}
    </Grid>
  );

  return (
    <>
      <Grid container spacing={2} className="top-card-container">
        <Grid item xs={12} md={11} className="status-title-wrapper">
          <ColorTooltip
            data-cy="status-tooltip"
            interactive={true}
            open={openStatus}
            onClose={() => setOpenStatus(false)}
            disableHoverListener
            arrow
            //contains all text inside tooltip
            title={
              <React.Fragment>
                <IconButton
                  data-cy="status-tooltip-close-btn"
                  color="inherit"
                  size="small"
                  text-align="right"
                  align-content="right"
                  onClick={closeStatusTooltip}
                >
                  <CloseIcon />
                </IconButton>
                <Typography
                  color="inherit"
                  align="center"
                  data-cy="status-tooltip-title"
                >
                  Current Status
                </Typography>
                <p style={{ textAlign: "center" }}>
                  More description about what this should do.
                </p>
              </React.Fragment>
            }
            PopperProps={{
              style: { maxWidth: 250, textAlign: "right" },
            }}
          >
            <Typography variant="h5">
              <b>Improve your Mentor</b>
            </Typography>
          </ColorTooltip>
        </Grid>

        <Grid container spacing={2} className="status-container">
          <Grid item xs={12} sm={6} md={6} className="current-status-wrapper">
            {currentStatus}
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            md={6}
            className="next-status-wrapper status-item-wrapper"
            next-states
          >
            <Grid xs={12} md={10}>
              <RecommendedActionButton
                setThumbnail={updateThumbnail}
                continueAction={continueAction}
                openRecommender={props.openRecommender}
                setOpenRecommender={props.setOpenRecommender}
                setOpenSave={props.setOpenSave}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

export default MentorStatus;
