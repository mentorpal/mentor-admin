/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  cySetup,
  cyMockDefault,
  mockGQL,
  testIndexedDbData,
} from "../support/functions";
import { feedback as userQuestions } from "../fixtures/feedback/feedback";
import { feedback as trendingUserQuestions } from "../fixtures/feedback/trendingFeedback";

describe("Feedback", () => {
  it("Queued items do not disappear from list until refresh", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      gqlQueries: [
        mockGQL("UserQuestions", userQuestions),
        mockGQL("TrendingUserQuestions", trendingUserQuestions),
        mockGQL("UserQuestionSetAnswer", {}),
        mockGQL("AddQuestionToRecordQueue", {
          me: {
            addQuestionToRecordQueue: ["A1_1_1"],
          },
        }),
        mockGQL("SubjectAddOrUpdateQuestions", {
          me: {
            subjectAddOrUpdateQuestions: [{ question: "new_id" }],
          },
        }),
      ],
    });
    cy.visit("/feedback");
    cy.get("[data-cy=row-6286c9ae60719ae10dfd70b8]").within(() => {
      cy.get("[data-cy=grader-answer-queue-btn]").click();
    });
    cy.get("[data-cy=row-6286c9ae60719ae10dfd70b8]").should("exist");
  });

  it("embeddings get stored in IndexedDB", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      gqlQueries: [
        mockGQL("UserQuestions", userQuestions),
        mockGQL("TrendingUserQuestions", trendingUserQuestions),
        mockGQL("UserQuestionSetAnswer", {}),
      ],
    });
    cy.visit("/feedback");
    cy.getSettled("[data-cy=row-6290644add8738d2692fb270]");
    const assertion = (indexData) => expect(indexData).to.have.length(11);
    testIndexedDbData(assertion);
  });

  it("When a question is no longer trending, it gets removed from bins", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      gqlQueries: [
        mockGQL("UserQuestions", [
          userQuestions,
          userQuestions,
          {
            ...userQuestions,
            userQuestions: {
              ...userQuestions.userQuestions,
              edges: userQuestions.userQuestions.edges.slice(1),
            },
          },
        ]),
        mockGQL("TrendingUserQuestions", [
          trendingUserQuestions,
          {
            ...trendingUserQuestions,
            userQuestions: {
              ...trendingUserQuestions.userQuestions,
              edges: trendingUserQuestions.userQuestions.edges.slice(1),
            },
          },
        ]),
        mockGQL("UserQuestionSetAnswer", {}),
      ],
    });
    cy.visit("/feedback");
    cy.wait(2000).then(() => {
      const beforeReloadData = localStorage.getItem("userQuestionBins");
      const beforeReloadJsonData = JSON.parse(beforeReloadData);
      const beforeUserQuestionIds: string[] = beforeReloadJsonData.bins.reduce(
        (acc, cur) => {
          acc.push(...cur.userQuestions.map((userQ) => userQ._id));
          return acc;
        },
        []
      );
      expect(beforeUserQuestionIds).to.contain("6290644add8738d2692fb270");
      cy.get("[data-cy=menu-button]", { timeout: 3000 }).click();
      cy.get("[data-cy=Setup-menu-button]", { timeout: 3000 }).click();
      cy.getSettled("[data-cy=menu-button]");
      cy.get("[data-cy=menu-button]", { timeout: 3000 }).click();
      cy.get("[data-cy=Review-User-Feedback-menu-button]", { timeout: 3000 })
        .click()
        .then(() => {
          cy.wait(2000).then(() => {
            const afterReloadData = localStorage.getItem("userQuestionBins");
            const afterReloadJsonData = JSON.parse(afterReloadData);
            const afterUserQuestionIds: string[] =
              afterReloadJsonData.bins.reduce((acc, cur) => {
                acc.push(...cur.userQuestions.map((userQ) => userQ._id));
                return acc;
              }, []);
            expect(afterUserQuestionIds).to.not.contain(
              "6290644add8738d2692fb270"
            );
          });
        });
    });
  });

  it("Selecting an answer puts it under selection box", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      gqlQueries: [
        mockGQL("UserQuestions", userQuestions),
        mockGQL("UserQuestionSetAnswer", {}),
      ],
    });
    cy.visit("/feedback");
    cy.get("[data-cy=row-628d11b08dbec2a7fa50bc79]").within(() => {
      cy.get("[data-cy=graderAnswer]").within(() => {
        cy.get("[data-cy=select-answer]")
          .get("input")
          .type("Complete Question?")
          .type("{downarrow}{enter}");
        cy.get("[data-cy=grader-answer-question-text]").should(
          "contain.text",
          "Complete Question?"
        );
      });
    });
  });

  it("Can clear selected answer via X button", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      gqlQueries: [
        mockGQL("UserQuestions", userQuestions),
        mockGQL("UserQuestionSetAnswer", {}),
      ],
    });
    cy.visit("/feedback");
    cy.get("[data-cy=row-6286c9ae60719ae10dfd70b8]").within(() => {
      cy.get("[data-cy=grader-answer-question-text]").should(
        "contain.text",
        "Who are you and what do you do?"
      );
      cy.get("[data-cy=clear-answer-button]").click();
      cy.get("[data-cy=grader-answer-question-text]").should("have.text", "");
    });
  });
});
