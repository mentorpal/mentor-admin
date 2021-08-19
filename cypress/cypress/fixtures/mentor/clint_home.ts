/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { MentorType, Status } from "../../support/types";

export const mentor = {
  _id: "clintanderson",
  thumbnail: "https://new.url/test.png",
  name: "Clinton Anderson",
  firstName: "Clint",
  title: "Nuclear Electrician's Mate",
  mentorType: MentorType.VIDEO,
  lastTrainedAt: "Today",
  isDirty: false,
  questions: [],
  subjects: [
    {
      _id: "background",
    },
    {
      _id: "repeat_after_me",
    },
  ],
  topics: [],
  answers: [
    {
      _id: "A1_1_1",
      question: {
        _id: "A1_1_1",
      },
      transcript:
        "My name is Clint Anderson and I'm a Nuclear Electrician's Mate",
      status: Status.COMPLETE,
    },
    {
      _id: "A2_1_1",
      question: {
        _id: "A2_1_1",
      },
      transcript: "I'm 37 years old",
      status: Status.COMPLETE,
    },
    {
      _id: "A3_1_1",
      question: {
        _id: "A3_1_1",
      },
      media: [{ url: "video.mp4", tag: "idle", type: "video" }],
      transcript: "",
      status: Status.COMPLETE,
    },
    {
      _id: "A4_1_1",
      question: {
        _id: "A4_1_1",
      },
      transcript: "My name is Clint Anderson I'm a Nuclear Electrician's Mate",
      status: Status.COMPLETE,
    },
    {
      _id: "A5_1_1",
      question: {
        _id: "A5_1_1",
      },
      transcript: "",
      status: Status.INCOMPLETE,
    },
  ],
};
export default mentor;
