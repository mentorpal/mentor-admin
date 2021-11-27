/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Button, List, ListItem } from "@material-ui/core";
import { PublishRounded, Close } from "@material-ui/icons";
import { ErrorDialog, LoadingDialog } from "components/dialog";
import NavBar from "components/nav-bar";
import { navigate } from "gatsby";
import {
  MountedFileInfo,
  useWithServerFilePage,
} from "hooks/graphql/use-with-server-file-page";
import React, { useState } from "react";
import { useWithLogin } from "store/slices/login/useWithLogin";
import { UserRole } from "types";

function FileListItem(props: {
  fileInfo: MountedFileInfo;
  index: number;
  downloadVideoFile: (fileName: string) => Promise<void>;
  removeVideoFileFromServer: (fileName: string) => void;
}): JSX.Element {
  const { fileInfo, index, downloadVideoFile, removeVideoFileFromServer } =
    props;
  const [downloadingFile, setDownloadingFile] = useState<boolean>(false);
  const buttonColor = downloadingFile ? "gray" : "black";
  function downloadVideo(fileName: string) {
    setDownloadingFile(true);
    downloadVideoFile(fileName).then(() => {
      setDownloadingFile(false);
    });
  }

  return (
    <ListItem
      data-cy={`file-list-item-${index}`}
      divider={true}
      dense={true}
      alignItems={"center"}
      key={fileInfo.fileName}
      style={{ display: "flex", justifyContent: "space-between" }}
    >
      <div
        data-cy="file-list-item-mentor"
        style={{ padding: "5px", maxWidth: "10%" }}
      >
        {fileInfo.mentorName || "Failed to find mentor name"}
      </div>
      <div
        data-cy="file-list-item-question"
        style={{ padding: "5px", maxWidth: "70%" }}
      >
        {fileInfo.questionText || fileInfo.fileName}
      </div>

      <div>
        <Button
          title={"Download File"}
          data-cy="download-file-from-server"
          disabled={downloadingFile}
          onClick={() => {
            downloadVideo(fileInfo.fileName);
          }}
        >
          <PublishRounded
            style={{
              cursor: "pointer",
              transform: "scaleY(-1)",
              color: buttonColor,
            }}
          />
        </Button>
        <Button
          title={"Delete File"}
          disabled={downloadingFile}
          style={{
            minWidth: 0,
            color: "gray",
            right: 0,
          }}
          data-cy="delete-file"
          onClick={() => {
            removeVideoFileFromServer(fileInfo.fileName);
          }}
        >
          <Close style={{ color: buttonColor }} />
        </Button>
      </div>
    </ListItem>
  );
}

function FileManager(): JSX.Element {
  const {
    loading,
    mountedFiles,
    totalStorage,
    freeStorage,
    downloadVideoFile,
    removeVideoFileFromServer,
    error,
  } = useWithServerFilePage();
  const { state } = useWithLogin();
  const editServerFilesPermission =
    state.user?.userRole === UserRole.ADMIN ||
    state.user?.userRole === UserRole.CONTENT_MANAGER;

  if (state.user && !editServerFilesPermission) {
    navigate("/");
  }

  function renderFilesList() {
    return (
      <List data-cy="files-list">
        {mountedFiles.map((file, idx) => {
          return (
            <FileListItem
              key={`list-item-${idx}`}
              fileInfo={file}
              index={idx}
              downloadVideoFile={downloadVideoFile}
              removeVideoFileFromServer={removeVideoFileFromServer}
            />
          );
        })}
      </List>
    );
  }

  function renderFooter() {
    return (
      <div>
        {Math.floor((totalStorage - freeStorage) / Math.pow(2, 30))} GB Used /{" "}
        {Math.floor(totalStorage / Math.pow(2, 30))} GB Total
      </div>
    );
  }

  if (!state) {
    return (
      <div>
        <NavBar title="Manage Server Files" />
        <ErrorDialog error={error} />
        <LoadingDialog title={loading ? "Loading..." : ""} />
      </div>
    );
  }

  return (
    <div>
      <NavBar title="Manage Server Files" />
      <div style={{ width: "100%", height: "auto", paddingBottom: "20px" }}>
        {renderFilesList()}
      </div>
      <ErrorDialog error={error} />
      <div
        style={{
          position: "fixed",
          bottom: 0,
          padding: "5px",
          width: "100%",
          background: "white",
          border: "1px solid black",
        }}
      >
        {renderFooter()}
      </div>
      <LoadingDialog title={loading ? "Loading..." : ""} />
    </div>
  );
}

export default FileManager;
