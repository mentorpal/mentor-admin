/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { Typography, Select, MenuItem } from "@material-ui/core";
import { MentorGQL } from "types-gql";
import { MentorType } from "types";
import { Slide } from "./slide";

export function MentorTypeSlide(props: {
  classes: Record<string, string>;
  mentor?: MentorGQL;
  isMentorLoading: boolean;
  editMentor: (edits: Partial<MentorGQL>) => void;
}): JSX.Element {
  const { classes, mentor, isMentorLoading, editMentor } = props;

  if (!mentor || isMentorLoading) {
    return <div />;
  }

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
          <Typography style={{ marginTop: 15 }}>
            {mentor.mentorType === MentorType.CHAT
              ? "Make a text-only mentor that responds with chat bubbles."
              : mentor.mentorType === MentorType.VIDEO
              ? "Make a video mentor that responds with pre-recorded video answers."
              : ""}
          </Typography>
        </div>
      }
    />
  );
}
