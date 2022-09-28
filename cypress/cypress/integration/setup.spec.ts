/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { cyMockDefault, mockGQL } from "../support/functions";
import {
  setup0,
  setup1,
  setup2,
  setup3,
  setup6,
  setup7,
  setup8,
} from "../fixtures/mentor";
import { keywords } from "../fixtures/keywords";
import repeatAfterMe from "../fixtures/subjects/repeat_after_me";
import allSubjects from "../fixtures/subjects/all-subjects";
import {
  MentorType,
  SubjectTypes,
  QuestionType,
  UtteranceName,
} from "../support/types";

const baseMock = {
  mentor: setup0,
};

const subjectData = [
  {
    _id: "idle_and_initial_recordings",
    name: "Idle and Initial Recordings",
    type: SubjectTypes.UTTERANCES,
    isRequired: true,
    description: "These are miscellaneous phrases you'll be asked to repeat.",
    categories: [
      {
        id: "category2",
        name: "Category2",
        description: "Another category",
      },
    ],
    topics: [],
    questions: [
      {
        question: {
          _id: "A3_1_1",
          clientId: "C3_1_1",
          question:
            "Please look at the camera for 30 seconds without speaking. Try to remain in the same position.",
          type: QuestionType.UTTERANCE,
          name: UtteranceName.IDLE,
          paraphrases: [],
          mentorType: MentorType.VIDEO,
          minVideoLength: 10,
        },
        topics: [],
      },
      {
        question: {
          _id: "A4_1_1",
          clientId: "C4_1_1",
          question:
            "Please give a short introduction of yourself, which includes your name, current job, and title.",
          type: QuestionType.UTTERANCE,
          name: UtteranceName.INTRO,
          paraphrases: [],
        },
        topics: [],
      },
      {
        question: {
          _id: "A5_1_1",
          clientId: "C5_1_1",
          question:
            "Please repeat the following: 'I couldn't understand the question. Try asking me something else.'",
          type: QuestionType.UTTERANCE,
          name: UtteranceName.OFF_TOPIC,
          paraphrases: [],
        },
        topics: [],
        category: {
          id: "category2",
          name: "Category2",
          description: "Another category",
        },
      },
      {
        question: {
          _id: "A8_1_1",
          clientId: "C8_1_1",
          question: "test",
          type: QuestionType.UTTERANCE,
          name: UtteranceName.OFF_TOPIC,
          paraphrases: [],
          mentor: "clintanderson",
        },
        topics: [],
        category: {
          id: "category2",
          name: "Category2",
          description: "Another category",
        },
      },
    ],
  },
];

Cypress.on("uncaught:exception", (err, runnable) => {
  console.error(err);
  return false;
});

function snapname(n) {
  return `screenshots-setup-${n}`;
}

export enum SetupScreen {
  Welcome = 0,
  Tell_Us_About_Yourself = 1,
  Pick_Mentor_Type = 2,
  My_Goal = 3,
  Experiences_Identities = 4,
  Select_Subjects = 5,
  Start_Recordin = 6,
  Idle_Video_Tips = 7,
  Idle_And_Initial_Recordings = 8,
  Build_Mentor = 9,
}

export function cyVisitSetupScreen(cy, screen: SetupScreen) {
  cy.visit(`/setup?i=${screen}`);
}

