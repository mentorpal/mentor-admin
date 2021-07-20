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
import clintNew from "../fixtures/mentor/clint_new";
import {
  JobState,
  MentorType,
  QuestionType,
  Status,
  UtteranceName,
} from "../support/types";

describe("My Mentor Page", () => {
  it("exports mentor", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: [clint],
      gqlQueries: [
        mockGQL(
          "exportMentor",
          {
            _id: "clintanderson",
            subjects: [
              {
                _id: "background",
                name: "Background",
                description:
                  "These questions will ask general questions about your background that might be relevant to how people understand your career.",
                categories: [
                  {
                    id: "category",
                    name: "Category",
                    description: "A category",
                  },
                ],
                topics: [],
                questions: [
                  {
                    question: {
                      _id: "A1_1_1",
                      question: "Who are you and what do you do?",
                      type: QuestionType.QUESTION,
                      name: null,
                      paraphrases: [],
                    },
                    topics: [],
                    category: { id: "category" },
                  },
                  {
                    question: {
                      _id: "A2_1_1",
                      question: "How old are you now?",
                      type: QuestionType.QUESTION,
                      name: null,
                      paraphrases: [],
                    },
                    topics: [],
                  },
                ],
              },
              {
                _id: "repeat_after_me",
                name: "Repeat After Me",
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
                      question:
                        "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'",
                      type: QuestionType.UTTERANCE,
                      name: UtteranceName.OFF_TOPIC,
                      paraphrases: [],
                    },
                    topics: [],
                    category: { id: "category2" },
                  },
                ],
              },
            ],
            answers: [
              {
                _id: "A1_1_1",
                question: {
                  _id: "A1_1_1",
                  question: "Who are you and what do you do?",
                },
                transcript:
                  "My name is Clint Anderson and I'm a Nuclear Electrician's Mate",
                status: Status.COMPLETE,
              },
              {
                _id: "A2_1_1",
                question: {
                  _id: "A2_1_1",
                  question: "How old are you now?",
                },
                transcript: "I'm 37 years old",
                status: Status.COMPLETE,
              },
              {
                _id: "A3_1_1",
                question: {
                  _id: "A3_1_1",
                  question:
                    "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.",
                },
                media: [{ url: "video.mp4", tag: "idle", type: "video" }],
                transcript: "",
                status: Status.COMPLETE,
              },
              {
                _id: "A4_1_1",
                question: {
                  _id: "A4_1_1",
                  question:
                    "Please give a short introduction of yourself, which includes your name, current job, and title.",
                },
                transcript:
                  "My name is Clint Anderson I'm a Nuclear Electrician's Mate",
                status: Status.COMPLETE,
              },
              {
                _id: "A5_1_1",
                question: {
                  _id: "A5_1_1",
                  question:
                    "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'",
                },
                transcript: "",
                status: Status.INCOMPLETE,
              },
            ],
          },
          false
        ),
      ],
    });
    cy.visit("/");
    cy.get("[data-cy=select-subject]").contains("All Answers (4 / 5)");
    cy.get("[data-cy=download-mentor]").trigger("mouseover").click();
  });

  it("imports a mentor", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: [clintNew, clint],
      gqlQueries: [mockGQL("importMentor", clint, true)],
    });
    cy.visit("/");
    cy.get("[data-cy=select-subject]").contains("All Answers (0 / 5)");
    cy.fixture("mentor.json").then((fileContent) => {
      cy.get("[data-cy=upload-mentor]").attachFile({
        fileContent: fileContent.toString(),
        fileName: "mentor.json",
        mimeType: "text/json",
      });
    });
    cy.get("[data-cy=select-subject]").contains("All Answers (4 / 5)");
  });

  it("shows all questions for all categories by default", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: clint });
    cy.visit("/");
    cy.get("[data-cy=select-subject]").contains("All Answers (4 / 5)");
    cy.get("[data-cy=recording-blocks]").children().should("have.length", 4);
    cy.get("[data-cy=recording-blocks]").within(($blocks) => {
      cy.get("[data-cy=block-0]").within(($block) => {
        cy.get("[data-cy=block-name]").should("have.text", "Background");
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
      cy.get("[data-cy=block-2]").within(($block) => {
        cy.get("[data-cy=block-name]").should("have.text", "Repeat After Me");
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
    cy.get("[data-cy=answer-0]").should("not.exist");
    cy.get("[data-cy=add-question]").first().trigger("mouseover").click();
    cy.get("[data-cy=answer-0]").first().should("exist");
    cy.get("[data-cy=answer-0]").first().should("be.visible");
  });

  it("dropdown should expand when question is added", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: clint });
    cy.visit("/");
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
    cy.get("[data-cy=select-subject]").contains("All Answers (4 / 5)");
    cy.get("[data-cy=select-subject]").trigger("mouseover").click();
    cy.get("[data-cy=select-background]").trigger("mouseover").click();
    cy.get("[data-cy=select-subject]").contains("Background (2 / 2)");
    cy.get("[data-cy=recording-blocks]").children().should("have.length", 2);
    cy.get("[data-cy=recording-blocks]").within(($blocks) => {
      cy.get("[data-cy=block-0]").within(($block) => {
        cy.get("[data-cy=block-name]").should("have.text", "Background");
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
      cy.get("[data-cy=block-1]").within(($block) => {
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
    cy.get("[data-cy=select-subject]").contains("Background (2 / 2)");
    cy.get("[data-cy=recording-blocks]").children().should("have.length", 2);
    cy.get("[data-cy=recording-blocks]").within(($blocks) => {
      cy.get("[data-cy=block-0]").within(($block) => {
        cy.get("[data-cy=block-name]").should("have.text", "Background");
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
      cy.get("[data-cy=block-1]").within(($block) => {
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
    cy.get("[data-cy=select-subject]").contains("All Answers (4 / 5)");
    cy.get("[data-cy=recording-blocks]").within(($blocks) => {
      cy.get("[data-cy=block-0]").within(($block) => {
        cy.get("[data-cy=block-name]").should("have.text", "Background");
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
    cy.get("[data-cy=select-subject]").contains("All Answers (4 / 5)");
    cy.get("[data-cy=recording-blocks]").within(($blocks) => {
      cy.get("[data-cy=block-3]").within(($block) => {
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
      "?status=INCOMPLETE&subject=repeat_after_me&category=category2&back=%2F"
    );
  });

  it("can record a single question in a subject", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: clint });
    cy.visit("/");
    cy.get("[data-cy=select-subject]").contains("All Answers (4 / 5)");
    cy.get("[data-cy=recording-blocks]").within(($blocks) => {
      cy.get("[data-cy=block-1]").within(($block) => {
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
    cy.location("search").should("equal", "?videoId=A1_1_1&back=%2F");
    cy.get("[data-cy=question-input]").within(($input) => {
      cy.get("textarea").should("have.text", "Who are you and what do you do?");
      cy.get("textarea").should("have.attr", "disabled");
    });
  });

  it("can add a mentor question to a subject", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: clint });
    cy.visit("/");
    cy.get("[data-cy=select-subject]").contains("All Answers (4 / 5)");
    cy.get("[data-cy=save-button]").should("be.disabled");
    cy.get("[data-cy=recording-blocks]").within(($blocks) => {
      cy.get("[data-cy=block-2]").within(($block) => {
        cy.get("[data-cy=block-name]").should("have.text", "Repeat After Me");
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
    cy.get("[data-cy=select-subject]").contains("Background (2 / 2)");
    cy.get("[data-cy=recording-blocks]").within(($blocks) => {
      cy.get("[data-cy=block-1]").within(($block) => {
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
    cy.visit("/?subject=repeat_after_me");
    cy.get("[data-cy=select-subject]").contains("Repeat After Me (2 / 3)");
    cy.get("[data-cy=recording-blocks]").within(($blocks) => {
      cy.get("[data-cy=block-1]").within(($block) => {
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
      "?status=INCOMPLETE&subject=repeat_after_me&category=category2&back=%2F%3Fsubject%3Drepeat_after_me"
    );
  });

  it("can record a single question in a category", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: clint });
    cy.visit("/?subject=background");
    cy.get("[data-cy=select-subject]").contains("Background (2 / 2)");
    cy.get("[data-cy=recording-blocks]").within(($blocks) => {
      cy.get("[data-cy=block-1]").within(($block) => {
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
      "?videoId=A1_1_1&back=%2F%3Fsubject%3Dbackground"
    );
    cy.get("[data-cy=question-input]").within(($input) => {
      cy.get("textarea").should("have.text", "Who are you and what do you do?");
      cy.get("textarea").should("have.attr", "disabled");
    });
  });

  it("can add a mentor question to a category", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: clint });
    cy.visit("/?subject=repeat_after_me");
    cy.get("[data-cy=select-subject]").contains("Repeat After Me (2 / 3)");
    cy.get("[data-cy=save-button]").should("be.disabled");
    cy.get("[data-cy=recording-blocks]").within(($blocks) => {
      cy.get("[data-cy=block-1]").within(($block) => {
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
            cy.get("[data-cy=answer-0]").within(($answer) => {
              cy.get("textarea").should("have.value", "");
              cy.get("textarea").should("not.have.attr", "disabled");
            });
            cy.get("[data-cy=answer-1]").contains(
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
    cy.visit("/?subject=repeat_after_me");
    cy.get("[data-cy=select-subject]").contains("Repeat After Me (2 / 3)");
    cy.get("[data-cy=save-button]").should("be.disabled");
    cy.get("[data-cy=recording-blocks]").within(($blocks) => {
      cy.get("[data-cy=block-1]").within(($block) => {
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
            cy.get("[data-cy=answer-0]").within(($answer) => {
              cy.get("textarea").should("have.value", "");
              cy.get("textarea").should("not.have.attr", "disabled");
              cy.get("[data-cy=edit-question]").type("test");
              cy.get("textarea").should("have.value", "test");
            });
            cy.get("[data-cy=answer-1]").contains(
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
    cy.get("[data-cy=train-button]").trigger("mouseover").click();
    cy.contains("Failed job");
  });

  it("can train mentor if it's dirty", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: { ...clint, isDirty: true },
    });
    cyMockTrain(cy);
    cyMockTrainStatus(cy, { status: { state: JobState.SUCCESS } });
    cy.visit("/");
    cy.get("[data-cy=train-button]").contains("Build Mentor");
    cy.get("[data-cy=train-button]").trigger("mouseover").click();
    cy.contains("Building...");
    cy.get("[data-cy=select-subject]").trigger("mouseover").click();
  });
  it("offers to preview mentor if it's not dirty", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: { ...clint, _id: "preview", isDirty: false },
    });
    cyMockTrain(cy);
    cyMockTrainStatus(cy, { status: { state: JobState.SUCCESS } });
    cy.visit("/");
    cy.get("[data-cy=train-button]").contains("Preview Mentor");
    cy.get("[data-cy=train-button]").trigger("mouseover").click();
    cy.url().should("include", "preview");
  });
});
