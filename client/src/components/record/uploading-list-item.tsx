/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState } from "react";
import { UploadStatus } from "hooks/graphql/use-with-upload-status";

function UploadingListItem(props: {
  jobTitle: string;
  jobStatus: string;
  setAnswerIDx: (id: number) => void;
  answerIDx: number;
  cancelledAnswer: boolean;
}): JSX.Element {
  const {
    jobTitle,
    setAnswerIDx,
    answerIDx,
    jobStatus,
    cancelledAnswer,
  } = props;
  const [cancelling, setCancelling] = useState(false);
  return (
    <li>
      <ul
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
        <li
          data-cy="card-answer-title"
          style={{ display: "table-cell" }}
          onClick={() => {
            setAnswerIDx(answerIDx);
          }}
        >
          <small>
            {jobTitle && jobTitle.length > 35
              ? jobTitle.substring(0, 35) + "..."
              : jobTitle}
          </small>
        </li>
        <li
          data-cy="upload-status"
          style={{
            display: "table-cell",
            color:
              jobStatus === UploadStatus.TRANSCRIBE_FAILED ||
              jobStatus === UploadStatus.UPLOAD_FAILED
                ? "red"
                : jobStatus !== UploadStatus.DONE
                ? "black"
                : "green",
          }}
        >
          <small>
            {cancelling || cancelledAnswer
              ? "Cancelling..."
              : jobStatus === UploadStatus.TRANSCRIBE_FAILED
              ? "Transcribe Failed"
              : jobStatus === UploadStatus.UPLOAD_FAILED
              ? "Upload Failed"
              : jobStatus === UploadStatus.DONE
              ? "Complete"
              : "Uploading"}
          </small>
        </li>
        <li
          data-cy="cancel-upload"
          onClick={() => {
            setCancelling(true);
          }}
          style={{
            display: "table-cell",
            paddingRight: "8px",
            paddingLeft: "8px",
            visibility: jobStatus !== UploadStatus.DONE ? "visible" : "hidden",
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
