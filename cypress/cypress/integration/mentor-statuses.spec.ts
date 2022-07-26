/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { cySetup, cyMockDefault } from "../support/functions";
import {
  MentorType,
  QuestionType,
  Status,
  SubjectTypes,
  UtteranceName,
} from "../support/types";
import { status1 } from "../fixtures/mentor";

describe("My Mentor Card", () => {
  it("It needs intro: intro is INCOMPLETE", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: {
        ...status1,
        answers: [
          {
            _id: "A4_1_1",
            question: {
              _id: "A4_1_1",
              clientId: "C4_1_1",
              question:
                "Please give a short introduction of yourself, which includes your name, current job, and title.",
              type: QuestionType.UTTERANCE,
              name: UtteranceName.INTRO,
              paraphrases: [],
            },
            webMedia: { url: "video.mp4", tag: "intro", type: "video" },
            transcript:
              "My name is Clint Anderson I'm a Nuclear Electrician's Mate",
            status: Status.INCOMPLETE,
          },
        ],
      },
    });
    cy.visit("/");
    cy.get("[data-cy=recommended-action-reason]").contains(
      "Your mentor's introduction is what they say when a user starts."
    );
  });
  it("It needs intro: intro is missing video", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: {
        ...status1,
        answers: [
          {
            _id: "A4_1_1",
            question: {
              _id: "A4_1_1",
              clientId: "C4_1_1",
              question:
                "Please give a short introduction of yourself, which includes your name, current job, and title.",
              type: QuestionType.UTTERANCE,
              name: UtteranceName.INTRO,
              paraphrases: [],
            },
            transcript:
              "My name is Clint Anderson I'm a Nuclear Electrician's Mate",
            status: Status.NONE,
          },
        ],
      },
    });
    cy.visit("/");
    cy.get("[data-cy=recommended-action-reason]").contains(
      "Your mentor's introduction is what they say when a user starts."
    );
  });
  it("It needs intro: intro is missing transcript", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: {
        ...status1,
        answers: [
          {
            _id: "A4_1_1",
            question: {
              _id: "A4_1_1",
              clientId: "C4_1_1",
              question:
                "Please give a short introduction of yourself, which includes your name, current job, and title.",
              type: QuestionType.UTTERANCE,
              name: UtteranceName.INTRO,
              paraphrases: [],
            },
            webMedia: { url: "video.mp4", tag: "intro", type: "video" },
            transcript: "",
            status: Status.NONE,
          },
        ],
      },
    });
    cy.visit("/");
    cy.get("[data-cy=recommended-action-reason]").contains(
      "Your mentor's introduction is what they say when a user starts."
    );
  });

  it("It needs IDLE video: idle is INCOMPLETE", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: {
        ...status1,
        answers: [
          {
            _id: "A3_1_1",
            question: {
              _id: "A3_1_1",
              clientId: "C3_1_1",
              question:
                "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.",
              type: QuestionType.UTTERANCE,
              name: UtteranceName.IDLE,
              paraphrases: [],
            },
            media: [{ url: "video.mp4", tag: "idle", type: "video" }],
            transcript: "",
            status: Status.INCOMPLETE,
          },
          {
            _id: "A4_1_1",
            question: {
              _id: "A4_1_1",
              clientId: "C4_1_1",
              question:
                "Please give a short introduction of yourself, which includes your name, current job, and title.",
              type: QuestionType.UTTERANCE,
              name: UtteranceName.INTRO,
              paraphrases: [],
            },
            webMedia: { url: "video.mp4", tag: "intro", type: "video" },
            transcript:
              "My name is Clint Anderson I'm a Nuclear Electrician's Mate",
            status: Status.COMPLETE,
          },
        ],
      },
    });
    cy.visit("/");
    cy.get("[data-cy=recommended-action-reason]").contains(
      "Users see your idle video while typing a question"
    );
  });
  it("It needs IDLE video: idle is missing video", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: {
        ...status1,
        answers: [
          {
            _id: "A3_1_1",
            question: {
              _id: "A3_1_1",
              clientId: "C3_1_1",
              question:
                "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.",
              type: QuestionType.UTTERANCE,
              name: UtteranceName.IDLE,
              paraphrases: [],
            },
            transcript: "",
            status: Status.NONE,
          },
          {
            _id: "A4_1_1",
            question: {
              _id: "A4_1_1",
              clientId: "C4_1_1",
              question:
                "Please give a short introduction of yourself, which includes your name, current job, and title.",
              type: QuestionType.UTTERANCE,
              name: UtteranceName.INTRO,
              paraphrases: [],
            },
            webMedia: { url: "video.mp4", tag: "intro", type: "video" },
            transcript:
              "My name is Clint Anderson I'm a Nuclear Electrician's Mate",
            status: Status.NONE,
          },
        ],
      },
    });
    cy.visit("/");
    cy.get("[data-cy=recommended-action-reason]").contains(
      "Users see your idle video while typing a question"
    );
  });

  it("It needs off topic: off topic is INCOMPLETE", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: {
        ...status1,
        answers: [
          {
            _id: "A4_1_1",
            question: {
              _id: "A4_1_1",
              clientId: "C4_1_1",
              question:
                "Please give a short introduction of yourself, which includes your name, current job, and title.",
              type: QuestionType.UTTERANCE,
              name: UtteranceName.INTRO,
              paraphrases: [],
            },
            webMedia: { url: "video.mp4", tag: "intro", type: "video" },
            transcript:
              "My name is Clint Anderson I'm a Nuclear Electrician's Mate",
            status: Status.COMPLETE,
          },
          {
            _id: "A3_1_1",
            question: {
              _id: "A3_1_1",
              clientId: "C3_1_1",
              question:
                "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.",
              type: QuestionType.UTTERANCE,
              name: UtteranceName.IDLE,
              paraphrases: [],
            },
            webMedia: { url: "video.mp4", tag: "intro", type: "video" },
            transcript: "",
            status: Status.COMPLETE,
          },
          {
            _id: "A5_1_1",
            question: {
              _id: "A5_1_1",
              clientId: "C5_1_1",
              question:
                "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'",
              type: QuestionType.UTTERANCE,
              name: UtteranceName.OFF_TOPIC,
              paraphrases: [],
            },
            webMedia: { url: "video.mp4", tag: "off_topic", type: "video" },
            transcript: "",
            status: Status.INCOMPLETE,
          },
        ],
      },
    });
    cy.visit("/");
    cy.get("[data-cy=recommended-action-reason]").contains(
      "The off topic response helps tell the user that the AI didn't understand their question."
    );
  });
  it("It needs off topic: off topic is missing transcript", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: {
        ...status1,
        answers: [
          {
            _id: "A4_1_1",
            question: {
              _id: "A4_1_1",
              clientId: "C4_1_1",
              question:
                "Please give a short introduction of yourself, which includes your name, current job, and title.",
              type: QuestionType.UTTERANCE,
              name: UtteranceName.INTRO,
              paraphrases: [],
            },
            webMedia: { url: "video.mp4", tag: "intro", type: "video" },
            transcript:
              "My name is Clint Anderson I'm a Nuclear Electrician's Mate",
            status: Status.NONE,
          },
          {
            _id: "A3_1_1",
            question: {
              _id: "A3_1_1",
              clientId: "C3_1_1",
              question:
                "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.",
              type: QuestionType.UTTERANCE,
              name: UtteranceName.IDLE,
              paraphrases: [],
            },
            webMedia: { url: "video.mp4", tag: "idle", type: "video" },
            transcript: "",
            status: Status.NONE,
          },
          {
            _id: "A5_1_1",
            question: {
              _id: "A5_1_1",
              clientId: "C5_1_1",
              question:
                "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'",
              type: QuestionType.UTTERANCE,
              name: UtteranceName.OFF_TOPIC,
              paraphrases: [],
            },
            webMedia: { url: "video.mp4", tag: "off_topic", type: "video" },
            transcript: "",
            status: Status.NONE,
          },
        ],
      },
    });
    cy.visit("/");
    cy.get("[data-cy=recommended-action-reason]").contains(
      "The off topic response helps tell the user that the AI didn't understand their question."
    );
  });
  it("It needs off topic: off topic is missing video", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: {
        ...status1,
        answers: [
          {
            _id: "A4_1_1",
            question: {
              _id: "A4_1_1",
              clientId: "C4_1_1",
              question:
                "Please give a short introduction of yourself, which includes your name, current job, and title.",
              type: QuestionType.UTTERANCE,
              name: UtteranceName.INTRO,
              paraphrases: [],
            },
            webMedia: { url: "video.mp4", tag: "intro", type: "video" },
            transcript:
              "My name is Clint Anderson I'm a Nuclear Electrician's Mate",
            status: Status.NONE,
          },
          {
            _id: "A3_1_1",
            question: {
              _id: "A3_1_1",
              clientId: "C3_1_1",
              question:
                "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.",
              type: QuestionType.UTTERANCE,
              name: UtteranceName.IDLE,
              paraphrases: [],
            },
            webMedia: { url: "video.mp4", tag: "idle", type: "video" },
            transcript: "",
            status: Status.NONE,
          },
          {
            _id: "A5_1_1",
            question: {
              _id: "A5_1_1",
              clientId: "C5_1_1",
              question:
                "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'",
              type: QuestionType.UTTERANCE,
              name: UtteranceName.OFF_TOPIC,
              paraphrases: [],
            },
            transcript:
              "'I couldn't understand the question. Try asking me something else.'",
            status: Status.NONE,
          },
        ],
      },
    });
    cy.visit("/");
    cy.get("[data-cy=recommended-action-reason]").contains(
      "The off topic response helps tell the user that the AI didn't understand their question."
    );
  });

  it("It needs subject", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: {
        ...status1,
        subjects: [
          {
            _id: "idle_and_initial_recordings",
            name: "Idle and Initial Recordings",
            type: SubjectTypes.UTTERANCES,
            isRequired: true,
            description:
              "These are miscellaneous phrases you'll be asked to repeat.",
            categories: [
              {
                id: "category2",
                name: "Category2",
                description: "Another category",
              },
            ],
            topics: [],
            questions: [
              {
                question: {
                  _id: "A3_1_1",
                  clientId: "C3_1_1",
                  question:
                    "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.",
                  type: QuestionType.UTTERANCE,
                  name: UtteranceName.IDLE,
                  paraphrases: [],
                  mentorType: MentorType.VIDEO,
                  minVideoLength: 10,
                },
                topics: [],
              },
              {
                question: {
                  _id: "A4_1_1",
                  clientId: "C4_1_1",
                  question:
                    "Please give a short introduction of yourself, which includes your name, current job, and title.",
                  type: QuestionType.UTTERANCE,
                  name: UtteranceName.INTRO,
                  paraphrases: [],
                },
                topics: [],
              },
              {
                question: {
                  _id: "A5_1_1",
                  clientId: "C5_1_1",
                  question:
                    "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'",
                  type: QuestionType.UTTERANCE,
                  name: UtteranceName.OFF_TOPIC,
                  paraphrases: [],
                },
                topics: [],
              },
            ],
          },
        ],
      },
    });
    cy.visit("/");
    cy.get("[data-cy=recommended-action-reason]").contains(
      "Your mentor doesn't have any subject areas. Subjects give you sets of questions to record."
    );
  });
  it("Never Built", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: {
        ...status1,
        lastTrainedAt: "",
      },
    });
    cy.visit("/");
    cy.get("[data-cy=recommended-action-reason]").contains(
      "You've answered new questions since you last trained your mentor. Rebuild so you can preview."
    );
  });
  it("Answered less than 5 questions", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: {
        ...status1,
        answers: [
          {
            _id: "A4_1_1",
            question: {
              _id: "A4_1_1",
              clientId: "C4_1_1",
              question:
                "Please give a short introduction of yourself, which includes your name, current job, and title.",
              type: QuestionType.UTTERANCE,
              name: UtteranceName.INTRO,
              paraphrases: [],
            },
            webMedia: { url: "video.mp4", tag: "intro", type: "video" },
            transcript:
              "My name is Clint Anderson I'm a Nuclear Electrician's Mate",
            status: Status.NONE,
          },
          {
            _id: "A3_1_1",
            question: {
              _id: "A3_1_1",
              clientId: "C3_1_1",
              question:
                "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.",
              type: QuestionType.UTTERANCE,
              name: UtteranceName.IDLE,
              paraphrases: [],
            },
            webMedia: { url: "video.mp4", tag: "idle", type: "video" },
            transcript: "",
            status: Status.NONE,
          },
          {
            _id: "A5_1_1",
            question: {
              _id: "A5_1_1",
              clientId: "C5_1_1",
              question:
                "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'",
              type: QuestionType.UTTERANCE,
              name: UtteranceName.OFF_TOPIC,
              paraphrases: [],
            },
            webMedia: { url: "video.mp4", tag: "off_topic", type: "video" },
            transcript:
              "'I couldn't understand the question. Try asking me something else.'",
            status: Status.NONE,
          },
        ],
      },
    });
    cy.visit("/");
    cy.get("[data-cy=recommended-action-reason]").contains(
      "You need at least a few questions before you can make a mentor, even for testing."
    );
  });
});
