import React, { useState } from "react";
import { Grid, IconButton, Tooltip, Typography } from "@mui/material";
import withStyles from "@mui/styles/withStyles";
import StageProgress from "../stage-progress";
import RecommendedActionButton from "../recommended-action-button";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import parseMentor, { defaultMentorInfo } from "../mentor-info";
import CloseIcon from "@mui/icons-material/Close";
import { TooltipStep } from "components/home";

const ColorTooltip = withStyles({
  tooltip: {
    backgroundColor: "secondary",
  },
})(Tooltip);

function MentorStatus(props: {
  trainMentor: () => void;
  updateThumbnail: (file: File) => void;
  incrementTooltip: () => void;
  localHasSeenTooltips: boolean;
  hasSeenTooltips: boolean;
  idxTooltip: number;
}): JSX.Element {
  const { incrementTooltip, idxTooltip, hasSeenTooltips } = props;
  const { trainMentor, updateThumbnail } = props;
  const { getData } = useActiveMentor();
  const [statusTooltipOpen, setStatusTooltipOpen] = useState<boolean>(false);

  const mentorInfo = getData((ms) =>
    ms.data ? parseMentor(ms.data) : defaultMentorInfo
  );

  const leftColumnAlign = "left";

  const currentStatus = (
    <Grid item xs={12} md={10} className="status-item-wrapper">
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
        <span className="helpbox">
          <span>{mentorInfo.currentStage.description}</span>
        </span>
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
    <Grid item xs={12} md={10}>
      <RecommendedActionButton
        setThumbnail={updateThumbnail}
        trainMentor={trainMentor}
        incrementTooltip={incrementTooltip}
        idxTooltip={idxTooltip}
        hasSeenTooltips={hasSeenTooltips}
      />
    </Grid>
  );

  return (
    <>
      <Grid container spacing={2} className="top-card-container">
        <Grid item xs={12} md={11} className="status-title-wrapper">
          <ColorTooltip
            data-cy="status-tooltip"
            open={
              hasSeenTooltips
                ? statusTooltipOpen
                : idxTooltip == TooltipStep.STATUS
            }
            onClose={incrementTooltip}
            disableHoverListener={!hasSeenTooltips}
            enterDelay={1500}
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
                  onClick={incrementTooltip}
                >
                  <CloseIcon />
                </IconButton>
                <Typography
                  color="inherit"
                  align="center"
                  data-cy="status-tooltip-title"
                >
                  Mentor Status
                </Typography>
                <p style={{ textAlign: "center" }}>
                  The Mentor Status area shows how many questions you have
                  recorded, and how ready your mentor is to use. If you are
                  building a mentor just to click on a few questions, that is
                  different than when people expect to ask any question on a
                  subject.
                </p>
              </React.Fragment>
            }
            PopperProps={{
              style: { maxWidth: 250, textAlign: "right" },
            }}
          >
            <Typography variant="h5">
              <b
                onMouseEnter={() => {
                  hasSeenTooltips && setStatusTooltipOpen(true);
                }}
                onMouseLeave={() => {
                  hasSeenTooltips && setStatusTooltipOpen(false);
                }}
              >
                Improve your Mentor
              </b>
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
          >
            {nextStatus}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}

export default MentorStatus;
