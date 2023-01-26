/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { IconButton, Button, Tooltip, Typography } from "@mui/material";
import withStyles from "@mui/styles/withStyles";
import { HelpOutline } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import "styles/layout.css";
import parseMentor, { defaultMentorInfo } from "./mentor-info";
import CloseIcon from "@mui/icons-material/Close";
import { TooltipStep } from "components/home";
import {
  RecommendationName,
  useWithMentorRecommender,
} from "hooks/mentor-recommender/use-with-mentor-recommender";
import { Recommendation } from "hooks/recommender/recommender";
export default function RecommendedActionButton(props: {
  setThumbnail: (file: File) => void;
  trainMentor: () => void;
  incrementTooltip: () => void;
  idxTooltip: number;
  hasSeenTooltips: boolean;
}): JSX.Element {
  const { incrementTooltip, idxTooltip, hasSeenTooltips } = props;
  const [currentRecommendations, setCurrentRecommendations] = useState<
    Recommendation<RecommendationName>[]
  >([]);
  const [curRecIndex, setCurRecIndex] = useState<number>(0);
  const [curRec, setCurRec] = useState<Recommendation<RecommendationName>>();

  const { recommender } = useWithMentorRecommender(props.trainMentor);
  const { getData } = useActiveMentor();
  const mentorInfo = getData((ms) =>
    ms.data ? parseMentor(ms.data) : defaultMentorInfo
  );

  useEffect(() => {
    if (!recommender) {
      return;
    }
    setCurrentRecommendations(recommender.getRecommendations());
    setCurRecIndex(0);
  }, [recommender]);

  useEffect(() => {
    if (!currentRecommendations[curRecIndex]) {
      setCurRecIndex(0);
      return;
    }
    setCurRec(currentRecommendations[curRecIndex]);
  }, [curRecIndex, currentRecommendations]);

  const ColorTooltip = withStyles({
    tooltip: {
      backgroundColor: "secondary",
    },
  })(Tooltip);

  if (!curRec) {
    return <></>;
  }

  return (
    <div data-cy="rec-action-btn">
      <div className="next-status-text-wrapper">
        <Typography
          variant="h6"
          color="textPrimary"
          display="inline"
          className="stage-text"
          align="right"
          style={{ textAlign: "right", color: "#6f6f6f" }}
        >
          Next Status:{" "}
        </Typography>
        <Typography
          variant="h6"
          color="textPrimary"
          display="inline"
          align="right"
        >
          <b>{mentorInfo.currentStage.next.name}</b>
          {"   "}

          <Tooltip
            title={
              <React.Fragment>
                <Typography color="inherit">
                  {mentorInfo.currentStage.next.name}
                </Typography>
                {mentorInfo.currentStage.next.description}
              </React.Fragment>
            }
            data-cy="next-stage-info"
          >
            <HelpOutline fontSize="small" />
          </Tooltip>
        </Typography>
      </div>
      <Typography
        variant="body1"
        color="textSecondary"
        data-cy="recommended-action-reason"
      >
        <span className="helpbox">
          <span>{curRec.reason}</span>
        </span>
      </Typography>
      <div
        className="recommended-action-btns"
        data-cy="recommended-btn-wrapper"
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "240px",
            height: "120px",
          }}
        >
          <Button
            onClick={() => setCurRecIndex((prevValue) => (prevValue += 1))}
            className="skip-btn"
            data-cy="skip-action-button"
            disabled={currentRecommendations.length <= 1}
            style={{
              width: "40px",
              height: "40px",
              textTransform: "capitalize",
            }}
          >
            skip{" "}
          </Button>
          {curRec.name === RecommendationName.ADD_THUMBNAIL ? (
            <>
              <input
                accept="image/*"
                style={{ display: "none" }}
                id="thumbnail-upload"
                data-cy="recommended-action-upload"
                type="file"
                onChange={(e) => {
                  e.target.files instanceof FileList
                    ? props.setThumbnail(e.target.files[0])
                    : undefined;
                }}
              />
              <label htmlFor="thumbnail-upload" style={{ width: "50%" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <Typography
                    variant="h6"
                    color="textPrimary"
                    data-cy="recommended-action"
                    style={{ marginBottom: 5 }}
                  >
                    <p className="recommended-action-text">
                      <b>{curRec.message}</b>
                    </p>
                  </Typography>

                  <ColorTooltip
                    open={
                      hasSeenTooltips
                        ? undefined
                        : idxTooltip == TooltipStep.RECOMMENDER
                    }
                    onClose={hasSeenTooltips ? undefined : incrementTooltip}
                    disableHoverListener={!hasSeenTooltips}
                    enterDelay={hasSeenTooltips ? 1500000 : 100}
                    arrow
                    title={
                      <React.Fragment>
                        <IconButton
                          color="inherit"
                          size="small"
                          text-align="right"
                          align-content="right"
                          onClick={incrementTooltip}
                        >
                          <CloseIcon />
                        </IconButton>
                        <Typography color="inherit" align="center">
                          Recommender
                        </Typography>
                        <p style={{ textAlign: "center" }}>
                          To help you improve your mentor, a good next-step is
                          always recommended. At first this will be mostly
                          recording answers, but later you will Preview your
                          mentor and address User Feedback. Hit &quotSkip&quot
                          to see the next-best recommendation.
                        </p>
                      </React.Fragment>
                    }
                    PopperProps={{
                      style: { maxWidth: 250, textAlign: "right" },
                    }}
                  >
                    <Button
                      size="medium"
                      fullWidth
                      color="primary"
                      variant="contained"
                      component="span"
                      data-cy="recommended-action-thumbnail"
                      className={
                        curRec.name === RecommendationName.ADD_THUMBNAIL
                          ? "go-btn-label"
                          : "go-btn"
                      }
                    >
                      Go
                    </Button>
                  </ColorTooltip>
                </div>
              </label>
            </>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography
                variant="h6"
                color="textPrimary"
                data-cy="recommended-action"
                style={{ marginBottom: 5 }}
              >
                <p className="recommended-action-text">
                  <b>{curRec.message}</b>
                </p>
              </Typography>

              <ColorTooltip
                data-cy="recommender-tooltip"
                open={
                  hasSeenTooltips
                    ? undefined
                    : idxTooltip == TooltipStep.RECOMMENDER
                }
                onClose={hasSeenTooltips ? undefined : incrementTooltip}
                disableHoverListener={!hasSeenTooltips}
                arrow
                title={
                  <React.Fragment>
                    <IconButton
                      data-cy="recommender-tooltip-close-btn"
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
                      data-cy="recommender-tooltip-title"
                    >
                      Recommender
                    </Typography>
                    <p style={{ textAlign: "center" }}>
                      To help you improve your mentor, a good next-step is
                      always recommended. At first this will be mostly recording
                      answers, but later you will Preview your mentor and
                      address User Feedback. Hit &quotSkip&quot to see the
                      next-best recommendation.
                    </p>
                  </React.Fragment>
                }
                PopperProps={{
                  style: { maxWidth: 250, textAlign: "right" },
                }}
              >
                <Button
                  size="medium"
                  fullWidth
                  color="primary"
                  variant="contained"
                  data-cy="recommended-action-button"
                  onClick={curRec.action}
                  className="go-btn"
                >
                  Go
                </Button>
              </ColorTooltip>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