describe("Setup", () => {
  describe("can navigate through slides", () => {
    it("with next button", () => {
      cyMockDefault(cy, {
        mentor: { ...setup0, subjects: subjectData },
        gqlQueries: [
          mockGQL("UpdateMentorDetails", { me: { updateMentorDetails: true } }),
        ],
      });
      cy.visit("/setup");
      cy.get("[data-cy=slide-title]").should(
        "have.text",
        "Welcome to MentorStudio!"
      );
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();
      cy.get("[data-cy=slide-title]").should(
        "have.text",
        "Tell us a little about yourself."
      );
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();
      cy.get("[data-cy=slide-title]").should(
        "have.text",
        "Pick a mentor type."
      );
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();
      cy.get("[data-cy=slide-title]").should("have.text", "My Goal");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();
      cy.get("[data-cy=slide-title]").should(
        "have.text",
        "Experiences & Identities"
      );
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();
      cy.get("[data-cy=slide-title]").should("have.text", "Select subjects?");
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();
      cy.get("[data-cy=slide-title]").should(
        "have.text",
        "Let's start recording!"
      );
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();
      cy.get("[data-cy=slide-title]").should(
        "have.text",
        "Recording an idle video."
      );
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();
      cy.get("[data-cy=slide-title]").should(
        "have.text",
        "Idle and Initial Recordings"
      );
      cy.get("[data-cy=next-btn]").trigger("mouseover").click();
      cy.get("[data-cy=slide-title]").should("have.text", "Good work!");
      cy.get("[data-cy=next-btn]").should("not.be.visible");
    });

    it("with back button", () => {
      cyMockDefault(cy, {
        mentor: { ...setup0, subjects: subjectData },
        gqlQueries: [
          mockGQL("UpdateMentorDetails", { me: { updateMentorDetails: true } }),
        ],
      });
      cyVisitSetupScreen(cy, SetupScreen.Build_Mentor);
      cy.get("[data-cy=slide-title]").should("have.text", "Good work!");
      cy.get("[data-cy=back-btn]").trigger("mouseover").click();
      cy.get("[data-cy=slide-title]").should(
        "have.text",
        "Idle and Initial Recordings"
      );
      cy.get("[data-cy=back-btn]").trigger("mouseover").click();
      cy.get("[data-cy=slide-title]").should(
        "have.text",
        "Recording an idle video."
      );
      cy.get("[data-cy=back-btn]").trigger("mouseover").click();
      cy.get("[data-cy=slide-title]").should(
        "have.text",
        "Let's start recording!"
      );
      cy.get("[data-cy=back-btn]").trigger("mouseover").click();
      cy.get("[data-cy=slide-title]").should("have.text", "Select subjects?");
      cy.get("[data-cy=back-btn]").trigger("mouseover").click();
      cy.get("[data-cy=slide-title]").should(
        "have.text",
        "Experiences & Identities"
      );
      cy.get("[data-cy=back-btn]").trigger("mouseover").click();
      cy.get("[data-cy=slide-title]").should("have.text", "My Goal");
      cy.get("[data-cy=back-btn]").trigger("mouseover").click();
      cy.get("[data-cy=slide-title]").should(
        "have.text",
        "Pick a mentor type."
      );
      cy.get("[data-cy=back-btn]").trigger("mouseover").click();
      cy.get("[data-cy=slide-title]").should(
        "have.text",
        "Tell us a little about yourself."
      );
      cy.get("[data-cy=back-btn]").trigger("mouseover").click();
      cy.get("[data-cy=slide-title]").should(
        "have.text",
        "Welcome to MentorStudio!"
      );
    });

    it("with radio buttons", () => {
      cyMockDefault(cy, {
        mentor: { ...setup0, subjects: subjectData },
        gqlQueries: [
          mockGQL("UpdateMentorDetails", { me: { updateMentorDetails: true } }),
        ],
      });
      cy.visit("/setup");
      cy.contains("Welcome to MentorStudio!");
      cy.get("[data-cy=radio]")
        .eq(SetupScreen.Tell_Us_About_Yourself)
        .trigger("mouseover")
        .click();
      cy.contains("Tell us a little about yourself.");
      cy.get("[data-cy=radio]")
        .eq(SetupScreen.Pick_Mentor_Type)
        .trigger("mouseover")
        .click();
      cy.contains("Pick a mentor type.");
      cy.get("[data-cy=radio]")
        .eq(SetupScreen.My_Goal)
        .trigger("mouseover")
        .click();
      cy.contains("My Goal");
      cy.get("[data-cy=radio]")
        .eq(SetupScreen.Experiences_Identities)
        .trigger("mouseover")
        .click();
      cy.contains("Experiences & Identities");
      cy.get("[data-cy=radio]")
        .eq(SetupScreen.Select_Subjects)
        .trigger("mouseover")
        .click();
      cy.contains("Select subjects?");
      cy.get("[data-cy=radio]")
        .eq(SetupScreen.Start_Recordin)
        .trigger("mouseover")
        .click();
      cy.contains("Let's start recording!");
      cy.get("[data-cy=radio]")
        .eq(SetupScreen.Idle_Video_Tips)
        .trigger("mouseover")
        .click();
      cy.contains("Recording an idle video.");
      cy.get("[data-cy=radio]")
        .eq(SetupScreen.Idle_And_Initial_Recordings)
        .trigger("mouseover")
        .click();
      cy.contains("Idle and Initial Recordings");
      cy.get("[data-cy=radio]")
        .eq(SetupScreen.Build_Mentor)
        .trigger("mouseover")
        .click();
      cy.contains("Good work!");
      cy.get("[data-cy=radio]")
        .eq(SetupScreen.Welcome)
        .trigger("mouseover")
        .click();
      cy.contains("Welcome to MentorStudio!");
    });

    it("with query param i", () => {
      cyMockDefault(cy, { mentor: { ...setup0, subjects: subjectData } });
      cyVisitSetupScreen(cy, SetupScreen.Welcome);
      cy.get("[data-cy=slide]").contains("Welcome to MentorStudio!");
      cyVisitSetupScreen(cy, SetupScreen.Tell_Us_About_Yourself);
      cy.get("[data-cy=slide]").contains("Tell us a little about yourself.");
      cyVisitSetupScreen(cy, SetupScreen.Pick_Mentor_Type);
      cy.get("[data-cy=slide]").contains("Pick a mentor type.");
      cyVisitSetupScreen(cy, SetupScreen.My_Goal);
      cy.contains("My Goal");
      cyVisitSetupScreen(cy, SetupScreen.Experiences_Identities);
      cy.contains("Experiences & Identities");
      cyVisitSetupScreen(cy, SetupScreen.Select_Subjects);
      cy.get("[data-cy=slide]").contains("Select subjects?");
      cyVisitSetupScreen(cy, SetupScreen.Start_Recordin);
      cy.get("[data-cy=slide]").contains("Let's start recording!");
      cyVisitSetupScreen(cy, SetupScreen.Idle_Video_Tips);
      cy.get("[data-cy=slide]").contains("Recording an idle video.");
      cyVisitSetupScreen(cy, SetupScreen.Idle_And_Initial_Recordings);
      cy.get("[data-cy=slide]").contains("Idle and Initial Recordings");
      cyVisitSetupScreen(cy, SetupScreen.Build_Mentor);
      cy.get("[data-cy=slide]").contains("Good work!");
    });
  });

  it("title default text if does not exist", () => {
    cyMockDefault(cy, {
      ...baseMock,
      mentor: { ...setup0, title: "" },
      gqlQueries: [
        mockGQL("UpdateMentorDetails", { me: { updateMentorDetails: true } }),
        mockGQL("Keywords", keywords),
      ],
    });
    cyVisitSetupScreen(cy, SetupScreen.Tell_Us_About_Yourself);
    cy.getSettled("[data-cy=mentor-title]", { retries: 4 }).within(($input) => {
      cy.get("input").should("have.value", "Please enter your profession here");
    });
  });

  it("config provides video for idle video setup", () => {
    cyMockDefault(cy, {
      config: { urlVideoIdleTips: "test.url" },
    });
    cyVisitSetupScreen(cy, SetupScreen.Idle_Video_Tips);
    cy.get("[data-cy=video-player]").within(($within) => {
      cy.get("video").should("exist");
      cy.get("video").should("have.attr", "src").should("include", "test.url");
    });
  });

  it("shows welcome slide", () => {
    cyMockDefault(cy, baseMock);
    cyVisitSetupScreen(cy, SetupScreen.Welcome);
    cy.get("[data-cy=slide]").within(($slide) => {
      cy.contains("Welcome to MentorStudio!");
      cy.contains("It's nice to meet you, Clinton Anderson!");
      cy.contains("Let's get started setting up your new mentor.");
    });
    cy.matchImageSnapshot(snapname("welcome-slide"));
  });

  it("Shows the walkthrough link if receive data from graphql", () => {
    cyMockDefault(cy, {
      ...baseMock,
      config: {
        urlDocSetup:
          "https://docs.google.com/document/d/1fATgURjlHda7WZaUCv4qYeouep8JoQrKcJtrTzBXGJs/edit?usp=sharing",
      },
    });

    cyVisitSetupScreen(cy, SetupScreen.Welcome);
    cy.get("[data-cy=slide]").within(($slide) => {
      cy.get("[data-cy=walkthrough-intro]").should("be.visible");
      cy.get("[data-cy=click-here-url]").should("be.visible");
    });
  });

  it("Doesn't show walkthrough link if no data from graphql", () => {
    cyMockDefault(cy, {
      ...baseMock,
    });

    cyVisitSetupScreen(cy, SetupScreen.Welcome);
    cy.get("[data-cy=slide]").within(($slide) => {
      cy.get("[data-cy=walkthrough-intro]").should("not.be.visible");
      cy.get("[data-cy=click-here-url]").should("not.be.visible");
    });
  });

  it("Shows mentor slide", () => {
    cyMockDefault(cy, {
      ...baseMock,
      mentor: [
        { ...setup0, name: "", title: "" },
        setup1,
        setup2,
        setup3,
        { ...setup3, email: "clint@anderson.com" },
      ],
      gqlQueries: [
        mockGQL("UpdateMentorDetails", { me: { updateMentorDetails: true } }),
      ],
    });
    cyVisitSetupScreen(cy, SetupScreen.Tell_Us_About_Yourself);
    // empty mentor slide
    cy.contains("Tell us a little about yourself.");
    cy.getSettled("[data-cy=first-name]", { retries: 4 }).within(($input) => {
      cy.get("input").should("have.value", "Clinton");
    });
    cy.getSettled("[data-cy=name]", { retries: 4 }).within(($input) => {
      cy.get("input").should("have.value", "Clinton Anderson");
    });
    cy.getSettled("[data-cy=mentor-title]", { retries: 4 }).within(($input) => {
      cy.get("input").should("have.value", "Please enter your profession here");
    });
    cy.getSettled("[data-cy=email]", { retries: 4 }).within(($input) => {
      cy.get("input").should("have.value", "");
    });
    // fill out first name and save
    cy.getSettled("[data-cy=first-name]", { retries: 4 }).within(($input) => {
      cy.get("input").clear().type("Clint");
    });
    cy.get("[data-cy=first-name]").within(($input) => {
      cy.get("input").should("have.value", "Clint");
    });
    cy.get("[data-cy=next-btn]")
      .get("[data-cy=nav-btn-avatar]")
      .should("have.css", "backgroundColor", "rgb(255, 0, 0)");
    cy.get("[data-cy=name]").within(($input) => {
      cy.get("input").should("have.value", "Clinton Anderson");
    });
    cy.get("[data-cy=mentor-title]").within(($input) => {
      cy.get("input").should("have.value", "Please enter your profession here");
    });
    cy.get("[data-cy=email]").within(($input) => {
      cy.get("input").should("have.value", "");
    });
    cy.get("[data-cy=next-btn]").trigger("mouseover").click();
    cy.contains("Pick a mentor type.");
    cy.get("[data-cy=back-btn]").trigger("mouseover").click();
    cy.contains("Tell us a little about yourself.");
    cy.matchImageSnapshot(snapname("mentor-slide-1"));
    // fill out full name and save
    cy.getSettled("[data-cy=name]", { retries: 4 })
      .clear()
      .type("Clinton Anderson");
    cy.get("[data-cy=first-name]").within(($input) => {
      cy.get("input").should("have.value", "Clint");
    });
    cy.get("[data-cy=name]").within(($input) => {
      cy.get("input").should("have.value", "Clinton Anderson");
    });
    cy.get("[data-cy=mentor-title]").within(($input) => {
      cy.get("input").should("have.value", "Please enter your profession here");
    });
    cy.get("[data-cy=email]").within(($input) => {
      cy.get("input").should("have.value", "");
    });
    cy.get("[data-cy=next-btn]").trigger("mouseover").click();
    cy.contains("Pick a mentor type.");
    cy.get("[data-cy=back-btn]").trigger("mouseover").click();
    cy.contains("Tell us a little about yourself.");
    cy.get("[data-cy=next-btn]")
      .get("[data-cy=nav-btn-avatar]")
      .should("have.css", "backgroundColor", "rgb(0, 128, 0)");
    cy.matchImageSnapshot(snapname("mentor-slide-2"));
    // fill out title and save
    cy.getSettled("[data-cy=mentor-title]", { retries: 4 })
      .clear()
      .type("Nuclear Electrician's Mate");
    cy.get("[data-cy=first-name]").within(($input) => {
      cy.get("input").should("have.value", "Clint");
    });
    cy.get("[data-cy=name]").within(($input) => {
      cy.get("input").should("have.value", "Clinton Anderson");
    });
    cy.get("[data-cy=mentor-title]").within(($input) => {
      cy.get("input").should("have.value", "Nuclear Electrician's Mate");
    });
    cy.get("[data-cy=email]").within(($input) => {
      cy.get("input").should("have.value", "");
    });
    cy.get("[data-cy=next-btn]").trigger("mouseover").click();
    cy.contains("Pick a mentor type.");
    cy.get("[data-cy=back-btn]").trigger("mouseover").click();
    cy.contains("Tell us a little about yourself.");
    cy.matchImageSnapshot(snapname("mentor-slide-3"));
    cy.get("[data-cy=next-btn]")
      .get("[data-cy=nav-btn-avatar]")
      .should("have.css", "backgroundColor", "rgb(0, 128, 0)");
    // fill out email and save
    cy.getSettled("[data-cy=email]", { retries: 4 }).type("clint@anderson.com");
    cy.get("[data-cy=first-name]").within(($input) => {
      cy.get("input").should("have.value", "Clint");
    });
    cy.get("[data-cy=name]").within(($input) => {
      cy.get("input").should("have.value", "Clinton Anderson");
    });
    cy.get("[data-cy=mentor-title]").within(($input) => {
      cy.get("input").should("have.value", "Nuclear Electrician's Mate");
    });
    cy.get("[data-cy=email]").within(($input) => {
      cy.get("input").should("have.value", "clint@anderson.com");
    });
    cy.get("[data-cy=next-btn]").trigger("mouseover").click();
    cy.contains("Pick a mentor type.");
    cy.get("[data-cy=back-btn]").trigger("mouseover").click();
    cy.contains("Tell us a little about yourself.");
    cy.get("[data-cy=next-btn]")
      .get("[data-cy=nav-btn-avatar]")
      .should("have.css", "backgroundColor", "rgb(0, 128, 0)");
    cy.matchImageSnapshot(snapname("mentor-slide-4"));
  });

  it("Shows mentor chat type", () => {
    cyMockDefault(cy, {
      ...baseMock,
      mentor: { ...setup0, mentorType: null, subjects: subjectData },
      gqlQueries: [
        mockGQL("UpdateMentorDetails", { me: { updateMentorDetails: true } }),
      ],
    });
    cyVisitSetupScreen(cy, SetupScreen.Pick_Mentor_Type);
    cy.contains("Pick a mentor type");
    // select chat type
    cy.get("[data-cy=slide]").within(($slide) => {
      cy.getSettled("[data-cy=select-chat-type]", { retries: 4 })
        .trigger("mouseover")
        .click();
    });
    cy.get("[data-cy=video]").should("exist");
    cy.get("[data-cy=chat]").trigger("mouseover").click();
    cy.get("[data-cy=slide]").within(($slide) => {
      cy.contains("Make a text-only mentor that responds with chat bubbles");
    });
    // save changes
    cy.matchImageSnapshot(snapname("type-slide-1"));
    cy.get("[data-cy=next-btn]").trigger("mouseover").click();
    cy.contains("My Goal");
    cy.get("[data-cy=back-btn]").trigger("mouseover").click();
    cy.contains("Pick a mentor type");
    cy.matchImageSnapshot(snapname("type-slide-2"));
    cy.get("[data-cy=radio]").should("have.length", 9);
    // select video type
    cy.get("[data-cy=slide]").within(($slide) => {
      cy.getSettled("[data-cy=select-chat-type]", { retries: 4 })
        .trigger("mouseover")
        .click();
    });
    cy.get("[data-cy=chat]").should("exist");
    cy.get("[data-cy=video]").trigger("mouseover").click();
    cy.get("[data-cy=slide]").within(($slide) => {
      cy.contains(
        "Make a video mentor that responds with pre-recorded video answers."
      );
    });
    // save changes
    cy.matchImageSnapshot(snapname("type-slide-3"));
    cy.get("[data-cy=next-btn]").trigger("mouseover").click();
    cy.contains("My Goal");
    cy.get("[data-cy=next-btn]")
      .get("[data-cy=nav-btn-avatar]")
      .should("have.css", "backgroundColor", "rgb(255, 0, 0)");
    cy.get("[data-cy=back-btn]").trigger("mouseover").click();
    cy.contains("Pick a mentor type");
    cy.get("[data-cy=next-btn]")
      .get("[data-cy=nav-btn-avatar]")
      .should("have.css", "backgroundColor", "rgb(0, 128, 0)");
    cy.get("[data-cy=radio]").should("have.length", 10);
    cy.matchImageSnapshot(snapname("type-slide-4"));
  });

  it("Shows select keywords slide", () => {
    cyMockDefault(cy, {
      ...baseMock,
      mentor: [
        setup0,
        {
          ...setup0,
          keywords: [{ _id: "", name: "Actors", type: "Occupation" }],
        },
      ],
      gqlQueries: [
        mockGQL("UpdateMentorDetails", { me: { updateMentorDetails: true } }),
        mockGQL("UpdateMentorKeywords", { me: { updateMentorKeywords: true } }),
        mockGQL("Keywords", keywords),
      ],
    });
    cyVisitSetupScreen(cy, SetupScreen.Experiences_Identities);
    cy.get("[data-cy=slide]").within(($slide) => {
      cy.contains("Experiences & Identities");
      cy.contains(
        "Please select or add keywords that represent your experiences."
      );
      cy.get("[data-cy=keyword-type-Gender]").within(($kt) => {
        cy.get("[data-cy=keyword-name-Man]").should(
          "have.attr",
          "data-test",
          "false"
        );
        cy.get("[data-cy=keyword-name-Woman]").should(
          "have.attr",
          "data-test",
          "false"
        );
        cy.get("[data-cy=keyword-name-Nonbinary]").should(
          "have.attr",
          "data-test",
          "false"
        );
        cy.get("[data-cy=keyword-name-Transgender]").should(
          "have.attr",
          "data-test",
          "false"
        );
      });
      cy.get("[data-cy=keyword-type-Ethnicity]").within(($kt) => {
        cy.get("[data-cy=keyword-name-Asian]").should(
          "have.attr",
          "data-test",
          "false"
        );
        cy.get("[data-cy=keyword-name-White]").should(
          "have.attr",
          "data-test",
          "false"
        );
        cy.get("[data-cy=keyword-name-Black]").should(
          "have.attr",
          "data-test",
          "false"
        );
        cy.get("[data-cy=keyword-name-Latinx]").should(
          "have.attr",
          "data-test",
          "false"
        );
      });
      cy.get("[data-cy=keyword-type-Education]").within(($kt) => {
        cy.get("[data-cy=keyword-name-Associate]").should(
          "have.attr",
          "data-test",
          "false"
        );
        cy.get("[data-cy=keyword-name-Bachelors]").should(
          "have.attr",
          "data-test",
          "false"
        );
        cy.get("[data-cy=keyword-name-Masters]").should(
          "have.attr",
          "data-test",
          "false"
        );
        cy.get("[data-cy=keyword-name-Doctorate]").should(
          "have.attr",
          "data-test",
          "false"
        );
      });
      cy.get("[data-cy=keyword-type-Occupation]").within(($kt) => {
        cy.get("[data-cy=Occupation-input]");
      });
    });
    cy.get("[data-cy=keyword-Asian]").should("not.exist");
    cy.get("[data-cy=keyword-Woman]").should("not.exist");
    cy.get("[data-cy=keyword-Masters]").should("not.exist");
    cy.get("[data-cy=keyword-Actors]").should("not.exist");
    // select a keyword from topics
    cy.get("[data-cy=keyword-name-Asian]").click({ force: true });
    cy.get("[data-cy=keyword-name-Woman]").click({ force: true });
    // select a keyword from input
    cy.get("[data-cy=keyword-input]").click();
    cy.get("[data-cy=keyword-option-Masters]").click();
    // select a keyword from occupation input
    cy.get("[data-cy=Occupation-input]").click();
    cy.get("[data-cy=Occupation-option-Actors]").click();
    // check that keywords are selected
    cy.get("[data-cy=keyword-Asian]").should("exist");
    cy.get("[data-cy=keyword-Woman]").should("exist");
    cy.get("[data-cy=keyword-Masters]").should("exist");
    cy.get("[data-cy=keyword-Actors]").should("exist");
    cy.get("[data-cy=keyword-name-Asian]").should(
      "have.attr",
      "data-test",
      "true"
    );
    cy.get("[data-cy=keyword-name-Woman]").should(
      "have.attr",
      "data-test",
      "true"
    );
    cy.get("[data-cy=keyword-name-Masters]").should(
      "have.attr",
      "data-test",
      "true"
    );
    // deselect keyword from topics
    cy.get("[data-cy=keyword-name-Asian]").click({ force: true });
    cy.get("[data-cy=keyword-Asian]").should("not.exist");
    cy.get("[data-cy=keyword-name-Asian]").should(
      "have.attr",
      "data-test",
      "false"
    );
    // deselect keyword from input
    cy.get("[data-cy=keyword-input]").click();
    cy.get("[data-cy=keyword-option-Woman]").click();
    cy.get("[data-cy=keyword-Woman]").should("not.exist");
    cy.get("[data-cy=keyword-name-Woman]").should(
      "have.attr",
      "data-test",
      "false"
    );
    // deselect keyword from button
    cy.get("[data-cy=keyword-Masters]")
      .get(".MuiChip-deleteIcon")
      .eq(0)
      .click();
    cy.get("[data-cy=keyword-Masters]").should("not.exist");
    cy.get("[data-cy=keyword-name-Masters]").should(
      "have.attr",
      "data-test",
      "false"
    );
    // save
    cy.get("[data-cy=next-btn]").trigger("mouseover").click();
    cy.get("[data-cy=back-btn]").trigger("mouseover").click();
    cy.get("[data-cy=keyword-Actors]").should("exist");
  });

  it("shows select subjects slide", () => {
    cyMockDefault(cy, {
      ...baseMock,
      mentor: [
        setup3,
        setup3,
        {
          ...setup3,
          defaultSubject: {
            _id: "background",
            name: "Background",
            type: SubjectTypes.SUBJECT,
            description: "Background",
            isRequired: true,
            categories: [],
            topics: [],
            questions: [],
          },
          subjects: [
            ...setup3.subjects,
            {
              _id: "leadership",
              name: "Leadership",
              type: SubjectTypes.SUBJECT,
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
      gqlQueries: [
        mockGQL("UpdateMentorSubjects", { me: { updateMentorSubjects: true } }),
      ],
    });
    cyVisitSetupScreen(cy, SetupScreen.Select_Subjects);
    cy.get("[data-cy=slide]").within(($slide) => {
      cy.contains("Select subjects");
      cy.contains(
        "These are question sets related to a particular field or topic."
      );
      cy.contains("Pick the ones you feel qualified to mentor in!");
      cy.contains(
        "After recording a subject, you'll be placed in a panel with other mentors in your field."
      );
    });
    cy.contains("Pick the ones you feel qualified to mentor in!");
    cy.get("[data-cy=next-btn]")
      .get("[data-cy=nav-btn-avatar]")
      .should("have.css", "backgroundColor", "rgb(0, 128, 0)");
    // go to subjects page
    cy.get("[data-cy=slide]").within(($slide) => {
      cy.getSettled("[data-cy=button]", { retries: 4 })
        .trigger("mouseover")
        .click();
    });
    cy.location("pathname").then(($el) =>
      assert($el.replace("/admin", ""), "/subjects")
    );
    cy.location("search").should("contain", "?back=%2Fsetup%3Fi%3D5");
    cy.get("[data-cy=subjects]").children().should("have.length", 2);
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
      cy.get("[data-cy=subject-1]").within(($subject) => {
        cy.get('[data-cy=select] [type="checkbox"]')
          .check()
          .should("be.checked");
        cy.get('[data-cy=default] [type="checkbox"]').should("not.be.checked");
      });
    });
    cy.get("[data-cy=dropdown-button-list]")
      .should("not.be.disabled")
      .and("have.text", "Save")
      .trigger("mouseover")
      .click();
    cy.get("[data-cy=nav-bar]").within(($navbar) => {
      cy.get("[data-cy=back-button]").trigger("mouseover").click();
    });
    cy.location("pathname").then(($el) =>
      assert($el.replace("/admin", ""), "/setup")
    );
    cy.location("search").should("contain", "?i=5");
  });

  it("shows introduction slide", () => {
    cyMockDefault(cy, {
      ...baseMock,
      mentor: [setup3],
    });
    cyVisitSetupScreen(cy, SetupScreen.Start_Recordin);
    cy.get("[data-cy=slide]").within(($slide) => {
      cy.contains("Let's start recording");
      cy.contains("You'll be asked to answer some generic questions.");
      cy.contains("Once you're done, you can build and preview your mentor.");
    });
    cy.get("[data-cy=next-btn]")
      .get("[data-cy=nav-btn-avatar]")
      .should("have.css", "backgroundColor", "rgb(0, 128, 0)");
  });

  it("chat mentor does not show idle slide", () => {
    cyMockDefault(cy, {
      ...baseMock,
      mentor: { ...setup0, mentorType: MentorType.CHAT },
    });
    cyVisitSetupScreen(cy, SetupScreen.Idle_Video_Tips);
    cy.get("[data-cy=slide]").within(($slide) => {
      cy.contains("Idle and Initial Recordings");
    });
  });

  it("shows required subject, idle and initial recordings, questions slide", () => {
    cyMockDefault(cy, {
      ...baseMock,
      mentor: [
        { ...setup6, subjects: subjectData },
        { ...setup8, subjects: subjectData },
      ],
      subject: repeatAfterMe,
      gqlQueries: [
        mockGQL("FetchUploadTasks", [
          {
            me: {
              uploadTasks: [],
            },
          },
        ]),
      ],
    });
    cyVisitSetupScreen(cy, SetupScreen.Idle_And_Initial_Recordings - 1);
    cy.contains("Recording an idle video");
    cy.get("[data-cy=next-btn]").trigger("mouseover").click();
    cy.contains("Idle and Initial Recordings");
    cy.contains("These are miscellaneous phrases you'll be asked to repeat.");
    cy.get("[data-cy=next-btn]")
      .get("[data-cy=nav-btn-avatar]")
      .should("have.css", "backgroundColor", "rgb(255, 0, 0)");
    cy.contains("1 / 3");
    cy.getSettled("[data-cy=record-btn]", { retries: 4 })
      .trigger("mouseover")
      .click();
    // go to record
    cy.location("pathname").then(($el) =>
      assert($el.replace("/admin", ""), "/record")
    );
    cy.location("search").should(
      "contain",
      "?subject=idle_and_initial_recordings&back=%2Fsetup%3Fi%3D8"
    );
    cy.get("[data-cy=progress]").contains("Questions 1 / 3");
    cy.get("[data-cy=question-input]").within(($input) => {
      cy.get("textarea").should(
        "have.text",
        "Please look at the camera for 30 seconds without speaking. Try to remain in the same position."
      );
      cy.get("textarea").should("have.attr", "disabled");
    });
    cy.get(".editor-class").should("not.exist");
    cy.get("[data-cy=status]").contains("Active");
    cy.get("[data-cy=next-btn]").trigger("mouseover").click();
    cy.get("[data-cy=progress]").contains("Questions 2 / 3");
    cy.get("[data-cy=question-input]").within(($input) => {
      cy.get("textarea").should(
        "have.text",
        "Please give a short introduction of yourself, which includes your name, current job, and title."
      );
      cy.get("textarea").should("have.attr", "disabled");
    });
    cy.get(".editor-class").within(($input) => {
      cy.get("[data-text]").should("have.text", "");
      cy.get("[data-text]").should("not.have.attr", "disabled");
    });
    cy.get("[data-cy=status]").contains("Skip");
    // back to setup
    cy.get("[data-cy=nav-bar]").within(($navbar) => {
      cy.get("[data-cy=back-button]").trigger("mouseover").click();
    });
    cy.location("pathname").then(($el) =>
      assert($el.replace("/admin", ""), "/setup")
    );
    cy.location("search").should("contain", "?i=8");
    cy.get("[data-cy=slide]").contains("3 / 3");
    cy.contains("Idle and Initial Recordings");
    cy.get("[data-cy=next-btn]")
      .get("[data-cy=nav-btn-avatar]")
      .should("have.css", "backgroundColor", "rgb(0, 128, 0)");
  });

  describe("shows setup complete slide after completing setup", () => {
    it("cannot go to my mentor if mentor info incomplete", () => {
      cyMockDefault(cy, { mentor: { ...setup0, subjects: subjectData } });
      cyVisitSetupScreen(cy, SetupScreen.Build_Mentor);
      cy.get("[data-cy=slide-title]").should("have.text", "Good work!");
      cy.get("[data-cy=go-to-my-mentor-button]").should("exist");
    });

    it("go to my mentor page button visible if setup complete", () => {
      cyMockDefault(cy, { mentor: { ...setup7, subjects: subjectData } });
      cyVisitSetupScreen(cy, SetupScreen.Build_Mentor);
      cy.get("[data-cy=slide-title]").should("have.text", "Good work!");
      cy.get("[data-cy=go-to-my-mentor-button]").should("exist");
    });
  });

  describe("virtual background setup", () => {
    it("video mentor has option to choose virtual backgrounds", () => {
      cyMockDefault(cy, {
        mentor: { ...setup7, mentorType: MentorType.VIDEO },
      });
      cyVisitSetupScreen(cy, SetupScreen.Pick_Mentor_Type);
      cy.get("[data-cy=virtual-background-checkbox]").should("exist");
    });

    it("chat mentor does not have option to choose virtual backgrounds", () => {
      cyMockDefault(cy, { mentor: { ...setup7, mentorType: MentorType.CHAT } });
      cyVisitSetupScreen(cy, SetupScreen.Pick_Mentor_Type);
      cy.get("[data-cy=virtual-background-checkbox]").should("not.exist");
    });

    it("vbg disabled, shouldn't see any vbg components", () => {
      cyMockDefault(cy, { mentor: { ...setup7, mentorType: MentorType.CHAT } });
      cyVisitSetupScreen(cy, SetupScreen.Pick_Mentor_Type);
      cy.get("[data-cy=virtual-background-config]").should("not.exist");
    });

    it("vbg enabled, displays default vbg and option to change or upload", () => {
      cyMockDefault(cy, {
        mentor: { ...setup7, mentorType: MentorType.VIDEO },
      });
      cyVisitSetupScreen(cy, SetupScreen.Pick_Mentor_Type);
      cy.getSettled("[data-cy=virtual-background-checkbox]", {
        retries: 4,
      }).check();
      cy.get("[data-cy=upload-file]").should("be.visible");
      cy.get("[data-cy=open-change-background-dialog]").should("be.visible");
      cy.get("[data-cy=current-vbg-img]").should("be.visible");
    });
  });
});
