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
  fetchServerStorageInfo,
  removeMountedFileFromServer,
} from "api";

export interface ServerStorageInfo {
  totalStorage: number;
  usedStorage: number;
  freeStorage: number;
}

interface ServerFilePageError {
  message: string;
  error: string;
}

export interface MountedFileInfo {
  fileName: string;
  mentorId: string;
  mentorName?: string;
  questionId: string;
  questionText?: string;
}

export function useWithServerFilePage(): useWithServerFilePage {
  const [loading, setLoading] = useState<boolean>(true);
  const [mountedFiles, setMountedfiles] = useState<MountedFileInfo[]>([]);
  const [totalStorage, setTotalStorage] = useState<number>(0);
  const [freeStorage, setFreeStorage] = useState<number>(0);
  const [error, setError] = useState<ServerFilePageError>();

  useEffect(() => {
    fetchMountedFilesStatus()
      .then((mountedFiles) => {
        hydrateFileInfo(mountedFiles);
        fetchServerStorageInfo()
          .then((serverStorageInfo) => {
            setTotalStorage(serverStorageInfo.totalStorage);
            setFreeStorage(serverStorageInfo.freeStorage);
          })
          .catch((err) => {
            setError({
              message: "Failed to fetch server storage info",
              error: String(err),
            });
          });
      })
      .catch((err) => {
        setLoading(false);
        setError({
          message: "Failed to fetch status of files on server.",
          error: String(err),
        });
      });
  }, []);

  async function hydrateFileInfo(files: string[]) {
    const mountedFileInfo: MountedFileInfo[] = [];
    files.forEach((file) => {
      const splitFileName = file.split("-");
      const questionId = splitFileName[splitFileName.length - 1].split(".")[0];
      const mentorId = splitFileName[splitFileName.length - 2];
      mountedFileInfo.push({ fileName: file, mentorId, questionId });
    });
    try {
      const mentorInfo = await fetchBasicMentorInfo();
      const questionInfo = await fetchQuestionsById(
        mountedFileInfo.map((fileInfo) => fileInfo.questionId)
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

  function downloadVideoBlob(blob: Blob, filename: string, document: Document) {
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", blobUrl);
    link.setAttribute("download", `${filename}.mp4`);
    link.click();
  }

  async function downloadVideoFile(fileName: string) {
    return downloadMountedFileAsBlob(fileName)
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

  function removeVideoFileFromServer(fileName: string) {
    removeMountedFileFromServer(fileName)
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
        fetchServerStorageInfo().then((serverStorageInfo) => {
          setFreeStorage(serverStorageInfo.freeStorage);
          setTotalStorage(serverStorageInfo.totalStorage);
        });
      })
      .catch((err) => {
        setError({
          message: `Failed to remove file ${fileName} from server`,
          error: String(err),
        });
      });
  }

  return {
    loading,
    mountedFiles,
    totalStorage,
    freeStorage,
    downloadVideoFile,
    removeVideoFileFromServer,
    error,
  };
}

export interface useWithServerFilePage {
  loading: boolean;
  mountedFiles: MountedFileInfo[];
  totalStorage: number;
  freeStorage: number;
  downloadVideoFile: (fileName: string) => Promise<void>;
  removeVideoFileFromServer: (fileName: string) => void;
  error?: ServerFilePageError;
}
