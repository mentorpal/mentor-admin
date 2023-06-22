/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  cySetup,
  cyMockDefault,
  cyMockTrain,
  cyMockTrainStatus,
  mockGQL,
} from "../support/functions";
import clint from "../fixtures/mentor/clint_home";
import clintNewAnswers from "../fixtures/mentor/clint_home_new_questions";
import { JobState, QuestionType, SetupScreen, Status } from "../support/types";
import { setup0, setup3, setup4 } from "../fixtures/mentor";
import questions from "../fixtures/questions";
import loginUserNotSeenSplash from "../fixtures/login-user-not-viewed-splash";

describe("My Mentor Page", () => {
  it("shows all questions for all categories by default", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: clint,
      gqlQueries: [
        mockGQL("FetchMentorRecordQueue", {
          me: {
            fetchMentorRecordQueue: [],
          },
        }),
      ],
    });
    cy.visit("/");
    cy.get("[data-cy=setup-no]").trigger("mouseover").click();
    cy.get("[data-cy=select-subject]").contains("All Answers (4 / 5)");
    cy.get("[data-cy=recording-blocks]").children().should("have.length", 4);
    cy.get("[data-cy=recording-blocks]").within(($blocks) => {
      cy.get("[data-cy=block-1]").within(($block) => {
        cy.get("[data-cy=block-name]").should("contain.text", "Background");
        cy.get("[data-cy=block-progress]").should("have.text", "1 / 1 (100%)");
        cy.get("[data-cy=block-description]").should(
          "have.text",
          "These questions will ask general questions about your background that might be relevant to how people understand your career."
        );
        cy.get("[data-cy=answers-Complete]").should("contain", "Complete (1)");
        cy.get("[data-cy=answers-Complete]").within(($completeAnswers) => {
          cy.get("[data-cy=record-all]").should("not.be.disabled");
          cy.get("[data-cy=add-question]").should("not.exist");
          cy.get("[data-cy=expand-btn]").trigger("mouseover").click();
          cy.get("[data-cy=answer-list]").children().should("have.length", 1);
          cy.get("[data-cy=answer-list]").within(($answers) => {
            cy.get("[data-cy=answer-0]").contains("How old are you now?");
            cy.get("[data-cy=answer-0]").contains("I'm 37 years old");
          });
        });
        cy.get("[data-cy=answers-Incomplete]").should(
          "contain",
          "Incomplete (0)"
        );
        cy.get("[data-cy=answers-Incomplete]").within(($incompleteAnswers) => {
          cy.get("[data-cy=record-all]").should("be.disabled");
          cy.get("[data-cy=add-question]").should("exist");
          cy.get("[data-cy=expand-btn]").trigger("mouseover").click();
          cy.get("[data-cy=answer-list]").children().should("have.length", 0);
        });
      });
      cy.get("[data-cy=block-3]").within(($block) => {
        cy.get("[data-cy=block-name]").should(
          "contain.text",
          "Idle and Initial Recordings"
        );
        cy.get("[data-cy=block-progress]").should("have.text", "2 / 2 (100%)");
        cy.get("[data-cy=block-description]").should(
          "have.text",
          "These are miscellaneous phrases you'll be asked to repeat."
        );
        cy.get("[data-cy=answers-Complete]").should("contain", "Complete (2)");
        cy.get("[data-cy=answers-Complete]").within(($completeAnswers) => {
          cy.get("[data-cy=record-all]").should("not.be.disabled");
          cy.get("[data-cy=add-question]").should("not.exist");
          cy.get("[data-cy=expand-btn]").trigger("mouseover").click();
          cy.get("[data-cy=answer-list]").children().should("have.length", 2);
          cy.get("[data-cy=answer-list]").within(($answers) => {
            cy.get("[data-cy=answer-0]").contains(
              "Please look at the camera for 30 seconds without speaking. Try to remain in the same position."
            );
            cy.get("[data-cy=answer-1]").contains(
              "Please give a short introduction of yourself, which includes your name, current job, and title."
            );
            cy.get("[data-cy=answer-1]").contains(
              "My name is Clint Anderson I'm a Nuclear Electrician's Mate"
            );
          });
        });
      });
    });
  });

  it("shows splash and tooltips if mentor has not seen before", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: clint,
      login: loginUserNotSeenSplash,
      gqlQueries: [
        // This intercepts any call to FirstTimeTrackingUpdate and returns with the data below
        mockGQL("FirstTimeTrackingUpdate", {
          me: {
            firstTimeTrackingUpdate: {
              myMentorSplash: true,
              tooltips: true,
            },
          },
        }),
      ],
    });

    cy.visit("/");
    cy.get("[data-cy=setup-no]").trigger("mouseover").click();
    cy.get("[data-cy=notification-dialog]").should("exist");
    cy.get("[data-cy=notification-dialog-title]").should(
      "have.text",
      "This summarizes what you have recorded so far and recommends next steps to improve your mentor. As a new mentor, you will first Record Questions, Build, and Preview your mentor to try it out. After learners ask your mentor questions, you can also check the User Feedback area (also available in the upper-left menu) which will help you improve responses to user questions your mentor had trouble answering."
    );
    cy.get("[data-cy=notification-dialog-button]").should("have.text", "Close");
    cy.get("[data-cy=notification-dialog-button]").trigger("mouseover").click();
    cy.get("[data-cy=notification-dialog]").should("not.exist");

    cy.get("[data-cy=profile-tooltip").should("exist");
    cy.get("[data-cy=profile-tooltip-title").should("have.text", "My Profile");
    cy.get("[data-cy=profile-tooltip-close-btn]").trigger("mouseover").click();
    cy.get("[data-cy=profile-tooltip-title").should("not.exist");

    cy.get("[data-cy=status-tooltip").should("exist");
    cy.get("[data-cy=status-tooltip-title").should(
      "have.text",
      "Mentor Status"
    );
    cy.get("[data-cy=status-tooltip-close-btn]").trigger("mouseover").click();
    cy.get("[data-cy=status-tooltip-title").should("not.exist");

    cy.get("[data-cy=categories-tooltip-title").should(
      "have.text",
      "Recording Subjects"
    );
    cy.get("[data-cy=categories-tooltip-close-btn]")
      .trigger("mouseover")
      .click();
    cy.get("[data-cy=categories-tooltip-title").should("not.exist");

    cy.get("[data-cy=recommender-tooltip-title").should(
      "have.text",
      "Recommender"
    );
    cy.get("[data-cy=recommender-tooltip-close-btn]")
      .trigger("mouseover")
      .click();
    cy.get("[data-cy=recommender-tooltip-title").should("not.exist");

    cy.get("[data-cy=build-tooltip-title").should("have.text", "Build");
    cy.get("[data-cy=build-tooltip-close-btn]").trigger("mouseover").click();
    cy.get("[data-cy=build-tooltip-title").should("not.exist");

    cy.get("[data-cy=preview-tooltip-title").should("have.text", "Preview");
    cy.get("[data-cy=preview-tooltip-close-btn]").trigger("mouseover").click();
    cy.get("[data-cy=preview-tooltip-title").should("not.exist");
  });

  it("mentors can hover to see tooltips after first time view", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: { ...clint },
      login: {
        ...loginUserNotSeenSplash,
        user: {
          ...loginUserNotSeenSplash.user,
          firstTimeTracking: {
            ...loginUserNotSeenSplash.user.firstTimeTracking,
            myMentorSplash: true,
            tooltips: true,
          },
        },
      },
    });

    cy.visit("/");
    cy.get("[data-cy=setup-no]").trigger("mouseover").click();
    cy.get("[data-cy=train-button]").trigger("mouseover");
    cy.get("[data-cy=build-tooltip-body]")
      .should("be.visible")
      .should("contain.text", "Build every time you change an answer");

    cy.get("[data-cy=preview-button]").trigger("mouseover");
    cy.get("[data-cy=preview-tooltip-body]")
      .should("be.visible")
      .should("contain.text", "Preview the mentor to ask it questions");

    cy.get("[data-cy=select-subject]").trigger("mouseover");
    cy.get("[data-cy=categories-tooltip-body]")
      .should("be.visible")
      .should(
        "contain.text",
        "The Subjects dropdown lets you review and add Subjects."
      );

    cy.get("[data-cy=recommended-action-button]").trigger("mouseover");
    cy.get("[data-cy=recommender-tooltip-body]")
      .should("be.visible")
      .should(
        "contain.text",
        "To help you improve your mentor, a good next-step is"
      );

    cy.get("[data-cy=mentor-status-display]").trigger("mouseover");
    cy.get("[data-cy=status-tooltip-body]")
      .should("be.visible")
      .should(
        "contain.text",
        "The Mentor Status area shows how many questions"
      );
  });

  it("build tooltip notifies user to build mentor if mentor is dirty and has more than 5 answers", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: { ...clint, isDirty: true, numAnswersComplete: 5 },
      login: {
        ...loginUserNotSeenSplash,
        user: {
          ...loginUserNotSeenSplash.user,
          firstTimeTracking: {
            ...loginUserNotSeenSplash.user.firstTimeTracking,
            myMentorSplash: true,
            tooltips: true,
          },
        },
      },
    });
    cy.visit("/");
    cy.get("[data-cy=setup-no]").trigger("mouseover").click();
    cy.get("[data-cy=build-tooltip-body]")
      .should("be.visible")
      .should(
        "contain.text",
        "Your mentor is out of date. Once you are done recording, please re-train your mentor."
      );
  });

  it("does not notify to build if mentor is dirty and does not have 5 answers completed", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: { ...clint, isDirty: true, numAnswersComplete: 4 },
      login: {
        ...loginUserNotSeenSplash,
        user: {
          ...loginUserNotSeenSplash.user,
          firstTimeTracking: {
            ...loginUserNotSeenSplash.user.firstTimeTracking,
            myMentorSplash: true,
            tooltips: true,
          },
        },
      },
    });
    cy.visit("/");
    cy.get("[data-cy=setup-no]").trigger("mouseover").click();
    cy.get("[data-cy=build-tooltip-body]").should("not.exist");
  });

  it("shows subjects in priority order", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: clint,
      config: { subjectRecordPriority: ["idle_and_initial_recordings"] },
    });
    cy.visit("/");
    cy.get("[data-cy=setup-no]").click();
    cy.get("[data-cy=block-0]").within(() => {
      cy.get("[data-cy=block-name]").should("contain", "Category2");
    });
  });

  it("doesn't show splash if mentor seen before", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: clint,
    });

    cy.visit("/");
    cy.get("[data-cy=notification-dialog]").should("not.exist");
    cy.get("[data-cy=profile-tooltip-title").should("not.exist");
    cy.get("[data-cy=status-tooltip-title").should("not.exist");
    cy.get("[data-cy=categories-tooltip-title").should("not.exist");
    cy.get("[data-cy=recommender-tooltip-title").should("not.exist");
    cy.get("[data-cy=save-tooltip-title").should("not.exist");
    cy.get("[data-cy=build-tooltip-title").should("not.exist");
    cy.get("[data-cy=preview-tooltip-title").should("not.exist");
  });

  it("shows my mentor card", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: clint });
    cy.visit("/");
    cy.get("[data-cy=my-mentor-card]").should("exist");
    cy.get("[data-cy=stage-progress]").should("exist");
    cy.get("[data-cy=upload-file]").should("exist");
    cy.get("[data-cy=recommended-action-button]").should("exist");
  });

  it("shows placeholder when no thumbnail", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: {
        ...clint,
        thumbnail: "",
      },
    });
    cy.visit("/");
    cy.get("[data-cy=placeholder-thumbnail]").should("exist");
  });

  it("switches to new image when uploaded", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: {
        ...clint,
        thumbnail: "url",
      },
    });
    cy.visit("/");
    /* uncomment when graphql is available */
    // cy.get('[data-cy=thumbnail-wrapper]').trigger('mouseover');
    // cy.fixture('avatar.png').then((fileContent) => {
    //   cy.get('input[type="file"]').attachFile({
    //     fileContent: fileContent.toString(),
    //     fileName: 'avatar.png',
    //     mimeType: 'avatr.png',
    //   });
    // });
    cy.get("[data-cy=uploaded-thumbnail]").should("exist");
  });

  it("does not show toast on incomplete level", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: clint });
    cy.visit("/");
    cy.get("[data-cy=stage-toast]").should("not.exist");
  });

  it("shows mentor scope toast on stage floor", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: {
        ...clint,
        answers: clint.answers.map((a, i) => {
          return i !== 4
            ? a
            : {
                ...a,
                status: Status.COMPLETE,
              };
        }),
      },
    });
    cy.visit("/");
    cy.get("[data-cy=stage-toast]").contains(
      "Your mentor has reached the Scripted stage!"
    );
    cy.get("[data-cy=stage-toast]").contains("You have 5 total questions.");
  });

  it("dropdown should expand when question is added", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: clint });
    cy.visit("/");
    cy.get("[data-cy=setup-no]").trigger("mouseover").click();
    cy.get("[data-cy=answer-0]").should("not.exist");
    cy.get("[data-cy=add-question]").first().trigger("mouseover").click();
    cy.get("[data-cy=answer-0]").first().should("exist");
    cy.get("[data-cy=answer-0]").first().should("be.visible");
  });

  it("can pick a subject from dropdown and view questions and categories", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: {
        ...clint,
        answers: clint.answers.map((a, i) => {
          return i !== 4
            ? a
            : {
                ...a,
                status: Status.INCOMPLETE,
              };
        }),
      },
    });
    cy.visit("/");
    cy.get("[data-cy=setup-no]").trigger("mouseover").click();
    cy.get("[data-cy=select-subject]").contains("All Answers (4 / 5)");
    cy.get("[data-cy=select-subject]").trigger("mouseover").click();
    cy.get("[data-cy=select-background]").trigger("mouseover").click();
    cy.get("[data-cy=select-subject]").contains("Background (2 / 2)");
    cy.get("[data-cy=recording-blocks]").children().should("have.length", 2);
    cy.get("[data-cy=recording-blocks]").within(($blocks) => {
      cy.get("[data-cy=block-1]").within(($block) => {
        cy.get("[data-cy=block-name]").should("contain.text", "Background");
        cy.get("[data-cy=block-progress]").should("have.text", "1 / 1 (100%)");
        cy.get("[data-cy=block-description]").should(
          "have.text",
          "These questions will ask general questions about your background that might be relevant to how people understand your career."
        );
        cy.get("[data-cy=answers-Complete]").should("contain", "Complete (1)");
        cy.get("[data-cy=answers-Complete]").within(($completeAnswers) => {
          cy.get("[data-cy=record-all]").should("not.be.disabled");
          cy.get("[data-cy=add-question]").should("not.exist");
          cy.get("[data-cy=expand-btn]").trigger("mouseover").click();
          cy.get("[data-cy=answer-list]").children().should("have.length", 1);
          cy.get("[data-cy=answer-list]").within(($answers) => {
            cy.get("[data-cy=answer-0]").contains("How old are you now?");
            cy.get("[data-cy=answer-0]").contains("I'm 37 years old");
          });
        });
        cy.get("[data-cy=answers-Incomplete]").should(
          "contain",
          "Incomplete (0)"
        );
        cy.get("[data-cy=answers-Incomplete]").within(($incompleteAnswers) => {
          cy.get("[data-cy=record-all]").should("be.disabled");
          cy.get("[data-cy=add-question]").should("exist");
          cy.get("[data-cy=expand-btn]").trigger("mouseover").click();
          cy.get("[data-cy=answer-list]").children().should("have.length", 0);
        });
      });
      cy.get("[data-cy=block-0]").within(($block) => {
        cy.get("[data-cy=block-name]").should("have.text", "Category");
        cy.get("[data-cy=block-progress]").should("have.text", "1 / 1 (100%)");
        cy.get("[data-cy=block-description]").should("have.text", "A category");
        cy.get("[data-cy=answers-Complete]").should("contain", "Complete (1)");
        cy.get("[data-cy=answers-Complete]").within(($completeAnswers) => {
          cy.get("[data-cy=record-all]").should("not.be.disabled");
          cy.get("[data-cy=add-question]").should("not.exist");
          cy.get("[data-cy=expand-btn]").trigger("mouseover").click();
          cy.get("[data-cy=answer-list]").children().should("have.length", 1);
          cy.get("[data-cy=answer-list]").within(($answers) => {
            cy.get("[data-cy=answer-0]").contains(
              "Who are you and what do you do?"
            );
            cy.get("[data-cy=answer-0]").contains(
              "My name is Clint Anderson and I'm a Nuclear Electrician's Mate"
            );
          });
        });
        cy.get("[data-cy=answers-Incomplete]").should(
          "contain",
          "Incomplete (0)"
        );
        cy.get("[data-cy=answers-Incomplete]").within(($incompleteAnswers) => {
          cy.get("[data-cy=record-all]").should("be.disabled");
          cy.get("[data-cy=add-question]").should("exist");
          cy.get("[data-cy=expand-btn]").trigger("mouseover").click();
          cy.get("[data-cy=answer-list]").children().should("have.length", 0);
        });
      });
    });
  });

  it("can pick a subject from query params and view questions and categories", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: clint });
    cy.visit("/?subject=background");
    cy.get("[data-cy=setup-no]").trigger("mouseover").click();
    cy.get("[data-cy=select-subject]").contains("Background (2 / 2)");
    cy.get("[data-cy=recording-blocks]").children().should("have.length", 2);
    cy.get("[data-cy=recording-blocks]").within(($blocks) => {
      cy.get("[data-cy=block-1]").within(($block) => {
        cy.get("[data-cy=block-name]").should("contain.text", "Background");
        cy.get("[data-cy=block-progress]").should("have.text", "1 / 1 (100%)");
        cy.get("[data-cy=block-description]").should(
          "have.text",
          "These questions will ask general questions about your background that might be relevant to how people understand your career."
        );
        cy.get("[data-cy=answers-Complete]").should("contain", "Complete (1)");
        cy.get("[data-cy=answers-Complete]").within(($completeAnswers) => {
          cy.get("[data-cy=record-all]").should("not.be.disabled");
          cy.get("[data-cy=add-question]").should("not.exist");
          cy.get("[data-cy=expand-btn]").trigger("mouseover").click();
          cy.get("[data-cy=answer-list]").children().should("have.length", 1);
          cy.get("[data-cy=answer-list]").within(($answers) => {
            cy.get("[data-cy=answer-0]").contains("How old are you now?");
            cy.get("[data-cy=answer-0]").contains("I'm 37 years old");
          });
        });
        cy.get("[data-cy=answers-Incomplete]").should(
          "contain",
          "Incomplete (0)"
        );
        cy.get("[data-cy=answers-Incomplete]").within(($incompleteAnswers) => {
          cy.get("[data-cy=record-all]").should("be.disabled");
          cy.get("[data-cy=add-question]").should("exist");
          cy.get("[data-cy=expand-btn]").trigger("mouseover").click();
          cy.get("[data-cy=answer-list]").children().should("have.length", 0);
        });
      });
      cy.get("[data-cy=block-0]").within(($block) => {
        cy.get("[data-cy=block-name]").should("have.text", "Category");
        cy.get("[data-cy=block-progress]").should("have.text", "1 / 1 (100%)");
        cy.get("[data-cy=block-description]").should("have.text", "A category");
        cy.get("[data-cy=answers-Complete]").should("contain", "Complete (1)");
        cy.get("[data-cy=answers-Complete]").within(($completeAnswers) => {
          cy.get("[data-cy=record-all]").should("not.be.disabled");
          cy.get("[data-cy=add-question]").should("not.exist");
          cy.get("[data-cy=expand-btn]").trigger("mouseover").click();
          cy.get("[data-cy=answer-list]").children().should("have.length", 1);
          cy.get("[data-cy=answer-list]").within(($answers) => {
            cy.get("[data-cy=answer-0]").contains(
              "Who are you and what do you do?"
            );
            cy.get("[data-cy=answer-0]").contains(
              "My name is Clint Anderson and I'm a Nuclear Electrician's Mate"
            );
          });
        });
        cy.get("[data-cy=answers-Incomplete]").should(
          "contain",
          "Incomplete (0)"
        );
        cy.get("[data-cy=answers-Incomplete]").within(($incompleteAnswers) => {
          cy.get("[data-cy=record-all]").should("be.disabled");
          cy.get("[data-cy=add-question]").should("exist");
          cy.get("[data-cy=expand-btn]").trigger("mouseover").click();
          cy.get("[data-cy=answer-list]").children().should("have.length", 0);
        });
      });
    });
  });

  it("can record all complete for a subject", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: clint });
    cy.visit("/");
    cy.get("[data-cy=setup-no]").trigger("mouseover").click();
    cy.get("[data-cy=select-subject]").contains("All Answers (4 / 5)");
    cy.get("[data-cy=recording-blocks]").within(($blocks) => {
      cy.get("[data-cy=block-1]").within(($block) => {
        cy.get("[data-cy=block-name]").should("contain.text", "Background");
        cy.get("[data-cy=answers-Complete]").within(($completeAnswers) => {
          cy.get("[data-cy=record-all]").trigger("mouseover").click();
        });
      });
    });
    cy.location("pathname").then(($el) =>
      assert($el.replace("/admin", ""), "/record")
    );
    cy.location("search").should(
      "equal",
      "?status=COMPLETE&subject=background&back=%2F"
    );
  });

  it("can record all incomplete for a subject", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: clint });
    cy.visit("/");
    cy.get("[data-cy=setup-no]").trigger("mouseover").click();
    cy.get("[data-cy=select-subject]").contains("All Answers (4 / 5)");
    cy.get("[data-cy=recording-blocks]").within(($blocks) => {
      cy.get("[data-cy=block-2]").within(($block) => {
        cy.get("[data-cy=block-name]").should("have.text", "Category2");
        cy.get("[data-cy=answers-Incomplete]").within(($completeAnswers) => {
          cy.get("[data-cy=record-all]").trigger("mouseover").click();
        });
      });
    });
    cy.location("pathname").then(($el) =>
      assert($el.replace("/admin", ""), "/record")
    );
    cy.location("search").should(
      "equal",
      "?status=INCOMPLETE&subject=idle_and_initial_recordings&category=category2&back=%2F"
    );
  });

  it("can record a single question in a subject", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: clint });
    cy.visit("/");
    cy.get("[data-cy=setup-no]").trigger("mouseover").click();
    cy.get("[data-cy=select-subject]").contains("All Answers (4 / 5)");
    cy.get("[data-cy=recording-blocks]").within(($blocks) => {
      cy.get("[data-cy=block-0]").within(($block) => {
        cy.get("[data-cy=block-name]").should("have.text", "Category");
        cy.get("[data-cy=answers-Complete]").within(($completeAnswers) => {
          cy.get("[data-cy=expand-btn]").trigger("mouseover").click();
          cy.get("[data-cy=answer-list]").children().should("have.length", 1);
          cy.get("[data-cy=answer-list]").within(($answers) => {
            cy.get("[data-cy=answer-0]").contains(
              "Who are you and what do you do?"
            );
            cy.get("[data-cy=answer-0]").within(($answer) => {
              cy.get("[data-cy=record-one]").trigger("mouseover").click();
            });
          });
        });
      });
    });
    cy.location("pathname").then(($el) =>
      assert($el.replace("/admin", ""), "/record")
    );
    cy.location("search").should("equal", "?videoId=C_A1_1_1&back=%2F");
    cy.get("[data-cy=question-text]").contains(
      "Who are you and what do you do?"
    );
    cy.get("[data-cy=question-edit]").should("not.exist");
  });

  it("can add a mentor question to a subject", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: clint });
    cy.visit("/");
    cy.get("[data-cy=setup-no]").trigger("mouseover").click();
    cy.get("[data-cy=select-subject]").contains("All Answers (4 / 5)");
    // cy.get("[data-cy=save-button]").should("be.disabled");
    cy.get("[data-cy=recording-blocks]").within(($blocks) => {
      cy.get("[data-cy=block-3]").within(($block) => {
        cy.get("[data-cy=block-name]").should(
          "contain.text",
          "Idle and Initial Recordings"
        );
        cy.get("[data-cy=answers-Incomplete]").within(($incompleteAnswers) => {
          cy.get("[data-cy=expand-btn]").trigger("mouseover").click();
          cy.get("[data-cy=add-question]").should("exist");
          cy.get("[data-cy=answer-list]").children().should("have.length", 0);

          cy.get("[data-cy=add-question]").trigger("mouseover").click();
          cy.get("[data-cy=answer-list]").children().should("have.length", 1);
          cy.get("[data-cy=answer-list]").within(($answers) => {
            cy.get("[data-cy=answer-0]").within(($answer) => {
              cy.get("textarea").should("have.value", "");
              cy.get("textarea").should("not.have.attr", "disabled");
            });
          });
        });
      });
    });
    cy.get("[data-cy=save-button]").should("not.be.disabled");
  });

  it("can record all complete for a category", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: clint });
    cy.visit("/?subject=background");
    cy.get("[data-cy=setup-no]").trigger("mouseover").click();
    cy.get("[data-cy=select-subject]").contains("Background (2 / 2)");
    cy.get("[data-cy=recording-blocks]").within(($blocks) => {
      cy.get("[data-cy=block-0]").within(($block) => {
        cy.get("[data-cy=block-name]").should("have.text", "Category");
        cy.get("[data-cy=answers-Complete]").within(($completeAnswers) => {
          cy.get("[data-cy=record-all]").trigger("mouseover").click();
        });
      });
    });
    cy.location("pathname").then(($el) =>
      assert($el.replace("/admin", ""), "/record")
    );
    cy.location("search").should(
      "equal",
      "?status=COMPLETE&subject=background&category=category&back=%2F%3Fsubject%3Dbackground"
    );
  });

  it("can record all incomplete for a category", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: clint });
    cy.visit("/?subject=idle_and_initial_recordings");
    cy.get("[data-cy=setup-no]").trigger("mouseover").click();
    cy.get("[data-cy=select-subject]").contains(
      "Idle and Initial Recordings (2 / 3)"
    );
    cy.get("[data-cy=recording-blocks]").within(($blocks) => {
      cy.get("[data-cy=block-0]").within(($block) => {
        cy.get("[data-cy=block-name]").should("have.text", "Category2");
        cy.get("[data-cy=answers-Incomplete]").within(($incompleteAnswers) => {
          cy.get("[data-cy=record-all]").trigger("mouseover").click();
        });
      });
    });
    cy.location("pathname").then(($el) =>
      assert($el.replace("/admin", ""), "/record")
    );
    cy.location("search").should(
      "equal",
      "?status=INCOMPLETE&subject=idle_and_initial_recordings&category=category2&back=%2F%3Fsubject%3Didle_and_initial_recordings"
    );
  });

  it("can record a single question in a category", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: clint });
    cy.visit("/?subject=background");
    cy.get("[data-cy=setup-no]").trigger("mouseover").click();
    cy.get("[data-cy=select-subject]").contains("Background (2 / 2)");
    cy.get("[data-cy=recording-blocks]").within(($blocks) => {
      cy.get("[data-cy=block-0]").within(($block) => {
        cy.get("[data-cy=block-name]").should("have.text", "Category");
        cy.get("[data-cy=answers-Complete]").within(($completeAnswers) => {
          cy.get("[data-cy=expand-btn]").trigger("mouseover").click();
          cy.get("[data-cy=answer-list]").children().should("have.length", 1);
          cy.get("[data-cy=answer-list]").within(($answers) => {
            cy.get("[data-cy=answer-0]").contains(
              "Who are you and what do you do?"
            );
            cy.get("[data-cy=answer-0]").within(($answer) => {
              cy.get("[data-cy=record-one]").trigger("mouseover").click();
            });
          });
        });
      });
    });
    cy.location("pathname").then(($el) =>
      assert($el.replace("/admin", ""), "/record")
    );
    cy.location("search").should(
      "equal",
      "?videoId=C_A1_1_1&back=%2F%3Fsubject%3Dbackground"
    );
    cy.get("[data-cy=question-text]").contains(
      "Who are you and what do you do?"
    );
    cy.get("[data-cy=question-edit]").should("not.exist");
  });

  it("can add a mentor question to a category", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: clint });
    cy.visit("/?subject=idle_and_initial_recordings");
    cy.get("[data-cy=setup-no]").trigger("mouseover").click();
    cy.get("[data-cy=select-subject]").contains(
      "Idle and Initial Recordings (2 / 3)"
    );
    // cy.get("[data-cy=save-button]").should("be.disabled");
    cy.get("[data-cy=recording-blocks]").within(($blocks) => {
      cy.get("[data-cy=block-0]").within(($block) => {
        cy.get("[data-cy=block-name]").should("have.text", "Category2");
        cy.get("[data-cy=answers-Incomplete]").within(($incompleteAnswers) => {
          cy.get("[data-cy=expand-btn]").trigger("mouseover").click();
          cy.get("[data-cy=add-question]").should("exist");
          cy.get("[data-cy=answer-list]").children().should("have.length", 1);
          cy.get("[data-cy=answer-list]").within(($answers) => {
            cy.get("[data-cy=answer-0]").contains(
              "Please repeat the following: 'I couldn't understand the question. Try asking me something else."
            );
          });
          cy.get("[data-cy=add-question]").trigger("mouseover").click();
          cy.get("[data-cy=answer-list]").children().should("have.length", 2);
          cy.get("[data-cy=answer-list]").within(($answers) => {
            cy.get("[data-cy=answer-1]").within(($answer) => {
              cy.get("textarea").should("have.value", "");
              cy.get("textarea").should("not.have.attr", "disabled");
            });
            cy.get("[data-cy=answer-0]").contains(
              "Please repeat the following: 'I couldn't understand the question. Try asking me something else."
            );
          });
        });
      });
    });
    cy.get("[data-cy=save-button]").should("not.be.disabled");
  });

  it("can edit a mentor question", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: clint });
    cy.visit("/?subject=idle_and_initial_recordings");
    cy.get("[data-cy=setup-no]").trigger("mouseover").click();
    cy.get("[data-cy=select-subject]").contains(
      "Idle and Initial Recordings (2 / 3)"
    );
    // cy.get("[data-cy=save-button]").should("be.disabled");
    cy.get("[data-cy=recording-blocks]").within(($blocks) => {
      cy.get("[data-cy=block-0]").within(($block) => {
        cy.get("[data-cy=block-name]").should("have.text", "Category2");
        cy.get("[data-cy=answers-Incomplete]").within(($incompleteAnswers) => {
          cy.get("[data-cy=expand-btn]").trigger("mouseover").click();
          cy.get("[data-cy=add-question]").should("exist");
          cy.get("[data-cy=answer-list]").children().should("have.length", 1);
          cy.get("[data-cy=answer-list]").within(($answers) => {
            cy.get("[data-cy=answer-0]").contains(
              "Please repeat the following: 'I couldn't understand the question. Try asking me something else."
            );
          });
          cy.get("[data-cy=add-question]").trigger("mouseover").click();
          cy.get("[data-cy=answer-list]").children().should("have.length", 2);
          cy.get("[data-cy=answer-list]").within(($answers) => {
            cy.get("[data-cy=answer-1]").within(($answer) => {
              cy.get("textarea").should("have.value", "");
              cy.get("textarea").should("not.have.attr", "disabled");
              cy.get("[data-cy=edit-question]").type("test");
              cy.get("textarea").should("have.value", "test");
            });
            cy.get("[data-cy=answer-0]").contains(
              "Please repeat the following: 'I couldn't understand the question. Try asking me something else."
            );
          });
        });
      });
    });
    cy.get("[data-cy=save-button]").should("not.be.disabled");
  });

  it("fails to train mentor", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: { ...clint, isDirty: true },
    });
    cyMockTrain(cy);
    cyMockTrainStatus(cy, { status: { state: JobState.FAILURE } });
    cy.visit("/");
    cy.get("[data-cy=setup-no]").trigger("mouseover").click();
    cy.get("[data-cy=train-button]").trigger("mouseover").click();
    cy.contains("Oops, training failed. Please try again.");
  });

  it("can train mentor if it's dirty", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: { ...clint, isDirty: true },
    });
    cyMockTrain(cy);
    cyMockTrainStatus(cy, { status: { state: JobState.SUCCESS } });
    cy.visit("/");
    cy.get("[data-cy=setup-no]").trigger("mouseover").click();
    cy.get("[data-cy=train-button]").contains("Build Mentor");
    cy.get("[data-cy=train-button]").trigger("mouseover").click();
    cy.contains("Building...");
    cy.get("[data-cy=loading-dialog]").should("not.exist");
    cy.getSettled("[data-cy=select-subject]", { retries: 2 })
      .trigger("mouseover")
      .click();
  });

  it.skip("offers to preview mentor if it's not dirty", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: { ...clint, _id: "preview", isDirty: false },
    });
    cyMockTrain(cy);
    cyMockTrainStatus(cy, { status: { state: JobState.SUCCESS } });
    cy.visit("/");
    cy.get("[data-cy=setup-no]").trigger("mouseover").click();
    cy.get("[data-cy=train-button]").contains("Preview Mentor");
    cy.get("[data-cy=train-button]").trigger("mouseover").click();
    cy.url().should("include", "preview");
  });

  describe("if setup is not complete", () => {
    it("redirects to setup if mentor info is not filled out", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor: [setup0],
      });
      cy.visit("/");
      cy.location("pathname").then(($el) => {
        assert($el.replace("/admin", ""), "/setup");
      });
      cy.contains("Mentor Setup");
    });

    it("offers to continue setup if other steps not complete", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor: [setup3],
      });
      cy.visit("/");
      cy.get("[data-cy=setup-dialog]").contains(
        "You have not finished setting up your mentor. Would you like to continue it?"
      );
      cy.get("[data-cy=setup-yes]").trigger("mouseover").click();
      cy.location("pathname").then(($el) => {
        assert($el.replace("/admin", ""), "/setup");
      });
    });

    it("if idle not complete, setup goes to finish it", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor: [setup3],
      });
      cy.visit("/");
      cy.get("[data-cy=setup-dialog]").contains(
        "You have not finished setting up your mentor. Would you like to continue it?"
      );
      cy.get("[data-cy=setup-yes]").trigger("mouseover").click();
      cy.location("pathname").then(($el) => {
        assert($el.replace("/admin", ""), "/setup");
      });
      cy.get(
        `[data-cy=slide-${SetupScreen.Idle_And_Initial_Recordings}]`
      ).should("be.visible");
    });

    // TODO: This one ONLY fails in GHA
    it.skip("if required subject not complete, setup goes to finish it", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor: [setup4],
      });
      cy.visit("/");
      cy.get("[data-cy=setup-dialog]").contains(
        "You have not finished setting up your mentor. Would you like to continue it?"
      );
      cy.get("[data-cy=setup-yes]").trigger("mouseover").click();
      cy.location("pathname").then(($el) => {
        assert($el.replace("/admin", ""), "/setup");
      });
      cy.contains("Idle and Initial Recordings");
    });

    it("Can create a mentor question and save it", () => {
      cySetup(cy);
      const newQuestion = {
        _id: "A8_1_1",
        clientId: "C_A8_1_1",
        question: "test",
        type: QuestionType.QUESTION,
        name: null,
        paraphrases: [],
        mentor: "clintanderson",
      };
      const newQuestions = [...questions, newQuestion];
      cyMockDefault(cy, {
        mentor: [clint, clintNewAnswers],
        questions: [questions, newQuestions],
        gqlQueries: [
          mockGQL("SubjectAddOrUpdateQuestions", {
            me: { subjectAddOrUpdateQuestions: {} },
          }),
        ],
      });
      cy.visit("/?subject=idle_and_initial_recordings");
      cy.get("[data-cy=setup-no]").trigger("mouseover").click();
      cy.get("[data-cy=select-subject]").contains(
        "Idle and Initial Recordings (2 / 3)"
      );
      cy.get("[data-cy=recording-blocks]").within(($blocks) => {
        cy.get("[data-cy=block-0]").within(($block) => {
          cy.get("[data-cy=block-name]").should("have.text", "Category2");
          cy.get("[data-cy=answers-Incomplete]").within(
            ($incompleteAnswers) => {
              cy.get("[data-cy=expand-btn]").trigger("mouseover").click();
              cy.get("[data-cy=add-question]").should("exist");
              cy.get("[data-cy=answer-list]")
                .children()
                .should("have.length", 1);
              cy.get("[data-cy=answer-list]").within(($answers) => {
                cy.get("[data-cy=answer-0]").contains(
                  "Please repeat the following: 'I couldn't understand the question. Try asking me something else."
                );
              });
              cy.get("[data-cy=add-question]").trigger("mouseover").click();
              cy.get("[data-cy=answer-list]")
                .children()
                .should("have.length", 2);
              cy.get("[data-cy=answer-list]").within(($answers) => {
                cy.get("[data-cy=answer-1]").within(($answer) => {
                  cy.get("textarea").should("have.value", "");
                  cy.get("textarea").should("not.have.attr", "disabled");
                  cy.get("[data-cy=edit-question]").type("test");
                  cy.get("textarea").should("have.value", "test");
                });
                cy.get("[data-cy=answer-0]").contains(
                  "Please repeat the following: 'I couldn't understand the question. Try asking me something else."
                );
              });
            }
          );
        });
      });
      cy.get("[data-cy=unsaved-changes-warning]").should("exist");
      cy.get("[data-cy=save-button]").should("not.be.disabled");
      cy.get("[data-cy=save-button]")
        .invoke("mouseover")
        .click()
        .then(() => {
          cy.get("[data-cy=select-subject]").contains(
            "Idle and Initial Recordings (2 / 4)"
          );
          cy.get("[data-cy=block-0]").within(($block) => {
            cy.get("[data-cy=unsaved-changes-warning]").should("not.exist");
            cy.get("[data-cy=answer-1]").should("contain.text", "test");
            cy.get("[data-cy=edit-question]").should("exist");
          });
        });
    });

    it("Leaving page without saving prompts user to save", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor: [clint, clintNewAnswers],
        gqlQueries: [
          mockGQL("SubjectAddOrUpdateQuestions", {
            me: { subjectAddOrUpdateQuestions: {} },
          }),
        ],
      });
      cy.visit("?subject=idle_and_initial_recordings");
      cy.get("[data-cy=setup-no]").trigger("mouseover").click();
      cy.get("[data-cy=select-subject]").contains(
        "Idle and Initial Recordings (2 / 3)"
      );
      cy.get("[data-cy=recording-blocks]").within(($blocks) => {
        cy.get("[data-cy=block-0]").within(($block) => {
          cy.get("[data-cy=block-name]").should("have.text", "Category2");
          cy.get("[data-cy=answers-Incomplete]").within(
            ($incompleteAnswers) => {
              cy.get("[data-cy=expand-btn]").trigger("mouseover").click();
              cy.get("[data-cy=add-question]").should("exist");
              cy.get("[data-cy=answer-list]")
                .children()
                .should("have.length", 1);
              cy.get("[data-cy=answer-list]").within(($answers) => {
                cy.get("[data-cy=answer-0]").contains(
                  "Please repeat the following: 'I couldn't understand the question. Try asking me something else."
                );
              });
              cy.get("[data-cy=add-question]").trigger("mouseover").click();
              cy.get("[data-cy=answer-list]")
                .children()
                .should("have.length", 2);
              cy.get("[data-cy=answer-list]").within(($answers) => {
                cy.get("[data-cy=answer-1]").within(($answer) => {
                  cy.get("textarea").should("have.value", "");
                  cy.get("textarea").should("not.have.attr", "disabled");
                  cy.get("[data-cy=edit-question]").type("test");
                  cy.get("textarea").should("have.value", "test");
                });
                cy.get("[data-cy=answer-0]").contains(
                  "Please repeat the following: 'I couldn't understand the question. Try asking me something else."
                );
              });
            }
          );
        });
      });
      cy.get("[data-cy=unsaved-changes-warning]").should("exist");
      cy.get("[data-cy=menu-button]").invoke("mouseover").click();
      cy.get("[data-cy=Setup-menu-button]").invoke("mouseover").click();
      cy.get("[data-cy=two-option-dialog]").should(
        "contain.text",
        "You have unsaved changes"
      );
    });

    it("Recording question without saving prompts user to save before continuing", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor: [clint, clintNewAnswers],
        gqlQueries: [
          mockGQL("SubjectAddOrUpdateQuestions", {
            me: { subjectAddOrUpdateQuestions: {} },
          }),
        ],
      });
      cy.visit("/?subject=idle_and_initial_recordings");
      cy.get("[data-cy=setup-no]").trigger("mouseover").click();
      cy.get("[data-cy=select-subject]").contains(
        "Idle and Initial Recordings (2 / 3)"
      );
      cy.get("[data-cy=recording-blocks]").within(($blocks) => {
        cy.get("[data-cy=block-0]").within(($block) => {
          cy.get("[data-cy=block-name]").should("have.text", "Category2");
          cy.get("[data-cy=answers-Incomplete]").within(
            ($incompleteAnswers) => {
              cy.get("[data-cy=expand-btn]").trigger("mouseover").click();
              cy.get("[data-cy=add-question]").should("exist");
              cy.get("[data-cy=answer-list]")
                .children()
                .should("have.length", 1);
              cy.get("[data-cy=answer-list]").within(($answers) => {
                cy.get("[data-cy=answer-0]").contains(
                  "Please repeat the following: 'I couldn't understand the question. Try asking me something else."
                );
              });
              cy.get("[data-cy=add-question]").trigger("mouseover").click();
              cy.get("[data-cy=answer-list]")
                .children()
                .should("have.length", 2);
              cy.get("[data-cy=answer-list]").within(($answers) => {
                cy.get("[data-cy=answer-1]").within(($answer) => {
                  cy.get("textarea").should("have.value", "");
                  cy.get("textarea").should("not.have.attr", "disabled");
                  cy.get("[data-cy=edit-question]").type("test");
                  cy.get("textarea").should("have.value", "test");
                });
                cy.get("[data-cy=answer-0]").contains(
                  "Please repeat the following: 'I couldn't understand the question. Try asking me something else."
                );
              });
            }
          );
        });
      });
      cy.get("[data-cy=unsaved-changes-warning]").should("exist");
      cy.get("[data-cy=block-0]").within(($block) => {
        cy.get("[data-cy=block-name]").should("have.text", "Category2");
        cy.get("[data-cy=answers-Incomplete]").within(() => {
          cy.get("[data-cy=answer-1]").within(($within) => {
            cy.get("[data-cy=record-one]").invoke("mouseover").click();
          });
        });
      });
      cy.get("[data-cy=two-option-dialog]").should(
        "contain.text",
        "You have unsaved question changes"
      );
    });
  });

  it("can use button to expand and collapse all question lists", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: clint,
    });
    cy.visit("/");
    cy.get("[data-cy=setup-no]").trigger("mouseover").click();
    // Confirm no answers showing by default
    cy.get("[data-cy=block-0]").within(() => {
      cy.get("[data-cy=answer-0]").should("not.exist");
    });
    cy.get("[data-cy=block-1]").within(() => {
      cy.get("[data-cy=answer-0]").should("not.exist");
    });
    cy.get("[data-cy=block-2]").within(() => {
      cy.get("[data-cy=answer-0]").should("not.exist");
    });
    cy.get("[data-cy=block-3]").within(() => {
      cy.get("[data-cy=answer-0]").should("not.exist");
    });
    // expand all
    cy.get("[data-cy=toggle-all-dropdowns]").click();
    // confirm all answers are expanded (visible)
    cy.get("[data-cy=block-0]").within(() => {
      cy.get("[data-cy=answer-0]").should("exist");
    });
    cy.get("[data-cy=block-1]").within(() => {
      cy.get("[data-cy=answer-0]").should("exist");
    });
    cy.get("[data-cy=block-2]").within(() => {
      cy.get("[data-cy=answer-0]").should("exist");
    });
    cy.get("[data-cy=block-3]").within(() => {
      cy.get("[data-cy=answer-0]").should("exist");
    });
    // collapse all
    cy.get("[data-cy=toggle-all-dropdowns]").click();
    // confirm all answers are collapsed (not visible)
    cy.get("[data-cy=block-0]").within(() => {
      cy.get("[data-cy=answer-0]").should("not.exist");
    });
    cy.get("[data-cy=block-1]").within(() => {
      cy.get("[data-cy=answer-0]").should("not.exist");
    });
    cy.get("[data-cy=block-2]").within(() => {
      cy.get("[data-cy=answer-0]").should("not.exist");
    });
    cy.get("[data-cy=block-3]").within(() => {
      cy.get("[data-cy=answer-0]").should("not.exist");
    });
  });
});
