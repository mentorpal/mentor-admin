/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  cySetup,
  cyMockDefault,
  mockGQL,
  cyMockTrain,
  cyMockTrainStatus,
} from "../support/functions";
import { setup7 } from "../fixtures/mentor";
import { TrainState } from "../support/types";

describe("Review answers page", () => {
  it("shows all questions for all subjects by default", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: setup7 });
    cy.visit("/");
    cy.get("#select-subject").contains("All Answers (4 / 5)");
    cy.get("#recording-blocks").children().should("have.length", 2);
    cy.get("#recording-blocks #block-0 #block-name").contains("Background");
    cy.get("#recording-blocks #block-0 #block-progress").contains(
      "2 / 2 (100%)"
    );
    cy.get("#recording-blocks #block-0 #block-description").contains(
      "These questions will ask general questions about your background that might be relevant to how people understand your career."
    );
    cy.get("#recording-blocks #block-0 #answers-Complete").contains(
      "Complete (2)"
    );
    cy.get("#recording-blocks #block-0 #answers-Complete #record-all").should(
      "not.be.disabled"
    );
    cy.get("#recording-blocks #block-0 #answers-Complete #add-question").should(
      "not.exist"
    );
    cy.get("#recording-blocks #block-0 #answers-Complete #expand-btn")
      .trigger("mouseover")
      .click();
    cy.get("#recording-blocks #block-0 #answers-Complete #list")
      .children()
      .should("have.length", 2);
    cy.get("#recording-blocks #block-0 #answers-Complete #item-0").contains(
      "Who are you and what do you do?"
    );
    cy.get("#recording-blocks #block-0 #answers-Complete #item-0").contains(
      "My name is Clint Anderson and I'm a Nuclear Electrician's Mate"
    );
    cy.get("#recording-blocks #block-0 #answers-Complete #item-1").contains(
      "How old are you now?"
    );
    cy.get("#recording-blocks #block-0 #answers-Complete #item-1").contains(
      "I'm 37 years old"
    );
    cy.get("#recording-blocks #block-0 #answers-Incomplete").contains(
      "Incomplete (0)"
    );
    cy.get("#recording-blocks #block-0 #answers-Incomplete #record-all").should(
      "be.disabled"
    );
    cy.get(
      "#recording-blocks #block-0 #answers-Incomplete #add-question"
    ).should("exist");
    cy.get("#recording-blocks #block-0 #answers-Incomplete #expand-btn")
      .trigger("mouseover")
      .click();
    cy.get("#recording-blocks #block-0 #answers-Incomplete #list")
      .children()
      .should("have.length", 0);

    cy.get("#recording-blocks #block-1 #block-name").contains(
      "Repeat After Me"
    );
    cy.get("#recording-blocks #block-1 #block-progress").contains(
      "2 / 3 (67%)"
    );
    cy.get("#recording-blocks #block-1 #block-description").contains(
      "These are miscellaneous phrases you'll be asked to repeat."
    );
    cy.get("#recording-blocks #block-1 #answers-Complete").contains(
      "Complete (2)"
    );
    cy.get("#recording-blocks #block-1 #answers-Complete #record-all").should(
      "not.be.disabled"
    );
    cy.get("#recording-blocks #block-1 #answers-Complete #add-question").should(
      "not.exist"
    );
    cy.get("#recording-blocks #block-1 #answers-Complete #expand-btn")
      .trigger("mouseover")
      .click();
    cy.get("#recording-blocks #block-1 #answers-Complete #list")
      .children()
      .should("have.length", 2);
    cy.get("#recording-blocks #block-1 #answers-Complete #item-0").contains(
      "Please look at the camera for 30 seconds without speaking. Try to remain in the same position."
    );
    cy.get("#recording-blocks #block-1 #answers-Complete #item-1").contains(
      "Please give a short introduction of yourself, which includes your name, current job, and title."
    );
    cy.get("#recording-blocks #block-1 #answers-Complete #item-1").contains(
      "My name is Clint Anderson I'm a Nuclear Electrician's Mate"
    );
    cy.get("#recording-blocks #block-1 #answers-Incomplete").contains(
      "Incomplete (1)"
    );
    cy.get("#recording-blocks #block-1 #answers-Incomplete #record-all").should(
      "not.be.disabled"
    );
    cy.get(
      "#recording-blocks #block-1 #answers-Incomplete #add-question"
    ).should("exist");
    cy.get("#recording-blocks #block-1 #answers-Incomplete #expand-btn")
      .trigger("mouseover")
      .click();
    cy.get("#recording-blocks #block-1 #answers-Incomplete #list")
      .children()
      .should("have.length", 1);
    cy.get("#recording-blocks #block-1 #answers-Incomplete #item-0").contains(
      "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'"
    );
  });

  it("can pick a subject from dropdown and view questions and categories", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: setup7 });
    cy.visit("/");
    cy.get("#select-subject").contains("All Answers (4 / 5)");
    cy.get("#select-subject").trigger("mouseover").click();
    cy.get("#select-background").trigger("mouseover").click();
    cy.get("#select-subject").contains("Background (2 / 2)");
    cy.get("#recording-blocks").children().should("have.length", 2);
    cy.get("#recording-blocks #block-0 #block-name").contains("Category");
    cy.get("#recording-blocks #block-0 #block-progress").contains(
      "1 / 1 (100%)"
    );
    cy.get("#recording-blocks #block-0 #block-description").contains(
      "A category"
    );
    cy.get("#recording-blocks #block-0 #answers-Complete").contains(
      "Complete (1)"
    );
    cy.get("#recording-blocks #block-0 #answers-Complete #record-all").should(
      "not.be.disabled"
    );
    cy.get("#recording-blocks #block-0 #answers-Complete #add-question").should(
      "not.exist"
    );
    cy.get("#recording-blocks #block-0 #answers-Complete #expand-btn")
      .trigger("mouseover")
      .click();
    cy.get("#recording-blocks #block-0 #answers-Complete #list")
      .children()
      .should("have.length", 1);
    cy.get("#recording-blocks #block-0 #answers-Complete #item-0").contains(
      "Who are you and what do you do?"
    );
    cy.get("#recording-blocks #block-0 #answers-Complete #item-0").contains(
      "My name is Clint Anderson and I'm a Nuclear Electrician's Mate"
    );
    cy.get("#recording-blocks #block-0 #answers-Incomplete").contains(
      "Incomplete (0)"
    );
    cy.get("#recording-blocks #block-0 #answers-Incomplete #record-all").should(
      "be.disabled"
    );
    cy.get(
      "#recording-blocks #block-0 #answers-Incomplete #add-question"
    ).should("exist");
    cy.get("#recording-blocks #block-0 #answers-Incomplete #expand-btn")
      .trigger("mouseover")
      .click();
    cy.get("#recording-blocks #block-0 #answers-Incomplete #list")
      .children()
      .should("have.length", 0);
    cy.get("#recording-blocks #block-1 #block-name").contains("Background");
    cy.get("#recording-blocks #block-1 #block-progress").contains(
      "1 / 1 (100%)"
    );
    cy.get("#recording-blocks #block-1 #block-description").contains(
      "These questions will ask general questions about your background that might be relevant to how people understand your career."
    );
    cy.get("#recording-blocks #block-1 #answers-Complete").contains(
      "Complete (1)"
    );
    cy.get("#recording-blocks #block-1 #answers-Complete #record-all").should(
      "not.be.disabled"
    );
    cy.get("#recording-blocks #block-1 #answers-Complete #add-question").should(
      "not.exist"
    );
    cy.get("#recording-blocks #block-1 #answers-Complete #expand-btn")
      .trigger("mouseover")
      .click();
    cy.get("#recording-blocks #block-1 #answers-Complete #list")
      .children()
      .should("have.length", 1);
    cy.get("#recording-blocks #block-1 #answers-Complete #item-0").contains(
      "How old are you now?"
    );
    cy.get("#recording-blocks #block-1 #answers-Complete #item-0").contains(
      "I'm 37 years old"
    );
    cy.get("#recording-blocks #block-1 #answers-Incomplete").contains(
      "Incomplete (0)"
    );
    cy.get("#recording-blocks #block-1 #answers-Incomplete #record-all").should(
      "be.disabled"
    );
    cy.get(
      "#recording-blocks #block-1 #answers-Incomplete #add-question"
    ).should("exist");
    cy.get("#recording-blocks #block-1 #answers-Incomplete #expand-btn")
      .trigger("mouseover")
      .click();
    cy.get("#recording-blocks #block-1 #answers-Incomplete #list")
      .children()
      .should("have.length", 0);
  });

  it("can pick a subject from query params and view questions and categories", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: setup7 });
    cy.visit("/?subject=background");
    cy.get("#select-subject").contains("Background (2 / 2)");
    cy.get("#recording-blocks").children().should("have.length", 2);
    cy.get("#recording-blocks #block-0 #block-name").contains("Category");
    cy.get("#recording-blocks #block-0 #block-progress").contains(
      "1 / 1 (100%)"
    );
    cy.get("#recording-blocks #block-0 #block-description").contains(
      "A category"
    );
    cy.get("#recording-blocks #block-0 #answers-Complete").contains(
      "Complete (1)"
    );
    cy.get("#recording-blocks #block-0 #answers-Complete #record-all").should(
      "not.be.disabled"
    );
    cy.get("#recording-blocks #block-0 #answers-Complete #add-question").should(
      "not.exist"
    );
    cy.get("#recording-blocks #block-0 #answers-Complete #expand-btn")
      .trigger("mouseover")
      .click();
    cy.get("#recording-blocks #block-0 #answers-Complete #list")
      .children()
      .should("have.length", 1);
    cy.get("#recording-blocks #block-0 #answers-Complete #item-0").contains(
      "Who are you and what do you do?"
    );
    cy.get("#recording-blocks #block-0 #answers-Complete #item-0").contains(
      "My name is Clint Anderson and I'm a Nuclear Electrician's Mate"
    );
    cy.get("#recording-blocks #block-0 #answers-Incomplete").contains(
      "Incomplete (0)"
    );
    cy.get("#recording-blocks #block-0 #answers-Incomplete #record-all").should(
      "be.disabled"
    );
    cy.get(
      "#recording-blocks #block-0 #answers-Incomplete #add-question"
    ).should("exist");
    cy.get("#recording-blocks #block-0 #answers-Incomplete #expand-btn")
      .trigger("mouseover")
      .click();
    cy.get("#recording-blocks #block-0 #answers-Incomplete #list")
      .children()
      .should("have.length", 0);
    cy.get("#recording-blocks #block-1 #block-name").contains("Background");
    cy.get("#recording-blocks #block-1 #block-progress").contains(
      "1 / 1 (100%)"
    );
    cy.get("#recording-blocks #block-1 #block-description").contains(
      "These questions will ask general questions about your background that might be relevant to how people understand your career."
    );
    cy.get("#recording-blocks #block-1 #answers-Complete").contains(
      "Complete (1)"
    );
    cy.get("#recording-blocks #block-1 #answers-Complete #record-all").should(
      "not.be.disabled"
    );
    cy.get("#recording-blocks #block-1 #answers-Complete #add-question").should(
      "not.exist"
    );
    cy.get("#recording-blocks #block-1 #answers-Complete #expand-btn")
      .trigger("mouseover")
      .click();
    cy.get("#recording-blocks #block-1 #answers-Complete #list")
      .children()
      .should("have.length", 1);
    cy.get("#recording-blocks #block-1 #answers-Complete #item-0").contains(
      "How old are you now?"
    );
    cy.get("#recording-blocks #block-1 #answers-Complete #item-0").contains(
      "I'm 37 years old"
    );
    cy.get("#recording-blocks #block-1 #answers-Incomplete").contains(
      "Incomplete (0)"
    );
    cy.get("#recording-blocks #block-1 #answers-Incomplete #record-all").should(
      "be.disabled"
    );
    cy.get(
      "#recording-blocks #block-1 #answers-Incomplete #add-question"
    ).should("exist");
    cy.get("#recording-blocks #block-1 #answers-Incomplete #expand-btn")
      .trigger("mouseover")
      .click();
    cy.get("#recording-blocks #block-1 #answers-Incomplete #list")
      .children()
      .should("have.length", 0);
  });

  it("can record all complete for a subject", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: setup7 });
    cy.visit("/");
    cy.get("#select-subject").contains("All Answers (4 / 5)");
    cy.get("#recording-blocks #block-0 #block-name").contains("Background");
    cy.get("#recording-blocks #block-0 #answers-Complete #record-all")
      .trigger("mouseover")
      .click();
    cy.location("pathname").should("contain", "/record");
    cy.location("search").should(
      "contain",
      "?back=/?subject=undefined&status=COMPLETE&subject=background&category="
    );
  });

  it("can record all incomplete for a subject", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: setup7 });
    cy.visit("/");
    cy.get("#select-subject").contains("All Answers (4 / 5)");
    cy.get("#recording-blocks #block-1 #block-name").contains(
      "Repeat After Me"
    );
    cy.get("#recording-blocks #block-1 #answers-Incomplete #record-all")
      .trigger("mouseover")
      .click();
    cy.location("pathname").should("contain", "/record");
    cy.location("search").should(
      "contain",
      "?back=/?subject=undefined&status=INCOMPLETE&subject=repeat_after_me&category="
    );
  });

  it("can record a single question in a subject", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: setup7 });
    cy.visit("/");
    cy.get("#select-subject").contains("All Answers (4 / 5)");
    cy.get("#recording-blocks #block-0 #block-name").contains("Background");
    cy.get("#recording-blocks #block-0 #answers-Complete #expand-btn")
      .trigger("mouseover")
      .click();
    cy.get("#recording-blocks #block-0 #answers-Complete #list")
      .children()
      .should("have.length", 2);
    cy.get("#recording-blocks #block-0 #answers-Complete #item-0").contains(
      "Who are you and what do you do?"
    );
    cy.get("#record-one").trigger("mouseover").click();
    cy.location("pathname").should("contain", "/record");
    cy.location("search").should(
      "contain",
      "?back=/?subject=undefined&videoId=A1_1_1"
    );
    cy.get("[data-cy=question-input]").within($input => {
      cy.get("textarea").should('have.text', "Who are you and what do you do?")
      cy.get("textarea").should("have.attr", "disabled");
    });
  });

  it("can add a mentor question to a subject", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: setup7 });
    cy.visit("/");
    cy.get("#select-subject").contains("All Answers (4 / 5)");
    cy.get("#recording-blocks #block-1 #block-name").contains(
      "Repeat After Me"
    );
    cy.get("#recording-blocks #block-1 #answers-Incomplete").contains(
      "Incomplete (1)"
    );
    cy.get("#recording-blocks #block-1 #answers-Incomplete #expand-btn")
      .trigger("mouseover")
      .click();
    cy.get(
      "#recording-blocks #block-1 #answers-Incomplete #add-question"
    ).should("exist");
    cy.get("#recording-blocks #block-1 #answers-Incomplete #list")
      .children()
      .should("have.length", 1);
    cy.get("#recording-blocks #block-1 #answers-Incomplete #item-0").contains(
      "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'"
    );
    cy.get("#save-button").should("be.disabled");
    cy.get("#recording-blocks #block-1 #answers-Incomplete #add-question")
      .trigger("mouseover")
      .click();
    cy.get("#recording-blocks #block-1 #answers-Incomplete #list")
      .children()
      .should("have.length", 2);
    cy.get(
      "#recording-blocks #block-1 #answers-Incomplete #item-0 #edit-question"
    ).should("have.value", "");
    cy.get("#recording-blocks #block-1 #answers-Incomplete #item-1").contains(
      "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'"
    );
    cy.get("#save-button").should("not.be.disabled");
  });

  it("can record all complete for a category", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: setup7 });
    cy.visit("/?subject=background");
    cy.get("#select-subject").contains("Background (2 / 2)");
    cy.get("#recording-blocks #block-0 #block-name").contains("Category");
    cy.get("#recording-blocks #block-0 #answers-Complete #record-all")
      .trigger("mouseover")
      .click();
    cy.location("pathname").should("contain", "/record");
    cy.location("search").should(
      "contain",
      "?back=/?subject=background&status=COMPLETE&subject=background&category=category"
    );
  });

  it("can record all incomplete for a category", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: setup7 });
    cy.visit("/?subject=repeat_after_me");
    cy.get("#select-subject").contains("Repeat After Me (2 / 3)");
    cy.get("#recording-blocks #block-0 #block-name").contains("Category2");
    cy.get("#recording-blocks #block-0 #answers-Incomplete #record-all")
      .trigger("mouseover")
      .click();
    cy.location("pathname").should("contain", "/record");
    cy.location("search").should(
      "contain",
      "?back=/?subject=repeat_after_me&status=INCOMPLETE&subject=repeat_after_me&category=category2"
    );
  });

  it("can record a single question in a category", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: setup7 });
    cy.visit("/?subject=background");
    cy.get("#select-subject").contains("Background (2 / 2)");
    cy.get("#recording-blocks #block-0 #block-name").contains("Category");
    cy.get("#recording-blocks #block-0 #answers-Complete #expand-btn")
      .trigger("mouseover")
      .click();
    cy.get("#recording-blocks #block-0 #answers-Complete #list")
      .children()
      .should("have.length", 1);
    cy.get("#recording-blocks #block-0 #answers-Complete #item-0").contains(
      "Who are you and what do you do?"
    );
    cy.get("#record-one").trigger("mouseover").click();
    cy.location("pathname").should("contain", "/record");
    cy.location("search").should(
      "contain",
      "?back=/?subject=background&videoId=A1_1_1"
    );
    cy.get("[data-cy=question-input]").within($input => {
      cy.get("textarea").should('have.text', "Who are you and what do you do?")
      cy.get("textarea").should("have.attr", "disabled");
    });
  });

  it("can add a mentor question to a category", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: setup7 });
    cy.visit("/?subject=repeat_after_me");
    cy.get("#select-subject").contains("Repeat After Me (2 / 3)");
    cy.get("#recording-blocks #block-0 #block-name").contains("Category2");
    cy.get("#recording-blocks #block-0 #answers-Incomplete").contains(
      "Incomplete (1)"
    );
    cy.get("#recording-blocks #block-0 #answers-Incomplete #expand-btn")
      .trigger("mouseover")
      .click();
    cy.get(
      "#recording-blocks #block-0 #answers-Incomplete #add-question"
    ).should("exist");
    cy.get("#recording-blocks #block-0 #answers-Incomplete #list")
      .children()
      .should("have.length", 1);
    cy.get("#recording-blocks #block-0 #answers-Incomplete #item-0").contains(
      "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'"
    );
    cy.get("#save-button").should("be.disabled");
    cy.get("#recording-blocks #block-0 #answers-Incomplete #add-question")
      .trigger("mouseover")
      .click();
    cy.get("#recording-blocks #block-0 #answers-Incomplete #list")
      .children()
      .should("have.length", 2);
    cy.get(
      "#recording-blocks #block-0 #answers-Incomplete #item-0 #edit-question"
    ).should("have.value", "");
    cy.get("#recording-blocks #block-0 #answers-Incomplete #item-1").contains(
      "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'"
    );
    cy.get("#save-button").should("not.be.disabled");
  });

  it("can edit a mentor question", () => {
    cySetup(cy);
    cyMockDefault(cy, { mentor: setup7 });
    cy.visit("/?subject=repeat_after_me");
    cy.get("#select-subject").contains("Repeat After Me (2 / 3)");
    cy.get("#recording-blocks #block-0 #block-name").contains("Category2");
    cy.get("#recording-blocks #block-0 #answers-Incomplete").contains(
      "Incomplete (1)"
    );
    cy.get("#recording-blocks #block-0 #answers-Incomplete #expand-btn")
      .trigger("mouseover")
      .click();
    cy.get(
      "#recording-blocks #block-0 #answers-Incomplete #add-question"
    ).should("exist");
    cy.get("#recording-blocks #block-0 #answers-Incomplete #list")
      .children()
      .should("have.length", 1);
    cy.get("#recording-blocks #block-0 #answers-Incomplete #item-0").contains(
      "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'"
    );
    cy.get("#save-button").should("be.disabled");
    cy.get("#recording-blocks #block-0 #answers-Incomplete #add-question")
      .trigger("mouseover")
      .click();
    cy.get("#recording-blocks #block-0 #answers-Incomplete #list")
      .children()
      .should("have.length", 2);
    cy.get(
      "#recording-blocks #block-0 #answers-Incomplete #item-0 #edit-question"
    ).should("have.value", "");
    cy.get(
      "#recording-blocks #block-0 #answers-Incomplete #item-0 #edit-question"
    )
      .clear()
      .type("test")
      .should("have.value", "test");
    cy.get("#recording-blocks #block-0 #answers-Incomplete #item-1").contains(
      "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'"
    );
    cy.get("#save-button").should("not.be.disabled");
  });

  it("fails to train mentor", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: setup7,
      gqlQueries: [mockGQL("updateMentor", true, true)],
    });
    cy.visit("/");
    cy.get("#train-button").trigger("mouseover").click();
    cy.contains("Training failed");
  });

  it("can train mentor", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: setup7,
      gqlQueries: [mockGQL("updateMentor", true, true)],
    });
    cyMockTrain(cy);
    cyMockTrainStatus(cy, { status: { state: TrainState.SUCCESS } });
    cy.visit("/");
    cy.get("#train-button").trigger("mouseover").click();
    cy.contains("Training mentor...");
    cy.contains("Training succeeded");
  });
});
