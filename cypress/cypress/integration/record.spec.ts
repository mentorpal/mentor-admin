/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { cySetup, cyLogin, cyMockGraphQL, cyMockMentor, cyMockByQueryName } from "../support/functions";

describe("Record", () => {
  describe("search params", () => {
    it("records all questions if no params", () => {
      cySetup(cy);
      cyMockGraphQL(cy, {
        mocks: [cyLogin(cy), cyMockMentor(require("../fixtures/clint-partial"))],
      });
      cy.visit("/record");
      cy.get("#progress").contains("Questions 1 / 3");
      cy.get("#question-input").should("have.value", "Who are you and what do you do?");
      cy.get("#transcript-input").should("have.value", "My name is Clint Anderson and I'm a Nuclear Electrician's Mate.");
      cy.get("#topics").contains("Background");
      cy.get("#status").contains("Complete");
      cy.get("#back-btn").should("be.disabled");
      cy.get("#next-btn").trigger("mouseover").click();

      cy.get("#progress").contains("Questions 2 / 3");
      cy.get("#question-input").should("have.value", "How old are you now?");
      cy.get("#transcript-input").should("have.value", "");
      cy.get("#topics").contains("Background");
      cy.get("#status").contains("Incomplete");
      cy.get("#back-btn").should("not.be.disabled");
      cy.get("#next-btn").trigger("mouseover").click();

      cy.get("#progress").contains("Questions 3 / 3");
      cy.get("#question-input").should("have.value", "Can you give me some advice?");
      cy.get("#transcript-input").should("have.value", "Study hard and get into a good college.");
      cy.get("#topics").contains("Advice");
      cy.get("#status").contains("Complete");
      cy.get("#next-btn").should("be.disabled");
      cy.get("#back-btn").trigger("mouseover").click();

      cy.get("#progress").contains("Questions 2 / 3");
      cy.get("#question-input").should("have.value", "How old are you now?");
      cy.get("#transcript-input").should("have.value", "");
      cy.get("#topics").contains("Background");
      cy.get("#status").contains("Incomplete");
      cy.get("#back-btn").should("not.be.disabled");
      cy.get("#next-btn").should("not.be.disabled");
    });

    it("records all incomplete questions if ?status=Incomplete", () => {
      cySetup(cy);
      cyMockGraphQL(cy, {
        mocks: [cyLogin(cy), cyMockMentor(require("../fixtures/clint-partial"))],
      });
      cy.visit("/record?status=Incomplete");
      cy.get("#progress").contains("Questions 1 / 1");
      cy.get("#question-input").should("have.value", "How old are you now?");
      cy.get("#transcript-input").should("have.value", "");
      cy.get("#topics").contains("Background");
      cy.get("#status").contains("Incomplete");
      cy.get("#back-btn").should("be.disabled");
      cy.get("#next-btn").should("be.disabled");
    });

    it("records all complete questions if ?status=Complete", () => {
      cySetup(cy);
      cyMockGraphQL(cy, {
        mocks: [cyLogin(cy), cyMockMentor(require("../fixtures/clint-partial"))],
      });
      cy.visit("/record?status=Complete");
      cy.get("#progress").contains("Questions 1 / 2");
      cy.get("#question-input").should("have.value", "Who are you and what do you do?");
      cy.get("#transcript-input").should("have.value", "My name is Clint Anderson and I'm a Nuclear Electrician's Mate.");
      cy.get("#topics").contains("Background");
      cy.get("#status").contains("Complete");
      cy.get("#back-btn").should("be.disabled");
      cy.get("#next-btn").trigger("mouseover").click();

      cy.get("#progress").contains("Questions 2 / 2");
      cy.get("#question-input").should("have.value", "Can you give me some advice?");
      cy.get("#transcript-input").should("have.value", "Study hard and get into a good college.");
      cy.get("#topics").contains("Advice");
      cy.get("#status").contains("Complete");
      cy.get("#next-btn").should("be.disabled");
      cy.get("#back-btn").should("not.be.disabled");
    });

    it("records a single video if ?videoId has one value", () => {
      cySetup(cy);
      cyMockGraphQL(cy, {
        mocks: [cyLogin(cy), cyMockMentor(require("../fixtures/clint-new"))],
      });
      cy.visit("/record?videoId=A1_1_1");
      cy.get("#progress").contains("Questions 1 / 1");
      cy.get("#question-input").should("have.value", "Who are you and what do you do?");
    });

    it("records multiple videos if ?videoId has multiple values", () => {
      cySetup(cy);
      cyMockGraphQL(cy, {
        mocks: [cyLogin(cy), cyMockMentor(require("../fixtures/clint-new"))],
      });
      cy.visit("/record?videoId=A1_1_1&videoId=U1_1_1");
      cy.get("#progress").contains("Questions 1 / 2");
      cy.get("#question-input").should("have.value", "Who are you and what do you do?");
      cy.get("#next-btn").trigger("mouseover").click();
      cy.get("#question-input").should("have.value", "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.");
    });

    it("records all questions for a topic if ?topic is set", () => {
      cySetup(cy);
      cyMockGraphQL(cy, {
        mocks: [cyLogin(cy), cyMockMentor(require("../fixtures/clint-partial"))],
      });
      cy.visit("/record?topic=background");
      cy.get("#progress").contains("Questions 1 / 2");
      cy.get("#question-input").should("have.value", "Who are you and what do you do?");
      cy.get("#transcript-input").should("have.value", "My name is Clint Anderson and I'm a Nuclear Electrician's Mate.");
      cy.get("#topics").contains("Background");
      cy.get("#status").contains("Complete");
      cy.get("#back-btn").should("be.disabled");
      cy.get("#next-btn").trigger("mouseover").click();

      cy.get("#progress").contains("Questions 2 / 2");
      cy.get("#question-input").should("have.value", "How old are you now?");
      cy.get("#transcript-input").should("have.value", "");
      cy.get("#topics").contains("Background");
      cy.get("#status").contains("Incomplete");
      cy.get("#back-btn").should("not.be.disabled");
      cy.get("#next-btn").should("be.disabled");
    });

    it("records incomplete questions for a topic", () => {
      cySetup(cy);
      cyMockGraphQL(cy, {
        mocks: [cyLogin(cy), cyMockMentor(require("../fixtures/clint-partial"))],
      });
      cy.visit("/record?topic=background&status=Incomplete");
      cy.get("#progress").contains("Questions 1 / 1");
      cy.get("#question-input").should("have.value", "How old are you now?");
      cy.get("#transcript-input").should("have.value", "");
      cy.get("#topics").contains("Background");
      cy.get("#status").contains("Incomplete");
      cy.get("#back-btn").should("be.disabled");
      cy.get("#next-btn").should("be.disabled");
    });

    it("records complete questions for a topic", () => {
      cySetup(cy);
      cyMockGraphQL(cy, {
        mocks: [cyLogin(cy), cyMockMentor(require("../fixtures/clint-partial"))],
      });
      cy.visit("/record?topic=background&status=Complete");
      cy.get("#progress").contains("Questions 1 / 1");
      cy.get("#question-input").should("have.value", "Who are you and what do you do?");
      cy.get("#transcript-input").should("have.value", "My name is Clint Anderson and I'm a Nuclear Electrician's Mate.");
      cy.get("#topics").contains("Background");
      cy.get("#status").contains("Complete");
      cy.get("#back-btn").should("be.disabled");
      cy.get("#next-btn").should("be.disabled");
    });

    it("records all utterances if ?utterance is set", () => {
      cySetup(cy);
      cyMockGraphQL(cy, {
        mocks: [cyLogin(cy), cyMockMentor(require("../fixtures/clint-partial"))],
      });
      cy.visit("/record?utterance=true");
      cy.get("#progress").contains("Questions 1 / 3");
      cy.get("#question-input").should("have.value", "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.");
      cy.get("#transcript-input").should("have.value", "");
      cy.get("#topics").contains("Idle");
      cy.get("#status").contains("Complete");
      cy.get("#back-btn").should("be.disabled");
      cy.get("#next-btn").trigger("mouseover").click();

      cy.get("#progress").contains("Questions 2 / 3");
      cy.get("#question-input").should("have.value", "Please give a short introduction of yourself, which includes your name, current job, and title.");
      cy.get("#transcript-input").should("have.value", "My name is Clint Anderson and I'm a Nuclear Electrician's Mate in the Navy. I studied Computer Science at USC.");
      cy.get("#topics").contains("Intro");
      cy.get("#status").contains("Complete");
      cy.get("#back-btn").should("not.be.disabled");
      cy.get("#next-btn").trigger("mouseover").click();

      cy.get("#progress").contains("Questions 3 / 3");
      cy.get("#question-input").should("have.value", "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'");
      cy.get("#transcript-input").should("have.value", "");
      cy.get("#topics").contains("OffTopic");
      cy.get("#status").contains("Incomplete");
      cy.get("#back-btn").should("not.be.disabled");
      cy.get("#next-btn").should("be.disabled");
    });

    it("records incomplete utterances", () => {
      cySetup(cy);
      cyMockGraphQL(cy, {
        mocks: [cyLogin(cy), cyMockMentor(require("../fixtures/clint-partial"))],
      });
      cy.visit("/record?utterance=true&status=Incomplete");
      cy.get("#progress").contains("Questions 1 / 1");
      cy.get("#question-input").should("have.value", "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'");
      cy.get("#transcript-input").should("have.value", "");
      cy.get("#topics").contains("OffTopic");
      cy.get("#status").contains("Incomplete");
      cy.get("#back-btn").should("be.disabled");
      cy.get("#next-btn").should("be.disabled");
    });

    it("records complete utterances", () => {
      cySetup(cy);
      cyMockGraphQL(cy, {
        mocks: [cyLogin(cy), cyMockMentor(require("../fixtures/clint-partial"))],
      });
      cy.visit("/record?utterance=true&status=Complete");
      cy.get("#progress").contains("Questions 1 / 2");
      cy.get("#question-input").should("have.value", "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.");
      cy.get("#transcript-input").should("have.value", "");
      cy.get("#topics").contains("Idle");
      cy.get("#status").contains("Complete");
      cy.get("#back-btn").should("be.disabled");
      cy.get("#next-btn").trigger("mouseover").click();

      cy.get("#progress").contains("Questions 2 / 2");
      cy.get("#question-input").should("have.value", "Please give a short introduction of yourself, which includes your name, current job, and title.");
      cy.get("#transcript-input").should("have.value", "My name is Clint Anderson and I'm a Nuclear Electrician's Mate in the Navy. I studied Computer Science at USC.");
      cy.get("#topics").contains("Intro");
      cy.get("#status").contains("Complete");
      cy.get("#back-btn").should("not.be.disabled");
      cy.get("#next-btn").should("be.disabled");
    });
  });

  it("can record a video", () => {

  });

  it("can replay and re-record a video", () => {

  });

  it("can update status", () => {
    cySetup(cy);
    cyMockGraphQL(cy, {
      mocks: [
        cyLogin(cy),
        cyMockByQueryName("mentor", require("../fixtures/update-status/mentor"))
      ],
    });
    cy.visit("/record?videoId=A1_1_1");
    cy.get("#progress").contains("Questions 1 / 1");
    cy.get("#question-input").should("have.value", "Who are you and what do you do?");
    cy.get("#transcript-input").should("have.value", "");
    cy.get("#topics").contains("Background");
    cy.get("#status").contains("Incomplete");

    cyMockGraphQL(cy, {
      mocks: [
        cyLogin(cy),
        cyMockByQueryName("mentor", require("../fixtures/update-status/mentor")),
        cyMockByQueryName("updateQuestion", require("../fixtures/update-status/update-question"))
      ],
    });
    cy.get("#select-status").trigger('mouseover').click();
    cy.get("#complete").trigger('mouseover').click();
    cy.get("#status").contains("Complete");
  });

  it("can update transcript", () => {
    cySetup(cy);
    cyMockGraphQL(cy, {
      mocks: [
        cyLogin(cy),
        cyMockByQueryName("mentor", require("../fixtures/generate-transcript/mentor"))
      ],
    });
    cy.visit("/record?videoId=A1_1_1");
    cy.get("#progress").contains("Questions 1 / 1");
    cy.get("#question-input").should("have.value", "Who are you and what do you do?");
    cy.get("#transcript-input").should("have.value", "");
    cy.get("#topics").contains("Background");
    cy.get("#status").contains("Incomplete");

    cyMockGraphQL(cy, {
      mocks: [
        cyLogin(cy),
        cyMockByQueryName("mentor", require("../fixtures/generate-transcript/mentor")),
        cyMockByQueryName("updateQuestion", require("../fixtures/generate-transcript/update-question"))
      ],
    });
    cy.get("#transcript-input").fill("test");
    cy.get("#transcript-input").should("have.value", "test");
  });

  it("can auto-generate transcript", () => {

  });

  it("can search and add topics", () => {

  });
});
