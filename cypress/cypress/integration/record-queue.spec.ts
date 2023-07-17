/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { cyMockDefault, mockGQL, cySetup } from "../support/functions";
import { feedback as userQuestions } from "../fixtures/feedback/feedback";
import mentor from "../fixtures/mentor/clint_new";
import clint from "../fixtures/mentor/clint_home";
import questions from "../fixtures/questions";
import { QuestionType, Status } from "../support/types";

describe("Feedback Page add/remove from record queue", () => {
  describe("userQuestion queue button", () => {
    it("should not exist if question is mapped to an answer", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor: clint,
        gqlQueries: [mockGQL("UserQuestions", userQuestions)],
      });
      cy.visit("/feedback");
      // This question in userQuestions fixture has a mapped answer
      cy.get("[data-cy=row-6286c9ae60719ae10dfd70b8]").within(() => {
        cy.get("[data-cy=user-question-queue-btn]").should("not.exist");
        cy.get("[data-cy=grader-answer-queue-btn]").should("not.exist");
      });
    });

    it("adds an existing question doc if exact text match", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor: {
          ...clint,
          answers: [
            ...clint.answers,
            {
              _id: "A1_1_2",
              question: {
                _id: "A1_1_2",
                question: "hey",
                type: QuestionType.QUESTION,
                name: clint._id,
                clientId: "",
                paraphrases: [],
              },
              previousVersions: [],
              transcript: "",
              status: Status.INCOMPLETE,
            },
          ],
        },
        questions: [
          ...questions,
          {
            _id: "A1_1_2",
            question: "hey",
            type: QuestionType.QUESTION,
            name: clint._id,
            clientId: "",
            paraphrases: [],
          },
        ],
        gqlQueries: [
          mockGQL("UserQuestions", userQuestions),
          mockGQL("SubjectAddOrUpdateQuestions", {
            me: {
              subjectAddOrUpdateQuestions: [
                "background",
                {
                  question: [
                    "A1_1_2",
                    "hey",
                    "QUESTION",
                    "",
                    clint._id,
                    [],
                    clint._id,
                  ],
                  topics: [],
                  category: "category",
                },
              ],
            },
          }),
          mockGQL("SubjectAddOrUpdateQuestions", {
            me: {
              subjectAddOrUpdateQuestions: [
                {
                  question: "ID",
                  topics: [],
                },
              ],
            },
          }),
          mockGQL("AddQuestionToRecordQueue", {
            me: {
              addQuestionToRecordQueue: ["A1_1_2"],
            },
          }),
          mockGQL("FetchMentorRecordQueue", [
            {
              me: {
                fetchMentorRecordQueue: [],
              },
            },
            {
              me: {
                fetchMentorRecordQueue: ["A1_1_2"],
              },
            },
          ]),
          mockGQL("UserQuestionSetAnswer", {}),
        ],
      });
      cy.visit("/feedback");
      cy.get("[data-cy=user-question-queue-btn]").should(
        "contain.text",
        "Add to queue"
      );
      cy.get("[data-cy=user-question-queue-btn]").click();
      cy.get("[data-cy=user-question-queue-btn]").should(
        "contain.text",
        "Remove from queue"
      );
    });

    it("says add to queue if userQuestion is not currently in queue", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor: clint,
        gqlQueries: [mockGQL("UserQuestions", userQuestions)],
      });
      cy.visit("/feedback");
      cy.get("[data-cy=row-628d11b08dbec2a7fa50bc79]").within(() => {
        cy.get("[data-cy=user-question-queue-btn]").should(
          "contain.text",
          "Add to queue"
        );
      });
    });

    it("says remove from queue if userQuestion is already in queue", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor: clint,
        questions: [
          ...questions,
          {
            _id: "new-question-id",
            clientId: "C_new-question-id",
            question: "hey",
            type: QuestionType.QUESTION,
            name: null,
            paraphrases: [],
          },
        ],
        gqlQueries: [
          mockGQL("UserQuestions", userQuestions),
          mockGQL("FetchMentorRecordQueue", {
            me: {
              fetchMentorRecordQueue: ["new-question-id"],
            },
          }),
        ],
      });
      cy.visit("/feedback");
      cy.get("[data-cy=row-628d11b08dbec2a7fa50bc79]").within(() => {
        cy.get("[data-cy=user-question-queue-btn]").should(
          "contain.text",
          "Remove from queue"
        );
      });
    });
    it("Adding a new user question to queue opens modal", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor,
        gqlQueries: [
          mockGQL("UserQuestions", userQuestions),
          mockGQL("ImportTask", { importTask: null }),
          mockGQL("FetchMentorRecordQueue", {
            me: {
              fetchMentorRecordQueue: [],
            },
          }),
          mockGQL("SubjectAddOrUpdateQuestions", {
            me: { subjectAddOrUpdateQuestions: {} },
          }),
          mockGQL("AddQuestionToRecordQueue", {
            me: {
              addQuestionToRecordQueue: [],
            },
          }),
          mockGQL("RemoveQuestionFromRecordQueue", {
            me: {
              removeQuestionFromRecordQueue: [],
            },
          }),
        ],
      });
      cy.visit("/feedback");
      cy.get("[data-cy=user-question-queue-btn]").click();
      cy.get("[data-cy=create-question-modal]").should("be.visible");

      cy.get("[data-cy=subject-drop-down]").click();
      cy.get("[data-cy=Subject-option-background]").should("be.visible");
      cy.get("[data-cy=Subject-option-idle_and_initial_recordings]").should(
        "be.visible"
      );
      cy.get("[data-cy=Subject-option-background]").click();

      cy.get("[data-cy=category-drop-down]").click();
      cy.get("[data-cy=Category-option-category1]").should("be.visible");
      cy.get("[data-cy=Category-option-category3]").should("be.visible");
      cy.get("[data-cy=Category-option-category1]").click();

      cy.get("[data-cy=topic-selector]").click();
      cy.get("[data-cy=Topic-option-back-topic1-id]").should("be.visible");
      cy.get("[data-cy=Topic-option-back-topic2-id]").should("be.visible");
    });

    it("Can create and adds new custom question, visible on queue card", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor: [
          clint,
          {
            ...clint,
            answers: [
              ...clint.answers,
              {
                _id: "A1_1_2",
                previousVersions: [],
                question: {
                  _id: "A1_1_2",
                  question: "hey",
                  type: QuestionType.QUESTION,
                  name: clint._id,
                  clientId: "",
                  paraphrases: [],
                },
                transcript: "",
                status: Status.INCOMPLETE,
              },
            ],
          },
        ],
        questions: [
          questions,
          [
            ...questions,
            {
              _id: "A1_1_2",
              question: "hey",
              type: QuestionType.QUESTION,
              name: clint._id,
              clientId: "",
              paraphrases: [],
            },
          ],
        ],
        gqlQueries: [
          mockGQL("UserQuestions", userQuestions),
          mockGQL("SubjectAddOrUpdateQuestions", {
            me: {
              subjectAddOrUpdateQuestions: [
                "background",
                {
                  question: [
                    "A1_1_2",
                    "hey",
                    "QUESTION",
                    "",
                    clint._id,
                    [],
                    clint._id,
                  ],
                  topics: [],
                  category: "category",
                },
              ],
            },
          }),
          mockGQL("SubjectAddOrUpdateQuestions", {
            me: {
              subjectAddOrUpdateQuestions: [
                {
                  question: "ID",
                  topics: [],
                },
              ],
            },
          }),
          mockGQL("AddQuestionToRecordQueue", {
            me: {
              addQuestionToRecordQueue: [],
              category: "category1",
              topics: ["back-topic2-id"],
            },
          }),
          mockGQL("FetchMentorRecordQueue", [
            {
              me: {
                fetchMentorRecordQueue: [],
              },
            },
            {
              me: {
                fetchMentorRecordQueue: ["A1_1_2"],
              },
            },
          ]),
          mockGQL("UserQuestionSetAnswer", {}),
        ],
      });
      cy.visit("/feedback");
      cy.get("[data-cy=user-question-queue-btn]").click();
      cy.get("[data-cy=subject-drop-down]").click();
      cy.get("[data-cy=Subject-option-background]").click();
      cy.get("[data-cy=category-drop-down]").click();
      cy.get("[data-cy=Category-option-category]").click();
      cy.get("[data-cy=modal-OK-btn]").click();
      cy.visit("/");
      cy.location("pathname").then(($el) => {
        assert($el.replace("/admin", ""), "/");
      });
      cy.get("[data-cy=setup-no]").click();
      cy.get("[data-cy=queue-block]").should("exist");
      cy.get("[data-cy=queue-expand-btn]").click();
      cy.contains("hey");
    });
  });

  describe("grader answer queue button", () => {
    it("does not exist if no mapped question", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor: clint,
        gqlQueries: [mockGQL("UserQuestions", userQuestions)],
      });
      cy.visit("/feedback");
      cy.get("[data-cy=row-628d11b08dbec2a7fa50bc79]").within(() => {
        cy.get("[data-cy=grader-answer-question-text]").should("have.text", "");
        cy.get("[data-cy=grader-answer-queue-btn]").should("not.exist");
      });
    });

    it("should not exist if mapped question is a complete answer", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor: clint,
        gqlQueries: [mockGQL("UserQuestions", userQuestions)],
      });
      cy.visit("/feedback");
      cy.get("[data-cy=row-6286c9ae60719ae10dfd70b8]").within(() => {
        cy.get("[data-cy=grader-answer-question-text]").should(
          "contain.text",
          "Who are you and what do you do?"
        );
        cy.get("[data-cy=grader-answer-queue-btn]").should("not.exist");
      });
    });

    it("says Add To Queue if mapped answer is incomplete and not in queue", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor: clint,
        gqlQueries: [mockGQL("UserQuestions", userQuestions)],
      });
      cy.visit("/feedback");
      cy.get("[data-cy=row-6286c9ae60719ae10dfd70b9]").within(() => {
        cy.get("[data-cy=grader-answer-question-text]").should(
          "contain.text",
          "Please repeat the following"
        );
        cy.get("[data-cy=grader-answer-queue-btn]")
          .should("exist")
          .should("contain.text", "Add to queue");
      });
    });

    it("says Remove from Queue if mapped answer is in queue", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        mentor: clint,
        gqlQueries: [
          mockGQL("UserQuestions", userQuestions),
          mockGQL("FetchMentorRecordQueue", {
            me: {
              fetchMentorRecordQueue: ["A5_1_1"],
            },
          }),
        ],
      });
      cy.visit("/feedback");
      cy.get("[data-cy=row-6286c9ae60719ae10dfd70b9]").within(() => {
        cy.get("[data-cy=grader-answer-question-text]").should(
          "contain.text",
          "Please repeat the following"
        );
        cy.get("[data-cy=grader-answer-queue-btn]")
          .should("exist")
          .should("contain.text", "Remove from queue");
      });
    });
  });
});

