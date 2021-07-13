/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Button, Typography } from "@material-ui/core";
import React from "react";
import { Mentor } from "types";
import { UseWithRecommendedAction } from "./use-with-recommended-action";

export default function RecommendedActionButton(props: {
  setThumbnail: (file: File) => void;
  mentor: Mentor;
}): JSX.Element {
  const [recommendedAction, skipRecommendation] = UseWithRecommendedAction(
    props.mentor
  );

  return (
    <div>
      {recommendedAction.input ? (
        <div>
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
          <label htmlFor="thumbnail-upload">
            <Button
              component="span"
              fullWidth
              data-cy="recommended-action-thumbnail"
            >
              {recommendedAction.text}
            </Button>
          </label>
          <Typography
            variant="body1"
            color="textSecondary"
            data-cy="recommended-action-reason"
          >
            {recommendedAction.reason}
          </Typography>
        </div>
      ) : (
        <div>
          <Button
            fullWidth
            data-cy="recommended-action-button"
            onClick={recommendedAction.action}
          >
            {recommendedAction.text}
          </Button>
          <Typography
            variant="body1"
            color="textSecondary"
            data-cy="recommended-action-reason"
          >
            {recommendedAction.reason}
          </Typography>
        </div>
      )}
      {recommendedAction.skippable && (
        <Button
          fullWidth
          data-cy="skip-action-button"
          onClick={skipRecommendation}
        >
          next recommendation
        </Button>
      )}
    </div>
  );
}
