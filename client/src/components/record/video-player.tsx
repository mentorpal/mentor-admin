/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState, useRef } from "react";
import ReactPlayer from "react-player";
import {
  Button,
  Slider,
  CircularProgress,
  Typography,
  Dialog,
  DialogContent,
  TextField,
} from "@mui/material";
import overlay from "images/face-position-white.png";
import VideoRecorder from "./video-recorder";
import { equals } from "helpers";
import { User, UseWithRecordState } from "types";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import { useWithImage } from "hooks/graphql/use-with-image";
import { useWithConfig } from "store/slices/config/useWithConfig";

function VideoPlayer(props: {
  classes: Record<string, string>;
  recordState: UseWithRecordState;
  videoRecorderMaxLength: number;
  stopRequests: number;
  accessToken: string;
  user: User;
  windowWidth: number;
  windowHeight: number;
}): JSX.Element {
  const { getData } = useActiveMentor();
  const isAdvanced: boolean = getData((m) => m.data?.isAdvanced || false);
  const isVirtualBgMentor: boolean = getData(
    (m) => m.data?.hasVirtualBackground || false
  );
  const { state: configState } = useWithConfig();
  const virtualBackgroundUrl: string =
    getData((m) => m.data?.virtualBackgroundUrl) ||
    configState.config?.defaultVirtualBackground ||
    "";

  const reactPlayerRef = useRef<ReactPlayer>(null);
  const [trim, setTrim] = useState([0, 100]);
  const [trimInProgress, setTrimInProgress] = useState<boolean>(false);
  const [videoLength, setVideoLength] = useState<number>(0);
  const { aspectRatio: vbgAspectRatio } = useWithImage(virtualBackgroundUrl);

  const { classes, recordState, windowHeight, windowWidth } = props;
  const height =
    windowHeight > windowWidth
      ? windowWidth * (3 / 4)
      : Math.max(windowHeight - 470, 300);
  const width =
    windowHeight > windowWidth
      ? windowWidth
      : Math.max(windowHeight - 470, 300) * (4 / 3);
  const upload = recordState.uploads.find(
    (u) => u.question === recordState.curAnswer?.answer.question
  );
  const isCancelling = upload ? upload.isCancelling : false;
  const isUploading = recordState.curAnswer?.isUploading;
  const isTrimming =
    isFinite(videoLength) && !(trim[0] === 0 && trim[1] === 100);
  type StartAndEnd = [number, number];
  const [editUrl, setEditUrl] = useState<boolean>(false);

  React.useEffect(() => {
    setVideoLength(0);
    setTrim([0, 100]);
  }, [recordState.curAnswer?.videoSrc, recordState.curAnswer?.answer._id]);

  function sliderToVideoDuration(): number[] | undefined {
    if (!reactPlayerRef?.current) {
      return undefined;
    }
    if (!isFinite(videoLength)) {
      setVideoLength(reactPlayerRef.current.getDuration());
      return undefined;
    }
    const startTime = (trim[0] / 100) * videoLength;
    const endTime = (trim[1] / 100) * videoLength;
    return [startTime, endTime];
  }

  function sliderText(value: number, index: number): string {
    const duration = sliderToVideoDuration();
    if (!duration) {
      return "";
    }
    return new Date(duration[index] * 1000).toISOString().substr(14, 5);
  }

  function onVideoProgress(state: { played: number }): void {
    if (!reactPlayerRef?.current) {
      return;
    }
    const duration = sliderToVideoDuration();
    if (duration && state.played >= trim[1] / 100 && !trimInProgress) {
      reactPlayerRef.current.seekTo(duration[0]);
    }
  }

  function onUpdateTrim(newTrimValues: StartAndEnd): void {
    if (!trimInProgress) setTrimInProgress(true);
    if (!reactPlayerRef?.current || equals(trim, newTrimValues)) {
      return;
    }
    const duration = sliderToVideoDuration();
    if (duration) {
      reactPlayerRef.current.seekTo(
        duration[newTrimValues[1] !== trim[1] ? 1 : 0]
      );
      setTrim(newTrimValues);
    }
  }

  return (
    <div
      className={classes.block}
      style={{
        marginLeft: "auto",
        marginRight: "auto",
        height: "100%",
        width: width,
        paddingBottom: 0,
        paddingTop: 0,
      }}
    >
      <VideoRecorder
        classes={classes}
        height={height}
        width={width}
        virtualBackgroundUrl={virtualBackgroundUrl}
        recordState={recordState}
        isVirtualBgMentor={isVirtualBgMentor}
        videoRecorderMaxLength={props.videoRecorderMaxLength}
        stopRequests={props.stopRequests}
      />
      <div
        style={{
          position: "relative",
          visibility:
            recordState.curAnswer?.videoSrc || isUploading
              ? "visible"
              : "hidden",
        }}
      >
        <Typography
          data-cy="warning"
          style={{
            textAlign: "center",
            visibility:
              Math.round(videoLength) <
              (recordState.curAnswer?.minVideoLength || 0)
                ? "inherit"
                : "hidden",
          }}
        >
          Video should be {recordState.curAnswer?.minVideoLength} seconds long
          but is only {videoLength} seconds long.
        </Typography>
        <div
          style={{
            backgroundColor: "black",
            height: height,
            width: width,
            color: "white",
            position: "relative",
          }}
        >
          <div
            data-cy="upload-in-progress-notifier"
            style={{
              width: "100%",
              height: "100%",
              textAlign: "center",
              position: "absolute",
              justifyContent: "center",
              top: "25%",
              visibility: isUploading ? "visible" : "hidden",
            }}
          >
            <CircularProgress />
            <p></p>
            {isCancelling ? "Cancelling your upload." : "Upload in progress"}
            <p></p>
            {!isCancelling
              ? "You may continue to record other questions."
              : undefined}
          </div>
          <ReactPlayer
            data-cy="video-player"
            ref={reactPlayerRef}
            config={{
              file: { attributes: { crossOrigin: "true" } },
            }}
            url={recordState.curAnswer?.videoSrc}
            controls={true}
            playing={
              Boolean(recordState.curAnswer?.videoSrc) &&
              !isUploading &&
              !trimInProgress
            }
            height={height}
            width={width}
            playsinline
            webkit-playsinline="true"
            progressInterval={100}
            onProgress={onVideoProgress}
            onDuration={(d) => setVideoLength(d)}
            style={
              isVirtualBgMentor
                ? {
                    backgroundImage: `url(${virtualBackgroundUrl})`,
                    backgroundSize:
                      vbgAspectRatio >= 1.33333 ? "auto 100%" : "100% auto",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                    visibility: isUploading ? "hidden" : "inherit",
                  }
                : {
                    visibility: isUploading ? "hidden" : "inherit",
                  }
            }
          />
        </div>
        <div
          data-cy="outline"
          className={classes.overlay}
          style={{
            width: width,
            height: height,
            position: "absolute",
            top: 25,
            bottom: 0,
            left: 0,
            right: 0,
            opacity: recordState.isRecording ? 0.5 : 0.75,
            visibility: trimInProgress ? "visible" : "hidden",
            backgroundImage: `url(${overlay})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
            backgroundSize: "contain",
          }}
        />
        <Slider
          data-cy="slider"
          valueLabelDisplay="on"
          valueLabelFormat={(x) => {
            if (!isFinite(videoLength)) {
              return x;
            }
            const seconds = (x / 100) * videoLength;
            const date = new Date(0);
            date.setSeconds(seconds);
            return date.toISOString().substr(15, 4);
          }}
          aria-labelledby="range-slider"
          getAriaValueText={sliderText}
          value={trim}
          onChange={(e, v) => {
            if (Array.isArray(v) && v.length === 2) onUpdateTrim([v[0], v[1]]);
          }}
          onChangeCommitted={() => {
            setTrimInProgress(false);
          }}
          disabled={isUploading}
          style={{
            visibility: recordState.curAnswer?.videoSrc ? "visible" : "hidden",
          }}
        />
        <div className={classes.row} style={{ justifyContent: "center" }}>
          <Button
            data-cy="rerecord-video"
            variant="outlined"
            color="primary"
            disableElevation
            disabled={isUploading}
            className={classes.button}
            onClick={recordState.rerecord}
            style={{ marginRight: 15 }}
          >
            Re-Record
          </Button>
          <Button
            data-cy="upload-video"
            variant="contained"
            color="primary"
            disableElevation
            disabled={
              isUploading
                ? true
                : isTrimming
                ? false
                : !recordState.curAnswer?.recordedVideo
            }
            className={classes.button}
            onClick={() => {
              recordState.uploadVideo(
                isTrimming
                  ? {
                      start: (trim[0] / 100) * videoLength,
                      end: (trim[1] / 100) * videoLength,
                    }
                  : undefined
              );
            }}
            style={{ marginRight: 15 }}
          >
            {isUploading
              ? "Processing"
              : isTrimming
              ? "Trim Video"
              : "Upload Video"}
          </Button>
          {isAdvanced && recordState.curAnswer?.videoSrc ? (
            <Button
              data-cy="video-url-btn"
              variant="outlined"
              color="primary"
              disableElevation
              disabled={recordState.isUpdatingUrl}
              className={classes.button}
              onClick={() => setEditUrl(true)}
              style={{ marginRight: 15 }}
            >
              Set URL
            </Button>
          ) : null}
          <Button
            data-cy="download-video"
            variant="contained"
            color="primary"
            disableElevation
            disabled={recordState.isDownloadingVideo}
            className={classes.button}
            onClick={recordState.downloadCurAnswerVideo}
            style={{ marginRight: 15 }}
          >
            Download
          </Button>
        </div>
      </div>
      <EditUrlDialog
        isOpen={editUrl}
        setIsOpen={setEditUrl}
        recordState={recordState}
      />
    </div>
  );
}

function EditUrlDialog(props: {
  recordState: UseWithRecordState;
  isOpen: boolean;
  setIsOpen: (tf: boolean) => void;
}): JSX.Element {
  const { recordState, isOpen, setIsOpen } = props;
  const [webUrl, setWebUrl] = useState<string>();
  const [mobileUrl, setMobileUrl] = useState<string>();
  const [transWebUrl, setTransWebUrl] = useState<string>();
  const [transMobileUrl, setTransMobileUrl] = useState<string>();

  return (
    <Dialog
      maxWidth="sm"
      fullWidth={true}
      open={Boolean(recordState?.isUpdatingUrl || isOpen)}
    >
      <DialogContent>
        {recordState?.isUpdatingUrl ? (
          <div>
            <Typography>Updating answer url...</Typography>
            <CircularProgress />
          </div>
        ) : (
          <div>
            <TextField
              fullWidth
              variant="outlined"
              label="Web Url"
              placeholder="Web Url"
              value={
                webUrl ||
                recordState.curAnswer?.answer?.media?.find(
                  (m) => m.type === "video" && m.tag === "web"
                )?.url
              }
              onChange={(e) => setWebUrl(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              fullWidth
              variant="outlined"
              label="Transparent Web Url"
              placeholder="Transparent Web Url"
              value={
                transWebUrl ||
                recordState.curAnswer?.answer?.media?.find(
                  (m) => m.type === "video" && m.tag === "web"
                )?.transparentVideoUrl
              }
              style={{ marginTop: 10 }}
              onChange={(e) => setTransWebUrl(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              fullWidth
              variant="outlined"
              label="Mobile Url"
              placeholder="Mobile Url"
              value={
                mobileUrl ||
                recordState.curAnswer?.answer?.media?.find(
                  (m) => m.type === "video" && m.tag === "mobile"
                )?.url
              }
              style={{ marginTop: 10 }}
              onChange={(e) => setMobileUrl(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              fullWidth
              variant="outlined"
              label="Transparent Mobile Url"
              placeholder="Transparent Mobile Url"
              value={
                transMobileUrl ||
                recordState.curAnswer?.answer?.media?.find(
                  (m) => m.type === "video" && m.tag === "mobile"
                )?.transparentVideoUrl
              }
              style={{ marginTop: 10 }}
              onChange={(e) => setTransMobileUrl(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </div>
        )}
      </DialogContent>
      <DialogContent>
        <Button
          disabled={recordState?.isUpdatingUrl}
          onClick={() => {
            setIsOpen(false);
          }}
        >
          Close
        </Button>
        <Button
          disabled={recordState?.isUpdatingUrl}
          onClick={() => {
            recordState.updateUrl(
              webUrl,
              mobileUrl,
              transWebUrl,
              transMobileUrl
            );
            setIsOpen(false);
          }}
        >
          Save
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export default VideoPlayer;
