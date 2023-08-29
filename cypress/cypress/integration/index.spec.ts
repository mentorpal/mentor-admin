/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { cyMockDefault, mockGQL } from "../support/functions";
import newMentor from "../fixtures/mentor/clint_new";
import clint from "../fixtures/mentor/clint_home";
import clint3 from "../fixtures/mentor/clint_setup3";
import clint12 from "../fixtures/mentor/clint_setup12";
import { login as loginDefault } from "../fixtures/login";
import { QuestionType, Status, UserRole } from "../support/types";

export function taskListBuild(progressForAllTasks) {
  return {
    trimUploadTask: {
      task_name: "trim_upload",
      status: progressForAllTasks,
    },
    transcodeWebTask: {
      task_name: "transcode-web",
      status: progressForAllTasks,
    },
    tanscodeMobileTask: {
      task_name: "transcode-mobile",
      status: progressForAllTasks,
    },
    transcribeTask: {
      task_name: "transcribe",
      status: progressForAllTasks,
    },
  };
}

export function uploadTaskMediaBuild() {
  return {
    originalMedia: {
      type: "video",
      tag: "original",
      url: "http://google.mp4/original.mp4",
    },
    webMedia: {
      type: "video",
      tag: "web",
      url: "http://google.mp4",
    },
    mobileMedia: {
      type: "video",
      tag: "mobile",
      url: "http://google.mp4",
    },
    vttMedia: {
      type: "vtt",
      tag: "en",
      url: "http://google.mp4",
    },
  };
}

