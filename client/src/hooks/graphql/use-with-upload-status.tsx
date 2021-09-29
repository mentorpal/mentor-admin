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
import { UploadTask, UploadTaskFlagStatuses } from "types";
import { copyAndSet } from "helpers";
import useInterval from "hooks/task/use-interval";
import {
  areAllTasksDone,
  compareFlagStatusesToValue,
  isATaskCancelled,
  isATaskCancelling,
  isATaskFailed,
  isTaskDoneOrFailed,
  whichTaskFailed,
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
      if (isTaskDoneOrFailed(u)) {
        deleteUploadTask(u.question, accessToken).catch((error) => {
          console.error(error);
        });
      }
    });
    setIsUploading(uploads.some((u) => !isTaskDoneOrFailed(u)));
    setIsPolling(uploads.some((u) => isTaskPolling(u)));
  }, [uploads]);

  useInterval(
    (isCancelled) => {
      fetchUploadTasks(accessToken)
        .then((data) => {
          if (isCancelled()) {
            return;
          }
          console.log(data);
          setPollStatusCount(pollStatusCount + 1);
          data.forEach((u) => {
            const findUpload = uploads.find((up) => up.question === u.question);
            if (
              !findUpload ||
              fetchedTaskHasUpdates(findUpload, u)
              //used to also check if the found upload was in progress to it would trigger polling for mocking
            ) {
              addOrEditTask({
                ...u,
                isCancelling:
                  findUpload?.isCancelling ||
                  isATaskCancelling(u) ||
                  isATaskCancelled(u),
                errorMessage: isATaskFailed(u)
                  ? `Failed to process file: ${whichTaskFailed(u)} failed`
                  : "",
              });
              if (areAllTasksDone(u) && onUploadedCallback) {
                onUploadedCallback(u);
              }
            }
          });
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
    return (
      localUploadTask.uploadFlag !== recievedUploadTask.uploadFlag ||
      localUploadTask.transcodingFlag !== recievedUploadTask.transcodingFlag ||
      localUploadTask.transcribingFlag !==
        recievedUploadTask.transcribingFlag ||
      localUploadTask.finalizationFlag !==
        recievedUploadTask.finalizationFlag ||
      localUploadTask.uploadProgress !== recievedUploadTask.uploadProgress
    );
  }

  function areTasksProcessing(task: UploadTask) {
    return (
      !isTaskDoneOrFailed(task) &&
      !compareFlagStatusesToValue(task, UploadTaskFlagStatuses.PENDING, true)
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
      uploadFlag: UploadTaskFlagStatuses.PENDING,
      transcribingFlag: UploadTaskFlagStatuses.PENDING,
      transcodingFlag: UploadTaskFlagStatuses.PENDING,
      finalizationFlag: UploadTaskFlagStatuses.PENDING,
      uploadProgress: 0,
      tokenSource: tokenSource,
      taskId: [],
    });
    uploadVideo(mentorId, video, question, tokenSource, addOrEditTask, trim)
      .then((task) => {
        addOrEditTask({
          question,
          uploadFlag: UploadTaskFlagStatuses.QUEUED,
          transcribingFlag: UploadTaskFlagStatuses.QUEUED,
          transcodingFlag: UploadTaskFlagStatuses.QUEUED,
          finalizationFlag: UploadTaskFlagStatuses.QUEUED,
          uploadProgress: 100,
          taskId: [task.id],
        });
      })
      .catch((err) => {
        addOrEditTask({
          question,
          uploadFlag: UploadTaskFlagStatuses.FAILED,
          errorMessage: `Failed to upload file: Error ${err.response.status}: ${err.response.statusText}`,
          uploadProgress: 0,
          taskId: [],
        });
      });
  }

  function cancelUpload(mentorId: string, task: UploadTask) {
    if (!task.taskId) {
      //This used to be UploadStatus.Cancelled, not sure if that changes anything
      task.tokenSource?.cancel(UploadTaskFlagStatuses.CANCELLED);
      addOrEditTask({
        ...task,
        uploadFlag: UploadTaskFlagStatuses.CANCELLED,
        isCancelling: true,
      });
      return;
    }
    addOrEditTask({
      ...task,
      uploadFlag: UploadTaskFlagStatuses.QUEUED, //this is to trigger polling in case it is still in http upload
      isCancelling: true,
    });
    cancelUploadVideo(mentorId, task.question, task.taskId)
      .then(() => {
        addOrEditTask({
          ...task,
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
    isTaskDoneOrFailed,
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
  isTaskDoneOrFailed: (upload: UploadTask) => boolean;
}
