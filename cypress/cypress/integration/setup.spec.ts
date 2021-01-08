/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
declare var require: any
import { cySetup, cyMockGraphQL, cyMockLogin } from "../support/functions";

describe("Setup", () => {

  // describe("can navigate through slides", () => {
  //   it("with next button", () => {
  //     cySetup(cy);
  //     cyMockLogin();
  //     cyMockGraphQL(cy, [
  //       {
  //         query: "login",
  //         data: require("../fixtures/login")
  //       },
  //       {
  //         query: "mentor",
  //         data: require("../fixtures/mentor/clint-new")
  //       },
  //       {
  //         query: "sets",
  //         data: require("../fixtures/sets")
  //       }
  //     ]);
  //     cy.visit("/setup");
  //     cy.get("#slide").contains("Welcome to MentorPal!");
  //     cy.get("#next-btn").trigger('mouseover').click();
  //     cy.get("#slide").contains("Tell us a little about yourself.");
  //     cy.get("#next-btn").trigger('mouseover').click();
  //     cy.get("#slide").contains("Let's start recording.");
  //     cy.get("#next-btn").trigger('mouseover').click();
  //     cy.get("#slide").contains("Idle");
  //     cy.get("#next-btn").trigger('mouseover').click();
  //     cy.get("#slide").contains("Background questions");
  //     cy.get("#next-btn").trigger('mouseover').click();
  //     cy.get("#slide").contains("Repeat After Me questions");
  //   });

  //   it("with back button", () => {
  //     cySetup(cy);
  //     cyMockLogin();
  //     cyMockGraphQL(cy, [
  //       {
  //         query: "login",
  //         data: require("../fixtures/login")
  //       },
  //       {
  //         query: "mentor",
  //         data: require("../fixtures/mentor/clint-new")
  //       },
  //       {
  //         query: "sets",
  //         data: require("../fixtures/sets")
  //       }
  //     ]);
  //     cy.visit("/setup?i=5");
  //     cy.get("#slide").contains("Repeat After Me questions");
  //     cy.get("#back-btn").trigger('mouseover').click();
  //     cy.get("#slide").contains("Background questions");
  //     cy.get("#back-btn").trigger('mouseover').click();
  //     cy.get("#slide").contains("Idle");
  //     cy.get("#back-btn").trigger('mouseover').click();
  //     cy.get("#slide").contains("Let's start recording.");
  //     cy.get("#back-btn").trigger('mouseover').click();
  //     cy.get("#slide").contains("Tell us a little about yourself.");
  //     cy.get("#back-btn").trigger('mouseover').click();
  //     cy.get("#slide").contains("Welcome to MentorPal!");
  //   });

  //   it("with radio buttons", () => {
  //     cySetup(cy);
  //     cyMockLogin();
  //     cyMockGraphQL(cy, [
  //       {
  //         query: "login",
  //         data: require("../fixtures/login")
  //       },
  //       {
  //         query: "mentor",
  //         data: require("../fixtures/mentor/clint-new")
  //       },
  //       {
  //         query: "sets",
  //         data: require("../fixtures/sets")
  //       }
  //     ]);
  //     cy.visit("/setup");
  //     cy.get("#slide").contains("Welcome to MentorPal!");
  //     cy.get("#radio-1").trigger('mouseover').click();
  //     cy.get("#slide").contains("Tell us a little about yourself.");
  //     cy.get("#radio-2").trigger('mouseover').click();
  //     cy.get("#slide").contains("Let's start recording.");
  //     cy.get("#radio-3").trigger('mouseover').click();
  //     cy.get("#slide").contains("Idle");
  //     cy.get("#radio-4").trigger('mouseover').click();
  //     cy.get("#slide").contains("Background questions");
  //     cy.get("#radio-5").trigger('mouseover').click();
  //     cy.get("#slide").contains("Repeat After Me questions");
  //   });

  //   it("with query param i", () => {
  //     cySetup(cy);
  //     cyMockLogin();
  //     cyMockGraphQL(cy, [
  //       {
  //         query: "login",
  //         data: require("../fixtures/login")
  //       },
  //       {
  //         query: "mentor",
  //         data: require("../fixtures/mentor/clint-new")
  //       },
  //       {
  //         query: "sets",
  //         data: require("../fixtures/sets")
  //       }
  //     ]);
  //     cy.visit("/setup?i=0");
  //     cy.get("#slide").contains("Welcome to MentorPal!");
  //     cy.visit("/setup?i=1");
  //     cy.get("#slide").contains("Tell us a little about yourself.");
  //     cy.visit("/setup?i=2");
  //     cy.get("#slide").contains("Let's start recording.");
  //     cy.visit("/setup?i=3");
  //     cy.get("#slide").contains("Idle");
  //     cy.visit("/setup?i=4");
  //     cy.get("#slide").contains("Background questions");
  //     cy.visit("/setup?i=5");
  //     cy.get("#slide").contains("Repeat After Me questions");
  //   });
  // });

  it("shows setup page after logging in", () => {
    cySetup(cy);
    cyMockLogin();
    cyMockGraphQL(cy, [
      {
        query: "login",
        data: require("../fixtures/login")
      },
      {
        query: "mentor",
        data: require("../fixtures/mentor/clint-new")
      },
      {
        query: "sets",
        data: require("../fixtures/sets")
      }
    ]);
    cy.visit("/login");
    cy.location("pathname").should("contain", "/setup");
  });

  it("shows welcome slide", () => {
    cySetup(cy);
    cyMockLogin();
    cyMockGraphQL(cy, [
      {
        query: "login",
        data: require("../fixtures/login")
      },
      {
        query: "mentor",
        data: require("../fixtures/mentor/clint-new")
      },
      {
        query: "sets",
        data: require("../fixtures/sets")
      }
    ]);
    cy.visit("/setup?i=0");
    cy.get("#slide").contains("Welcome to MentorPal!");
    cy.get("#slide").contains("It's nice to meet you, Clinton Anderson!");
    cy.get("#slide").contains("Let's get started setting up your new mentor.");
    cy.get("#next-btn").should("exist");
    cy.get("#back-btn").should("not.exist");
    cy.get("#done-btn").should("not.exist");
    cy.get("#radio-0").parent().parent().should("have.css", "color", "rgb(27, 106, 156)");
  });

  it("shows mentor slide", () => {
    cySetup(cy);
    cyMockLogin();
    cyMockGraphQL(cy, [
      {
        query: "login",
        data: require("../fixtures/login")
      },
      {
        query: "mentor",
        data: [
          require("../fixtures/mentor/clint-new"),
          require("../fixtures/mentor/clint-setup1"),
          require("../fixtures/mentor/clint-setup2"),
          require("../fixtures/mentor/clint-setup3"),
        ]
      },
      {
        query: "updateMentor",
        data: [
          require("../fixtures/updateMentor/clint-setup1"),
          require("../fixtures/updateMentor/clint-setup2"),
          require("../fixtures/updateMentor/clint-setup3"),
        ]
      },
      {
        query: "sets",
        data: require("../fixtures/sets")
      }
    ]);
    cy.visit("/setup?i=1");
    // empty mentor slide
    cy.get("#slide").contains("Tell us a little about yourself.");
    cy.get("#slide #short-name").should("have.value", "");
    cy.get("#slide #name").should("have.value", "");
    cy.get("#slide #title").should("have.value", "");
    cy.get("#slide #save-btn").should("be.disabled");
    cy.get("#next-btn").should("exist");
    cy.get("#back-btn").should("exist");
    cy.get("#done-btn").should("not.exist");
    cy.get("#radio-1").parent().parent().should("have.css", "color", "rgb(255, 0, 0)");
    // fill out first name and save
    cy.get("#slide #short-name").clear().type("Clint");
    cy.get("#slide #save-btn").should("not.be.disabled");
    cy.get("#slide #save-btn").trigger("mouseover").click();
    cy.get("#slide #short-name").should("have.value", "Clint");
    cy.get("#slide #name").should("have.value", "");
    cy.get("#slide #title").should("have.value", "");
    cy.get("#slide #save-btn").should("be.disabled");
    cy.get("#radio-1").parent().parent().should("have.css", "color", "rgb(255, 0, 0)");
    // fill out full name and save
    cy.get("#slide #name").clear().type("Clinton Anderson");
    cy.get("#slide #save-btn").should("not.be.disabled");
    cy.get("#slide #save-btn").trigger("mouseover").click();
    cy.get("#slide #short-name").should("have.value", "Clint");
    cy.get("#slide #name").should("have.value", "Clinton Anderson");
    cy.get("#slide #title").should("have.value", "");
    cy.get("#slide #save-btn").should("be.disabled");
    cy.get("#radio-1").parent().parent().should("have.css", "color", "rgb(255, 0, 0)");
    // fill out title and save
    cy.get("#slide #title").clear().type("Nuclear Electrician's Mate");
    cy.get("#slide #save-btn").should("not.be.disabled");
    cy.get("#slide #save-btn").trigger("mouseover").click();
    cy.get("#slide #short-name").should("have.value", "Clint");
    cy.get("#slide #name").should("have.value", "Clinton Anderson");
    cy.get("#slide #title").should("have.value", "Nuclear Electrician's Mate");
    cy.get("#slide #save-btn").should("be.disabled");
    cy.get("#radio-1").parent().parent().should("have.css", "color", "rgb(27, 106, 156)");
  });

  it("shows introduction slide", () => {
    cySetup(cy);
    cyMockLogin();
    cyMockGraphQL(cy, [
      {
        query: "login",
        data: require("../fixtures/login")
      },
      {
        query: "mentor",
        data: require("../fixtures/mentor/clint-setup3")
      },
      {
        query: "sets",
        data: require("../fixtures/sets")
      }
    ]);
    cy.visit("/setup?i=2");
    cy.get("#slide").contains("Let's start recording.");
    cy.get("#slide").contains("You'll be asked to answer some background questions and repeat after mes.");
    cy.get("#slide").contains("Once you're done recording, you can build and preview your mentor.");
    cy.get("#slide").contains("If you'd like to stop, press done at any point. You can always finish later.");
    cy.get("#next-btn").should("exist");
    cy.get("#back-btn").should("exist");
    cy.get("#done-btn").should("exist");
    cy.get("#radio-2").parent().parent().should("have.css", "color", "rgb(27, 106, 156)");
    // click done
    cy.get("#done-btn").trigger("mouseover").click();
    cy.location("pathname").should("not.contain", "/setup");
    cy.get("#questions #progress").contains("Questions (0 / 5)");
    cy.get("#complete-questions").contains("Recorded (0)");
    cy.get("#incomplete-questions").contains("Unrecorded (5)");
  });

  it("shows idle slide", () => {
    cySetup(cy);
    cyMockLogin();
    cyMockGraphQL(cy, [
      {
        query: "login",
        data: require("../fixtures/login")
      },
      {
        query: "mentor",
        data: [
          require("../fixtures/mentor/clint-setup3"),
          require("../fixtures/mentor/clint-setup3"),
          require("../fixtures/mentor/clint-setup4"),
          require("../fixtures/mentor/clint-setup4"),
        ]
      },
      {
        query: "updateQuestion",
        data: require("../fixtures/updateQuestion/clint-setup4")
      },
      {
        query: "sets",
        data: require("../fixtures/sets")
      },
      {
        query: "topics",
        data: require("../fixtures/topics")
      }
    ]);
    cy.visit("/setup?i=3");
    cy.get("#slide").contains("Idle");
    cy.get("#slide").contains("Let's record a short idle calibration.");
    cy.get("#slide").contains("Click the record button and you'll be taken to a recording screen.");
    cy.get("#next-btn").should("exist");
    cy.get("#back-btn").should("exist");
    cy.get("#done-btn").should("exist");
    cy.get("#check").should("not.exist");
    cy.get("#radio-3").parent().parent().should("have.css", "color", "rgb(255, 0, 0)");
    // record idle
    cy.get("#record-btn").trigger("mouseover").click();
    cy.location("pathname").should("contain", "/record");
    cy.location("search").should("contain", "?topic=idle&back=/setup?i=3");
    cy.get("#progress").contains("Questions 1 / 1");
    cy.get("#question-input").should("have.value", "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.");
    cy.get("#question-input").should("be.disabled");
    cy.get("#transcript-input").should("have.value", "");
    cy.get("#topics").contains("Idle");
    cy.get("#status").contains("Incomplete");
    cy.get("#select-status").trigger('mouseover').click();
    cy.get("#complete").trigger('mouseover').click();
    cy.get("#status").contains("Complete");
    // back to setup
    cy.get("#done-btn").trigger("mouseover").click();
    cy.location("pathname").should("contain", "/setup");
    cy.location("search").should("contain", "?i=3");
    cy.get("#check").should("exist");
    cy.get("#radio-3").parent().parent().should("have.css", "color", "rgb(27, 106, 156)");
    // click done
    cy.get("#done-btn").trigger("mouseover").click();
    cy.location("pathname").should("not.contain", "/setup");
    cy.get("#questions #progress").contains("Questions (1 / 5)");
    cy.get("#complete-questions").contains("Recorded (1)");
    cy.get("#incomplete-questions").contains("Unrecorded (4)");
  });

  it("shows background questions slide", () => {
    cySetup(cy);
    cyMockLogin();
    cyMockGraphQL(cy, [
      {
        query: "login",
        data: require("../fixtures/login")
      },
      {
        query: "mentor",
        data: [
          require("../fixtures/mentor/clint-setup4"),
          require("../fixtures/mentor/clint-setup4"),
          require("../fixtures/mentor/clint-setup5"),
          require("../fixtures/mentor/clint-setup5"),
          require("../fixtures/mentor/clint-setup6"),
          require("../fixtures/mentor/clint-setup6"),
        ]
      },
      {
        query: "updateQuestion",
        data: [
          require("../fixtures/updateQuestion/clint-setup4"),
          require("../fixtures/updateQuestion/clint-setup5"),
          require("../fixtures/updateQuestion/clint-setup6"),
        ]
      },
      {
        query: "sets",
        data: require("../fixtures/sets")
      },
      {
        query: "topics",
        data: require("../fixtures/topics")
      }
    ]);
    cy.visit("/setup?i=4");
    cy.get("#slide").contains("Background questions");
    cy.get("#slide").contains("These questions will ask general questions about your background that might be relevant to how people understand your career.");
    cy.get("#slide").contains("0 / 2");
    cy.get("#next-btn").should("exist");
    cy.get("#back-btn").should("exist");
    cy.get("#done-btn").should("exist");
    cy.get("#check").should("not.exist");
    cy.get("#radio-4").parent().parent().should("have.css", "color", "rgb(255, 0, 0)");
    // record first question
    cy.get("#record-btn").trigger("mouseover").click();
    cy.location("pathname").should("contain", "/record");
    cy.location("search").should("contain", "?set=background&back=/setup?i=4");
    cy.get("#progress").contains("Questions 1 / 2");
    cy.get("#question-input").should("have.value", "Who are you and what do you do?");
    cy.get("#question-input").should("be.disabled");
    cy.get("#transcript-input").should("have.value", "");
    cy.get("#topics").contains("Background");
    cy.get("#status").contains("Incomplete");
    cy.get("#select-status").trigger('mouseover').click();
    cy.get("#complete").trigger('mouseover').click();
    cy.get("#status").contains("Complete");
    // back to setup
    cy.visit("/setup?i=4");
    cy.location("pathname").should("contain", "/setup");
    cy.location("search").should("contain", "?i=4");
    cy.get("#slide").contains("1 / 2");
    cy.get("#radio-4").parent().parent().should("have.css", "color", "rgb(255, 0, 0)");
    // back to record
    cy.get("#record-btn").trigger("mouseover").click();
    cy.location("pathname").should("contain", "/record");
    cy.location("search").should("contain", "?set=background&back=/setup?i=4");
    cy.get("#progress").contains("Questions 1 / 2");
    cy.get("#question-input").should("have.value", "Who are you and what do you do?");
    cy.get("#question-input").should("be.disabled");
    cy.get("#transcript-input").should("have.value", "My name is Clint Anderson and I'm a Nuclear Electrician's Mate");
    cy.get("#topics").contains("Background");
    cy.get("#status").contains("Complete");
    cy.get("#rerecord-btn").should("exist");
    // record second question
    cy.get("#next-btn").trigger("mouseover").click();
    cy.get("#progress").contains("Questions 2 / 2");
    cy.get("#question-input").should("have.value", "How old are you now?");
    cy.get("#question-input").should("be.disabled");
    cy.get("#transcript-input").should("have.value", "");
    cy.get("#topics").contains("Background");
    cy.get("#status").contains("Incomplete");
    cy.get("#rerecord-btn").should("not.exist");
    cy.get("#select-status").trigger('mouseover').click();
    cy.get("#complete").trigger('mouseover').click();
    cy.get("#status").contains("Complete");
    // back to setup
    cy.get("#done-btn").trigger("mouseover").click();
    cy.location("pathname").should("contain", "/setup");
    cy.location("search").should("contain", "?i=4");
    cy.get("#check").should("exist");
    cy.get("#radio-4").parent().parent().should("have.css", "color", "rgb(27, 106, 156)");
    // click done
    cy.get("#done-btn").trigger("mouseover").click();
    cy.location("pathname").should("not.contain", "/setup");
    cy.get("#questions #progress").contains("Questions (3 / 5)");
    cy.get("#complete-questions").contains("Recorded (3)");
    cy.get("#incomplete-questions").contains("Unrecorded (2)");
  });

  it("shows repeat after me questions slide", () => {
    cySetup(cy);
    cyMockLogin();
    cyMockGraphQL(cy, [
      {
        query: "login",
        data: require("../fixtures/login")
      },
      {
        query: "mentor",
        data: [
          require("../fixtures/mentor/clint-setup6"),
          require("../fixtures/mentor/clint-setup6"),
          require("../fixtures/mentor/clint-setup7"),
          require("../fixtures/mentor/clint-setup7"),
          require("../fixtures/mentor/clint-setup8"),
          require("../fixtures/mentor/clint-setup8"),
        ]
      },
      {
        query: "updateQuestion",
        data: [
          require("../fixtures/updateQuestion/clint-setup7"),
          require("../fixtures/updateQuestion/clint-setup8"),
        ]
      },
      {
        query: "sets",
        data: require("../fixtures/sets")
      },
      {
        query: "topics",
        data: require("../fixtures/topics")
      }
    ]);
    cy.visit("/setup?i=5");
    cy.get("#slide").contains("Repeat After Me questions");
    cy.get("#slide").contains("These are miscellaneous phrases you'll be asked to repeat.");
    cy.get("#slide").contains("1 / 3");
    cy.get("#next-btn").should("exist");
    cy.get("#back-btn").should("exist");
    cy.get("#done-btn").should("exist");
    cy.get("#check").should("not.exist");
    cy.get("#radio-5").parent().parent().should("have.css", "color", "rgb(255, 0, 0)");
    // go to record
    cy.get("#record-btn").trigger("mouseover").click();
    cy.location("pathname").should("contain", "/record");
    cy.location("search").should("contain", "?set=repeat_after_me&back=/setup?i=5");
    cy.get("#progress").contains("Questions 1 / 3");
    cy.get("#question-input").should("have.value", "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.");
    cy.get("#question-input").should("be.disabled");
    cy.get("#transcript-input").should("have.value", "");
    cy.get("#topics").contains("Idle");
    cy.get("#status").contains("Complete");
    cy.get("#rerecord-btn").should("exist");
    // record second question
    cy.get("#next-btn").trigger("mouseover").click();
    cy.get("#progress").contains("Questions 2 / 3");
    cy.get("#question-input").should("have.value", "Please give a short introduction of yourself, which includes your name, current job, and title.");
    cy.get("#question-input").should("be.disabled");
    cy.get("#transcript-input").should("have.value", "");
    cy.get("#topics").contains("Intro");
    cy.get("#status").contains("Incomplete");
    cy.get("#rerecord-btn").should("not.exist");
    cy.get("#select-status").trigger('mouseover').click();
    cy.get("#complete").trigger('mouseover').click();
    cy.get("#status").contains("Complete");
    // back to setup
    cy.visit("/setup?i=5");
    cy.location("pathname").should("contain", "/setup");
    cy.location("search").should("contain", "?i=5");
    cy.get("#slide").contains("2 / 3");
    cy.get("#radio-5").parent().parent().should("have.css", "color", "rgb(255, 0, 0)");
    // back to record
    cy.get("#record-btn").trigger("mouseover").click();
    cy.location("pathname").should("contain", "/record");
    cy.location("search").should("contain", "?set=repeat_after_me&back=/setup?i=5");
    cy.get("#next-btn").trigger("mouseover").click();
    cy.get("#progress").contains("Questions 2 / 3");
    cy.get("#question-input").should("have.value", "Please give a short introduction of yourself, which includes your name, current job, and title.");
    cy.get("#question-input").should("be.disabled");
    cy.get("#transcript-input").should("have.value", "My name is Clint Anderson I'm a Nuclear Electrician's Mate");
    cy.get("#topics").contains("Intro");
    cy.get("#status").contains("Complete");
    cy.get("#rerecord-btn").should("exist");
    // record third question
    cy.get("#next-btn").trigger("mouseover").click();
    cy.get("#progress").contains("Questions 3 / 3");
    cy.get("#question-input").should("have.value", "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'");
    cy.get("#question-input").should("be.disabled");
    cy.get("#transcript-input").should("have.value", "");
    cy.get("#topics").contains("Off-Topic");
    cy.get("#status").contains("Incomplete");
    cy.get("#rerecord-btn").should("not.exist");
    cy.get("#select-status").trigger('mouseover').click();
    cy.get("#complete").trigger('mouseover').click();
    cy.get("#status").contains("Complete");
    // back to setup
    cy.get("#done-btn").trigger("mouseover").click();
    cy.location("pathname").should("contain", "/setup");
    cy.location("search").should("contain", "?i=5");
    cy.get("#check").should("exist");
    cy.get("#radio-5").parent().parent().should("have.css", "color", "rgb(27, 106, 156)");
    // click done
    cy.get("#done-btn").trigger("mouseover").click();
    cy.location("pathname").should("not.contain", "/setup");
    cy.get("#questions #progress").contains("Questions (5 / 5)");
    cy.get("#complete-questions").contains("Recorded (5)");
    cy.get("#incomplete-questions").contains("Unrecorded (0)");
  });

  it("shows build mentor error slide if setup isn't complete", () => {
    cySetup(cy);
    cyMockLogin();
    cyMockGraphQL(cy, [
      {
        query: "login",
        data: require("../fixtures/login")
      },
      {
        query: "mentor",
        data: require("../fixtures/mentor/clint-new")
      },
      {
        query: "sets",
        data: require("../fixtures/sets")
      }
    ]);
    cy.visit("/setup?i=6");
    cy.get("#slide").contains("Oops! We aren't done just yet!");
    cy.get("#slide").contains("You're still missing some steps before you can build a mentor.");
    cy.get("#slide").contains("Please check the previous steps and make sure you've recorded all videos and filled out all fields.");
    cy.get("#next-btn").should("not.exist");
    cy.get("#back-btn").should("exist");
    cy.get("#done-btn").should("exist");
    cy.get("#radio-6").parent().parent().should("have.css", "color", "rgb(255, 0, 0)");
  });

  it("shows build mentor slide after completing setup", () => {
    cySetup(cy);
    cyMockLogin();
    cyMockGraphQL(cy, [
      {
        query: "login",
        data: require("../fixtures/login")
      },
      {
        query: "mentor",
        data: require("../fixtures/mentor/clint-setup8")
      },
      {
        query: "buildMentor",
        data: require("../fixtures/buildMentor/clint-setup9")
      },
      {
        query: "sets",
        data: require("../fixtures/sets")
      }
    ]);
    cy.visit("/setup?i=6");
    cy.get("#slide").contains("Great job! You're ready to build your mentor!");
    cy.get("#slide").contains("Click the build button to start building your mentor.");
    cy.get("#slide").contains("Once its complete, click preview to see your mentor.");
    cy.get("#next-btn").should("not.exist");
    cy.get("#back-btn").should("exist");
    cy.get("#done-btn").should("exist");
    cy.get("#build-btn").contains("Build");
    cy.get("#radio-6").parent().parent().should("have.css", "color", "rgb(255, 0, 0)");
    // build mentor
    cy.get("#build-btn").trigger('mouseover').click();
    cy.get("#build-btn").should("be.disabled");
    cy.get("#slide").contains("Building your mentor...");
    // mentor built
    cy.get("#slide").contains("Congratulations! Your brand-new mentor is ready!");
    cy.get("#slide").contains("Click the preview button to see your mentor.");
    cy.get("#build-btn").contains("Preview");
    cy.get("#radio-6").parent().parent().should("have.css", "color", "rgb(27, 106, 156)");
  });
});
