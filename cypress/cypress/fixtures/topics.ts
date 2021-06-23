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
