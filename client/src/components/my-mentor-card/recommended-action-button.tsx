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
import { UseWithRecommendedAction } from "./use-with-recommended-action";
export default function RecommendedActionButton(props: {
  setThumbnail: (file: File) => void;
  continueAction: () => void;
}): JSX.Element {
  const [recommendedAction, skipRecommendation] = UseWithRecommendedAction(
    props.continueAction
  );

  const mentorInfo = useActiveMentor((ms) =>
    ms.data ? parseMentor(ms.data) : defaultMentorInfo
  );

  return (
    <div>
      <Typography
        variant="body1"
        color="textSecondary"
        display="inline"
        style={{ marginBottom: 10 }}
      >
        Next Goal:{" "}
      </Typography>
      <Typography variant="body1" color="textSecondary" display="inline">
        {mentorInfo.currentStage.next.name}
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
      <Typography
        variant="h6"
        color="textPrimary"
        data-cy="recommended-action"
        style={{ marginBottom: 15 }}
      >
        <b>{recommendedAction.text}</b>
      </Typography>
      {recommendedAction.input ? (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Link href="#" onClick={skipRecommendation} className="skip-btn">
            <b>Skip</b>
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
            <Button
              size="medium"
              fullWidth
              color="primary"
              variant="contained"
              component="span"
              data-cy="recommended-action-thumbnail"
              startIcon={recommendedAction.icon}
              className={recommendedAction.input ? "go-btn-label" : "go-btn"}
            >
              Go
            </Button>
          </label>
        </div>
      ) : (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Link href="#" onClick={skipRecommendation} className="skip-btn">
            <b>Skip</b>
          </Link>
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
      )}
      <Typography
        variant="caption"
        color="textSecondary"
        data-cy="recommended-action-reason"
      >
        {recommendedAction.reason}
      </Typography>
    </div>
  );
}
