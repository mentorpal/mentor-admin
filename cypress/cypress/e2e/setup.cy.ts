/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { cyMockDefault, mockGQL } from "../support/functions";
import { setup0, setup3, setup6, setup7, setup8 } from "../fixtures/mentor";
import { keywords } from "../fixtures/keywords";
import repeatAfterMe from "../fixtures/subjects/repeat_after_me";
import allSubjects from "../fixtures/subjects/all-subjects";
import {
  MentorType,
  SubjectTypes,
  QuestionType,
  UtteranceName,
  UserRole,
  SetupScreen,
  Mentor,
  Status,
  Subject,
  UseDefaultTopics,
} from "../support/types";
import { login as loginDefault } from "../fixtures/login";
import {
  completeMentor,
  taskListBuild,
  uploadTaskMediaBuild,
} from "../support/helpers";
import {
  mentorConfig,
  videoMentor,
  videoMentorWithConfig,
} from "../fixtures/recording/video_mentors";
// import { videoMentorWithConfig } from "./followups.cy";

const baseMock = {
  mentor: setup0,
};

const subjectData: Subject[] = [
  {
    _id: "idle_and_initial_recordings",
    name: "Idle and Initial Recordings",
    type: SubjectTypes.UTTERANCES,
    isRequired: true,
    isArchived: false,
    description: "These are miscellaneous phrases you'll be asked to repeat.",
    categories: [
      {
        id: "category2",
        name: "Category2",
        description: "Another category",
        defaultTopics: [],
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
        useDefaultTopics: UseDefaultTopics.DEFAULT,
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
        useDefaultTopics: UseDefaultTopics.DEFAULT,
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
          defaultTopics: [],
        },
        useDefaultTopics: UseDefaultTopics.DEFAULT,
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
          defaultTopics: [],
        },
        useDefaultTopics: UseDefaultTopics.DEFAULT,
      },
    ],
  },
];

const organizations = {
  organizations: {
    edges: [
      {
        node: {
          _id: "csuf",
          uuid: "csuf",
          name: "CSUF",
          subdomain: "careerfair",
          isPrivate: false,
          members: [
            {
              user: {
                _id: "admin",
                name: "Admin",
              },
              role: UserRole.ADMIN,
            },
            {
              user: {
                _id: "contentmanager",
                name: "Content Manager",
              },
              role: UserRole.CONTENT_MANAGER,
            },
            {
              user: {
                _id: "user",
                name: "User",
              },
              role: UserRole.USER,
            },
          ],
        },
      },
      {
        node: {
          _id: "usc",
          uuid: "usc",
          name: "USC",
          subdomain: "usc",
          isPrivate: false,
          members: [
            {
              user: {
                _id: "admin",
                name: "Admin",
              },
              role: UserRole.ADMIN,
            },
            {
              user: {
                _id: "contentmanager",
                name: "Content Manager",
              },
              role: UserRole.CONTENT_MANAGER,
            },
            {
              user: {
                _id: "user",
                name: "User",
              },
              role: UserRole.USER,
            },
          ],
        },
      },
    ],
  },
};

Cypress.on("uncaught:exception", (err, runnable) => {
  console.error(err);
  return false;
});

