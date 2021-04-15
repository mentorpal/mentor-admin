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
import {
  setup0,
  setup1,
  setup2,
  setup3,
  setup4,
  setup5,
  setup6,
  setup7,
  setup8,
  setup9,
  setupa,
  setupc,
} from "../fixtures/mentor";
import background from "../fixtures/subjects/background";
import repeatAfterMe from "../fixtures/subjects/repeat_after_me";
import allSubjects from "../fixtures/subjects/all-subjects";
import requiredSubjects from "../fixtures/subjects/required-subjects";
import { MentorType, TrainState } from "../support/types";

const baseMock = {
  mentor: setup0,
  subjects: [requiredSubjects],
  gqlQueries: [mockGQL("updateMentor", true, true)],
};

describe("Setup", () => {
  describe("can navigate through slides", () => {
    it("with next button", () => {
      cySetup(cy);
      cyMockDefault(cy, baseMock);
      cy.visit("/app/setup");
      cy.get("#slide").contains("Welcome to MentorPal!");
      cy.get("#next-btn").trigger("mouseover").click();
      cy.get("#slide").contains("Tell us a little about yourself.");
      cy.get("#next-btn").trigger("mouseover").click();
      cy.get("#slide").contains("Pick a mentor type.");
      cy.get("#next-btn").trigger("mouseover").click();
      cy.get("#slide").contains("Let's start recording!");
      cy.get("#next-btn").trigger("mouseover").click();
      cy.get("#slide").contains("Select subjects?");
      cy.get("#next-btn").trigger("mouseover").click();
      cy.get("#slide").contains("Idle");
      cy.get("#next-btn").trigger("mouseover").click();
      cy.get("#slide").contains("Background questions");
      cy.get("#next-btn").trigger("mouseover").click();
      cy.get("#slide").contains("Repeat After Me questions");
    });

    it("with back button", () => {
      cySetup(cy);
      cyMockDefault(cy, baseMock);
      cy.visit("/app/setup?i=7");
      cy.get("#slide").contains("Repeat After Me questions");
      cy.get("#back-btn").trigger("mouseover").click();
      cy.get("#slide").contains("Background questions");
      cy.get("#back-btn").trigger("mouseover").click();
      cy.get("#slide").contains("Idle");
      cy.get("#back-btn").trigger("mouseover").click();
      cy.get("#slide").contains("Select subjects?");
      cy.get("#back-btn").trigger("mouseover").click();
      cy.get("#slide").contains("Let's start recording!");
      cy.get("#back-btn").trigger("mouseover").click();
      cy.get("#slide").contains("Pick a mentor type.");
      cy.get("#back-btn").trigger("mouseover").click();
      cy.get("#slide").contains("Tell us a little about yourself.");
      cy.get("#back-btn").trigger("mouseover").click();
      cy.get("#slide").contains("Welcome to MentorPal!");
    });

    it("with radio buttons", () => {
      cySetup(cy);
      cyMockDefault(cy, baseMock);
      cy.visit("/app/setup");
      cy.get("#slide").contains("Welcome to MentorPal!");
      cy.get("#radio-1").trigger("mouseover").click();
      cy.get("#slide").contains("Tell us a little about yourself.");
      cy.get("#radio-2").trigger("mouseover").click();
      cy.get("#slide").contains("Pick a mentor type.");
      cy.get("#radio-3").trigger("mouseover").click();
      cy.get("#slide").contains("Let's start recording!");
      cy.get("#radio-4").trigger("mouseover").click();
      cy.get("#slide").contains("Select subjects?");
      cy.get("#radio-5").trigger("mouseover").click();
      cy.get("#slide").contains("Idle");
      cy.get("#radio-6").trigger("mouseover").click();
      cy.get("#slide").contains("Background questions");
      cy.get("#radio-7").trigger("mouseover").click();
      cy.get("#slide").contains("Repeat After Me questions");
    });

    it("with query param i", () => {
      cySetup(cy);
      cyMockDefault(cy, baseMock);
      cy.visit("/app/setup?i=0");
      cy.get("#slide").contains("Welcome to MentorPal!");
      cy.visit("/app/setup?i=1");
      cy.get("#slide").contains("Tell us a little about yourself.");
      cy.visit("/app/setup?i=2");
      cy.get("#slide").contains("Pick a mentor type.");
      cy.visit("/app/setup?i=3");
      cy.get("#slide").contains("Let's start recording!");
      cy.visit("/app/setup?i=4");
      cy.get("#slide").contains("Select subjects?");
      cy.visit("/app/setup?i=5");
      cy.get("#slide").contains("Idle");
      cy.visit("/app/setup?i=6");
      cy.get("#slide").contains("Background questions");
      cy.visit("/app/setup?i=7");
      cy.get("#slide").contains("Repeat After Me questions");
    });
  });

  it.skip("shows setup page after logging in", () => {
    cySetup(cy);
    cyMockDefault(cy, baseMock);
    cy.visit("/app");
    cy.location("pathname").should("contain", "/setup");
  });

  it("adds required subjects if missing from mentor initially", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      ...baseMock,
      mentor: [setupa, setupc],
    });
    cy.visit("/app/setup");
    cy.get("#next-btn").trigger("mouseover").click();
    cy.get("#next-btn").trigger("mouseover").click();
    cy.get("#next-btn").trigger("mouseover").click();
    cy.get("#next-btn").trigger("mouseover").click();
    cy.get("#next-btn").trigger("mouseover").click();
    cy.get("#slide").contains("Background questions");
    cy.get("#slide").contains(
      "These questions will ask general questions about your background that might be relevant to how people understand your career."
    );
    cy.get("#slide").contains("0 / 2");
    cy.get("#next-btn").trigger("mouseover").click();
    cy.get("#slide").contains("Repeat After Me questions");
    cy.get("#slide").contains(
      "These are miscellaneous phrases you'll be asked to repeat."
    );
    cy.get("#slide").contains("0 / 3");
  });

  it("shows welcome slide", () => {
    cySetup(cy);
    cyMockDefault(cy, baseMock);
    cy.visit("/app/setup?i=0");
    cy.get("#slide").contains("Welcome to MentorPal!");
    cy.get("#slide").contains("It's nice to meet you, Clinton Anderson!");
    cy.get("#slide").contains("Let's get started setting up your new mentor.");
    cy.get("#next-btn").should("exist");
    cy.get("#back-btn").should("not.exist");
    cy.get("#done-btn").should("not.exist");
    cy.get("#radio-0")
      .parent()
      .parent()
      .should("have.css", "color", "rgb(27, 106, 156)");
  });

  it("shows mentor slide", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      ...baseMock,
      mentor: [setup0, setup1, setup2, setup3],
    });
    cy.visit("/app/setup?i=1");
    // empty mentor slide
    cy.get("#slide").contains("Tell us a little about yourself.");
    cy.get("#slide #first-name").should("have.value", "");
    cy.get("#slide #name").should("have.value", "");
    cy.get("#slide #title").should("have.value", "");
    cy.get("#slide #save-btn").should("be.disabled");
    cy.get("#next-btn").should("exist");
    cy.get("#back-btn").should("exist");
    cy.get("#done-btn").should("not.exist");
    cy.get("#radio-1")
      .parent()
      .parent()
      .should("have.css", "color", "rgb(255, 0, 0)");
    // fill out first name and save
    cy.get("#slide #first-name").clear().type("Clint");
    cy.get("#slide #save-btn").should("not.be.disabled");
    cy.get("#slide #save-btn").trigger("mouseover").click();
    cy.get("#slide #first-name").should("have.value", "Clint");
    cy.get("#slide #name").should("have.value", "");
    cy.get("#slide #title").should("have.value", "");
    cy.get("#slide #save-btn").should("be.disabled");
    cy.get("#radio-1")
      .parent()
      .parent()
      .should("have.css", "color", "rgb(255, 0, 0)");
    // fill out full name and save
    cy.get("#slide #name").clear().type("Clinton Anderson");
    cy.get("#slide #save-btn").should("not.be.disabled");
    cy.get("#slide #save-btn").trigger("mouseover").click();
    cy.get("#slide #first-name").should("have.value", "Clint");
    cy.get("#slide #name").should("have.value", "Clinton Anderson");
    cy.get("#slide #title").should("have.value", "");
    cy.get("#slide #save-btn").should("be.disabled");
    cy.get("#radio-1")
      .parent()
      .parent()
      .should("have.css", "color", "rgb(255, 0, 0)");
    // fill out title and save
    cy.get("#slide #title").clear().type("Nuclear Electrician's Mate");
    cy.get("#slide #save-btn").should("not.be.disabled");
    cy.get("#slide #save-btn").trigger("mouseover").click();
    cy.get("#slide #first-name").should("have.value", "Clint");
    cy.get("#slide #name").should("have.value", "Clinton Anderson");
    cy.get("#slide #title").should("have.value", "Nuclear Electrician's Mate");
    cy.get("#slide #save-btn").should("be.disabled");
    cy.get("#radio-1")
      .parent()
      .parent()
      .should("have.css", "color", "rgb(27, 106, 156)");
  });

  describe("shows mentor type slide", () => {
    it("type is CHAT by default if no mentorType", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        ...baseMock,
        mentor: { ...setup0, mentorType: null },
      });
      cy.visit("/app/setup?i=2");
      cy.get("#slide").contains("Pick a mentor type");
      cy.get("#slide").contains(
        "Make a text-only mentor that responds with chat bubbles"
      );
      cy.get("#slide #select-chat-type").contains("Chat");
    });

    it("loads mentor chat type", () => {
      cySetup(cy);
      cyMockDefault(cy, baseMock);
      cy.visit("/app/setup?i=2");
      cy.get("#slide").contains("Pick a mentor type");
      cy.get("#slide").contains(
        "Make a video mentor that responds with pre-recorded video answers"
      );
      cy.get("#slide #select-chat-type").contains("Video");
      cy.get("#slide #save-btn").should("be.disabled");
    });

    it("updates mentor chat type", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        ...baseMock,
        mentor: [setup0, { ...setup0, mentorType: MentorType.CHAT }],
      });
      cy.visit("/app/setup?i=2");
      cy.get("#slide").contains("Pick a mentor type");
      cy.get("#slide").contains(
        "Make a video mentor that responds with pre-recorded video answers"
      );
      cy.get("#slide #select-chat-type").contains("Video");
      cy.get("#slide #save-btn").should("be.disabled");
      cy.get("#next-btn").should("exist");
      cy.get("#back-btn").should("exist");
      cy.get("#done-btn").should("not.exist");
      cy.get("#radio-2")
        .parent()
        .parent()
        .should("have.css", "color", "rgb(27, 106, 156)");

      cy.get("#slide #select-chat-type").trigger("mouseover").click();
      cy.get("#video");
      cy.get("#chat").trigger("mouseover").click();
      cy.get("#slide").contains(
        "Make a text-only mentor that responds with chat bubbles"
      );
      cy.get("#slide #save-btn").should("not.be.disabled");
      cy.get("#slide #save-btn").trigger("mouseover").click();

      cy.get("#slide #save-btn").should("be.disabled");
      cy.get("#slide").contains(
        "Make a text-only mentor that responds with chat bubbles"
      );
    });
  });

  it("shows introduction slide", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      ...baseMock,
      mentor: [setup3],
    });
    cy.visit("/app/setup?i=3");
    cy.get("#slide").contains("Let's start recording");
    cy.get("#slide").contains(
      "You'll be asked to pick some subjects and answer some questions."
    );
    cy.get("#slide").contains(
      "Once you're done, you can build and preview your mentor."
    );
    cy.get("#slide").contains(
      "If you'd like to stop, press done at any point. You can always finish later."
    );
    cy.get("#next-btn").should("exist");
    cy.get("#back-btn").should("exist");
    cy.get("#done-btn").should("exist");
    cy.get("#radio-3")
      .parent()
      .parent()
      .should("have.css", "color", "rgb(27, 106, 156)");
  });

  it("shows select subjects slide", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      ...baseMock,
      mentor: [
        setup3,
        setup3,
        {
          ...setup3,
          defaultSubject: { _id: "background" },
          subjects: [
            ...setup3.subjects,
            {
              _id: "leadership",
              name: "Leadership",
              description:
                "These questions will ask about being in a leadership role.",
              isRequired: false,
              categories: [],
              topics: [],
              questions: [],
            },
          ],
        },
      ],
      subjects: [requiredSubjects, allSubjects],
    });
    cy.visit("/app/setup?i=4");
    cy.get("#slide").contains("Select subjects");
    cy.get("#slide").contains(
      "Subjects will ask questions related to a particular field or topic. Pick the ones you feel qualified to mentor in!"
    );
    cy.get("#slide").contains(
      "After completing a subject, you'll be placed in a panel with other mentors in your field."
    );
    cy.get("#next-btn").should("exist");
    cy.get("#back-btn").should("exist");
    cy.get("#done-btn").should("exist");
    cy.get("#radio-4")
      .parent()
      .parent()
      .should("have.css", "color", "rgb(27, 106, 156)");
    cy.get("#radio-6").trigger("mouseover").click();
    cy.get("#slide").contains("Background questions");
    cy.get("#radio-7").trigger("mouseover").click();
    cy.get("#slide").contains("Repeat After Me questions");
    cy.get("#radio-8").trigger("mouseover").click();
    cy.get("#slide").contains("Great job! You're ready to build your mentor!");
    cy.get("#radio-4").trigger("mouseover").click();

    cy.get("#slide #button").trigger("mouseover").click();
    cy.location("pathname").should("contain", "/subjects");
    cy.location("search").should("contain", "?back=/app/setup?i=4");
    cy.get("#subjects").children().should("have.length", 3);
    cy.get("#subjects #subject-background #name").contains("Background");
    cy.get("#subjects #subject-background #description").contains(
      "These questions will ask general questions about your background that might "
    );
    cy.get('#subjects #subject-background #select [type="checkbox"]').should(
      "be.disabled"
    );
    cy.get('#subjects #subject-background #select [type="checkbox"]').should(
      "be.checked"
    );
    cy.get('#subjects #subject-background #default [type="checkbox"]').should(
      "not.be.disabled"
    );
    cy.get('#subjects #subject-background #default [type="checkbox"]').should(
      "not.be.checked"
    );
    cy.get("#subjects #subject-repeat_after_me #name").contains(
      "Repeat After Me"
    );
    cy.get("#subjects #subject-repeat_after_me #description").contains(
      "These are miscellaneous phrases you'll be asked to repeat"
    );
    cy.get(
      '#subjects #subject-repeat_after_me #select [type="checkbox"]'
    ).should("be.disabled");
    cy.get(
      '#subjects #subject-repeat_after_me #select [type="checkbox"]'
    ).should("be.checked");
    cy.get(
      '#subjects #subject-repeat_after_me #default [type="checkbox"]'
    ).should("not.be.disabled");
    cy.get(
      '#subjects #subject-repeat_after_me #default [type="checkbox"]'
    ).should("not.be.checked");
    cy.get("#subjects #subject-leadership #name").contains("Leadership");
    cy.get("#subjects #subject-leadership #description").contains(
      "These questions will ask about being in a leadership role"
    );
    cy.get('#subjects #subject-leadership #select [type="checkbox"]').should(
      "not.be.disabled"
    );
    cy.get('#subjects #subject-leadership #select [type="checkbox"]').should(
      "not.be.checked"
    );
    cy.get('#subjects #subject-leadership #default [type="checkbox"]').should(
      "be.disabled"
    );
    cy.get('#subjects #subject-leadership #default [type="checkbox"]').should(
      "not.be.checked"
    );
    // select subject and primary subject and go back
    cy.get('#subjects #subject-background #default [type="checkbox"]')
      .check()
      .should("be.checked");
    cy.get('#subjects #subject-leadership #select [type="checkbox"]')
      .check()
      .should("be.checked");
    cy.get('#subjects #subject-leadership #default [type="checkbox"]').should(
      "not.be.disabled"
    );
    cy.get("#save-button").trigger("mouseover").click();
    cy.get("#save-button").should("not.be.disabled");
    cy.get("#nav-bar #back-button").trigger("mouseover").click();

    cy.location("pathname").should("contain", "/setup");
    cy.location("search").should("contain", "?i=4");
    cy.get("#radio-6").trigger("mouseover").click();
    cy.get("#slide").contains("Background questions");
    cy.get("#radio-7").trigger("mouseover").click();
    cy.get("#slide").contains("Repeat After Me questions");
    cy.get("#radio-8").trigger("mouseover").click();
    cy.get("#slide").contains("Leadership questions");
  });

  it("shows idle slide", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      ...baseMock,
      mentor: [setup3, setup3, setup4, setup4],
    });
    cy.visit("/app/setup?i=5");
    cy.get("#slide").contains("Idle");
    cy.get("#slide").contains("Let's record a short idle calibration video.");
    cy.get("#slide").contains(
      "Click the record button and you'll be taken to a recording screen."
    );
    cy.get("#next-btn").should("exist");
    cy.get("#back-btn").should("exist");
    cy.get("#done-btn").should("exist");
    cy.get("#check").should("not.exist");
    cy.get("#radio-5")
      .parent()
      .parent()
      .should("have.css", "color", "rgb(255, 0, 0)");
    // record idle
    cy.get("#record-btn").trigger("mouseover").click();
    cy.location("pathname").should("contain", "/record");
    cy.location("search").should("contain", "?videoId=A3_1_1&back=/app/setup?i=5");
    cy.get("#progress").contains("Questions 1 / 1");
    cy.get("#question-input").should(
      "have.value",
      "Please look at the camera for 30 seconds without speaking. Try to remain in the same position."
    );
    cy.get("#question-input").should("be.disabled");
    cy.get("#transcript-input").should("have.value", "");
    cy.get("#status").contains("INCOMPLETE");
    cy.get("#select-status").trigger("mouseover").click();
    cy.get("#complete").trigger("mouseover").click();
    cy.get("#status").contains("COMPLETE");
    // back to setup
    cy.get("#done-btn").trigger("mouseover").click();
    cy.location("pathname").should("contain", "/setup");
    cy.location("search").should("contain", "?i=5");
    cy.get("#check").should("exist");
    cy.get("#radio-5")
      .parent()
      .parent()
      .should("have.css", "color", "rgb(27, 106, 156)");
  });

  it("shows background questions slide", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      ...baseMock,
      mentor: [setup4, setup4, setup5, setup5, setup6, setup6],
      subject: background,
      gqlQueries: [
        mockGQL("updateMentor", true, true),
        mockGQL("updateAnswer", true, true),
      ],
    });
    cy.visit("/app/setup?i=6");
    cy.get("#slide").contains("Background questions");
    cy.get("#slide").contains(
      "These questions will ask general questions about your background that might be relevant to how people understand your career."
    );
    cy.get("#slide").contains("0 / 2");
    cy.get("#next-btn").should("exist");
    cy.get("#back-btn").should("exist");
    cy.get("#done-btn").should("exist");
    cy.get("#check").should("not.exist");
    cy.get("#radio-6")
      .parent()
      .parent()
      .should("have.css", "color", "rgb(255, 0, 0)");
    // record first question
    cy.get("#record-btn").trigger("mouseover").click();
    cy.location("pathname").should("contain", "/record");
    cy.location("search").should(
      "contain",
      "?subject=background&back=/app/setup?i=6"
    );
    cy.get("#progress").contains("Questions 1 / 2");
    cy.get("#question-input").should(
      "have.value",
      "Who are you and what do you do?"
    );
    cy.get("#question-input").should("be.disabled");
    cy.get("#transcript-input").should("have.value", "");
    cy.get("#status").contains("INCOMPLETE");
    cy.get("#select-status").trigger("mouseover").click();
    cy.get("#complete").trigger("mouseover").click();
    cy.get("#status").contains("COMPLETE");
    cy.get("#save-btn").trigger("mouseover").click();
    // back to setup
    cy.get("#nav-bar #back-button").trigger("mouseover").click();
    cy.location("pathname").should("contain", "/setup");
    cy.location("search").should("contain", "?i=6");
    cy.get("#slide").contains("1 / 2");
    cy.get("#radio-6")
      .parent()
      .parent()
      .should("have.css", "color", "rgb(255, 0, 0)");
    // back to record
    cy.get("#record-btn").trigger("mouseover").click();
    cy.location("pathname").should("contain", "/record");
    cy.location("search").should(
      "contain",
      "?subject=background&back=/app/setup?i=6"
    );
    cy.get("#progress").contains("Questions 1 / 2");
    cy.get("#question-input").should(
      "have.value",
      "Who are you and what do you do?"
    );
    cy.get("#question-input").should("be.disabled");
    cy.get("#transcript-input").should(
      "have.value",
      "My name is Clint Anderson and I'm a Nuclear Electrician's Mate"
    );
    cy.get("#status").contains("COMPLETE");
    // record second question
    cy.get("#next-btn").trigger("mouseover").click();
    cy.get("#progress").contains("Questions 2 / 2");
    cy.get("#question-input").should("have.value", "How old are you now?");
    cy.get("#question-input").should("be.disabled");
    cy.get("#transcript-input").should("have.value", "");
    cy.get("#status").contains("INCOMPLETE");
    cy.get("#rerecord-btn").should("not.exist");
    cy.get("#select-status").trigger("mouseover").click();
    cy.get("#complete").trigger("mouseover").click();
    cy.get("#status").contains("COMPLETE");
    cy.get("#save-btn").trigger("mouseover").click();
    // back to setup
    cy.get("#done-btn").trigger("mouseover").click();
    cy.location("pathname").should("contain", "/setup");
    cy.location("search").should("contain", "?i=6");
    cy.get("#check").should("exist");
    cy.get("#radio-6")
      .parent()
      .parent()
      .should("have.css", "color", "rgb(27, 106, 156)");
  });

  it("shows repeat after me questions slide", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      ...baseMock,
      mentor: [setup6, setup6, setup7, setup7, setup8, setup8],
      subject: repeatAfterMe,
      gqlQueries: [
        mockGQL("updateMentor", true, true),
        mockGQL("updateAnswer", true, true),
      ],
    });
    cy.visit("/app/setup?i=7");
    cy.get("#slide").contains("Repeat After Me questions");
    cy.get("#slide").contains(
      "These are miscellaneous phrases you'll be asked to repeat."
    );
    cy.get("#slide").contains("1 / 3");
    cy.get("#next-btn").should("exist");
    cy.get("#back-btn").should("exist");
    cy.get("#done-btn").should("exist");
    cy.get("#check").should("not.exist");
    cy.get("#radio-7")
      .parent()
      .parent()
      .should("have.css", "color", "rgb(255, 0, 0)");
    // go to record
    cy.get("#record-btn").trigger("mouseover").click();
    cy.location("pathname").should("contain", "/record");
    cy.location("search").should(
      "contain",
      "?subject=repeat_after_me&back=/app/setup?i=7"
    );
    cy.get("#progress").contains("Questions 1 / 3");
    cy.get("#question-input").should(
      "have.value",
      "Please look at the camera for 30 seconds without speaking. Try to remain in the same position."
    );
    cy.get("#question-input").should("be.disabled");
    cy.get("#transcript-input").should("have.value", "");
    cy.get("#status").contains("COMPLETE");
    // record second question
    cy.get("#next-btn").trigger("mouseover").click();
    cy.get("#progress").contains("Questions 2 / 3");
    cy.get("#question-input").should(
      "have.value",
      "Please give a short introduction of yourself, which includes your name, current job, and title."
    );
    cy.get("#question-input").should("be.disabled");
    cy.get("#transcript-input").should("have.value", "");
    cy.get("#status").contains("INCOMPLETE");
    cy.get("#select-status").trigger("mouseover").click();
    cy.get("#complete").trigger("mouseover").click();
    cy.get("#status").contains("COMPLETE");
    // back to setup
    cy.get("#nav-bar #back-button").trigger("mouseover").click();
    cy.location("pathname").should("contain", "/setup");
    cy.location("search").should("contain", "?i=7");
    cy.get("#slide").contains("2 / 3");
    cy.get("#radio-7")
      .parent()
      .parent()
      .should("have.css", "color", "rgb(255, 0, 0)");
    // back to record
    cy.get("#record-btn").trigger("mouseover").click();
    cy.location("pathname").should("contain", "/record");
    cy.location("search").should(
      "contain",
      "?subject=repeat_after_me&back=/app/setup?i=7"
    );
    cy.get("#next-btn").trigger("mouseover").click();
    cy.get("#progress").contains("Questions 2 / 3");
    cy.get("#question-input").should(
      "have.value",
      "Please give a short introduction of yourself, which includes your name, current job, and title."
    );
    cy.get("#question-input").should("be.disabled");
    cy.get("#transcript-input").should(
      "have.value",
      "My name is Clint Anderson I'm a Nuclear Electrician's Mate"
    );
    cy.get("#status").contains("COMPLETE");
    // record third question
    cy.get("#next-btn").trigger("mouseover").click();
    cy.get("#progress").contains("Questions 3 / 3");
    cy.get("#question-input").should(
      "have.value",
      "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'"
    );
    cy.get("#question-input").should("be.disabled");
    cy.get("#transcript-input").should("have.value", "");
    cy.get("#status").contains("INCOMPLETE");
    cy.get("#select-status").trigger("mouseover").click();
    cy.get("#complete").trigger("mouseover").click();
    cy.get("#status").contains("COMPLETE");
    // back to setup
    cy.get("#done-btn").trigger("mouseover").click();
    cy.location("pathname").should("contain", "/setup");
    cy.location("search").should("contain", "?i=7");
    cy.get("#check").should("exist");
    cy.get("#radio-7")
      .parent()
      .parent()
      .should("have.css", "color", "rgb(27, 106, 156)");
  });

  describe("shows build mentor slide after completing setup", () => {
    it("fails to train mentor", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        ...baseMock,
        mentor: [setup8, setup9],
      });
      cy.visit("/app/setup?i=8");
      cy.get("#slide").contains(
        "Great job! You're ready to build your mentor!"
      );
      cy.get("#slide").contains(
        "Click the build button to start building your mentor."
      );
      cy.get("#slide").contains(
        "Once its complete, click preview to see your mentor."
      );
      cy.get("#next-btn").should("not.exist");
      cy.get("#back-btn").should("exist");
      cy.get("#done-btn").should("exist");
      cy.get("#train-btn").contains("Build");
      cy.get("#radio-8")
        .parent()
        .parent()
        .should("have.css", "color", "rgb(255, 0, 0)");
      cy.get("#train-btn").trigger("mouseover").click();
      cy.get("#slide").contains("Oops, training failed. Please try again.");
    });

    it("builds mentor", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        ...baseMock,
        mentor: [setup8, setup9],
        gqlQueries: [mockGQL("updateMentor", setup9, true)],
      });
      cyMockTrain(cy);
      cyMockTrainStatus(cy, { status: { state: TrainState.SUCCESS } });
      cy.visit("/app/setup?i=8");
      cy.get("#slide").contains(
        "Great job! You're ready to build your mentor!"
      );
      cy.get("#slide").contains(
        "Click the build button to start building your mentor."
      );
      cy.get("#slide").contains(
        "Once its complete, click preview to see your mentor."
      );
      cy.get("#next-btn").should("not.exist");
      cy.get("#back-btn").should("exist");
      cy.get("#done-btn").should("exist");
      cy.get("#train-btn").contains("Build");
      cy.get("#radio-8")
        .parent()
        .parent()
        .should("have.css", "color", "rgb(255, 0, 0)");
      cy.get("#train-btn").trigger("mouseover").click();
      cy.get("#slide").contains("Building your mentor...");
      cy.get("#slide").contains(
        "Congratulations! Your brand-new mentor is ready!"
      );
      cy.get("#slide").contains("Click the preview button to see your mentor.");
      cy.get("#preview-btn").contains("Preview");
      cy.get("#radio-8")
        .parent()
        .parent()
        .should("have.css", "color", "rgb(27, 106, 156)");
      // preview mentor
      cy.get("#preview-btn").trigger("mouseover").click();
      cy.location("pathname").should("contain", "chat");
      cy.location("search").should("contain", "?mentor=clintanderson");
    });
  });
});
