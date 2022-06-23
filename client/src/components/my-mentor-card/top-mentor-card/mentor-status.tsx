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
}): JSX.Element {
  const {
    openStatus,
    setOpenStatus,
  } = props;
  const { continueAction, updateThumbnail } = props;
  const { getData } = useActiveMentor();

  const mentorInfo = getData((ms) =>
    ms.data ? parseMentor(ms.data) : defaultMentorInfo
  );

  const leftColumnAlign = "left";

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

  const nextStatus = (
    <Grid xs={12} md={10}>
      <RecommendedActionButton
        setThumbnail={updateThumbnail}
        continueAction={continueAction}
      />
    </Grid>
  );
  return (
    <>
      <Grid container spacing={2} className="top-card-container">
        <Grid item xs={12} md={11} className="status-title-wrapper">
          <ColorTooltip
            interactive={true}
            open={openStatus}
            onClose={() => setOpenStatus(false)}
            disableHoverListener
            arrow
            //contains all text inside tooltip
            title={
              <React.Fragment>
                <IconButton
                  color="inherit"
                  size="small"
                  text-align="right"
                  align-content="right"
                  onClick={() => setOpenStatus(!openStatus)}
                >
                  <CloseIcon />
                </IconButton>
                <Typography>Current Status</Typography>
                <p>More description about what this should do.</p>
              </React.Fragment>
            }
            PopperProps={{
              style: { maxWidth: 250 },
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
            {nextStatus}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

export default MentorStatus;
