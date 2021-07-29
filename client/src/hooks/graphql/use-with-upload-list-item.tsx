/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { AnswerAttentionNeeded } from "types";
import { UseWithRecordState } from "./use-with-record-state";
import { UploadStatus, UploadTask } from "./use-with-upload-status";

export function useWithUploadListItem(
  recordState: UseWithRecordState,
  upload: UploadTask
): UseWithUploadListItem {
  const jobStatus = upload.uploadStatus;
  const jobDone = jobStatus == UploadStatus.DONE;
  const jobFailed =
    jobStatus === UploadStatus.UPLOAD_FAILED ||
    jobStatus === UploadStatus.TRANSCRIBE_FAILED;
  const cancelling = upload.isCancelling || false;
  const answer = recordState.answers.find(
    (a) => a.answer.question._id === upload.question._id
  );
  const needsAttention = answer?.attentionNeeded !== AnswerAttentionNeeded.NONE;
  function onClose() {
    if (jobDone) {
      recordState.removeCompletedTask(upload);
    } else {
      recordState.cancelUpload(upload);
    }
  }

  return {
    upload,
    jobStatus,
    jobDone,
    jobFailed,
    cancelling,
    needsAttention,
    jobTitle: upload.question.question,
    ellipsesCount: recordState.pollStatusCount % 4,
    onClose,
  };
}

export interface UseWithUploadListItem {
  upload: UploadTask;
  jobStatus: UploadStatus;
  jobDone: boolean;
  jobFailed: boolean;
  cancelling: boolean;
  needsAttention: boolean;
  jobTitle: string;
  ellipsesCount: number;
  onClose: () => void;
}