describe("Index page", () => {
  it("if not logged in, show login page", () => {
    cyMockDefault(cy, {
      noAccessTokenStored: true,
    });
    cy.visit("/");
    cy.location("pathname").then(($el) => {
      assert($el.replace("/admin", ""), "/");
    });
    cy.contains("Please sign in to access the Mentor Studio portal");
  });

  it("if logged in and setup not complete, redirect to setup page", () => {
    cyMockDefault(cy, {
      mentor: newMentor,
    });
    cy.visit("/");
    cy.location("pathname").then(($el) => {
      assert($el.replace("/admin", ""), "/setup");
    });
  });

  it("if logged in and setup complete, show home page", () => {
    cyMockDefault(cy, {
      mentor: clint,
    });

    cy.visit("/");
    cy.get("[data-cy=my-mentor-card]").should(
      "contain.text",
      "Clinton Anderson"
    );
  });

  it('admins see the "Users" option in hamburger menu', () => {
    cyMockDefault(cy, {
      mentor: [clint],
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.ADMIN },
      },
    });
    cy.visit("/");
    cy.get("[data-cy=setup-no]").trigger("mouseover").click();
    cy.get("[data-cy=select-subject]").should("exist");
    cy.get("[data-cy=menu-button]").trigger("mouseover").click();
    cy.get("[data-cy=Users-menu-button]").should("exist");
  });

  it('content managers can see the "Users" option in hamburger menu', () => {
    cyMockDefault(cy, {
      mentor: [clint],
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.CONTENT_MANAGER },
      },
    });
    cy.visit("/");
    cy.get("[data-cy=setup-no]").trigger("mouseover").click();
    cy.get("[data-cy=select-subject]").should("exist");
    cy.get("[data-cy=menu-button]").trigger("mouseover").click();
    cy.get("[data-cy=Users-menu-button]").should("exist");
  });

  it('users cannot see the "Users" option in hamburger menu', () => {
    cyMockDefault(cy, {
      mentor: [clint],
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.USER },
      },
    });
    cy.visit("/");
    cy.get("[data-cy=setup-no]").trigger("mouseover").click();
    cy.get("[data-cy=select-subject]").should("exist");
    cy.get("[data-cy=menu-button]").trigger("mouseover").click();
    cy.get("[data-cy=Users-menu-button]").should("not.exist");
  });

  it("with uploads in progress, button not initially visible", () => {
    cyMockDefault(cy, {
      mentor: clint,
      gqlQueries: [
        mockGQL("FetchUploadTasks", [
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: clint.answers[0].question._id,
                    question: clint.answers[0].question.question,
                  },

                  ...taskListBuild("IN_PROGRESS"),
                  transcript: "My name is Clint Anderson",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "video.mp4",
                    },
                  ],
                },
                {
                  question: {
                    _id: clint.answers[1].question._id,
                    question: clint.answers[1].question.question,
                  },

                  ...taskListBuild("IN_PROGRESS"),
                  transcript: "My name is Clint Anderson",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "video.mp4",
                    },
                  ],
                },
                {
                  question: {
                    _id: clint.answers[2].question._id,
                    question: clint.answers[2].question.question,
                  },

                  ...taskListBuild("IN_PROGRESS"),
                  transcript: "My name is Clint Anderson",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "video.mp4",
                    },
                  ],
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/");
    cy.location("pathname").then(($el) => {
      assert($el.replace("/admin", ""), "/");
    });
    cy.get("[data-cy=setup-no]").trigger("mouseover").click();
    cy.get("[data-cy=header-uploads-button]")
      .should("be.visible")
      .should("contain.text", "0 of 3 Uploads Complete");
  });

  it("selecting an upload from upload list brings you directly to record page for that question", () => {
    cyMockDefault(cy, {
      mentor: clint,
      gqlQueries: [
        mockGQL("FetchUploadTasks", [
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: clint.answers[0].question._id,
                    question: clint.answers[0].question.question,
                  },

                  ...taskListBuild("IN_PROGRESS"),
                  transcript: "My name is Clint Anderson",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "video.mp4",
                    },
                  ],
                },
                {
                  question: {
                    _id: clint.answers[1].question._id,
                    question: clint.answers[1].question.question,
                  },

                  ...taskListBuild("IN_PROGRESS"),
                  transcript: "My name is Clint Anderson",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "video.mp4",
                    },
                  ],
                },
                {
                  question: {
                    _id: clint.answers[2].question._id,
                    question: clint.answers[2].question.question,
                  },

                  ...taskListBuild("IN_PROGRESS"),
                  transcript: "My name is Clint Anderson",
                  media: [
                    {
                      type: "video",
                      tag: "web",
                      url: "video.mp4",
                    },
                  ],
                },
              ],
            },
          },
        ]),
      ],
    });
    cy.visit("/");
    cy.location("pathname").then(($el) => {
      assert($el.replace("/admin", ""), "/");
    });
    cy.get("[data-cy=setup-no]").trigger("mouseover").click();
    cy.get("[data-cy=header-uploads-button]")
      .should("be.visible")
      .should("contain.text", "0 of 3 Uploads Complete");
    cy.get("[data-cy=header-uploads-button]").trigger("mouseover").click();
    cy.get("[data-cy=active-upload-card-0]").trigger("mouseover").click();
    cy.get("[data-cy=question-text]").contains(
      "Who are you and what do you do?"
    );
  });

  it("add a subject button brings you to select subject page", () => {
    cyMockDefault(cy, {
      mentor: clint,
    });
    cy.visit("/");
    cy.get("[data-cy=setup-no]").click();
    cy.get("[data-cy=select-subject]").click();
    cy.get("[data-cy=add-a-subject]").click();
    cy.location("pathname").then(($el) => {
      assert($el, "/subjects");
    });
  });

  it("answers that do not belong to any subject exist in their own recording card", () => {
    cyMockDefault(cy, {
      mentor: {
        ...clint,
        orphanedCompleteAnswers: [
          {
            previousVersions: [],
            _id: "A5_5_5",
            question: {
              _id: "Q5_5_5",
              clientId: "C_A5_5_5",
              question: "This question does not belong to any subject",
              type: QuestionType.QUESTION,
              name: null,
              paraphrases: [],
            },
            transcript: "Test transcription.",
            status: Status.COMPLETE,
          },
        ],
      },
    });
    cy.visit("/");
    cy.get("[data-cy=setup-no]").click();
    cy.get("[data-cy=block-4]").within(() => {
      cy.contains("Orphaned Complete Answers");
      cy.get("[data-cy=answers-Complete]").within(() => {
        cy.get("[data-cy=expand-btn]").click();
        cy.get("[data-cy=answer-list]").within(() => {
          cy.contains("This question does not belong to any subject");
        });
      });
      cy.get("[data-cy=add-question]").should("be.disabled");
    });
  });
});
