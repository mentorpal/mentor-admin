/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Connection, Topic } from "../support/types";

export const topics: Connection<Topic> = {
  edges: [
    {
      cursor: "",
      node: {
        _id: "background",
        name: "Background",
        description:
          "These questions will ask general questions about your background, that might be relevant to how people understand your career",
      },
    },
    {
      cursor: "",
      node: {
        _id: "advice",
        name: "Advice",
        description:
          "These questions will ask you to give some general advice to newcomers interested in entering into your field",
      },
    },
    {
      cursor: "",
      node: {
        _id: "idle",
        name: "Idle",
        description: "30-second idle clip",
      },
    },
    {
      cursor: "",
      node: {
        _id: "intro",
        name: "Intro",
        description: "Short introduction about you",
      },
    },
    {
      cursor: "",
      node: {
        _id: "off_topic",
        name: "Off-Topic",
        description:
          "Short responses to off-topic questions you do not have answers for or do not understand",
      },
    },
  ],
  pageInfo: {
    startCursor: null,
    endCursor: null,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

export default topics;
