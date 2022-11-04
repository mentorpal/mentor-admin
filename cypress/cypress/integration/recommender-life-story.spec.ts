/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { cyMockDefault, cySetup, mockGQL } from "../support/functions";
import { feedback as trendingUserQuestions } from "../fixtures/feedback/trendingFeedback";
import { answered1100Questions } from "../fixtures/mentor-statuses/recommender-full-subject-statuses";
import {
  dirtyMentor,
  hasSubjectQuestionsOver1300,
} from "../fixtures/mentor-statuses/recommender-life-story-statuses";

describe("Recommender Full Subject Phase (1000 < answers)", () => {
  it("Add a subject (prioritizes or trending answers): No more available questions", () => {
    const [mentor, newQuestionSet] = answered1100Questions();
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: mentor,
      questions: newQuestionSet,
      gqlQueries: [mockGQL("TrendingUserQuestions", trendingUserQuestions)],
    });
    cy.visit("/");
    cy.get("[data-cy=recommended-action-reason]").contains(
      "Your mentor doesn't have any subject areas. Subjects give you sets of questions to record."
    );
  });

  it("Trending Questions: At least 5 trending questions to answer", () => {
    const [mentor, newQuestionSet] = hasSubjectQuestionsOver1300();
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: mentor,
      questions: newQuestionSet,
      gqlQueries: [mockGQL("TrendingUserQuestions", trendingUserQuestions)],
    });
    cy.visit("/");
    cy.get("[data-cy=recommended-action-reason]").contains(
      "Users have asked questions that your mentor was unable to confidently answer."
    );
  });

  it("Record Questions: Has unanswered questions", () => {
    const [mentor, newQuestionSet] = hasSubjectQuestionsOver1300();
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: mentor,
      questions: newQuestionSet,
      // gqlQueries: [mockGQL("TrendingUserQuestions", trendingUserQuestions)],
    });
    cy.visit("/");
    cy.get("[data-cy=recommended-action-reason]").contains(
      "Record more questions to further improve your mentor."
    );
  });

  it("Build Your Mentor: Mentor has not been built since new answers", () => {
    const [mentor, newQuestionSet] = dirtyMentor();
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: mentor,
      questions: newQuestionSet,
    });
    cy.visit("/");
    cy.get("[data-cy=setup-no]").click();
    cy.get("[data-cy=skip-action-button]").click();
    cy.get("[data-cy=recommended-action-reason]").contains(
      "You've answered new questions since you last trained your mentor. Rebuild so you can preview."
    );
  });
});
