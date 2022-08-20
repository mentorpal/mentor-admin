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

export function MentorTypeSlide(props: {
  classes: Record<string, string>;
  mentor?: Mentor;
  isMentorLoading: boolean;
  virtualBackgroundUrls: string[];
  defaultVirtualBackground: string;
  editMentor: (edits: Partial<Mentor>) => void;
}): JSX.Element {
  const {
    classes,
    mentor,
    isMentorLoading,
    editMentor,
    virtualBackgroundUrls,
    defaultVirtualBackground,
  } = props;
  const [backgroundDialogOpen, setBackgroundDialogOpen] =
    useState<boolean>(false);

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
              <label>
                <input
                  defaultChecked={mentor.hasVirtualBackground}
                  onChange={handleCheckboxChange}
                  type="checkbox"
                />
                Use Virtual Background?
              </label>
            </div>
          ) : undefined}

          {mentor.hasVirtualBackground ? (
            <>
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
                Change virtual background?
              </Button>
            </>
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
        </div>
      }
    />
  );
}
