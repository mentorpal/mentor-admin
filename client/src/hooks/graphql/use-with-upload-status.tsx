/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect, useState } from "react";
import { deleteUploadTask, fetchUploadTasks, uploadVideo } from "api";
import { Media, Question } from "types";
import { copyAndSet } from "helpers";
import useInterval from "hooks/task/use-interval";

export enum UploadStatus {
  PENDING = "PENDING", // local state only; sending upload request to upload api
  POLLING = "POLLING", // local state only; upload request has been received by api, start polling
  TRANSCRIBE_IN_PROGRESS = "TRANSCRIBE_IN_PROGRESS", // api has started transcribing
  TRANSCRIBE_FAILED = "TRANSCRIBE_FAILED", // api transcribe failed (should it still try to upload anyway...?)
  UPLOAD_IN_PROGRESS = "UPLOAD_IN_PROGRESS", // api has started uploading video
  UPLOAD_FAILED = "UPLOAD_FAILED", // api upload failed
  DONE = "DONE", // api is done with upload process
  CANCELLED = "CANCELLED", // api has successfully cancelled the upload
}

export interface UploadTask {
  question: Question;
  uploadProgress: number;
  uploadStatus: UploadStatus;
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
          console.log(error);
        });
      }
    });
    setIsUploading(uploads.some((u) => !isTaskDoneOrFailed(u)));
    setIsPolling(uploads.some((u) => isTaskPolling(u)));
  }, [uploads]);

  //we start polling because we added an upload to our state when pressed
  useInterval(
    (isCancelled) => {
      fetchUploadTasks(accessToken)
        .then((data) => {
          if (isCancelled()) {
            return;
          }
          data.forEach((u) => {
            const findUpload = uploads.find(
              (up) => up.question._id === u.question._id
            );
            // add  || findUpload.uploadStatus == UploadStatus.UPLOAD_IN_PROGRESS   if you are cypress testing uploadProgress
            if (
              !findUpload ||
              findUpload.uploadStatus !== u.uploadStatus ||
              findUpload.uploadStatus == UploadStatus.UPLOAD_IN_PROGRESS
            ) {
              addOrEditTask(u);
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

  function isTaskDoneOrFailed(task: UploadTask) {
    return (
      task.uploadStatus === UploadStatus.CANCELLED ||
      task.uploadStatus === UploadStatus.TRANSCRIBE_FAILED ||
      task.uploadStatus === UploadStatus.UPLOAD_FAILED ||
      task.uploadStatus === UploadStatus.DONE
    );
  }

  function isTaskPolling(task: UploadTask) {
    return !isTaskDoneOrFailed(task);
  }

  function addOrEditTask(task: UploadTask) {
    const idx = uploads.findIndex((u) => u.question._id === task.question._id);
    if (idx === -1) {
      setUploads([...uploads, task]);
    } else {
      setUploads(copyAndSet(uploads, idx, task));
    }
  }

  //this is the upload function being used
  function upload(
    mentorId: string,
    question: Question,
    video: File,
    trim?: { start: number; end: number }
  ) {
    addOrEditTask({
      question,
      uploadStatus: UploadStatus.PENDING,
      uploadProgress: 0,
    });
    //video gets uploaded to axios
    uploadVideo(mentorId, video, question, addOrEditTask, trim)
      .then(() => {
        addOrEditTask({
          question,
          uploadStatus: UploadStatus.POLLING,
          uploadProgress: 100,
        });
      })
      .catch((err) => {
        console.error(err);
        addOrEditTask({
          question,
          uploadStatus: UploadStatus.UPLOAD_FAILED,
          uploadProgress: 0,
        });
      });
  }

  // function cancelUpload() {}

  // function deleteUpload() {}

  return {
    uploads,
    isUploading,
    upload,
    isTaskDoneOrFailed,
  };
}

export interface UseWithUploadStatus {
  uploads: UploadTask[];
  isUploading: boolean;
  upload: (
    mentorId: string,
    question: Question,
    video: File,
    trim?: { start: number; end: number }
  ) => void;
  isTaskDoneOrFailed: (upload: UploadTask) => boolean;
}
