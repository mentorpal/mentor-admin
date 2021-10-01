/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { getValueIfKeyExists } from "helpers";
import { UploadTask, UploadTaskStatuses } from "types";
import {
  areAllTasksDone,
  compareTaskStatusesToValue,
  isATaskFailed,
} from "./upload-status-helpers";
import { UseWithRecordState } from "./use-with-record-state";

export function useWithUploadListItem(
  recordState: UseWithRecordState,
  upload: UploadTask
): UseWithUploadListItem {
  const cancelling = upload.isCancelling || false;
  const answer = recordState.answers.find(
    (a) => a.answer.question === upload.question
  );

  function isJobQueued(): boolean {
    return compareTaskStatusesToValue(upload, UploadTaskStatuses.QUEUED, true);
  }

  function isJobDone(): boolean {
    return areAllTasksDone(upload);
  }

  function isJobFailed(): boolean {
    return isATaskFailed(upload);
  }
  console.log(isJobFailed(), upload);

  const needsAttention = Boolean(answer?.attentionNeeded);
  function onClose() {
    if (isJobDone()) {
      recordState.removeCompletedTask(upload);
    } else {
      recordState.cancelUpload(upload);
    }
  }

  return {
    upload,
    isJobDone,
    isJobFailed,
    isJobQueued,
    cancelling,
    needsAttention,
    jobTitle:
      getValueIfKeyExists(upload.question, recordState.mentorQuestions)
        ?.question?.question || "",
    pollStatusCount: recordState.pollStatusCount,
    onClose,
  };
}

export interface UseWithUploadListItem {
  upload: UploadTask;
  isJobDone: () => boolean;
  isJobFailed: () => boolean;
  isJobQueued: () => boolean;
  cancelling: boolean;
  needsAttention: boolean;
  jobTitle: string;
  pollStatusCount: number;
  onClose: () => void;
}
