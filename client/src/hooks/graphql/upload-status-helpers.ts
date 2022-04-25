/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Media, TaskInfo, UploadTask, UploadTaskStatuses } from "types";

export function areAllTasksDoneOrOneFailed(task: UploadTask): boolean {
  return isATaskCancelled(task) || isATaskFailed(task) || areAllTasksDone(task);
}

export function isATaskFailed(task: UploadTask): boolean {
  return compareTaskStatusesToValue(task, UploadTaskStatuses.FAILED, false);
}

export function whichTaskFailed(upload: UploadTask): string {
  return upload.transcodeMobileTask?.status === UploadTaskStatuses.FAILED
    ? upload.transcodeMobileTask.task_name
    : upload.transcodeWebTask?.status === UploadTaskStatuses.FAILED
    ? upload.transcodeWebTask.task_name
    : upload.trimUploadTask?.status === UploadTaskStatuses.FAILED
    ? upload.trimUploadTask.task_name
    : upload.transcribeTask?.status === UploadTaskStatuses.FAILED
    ? upload.transcribeTask.task_name
    : "";
}

export function isATaskCancelled(task: UploadTask): boolean {
  return compareTaskStatusesToValue(task, UploadTaskStatuses.CANCELLED, false);
}

export function isATaskCancelling(task: UploadTask): boolean {
  return compareTaskStatusesToValue(task, UploadTaskStatuses.CANCELLING, false);
}

export function isATaskPending(task: UploadTask): boolean {
  return compareTaskStatusesToValue(task, UploadTaskStatuses.PENDING, false);
}

export function areAllTasksDone(task: UploadTask): boolean {
  return compareTaskStatusesToValue(task, UploadTaskStatuses.DONE, true);
}

export function compareTaskStatusesToValue(
  task: UploadTask,
  value: UploadTaskStatuses,
  allEqual: boolean
): boolean {
  const taskList = getListOfTasksFromUploadTask(task);
  if (!taskList.length) return false;
  if (allEqual) {
    return taskList.every((task) => task.status === value);
  } else {
    return taskList.some((task) => task.status === value);
  }
}

export function getListOfTasksFromUploadTask(task: UploadTask): TaskInfo[] {
  const taskList: TaskInfo[] = [];
  if (task.transcodeMobileTask) taskList.push(task.transcodeMobileTask);
  if (task.transcodeWebTask) taskList.push(task.transcodeWebTask);
  if (task.transcribeTask) taskList.push(task.transcribeTask);
  if (task.trimUploadTask) taskList.push(task.trimUploadTask);
  return taskList;
}

export interface MediaExtract {
  webMedia?: Media;
  mobileMedia?: Media;
  vttMedia?: Media;
}

export function getListOfMediaFromUploadTask(task: UploadTask): MediaExtract {
  return {
    webMedia: task.webMedia,
    mobileMedia: task.mobileMedia,
    vttMedia: task.vttMedia,
  };
}
