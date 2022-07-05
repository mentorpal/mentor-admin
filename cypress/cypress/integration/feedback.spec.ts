/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { cySetup, cyMockDefault, mockGQL } from "../support/functions";
import mentor from "../fixtures/mentor/clint_new";
import { feedback as userQuestions } from "../fixtures/feedback/feedback";

describe("Feedback Page", () => {
  it("dropdown un-recorded questions are greyed out", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor,
      gqlQueries: [
        mockGQL("UserQuestions", userQuestions),
        mockGQL("ImportTask", { importTask: null }),
        mockGQL("FetchMentorRecordQueue",
          [
            {
              me: {
                mentorRecordQueue: [],
              },
            },
            {
              me: {
                mentorRecordQueue: [
                  "Q1_1_1"
                ],
              },
            },
          ]
        ),
        mockGQL("UserQuestionSetAnswer", {})
      ],
    });
    cy.visit("/feedback");
    cy.get("[data-cy=select-answer]").click();
    cy.get("[data-cy=Drop-down-qu-A6_1_1]").should("be.visible");
    cy.get("[data-cy=Drop-down-qu-A6_1_1]").should(
      "have.css",
      "color",
      "rgb(0, 0, 0)"
    );
    cy.get("[data-cy=Drop-down-qu-A5_1_1]").should("be.visible");
    cy.get("[data-cy=Drop-down-qu-A5_1_1]").should(
      "have.css",
      "color",
      "rgb(128, 128, 128)"
    );
  });
});
