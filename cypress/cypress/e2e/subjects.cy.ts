/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import allSubjects from "../fixtures/subjects/all-subjects";
import { mockGQL, cyMockDefault, cySetup } from "../support/functions";
import {
  SubjectTypes,
  MentorType,
  Status,
  QuestionType,
  UserRole,
  Mentor,
} from "../support/types";
import { completeSubjectQuestion } from "../support/helpers";
import { login as loginDefault } from "../fixtures/login";
import { mentorConfig } from "../fixtures/recording/video_mentors";

const mentor: Mentor = {
  _id: "clintanderson",
  name: "Clint Anderson",
  firstName: "Clint",
  title: "Nuclear Electrian's Mate",
  email: "clint@anderson.com",
  thumbnail: "",
  mentorType: MentorType.VIDEO,
  lastTrainedAt: "",
  isDirty: false,
  subjects: [
    {
      _id: "background",
      name: "Background",
      type: SubjectTypes.SUBJECT,
      description:
        "These questions will ask general questions about your background that might be relevant to how people understand your career.",
      isRequired: true,
      isArchived: false,
      categories: [],
      topics: [],
      questions: [],
    },
    {
      _id: "idle_and_initial_recordings",
      name: "Idle and Intial Recordings",
      type: SubjectTypes.UTTERANCES,
      description: "These are miscellaneous phrases you'll be asked to repeat.",
      isRequired: true,
      isArchived: false,
      categories: [],
      topics: [],
      questions: [],
    },
  ],
  topics: [
    {
      id: "T1",
      name: "Topic1",
      description: "1",
    },
  ],
  answers: [
    {
      _id: "A1_1_1",
      previousVersions: [],
      question: {
        _id: "A1_1_1",
        clientId: "C1_1_1",
        question: "Question 1",
        name: null,
        type: QuestionType.QUESTION,
        paraphrases: [],
      },
      transcript:
        "My name is Clint Anderson and I'm a Nuclear Electrician's Mate",
      status: Status.COMPLETE,
    },
    {
      _id: "A2_1_1",
      previousVersions: [],
      question: {
        _id: "A2_1_1",
        clientId: "C2_1_1",
        question: "Question 2",
        name: null,
        type: QuestionType.QUESTION,
        paraphrases: [],
      },
      transcript: "",
      status: Status.INCOMPLETE,
    },
    {
      _id: "A3_1_1",
      previousVersions: [],
      question: {
        _id: "A3_1_1",
        clientId: "C3_1_1",
        question: "Question 3",
        name: null,
        type: QuestionType.UTTERANCE,
        paraphrases: [],
      },
      transcript: "",
      status: Status.INCOMPLETE,
    },
    {
      _id: "A4_1_1",
      previousVersions: [],
      question: {
        _id: "A4_1_1",
        clientId: "C4_1_1",
        question: "Question 4",
        name: null,
        type: QuestionType.UTTERANCE,
        paraphrases: [],
      },
      transcript:
        "My name is Clint Anderson and I'm a Nuclear Electrician's Mate",
      status: Status.COMPLETE,
    },
    {
      _id: "A5_1_1",
      previousVersions: [],
      question: {
        _id: "A5_1_1",
        clientId: "C5_1_1",
        question: "Question 5",
        name: null,
        type: QuestionType.UTTERANCE,
        paraphrases: [],
      },
      transcript: "",
      status: Status.INCOMPLETE,
    },
  ],
  questions: [
    completeSubjectQuestion({
      question: {
        _id: "A3_1_1",
        clientId: "C3_1_1",
        question: "Question 3",
        name: null,
        type: QuestionType.UTTERANCE,
        paraphrases: [],
      },
    }),
    completeSubjectQuestion({
      question: {
        _id: "A4_1_1",
        clientId: "C4_1_1",
        question: "Question 4",
        name: null,
        type: QuestionType.UTTERANCE,
        paraphrases: [],
      },
    }),
    completeSubjectQuestion({
      question: {
        _id: "A5_1_1",
        clientId: "C5_1_1",
        question: "Question 5",
        name: null,
        type: QuestionType.UTTERANCE,
        paraphrases: [],
      },
    }),
    completeSubjectQuestion({
      question: {
        _id: "A6_1_1",
        clientId: "C6_1_1",
        question: "Question 6",
        name: null,
        type: QuestionType.QUESTION,
        paraphrases: [],
      },
    }),
  ],
};
const singleArchivedSubject = {
  ...allSubjects,
  edges: allSubjects.edges.map((edge, i) => {
    if (i == 0) {
      return {
        ...edge,
        node: {
          ...edge.node,
          isArchived: true,
        },
      };
    }
    return {
      ...edge,
    };
  }),
};

