/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Button, Link, Tooltip, Typography } from "@material-ui/core";
import { HelpOutline } from "@material-ui/icons";
import React from "react";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import "styles/layout.css";
import parseMentor, { defaultMentorInfo } from "./mentor-info";
import { UseWithRecommendedAction } from "../../hooks/graphql/use-with-recommended-action";
export default function RecommendedActionButton(props: {
  setThumbnail: (file: File) => void;
  continueAction: () => void;
}): JSX.Element {
  const [recommendedAction, skipRecommendation, recListLength] = UseWithRecommendedAction(
    props.continueAction
  );
  const { getData } = useActiveMentor();
  const mentorInfo = getData((ms) =>
    ms.data ? parseMentor(ms.data) : defaultMentorInfo
  );

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
      <div className="recommended-action-btns">
        {recommendedAction.input ? (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Link
              href="#"
              onClick={skipRecommendation}
              className="skip-btn"
              data-cy="skip-action-button"
              style={{cursor: recListLength == 0 ? "default" : "pointer"}}
            >
              skip
            </Link>

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
              </div>
            </label>
          </div>
        ) : (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Link
              href="#"
              onClick={skipRecommendation}
              className="skip-btn"
              data-cy="skip-action-button"
            >
              skip
            </Link>
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
