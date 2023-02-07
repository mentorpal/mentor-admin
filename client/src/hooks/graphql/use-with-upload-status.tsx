/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect, useState } from "react";
import axios from "axios";
import { deleteUploadTask, fetchUploadTasks, uploadVideo } from "api";
import { UploadTask, UploadTaskStatuses } from "types";
import { copyAndSet } from "helpers";
import useInterval from "hooks/task/use-interval";
import { v4 as uuid } from "uuid";
import {
  areAllTasksDone,
  compareTaskStatusesToValue,
  isATaskCancelled,
  isATaskCancelling,
  isATaskFailed,
  areAllTasksDoneOrOneFailed,
  whichTaskFailed,
} from "./upload-status-helpers";
import { useActiveMentor } from "store/slices/mentor/useActiveMentor";
import { useWithConfig } from "store/slices/config/useWithConfig";
import { useWithUploadInitStatusActions } from "store/slices/upload-init-status/upload-init-status-actions";

export function useWithUploadStatus(
  accessToken: string,
  onUploadedCallback?: (task: UploadTask) => void,
  pollingInterval = 3000
): UseWithUploadStatus {
  const [uploads, setUploads] = useState<UploadTask[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isPolling, setIsPolling] = useState<boolean>(false);
  const [pollStatusCount, setPollStatusCount] = useState<number>(0);
  const { getData } = useActiveMentor();
  const { state: configState } = useWithConfig();
  const { newUploadInitCompleted, newUploadInitStarted } =
    useWithUploadInitStatusActions();

  const mentorId = getData((state) => state.data?._id);
  const CancelToken = axios.CancelToken;

  useEffect(() => {
    let mounted = true;
    if (!mentorId) {
      return;
    }
    fetchUploadTasks(accessToken, mentorId)
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
  }, [mentorId]);

  useEffect(() => {
    if (!mentorId) {
      return;
    }
    uploads.forEach((u) => {
      if (areAllTasksDone(u) || isATaskFailed(u) || isATaskCancelled(u)) {
        deleteUploadTask(u.question, accessToken, mentorId).catch((error) => {
          console.error(error);
        });
      }
    });
    setIsUploading(uploads.some((u) => !areAllTasksDoneOrOneFailed(u)));
    setIsPolling(uploads.some((u) => isTaskPolling(u)));
  }, [uploads]);

  useInterval(
    (isCancelled) => {
      if (!mentorId) {
        return;
      }
      fetchUploadTasks(accessToken, mentorId)
        .then((data) => {
          if (isCancelled()) {
            return;
          }
          setPollStatusCount(pollStatusCount + 1);
          setUploads((prevData) => {
            const updatedUploadsList: UploadTask[] = JSON.parse(
              JSON.stringify(prevData)
            );
            let changes = false;
            data.forEach((u) => {
              const findUploadIdx = updatedUploadsList.findIndex(
                (up) => up.question === u.question
              );
              const newUploadTask = {
                ...u,
                isCancelling:
                  u?.isCancelling ||
                  isATaskCancelling(u) ||
                  isATaskCancelled(u),
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
            if (changes) {
              return updatedUploadsList;
            } else {
              return prevData;
            }
          });
        })
        .catch((err) => {
          console.error(err);
        });
    },
    isPolling ? pollingInterval : null
  );

  function removeCompletedOrFailedTask(task: UploadTask) {
    setUploads((prevState) => {
      const idx = prevState.findIndex((u) => u.question === task.question);
      if (idx !== -1 && areAllTasksDoneOrOneFailed(prevState[idx])) {
        const newArray = prevState.filter((u) => u.question !== task.question);
        return newArray;
      }
      return prevState;
    });
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
    setUploads((prevData) => {
      const idx = prevData.findIndex((u) => u.question === task.question);
      if (idx === -1) {
        const newArray = [...prevData, task];
        return newArray;
      } else {
        const newArray = copyAndSet(prevData, idx, task);
        return newArray;
      }
    });
  }

  function upload(
    mentorId: string,
    question: string,
    video: File,
    isVbgVideo: boolean,
    trim?: { start: number; end: number },
    hasEditedTranscript?: boolean
  ) {
    const tokenSource = CancelToken.source();
    addOrEditTask({
      question,
      taskList: [
        {
          task_name: "upload",
          status: UploadTaskStatuses.QUEUED,
        },
      ],
      uploadProgress: 0,
      tokenSource: tokenSource,
    });
    const uploadId = uuid();
    newUploadInitStarted(uploadId);
    uploadVideo(
      mentorId,
      video,
      question,
      isVbgVideo,
      tokenSource,
      accessToken,
      configState.config?.uploadLambdaEndpoint || "",
      trim,
      hasEditedTranscript
    )
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
              status: UploadTaskStatuses.FAILED,
            },
          ],
          errorMessage: `Failed to upload file: Error ${err?.response?.status}: ${err?.response?.statusText}`,
          uploadProgress: 0,
        });
      })
      .finally(() => {
        newUploadInitCompleted(uploadId);
      });
  }

  return {
    pollStatusCount,
    uploads,
    isUploading,
    upload,
    removeCompletedOrFailedTask,
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
    isVbgVideo: boolean,
    trim?: { start: number; end: number },
    hasEditedTranscript?: boolean
  ) => void;
  removeCompletedOrFailedTask: (tasks: UploadTask) => void;
}