describe("Select Subjects", () => {
  it("lists subjects", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: [mentor],
      subjects: [allSubjects],
      gqlQueries: [
        mockGQL("UpdateMentorSubjects", { me: { updateMentorSubjects: true } }),
      ],
    });
    cy.visit("/subjects");
    cy.location("pathname").then(($el) => {
      assert($el.replace("/admin", ""), "/subjects");
    });
    cy.get("[data-cy=subjects]").children().should("have.length", 2);
    // required subject background is selected and cannot be deselected
    cy.get("[data-cy=subjects]").within(($subjects) => {
      cy.get("[data-cy=subject-0]").within(($subject) => {
        cy.get("[data-cy=name]").should("have.text", "Background");
        cy.get("[data-cy=description]").should(
          "have.text",
          "These questions will ask general questions about your background that might be relevant to how people understand your career."
        );
        cy.get('[data-cy=select] [type="checkbox"]')
          .should("be.disabled")
          .and("be.checked");
        cy.get('[data-cy=default] [type="checkbox"]')
          .should("not.be.disabled")
          .and("not.be.checked");
      });
    });
    // non-required subject leadership is selected and can be deselected
    cy.get("[data-cy=subjects]").within(($subjects) => {
      cy.get("[data-cy=subject-1]").within(($subject) => {
        cy.get('[data-cy=select] [type="checkbox"]')
          .check()
          .should("be.checked");
        cy.get('[data-cy=select] [type="checkbox"]').should("not.be.disabled");
      });
    });
    // Check utterances
    cy.get("[data-cy=subject-type-switch]").click();
    cy.get("[data-cy=subjects]").within(($subjects) => {
      cy.get("[data-cy=subject-0]").within(($subject) => {
        cy.get("[data-cy=name]").should(
          "have.text",
          "Idle and Initial Recordings"
        );
        cy.get("[data-cy=description]").should(
          "have.text",
          "These are miscellaneous phrases you'll be asked to repeat."
        );
        cy.get('[data-cy=select] [type="checkbox"]')
          .should("be.disabled")
          .and("be.checked");
        cy.get('[data-cy=default] [type="checkbox"]')
          .should("not.be.disabled")
          .and("not.be.checked");
      });
    });
  });

  it("can select subject + primary subject and save", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: [
        mentor,
        {
          ...mentor,
          defaultSubject: {
            _id: "background",
            name: "Background",
            type: SubjectTypes.SUBJECT,
            description: "",
            isRequired: true,
            isArchived: false,
            categories: [],
            topics: [],
            questions: [],
          },
          subjects: [
            ...mentor.subjects,
            {
              _id: "leadership",
              name: "Leadership",
              type: SubjectTypes.SUBJECT,
              description:
                "These questions will ask about being in a leadership role.",
              isRequired: false,
              isArchived: false,
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
    cy.visit("/subjects");
    // can only have one primary subject
    cy.get("[data-cy=subjects]").within(($subjects) => {
      // select background as primary subject
      cy.get("[data-cy=subject-0]").within(($subject) => {
        cy.get('[data-cy=default] [type="checkbox"]')
          .check()
          .should("be.checked");
      });
      cy.get("[data-cy=subject-1]").within(($subject) => {
        cy.get('[data-cy=default] [type="checkbox"]').should("not.be.checked");
      });
    });
    cy.get("[data-cy=subject-type-switch]").click();
    cy.get("[data-cy=subjects]").within(($subjects) => {
      cy.get("[data-cy=subject-0]").within(($subject) => {
        cy.get('[data-cy=default] [type="checkbox"]').should("not.be.checked");
        cy.get('[data-cy=default] [type="checkbox"]')
          .check()
          .should("be.checked");
      });
    });
    cy.get("[data-cy=subject-type-switch]").click();
    cy.get("[data-cy=subjects]").within(($subjects) => {
      cy.get("[data-cy=subject-0]").within(($subject) => {
        cy.get('[data-cy=default] [type="checkbox"]').should("not.be.checked");
        cy.get('[data-cy=default] [type="checkbox"]')
          .check()
          .should("be.checked");
      });
    });
    // save changes
    cy.get("[data-cy=dropdown-button-list]")
      .should("not.be.disabled")
      .and("have.text", "Save")
      .trigger("mouseover")
      .click();
    // changes were saved
    cy.get("[data-cy=subjects]").within(($subjects) => {
      cy.get("[data-cy=subject-0]").within(($subject) => {
        cy.get('[data-cy=select] [type="checkbox"]')
          .should("be.disabled")
          .and("be.checked");
        cy.get('[data-cy=default] [type="checkbox"]')
          .should("not.be.disabled")
          .and("be.checked");
      });
      cy.get("[data-cy=subject-1]").within(($subject) => {
        cy.get('[data-cy=default] [type="checkbox"]')
          .should("not.be.disabled")
          .and("not.be.checked");
      });
    });
    // make sure primary in utterance got unset
    cy.get("[data-cy=subject-type-switch]").click();
    cy.get("[data-cy=subjects]").within(($subjects) => {
      cy.get("[data-cy=subject-0]").within(($subject) => {
        cy.get('[data-cy=default] [type="checkbox"]')
          .should("not.be.disabled")
          .and("not.be.checked");
      });
    });
  });
});

describe("mentors with configs", () => {
  it("only show subjects that are part of config, with dropdown for others", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: {
        ...mentor,
        mentorConfig: {
          ...mentorConfig,
          subjects: ["background"],
        },
      },
      subjects: [allSubjects],
      gqlQueries: [
        mockGQL("UpdateMentorSubjects", { me: { updateMentorSubjects: true } }),
      ],
    });
    cy.visit("/subjects");
    cy.get("[data-cy=subjects]").children().should("have.length", 1);
    cy.get("[data-cy=subjects-page]").should("contain.text", "Background");
    cy.get("[data-cy=subjects-page]").should("not.contain.text", "Leadership");
    cy.get("[data-cy=show-all-subjects-button]").click();
    cy.get("[data-cy=subjects]").children().should("have.length", 2);
    cy.get("[data-cy=subjects-page]").should("contain.text", "Background");
    cy.get("[data-cy=subjects-page]").should("contain.text", "Leadership");
    cy.get("[data-cy=show-all-subjects-button]").click();
    cy.get("[data-cy=subjects]").children().should("have.length", 1);
    cy.get("[data-cy=subjects-page]").should("contain.text", "Background");
    cy.get("[data-cy=subjects-page]").should("not.contain.text", "Leadership");
  });
});

