/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
} from "@material-ui/core";
import { PublishRounded, Close } from "@material-ui/icons";
import { ErrorDialog, LoadingDialog } from "components/dialog";
import NavBar from "components/nav-bar";
import { navigate } from "gatsby";
import {
  MountedFileInfo,
  useWithServerFilePage,
} from "hooks/graphql/use-with-server-file-page";
import React, { useState } from "react";
import { LoginState } from "store/slices/login";
import { UserRole } from "types";

function FileListItem(props: {
  loginState: LoginState;
  setUnsafeDeletionFile: (fileInfo?: MountedFileInfo) => void;
  fileInfo: MountedFileInfo;
  index: number;
  downloadVideoFile: (fileName: string) => Promise<void>;
  safelyDeleteFileFromServer: (fileInfo: MountedFileInfo) => void;
}): JSX.Element {
  const {
    fileInfo,
    index,
    downloadVideoFile,
    safelyDeleteFileFromServer,
    setUnsafeDeletionFile,
  } = props;
  const [downloadingFile, setDownloadingFile] = useState<boolean>(false);

  const buttonColor = downloadingFile ? "gray" : "black";

  function downloadVideo(fileName: string): void {
    setDownloadingFile(true);
    downloadVideoFile(fileName).then(() => {
      setDownloadingFile(false);
    });
  }

  return (
    <div>
      <ListItem
        data-cy={`file-list-item-${index}`}
        divider={true}
        dense={true}
        alignItems={"center"}
        key={fileInfo.fileName}
        style={{ justifyContent: "space-between" }}
      >
        <div
          data-cy="file-list-item-mentor"
          style={{ padding: "5px", width: "10%" }}
        >
          {fileInfo.mentorName || ""}
        </div>
        <div
          data-cy="file-list-item-question"
          style={{ padding: "10px", width: "45%" }}
        >
          {fileInfo.questionText || fileInfo.fileName}
        </div>
        <div style={{ width: "20%" }}>{fileInfo.uploadDate}</div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "20%",
            height: "10%",
          }}
        >
          <div>{(fileInfo.size / 1000000).toFixed(2)} MB</div>
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
                float: "right",
              }}
              data-cy="delete-file"
              onClick={() => {
                if (fileInfo.mentorName) {
                  safelyDeleteFileFromServer(fileInfo);
                } else {
                  setUnsafeDeletionFile(fileInfo);
                }
              }}
            >
              <Close style={{ color: buttonColor }} />
            </Button>
          </div>
        </div>
      </ListItem>
    </div>
  );
}

function FileManager(): JSX.Element {
  const {
    loginState,
    loading,
    mountedFiles,
    downloadVideoFile,
    unsafeDeletionFile,
    setUnsafeDeletionFile,
    safelyDeleteFileFromServer,
    directlyRemoveFileFromServer,
    error,
  } = useWithServerFilePage();
  const editServerFilesPermission =
    loginState.user?.userRole === UserRole.ADMIN ||
    loginState.user?.userRole === UserRole.CONTENT_MANAGER;
  const totalSpaceUsedInMb = mountedFiles.length
    ? bytesToMb(
        mountedFiles
          .map((file) => file.size)
          .reduce(function (a, b) {
            return a + b;
          })
      )
    : 0;

  if (loginState.user && !editServerFilesPermission) {
    navigate("/");
  }

  function bytesToMb(bytes: number): number {
    return bytes / 1000000;
  }

  function renderFilesList(): JSX.Element {
    return (
      <List data-cy="files-list">
        {mountedFiles.map((file, idx) => {
          return (
            <FileListItem
              setUnsafeDeletionFile={setUnsafeDeletionFile}
              loginState={loginState}
              key={`list-item-${idx}`}
              fileInfo={file}
              index={idx}
              downloadVideoFile={downloadVideoFile}
              safelyDeleteFileFromServer={safelyDeleteFileFromServer}
            />
          );
        })}
      </List>
    );
  }

  function renderFooter(): JSX.Element {
    return (
      <div>
        {totalSpaceUsedInMb < 1000
          ? totalSpaceUsedInMb.toFixed(2) + " MB Used"
          : (totalSpaceUsedInMb / 1000).toFixed(2) + " GB Used"}
      </div>
    );
  }

  if (!loginState) {
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
      {unsafeDeletionFile ? (
        <Dialog
          data-cy="warn-file-deletion-dialog"
          maxWidth="sm"
          fullWidth={true}
          open={Boolean(unsafeDeletionFile)}
        >
          <DialogTitle>
            Are you sure you&apos;d like to delete this file?
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              We were unable to determine if this file is currently in use.
            </DialogContentText>
          </DialogContent>
          <DialogContent>
            <Button
              data-cy="warn-yes"
              onClick={() => {
                directlyRemoveFileFromServer(unsafeDeletionFile.fileName);
                setUnsafeDeletionFile(undefined);
              }}
            >
              Yes
            </Button>
            <Button
              data-cy="warn-no"
              onClick={() => {
                setUnsafeDeletionFile(undefined);
              }}
            >
              No
            </Button>
          </DialogContent>
        </Dialog>
      ) : undefined}
    </div>
  );
}

export default FileManager;
