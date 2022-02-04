/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect, useState } from "react";
import {
  downloadMountedFileAsBlob,
  fetchBasicMentorInfo,
  fetchMountedFilesStatus,
  fetchQuestionsById,
  fetchUploadTasks,
  removeMountedFileFromServer,
} from "api";
import { useWithLogin } from "store/slices/login/useWithLogin";
import { LoginState } from "store/slices/login";

interface ServerFilePageError {
  message: string;
  error: string;
}

export interface FileOnServer {
  fileName: string;
  size: number;
  uploadDate: string;
}

export interface MountedFileInfo {
  fileName: string;
  size: number;
  uploadDate: string;
  mentorId: string;
  mentorName?: string;
  questionId: string;
  questionText?: string;
}

export function useWithServerFilePage(): useWithServerFilePage {
  const [loading, setLoading] = useState<boolean>(true);
  const [mountedFiles, setMountedfiles] = useState<MountedFileInfo[]>([]);
  const [error, setError] = useState<ServerFilePageError>();
  const [unsafeDeletionFile, setUnsafeDeletionFile] =
    useState<MountedFileInfo>();
  const { state: loginState } = useWithLogin();
  const { accessToken } = loginState;

  useEffect(() => {
    if (!accessToken) {
      return;
    }
    fetchMountedFilesStatus(accessToken)
      .then((mountedFiles) => {
        hydrateFileInfo(mountedFiles);
      })
      .catch((err) => {
        setLoading(false);
        setError({
          message: "Failed to fetch status of files on server.",
          error: String(err),
        });
      });
  }, [accessToken]);

  async function hydrateFileInfo(files: FileOnServer[]): Promise<void> {
    const mountedFileInfo: MountedFileInfo[] = [];
    files.forEach((file) => {
      const splitFileName = file.fileName.split("-");
      const questionId = splitFileName[splitFileName.length - 1].split(".")[0];
      const mentorId = splitFileName[splitFileName.length - 2];
      mountedFileInfo.push({
        fileName: file.fileName,
        size: file.size,
        uploadDate: file.uploadDate,
        mentorId,
        questionId,
      });
    });
    try {
      const mentorInfo = await fetchBasicMentorInfo();
      const questionInfo = await fetchQuestionsById(
        mountedFileInfo
          .filter((file) => file.questionId.length === 24)
          .map((fileInfo) => fileInfo.questionId)
      );
      const mountedFileInfoCopy: MountedFileInfo[] = JSON.parse(
        JSON.stringify(mountedFileInfo)
      );
      mountedFileInfoCopy.forEach((fileInfo, idx) => {
        fileInfo.mentorName = mentorInfo.edges.find(
          (mentor) => mentor.node._id == fileInfo.mentorId
        )?.node.name;
        fileInfo.questionText = questionInfo.find(
          (question) => question._id === fileInfo.questionId
        )?.question;
        mountedFileInfoCopy[idx] = fileInfo;
      });
      mountedFileInfoCopy.sort((fileOne, fileTwo) =>
        fileOne.mentorName &&
        fileTwo.mentorName &&
        fileOne.mentorName.charAt(0) > fileTwo.mentorName.charAt(0)
          ? 1
          : -1
      );
      setMountedfiles(mountedFileInfoCopy);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setMountedfiles(mountedFileInfo);
      setError({
        message: "Failed to fetch mentor and question info",
        error: String(err),
      });
    }
  }

  function downloadVideoBlob(
    blob: Blob,
    filename: string,
    document: Document
  ): void {
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", blobUrl);
    link.setAttribute("download", `${filename}.mp4`);
    link.click();
  }

  async function downloadVideoFile(fileName: string): Promise<void> {
    if (!accessToken) {
      setError({
        message: `Failed to download file ${fileName} from server`,
        error: "No access token found.",
      });
      return;
    }
    return downloadMountedFileAsBlob(fileName, accessToken)
      .then((videoBlob) => {
        downloadVideoBlob(videoBlob, fileName, document);
      })
      .catch((err) => {
        setError({
          message: `Failed to download file ${fileName} from server`,
          error: String(err),
        });
      });
  }

  function removeVideoFileFromServer(fileName: string): void {
    if (!loginState.accessToken) {
      setError({
        message: `Failed to remove file ${fileName} from server`,
        error: "No access token found",
      });
      return;
    }
    removeMountedFileFromServer(fileName, loginState.accessToken)
      .then((fileRemoved) => {
        if (fileRemoved) {
          const fileIdx = mountedFiles.findIndex(
            (file) => file.fileName === fileName
          );
          if (fileIdx !== -1) {
            const filesCopy = JSON.parse(JSON.stringify(mountedFiles));
            filesCopy.splice(fileIdx, 1);
            setMountedfiles(filesCopy);
          }
        }
      })
      .catch((err) => {
        setError({
          message: `Failed to remove file ${fileName} from server`,
          error: String(err),
        });
      });
  }

  function safelyDeleteFileFromServer(fileInfo: MountedFileInfo): void {
    if (!loginState) {
      setError({
        message: "Unable to delete files",
        error: "No login state",
      });
      return;
    }
    if (!loginState.accessToken) {
      setError({
        message: "Unable to delete files",
        error: "No access token",
      });
      return;
    }
    fetchUploadTasks(loginState.accessToken, fileInfo.mentorId)
      .then((uploadTasks) => {
        const uploadTaskExists = uploadTasks.find(
          (uploadTask) => uploadTask.question === fileInfo.questionId
        );
        if (uploadTaskExists) {
          setError({
            message: "Unable to delete file",
            error: "That file is currently in use",
          });
        } else {
          removeVideoFileFromServer(fileInfo.fileName);
        }
      })
      .catch(() => {
        setUnsafeDeletionFile(fileInfo);
      });
  }

  return {
    loading,
    mountedFiles,
    downloadVideoFile,
    safelyDeleteFileFromServer,
    directlyRemoveFileFromServer: removeVideoFileFromServer,
    setUnsafeDeletionFile,
    unsafeDeletionFile,
    error,
    loginState,
  };
}

export interface useWithServerFilePage {
  loading: boolean;
  mountedFiles: MountedFileInfo[];
  unsafeDeletionFile?: MountedFileInfo;
  setUnsafeDeletionFile: (file?: MountedFileInfo) => void;
  directlyRemoveFileFromServer: (fileName: string) => void;
  downloadVideoFile: (fileName: string) => Promise<void>;
  safelyDeleteFileFromServer: (fileInfo: MountedFileInfo) => void;
  error?: ServerFilePageError;
  loginState: LoginState;
}
