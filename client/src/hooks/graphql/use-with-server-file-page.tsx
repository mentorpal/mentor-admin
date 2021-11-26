/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useState } from "react";
import { navigate } from "gatsby";
import { downloadMountedFileAsBlob, fetchMountedFilesStatus, removeMountedFileFromServer } from "api";

export interface MountedFilesStatus{
  files: string[]
  totalStorage: number
  usedStorage: number
  freeStorage: number
}

interface ServerFilePageError {
  message: string;
  error: string;
}

export function useWithServerFilePage(): useWithServerFilePage {
  const [loading, setLoading] = useState<boolean>(true);
  const [mountedFiles, setMountedfiles] = useState<string[]>([]);
  const [totalStorage, setTotalStorage] = useState<number>(0);
  const [usedStorage, setUsedStorage] = useState<number>(0);
  const [freeStorage, setFreeStorage] = useState<number>(0);
  const [error, setError] = useState<ServerFilePageError>();

  useEffect(()=>{
    fetchMountedFilesStatus().then((filesStatus)=>{
      setMountedfiles(filesStatus.files);
      setTotalStorage(filesStatus.totalStorage);
      setUsedStorage(filesStatus.usedStorage);
      setFreeStorage(filesStatus.freeStorage);
      setLoading(false);
    }).catch((err)=>{
      setLoading(false);
      setError({
        message:"Failed to fetch status of files on server.",
        error: String(err)
      })
    })
  },[])

  function downloadVideoBlob(blob: Blob, filename: string, document: Document) {
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", blobUrl);
    link.setAttribute("download", `${filename}.mp4`);
    link.click();
  }

  function downloadVideoFile(fileName: string){
    downloadMountedFileAsBlob(fileName).then((videoBlob)=>{
      downloadVideoBlob(videoBlob, fileName, document);
    }).catch((err)=>{
      setError({
        message:`Failed to download file ${fileName} from server`,
        error: String(err)
      })
    })
  }

  function removeVideoFileFromServer(fileName: string){
    removeMountedFileFromServer(fileName).then((fileRemoved)=>{
      if(fileRemoved){
        const fileIdx = mountedFiles.findIndex((file)=>file===fileName);
        setMountedfiles(mountedFiles.splice(fileIdx, 1));
      }
    }).catch((err)=>{
      setError({
        message:`Failed to remove file ${fileName} from server`,
        error: String(err)
      })
    })
  }
  
  return {
    loading,
    files: mountedFiles,
    totalStorage,
    usedStorage,
    freeStorage,
    downloadVideoFile,
    removeVideoFileFromServer,
    error,
  };
}

export interface useWithServerFilePage {
  loading: boolean,
  files: string[],
  totalStorage: number,
  usedStorage: number,
  freeStorage: number,
  downloadVideoFile: (fileName: string) => void;
  removeVideoFileFromServer: (fileName: string) => void;
  error?:ServerFilePageError
}
