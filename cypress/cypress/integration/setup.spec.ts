/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { cySetup, cyInterceptGraphQL, cyMockLogin, cyMockGQL, cyMockTrain, mockTrainStatusSeq, cyMockTrainStatus } from "../support/functions";
import login from "../fixtures/login";
import subjects from "../fixtures/subjects";
import topics from "../fixtures/topics";
import leadership from "../fixtures/questionSet/leadership";
import { setup0, setup1, setup10, setup11, setup2, setup3, setup4, setup5, setup6, setup7, setup8, setup9 } from "../fixtures/mentor/setup"
import { TrainState } from "../support/types";

describe("Setup", () => {

  describe("can navigate through slides", () => {
    it("with next button", () => {
      cySetup(cy);
      cyMockLogin();
      cyInterceptGraphQL(cy, [
        cyMockGQL("login", login),
        cyMockGQL("mentor", setup0),
        cyMockGQL("subjects", [subjects])
      ]);
      cy.visit("/setup");
      cy.get("#slide").contains("Welcome to MentorPal!");
      cy.get("#next-btn").trigger('mouseover').click();
      cy.get("#slide").contains("Tell us a little about yourself.");
      cy.get("#next-btn").trigger('mouseover').click();
      cy.get("#slide").contains("Let's start recording.");
      cy.get("#next-btn").trigger('mouseover').click();
      cy.get("#slide").contains("Idle");
      cy.get("#next-btn").trigger('mouseover').click();
      cy.get("#slide").contains("Background questions");
      cy.get("#next-btn").trigger('mouseover').click();
      cy.get("#slide").contains("Repeat After Me questions");
    });

    it("with back button", () => {
      cySetup(cy);
      cyMockLogin();
      cyInterceptGraphQL(cy, [
        cyMockGQL("login", login),
        cyMockGQL("mentor", setup0),
        cyMockGQL("subjects", [subjects])
      ]);
      cy.visit("/setup?i=5");
      cy.get("#slide").contains("Repeat After Me questions");
      cy.get("#back-btn").trigger('mouseover').click();
      cy.get("#slide").contains("Background questions");
      cy.get("#back-btn").trigger('mouseover').click();
      cy.get("#slide").contains("Idle");
      cy.get("#back-btn").trigger('mouseover').click();
      cy.get("#slide").contains("Let's start recording.");
      cy.get("#back-btn").trigger('mouseover').click();
      cy.get("#slide").contains("Tell us a little about yourself.");
      cy.get("#back-btn").trigger('mouseover').click();
      cy.get("#slide").contains("Welcome to MentorPal!");
    });

    it("with radio buttons", () => {
      cySetup(cy);
      cyMockLogin();
      cyInterceptGraphQL(cy, [
        cyMockGQL("login", login),
        cyMockGQL("mentor", setup0),
        cyMockGQL("subjects", [subjects])
      ]);
      cy.visit("/setup");
      cy.get("#slide").contains("Welcome to MentorPal!");
      cy.get("#radio-1").trigger('mouseover').click();
      cy.get("#slide").contains("Tell us a little about yourself.");
      cy.get("#radio-2").trigger('mouseover').click();
      cy.get("#slide").contains("Let's start recording.");
      cy.get("#radio-3").trigger('mouseover').click();
      cy.get("#slide").contains("Idle");
      cy.get("#radio-4").trigger('mouseover').click();
      cy.get("#slide").contains("Background questions");
      cy.get("#radio-5").trigger('mouseover').click();
      cy.get("#slide").contains("Repeat After Me questions");
    });

    it("with query param i", () => {
      cySetup(cy);
      cyMockLogin();
      cyInterceptGraphQL(cy, [
        cyMockGQL("login", login),
        cyMockGQL("mentor", setup0),
        cyMockGQL("subjects", [subjects])
      ]);
      cy.visit("/setup?i=0");
      cy.get("#slide").contains("Welcome to MentorPal!");
      cy.visit("/setup?i=1");
      cy.get("#slide").contains("Tell us a little about yourself.");
      cy.visit("/setup?i=2");
      cy.get("#slide").contains("Let's start recording.");
      cy.visit("/setup?i=3");
      cy.get("#slide").contains("Idle");
      cy.visit("/setup?i=4");
      cy.get("#slide").contains("Background questions");
      cy.visit("/setup?i=5");
      cy.get("#slide").contains("Repeat After Me questions");
    });
  });

  it("shows setup page after logging in", () => {
    cySetup(cy);
    cyMockLogin();
    cyInterceptGraphQL(cy, [
      cyMockGQL("login", login),
      cyMockGQL("mentor", setup0),
      cyMockGQL("subjects", [subjects])
    ]);
    cy.visit("/login");
    cy.location("pathname").should("contain", "/setup");
  });

  it("shows welcome slide", () => {
    cySetup(cy);
    cyMockLogin();
    cyInterceptGraphQL(cy, [
      cyMockGQL("login", login),
      cyMockGQL("mentor", setup0),
      cyMockGQL("subjects", [subjects])
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
    cyInterceptGraphQL(cy, [
      cyMockGQL("login", login),
      cyMockGQL("mentor", [setup0, setup1, setup2, setup3]),
      cyMockGQL("updateMentor", [setup1, setup2, setup3], true),
      cyMockGQL("subjects", [subjects])
    ]);
    cy.visit("/setup?i=1");
    // empty mentor slide
    cy.get("#slide").contains("Tell us a little about yourself.");
    cy.get("#slide #first-name").should("have.value", "");
    cy.get("#slide #name").should("have.value", "");
    cy.get("#slide #title").should("have.value", "");
    cy.get("#slide #save-btn").should("be.disabled");
    cy.get("#next-btn").should("exist");
    cy.get("#back-btn").should("exist");
    cy.get("#done-btn").should("not.exist");
    cy.get("#radio-1").parent().parent().should("have.css", "color", "rgb(255, 0, 0)");
    // fill out first name and save
    cy.get("#slide #first-name").clear().type("Clint");
    cy.get("#slide #save-btn").should("not.be.disabled");
    cy.get("#slide #save-btn").trigger("mouseover").click();
    cy.get("#slide #first-name").should("have.value", "Clint");
    cy.get("#slide #name").should("have.value", "");
    cy.get("#slide #title").should("have.value", "");
    cy.get("#slide #save-btn").should("be.disabled");
    cy.get("#radio-1").parent().parent().should("have.css", "color", "rgb(255, 0, 0)");
    // fill out full name and save
    cy.get("#slide #name").clear().type("Clinton Anderson");
    cy.get("#slide #save-btn").should("not.be.disabled");
    cy.get("#slide #save-btn").trigger("mouseover").click();
    cy.get("#slide #first-name").should("have.value", "Clint");
    cy.get("#slide #name").should("have.value", "Clinton Anderson");
    cy.get("#slide #title").should("have.value", "");
    cy.get("#slide #save-btn").should("be.disabled");
    cy.get("#radio-1").parent().parent().should("have.css", "color", "rgb(255, 0, 0)");
    // fill out title and save
    cy.get("#slide #title").clear().type("Nuclear Electrician's Mate");
    cy.get("#slide #save-btn").should("not.be.disabled");
    cy.get("#slide #save-btn").trigger("mouseover").click();
    cy.get("#slide #first-name").should("have.value", "Clint");
    cy.get("#slide #name").should("have.value", "Clinton Anderson");
    cy.get("#slide #title").should("have.value", "Nuclear Electrician's Mate");
    cy.get("#slide #save-btn").should("be.disabled");
    cy.get("#radio-1").parent().parent().should("have.css", "color", "rgb(27, 106, 156)");
  });

  it("shows introduction slide", () => {
    cySetup(cy);
    cyMockLogin();
    cyInterceptGraphQL(cy, [
      cyMockGQL("login", login),
      cyMockGQL("mentor", [setup3]),
      cyMockGQL("subjects", [subjects])
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
    cyInterceptGraphQL(cy, [
      cyMockGQL("login", login),
      cyMockGQL("mentor", [setup3, setup3, setup4, setup4]),
      cyMockGQL("updateQuestion", [setup4], true),
      cyMockGQL("subjects", [subjects]),
      cyMockGQL("topics", [topics])
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
    cy.location("search").should("contain", "?videoId=A3_1_1&back=/setup?i=3");
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
    cyInterceptGraphQL(cy, [
      cyMockGQL("login", login),
      cyMockGQL("mentor", [setup4, setup4, setup5, setup5, setup6, setup6]),
      cyMockGQL("updateQuestion", [setup5, setup6], true),
      cyMockGQL("subjects", [subjects]),
      cyMockGQL("topics", [topics])
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
    cy.location("search").should("contain", "?subject=background&back=/setup?i=4");
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
    cy.location("search").should("contain", "?subject=background&back=/setup?i=4");
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
    cyInterceptGraphQL(cy, [
      cyMockGQL("login", login),
      cyMockGQL("mentor", [setup6, setup6, setup7, setup7, setup8, setup8]),
      cyMockGQL("updateQuestion", [setup7, setup8], true),
      cyMockGQL("subjects", [subjects]),
      cyMockGQL("topics", [topics])
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
    cy.location("search").should("contain", "?subject=repeat_after_me&back=/setup?i=5");
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
    cy.location("search").should("contain", "?subject=repeat_after_me&back=/setup?i=5");
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
    cyInterceptGraphQL(cy, [
      cyMockGQL("login", login),
      cyMockGQL("mentor", [setup0]),
      cyMockGQL("subjects", [subjects]),
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

  describe("shows build mentor slide after completing setup", () => {
    it("fails to train mentor", () => {
      cySetup(cy);
      cyMockLogin();
      cyInterceptGraphQL(cy, [
        cyMockGQL("login", login),
        cyMockGQL("mentor", [setup8, setup9]),
        cyMockGQL("updateMentor", setup9, true),
        cyMockGQL("subjects", [subjects]),
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
      cy.get("#build-btn").trigger('mouseover').click();
      cy.get("#slide").contains("Oops, training failed. Please try again.");
    });  

    it("trains and builds mentor", () => {
      cySetup(cy);
      cyMockLogin();
      cyInterceptGraphQL(cy, [
        cyMockGQL("login", login),
        cyMockGQL("mentor", [setup8, setup9]),
        cyMockGQL("updateMentor", setup9, true),
        cyMockGQL("subjects", [subjects]),
      ]);
      cyMockTrain(cy);
      cyMockTrainStatus(cy, { status: { state: TrainState.SUCCESS }});
      cy.visit("/setup?i=6");
      cy.get("#slide").contains("Great job! You're ready to build your mentor!");
      cy.get("#slide").contains("Click the build button to start building your mentor.");
      cy.get("#slide").contains("Once its complete, click preview to see your mentor.");
      cy.get("#next-btn").should("not.exist");
      cy.get("#back-btn").should("exist");
      cy.get("#done-btn").should("exist");
      cy.get("#build-btn").contains("Build");
      cy.get("#radio-6").parent().parent().should("have.css", "color", "rgb(255, 0, 0)");
      cy.get("#build-btn").trigger('mouseover').click();
      cy.get("#slide").contains("Congratulations! Your brand-new mentor is ready!");
      cy.get("#slide").contains("Click the preview button to see your mentor.");
      cy.get("#build-btn").contains("Preview");
      cy.get("#radio-6").parent().parent().should("have.css", "color", "rgb(27, 106, 156)");
      // preview mentor
      cy.get("#build-btn").trigger('mouseover').click();
      cy.location("hostname").should("contain", "mentorpal.org");
      cy.location("pathname").should("contain", "mentorpanel/");
      cy.location("search").should("contain", "?mentor=clintanderson");
    });
  });

  it("hides add set slide if mentor has not been built", () => {
    cySetup(cy);
    cyMockLogin();
    cyInterceptGraphQL(cy, [
      cyMockGQL("login", login),
      cyMockGQL("mentor", [setup8]),
      cyMockGQL("subjects", [subjects]),
    ]);
    cy.visit("/setup");
    cy.get("#radio-7").should("not.exist");
  });

  it("shows add set slide after mentor has been built", () => {
    cySetup(cy);
    cyMockLogin();
    cyInterceptGraphQL(cy, [
      cyMockGQL("login", login),
      cyMockGQL("mentor", [setup9, setup10, setup11]),
      cyMockGQL("addQuestionSet", [setup10], true),
      cyMockGQL("updateQuestion", [setup11], true),
      cyMockGQL("questionSet", [leadership]),
      cyMockGQL("subjects", [subjects]),
      cyMockGQL("topics", [topics]),
    ]);
    cy.visit("/setup?i=7");
    cy.get("#slide").contains("Pick a Field?");
    cy.get("#slide").contains("Your basic mentor is done, but you can make it better by picking a question set.");
    cy.get("#slide").contains("These question sets are specific to your field of expertise. Pick the one you are most qualified to mentor in.");
    cy.get("#slide").contains("Each set will ask you some related questions. After answering, you'll be placed in a panel with other mentors in your field.");
    cy.get("#radio-7").parent().parent().should("have.css", "color", "rgb(27, 106, 156)");
    // shows options
    cy.get("#select-set").trigger("mouseover").click();
    cy.get("#repeat_after_me").trigger("mouseover").click();
    cy.get("#select-set").contains("Repeat After Me");
    cy.get("#slide").contains("These are miscellaneous phrases you'll be asked to repeat.");
    cy.get("#set-btn").contains("Record");
    cy.get("#check").should("exist");
    cy.get("#select-set").trigger("mouseover").click();
    cy.get("#background").trigger("mouseover").click();
    cy.get("#select-set").contains("Background");
    cy.get("#slide").contains("These questions will ask general questions about your background that might be relevant to how people understand your career.");
    cy.get("#set-btn").contains("Record");
    cy.get("#check").should("exist");
    cy.get("#select-set").trigger("mouseover").click();
    cy.get("#stem").trigger("mouseover").click();
    cy.get("#select-set").contains("STEM");
    cy.get("#slide").contains("These questions will ask about STEM careers.");
    cy.get("#set-btn").contains("Add");
    cy.get("#check").should("not.exist");
    cy.get("#select-set").trigger("mouseover").click();
    cy.get("#leadership").trigger("mouseover").click();
    cy.get("#select-set").contains("Leadership");
    cy.get("#slide").contains("These questions will ask about being in a leadership role.");
    cy.get("#set-btn").contains("Add");
    cy.get("#check").should("not.exist");
    // add question set
    cy.get("#set-btn").trigger("mouseover").click();
    cy.get("#set-btn").contains("Record");
    cy.get("#slide").contains("0 / 1");
    // record question set
    cy.get("#set-btn").trigger("mouseover").click();
    cy.location("pathname").should("contain", "/record");
    cy.location("search").should("contain", "?subject=leadership&back=/setup?i=7");
    cy.get("#progress").contains("Questions 1 / 1");
    cy.get("#question-input").should("have.value", "What's the hardest decision you've had to make as a leader?");
    cy.get("#question-input").should("be.disabled");
    cy.get("#transcript-input").should("have.value", "");
    cy.get("#topics").contains("Advice");
    cy.get("#status").contains("Incomplete");
    cy.get("#select-status").trigger('mouseover').click();
    cy.get("#complete").trigger('mouseover').click();
    cy.get("#status").contains("Complete");
    // back to setup
    cy.visit("/setup?i=7");
    cy.location("pathname").should("contain", "/setup");
    cy.location("search").should("contain", "?i=7");
    cy.get("#select-set").trigger("mouseover").click();
    cy.get("#leadership").trigger("mouseover").click();
    cy.get("#select-set").contains("Leadership");
    cy.get("#set-btn").contains("Record");
    cy.get("#check");
    // click done
    cy.get("#done-btn").trigger("mouseover").click();
    cy.location("pathname").should("not.contain", "/setup");
    cy.get("#questions #progress").contains("Questions (6 / 6)");
    cy.get("#complete-questions").contains("Recorded (6)");
    cy.get("#incomplete-questions").contains("Unrecorded (0)");
  });
});
