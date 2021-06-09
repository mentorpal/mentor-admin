/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu
The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import React, { useState, useRef } from "react";
import { CurAnswerState } from "hooks/graphql/use-with-record-state";
import { useWithWindowSize } from "hooks/use-with-window-size";
import { NoEncryption } from "@material-ui/icons";
import { copyFile } from "node:fs";
import { JobState } from "types";

function UploadingListItem(props: { curAnswer: CurAnswerState }): JSX.Element {
  const { curAnswer } = props;

  return (
    <li data-cy="upload-card">
      <ul
        data-cy="card-title"
        style={{
          textAlign: "center",
          listStyleType: "none",
          display: "table",
          padding: 0,
          margin: 0,
          borderBottom: "1px solid grey",
          width: "100%",
        }}
      >
        <li data-cy="upload-question" style={{ display: "table-cell" }}>
          {curAnswer && curAnswer.answer?.question?.question.length > 35
            ? curAnswer.answer?.question?.question.substring(0, 35) + "..."
            : curAnswer.answer?.question?.question}
        </li>
        <li
          data-cy="upload-status"
          style={{
            display: "table-cell",
            color: curAnswer.isUploading
              ? "black"
              : curAnswer.error
              ? "red"
              : "green",
          }}
        >
          {curAnswer.isSaving
            ? "Saving"
            : curAnswer.isUploading
            ? "Uploading"
            : curAnswer.error
            ? curAnswer.error.message
            : curAnswer.uploadStatus?.state === JobState.SUCCESS
            ? "Complete"
            : ""}
        </li>
        <li
          data-cy="cancel-upload"
          style={{
            display: "table-cell",
            paddingRight: "8px",
            paddingLeft: "8px",
            visibility: curAnswer.isUploading ? "visible" : "hidden",
            cursor: "pointer",
          }}
        >
          x
        </li>
      </ul>
    </li>
  );
}

export default UploadingListItem;
