import { Connection, Subject } from "../support/types";

export const subjects: Connection<Subject> = {
  edges: [
    {
      cursor: "",
      node: {
        _id: "repeat_after_me",
        name: "Repeat After Me",
        description: "These are miscellaneous phrases you'll be asked to repeat.",
      }
    },
    {
      cursor: "",
      node: {
        _id: "background",
        name: "Background",
        description: "These questions will ask general questions about your background that might be relevant to how people understand your career.",
      }
    },
    {
      cursor: "",
      node: {
        _id: "stem",
        name: "STEM",
        description: "These questions will ask about STEM careers.",
      }
    },
    {
      cursor: "",
      node: {
        _id: "leadership",
        name: "Leadership",
        description: "These questions will ask about being in a leadership role.",
      }
    }
  ],
  pageInfo: {
    startCursor: null,
    endCursor: null,
    hasNextPage: false,
    hasPreviousPage: false,
  }
}
export default subjects;