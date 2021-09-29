/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { UploadTask, UploadTaskFlagStatuses } from "types";

export function isTaskDoneOrFailed(task: UploadTask): boolean {
  return isATaskCancelled(task) || isATaskFailed(task) || areAllTasksDone(task) || isATaskNone(task) //TODO: Delete isATaskNone, this is just for testing
}

export function isATaskFailed(task: UploadTask): boolean {
  return compareFlagStatusesToValue(task, UploadTaskFlagStatuses.FAILED, false);
}

export function whichTaskFailed(task: UploadTask): string {
  return task.transcribingFlag === UploadTaskFlagStatuses.FAILED
    ? "transcribing"
    : task.finalizationFlag == UploadTaskFlagStatuses.FAILED
    ? "finalization"
    : task.transcodingFlag === UploadTaskFlagStatuses.FAILED
    ? "transcoding"
    : task.uploadFlag === UploadTaskFlagStatuses.FAILED
    ? "upload"
    : "None";
}

export function isATaskCancelled(task: UploadTask): boolean {
  return compareFlagStatusesToValue(
    task,
    UploadTaskFlagStatuses.CANCELLED,
    false
  );
}

//TODO: Delete this
export function isATaskNone(task: UploadTask): boolean {
  return compareFlagStatusesToValue(
    task,
    UploadTaskFlagStatuses.NONE,
    false
  );
}

export function isATaskCancelling(task: UploadTask): boolean {
  return compareFlagStatusesToValue(
    task,
    UploadTaskFlagStatuses.CANCELLING,
    false
  );
}

export function isATaskPending(task: UploadTask): boolean {
  return compareFlagStatusesToValue(
    task,
    UploadTaskFlagStatuses.PENDING,
    false
  );
}

export function areAllTasksDone(task: UploadTask): boolean {
  return compareFlagStatusesToValue(task, UploadTaskFlagStatuses.DONE, true);
}

export function compareFlagStatusesToValue(
  task: UploadTask,
  value: UploadTaskFlagStatuses,
  allEqual: boolean
): boolean {
  if (allEqual) {
    return (
      task.uploadFlag === value &&
      task.finalizationFlag === value &&
      task.transcodingFlag === value &&
      task.transcribingFlag === value
    );
  } else {
    return (
      task.uploadFlag === value ||
      task.finalizationFlag === value ||
      task.transcodingFlag === value ||
      task.transcribingFlag === value
    );
  }
}
