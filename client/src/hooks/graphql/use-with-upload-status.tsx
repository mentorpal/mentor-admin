/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { fetchUploads, uploadVideo } from "api";
import { copyAndSet } from "helpers";
import useInterval from "hooks/task/use-interval";
import { useEffect, useState } from "react";
import { MediaType, Mentor, Question } from "types";

export enum UploadStatus {
  NONE = "NONE",
  PENDING = "PENDING",
  POLLING = "POLLING",
  TRANSCRIBE_IN_PROGRESS = "TRANSCRIBE_IN_PROGRESS",
  TRANSCRIBE_FAILED = "TRANSCRIBE_FAILED",
  UPLOAD_IN_PROGRESS = "UPLOAD_IN_PROGRESS",
  UPLOAD_FAILED = "UPLOAD_FAILED",
  DONE = "DONE",
}

export interface UploadTask {
  question: Question;
  uploadStatus: UploadStatus;
  transcript?: string;
  media?: MediaType[];
}

export interface UseWithUploadStatus {
  uploads: UploadTask[];
  isUploading: boolean;
  isPolling: boolean;
  upload: (
    question: Question,
    video: File,
    trim?: { start: number; end: number }
  ) => void;
}

export function useWithUploadStatus(
  accessToken: string,
  pollingInterval = 1000
) {
  const [uploads, setUploads] = useState<UploadTask[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isPolling, setIsPolling] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    fetchUploads(accessToken)
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
    const isUploading = uploads.some(
      (u) =>
        u.uploadStatus !== UploadStatus.NONE &&
        u.uploadStatus !== UploadStatus.TRANSCRIBE_FAILED &&
        u.uploadStatus !== UploadStatus.UPLOAD_FAILED &&
        u.uploadStatus !== UploadStatus.DONE
    );
    const isPolling = uploads.some(
      (u) =>
        u.uploadStatus !== UploadStatus.NONE &&
        u.uploadStatus !== UploadStatus.PENDING &&
        u.uploadStatus !== UploadStatus.TRANSCRIBE_FAILED &&
        u.uploadStatus !== UploadStatus.UPLOAD_FAILED &&
        u.uploadStatus !== UploadStatus.DONE
    );
    setIsUploading(isUploading);
    setIsPolling(isPolling);
  }, [uploads]);

  useInterval(
    (isCancelled) => {
      fetchUploads(accessToken)
        .then((data) => {
          if (!isCancelled()) {
            return;
          }
          setUploads(data);
        })
        .catch((err) => {
          console.error(err);
        });
    },
    isPolling ? pollingInterval : null
  );

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
    addOrEditTask({ question, uploadStatus: UploadStatus.PENDING });
    uploadVideo(mentorId, question._id, video, trim)
      .then((data) => {
        addOrEditTask({ question, uploadStatus: UploadStatus.POLLING });
      })
      .catch((err) => {
        console.error(err);
      });
  }

  function cancelUpload() {}

  function deleteUpload() {}

  return {
    uploads,
    isUploading,
    isPolling,
    upload,
  };
}
