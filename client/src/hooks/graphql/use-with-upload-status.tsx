/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect, useState } from "react";
import axios, { CancelTokenSource } from "axios";
import {
  cancelUploadVideo,
  deleteUploadTask,
  fetchUploadTasks,
  uploadVideo,
} from "api";
import { Media, Question } from "types";
import { copyAndSet } from "helpers";
import useInterval from "hooks/task/use-interval";

export enum UploadStatus {
  PENDING = "PENDING", // local state only; sending upload request to upload api
  POLLING = "POLLING", // local state only; upload request has been received by api, start polling
  TRIM_IN_PROGRESS = "TRIM_IN_PROGRESS",
  TRANSCRIBE_IN_PROGRESS = "TRANSCRIBE_IN_PROGRESS", // api has started transcribing
  TRANSCRIBE_FAILED = "TRANSCRIBE_FAILED", // api transcribe failed (should it still try to upload anyway...?)
  UPLOAD_IN_PROGRESS = "UPLOAD_IN_PROGRESS", // api has started uploading video
  UPLOAD_FAILED = "UPLOAD_FAILED", // api upload failed
  TRANSFER_IN_PROGRESS = "TRANSFER_IN_PROGRESS",
  TRANSFER_FAILED = "TRANSFER_FAILED",
  CANCEL_IN_PROGRESS = "CANCEL_IN_PROGRESS", //
  CANCEL_FAILED = "CANCEL_FAILED",
  CANCELLED = "CANCELLED", // api has successfully cancelled the upload
  DONE = "DONE", // api is done with upload process
}

export interface UploadTask {
  taskId: string;
  question: Question;
  uploadStatus: UploadStatus;
  uploadProgress: number;
  errorMessage?: string;
  isCancelling?: boolean;
  tokenSource?: CancelTokenSource;
  transcript?: string;
  media?: Media[];
}

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
        deleteUploadTask(u.question._id, accessToken).catch((error) => {
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
          setPollStatusCount(pollStatusCount + 1);
          data.forEach((u) => {
            const findUpload = uploads.find(
              (up) => up.question._id === u.question._id
            );
            if (
              !findUpload ||
              findUpload.uploadStatus !== u.uploadStatus ||
              findUpload.uploadStatus == UploadStatus.UPLOAD_IN_PROGRESS
            ) {
              addOrEditTask({
                ...u,
                isCancelling:
                  findUpload?.isCancelling ||
                  u.uploadStatus === UploadStatus.CANCEL_IN_PROGRESS ||
                  u.uploadStatus === UploadStatus.CANCELLED,
                errorMessage: isTaskFailed(u)
                  ? `Failed to process file: ${u.uploadStatus}`
                  : "",
              });
              if (u.uploadStatus === UploadStatus.DONE && onUploadedCallback) {
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
    const idx = uploads.findIndex((u) => u.question._id === task.question._id);
    if (idx !== -1 && uploads[idx].uploadStatus === UploadStatus.DONE) {
      const newArray = uploads.filter(
        (u) => u.question._id !== task.question._id
      );
      setUploads(newArray);
    }
  }
  function isTaskDoneOrFailed(task: UploadTask) {
    return (
      task.uploadStatus === UploadStatus.CANCELLED ||
      task.uploadStatus === UploadStatus.TRANSCRIBE_FAILED ||
      task.uploadStatus === UploadStatus.UPLOAD_FAILED ||
      task.uploadStatus === UploadStatus.DONE
    );
  }

  function isTaskFailed(task: UploadTask) {
    return (
      task.uploadStatus === UploadStatus.TRANSCRIBE_FAILED ||
      task.uploadStatus === UploadStatus.UPLOAD_FAILED
    );
  }

  function isTaskPolling(task: UploadTask) {
    return (
      !isTaskDoneOrFailed(task) && task.uploadStatus !== UploadStatus.PENDING
    );
  }

  function addOrEditTask(task: UploadTask) {
    const idx = uploads.findIndex((u) => u.question._id === task.question._id);
    if (idx === -1) {
      setUploads([...uploads, task]);
    } else {
      setUploads(copyAndSet(uploads, idx, task));
    }
  }

  function upload(
    mentorId: string,
    question: Question,
    video: File,
    trim?: { start: number; end: number }
  ) {
    const tokenSource = CancelToken.source();
    addOrEditTask({
      question,
      uploadStatus: UploadStatus.PENDING,
      uploadProgress: 0,
      tokenSource: tokenSource,
      taskId: "",
    });
    uploadVideo(mentorId, video, question, tokenSource, addOrEditTask, trim)
      .then((task) => {
        addOrEditTask({
          question,
          uploadStatus: UploadStatus.POLLING,
          uploadProgress: 100,
          taskId: task.id,
        });
      })
      .catch((err) => {
        addOrEditTask({
          question,
          uploadStatus:
            err.message && err.message === UploadStatus.CANCELLED
              ? UploadStatus.CANCELLED
              : UploadStatus.UPLOAD_FAILED,
          errorMessage: `Failed to upload file: Error ${err.response.status}: ${err.response.statusText}`,
          uploadProgress: 0,
          taskId: "",
        });
      });
  }

  function cancelUpload(mentorId: string, task: UploadTask) {
    if (!task.taskId) {
      task.tokenSource?.cancel(UploadStatus.CANCELLED);
      addOrEditTask({
        ...task,
        uploadStatus: UploadStatus.CANCELLED,
        isCancelling: true,
      });
      return;
    }
    addOrEditTask({
      ...task,
      uploadStatus: UploadStatus.PENDING,
      isCancelling: true,
    });
    cancelUploadVideo(mentorId, task.question, task.taskId)
      .then(() => {
        addOrEditTask({
          ...task,
          uploadStatus: UploadStatus.POLLING,
          isCancelling: true,
        });
      })
      .catch((err) => {
        console.error(err);
        addOrEditTask({
          ...task,
          uploadStatus: UploadStatus.CANCEL_FAILED,
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
    question: Question,
    video: File,
    trim?: { start: number; end: number }
  ) => void;
  cancelUpload: (mentorId: string, task: UploadTask) => void;
  removeCompletedTask: (tasks: UploadTask) => void;
  isTaskDoneOrFailed: (upload: UploadTask) => boolean;
}