describe("Dropdown button list", () => {
  it("Primary button set to Exit when there are no edits", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: [mentor],
      subjects: [allSubjects],
    });
    cy.visit("/subjects");
  });

  it("Primary button set to Save with edits", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: [mentor],
      subjects: [allSubjects],
    });
    cy.visit("/subjects");
    cy.get("[data-cy=subject-1]").within(($within) => {
      cy.get("[data-cy=select]").invoke("mouseover").click();
    });
    cy.get("[data-cy=dropdown-button-list]").should("have.text", "Save");
  });

  it("Save is disabled when there are no edits", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: [mentor],
      subjects: [allSubjects],
    });
    cy.visit("/subjects");
    cy.get("[data-cy=dropdown-button-list]").within(($within) => {
      cy.get("[data-cy=dropdown-button]").invoke("mouseover").click();
      cy.get("[data-cy=dropdown-item-1]")
        .should("have.text", "Save")
        .and("have.attr", "aria-disabled", "true");
    });
  });

  it("Revert primary button to Exit after saving", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: [mentor],
      subjects: [allSubjects],
      gqlQueries: [
        mockGQL("UpdateMentorSubjects", { me: { updateMentorSubjects: true } }),
      ],
    });
    cy.visit("/subjects");
    cy.get("[data-cy=subject-1]").within(($within) => {
      cy.get("[data-cy=select]").invoke("mouseover").click();
    });
    cy.get("[data-cy=dropdown-button-list]")
      .should("have.text", "Save")
      .invoke("mouseover")
      .click();
    cy.get("[data-cy=dropdown-button-list]").should("have.text", "Exit");
  });
});

