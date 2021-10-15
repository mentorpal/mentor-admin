/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect, useState } from "react";
import axios from "axios";
import {
  cancelUploadVideo,
  deleteUploadTask,
  fetchUploadTasks,
  uploadVideo,
} from "api";
import { UploadTask, UploadTaskStatuses } from "types";
import { copyAndSet } from "helpers";
import useInterval from "hooks/task/use-interval";
import {
  areAllTasksDone,
  compareTaskStatusesToValue,
  isATaskCancelled,
  isATaskCancelling,
  isATaskFailed,
  areAllTasksDoneOrOneFailed,
  whichTaskFailed,
  fetchIncompleteTaskIds,
} from "./upload-status-helpers";

export function useWithUploadStatus(
  accessToken: string,
  onUploadedCallback?: (task: UploadTask) => void,
  pollingInterval = 1000
): UseWithUploadStatus {
  const [uploads, setUploads] = useState<UploadTask[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [pollStatusCount, setPollStatusCount] = useState<number>(0);
  const CancelToken = axios.CancelToken;

  useEffect(() => {
    let mounted = true;
    fetchUploadTasks(accessToken)
      .then((data) => {
        if (!mounted) {
          return;
        }
        setUploads(data);
      })
      .catch((err) => {
        console.error(err);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    uploads.forEach((u) => {
      if (areAllTasksDone(u) || isATaskFailed(u) || isATaskCancelled(u)) {
        deleteUploadTask(u.question, accessToken).catch((error) => {
          console.error(error);
        });
      }
    });
    setIsUploading(uploads.some((u) => !areAllTasksDoneOrOneFailed(u)));
    setIsPolling(uploads.some((u) => isTaskPolling(u)));
  }, [uploads]);

  useInterval(
    (isCancelled) => {
      fetchUploadTasks(accessToken)
        .then((data) => {
          if (isCancelled()) {
            return;
          }
          setPollStatusCount(pollStatusCount + 1);
          const updatedUploadsList: UploadTask[] = JSON.parse(
            JSON.stringify(uploads)
          );
          let changes = false;
          data.forEach((u) => {
            const findUploadIdx = updatedUploadsList.findIndex(
              (up) => up.question === u.question
            );
            const newUploadTask = {
              ...u,
              isCancelling:
                u?.isCancelling || isATaskCancelling(u) || isATaskCancelled(u),
              errorMessage: isATaskFailed(u)
                ? `Failed to process file: ${whichTaskFailed(u)} task failed`
                : "",
            };
            if (findUploadIdx < 0) {
              changes = true;
              updatedUploadsList.push(newUploadTask);
              if (areAllTasksDone(newUploadTask) && onUploadedCallback) {
                onUploadedCallback(newUploadTask);
              }
            } else if (
              fetchedTaskHasUpdates(
                updatedUploadsList[findUploadIdx],
                newUploadTask
              )
            ) {
              changes = true;
              updatedUploadsList[findUploadIdx] = newUploadTask;
              if (areAllTasksDone(newUploadTask) && onUploadedCallback) {
                onUploadedCallback(newUploadTask);
              }
            }
          });
          if (changes) setUploads(updatedUploadsList);
        })
        .catch((err) => {
          console.error(err);
        });
    },
    isPolling ? pollingInterval : null
  );

  function removeCompletedTask(task: UploadTask) {
    const idx = uploads.findIndex((u) => u.question === task.question);
    if (idx !== -1 && areAllTasksDone(uploads[idx])) {
      const newArray = uploads.filter((u) => u.question !== task.question);
      setUploads(newArray);
    }
  }

  function fetchedTaskHasUpdates(
    localUploadTask: UploadTask,
    recievedUploadTask: UploadTask
  ): boolean {
    const localTaskList = localUploadTask.taskList;
    const receivedTaskList = recievedUploadTask.taskList;
    if (localTaskList.length !== receivedTaskList.length) return true;
    let changes = false;
    localTaskList.forEach((task, idx) => {
      if (task.status !== receivedTaskList[idx].status) changes = true;
    });
    if (localUploadTask.uploadProgress !== recievedUploadTask.uploadProgress)
      changes = true;
    return changes;
  }

  function areTasksProcessing(task: UploadTask) {
    return (
      !areAllTasksDoneOrOneFailed(task) &&
      !compareTaskStatusesToValue(task, UploadTaskStatuses.PENDING, true)
    );
  }

  function isTaskPolling(task: UploadTask) {
    return areTasksProcessing(task);
  }

  function addOrEditTask(task: UploadTask) {
    const idx = uploads.findIndex((u) => u.question === task.question);
    if (idx === -1) {
      setUploads([...uploads, task]);
    } else {
      setUploads(copyAndSet(uploads, idx, task));
    }
  }

  function upload(
    mentorId: string,
    question: string,
    video: File,
    trim?: { start: number; end: number }
  ) {
    const tokenSource = CancelToken.source();
    addOrEditTask({
      question,
      taskList: [
        {
          task_name: "upload",
          task_id: "",
          status: UploadTaskStatuses.QUEUED,
        },
      ],
      uploadProgress: 0,
      tokenSource: tokenSource,
    });
    uploadVideo(mentorId, video, question, tokenSource, trim)
      .then((task) => {
        addOrEditTask({
          question,
          taskList: task.taskList,
          uploadProgress: 100,
        });
      })
      .catch((err) => {
        addOrEditTask({
          question,
          taskList: [
            {
              task_name: "trim_upload",
              task_id: "",
              status: UploadTaskStatuses.FAILED,
            },
          ],
          errorMessage: `Failed to upload file: Error ${err.response.status}: ${err.response.statusText}`,
          uploadProgress: 0,
        });
      });
  }

  function cancelUpload(mentorId: string, task: UploadTask) {
    if (!task.taskList.length) {
      task.tokenSource?.cancel(UploadTaskStatuses.CANCELLED);
      addOrEditTask({
        ...task,
        taskList: [
          {
            task_name: "trim_upload",
            task_id: "",
            status: UploadTaskStatuses.CANCELLED,
          },
        ],
        isCancelling: true,
      });
      return;
    }
    addOrEditTask({
      ...task,
      isCancelling: true,
    });
    cancelUploadVideo(mentorId, task.question, fetchIncompleteTaskIds(task))
      .then(() => {
        addOrEditTask({
          ...task,
          taskList: [
            {
              task_name: "trim_upload",
              task_id: "",
              status: UploadTaskStatuses.CANCELLED,
            },
          ],
          isCancelling: true,
        });
      })
      .catch((err) => {
        console.error(err);
        addOrEditTask({
          ...task,
          isCancelling: true,
        });
      });
  }

  // function deleteUpload() {}

  return {
    pollStatusCount,
    uploads,
    isUploading,
    upload,
    cancelUpload,
    removeCompletedTask,
  };
}

export interface UseWithUploadStatus {
  pollStatusCount: number;
  uploads: UploadTask[];
  isUploading: boolean;
  upload: (
    mentorId: string,
    question: string,
    video: File,
    trim?: { start: number; end: number }
  ) => void;
  cancelUpload: (mentorId: string, task: UploadTask) => void;
  removeCompletedTask: (tasks: UploadTask) => void;
}