describe("Queue Card", () => {
  it("Queue card not rendered if queue is empty", () => {
    cyMockDefault(cy, {
      mentor: clint,
      gqlQueries: [
        mockGQL("ImportTask", { importTask: null }),
        mockGQL("FetchMentorRecordQueue", [
          {
            me: {
              fetchMentorRecordQueue: [],
            },
          },
        ]),
      ],
    });
    cy.visit("/");
    cy.location("pathname").then(($el) => {
      assert($el.replace("/admin", ""), "/");
    });
    cy.get("[data-cy=setup-no]").click();
    cy.contains("My Priorities").should("not.exist");
  });
  it("Queue card is accessible throughout home page", () => {
    cyMockDefault(cy, {
      mentor: clint,
      gqlQueries: [
        mockGQL("ImportTask", { importTask: null }),
        mockGQL("FetchMentorRecordQueue", {
          me: {
            fetchMentorRecordQueue: ["A5_1_1"],
          },
        }),
      ],
    });
    cy.visit("/");
    cy.location("pathname").then(($el) => {
      assert($el.replace("/admin", ""), "/");
    });
    cy.get("[data-cy=setup-no]").click();
    cy.get("[data-cy=queue-block]").should("exist");
    cy.get("[data-cy=select-subject]").click();
    cy.get("[data-cy=select-background]").click();
    cy.get("[data-cy=queue-block]").should("exist");
    cy.get("[data-cy=select-subject]").click();
    cy.get("[data-cy=select-idle_and_initial_recordings]").click();
    cy.get("[data-cy=queue-block]").should("exist");
  });
  it("Can record all queued questions", () => {
    cyMockDefault(cy, {
      mentor: {
        ...clint,
        answers: [
          ...clint.answers,
          {
            _id: "A6_1_2",
            previousVersions: [],
            question: {
              _id: "A6_1_2",
              clientId: "C_A6_1_2",
              question: "HELLO?",
              type: QuestionType.QUESTION,
              name: clint._id,
              paraphrases: [],
            },
            transcript: "",
            status: Status.INCOMPLETE,
          },
        ],
      },
      questions: [
        ...questions,
        {
          _id: "A6_1_2",
          clientId: "C_A6_1_2",
          question: "HELLO?",
          type: QuestionType.QUESTION,
          name: clint._id,
          paraphrases: [],
        },
      ],
      gqlQueries: [
        mockGQL("ImportTask", { importTask: null }),
        mockGQL("FetchMentorRecordQueue", {
          me: {
            fetchMentorRecordQueue: ["A5_1_1", "A6_1_2"],
          },
        }),
      ],
    });
    cy.visit("/");
    cy.location("pathname").then(($el) => {
      assert($el.replace("/admin", ""), "/");
    });
    cy.get("[data-cy=setup-no]").click();
    cy.get("[data-cy=queue-expand-btn]").click();
    cy.get("[data-cy=record-all-queue]").click();
    cy.location("search").should("equal", "?videoId=A5_1_1&videoId=A6_1_2");
  });
  it("Can record a single queue question", () => {
    cyMockDefault(cy, {
      mentor: clint,
      gqlQueries: [
        mockGQL("ImportTask", { importTask: null }),
        mockGQL("FetchMentorRecordQueue", {
          me: {
            fetchMentorRecordQueue: ["A5_1_1"],
          },
        }),
      ],
    });
    cy.visit("/");
    cy.location("pathname").then(($el) => {
      assert($el.replace("/admin", ""), "/");
    });
    cy.get("[data-cy=setup-no]").click();
    cy.get("[data-cy=queue-expand-btn]").click();
    cy.get("[data-cy=record-one-0]").click();
    cy.location("search").should("equal", "?videoId=A5_1_1&back=%2F");
  });
  it("Complete/answered questions are not in queue", () => {
    cyMockDefault(cy, {
      mentor: clint,
      gqlQueries: [
        mockGQL("ImportTask", { importTask: null }),
        mockGQL("RemoveQuestionFromRecordQueue", {
          me: {
            removeQuestionFromRecordQueue: [],
          },
        }),
        mockGQL("FetchMentorRecordQueue", {
          me: {
            fetchMentorRecordQueue: ["A4_1_1"],
          },
        }),
      ],
    });
    cy.visit("/");
    cy.location("pathname").then(($el) => {
      assert($el.replace("/admin", ""), "/");
    });
    cy.get("[data-cy=setup-no]").click();
    expect(Cypress.$("[data-cy=queue-block]")).not.to.exist;
  });
});
