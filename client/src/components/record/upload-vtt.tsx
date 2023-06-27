/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Button, CircularProgress, Typography } from "@mui/material";
import { fetchVideoBlobFromUrl, uploadVtt } from "api";
import { LoadingDialog, LongTextDisplayDialog } from "components/dialog";
import { extractErrorMessageFromError, getFileSizeInMb } from "helpers";
import React, { useEffect, useState } from "react";
import { useWithConfig } from "store/slices/config/useWithConfig";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import { makeStyles } from "tss-react/mui";
import { Answer, JobState, Media, Mentor } from "types";

const useStyles = makeStyles({ name: { UploadVtt } })(() => ({
  toolbar: {
    minHeight: 64,
  },
  root: {
    display: "flex",
    flexDirection: "column",
  },
  block: {
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 75,
    paddingRight: 75,
    textAlign: "left",
  },
}));

export function UploadVtt(props: {
  accessToken: string;
  curAnswer: Answer;
  editAnswer: (edits: Partial<Answer>) => void;
}): JSX.Element {
  const { classes } = useStyles();
  const { getData } = useActiveMentor();
  const { state: configState } = useWithConfig();

  const mentor: Mentor = getData((m) => m.data);
  const { accessToken, curAnswer, editAnswer } = props;
  const { question: questionId } = curAnswer;
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [downloadInProgress, setDownloadInProgress] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<JobState>(JobState.NONE);
  const vttMedia = (curAnswer.media || []).find((m) => m.type === "subtitles");

  const [vttText, setVttText] = useState("");
  const [showVttPreview, setShowVttPreview] = useState(false);

  useEffect(() => {
    if (!vttMedia || !vttMedia.url) {
      setVttText("");
      return;
    }
    fetch(vttMedia.url)
      .then((response) => {
        response.text().then((text) => {
          setVttText(text);
        });
      })
      .catch((err) => {
        console.error(
          `Failed to fetch vtt for preview: ${extractErrorMessageFromError(
            err
          )}`
        );
      });
  }, [vttMedia]);

  const handleVttUpload = (file: File) => {
    if (!configState.config) {
      setErrorMessage("No config state available");
      return;
    }
    if (!accessToken) {
      setErrorMessage("No access token available for authentication.");
      return;
    }
    const mbFileSize = getFileSizeInMb(file);
    if (mbFileSize > 5.5) {
      // AWS lambda max payload is 6 mb
      setErrorMessage("Error: file size must be less that 5.5 mb");
      return;
    } else {
      setErrorMessage("");
      setUploadStatus(JobState.IN_PROGRESS);
      uploadVtt(
        mentor._id,
        questionId,
        file,
        accessToken,
        configState.config.uploadLambdaEndpoint
      )
        .then((vttUrl) => {
          setUploadStatus(JobState.SUCCESS);
          editAnswer({
            media: curAnswer.media?.map((m) => {
              if (m.type === "subtitles") {
                return {
                  ...m,
                  url: vttUrl,
                };
              }
              return m;
            }),
          });
        })
        .catch((err) => {
          setUploadStatus(JobState.FAILURE);
          setErrorMessage(
            `Failed to upload vtt: ${extractErrorMessageFromError(err)}`
          );
          console.error(err);
        });
    }
  };

  function handlePreviewVttFile() {
    setShowVttPreview(true);
  }

  function handleDownloadVttFile(vttMedia: Media) {
    downloadVttFile(vttMedia.url);
  }

  function downloadVttFile(vttUrl: string): void {
    setDownloadInProgress(true);
    fetchVideoBlobFromUrl(vttUrl)
      .then((vttBlob) => {
        const blobUrl = URL.createObjectURL(vttBlob);
        const link = document.createElement("a");
        link.setAttribute("href", blobUrl);
        link.setAttribute("download", `en.vtt`);
        link.click();
      })
      .finally(() => {
        setDownloadInProgress(false);
      });
  }

  return (
    <div
      className={classes.block}
      style={{ display: "flex", flexDirection: "column" }}
    >
      <Typography fontWeight="bold" align="left">
        VTT (Transcript) File
      </Typography>
      <span style={{ margin: "5px" }}>Upload New Vtt File</span>
      <span style={{ color: "red", margin: "5px" }}>{errorMessage}</span>
      <input
        style={{ margin: 5 }}
        data-cy="upload-vtt-file"
        type="file"
        accept=".vtt"
        onChange={(e) => {
          if (!e.target.files?.length) {
            return;
          } else {
            handleVttUpload(e.target.files[0]);
          }
        }}
      />
      {vttMedia && vttMedia.url ? (
        <>
          {downloadInProgress ? (
            <CircularProgress />
          ) : (
            <Button
              style={{ width: "fit-content", margin: 5 }}
              onClick={() => handleDownloadVttFile(vttMedia)}
            >
              Download Vtt File
            </Button>
          )}
        </>
      ) : undefined}
      {vttText ? (
        <Button
          style={{ width: "fit-content", margin: 5 }}
          onClick={handlePreviewVttFile}
        >
          Preview Vtt File
        </Button>
      ) : undefined}
      <LoadingDialog
        title={uploadStatus === JobState.IN_PROGRESS ? "Uploading..." : ""}
      />
      <LongTextDisplayDialog
        text={vttText}
        open={showVttPreview}
        closeDialog={() => setShowVttPreview(false)}
      />
    </div>
  );
}