describe("archived subjects", () => {
  it("Do not appear by default", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: [{ ...mentor, subjects: [] }],
      subjects: [singleArchivedSubject],
    });
    cy.visit("/subjects");
    cy.get("[data-cy=subject-0]").should("contain", "Leadership");
    cy.get("[data-cy=subject-0]").should("not.contain", "Archived");
    cy.get("[data-cy=subject-1]").should("not.exist");
  });

  it("Appears for mentors who previously had the subject grandfathered in", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: [mentor],
      subjects: [singleArchivedSubject],
    });
    cy.visit("/subjects");
    cy.get("[data-cy=subject-0]").should("contain", "Background");
    cy.get("[data-cy=subject-0]").should("contain", "Archived");
    cy.get("[data-cy=subject-1]").should("contain", "Leadership");
    cy.get("[data-cy=subject-1]").should("not.contain", "Archived");
  });

  it("View Archived Subjects button not visible to USER's", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: [{ ...mentor, subjects: [] }],
      subjects: [singleArchivedSubject],
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.USER },
      },
    });
    cy.visit("/subjects");
    cy.contains("Leadership");
    cy.get("[data-cy=archived-subject-view-switch]").should("not.exist");
  });

  it("View Archived Subjects button visible to CONTENT_MANAGER's", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: [{ ...mentor, subjects: [] }],
      subjects: [singleArchivedSubject],
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.CONTENT_MANAGER },
      },
    });
    cy.visit("/subjects");
    cy.get("[data-cy=archived-subject-view-switch]").should("exist");
    cy.get("[data-cy=archived-subject-view-switch]").should("be.visible");
  });

  it("View Archived Subjects button visible to ADMIN's", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: [{ ...mentor, subjects: [] }],
      subjects: [singleArchivedSubject],
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.ADMIN },
      },
    });
    cy.visit("/subjects");
    cy.get("[data-cy=archived-subject-view-switch]").should("exist");
    cy.get("[data-cy=archived-subject-view-switch]").should("be.visible");
  });

  it("Can be revealed using show archived subjects button", () => {
    cySetup(cy);
    cyMockDefault(cy, {
      mentor: [{ ...mentor, subjects: [] }],
      subjects: [singleArchivedSubject],
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.ADMIN },
      },
    });
    cy.visit("/subjects");
    cy.get("[data-cy=subject-0]").should("contain", "Leadership");
    cy.get("[data-cy=subject-0]").should("not.contain", "Archived");
    cy.get("[data-cy=subject-1]").should("not.exist");
    cy.get("[data-cy=archived-subject-view-switch]").should("exist");
    cy.get("[data-cy=archived-subject-view-switch]").should("be.visible");
    cy.get("[data-cy=archived-subject-view-switch]").click();
    cy.get("[data-cy=subject-0]").should("contain", "Leadership");
    cy.get("[data-cy=subject-0]").should("not.contain", "Archived");
    cy.get("[data-cy=subject-1]").should("contain", "Background");
    cy.get("[data-cy=subject-1]").should("contain", "Archived");
    cy.get("[data-cy=archived-subject-view-switch]").click();
    cy.get("[data-cy=subject-0]").should("contain", "Leadership");
    cy.get("[data-cy=subject-0]").should("not.contain", "Archived");
    cy.get("[data-cy=subject-1]").should("not.exist");
  });
});
