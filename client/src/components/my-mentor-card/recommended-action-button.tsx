/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  IconButton,
  Button,
  Tooltip,
  Typography,
  withStyles,
} from "@material-ui/core";
import { HelpOutline } from "@material-ui/icons";
import React from "react";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import "styles/layout.css";
import parseMentor, { defaultMentorInfo } from "./mentor-info";
import { UseWithRecommendedAction } from "../../hooks/graphql/use-with-recommended-action";
import CloseIcon from "@material-ui/icons/Close";
export default function RecommendedActionButton(props: {
  setThumbnail: (file: File) => void;
  continueAction: () => void;
  openRecommender: boolean;
  setOpenRecommender: (active: boolean) => void;
  setOpenSave: (active: boolean) => void;
}): JSX.Element {
  const { openRecommender, setOpenRecommender, setOpenSave } = props;
  const [
    recommendedAction,
    skipRecommendation,
    recListLength,
    questionsLoading,
  ] = UseWithRecommendedAction(props.continueAction);
  const { getData } = useActiveMentor();
  const mentorInfo = getData((ms) =>
    ms.data ? parseMentor(ms.data) : defaultMentorInfo
  );

  const ColorTooltip = withStyles({
    tooltip: {
      backgroundColor: "secondary",
    },
  })(Tooltip);

  function closeRecommenderTooltip() {
    setOpenRecommender(!openRecommender);
    setOpenSave(true);
  }

  if (questionsLoading) {
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
        <div className="helpbox">
          <p>{recommendedAction.reason}</p>
        </div>
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
            onClick={skipRecommendation}
            className="skip-btn"
            data-cy="skip-action-button"
            disabled={recListLength <= 1}
            style={{
              width: "40px",
              height: "40px",
              textTransform: "capitalize",
            }}
          >
            skip{" "}
          </Button>
          {recommendedAction.input ? (
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
                      <b>{recommendedAction.text}</b>
                    </p>
                  </Typography>

                  <ColorTooltip
                    interactive={true}
                    open={openRecommender}
                    onClose={closeRecommenderTooltip}
                    disableHoverListener
                    arrow
                    title={
                      <React.Fragment>
                        <IconButton
                          color="inherit"
                          size="small"
                          text-align="right"
                          align-content="right"
                          onClick={closeRecommenderTooltip}
                        >
                          <CloseIcon />
                        </IconButton>
                        <Typography color="inherit" align="center">
                          Recommender
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
                    <Button
                      size="medium"
                      fullWidth
                      color="primary"
                      variant="contained"
                      component="span"
                      data-cy="recommended-action-thumbnail"
                      startIcon={recommendedAction.icon}
                      className={
                        recommendedAction.input ? "go-btn-label" : "go-btn"
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
                  <b>{recommendedAction.text}</b>
                </p>
              </Typography>

              <ColorTooltip
                data-cy="recommender-tooltip"
                interactive={true}
                open={openRecommender}
                onClose={closeRecommenderTooltip}
                disableHoverListener
                arrow
                title={
                  <React.Fragment>
                    <IconButton
                      data-cy="recommender-tooltip-close-btn"
                      color="inherit"
                      size="small"
                      text-align="right"
                      align-content="right"
                      onClick={closeRecommenderTooltip}
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
                      More description about what this should do.
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
                  onClick={recommendedAction.action}
                  startIcon={recommendedAction.icon}
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