function snapname(n) {
  return `screenshots-setup-${n}`;
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
      cy.getSettled(`[data-cy=slide-${SetupScreen.Welcome}]`).should(
        "be.visible"
      );
      cy.getSettled(`[data-cy=slide-${SetupScreen.Welcome}]`).should(
        "contain.text",
        "Welcome to MentorStudio!"
      );

      cy.get("[data-cy=next-btn]").trigger("mouseover").click();
      cy.getSettled(
        `[data-cy=slide-${SetupScreen.Tell_Us_About_Yourself}]`
      ).should("be.visible");
      cy.getSettled(
        `[data-cy=slide-${SetupScreen.Tell_Us_About_Yourself}]`
      ).should("contain.text", "Tell us a little about yourself.");

      cy.get("[data-cy=next-btn]").trigger("mouseover").click();
      cy.getSettled(`[data-cy=slide-${SetupScreen.Pick_Mentor_Type}]`).should(
        "be.visible"
      );
      cy.getSettled(`[data-cy=slide-${SetupScreen.Pick_Mentor_Type}]`).should(
        "contain.text",
        "Pick a mentor type."
      );

      cy.get("[data-cy=next-btn]").trigger("mouseover").click();
      cy.getSettled(`[data-cy=slide-${SetupScreen.Mentor_Privacy}]`).should(
        "be.visible"
      );
      cy.getSettled(`[data-cy=slide-${SetupScreen.Mentor_Privacy}]`).should(
        "contain.text",
        "Set privacy settings."
      );

      cy.get("[data-cy=next-btn]").trigger("mouseover").click();
      cy.getSettled(`[data-cy=slide-${SetupScreen.My_Goal}]`).should(
        "be.visible"
      );
      cy.getSettled(`[data-cy=slide-${SetupScreen.My_Goal}]`).should(
        "contain.text",
        "My Goal"
      );

      cy.get("[data-cy=next-btn]").trigger("mouseover").click();
      cy.getSettled(
        `[data-cy=slide-${SetupScreen.Experiences_Identities}]`
      ).should("be.visible");
      cy.getSettled(
        `[data-cy=slide-${SetupScreen.Experiences_Identities}]`
      ).should("contain.text", "Experiences & Identities");

      cy.get("[data-cy=next-btn]").trigger("mouseover").click();
      cy.getSettled(`[data-cy=slide-${SetupScreen.Select_Subjects}]`).should(
        "be.visible"
      );
      cy.getSettled(`[data-cy=slide-${SetupScreen.Select_Subjects}]`).should(
        "contain.text",
        "Select subjects?"
      );

      cy.get("[data-cy=next-btn]").trigger("mouseover").click();
      cy.getSettled(`[data-cy=slide-${SetupScreen.Start_Recordin}]`).should(
        "be.visible"
      );
      cy.getSettled(`[data-cy=slide-${SetupScreen.Start_Recordin}]`).should(
        "contain.text",
        "Let's start recording!"
      );

      cy.get("[data-cy=next-btn]").trigger("mouseover").click();
      cy.getSettled(`[data-cy=slide-${SetupScreen.Idle_Video_Tips}]`).should(
        "be.visible"
      );
      cy.getSettled(`[data-cy=slide-${SetupScreen.Idle_Video_Tips}]`).should(
        "contain.text",
        "Recording an idle video."
      );

      cy.get("[data-cy=next-btn]").trigger("mouseover").click();
      cy.getSettled(
        `[data-cy=slide-${SetupScreen.Idle_And_Initial_Recordings}]`
      ).should("be.visible");
      cy.getSettled(
        `[data-cy=slide-${SetupScreen.Idle_And_Initial_Recordings}]`
      ).should("contain.text", "Idle and Initial Recordings");

      cy.get("[data-cy=next-btn]").trigger("mouseover").click();
      cy.getSettled(`[data-cy=slide-${SetupScreen.Build_Mentor}]`).should(
        "be.visible"
      );
      cy.getSettled(`[data-cy=slide-${SetupScreen.Build_Mentor}]`).should(
        "contain.text",
        "Good work!"
      );

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
      cy.getSettled(`[data-cy=slide-${SetupScreen.Build_Mentor}]`).should(
        "be.visible"
      );
      cy.getSettled(`[data-cy=slide-${SetupScreen.Build_Mentor}]`).should(
        "contain.text",
        "Good work!"
      );

      cy.get("[data-cy=back-btn]").trigger("mouseover").click();
      cy.getSettled(
        `[data-cy=slide-${SetupScreen.Idle_And_Initial_Recordings}]`
      ).should("be.visible");
      cy.getSettled(
        `[data-cy=slide-${SetupScreen.Idle_And_Initial_Recordings}]`
      ).should("contain.text", "Idle and Initial Recordings");

      cy.get("[data-cy=back-btn]").trigger("mouseover").click();
      cy.getSettled(`[data-cy=slide-${SetupScreen.Idle_Video_Tips}]`).should(
        "be.visible"
      );
      cy.getSettled(`[data-cy=slide-${SetupScreen.Idle_Video_Tips}]`).should(
        "contain.text",
        "Recording an idle video."
      );

      cy.get("[data-cy=back-btn]").trigger("mouseover").click();
      cy.getSettled(`[data-cy=slide-${SetupScreen.Start_Recordin}]`).should(
        "be.visible"
      );
      cy.getSettled(`[data-cy=slide-${SetupScreen.Start_Recordin}]`).should(
        "contain.text",
        "Let's start recording!"
      );

      cy.get("[data-cy=back-btn]").trigger("mouseover").click();
      cy.getSettled(`[data-cy=slide-${SetupScreen.Select_Subjects}]`).should(
        "be.visible"
      );
      cy.getSettled(`[data-cy=slide-${SetupScreen.Select_Subjects}]`).should(
        "contain.text",
        "Select subjects?"
      );

      cy.get("[data-cy=back-btn]").trigger("mouseover").click();
      cy.getSettled(
        `[data-cy=slide-${SetupScreen.Experiences_Identities}]`
      ).should("be.visible");
      cy.getSettled(
        `[data-cy=slide-${SetupScreen.Experiences_Identities}]`
      ).should("contain.text", "Experiences & Identities");

      cy.get("[data-cy=back-btn]").trigger("mouseover").click();
      cy.getSettled(`[data-cy=slide-${SetupScreen.My_Goal}]`).should(
        "be.visible"
      );
      cy.getSettled(`[data-cy=slide-${SetupScreen.My_Goal}]`).should(
        "contain.text",
        "My Goal"
      );

      cy.get("[data-cy=back-btn]").trigger("mouseover").click();
      cy.getSettled(`[data-cy=slide-${SetupScreen.Mentor_Privacy}]`).should(
        "be.visible"
      );
      cy.getSettled(`[data-cy=slide-${SetupScreen.Mentor_Privacy}]`).should(
        "contain.text",
        "Set privacy settings."
      );

      cy.get("[data-cy=back-btn]").trigger("mouseover").click();
      cy.getSettled(`[data-cy=slide-${SetupScreen.Pick_Mentor_Type}]`).should(
        "be.visible"
      );
      cy.getSettled(`[data-cy=slide-${SetupScreen.Pick_Mentor_Type}]`).should(
        "contain.text",
        "Pick a mentor type."
      );

      cy.get("[data-cy=back-btn]").trigger("mouseover").click();
      cy.getSettled(
        `[data-cy=slide-${SetupScreen.Tell_Us_About_Yourself}]`
      ).should("be.visible");
      cy.getSettled(
        `[data-cy=slide-${SetupScreen.Tell_Us_About_Yourself}]`
      ).should("contain.text", "Tell us a little about yourself.");

      cy.get("[data-cy=back-btn]").trigger("mouseover").click();
      cy.getSettled(`[data-cy=slide-${SetupScreen.Welcome}]`).should(
        "be.visible"
      );
      cy.getSettled(`[data-cy=slide-${SetupScreen.Welcome}]`).should(
        "contain.text",
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
      cy.getSettled(
        `[data-cy=slide-${SetupScreen.Tell_Us_About_Yourself}]`
      ).should("be.visible");

      cy.get("[data-cy=radio]")
        .eq(SetupScreen.Pick_Mentor_Type)
        .trigger("mouseover")
        .click();
      cy.getSettled(`[data-cy=slide-${SetupScreen.Pick_Mentor_Type}]`).should(
        "be.visible"
      );

      cy.get("[data-cy=radio]")
        .eq(SetupScreen.Mentor_Privacy)
        .trigger("mouseover")
        .click();
      cy.getSettled(`[data-cy=slide-${SetupScreen.Mentor_Privacy}]`).should(
        "be.visible"
      );

      cy.get("[data-cy=radio]")
        .eq(SetupScreen.My_Goal)
        .trigger("mouseover")
        .click();
      cy.getSettled(`[data-cy=slide-${SetupScreen.My_Goal}]`).should(
        "be.visible"
      );

      cy.get("[data-cy=radio]")
        .eq(SetupScreen.Experiences_Identities)
        .trigger("mouseover")
        .click();
      cy.getSettled(
        `[data-cy=slide-${SetupScreen.Experiences_Identities}]`
      ).should("be.visible");

      cy.get("[data-cy=radio]")
        .eq(SetupScreen.Select_Subjects)
        .trigger("mouseover")
        .click();
      cy.getSettled(`[data-cy=slide-${SetupScreen.Select_Subjects}]`).should(
        "be.visible"
      );

      cy.get("[data-cy=radio]")
        .eq(SetupScreen.Start_Recordin)
        .trigger("mouseover")
        .click();
      cy.getSettled(`[data-cy=slide-${SetupScreen.Start_Recordin}]`).should(
        "be.visible"
      );

      cy.get("[data-cy=radio]")
        .eq(SetupScreen.Idle_Video_Tips)
        .trigger("mouseover")
        .click();
      cy.getSettled(`[data-cy=slide-${SetupScreen.Idle_Video_Tips}]`).should(
        "be.visible"
      );

      cy.get("[data-cy=radio]")
        .eq(SetupScreen.Idle_And_Initial_Recordings)
        .trigger("mouseover")
        .click();
      cy.getSettled(
        `[data-cy=slide-${SetupScreen.Idle_And_Initial_Recordings}]`
      ).should("be.visible");

      cy.get("[data-cy=radio]")
        .eq(SetupScreen.Build_Mentor)
        .trigger("mouseover")
        .click();
      cy.getSettled(`[data-cy=slide-${SetupScreen.Build_Mentor}]`).should(
        "be.visible"
      );

      cy.get("[data-cy=radio]")
        .eq(SetupScreen.Welcome)
        .trigger("mouseover")
        .click();
      cy.getSettled(`[data-cy=slide-${SetupScreen.Welcome}]`).should(
        "be.visible"
      );
    });

    it("with query param i", () => {
      cyMockDefault(cy, { mentor: { ...setup0, subjects: subjectData } });
      cyVisitSetupScreen(cy, SetupScreen.Welcome);
      cy.getSettled(`[data-cy=slide-${SetupScreen.Welcome}]`).should(
        "be.visible"
      );
      cy.getSettled(
        `[data-cy=slide-${SetupScreen.Tell_Us_About_Yourself}]`
      ).should("not.be.visible");

      cyVisitSetupScreen(cy, SetupScreen.Tell_Us_About_Yourself);
      cy.getSettled(
        `[data-cy=slide-${SetupScreen.Tell_Us_About_Yourself}]`
      ).should("be.visible");

      cyVisitSetupScreen(cy, SetupScreen.Pick_Mentor_Type);
      cy.getSettled(`[data-cy=slide-${SetupScreen.Pick_Mentor_Type}]`).should(
        "be.visible"
      );

      cyVisitSetupScreen(cy, SetupScreen.Mentor_Privacy);
      cy.getSettled(`[data-cy=slide-${SetupScreen.Mentor_Privacy}]`).should(
        "be.visible"
      );

      cyVisitSetupScreen(cy, SetupScreen.My_Goal);
      cy.getSettled(`[data-cy=slide-${SetupScreen.My_Goal}]`).should(
        "be.visible"
      );

      cyVisitSetupScreen(cy, SetupScreen.Experiences_Identities);
      cy.getSettled(
        `[data-cy=slide-${SetupScreen.Experiences_Identities}]`
      ).should("be.visible");

      cyVisitSetupScreen(cy, SetupScreen.Select_Subjects);
      cy.getSettled(`[data-cy=slide-${SetupScreen.Select_Subjects}]`).should(
        "be.visible"
      );

      cyVisitSetupScreen(cy, SetupScreen.Start_Recordin);
      cy.getSettled(`[data-cy=slide-${SetupScreen.Start_Recordin}]`).should(
        "be.visible"
      );

      cyVisitSetupScreen(cy, SetupScreen.Idle_Video_Tips);
      cy.getSettled(`[data-cy=slide-${SetupScreen.Idle_Video_Tips}]`).should(
        "be.visible"
      );

      cyVisitSetupScreen(cy, SetupScreen.Pick_Mentor_Type);
      cy.getSettled(`[data-cy=slide-${SetupScreen.Pick_Mentor_Type}]`).should(
        "be.visible"
      );

      cyVisitSetupScreen(cy, SetupScreen.Build_Mentor);
      cy.getSettled(`[data-cy=slide-${SetupScreen.Build_Mentor}]`).should(
        "be.visible"
      );
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
    cy.getSettled(`[data-cy=slide-${SetupScreen.Tell_Us_About_Yourself}]`, {
      retries: 4,
    })
      .should("be.visible")
      .within(($input) => {
        cy.get("[data-cy=mentor-title]").within(() => {
          cy.get("input").should(
            "have.value",
            "Please enter your profession here"
          );
        });
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
    cy.getSettled(`[data-cy=slide-${SetupScreen.Welcome}]`)
      .should("be.visible")
      .within(($slide) => {
        cy.contains("Welcome to MentorStudio!");
        cy.contains("It's nice to meet you, Clinton Anderson!");
        cy.contains("Let's get started setting up your new mentor.");
      });
    cy.matchImageSnapshot(snapname("welcome-slide"));
  });

  it("non-public-approved mentors show warning", () => {
    cyMockDefault(cy, {
      ...baseMock,
      mentor: { ...baseMock.mentor, isPublicApproved: false },
    });
    cyVisitSetupScreen(cy, SetupScreen.Mentor_Privacy);
    cy.getSettled(`[data-cy=slide-${SetupScreen.Mentor_Privacy}]`)
      .should("be.visible")
      .within(($slide) => {
        cy.contains("Your mentor is not yet approved to be public.");
      });
  });

  it("public-approved mentors does not show warning", () => {
    cyMockDefault(cy, {
      ...baseMock,
      mentor: { ...baseMock.mentor, isPublicApproved: true },
    });
    cyVisitSetupScreen(cy, SetupScreen.Mentor_Privacy);
    cy.getSettled(`[data-cy=slide-${SetupScreen.Mentor_Privacy}]`)
      .should("be.visible")
      .should("not.contain", "Your mentor is not yet approved to be public.");
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
    cy.getSettled(`[data-cy=slide-${SetupScreen.Welcome}]`)
      .should("be.visible")
      .within(($slide) => {
        cy.get("[data-cy=walkthrough-intro]").should("be.visible");
        cy.get("[data-cy=click-here-url]").should("be.visible");
      });
  });

  it("Doesn't show walkthrough link if no data from graphql", () => {
    cyMockDefault(cy, {
      ...baseMock,
    });

    cyVisitSetupScreen(cy, SetupScreen.Welcome);
    cy.getSettled(`[data-cy=slide-${SetupScreen.Welcome}]`)
      .should("be.visible")
      .within(($slide) => {
        cy.get("[data-cy=walkthrough-intro]").should("not.be.visible");
        cy.get("[data-cy=click-here-url]").should("not.be.visible");
      });
  });

  it.skip("Shows mentor slide", () => {
    cyMockDefault(cy, {
      ...baseMock,
      mentor: [
        { ...setup0, firstName: "", name: "", title: "", email: "" },
        { ...setup0, firstName: "Clint", name: "", title: "", email: "" },
        {
          ...setup0,
          firstName: "Clint",
          name: "Clinton Anderson",
          title: "",
          email: "",
        },
        {
          ...setup0,
          firstName: "Clint",
          name: "Clinton Anderson",
          title: "Nuclear Electrician's Mate",
          email: "",
        },
        {
          ...setup0,
          firstName: "Clint",
          name: "Clinton Anderson",
          title: "Nuclear Electrician's Mate",
          email: "clint@anderson.com",
        },
      ],
      gqlQueries: [
        mockGQL("UpdateMentorDetails", { me: { updateMentorDetails: true } }),
      ],
    });
    cyVisitSetupScreen(cy, SetupScreen.Tell_Us_About_Yourself);
    // empty mentor slide
    cy.getSettled(`[data-cy=slide-${SetupScreen.Tell_Us_About_Yourself}]`)
      .should("be.visible")
      .within(() => {
        cy.contains("Tell us a little about yourself.");
      });
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
    cy.getSettled(`[data-cy=slide-${SetupScreen.Pick_Mentor_Type}]`).should(
      "be.visible"
    );
    cy.get("[data-cy=back-btn]").trigger("mouseover").click();
    cy.getSettled(
      `[data-cy=slide-${SetupScreen.Tell_Us_About_Yourself}]`
    ).should("be.visible");
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
    cy.getSettled(`[data-cy=slide-${SetupScreen.Pick_Mentor_Type}]`).should(
      "be.visible"
    );

    cy.get("[data-cy=back-btn]").trigger("mouseover").click();
    cy.getSettled(
      `[data-cy=slide-${SetupScreen.Tell_Us_About_Yourself}]`
    ).should("be.visible");
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
    cy.getSettled(`[data-cy=slide-${SetupScreen.Pick_Mentor_Type}]`).should(
      "be.visible"
    );
    cy.get("[data-cy=back-btn]").trigger("mouseover").click();
    cy.getSettled(
      `[data-cy=slide-${SetupScreen.Tell_Us_About_Yourself}]`
    ).should("be.visible");
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
    cy.getSettled(`[data-cy=slide-${SetupScreen.Pick_Mentor_Type}]`).should(
      "be.visible"
    );
    cy.get("[data-cy=back-btn]").trigger("mouseover").click();
    cy.getSettled(
      `[data-cy=slide-${SetupScreen.Tell_Us_About_Yourself}]`
    ).should("be.visible");
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
    cy.getSettled(`[data-cy=slide-${SetupScreen.Pick_Mentor_Type}]`).should(
      "be.visible"
    );
    // select chat type
    cy.getSettled(`[data-cy=slide-${SetupScreen.Pick_Mentor_Type}]`)
      .should("be.visible")
      .within(($slide) => {
        cy.getSettled("[data-cy=select-chat-type]", { retries: 4 })
          .trigger("mouseover")
          .click();
      });
    cy.get("[data-cy=video]").should("exist");
    cy.get("[data-cy=chat]").trigger("mouseover").click();
    cy.getSettled(`[data-cy=slide-${SetupScreen.Pick_Mentor_Type}]`).within(
      ($slide) => {
        cy.contains("Make a text-only mentor that responds with chat bubbles");
      }
    );
    // save changes
    cy.matchImageSnapshot(snapname("type-slide-1"));
    cy.get("[data-cy=next-btn]").trigger("mouseover").click();
    cy.getSettled(`[data-cy=slide-${SetupScreen.Mentor_Privacy}]`).should(
      "be.visible"
    );
    cy.get("[data-cy=back-btn]").trigger("mouseover").click();
    cy.getSettled(`[data-cy=slide-${SetupScreen.Pick_Mentor_Type}]`).should(
      "be.visible"
    );
    cy.matchImageSnapshot(snapname("type-slide-2"));
    cy.get("[data-cy=radio]").should("have.length", 10);
    // select video type
    cy.getSettled(`[data-cy=slide-${SetupScreen.Pick_Mentor_Type}]`)
      .should("be.visible")
      .within(($slide) => {
        cy.getSettled("[data-cy=select-chat-type]", { retries: 4 })
          .trigger("mouseover")
          .click();
      });
    cy.get("[data-cy=chat]").should("exist");
    cy.get("[data-cy=video]").trigger("mouseover").click();
    cy.getSettled(`[data-cy=slide-${SetupScreen.Pick_Mentor_Type}]`)
      .should("be.visible")
      .within(($slide) => {
        cy.contains(
          "Make a video mentor that responds with pre-recorded video answers."
        );
      });
    // save changes
    cy.matchImageSnapshot(snapname("type-slide-3"));
    cy.get("[data-cy=next-btn]").trigger("mouseover").click();
    cy.getSettled(`[data-cy=slide-${SetupScreen.Mentor_Privacy}]`).should(
      "be.visible"
    );
    cy.get("[data-cy=next-btn]")
      .get("[data-cy=nav-btn-avatar]")
      .should("have.css", "backgroundColor", "rgb(0, 128, 0)");
    cy.get("[data-cy=back-btn]").trigger("mouseover").click();
    cy.getSettled(`[data-cy=slide-${SetupScreen.Pick_Mentor_Type}]`).should(
      "be.visible"
    );
    cy.get("[data-cy=next-btn]")
      .get("[data-cy=nav-btn-avatar]")
      .should("have.css", "backgroundColor", "rgb(0, 128, 0)");
    cy.get("[data-cy=radio]").should("have.length", 11);
    cy.matchImageSnapshot(snapname("type-slide-4"));
  });

  it("Shows mentor privacy slide", () => {
    cyMockDefault(cy, {
      ...baseMock,
      mentor: { ...setup0, mentorType: null, subjects: subjectData },
      gqlQueries: [
        mockGQL("UpdateMentorDetails", { me: { updateMentorDetails: true } }),
        mockGQL("Organizations", organizations),
      ],
    });
    cyVisitSetupScreen(cy, SetupScreen.Mentor_Privacy);
    cy.getSettled(`[data-cy=slide-${SetupScreen.Mentor_Privacy}]`).should(
      "be.visible"
    );
  });

  it("Shows select keywords slide", () => {
    cyMockDefault(cy, {
      ...baseMock,
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.ADMIN },
      },
      mentor: [
        setup0,
        {
          ...setup0,
          keywords: ["Actors"],
        },
      ],
      gqlQueries: [
        mockGQL("UpdateMentorDetails", { me: { updateMentorDetails: true } }),
        mockGQL("UpdateMentorKeywords", { me: { updateMentorKeywords: true } }),
        mockGQL("Keywords", keywords),
      ],
    });
    cyVisitSetupScreen(cy, SetupScreen.Experiences_Identities);
    cy.getSettled(`[data-cy=slide-${SetupScreen.Experiences_Identities}]`)
      .should("be.visible")
      .within(($slide) => {
        cy.contains("Experiences & Identities");
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
            isArchived: false,
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
              isArchived: false,
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
    cy.getSettled(`[data-cy=slide-${SetupScreen.Select_Subjects}]`)
      .should("be.visible")
      .within(($slide) => {
        cy.contains("Select subjects");
        cy.contains(
          "These are question sets related to a particular field or topic."
        );
        cy.contains("Pick the ones you feel qualified to mentor in!");
        cy.contains(
          "After recording a subject, you'll be placed in a panel with other mentors in your field."
        );
      });
    cy.get("[data-cy=next-btn]")
      .get("[data-cy=nav-btn-avatar]")
      .should("have.css", "backgroundColor", "rgb(0, 128, 0)");
    // go to subjects page
    cy.getSettled(`[data-cy=slide-${SetupScreen.Select_Subjects}]`)
      .should("be.visible")
      .within(($slide) => {
        cy.getSettled("[data-cy=button]", { retries: 4 })
          .trigger("mouseover")
          .click();
      });
    cy.location("pathname").then(($el) =>
      assert($el.replace("/admin", ""), "/subjects")
    );
    cy.location("search").should("contain", "?back=%2Fsetup%3Fi%3D6");
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
    cy.location("search").should("contain", "?i=6");
  });

  it("shows introduction slide", () => {
    cyMockDefault(cy, {
      ...baseMock,
      mentor: [setup3],
    });
    cyVisitSetupScreen(cy, SetupScreen.Start_Recordin);
    cy.getSettled(`[data-cy=slide-${SetupScreen.Start_Recordin}]`)
      .should("be.visible")
      .within(($slide) => {
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
    cy.getSettled(`[data-cy=slide-${SetupScreen.Idle_Video_Tips}]`).within(
      ($slide) => {
        cy.contains("Idle and Initial Recordings");
      }
    );
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
    cy.getSettled(`[data-cy=slide-${SetupScreen.Idle_Video_Tips}]`).should(
      "be.visible"
    );
    cy.get("[data-cy=next-btn]").trigger("mouseover").click();
    cy.getSettled(`[data-cy=slide-${SetupScreen.Idle_And_Initial_Recordings}]`)
      .should("be.visible")
      .should(
        "contain.text",
        "These are miscellaneous phrases you'll be asked to repeat."
      );
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
      "?subject=idle_and_initial_recordings&back=%2Fsetup%3Fi%3D9"
    );
    cy.get("[data-cy=progress]").contains("Questions 1 / 3");
    cy.get("[data-cy=question-text]").contains(
      "Please look at the camera for 30 seconds without speaking. Try to remain in the same position."
    );
    cy.get(".editor-class").should("not.exist");
    cy.get("[data-cy=status]").contains("Active");
    cy.get("[data-cy=next-btn]").trigger("mouseover").click();
    cy.get("[data-cy=progress]").contains("Questions 2 / 3");
    cy.get("[data-cy=question-text]").contains(
      "Please give a short introduction of yourself, which includes your name, current job, and title."
    );
    cy.get(".editor-class").within(($input) => {
      cy.get("[data-text]").should("have.text", "");
      cy.get("[data-text]").should("not.have.attr", "disabled");
    });
    // back to setup
    cy.get("[data-cy=nav-bar]").within(($navbar) => {
      cy.get("[data-cy=back-button]").trigger("mouseover").click();
    });
    cy.location("pathname").then(($el) =>
      assert($el.replace("/admin", ""), "/setup")
    );
    cy.location("search").should("contain", "?i=9");
    cy.getSettled(
      `[data-cy=slide-${SetupScreen.Idle_And_Initial_Recordings}]`
    ).contains("3 / 3");
    cy.getSettled(
      `[data-cy=slide-${SetupScreen.Idle_And_Initial_Recordings}]`
    ).should("be.visible");
    cy.get("[data-cy=next-btn]")
      .get("[data-cy=nav-btn-avatar]")
      .should("have.css", "backgroundColor", "rgb(0, 128, 0)");
  });

  describe("shows setup complete slide after completing setup", () => {
    it("cannot go to my mentor if mentor info incomplete", () => {
      cyMockDefault(cy, { mentor: { ...setup0, subjects: subjectData } });
      cyVisitSetupScreen(cy, SetupScreen.Build_Mentor);
      cy.getSettled(`[data-cy=slide-${SetupScreen.Build_Mentor}]`)
        .should("be.visible")
        .within(() => {
          cy.get("[data-cy=slide-title]").should("have.text", "Good work!");
          cy.get("[data-cy=go-to-my-mentor-button]").should("exist");
        });
    });

    it("go to my mentor page button visible if setup complete", () => {
      cyMockDefault(cy, { mentor: { ...setup7, subjects: subjectData } });
      cyVisitSetupScreen(cy, SetupScreen.Build_Mentor);
      cy.getSettled(`[data-cy=slide-${SetupScreen.Build_Mentor}]`)
        .should("be.visible")
        .within(() => {
          cy.get("[data-cy=slide-title]").should("have.text", "Good work!");
          cy.get("[data-cy=go-to-my-mentor-button]").should("exist");
        });
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

  it("Privacy slide not shown to mentors with locked privacy", () => {
    cyMockDefault(cy, {
      mentor: videoMentorWithConfig,
    });
    cyVisitSetupScreen(cy, SetupScreen.Mentor_Privacy);
    cy.get("[data-cy=slide-title]").should("not.contain.text", "Privacy");
  });

  it("Select Mentor Type slide not shown to mentors with locked mentor type", () => {
    cyMockDefault(cy, {
      mentor: videoMentorWithConfig,
    });
    cyVisitSetupScreen(cy, SetupScreen.Pick_Mentor_Type);
    cy.get("[data-cy=slide-title]").should("not.contain.text", "mentor type");
  });

  it("Select Subjects slide not shown to mentors with locked subjects", () => {
    cyMockDefault(cy, {
      mentor: {
        ...videoMentorWithConfig,
        mentorConfig: {
          ...videoMentorWithConfig.mentorConfig,
          lockedToSubjects: true,
        },
      },
    });
    cyVisitSetupScreen(cy, SetupScreen.Welcome);
    cy.get("[data-cy=setup-page]").should(
      "not.contain.text",
      "Select subjects?"
    );
  });

  it("Select Subjects slide shown to mentors without locked subjects", () => {
    cyMockDefault(cy, {
      mentor: {
        ...videoMentorWithConfig,
        mentorConfig: {
          ...videoMentorWithConfig.mentorConfig,
          lockedToSubjects: false,
        },
      },
    });
    cyVisitSetupScreen(cy, SetupScreen.Welcome);
    cy.get("[data-cy=setup-page]").should("contain.text", "Select subjects?");
  });

  it("Record required subject slide considers answer as complete if upload in progress", () => {
    const videoWithConfigAndUnansweredQ: Mentor = {
      ...completeMentor(videoMentor),
      lockedToConfig: true,
      mentorConfig: mentorConfig,
      name: "helo",
      firstName: "world",
      title: "title",
      answers: [
        ...videoMentorWithConfig.answers.map((a, i) => {
          return i != 0
            ? a
            : {
                ...a,
                transcript: "",
                status: Status.NONE,
              };
        }),
      ],
      subjects: [allSubjects.edges[0].node as Subject],
    };
    cyMockDefault(cy, {
      mentor: [videoWithConfigAndUnansweredQ],
      // questions: videoQuestions,
      gqlQueries: [
        mockGQL("FetchUploadTasks", [
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoWithConfigAndUnansweredQ.answers[0].question._id,
                    question:
                      videoWithConfigAndUnansweredQ.answers[0].question
                        .question,
                  },
                  ...taskListBuild("IN_PROGRESS"),
                  ...uploadTaskMediaBuild(),
                  transcript: "new transcript",
                },
              ],
            },
          },
          {
            me: {
              uploadTasks: [
                {
                  question: {
                    _id: videoWithConfigAndUnansweredQ.answers[0].question._id,
                    question:
                      videoWithConfigAndUnansweredQ.answers[0].question
                        .question,
                  },
                  ...taskListBuild("IN_PROGRESS"),
                  ...uploadTaskMediaBuild(),
                  transcript: "new transcript",
                },
              ],
            },
          },
        ]),
        mockGQL("Subjects", { edges: [allSubjects.edges[0]] }),
      ],
    });
    cy.visit(`/setup?i=6`);
    cy.get("[data-cy=slide-6]").should("contain.text", "2 / 2");
    cy.visit("/");
    cy.get("[data-cy=setup-no]").should("not.exist");
    cy.get("[data-cy=nav-bar]").should("contain.text", "My Mentor");
  });

  it("welcome slide header and body text can be set from mentor config", () => {
    cyMockDefault(cy, {
      mentor: videoMentorWithConfig,
    });
    cyVisitSetupScreen(cy, SetupScreen.Welcome);
    cy.get("[data-cy=slide-title]").should(
      "contain.text",
      "test welcome slide header text"
    );
  });

  it("my goal slide can be disabled from mentor config", () => {
    cyMockDefault(cy, {
      mentor: videoMentorWithConfig,
    });
    cyVisitSetupScreen(cy, SetupScreen.Welcome);
    cy.get("[data-cy=slide-0]").should(
      "contain.text",
      "test welcome slide body text"
    );
  });
});
