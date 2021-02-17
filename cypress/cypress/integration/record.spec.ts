/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { cySetup, cyInterceptGraphQL, cyMockLogin, cyMockGQL, cyMockTrain, cyMockTrainStatus } from "../support/functions";
import login from "../fixtures/login";
import subjects from "../fixtures/subjects";
import {
  setup0,
  setup5,
} from "../fixtures/mentor"
import background from "../fixtures/subjects/background"

describe("Record", () => {
  describe("search params", () => {
    it("shows all questions if no filters", () => {
      cySetup(cy);
      cyMockLogin();
      cyInterceptGraphQL(cy, [
        cyMockGQL("login", login),
        cyMockGQL("mentor", setup5, true),
        cyMockGQL("subjects", [subjects]),
      ]);
      cy.visit("/record");
      cy.get("#progress").contains("Questions 1 / 5");
      cy.get("#question-input").should("have.value", "Who are you and what do you do?");
      cy.get("#transcript-input").should("have.value", "My name is Clint Anderson and I'm a Nuclear Electrician's Mate");
      cy.get("#status").contains("Complete");
      cy.get("#back-btn").should("be.disabled");
      cy.get("#next-btn").trigger("mouseover").click();

      cy.get("#progress").contains("Questions 2 / 5");
      cy.get("#question-input").should("have.value", "How old are you now?");
      cy.get("#transcript-input").should("have.value", "");
      cy.get("#status").contains("Incomplete");
      cy.get("#back-btn").should("not.be.disabled");
      cy.get("#next-btn").trigger("mouseover").click();

      cy.get("#progress").contains("Questions 3 / 5");
      cy.get("#question-input").should("have.value", "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.");
      cy.get("#transcript-input").should("have.value", "");
      cy.get("#status").contains("Complete");
      cy.get("#back-btn").should("not.be.disabled");
      cy.get("#next-btn").trigger("mouseover").click();

      cy.get("#progress").contains("Questions 4 / 5");
      cy.get("#question-input").should("have.value", "Please give a short introduction of yourself, which includes your name, current job, and title.");
      cy.get("#transcript-input").should("have.value", "");
      cy.get("#status").contains("Incomplete");
      cy.get("#back-btn").should("not.be.disabled");
      cy.get("#next-btn").trigger("mouseover").click();

      cy.get("#progress").contains("Questions 5 / 5");
      cy.get("#question-input").should("have.value", "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'");
      cy.get("#transcript-input").should("have.value", "");
      cy.get("#status").contains("Incomplete");
      cy.get("#back-btn").should("not.be.disabled");
      cy.get("#next-btn").should("not.exist");
      cy.get("#done-btn").trigger("mouseover").click();

      cy.get("#answers #progress").contains("My Answers (2 / 5)");
      cy.get("#complete-questions").contains("Recorded (2)");
      cy.get("#incomplete-questions").contains("Unrecorded (3)");
    });

    it("shows all incomplete questions if ?status=Incomplete", () => {
      cySetup(cy);
      cyMockLogin();
      cyInterceptGraphQL(cy, [
        cyMockGQL("login", login),
        cyMockGQL("mentor", setup5, true),
        cyMockGQL("subjects", [subjects]),
      ]);
      cy.visit("/record?status=Incomplete");
      cy.get("#progress").contains("Questions 1 / 3");
      cy.get("#question-input").should("have.value", "How old are you now?");
      cy.get("#transcript-input").should("have.value", "");
      cy.get("#status").contains("Incomplete");
      cy.get("#back-btn").should("be.disabled");
      cy.get("#next-btn").trigger("mouseover").click();

      cy.get("#progress").contains("Questions 2 / 3");
      cy.get("#question-input").should("have.value", "Please give a short introduction of yourself, which includes your name, current job, and title.");
      cy.get("#transcript-input").should("have.value", "");
      cy.get("#status").contains("Incomplete");
      cy.get("#back-btn").should("not.be.disabled");
      cy.get("#next-btn").trigger("mouseover").click();

      cy.get("#progress").contains("Questions 3 / 3");
      cy.get("#question-input").should("have.value", "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'");
      cy.get("#transcript-input").should("have.value", "");
      cy.get("#status").contains("Incomplete");
      cy.get("#back-btn").should("not.be.disabled");
      cy.get("#next-btn").should("not.exist");
      cy.get("#done-btn").trigger("mouseover").click();

      cy.get("#answers #progress").contains("My Answers (2 / 5)");
      cy.get("#complete-questions").contains("Recorded (2)");
      cy.get("#incomplete-questions").contains("Unrecorded (3)");
    });

    it("shows all complete questions if ?status=Complete", () => {
      cySetup(cy);
      cyMockLogin();
      cyInterceptGraphQL(cy, [
        cyMockGQL("login", login),
        cyMockGQL("mentor", setup5, true),
        cyMockGQL("subjects", [subjects]),
      ]);
      cy.visit("/record?status=Complete");
      cy.get("#progress").contains("Questions 1 / 2");
      cy.get("#question-input").should("have.value", "Who are you and what do you do?");
      cy.get("#transcript-input").should("have.value", "My name is Clint Anderson and I'm a Nuclear Electrician's Mate");
      cy.get("#status").contains("Complete");
      cy.get("#back-btn").should("be.disabled");
      cy.get("#next-btn").trigger("mouseover").click();

      cy.get("#progress").contains("Questions 2 / 2");
      cy.get("#question-input").should("have.value", "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.");
      cy.get("#transcript-input").should("have.value", "");
      cy.get("#status").contains("Complete");
      cy.get("#back-btn").should("not.be.disabled");
      cy.get("#next-btn").should("not.exist");
      cy.get("#done-btn").trigger("mouseover").click();

      cy.get("#answers #progress").contains("My Answers (2 / 5)");
      cy.get("#complete-questions").contains("Recorded (2)");
      cy.get("#incomplete-questions").contains("Unrecorded (3)");
    });

    it("shows a single question if ?videoId={questionId}", () => {
      cySetup(cy);
      cyMockLogin();
      cyInterceptGraphQL(cy, [
        cyMockGQL("login", login),
        cyMockGQL("mentor", setup5, true),
        cyMockGQL("subjects", [subjects]),
      ]);
      cy.visit("/record?videoId=A1_1_1");
      cy.get("#progress").contains("Questions 1 / 1");
      cy.get("#question-input").should("have.value", "Who are you and what do you do?");
      cy.get("#transcript-input").should("have.value", "My name is Clint Anderson and I'm a Nuclear Electrician's Mate");
      cy.get("#status").contains("Complete");
      cy.get("#back-btn").should("be.disabled");
      cy.get("#next-btn").should("not.exist");
      cy.get("#done-btn").trigger("mouseover").click();

      cy.get("#answers #progress").contains("My Answers (2 / 5)");
      cy.get("#complete-questions").contains("Recorded (2)");
      cy.get("#incomplete-questions").contains("Unrecorded (3)");
    });

    it("shows multiple questions if ?videoId={questionId}&videoId={questionId}", () => {
      cySetup(cy);
      cyMockLogin();
      cyInterceptGraphQL(cy, [
        cyMockGQL("login", login),
        cyMockGQL("mentor", setup5, true),
        cyMockGQL("subjects", [subjects]),
      ]);
      cy.visit("/record?videoId=A1_1_1&videoId=A3_1_1&videoId=A5_1_1");
      cy.get("#progress").contains("Questions 1 / 3");
      cy.get("#question-input").should("have.value", "Who are you and what do you do?");
      cy.get("#transcript-input").should("have.value", "My name is Clint Anderson and I'm a Nuclear Electrician's Mate");
      cy.get("#status").contains("Complete");
      cy.get("#back-btn").should("be.disabled");
      cy.get("#next-btn").trigger("mouseover").click();

      cy.get("#progress").contains("Questions 2 / 3");
      cy.get("#question-input").should("have.value", "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.");
      cy.get("#transcript-input").should("have.value", "");
      cy.get("#status").contains("Complete");
      cy.get("#back-btn").should("not.be.disabled");
      cy.get("#next-btn").trigger("mouseover").click();

      cy.get("#progress").contains("Questions 3 / 3");
      cy.get("#question-input").should("have.value", "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'");
      cy.get("#transcript-input").should("have.value", "");
      cy.get("#status").contains("Incomplete");
      cy.get("#back-btn").should("not.be.disabled");
      cy.get("#next-btn").should("not.exist");
      cy.get("#done-btn").trigger("mouseover").click();

      cy.get("#answers #progress").contains("My Answers (2 / 5)");
      cy.get("#complete-questions").contains("Recorded (2)");
      cy.get("#incomplete-questions").contains("Unrecorded (3)");
    });

    it("shows all questions for a subject if ?subject={subjectId}", () => {
      cySetup(cy);
      cyMockLogin();
      cyInterceptGraphQL(cy, [
        cyMockGQL("login", login),
        cyMockGQL("mentor", setup5, true),
        cyMockGQL("subjects", [subjects]),
        cyMockGQL("subject", background),
      ]);
      cy.visit("/record?subject=background");
      cy.get("#progress").contains("Questions 1 / 2");
      cy.get("#question-input").should("have.value", "Who are you and what do you do?");
      cy.get("#transcript-input").should("have.value", "My name is Clint Anderson and I'm a Nuclear Electrician's Mate");
      cy.get("#status").contains("Complete");
      cy.get("#back-btn").should("be.disabled");
      cy.get("#next-btn").trigger("mouseover").click();

      cy.get("#progress").contains("Questions 2 / 2");
      cy.get("#question-input").should("have.value", "How old are you now?");
      cy.get("#transcript-input").should("have.value", "");
      cy.get("#status").contains("Incomplete");
      cy.get("#back-btn").should("not.be.disabled");
      cy.get("#next-btn").should("not.exist");
      cy.get("#done-btn").trigger("mouseover").click();

      cy.get("#answers #progress").contains("My Answers (2 / 5)");
      cy.get("#complete-questions").contains("Recorded (2)");
      cy.get("#incomplete-questions").contains("Unrecorded (3)");
    });

    it("shows all incomplete questions for a subject if ?subject={subjectId}&status=Incomplete", () => {
      cySetup(cy);
      cyMockLogin();
      cyInterceptGraphQL(cy, [
        cyMockGQL("login", login),
        cyMockGQL("mentor", setup5, true),
        cyMockGQL("subjects", [subjects]),
        cyMockGQL("subject", background),
      ]);
      cy.visit("/record?subject=background&status=Incomplete");
      cy.get("#progress").contains("Questions 1 / 1");
      cy.get("#question-input").should("have.value", "How old are you now?");
      cy.get("#transcript-input").should("have.value", "");
      cy.get("#status").contains("Incomplete");
      cy.get("#back-btn").should("be.disabled");
      cy.get("#next-btn").should("not.exist");
      cy.get("#done-btn").trigger("mouseover").click();

      cy.get("#answers #progress").contains("My Answers (2 / 5)");
      cy.get("#complete-questions").contains("Recorded (2)");
      cy.get("#incomplete-questions").contains("Unrecorded (3)");
    });

    it("shows all complete questions for a subject if ?subject={subjectId}&status=Complete", () => {
      cySetup(cy);
      cyMockLogin();
      cyInterceptGraphQL(cy, [
        cyMockGQL("login", login),
        cyMockGQL("mentor", setup5, true),
        cyMockGQL("subjects", [subjects]),
        cyMockGQL("subject", background),
      ]);
      cy.visit("/record?subject=background&status=Complete");
      cy.get("#progress").contains("Questions 1 / 1");
      cy.get("#question-input").should("have.value", "Who are you and what do you do?");
      cy.get("#transcript-input").should("have.value", "My name is Clint Anderson and I'm a Nuclear Electrician's Mate");
      cy.get("#status").contains("Complete");
      cy.get("#back-btn").should("be.disabled");
      cy.get("#next-btn").should("not.exist");
      cy.get("#done-btn").trigger("mouseover").click();

      cy.get("#answers #progress").contains("My Answers (2 / 5)");
      cy.get("#complete-questions").contains("Recorded (2)");
      cy.get("#incomplete-questions").contains("Unrecorded (3)");
    });
  });

  it("can update status", () => {
    cySetup(cy);
    cyMockLogin();
    cyInterceptGraphQL(cy, [
      cyMockGQL("login", login),
      cyMockGQL("mentor", [setup0, setup5], true),
      cyMockGQL("updateAnswer", true, true),
      cyMockGQL("subjects", [subjects]),
    ]);
    cy.visit("/record?videoId=A1_1_1");
    cy.get("#progress").contains("Questions 1 / 1");
    cy.get("#question-input").should("have.value", "Who are you and what do you do?");
    cy.get("#transcript-input").should("have.value", "");
    cy.get("#status").contains("Incomplete");

    cy.get("#select-status").trigger('mouseover').click();
    cy.get("#complete").trigger('mouseover').click();
    cy.get("#status").contains("Complete");
  });

  it("can update transcript", () => {
    cySetup(cy);
    cyMockLogin();
    cyInterceptGraphQL(cy, [
      cyMockGQL("login", login),
      cyMockGQL("mentor", [setup0, setup5], true),
      cyMockGQL("updateAnswer", true, true),
      cyMockGQL("subjects", [subjects]),
    ]);
    cy.visit("/record?videoId=A1_1_1");
    cy.get("#progress").contains("Questions 1 / 1");
    cy.get("#question-input").should("have.value", "Who are you and what do you do?");
    cy.get("#status").contains("Incomplete");
    cy.get("#transcript-input").should("have.value", "");
    cy.get("#save-transcript-btn").should("be.disabled");
    cy.get("#undo-transcript-btn").should("be.disabled");

    cy.get("#transcript-input").fill("test");
    cy.get("#transcript-input").should("have.value", "test");
    cy.get("#save-transcript-btn").should("not.be.disabled");
    cy.get("#undo-transcript-btn").should("not.be.disabled");
    cy.get("#undo-transcript-btn").trigger('mouseover').click();
    cy.get("#transcript-input").should("have.value", "");
    cy.get("#save-transcript-btn").should("be.disabled");
    cy.get("#undo-transcript-btn").should("be.disabled");

    cy.get("#transcript-input").fill("My name is Clint Anderson and I'm a Nuclear Electrician's Mate");
    cy.get("#save-transcript-btn").trigger('mouseover').click();
    cy.get("#save-transcript-btn").should("be.disabled");
    cy.get("#undo-transcript-btn").should("be.disabled");
    cy.get("#transcript-input").should("have.value", "My name is Clint Anderson and I'm a Nuclear Electrician's Mate");

    cy.get("#transcript-input").clear().fill("test");
    cy.get("#transcript-input").should("have.value", "test");
    cy.get("#save-transcript-btn").should("not.be.disabled");
    cy.get("#undo-transcript-btn").should("not.be.disabled");
    cy.get("#undo-transcript-btn").trigger('mouseover').click();
    cy.get("#transcript-input").should("have.value", "My name is Clint Anderson and I'm a Nuclear Electrician's Mate");
    cy.get("#save-transcript-btn").should("be.disabled");
    cy.get("#undo-transcript-btn").should("be.disabled");
  });
});
