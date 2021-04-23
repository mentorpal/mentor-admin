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
} from "../fixtures/mentor";
import background from "../fixtures/subjects/background";
import repeatAfterMe from "../fixtures/subjects/repeat_after_me";
import allSubjects from "../fixtures/subjects/all-subjects";
import { MentorType, TrainState } from "../support/types";

const baseMock = {
  mentor: setup0,
  gqlQueries: [mockGQL("updateMentor", true, true)],
};

Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});

describe("Setup", () => {
  describe("can navigate through slides", () => {
    it("with next button", () => {
      cySetup(cy);
      cyMockDefault(cy, baseMock);
      cy.visit("/setup");
      cy.get("[data-cy=slide]").contains("Welcome to MentorPal!");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();
      cy.get("[data-cy=slide]").contains("Tell us a little about yourself.");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();
      cy.get("[data-cy=slide]").contains("Pick a mentor type.");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();
      cy.get("[data-cy=slide]").contains("Let's start recording!");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();
      cy.get("[data-cy=slide]").contains("Select subjects?");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();
      cy.get("[data-cy=slide]").contains("Idle");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();
      cy.get("[data-cy=slide]").contains("Background questions");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();
      cy.get("[data-cy=slide]").contains("Repeat After Me questions");
    });

    it("with back button", () => {
      cySetup(cy);
      cyMockDefault(cy, baseMock);
      cy.visit("/setup?i=7");
      cy.get("[data-cy=slide]").contains("Repeat After Me questions");
      cy.get("[data-cy=back-btn]").trigger("mouseover").click();
      cy.get("[data-cy=slide]").contains("Background questions");
      cy.get("[data-cy=back-btn]").trigger("mouseover").click();
      cy.get("[data-cy=slide]").contains("Idle");
      cy.get("[data-cy=back-btn]").trigger("mouseover").click();
      cy.get("[data-cy=slide]").contains("Select subjects?");
      cy.get("[data-cy=back-btn]").trigger("mouseover").click();
      cy.get("[data-cy=slide]").contains("Let's start recording!");
      cy.get("[data-cy=back-btn]").trigger("mouseover").click();
      cy.get("[data-cy=slide]").contains("Pick a mentor type.");
      cy.get("[data-cy=back-btn]").trigger("mouseover").click();
      cy.get("[data-cy=slide]").contains("Tell us a little about yourself.");
      cy.get("[data-cy=back-btn]").trigger("mouseover").click();
      cy.get("[data-cy=slide]").contains("Welcome to MentorPal!");
    });

    it("with radio buttons", () => {
      cySetup(cy);
      cyMockDefault(cy, baseMock);
      cy.visit("/setup");
      cy.get("[data-cy=slide]").contains("Welcome to MentorPal!");
      cy.get("[data-cy=radio-1]").trigger("mouseover").click();
      cy.get("[data-cy=slide]").contains("Tell us a little about yourself.");
      cy.get("[data-cy=radio-2]").trigger("mouseover").click();
      cy.get("[data-cy=slide]").contains("Pick a mentor type.");
      cy.get("[data-cy=radio-3]").trigger("mouseover").click();
      cy.get("[data-cy=slide]").contains("Let's start recording!");
      cy.get("[data-cy=radio-4]").trigger("mouseover").click();
      cy.get("[data-cy=slide]").contains("Select subjects?");
      cy.get("[data-cy=radio-5]").trigger("mouseover").click();
      cy.get("[data-cy=slide]").contains("Idle");
      cy.get("[data-cy=radio-6]").trigger("mouseover").click();
      cy.get("[data-cy=slide]").contains("Background questions");
      cy.get("[data-cy=radio-7]").trigger("mouseover").click();
      cy.get("[data-cy=slide]").contains("Repeat After Me questions");
    });

    it("with query param i", () => {
      cySetup(cy);
      cyMockDefault(cy, baseMock);
      cy.visit("/setup?i=0");
      cy.get("[data-cy=slide]").contains("Welcome to MentorPal!");
      cy.visit("/setup?i=1");
      cy.get("[data-cy=slide]").contains("Tell us a little about yourself.");
      cy.visit("/setup?i=2");
      cy.get("[data-cy=slide]").contains("Pick a mentor type.");
      cy.visit("/setup?i=3");
      cy.get("[data-cy=slide]").contains("Let's start recording!");
      cy.visit("/setup?i=4");
      cy.get("[data-cy=slide]").contains("Select subjects?");
      cy.visit("/setup?i=5");
      cy.get("[data-cy=slide]").contains("Idle");
      cy.visit("/setup?i=6");
      cy.get("[data-cy=slide]").contains("Background questions");
      cy.visit("/setup?i=7");
      cy.get("[data-cy=slide]").contains("Repeat After Me questions");
    });
  });

  it("shows welcome slide", () => {
    cySetup(cy);
    cyMockDefault(cy, baseMock);
    cy.visit("/setup?i=0");
    cy.get("[data-cy=slide]").within(($slide) => {
      cy.contains("Welcome to MentorPal!");
      cy.contains("It's nice to meet you, Clinton Anderson!");
      cy.contains("Let's get started setting up your new mentor.");
    });
    cy.get("[data-cy=next-btn]").should("exist");
    cy.get("[data-cy=back-btn]").should("not.exist");
    cy.get("[data-cy=done-btn]").should("not.exist");
    cy.get("[data-cy=radio-0]").should(
      "have.css",
      "color",
      "rgb(27, 106, 156)"
    );
  });

  it("shows mentor slide", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      ...baseMock,
      mentor: [setup0, setup1, setup2, setup3],
    });
    cy.visit("/setup?i=1");
    cy.get("[data-cy=next-btn]").should("exist");
    cy.get("[data-cy=back-btn]").should("exist");
    cy.get("[data-cy=done-btn]").should("not.exist");
    // empty mentor slide
    cy.get("[data-cy=slide]").within(($slide) => {
      cy.contains("Tell us a little about yourself.");
      cy.get("[data-cy=first-name]").within(($input) => {
        cy.get("input").should("have.value", "");
      });
      cy.get("[data-cy=name]").within(($input) => {
        cy.get("input").should("have.value", "");
      });
      cy.get("[data-cy=title]").within(($input) => {
        cy.get("input").should("have.value", "");
      });
      cy.get("[data-cy=save-btn]").should("be.disabled");
    });
    cy.get("[data-cy=radio-1]").should("have.css", "color", "rgb(255, 0, 0)");
    // fill out first name and save
    cy.get("[data-cy=slide]").within(($slide) => {
      cy.get("[data-cy=first-name]").type("Clint");
      cy.get("[data-cy=save-btn]").should("not.be.disabled");
      cy.get("[data-cy=save-btn]").trigger("mouseover").click();
      cy.get("[data-cy=first-name]").within(($input) => {
        cy.get("input").should("have.value", "Clint");
      });
      cy.get("[data-cy=name]").within(($input) => {
        cy.get("input").should("have.value", "");
      });
      cy.get("[data-cy=title]").within(($input) => {
        cy.get("input").should("have.value", "");
      });
      cy.get("[data-cy=save-btn]").should("be.disabled");
    });
    cy.get("[data-cy=radio-1]").should("have.css", "color", "rgb(255, 0, 0)");
    // fill out full name and save
    cy.get("[data-cy=slide]").within(($slide) => {
      cy.contains("Tell us a little about yourself.");
      cy.get("[data-cy=name]").type("Clinton Anderson");
      cy.get("[data-cy=save-btn]").should("not.be.disabled");
      cy.get("[data-cy=save-btn]").trigger("mouseover").click();
      cy.get("[data-cy=first-name]").within(($input) => {
        cy.get("input").should("have.value", "Clint");
      });
      cy.get("[data-cy=name]").within(($input) => {
        cy.get("input").should("have.value", "Clinton Anderson");
      });
      cy.get("[data-cy=title]").within(($input) => {
        cy.get("input").should("have.value", "");
      });
      cy.get("[data-cy=save-btn]").should("be.disabled");
    });
    cy.get("[data-cy=radio-1]").should("have.css", "color", "rgb(255, 0, 0)");
    // fill out title and save
    cy.get("[data-cy=slide]").within(($slide) => {
      cy.contains("Tell us a little about yourself.");
      cy.get("[data-cy=title]").type("Nuclear Electrician's Mate");
      cy.get("[data-cy=save-btn]").should("not.be.disabled");
      cy.get("[data-cy=save-btn]").trigger("mouseover").click();
      cy.get("[data-cy=first-name]").within(($input) => {
        cy.get("input").should("have.value", "Clint");
      });
      cy.get("[data-cy=name]").within(($input) => {
        cy.get("input").should("have.value", "Clinton Anderson");
      });
      cy.get("[data-cy=title]").within(($input) => {
        cy.get("input").should("have.value", "Nuclear Electrician's Mate");
      });
      cy.get("[data-cy=save-btn]").should("be.disabled");
    });
    cy.get("[data-cy=radio-1]").should(
      "have.css",
      "color",
      "rgb(27, 106, 156)"
    );
  });

  describe("shows mentor type slide", () => {
    it("type is CHAT by default if no mentorType", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        ...baseMock,
        mentor: { ...setup0, mentorType: null },
      });
      cy.visit("/setup?i=2");
      cy.get("[data-cy=slide]").within(($slide) => {
        cy.contains("Pick a mentor type");
        cy.contains("Make a text-only mentor that responds with chat bubbles");
        cy.get("[data-cy=select-chat-type]").contains("Chat");
      });
    });

    it("load and updates mentor chat type", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        ...baseMock,
        mentor: [setup0, { ...setup0, mentorType: MentorType.CHAT }],
      });
      cy.visit("/setup?i=2");
      cy.get("[data-cy=next-btn]").should("exist");
      cy.get("[data-cy=back-btn]").should("exist");
      cy.get("[data-cy=done-btn]").should("not.exist");
      cy.get("[data-cy=radio-2]").should(
        "have.css",
        "color",
        "rgb(27, 106, 156)"
      );
      cy.get("[data-cy=slide]").within(($slide) => {
        // loads mentor chat type
        cy.contains("Pick a mentor type");
        cy.contains(
          "Make a video mentor that responds with pre-recorded video answers"
        );
        cy.get("[data-cy=select-chat-type]").contains("Video");
        cy.get("[data-cy=save-btn]").should("be.disabled");
        // updates mentor chat type
        cy.get("[data-cy=select-chat-type]").trigger("mouseover").click();
      });
      cy.get("[data-cy=video]").should("exist");
      cy.get("[data-cy=chat]").trigger("mouseover").click();
      // saves changes
      cy.get("[data-cy=slide]").within(($slide) => {
        cy.contains("Make a text-only mentor that responds with chat bubbles");
        cy.get("[data-cy=save-btn]").should("not.be.disabled");
        cy.get("[data-cy=save-btn]").trigger("mouseover").click();
        cy.get("[data-cy=save-btn]").should("be.disabled");
        cy.contains("Make a text-only mentor that responds with chat bubbles");
      });
    });
  });

  it("shows introduction slide", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      ...baseMock,
      mentor: [setup3],
    });
    cy.visit("/setup?i=3");
    cy.get("[data-cy=slide]").within(($slide) => {
      cy.contains("Let's start recording");
      cy.contains(
        "You'll be asked to pick some subjects and answer some questions."
      );
      cy.contains("Once you're done, you can build and preview your mentor.");
      cy.contains(
        "If you'd like to stop, press done at any point. You can always finish later."
      );
    });
    cy.get("[data-cy=next-btn]").should("exist");
    cy.get("[data-cy=back-btn]").should("exist");
    cy.get("[data-cy=done-btn]").should("exist");
    cy.get("[data-cy=radio-3]").should(
      "have.css",
      "color",
      "rgb(27, 106, 156)"
    );
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
      subjects: [allSubjects],
    });
    cy.visit("/setup?i=4");
    cy.get("[data-cy=slide]").within(($slide) => {
      cy.contains("Select subjects");
      cy.contains(
        "Subjects will ask questions related to a particular field or topic. Pick the ones you feel qualified to mentor in!"
      );
      cy.contains(
        "After completing a subject, you'll be placed in a panel with other mentors in your field."
      );
    });
    cy.get("[data-cy=next-btn]").should("exist");
    cy.get("[data-cy=back-btn]").should("exist");
    cy.get("[data-cy=done-btn]").should("exist");
    cy.get("[data-cy=radio-4]").should(
      "have.css",
      "color",
      "rgb(27, 106, 156)"
    );
    cy.get("[data-cy=radio-6]").trigger("mouseover").click();
    cy.get("[data-cy=slide]").contains("Background questions");
    cy.get("[data-cy=radio-7]").trigger("mouseover").click();
    cy.get("[data-cy=slide]").contains("Repeat After Me questions");
    cy.get("[data-cy=radio-8]").trigger("mouseover").click();
    cy.get("[data-cy=slide]").contains(
      "Great job! You're ready to build your mentor!"
    );
    cy.get("[data-cy=radio-4]").trigger("mouseover").click();
    // go to subjects page
    cy.get("[data-cy=slide]").within(($slide) => {
      cy.get("[data-cy=button]").trigger("mouseover").click();
    });
    cy.location("pathname").then(($el) =>
      assert($el.replace("/admin", ""), "/subjects")
    );
    cy.location("search").should("contain", "?back=/setup?i=4");
    cy.get("[data-cy=subjects]").children().should("have.length", 3);
    cy.get("[data-cy=subjects]").within(($subjects) => {
      cy.get("[data-cy=subject-0]").within(($subject) => {
        cy.get("[data-cy=name]").should("have.text", "Background");
        cy.get("[data-cy=description]").should(
          "have.text",
          "These questions will ask general questions about your background that might be relevant to how people understand your career."
        );
        cy.get('[data-cy=select] [type="checkbox"]').should("be.disabled");
        cy.get('[data-cy=select] [type="checkbox"]').should("be.checked");
        cy.get('[data-cy=default] [type="checkbox"]').should("not.be.disabled");
        cy.get('[data-cy=default] [type="checkbox"]').should("not.be.checked");
      });
    });
    cy.get("[data-cy=subjects]").within(($subjects) => {
      cy.get("[data-cy=subject-1]").within(($subject) => {
        cy.get("[data-cy=name]").should("have.text", "Repeat After Me");
        cy.get("[data-cy=description]").should(
          "have.text",
          "These are miscellaneous phrases you'll be asked to repeat."
        );
        cy.get('[data-cy=select] [type="checkbox"]').should("be.disabled");
        cy.get('[data-cy=select] [type="checkbox"]').should("be.checked");
        cy.get('[data-cy=default] [type="checkbox"]').should("not.be.disabled");
        cy.get('[data-cy=default] [type="checkbox"]').should("not.be.checked");
      });
    });
    cy.get("[data-cy=subjects]").within(($subjects) => {
      cy.get("[data-cy=subject-2]").within(($subject) => {
        cy.get("[data-cy=name]").should("have.text", "Leadership");
        cy.get("[data-cy=description]").should(
          "have.text",
          "These questions will ask about being in a leadership role."
        );
        cy.get('[data-cy=select] [type="checkbox"]').should("not.be.disabled");
        cy.get('[data-cy=select] [type="checkbox"]').should("not.be.checked");
        cy.get('[data-cy=default] [type="checkbox"]').should("be.disabled");
        cy.get('[data-cy=default] [type="checkbox"]').should("not.be.checked");
      });
    });
    // select subject and primary subject and go back
    cy.get("[data-cy=subjects]").within(($subjects) => {
      cy.get("[data-cy=subject-0]").within(($subject) => {
        cy.get('[data-cy=default] [type="checkbox"]')
          .check()
          .should("be.checked");
      });
      cy.get("[data-cy=subject-2]").within(($subject) => {
        cy.get('[data-cy=select] [type="checkbox"]')
          .check()
          .should("be.checked");
        cy.get('[data-cy=default] [type="checkbox"]').should("not.be.checked");
      });
    });
    cy.get("[data-cy=save-button]").trigger("mouseover").click();
    cy.get("[data-cy=save-button]").should("not.be.disabled");
    cy.get("[data-cy=nav-bar]").within(($navbar) => {
      cy.get("[data-cy=back-button]").trigger("mouseover").click();
    });
    // check if added subjects
    cy.location("pathname").then(($el) =>
      assert($el.replace("/admin", ""), "/setup")
    );
    cy.location("search").should("contain", "?i=4");
    cy.get("[data-cy=radio-6]").trigger("mouseover").click();
    cy.get("[data-cy=slide]").contains("Background questions");
    cy.get("[data-cy=radio-7]").trigger("mouseover").click();
    cy.get("[data-cy=slide]").contains("Repeat After Me questions");
    cy.get("[data-cy=radio-8]").trigger("mouseover").click();
    cy.get("[data-cy=slide]").contains("Leadership questions");
  });

  it("shows idle slide", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      ...baseMock,
      mentor: [setup3, setup3, setup4, setup4],
    });
    cy.visit("/setup?i=5");
    cy.get("[data-cy=next-btn]").should("exist");
    cy.get("[data-cy=back-btn]").should("exist");
    cy.get("[data-cy=done-btn]").should("exist");
    cy.get("[data-cy=slide]").within(($slide) => {
      cy.contains("Idle");
      cy.contains("Let's record a short idle calibration video.");
      cy.contains(
        "Click the record button and you'll be taken to a recording screen."
      );
      cy.get("[data-cy=check]").should("not.exist");
    });
    cy.get("[data-cy=radio-5]").should("have.css", "color", "rgb(255, 0, 0)");
    cy.get("[data-cy=slide]").within(($slide) => {
      cy.get("[data-cy=record-btn]").trigger("mouseover").click();
    });
    // go to record idle
    cy.location("pathname").then(($el) =>
      assert($el.replace("/admin", ""), "/record")
    );
    cy.location("search").should("contain", "?videoId=A3_1_1&back=/setup?i=5");
    cy.get("[data-cy=progress]").contains("Questions 1 / 1");
    cy.get("[data-cy=question-input]").within(($input) => {
      cy.get("textarea").should(
        "have.text",
        "Please look at the camera for 30 seconds without speaking. Try to remain in the same position."
      );
      cy.get("textarea").should("have.attr", "disabled");
    });
    cy.get("[data-cy=transcript-input]").within(($input) => {
      cy.get("textarea").should("have.text", "");
      cy.get("textarea").should("not.have.attr", "disabled");
    });
    cy.get("[data-cy=status]").contains("INCOMPLETE");
    cy.get("[data-cy=select-status]").trigger("mouseover").click();
    cy.get("[data-cy=complete]").trigger("mouseover").click();
    cy.get("[data-cy=status]").contains("COMPLETE");
    cy.get("[data-cy=done-btn]").trigger("mouseover").click();
    // back to setup
    cy.location("pathname").then(($el) =>
      assert($el.replace("/admin", ""), "/setup")
    );
    cy.location("search").should("contain", "?i=5");
    cy.get("[data-cy=check]").should("exist");
    cy.get("[data-cy=radio-5]").should(
      "have.css",
      "color",
      "rgb(27, 106, 156)"
    );
  });

  it("chat mentor does not have idle slide", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      ...baseMock,
      mentor: { ...setup0, mentorType: MentorType.CHAT },
    });
    cy.visit("/setup?i=5");
    cy.get("[data-cy=slide]").within(($slide) => {
      cy.contains("Background questions");
    });
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
    cy.visit("/setup?i=6");
    cy.get("[data-cy=next-btn]").should("exist");
    cy.get("[data-cy=back-btn]").should("exist");
    cy.get("[data-cy=done-btn]").should("exist");
    cy.get("[data-cy=radio-6]").should("have.css", "color", "rgb(255, 0, 0)");
    cy.get("[data-cy=slide]").within(($slide) => {
      cy.contains("Background questions");
      cy.contains(
        "These questions will ask general questions about your background that might be relevant to how people understand your career."
      );
      cy.contains("0 / 2");
      cy.get("[data-cy=check]").should("not.exist");
    });
    cy.get("[data-cy=record-btn]").trigger("mouseover").click();
    // record first question
    cy.location("pathname").then(($el) =>
      assert($el.replace("/admin", ""), "/record")
    );
    cy.location("search").should(
      "contain",
      "?subject=background&back=/setup?i=6"
    );
    cy.get("[data-cy=progress]").contains("Questions 1 / 2");
    cy.get("[data-cy=question-input]").within(($input) => {
      cy.get("textarea").should("have.text", "Who are you and what do you do?");
      cy.get("textarea").should("have.attr", "disabled");
    });
    cy.get("[data-cy=transcript-input]").within(($input) => {
      cy.get("textarea").should("have.text", "");
      cy.get("textarea").should("not.have.attr", "disabled");
    });
    cy.get("[data-cy=status]").contains("INCOMPLETE");
    cy.get("[data-cy=select-status]").trigger("mouseover").click();
    cy.get("[data-cy=complete]").trigger("mouseover").click();
    cy.get("[data-cy=status]").contains("COMPLETE");
    cy.get("[data-cy=save-btn]").trigger("mouseover").click();
    cy.get("[data-cy=nav-bar]").within(($navbar) => {
      cy.get("[data-cy=back-button]").trigger("mouseover").click();
    });
    // back to setup
    cy.location("pathname").then(($el) =>
      assert($el.replace("/admin", ""), "/setup")
    );
    cy.location("search").should("contain", "?i=6");
    cy.get("[data-cy=slide]").contains("1 / 2");
    cy.get("[data-cy=radio-6]").should("have.css", "color", "rgb(255, 0, 0)");
    cy.get("[data-cy=record-btn]").trigger("mouseover").click();
    // back to record
    cy.location("pathname").then(($el) =>
      assert($el.replace("/admin", ""), "/record")
    );
    cy.location("search").should(
      "contain",
      "?subject=background&back=/setup?i=6"
    );
    cy.get("[data-cy=progress]").contains("Questions 1 / 2");
    cy.get("[data-cy=question-input]").within(($input) => {
      cy.get("textarea").should("have.text", "Who are you and what do you do?");
      cy.get("textarea").should("have.attr", "disabled");
    });
    cy.get("[data-cy=transcript-input]").within(($input) => {
      cy.get("textarea").should(
        "have.text",
        "My name is Clint Anderson and I'm a Nuclear Electrician's Mate"
      );
      cy.get("textarea").should("not.have.attr", "disabled");
    });
    cy.get("[data-cy=status]").contains("COMPLETE");
    // record second question
    cy.get("[data-cy=next-btn]").trigger("mouseover").click();
    cy.get("[data-cy=progress]").contains("Questions 2 / 2");
    cy.get("[data-cy=question-input]").within(($input) => {
      cy.get("textarea").should("have.text", "How old are you now?");
      cy.get("textarea").should("have.attr", "disabled");
    });
    cy.get("[data-cy=transcript-input]").within(($input) => {
      cy.get("textarea").should("have.text", "");
      cy.get("textarea").should("not.have.attr", "disabled");
    });
    cy.get("[data-cy=status]").contains("INCOMPLETE");
    cy.get("[data-cy=rerecord-btn]").should("not.exist");
    cy.get("[data-cy=select-status]").trigger("mouseover").click();
    cy.get("[data-cy=complete]").trigger("mouseover").click();
    cy.get("[data-cy=status]").contains("COMPLETE");
    cy.get("[data-cy=save-btn]").trigger("mouseover").click();
    // back to setup
    cy.get("[data-cy=done-btn]").trigger("mouseover").click();
    cy.location("pathname").then(($el) =>
      assert($el.replace("/admin", ""), "/setup")
    );
    cy.location("search").should("contain", "?i=6");
    cy.get("[data-cy=check]").should("exist");
    cy.get("[data-cy=radio-6]").should(
      "have.css",
      "color",
      "rgb(27, 106, 156)"
    );
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
    cy.visit("/setup?i=7");
    cy.get("[data-cy=next-btn]").should("exist");
    cy.get("[data-cy=back-btn]").should("exist");
    cy.get("[data-cy=done-btn]").should("exist");
    cy.get("[data-cy=slide]").within(($slide) => {
      cy.contains("Repeat After Me questions");
      cy.contains("These are miscellaneous phrases you'll be asked to repeat.");
      cy.contains("1 / 3");
      cy.get("[data-cy=check]").should("not.exist");
    });
    cy.get("[data-cy=radio-7]").should("have.css", "color", "rgb(255, 0, 0)");
    cy.get("[data-cy=record-btn]").trigger("mouseover").click();
    // go to record
    cy.location("pathname").then(($el) =>
      assert($el.replace("/admin", ""), "/record")
    );
    cy.location("search").should(
      "contain",
      "?subject=repeat_after_me&back=/setup?i=7"
    );
    cy.get("[data-cy=progress]").contains("Questions 1 / 3");
    cy.get("[data-cy=question-input]").within(($input) => {
      cy.get("textarea").should(
        "have.text",
        "Please look at the camera for 30 seconds without speaking. Try to remain in the same position."
      );
      cy.get("textarea").should("have.attr", "disabled");
    });
    cy.get("[data-cy=transcript-input]").within(($input) => {
      cy.get("textarea").should("have.text", "");
      cy.get("textarea").should("not.have.attr", "disabled");
    });
    cy.get("[data-cy=status]").contains("COMPLETE");
    // record second question
    cy.get("[data-cy=next-btn]").trigger("mouseover").click();
    cy.get("[data-cy=progress]").contains("Questions 2 / 3");
    cy.get("[data-cy=question-input]").within(($input) => {
      cy.get("textarea").should(
        "have.text",
        "Please give a short introduction of yourself, which includes your name, current job, and title."
      );
      cy.get("textarea").should("have.attr", "disabled");
    });
    cy.get("[data-cy=transcript-input]").within(($input) => {
      cy.get("textarea").should("have.text", "");
      cy.get("textarea").should("not.have.attr", "disabled");
    });
    cy.get("[data-cy=status]").contains("INCOMPLETE");
    cy.get("[data-cy=select-status]").trigger("mouseover").click();
    cy.get("[data-cy=complete]").trigger("mouseover").click();
    cy.get("[data-cy=status]").contains("COMPLETE");
    // back to setup
    cy.get("[data-cy=nav-bar]").within(($navbar) => {
      cy.get("[data-cy=back-button]").trigger("mouseover").click();
    });
    cy.location("pathname").then(($el) =>
      assert($el.replace("/admin", ""), "/setup")
    );
    cy.location("search").should("contain", "?i=7");
    cy.get("[data-cy=slide]").contains("2 / 3");
    cy.get("[data-cy=radio-7]").should("have.css", "color", "rgb(255, 0, 0)");
    // back to record
    cy.get("[data-cy=record-btn]").trigger("mouseover").click();
    cy.location("pathname").then(($el) =>
      assert($el.replace("/admin", ""), "/record")
    );
    cy.location("search").should(
      "contain",
      "?subject=repeat_after_me&back=/setup?i=7"
    );
    cy.get("[data-cy=next-btn]").trigger("mouseover").click();
    cy.get("[data-cy=progress]").contains("Questions 2 / 3");
    cy.get("[data-cy=question-input]").within(($input) => {
      cy.get("textarea").should(
        "have.text",
        "Please give a short introduction of yourself, which includes your name, current job, and title."
      );
      cy.get("textarea").should("have.attr", "disabled");
    });
    cy.get("[data-cy=transcript-input]").within(($input) => {
      cy.get("textarea").should(
        "have.text",
        "My name is Clint Anderson I'm a Nuclear Electrician's Mate"
      );
      cy.get("textarea").should("not.have.attr", "disabled");
    });
    cy.get("[data-cy=status]").contains("COMPLETE");
    // record third question
    cy.get("[data-cy=next-btn]").trigger("mouseover").click();
    cy.get("[data-cy=progress]").contains("Questions 3 / 3");
    cy.get("[data-cy=question-input]").within(($input) => {
      cy.get("textarea").should(
        "have.text",
        "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'"
      );
      cy.get("textarea").should("have.attr", "disabled");
    });
    cy.get("[data-cy=transcript-input]").within(($input) => {
      cy.get("textarea").should("have.text", "");
      cy.get("textarea").should("not.have.attr", "disabled");
    });
    cy.get("[data-cy=status]").contains("INCOMPLETE");
    cy.get("[data-cy=select-status]").trigger("mouseover").click();
    cy.get("[data-cy=complete]").trigger("mouseover").click();
    cy.get("[data-cy=status]").contains("COMPLETE");
    // back to setup
    cy.get("[data-cy=done-btn]").trigger("mouseover").click();
    cy.location("pathname").then(($el) =>
      assert($el.replace("/admin", ""), "/setup")
    );
    cy.location("search").should("contain", "?i=7");
    cy.get("[data-cy=check]").should("exist");
    cy.get("[data-cy=radio-7]").should(
      "have.css",
      "color",
      "rgb(27, 106, 156)"
    );
  });

  describe("shows build mentor slide after completing setup", () => {
    it("fails to train mentor", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        ...baseMock,
        mentor: [setup8, setup9],
      });
      cyMockTrain(cy);
      cyMockTrainStatus(cy, { status: { state: TrainState.FAILURE } });
      cy.visit("/setup?i=8");
      cy.get("[data-cy=next-btn]").should("not.exist");
      cy.get("[data-cy=back-btn]").should("exist");
      cy.get("[data-cy=done-btn]").should("exist");
      cy.get("[data-cy=radio-8]").should("have.css", "color", "rgb(255, 0, 0)");
      cy.get("[data-cy=slide]").within(($slide) => {
        cy.contains("Great job! You're ready to build your mentor!");
        cy.contains("Click the build button to start building your mentor.");
        cy.contains("Once its complete, click preview to see your mentor.");
        cy.get("[data-cy=train-btn]").contains("Build");
        cy.get("[data-cy=train-btn]").trigger("mouseover").click();
        cy.contains("Oops, training failed. Please try again.");
      });
      cy.get("[data-cy=radio-8]").should("have.css", "color", "rgb(255, 0, 0)");
    });

    it("builds mentor", () => {
      cySetup(cy);
      cyMockDefault(cy, {
        ...baseMock,
        mentor: [setup8, setup9],
        gqlQueries: [mockGQL("updateMentor", true, true)],
      });
      cyMockTrain(cy);
      cyMockTrainStatus(cy, { status: { state: TrainState.SUCCESS } });
      cy.visit("/setup?i=8");
      cy.get("[data-cy=next-btn]").should("not.exist");
      cy.get("[data-cy=back-btn]").should("exist");
      cy.get("[data-cy=done-btn]").should("exist");
      cy.get("[data-cy=radio-8]").should("have.css", "color", "rgb(255, 0, 0)");
      cy.get("[data-cy=slide]").within(($slide) => {
        cy.contains("Great job! You're ready to build your mentor!");
        cy.contains("Click the build button to start building your mentor.");
        cy.contains("Once its complete, click preview to see your mentor.");
        cy.get("[data-cy=train-btn]").contains("Build");
        cy.get("[data-cy=train-btn]").trigger("mouseover").click();
        cy.contains("Building your mentor...");
        cy.contains("Congratulations! Your brand-new mentor is ready!");
        cy.contains("Click the preview button to see your mentor.");
        cy.get("[data-cy=preview-btn]").contains("Preview");
      });
      cy.get("[data-cy=radio-8]").should(
        "have.css",
        "color",
        "rgb(27, 106, 156)"
      );
      // preview mentor
      cy.get("[data-cy=preview-btn]").trigger("mouseover").click();
      cy.location("pathname").then(($el) =>
        assert($el.replace("/admin", ""), "/chat")
      );
      cy.location("search").should("contain", "?mentor=clintanderson");
    });
  });
});
