/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { ChangeEvent, useState } from "react";
import {
  Typography,
  Select,
  MenuItem,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@material-ui/core";
import { Mentor, MentorType } from "types";
import { Slide } from "./slide";
import { getFileSizeInMb } from "helpers";
import { uploadVbg } from "api";
import { LoadingDialog } from "components/dialog";
import { useWithBrowser } from "hooks/use-with-browser";

export function MentorTypeSlide(props: {
  classes: Record<string, string>;
  mentor?: Mentor;
  isMentorLoading: boolean;
  virtualBackgroundUrls: string[];
  defaultVirtualBackground: string;
  accessToken: string;
  uploadLambdaEndpoint: string;
  editMentor: (edits: Partial<Mentor>) => void;
}): JSX.Element {
  const {
    classes,
    mentor,
    isMentorLoading,
    editMentor,
    virtualBackgroundUrls,
    defaultVirtualBackground,
    accessToken,
    uploadLambdaEndpoint,
  } = props;
  const [backgroundDialogOpen, setBackgroundDialogOpen] =
    useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [uploadInProgress, setUploadInProgress] = useState<boolean>(false);
  const { browserSupportsVbg } = useWithBrowser();

  if (!mentor || isMentorLoading) {
    return <div />;
  }

  const handleCheckboxChange = (e: ChangeEvent<HTMLInputElement>) => {
    editMentor({ hasVirtualBackground: e.target.checked });
  };

  const imageThumbnailStyling = {
    width: "200px",
    height: "auto",
  };

  const currentlyEnabledBackground =
    mentor.virtualBackgroundUrl || defaultVirtualBackground;

  const handleVbgUpload = (file: File) => {
    const mbFileSize = getFileSizeInMb(file);
    if (mbFileSize > 5.5) {
      // AWS lambda max payload is 6 mb
      setErrorMessage("Error: Image size must be less that 5.5 mb");
      return;
    } else {
      setErrorMessage("");
      setUploadInProgress(true);
      uploadVbg(mentor._id, file, accessToken, uploadLambdaEndpoint)
        .then((vbgUrl) => {
          setUploadInProgress(false);
          editMentor({ virtualBackgroundUrl: vbgUrl });
        })
        .catch((err) => {
          setUploadInProgress(false);
          setErrorMessage("Failed to upload image");
          console.error(err);
        });
    }
  };

  return (
    <Slide
      classes={classes}
      title="Pick a mentor type."
      content={
        <div>
          <Select
            data-cy="select-chat-type"
            value={mentor.mentorType || MentorType.VIDEO}
            style={{ width: 100, marginRight: 20 }}
            onChange={(
              event: React.ChangeEvent<{
                name?: string;
                value: unknown;
              }>
            ) => {
              editMentor({ mentorType: event.target.value as MentorType });
            }}
          >
            <MenuItem data-cy="chat" value={MentorType.CHAT}>
              Chat
            </MenuItem>
            <MenuItem data-cy="video" value={MentorType.VIDEO}>
              Video
            </MenuItem>
          </Select>

          {mentor.mentorType === MentorType.VIDEO ? (
            <div data-cy="virtual-background-checkbox">
              {mentor.hasVirtualBackground && !browserSupportsVbg() ? (
                <div
                  style={{ color: "darkred", margin: "20px" }}
                  data-cy="unsupported-browser-warning"
                >
                  WARNING: Your browser does not support virtual backgrounds.
                  Please use Chrome, Edge, or Opera, or turn off virtual
                  background use.
                </div>
              ) : undefined}
              <label>
                <input
                  disabled={
                    !mentor.hasVirtualBackground && !browserSupportsVbg()
                  }
                  defaultChecked={mentor.hasVirtualBackground}
                  onChange={handleCheckboxChange}
                  type="checkbox"
                />
                <span style={{ color: "blue" }}>Beta: </span>Use Virtual
                Background?
                <br />
                <br />
                {!mentor.hasVirtualBackground && !browserSupportsVbg() ? (
                  <span style={{ color: "darkred" }}>
                    Note: Your browser does not support virtual backgrounds. If
                    you&apos;d like to use a virtual background, please use
                    Chrome, Edge, or Opera.
                  </span>
                ) : (
                  ""
                )}
              </label>
            </div>
          ) : undefined}

          {mentor.mentorType === MentorType.VIDEO &&
          mentor.hasVirtualBackground ? (
            <span
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div>
                <img
                  style={{ width: "200px", height: "auto" }}
                  src={currentlyEnabledBackground}
                />
              </div>
              <Button
                onClick={() => {
                  setBackgroundDialogOpen(true);
                }}
              >
                change background
              </Button>
              <input
                data-cy="upload-file"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (!e.target.files?.length) {
                    return;
                  } else {
                    handleVbgUpload(e.target.files[0]);
                  }
                }}
              />
              <span style={{ color: "red", margin: "5px" }}>
                {errorMessage}
              </span>
            </span>
          ) : undefined}

          <Typography style={{ marginTop: 15 }}>
            {mentor.mentorType === MentorType.CHAT
              ? "Make a text-only mentor that responds with chat bubbles."
              : mentor.mentorType === MentorType.VIDEO
              ? "Make a video mentor that responds with pre-recorded video answers."
              : ""}
          </Typography>

          <Dialog
            open={true}
            style={{ visibility: backgroundDialogOpen ? "visible" : "hidden" }}
            maxWidth="sm"
            fullWidth={true}
          >
            <DialogTitle>Select your virtual background</DialogTitle>
            <DialogContent>
              <>
                <div>
                  {virtualBackgroundUrls.map((url) => {
                    return (
                      <img
                        key={`${url}`}
                        style={{
                          ...imageThumbnailStyling,
                          cursor: "pointer",
                          border:
                            url === currentlyEnabledBackground
                              ? "4px solid green"
                              : "",
                          margin: "5px",
                        }}
                        onClick={() => {
                          editMentor({ virtualBackgroundUrl: url });
                        }}
                        src={url}
                      />
                    );
                  })}
                </div>
                <Button
                  onClick={() => {
                    setBackgroundDialogOpen(false);
                  }}
                >
                  Close
                </Button>
              </>
            </DialogContent>
          </Dialog>
          <LoadingDialog title={uploadInProgress ? "Uploading..." : ""} />
        </div>
      }
    />
  );
}
