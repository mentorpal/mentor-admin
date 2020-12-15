/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { cySetup, cyLogin, cyMockGraphQL, cyMockMentor, cyMockByQueryName } from "../support/functions";

describe("Home", () => {
  describe("questions", () => {
    it("logs in and shows current questions", () => {
      cySetup(cy);
      cyMockGraphQL(cy, {
        mocks: [cyLogin(cy), cyMockMentor(require("../fixtures/clint-new"))],
      });
      cy.visit("/");
      cy.get("#nav-bar #title").contains("Mentor Studio");
      cy.get("#questions #progress").contains("Questions (0 / 3)");
      cy.get("#complete-questions").contains("Recorded (0)");
      cy.get("#incomplete-questions").contains("Unrecorded (3)");
    });

    it("lists recorded questions and their topics", () => {
      cySetup(cy);
      cyMockGraphQL(cy, {
        mocks: [cyLogin(cy), cyMockMentor(require("../fixtures/clint-complete"))],
      });
      cy.visit("/");
      cy.get("#complete-questions").contains("Recorded (3)");
      cy.get("#complete-questions #list").children().should("have.length", 3);
      cy.get("#complete-questions #item-0").contains("Who are you and what do you do?");
      cy.get("#complete-questions #item-0").contains("Background");
      cy.get("#complete-questions #item-1").contains("How old are you now?");
      cy.get("#complete-questions #item-1").contains("Background");
      cy.get("#complete-questions #item-2").contains("Can you give me some advice?");
      cy.get("#complete-questions #item-2").contains("Advice");
    });

    it("lists unrecorded questions and their topics", () => {
      cySetup(cy);
      cyMockGraphQL(cy, {
        mocks: [cyLogin(cy), cyMockMentor(require("../fixtures/clint-new"))],
      });
      cy.visit("/");
      cy.get("#incomplete-questions").contains("Unrecorded (3)");
      cy.get("#incomplete-questions #list").children().should("have.length", 3);
      cy.get("#incomplete-questions #item-0").contains("Who are you and what do you do?");
      cy.get("#incomplete-questions #item-0").contains("Background");
      cy.get("#incomplete-questions #item-1").contains("How old are you now?");
      cy.get("#incomplete-questions #item-1").contains("Background");
      cy.get("#incomplete-questions #item-2").contains("Can you give me some advice?");
      cy.get("#incomplete-questions #item-2").contains("Advice");
    });

    it("can expand and collapse recorded questions", () => {
      cySetup(cy);
      cyMockGraphQL(cy, {
        mocks: [cyLogin(cy), cyMockMentor(require("../fixtures/clint-new"))],
      });
      cy.visit("/");
      cy.get("#complete-questions #list").should("not.exist");
      cy.get("#complete-questions #expand-btn").trigger("mouseover").click();
      cy.get("#complete-questions #list").should("exist");
      cy.get("#complete-questions #expand-btn").trigger("mouseover").click();
      cy.get("#complete-questions #list").should("not.exist");
    });

    it("can expand and collapse unrecorded questions", () => {
      cySetup(cy);
      cyMockGraphQL(cy, {
        mocks: [cyLogin(cy), cyMockMentor(require("../fixtures/clint-new"))],
      });
      cy.visit("/");
      cy.get("#incomplete-questions #list").should("exist");
      cy.get("#incomplete-questions #expand-btn").trigger("mouseover").click();
      cy.get("#incomplete-questions #list").should("not.exist");
      cy.get("#incomplete-questions #expand-btn").trigger("mouseover").click();
      cy.get("#incomplete-questions #list").should("exist");
    });

    it("can toggle to select individual questions", () => {
      // TODO
    })

    it("can toggle to select all recorded questions", () => {
      // TODO
    });

    it("can toggle to select all unrecorded questions", () => {
      // TODO
    });

    it("can filter by topic", () => {
      // TODO
    });

    it("record button records all questions if no questions are selected", () => {
      cySetup(cy);
      cyMockGraphQL(cy, {
        mocks: [cyLogin(cy), cyMockMentor(require("../fixtures/clint-new"))],
      });
      cy.visit("/");
      cy.get("#record-btn").trigger("mouseover").click();
      cy.location("pathname").should("contain", "/record");
      cy.location("search").should("eq", "");
      cy.get("#nav-bar #title").contains("Record Mentor");
      cy.get("#progress").contains("Questions 1 / 3");
    });

    it("record button records selected questions if questions are selected", () => {
      // TODO
    });
  });

  describe("mentor", () => {
    it("logs in and shows current mentor details", () => {
      cySetup(cy);
      cyMockGraphQL(cy, {
        mocks: [cyLogin(cy), cyMockMentor(require("../fixtures/clint-new"))],
      });
      cy.visit("/");
      cy.get("#mentor").contains("My Details");
      cy.get("#mentor #video-id").should("have.value", "clintanderson");
      cy.get("#mentor #name").should("have.value", "Clinton Anderson");
      cy.get("#mentor #short-name").should("have.value", "Clint");
      cy.get("#mentor #title").should("have.value", "Nuclear Electrician's Mate");
    });

    it("can edit and save mentor details", () => {
      cySetup(cy);
      cyMockGraphQL(cy, {
        mocks: [cyLogin(cy), cyMockMentor(require("../fixtures/clint-new"))],
      });
      cy.visit("/");
      cy.get("#mentor #video-id").fill("newclintanderson");
      cy.get("#mentor #name").fill("New Clinton Anderson");
      cy.get("#mentor #short-name").fill("New Clint");
      cy.get("#mentor #title").fill("New Nuclear Electrician's Mate");
      cyMockGraphQL(cy, {
        mocks: [cyLogin(cy), cyMockByQueryName("updateMentor", require("../fixtures/clint-updatementor-details"))],
      });
      cy.get("#update-btn").trigger("mouseover").click();
      cy.get("#mentor #video-id").should("have.value", "newclintanderson");
      cy.get("#mentor #name").should("have.value", "New Clinton Anderson");
      cy.get("#mentor #short-name").should("have.value", "New Clint");
      cy.get("#mentor #title").should("have.value", "New Nuclear Electrician's Mate");
    });

    it("validates mentorId", () => {
      // TODO
    });
  });

  describe("alerts", () => {
    it("shows alert if idle has not been recorded", () => {
      cySetup(cy);
      cyMockGraphQL(cy, {
        mocks: [cyLogin(cy), cyMockMentor(require("../fixtures/clint-new"))],
      });
      cy.visit("/");
      cy.get("#alerts #alert-0").contains("Missing Idle Video");
      cy.get("#alerts #alert-0").contains("You have not yet recorded a 30 second calibration idle video of yourself. Click the button to record one now.");
    });

    it("shows alert if unrecorded utterances", () => {
      cySetup(cy);
      cyMockGraphQL(cy, {
        mocks: [cyLogin(cy), cyMockMentor(require("../fixtures/clint-new"))],
      });
      cy.visit("/");
      cy.get("#alerts #alert-1").contains("Record Utterances");
      cy.get("#alerts #alert-1").contains("You have unrecorded utterances. You will be asked to repeat various lines.");
    });

    it("shows alert if unrecorded topic questions", () => {
      cySetup(cy);
      cyMockGraphQL(cy, {
        mocks: [cyLogin(cy), cyMockMentor(require("../fixtures/clint-new"))],
      });
      cy.visit("/");
      cy.get("#alerts #alert-2").contains("Record Background Questions");
      cy.get("#alerts #alert-2").contains("These questions will ask general questions about your background, that might be relevant to how people understand your career");
    });

    it("does not show idle alert if idle has been recorded", () => {
      cySetup(cy);
      cyMockGraphQL(cy, {
        mocks: [cyLogin(cy), cyMockMentor(require("../fixtures/clint-complete"))],
      });
      cy.visit("/");
      cy.get("#alerts").should("not.contain", "Missing Idle Video");
    });

    it("does not show utterance alert if utterances have been recorded", () => {
      cySetup(cy);
      cyMockGraphQL(cy, {
        mocks: [cyLogin(cy), cyMockMentor(require("../fixtures/clint-complete"))],
      });
      cy.visit("/");
      cy.get("#alerts").should("not.contain", "Record Utterances");
    });

    it("does not show topic alert if topics have been recorded", () => {
      cySetup(cy);
      cyMockGraphQL(cy, {
        mocks: [cyLogin(cy), cyMockMentor(require("../fixtures/clint-complete"))],
      });
      cy.visit("/");
      cy.get("#alerts").should("not.contain", "Record Background Questions");
    });

    it("clicking idle alert goes to record idle", () => {
      cySetup(cy);
      cyMockGraphQL(cy, {
        mocks: [cyLogin(cy), cyMockMentor(require("../fixtures/clint-new"))],
      });
      cy.visit("/");
      cy.get("#alerts #alert-0 #alert-btn").trigger("mouseover").click();
      cy.location("pathname").should("contain", "/record");
      cy.location("search").should("eq", "?videoId=U1_1_1");
      cy.get("#nav-bar #title").contains("Record Mentor");
      cy.get("#progress").contains("Questions 1 / 1");
    });

    it("clicking utterance alert goes to record incomplete utterances", () => {
      cySetup(cy);
      cyMockGraphQL(cy, {
        mocks: [cyLogin(cy), cyMockMentor(require("../fixtures/clint-new"))],
      });
      cy.visit("/");
      cy.get("#alerts #alert-1 #alert-btn").trigger("mouseover").click();
      cy.location("pathname").should("contain", "/record");
      cy.location("search").should("eq", "?utterance=true&status=Incomplete");
      cy.get("#nav-bar #title").contains("Record Mentor");
      cy.get("#progress").contains("Questions 1 / 3");
    });

    it("clicking topic alert goes to record incomplete topic questions", () => {
      cySetup(cy);
      cyMockGraphQL(cy, {
        mocks: [cyLogin(cy), cyMockMentor(require("../fixtures/clint-new"))],
      });
      cy.visit("/");
      cy.get("#alerts #alert-2 #alert-btn").trigger("mouseover").click();
      cy.location("pathname").should("contain", "/record");
      cy.location("search").should("eq", "?topic=background&status=Incomplete");
      cy.get("#nav-bar #title").contains("Record Mentor");
      cy.get("#progress").contains("Questions 1 / 2");
    });
  });
});
