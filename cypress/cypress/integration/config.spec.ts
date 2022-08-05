/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { cyMockDefault, mockGQL } from "../support/functions";
import newMentor from "../fixtures/mentor/clint_new";
import { login as loginDefault } from "../fixtures/login";
import { UserRole } from "../support/types";
import subjects from "../fixtures/subjects/all-subjects";

const config = {
  featuredMentors: ["62b4f62482f27ce347ba02e2"],
  featuredMentorPanels: ["6222512cf2cca4f228cd2e47"],
};

const mentors = {
  mentors: {
    edges: [
      {
        node: {
          _id: "62b4f62482f27ce347ba02e2",
          name: "Mentor 1",
          title: "Captain",
        },
      },
      {
        node: {
          _id: "62aa503082f27ce347bdc7f4",
          name: "Mentor 2",
          title: "Crewmate",
        },
      },
    ],
  },
};

const mentorPanels = {
  mentorPanels: {
    edges: [
      {
        node: {
          _id: "6222512cf2cca4f228cd2e47",
          mentors: ["62b4f62482f27ce347ba02e2", "62aa503082f27ce347bdc7f4"],
          subject: "background",
          title: "CSUF Alumni Panel",
          subtitle: "Ask questions directly to Alumni from CSUF",
        },
      },
    ],
  },
};

describe("users screen", () => {
  it("users cannot view config settings", () => {
    cyMockDefault(cy, {
      mentor: [newMentor],
      config: config,
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.USER },
      },
      gqlQueries: [
        mockGQL("Subject", subjects),
        mockGQL("Mentors", mentors),
        mockGQL("MentorPanels", mentorPanels),
        mockGQL("UpdateConfig", {
          me: { updateConfig: config },
        }),
      ],
    });
    cy.visit("/config");
    cy.contains("You must be an admin or content manager to view this page.");
  });

  it("admin can view config settings", () => {
    cyMockDefault(cy, {
      mentor: [newMentor],
      config: config,
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.ADMIN },
      },
      gqlQueries: [
        mockGQL("Subject", subjects),
        mockGQL("Mentors", mentors),
        mockGQL("MentorPanels", mentorPanels),
        mockGQL("UpdateConfig", {
          me: { updateConfig: config },
        }),
      ],
    });
    cy.visit("/config");
    cy.get("[data-cy=mentors-list]");
  });

  it("content manager can view config settings", () => {
    cyMockDefault(cy, {
      mentor: [newMentor],
      config: config,
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.CONTENT_MANAGER },
      },
      gqlQueries: [
        mockGQL("Subject", subjects),
        mockGQL("Mentors", mentors),
        mockGQL("MentorPanels", mentorPanels),
        mockGQL("UpdateConfig", {
          me: { updateConfig: config },
        }),
      ],
    });
    cy.visit("/config");
    cy.get("[data-cy=mentors-list]");
  });

  it("admin can toggle and launch active mentors", () => {
    cyMockDefault(cy, {
      mentor: [newMentor],
      config: config,
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.ADMIN },
      },
      gqlQueries: [
        mockGQL("Subject", subjects),
        mockGQL("Mentors", mentors),
        mockGQL("MentorPanels", mentorPanels),
        mockGQL("UpdateConfig", {
          me: {
            updateConfig: {
              ...config,
              activeMentors: ["62aa503082f27ce347bdc7f4"],
            },
          },
        }),
      ],
    });
    cy.visit("/config");
    cy.get("[data-cy=save-button").should("be.disabled");
    cy.get("[data-cy=mentors-list]").within(($mentorsList) => {
      cy.get("[data-cy=mentor-0]").within(($mentor) => {
        cy.get("[data-cy=name]").should("have.attr", "data-test", "Mentor 1");
        cy.get('[data-cy=toggle-active] [type="checkbox"]').should(
          "not.be.checked"
        );
      });
      cy.get("[data-cy=mentor-1]").within(($mentor) => {
        cy.get("[data-cy=name]").should("have.attr", "data-test", "Mentor 2");
        cy.get('[data-cy=toggle-active] [type="checkbox"]').should(
          "not.be.checked"
        );
        cy.get('[data-cy=toggle-active] [type="checkbox"]')
          .trigger("mouseover")
          .click();
        cy.get('[data-cy=toggle-active] [type="checkbox"]').should(
          "be.checked"
        );
      });
    });
    cy.get("[data-cy=save-button").should("not.be.disabled");
    cy.get("[data-cy=save-button").trigger("mouseover").click();
    cy.get("[data-cy=save-button").should("be.disabled");
    cy.get("[data-cy=mentors-list]").within(($mentorsList) => {
      cy.get("[data-cy=mentor-0]").within(($mentor) => {
        cy.get("[data-cy=name]").should("have.attr", "data-test", "Mentor 1");
        cy.get('[data-cy=toggle-active] [type="checkbox"]').should(
          "not.be.checked"
        );
      });
      cy.get("[data-cy=mentor-1]").within(($mentor) => {
        cy.get("[data-cy=name]").should("have.attr", "data-test", "Mentor 2");
        cy.get('[data-cy=toggle-active] [type="checkbox"]').should(
          "be.checked"
        );
        cy.get("[data-cy=launch-mentor]").trigger("mouseover").click();
      });
    });
  });

  it("admin can toggle and launch featured mentors", () => {
    cyMockDefault(cy, {
      mentor: [newMentor],
      config: config,
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.ADMIN },
      },
      gqlQueries: [
        mockGQL("Subject", subjects),
        mockGQL("Mentors", mentors),
        mockGQL("MentorPanels", mentorPanels),
        mockGQL("UpdateConfig", {
          me: {
            updateConfig: {
              ...config,
              featuredMentors: ["62aa503082f27ce347bdc7f4"],
            },
          },
        }),
      ],
    });
    cy.visit("/config");
    cy.get("[data-cy=save-button").should("be.disabled");
    cy.get("[data-cy=mentors-list]").within(($mentorsList) => {
      cy.get("[data-cy=mentor-0]").within(($mentor) => {
        cy.get("[data-cy=name]").should("have.attr", "data-test", "Mentor 1");
        cy.get('[data-cy=toggle-featured] [type="checkbox"]').should(
          "be.checked"
        );
        cy.get('[data-cy=toggle-featured] [type="checkbox"]')
          .trigger("mouseover")
          .click();
      });
      cy.get("[data-cy=mentor-1]").within(($mentor) => {
        cy.get("[data-cy=name]").should("have.attr", "data-test", "Mentor 2");
        cy.get('[data-cy=toggle-featured] [type="checkbox"]').should(
          "not.be.checked"
        );
        cy.get('[data-cy=toggle-featured] [type="checkbox"]')
          .trigger("mouseover")
          .click();
      });
    });
    cy.get("[data-cy=save-button").should("not.be.disabled");
    cy.get("[data-cy=save-button").trigger("mouseover").click();
    cy.get("[data-cy=save-button").should("be.disabled");
    cy.get("[data-cy=mentors-list]").within(($mentorsList) => {
      cy.get("[data-cy=mentor-0]").within(($mentor) => {
        cy.get("[data-cy=name]").should("have.attr", "data-test", "Mentor 2");
        cy.get('[data-cy=toggle-featured] [type="checkbox"]').should(
          "be.checked"
        );
      });
      cy.get("[data-cy=mentor-1]").within(($mentor) => {
        cy.get("[data-cy=name]").should("have.attr", "data-test", "Mentor 1");
        cy.get('[data-cy=toggle-featured] [type="checkbox"]').should(
          "not.be.checked"
        );
        cy.get("[data-cy=launch-mentor]").trigger("mouseover").click();
      });
    });
  });

  it("admin can toggle and launch featured mentor panels", () => {
    cyMockDefault(cy, {
      mentor: [newMentor],
      config: config,
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.ADMIN },
      },
      gqlQueries: [
        mockGQL("Subject", subjects),
        mockGQL("Mentors", mentors),
        mockGQL("MentorPanels", mentorPanels),
        mockGQL("UpdateConfig", {
          me: { updateConfig: { ...config, featuredMentorPanels: [] } },
        }),
      ],
    });
    cy.visit("/config");
    cy.get("[data-cy=save-button").should("be.disabled");
    cy.get("[data-cy=toggle-featured-mentor-panels]")
      .trigger("mouseover")
      .click();
    cy.get("[data-cy=mentor-panels-list]").within(($mentorsList) => {
      cy.get("[data-cy=mentor-panel-0]").within(($mentor) => {
        cy.get("[data-cy=name]").should(
          "have.attr",
          "data-test",
          "CSUF Alumni Panel"
        );
        cy.get('[data-cy=toggle-featured] [type="checkbox"]').should(
          "be.checked"
        );
        cy.get('[data-cy=toggle-featured] [type="checkbox"]')
          .trigger("mouseover")
          .click();
      });
    });
    cy.get("[data-cy=save-button").should("not.be.disabled");
    cy.get("[data-cy=save-button").trigger("mouseover").click();
    cy.get("[data-cy=save-button").should("be.disabled");
    cy.get("[data-cy=mentor-panels-list]").within(($mentorsList) => {
      cy.get("[data-cy=mentor-panel-0]").within(($mentor) => {
        cy.get("[data-cy=name]").should(
          "have.attr",
          "data-test",
          "CSUF Alumni Panel"
        );
        cy.get('[data-cy=toggle-featured] [type="checkbox"]').should(
          "not.be.checked"
        );
        cy.get("[data-cy=launch-mentor-panel]").trigger("mouseover").click();
      });
    });
  });

  it("admin can edit mentor panel", () => {
    cyMockDefault(cy, {
      mentor: [newMentor],
      config: config,
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.ADMIN },
      },
      gqlQueries: [
        mockGQL("Subjects", { subjects: subjects }),
        mockGQL("Mentors", mentors),
        mockGQL("MentorPanels", [
          mentorPanels,
          {
            mentorPanels: {
              edges: [
                {
                  node: {
                    _id: "6222512cf2cca4f228cd2e47",
                    mentors: ["62b4f62482f27ce347ba02e2"],
                    subject: "leadership",
                    title: "CSUF Alumni Panel Edited",
                    subtitle:
                      "Ask questions directly to Alumni from CSUF Edited",
                  },
                },
              ],
            },
          },
        ]),
        mockGQL("AddOrUpdateMentorPanel", {
          me: {
            addOrUpdateMentorPanel: {
              _id: "6222512cf2cca4f228cd2e47",
              mentors: ["62b4f62482f27ce347ba02e2"],
              subject: "leadership",
              title: "CSUF Alumni Panel Edited",
              subtitle: "Ask questions directly to Alumni from CSUF Edited",
            },
          },
        }),
      ],
    });
    cy.visit("/config");
    cy.get("[data-cy=toggle-featured-mentor-panels]")
      .trigger("mouseover")
      .click();
    cy.get("[data-cy=mentor-panels-list]").within(($mentorsList) => {
      cy.get("[data-cy=mentor-panel-0]").within(($mentor) => {
        cy.get("[data-cy=name]").should(
          "have.attr",
          "data-test",
          "CSUF Alumni Panel"
        );
        cy.get("[data-cy=edit-mentor-panel]").trigger("mouseover").click();
      });
    });
    cy.get("[data-cy=edit-mentor-panel]").should("exist");
    cy.get("[data-cy=panel-title]").should(
      "have.attr",
      "data-test",
      "CSUF Alumni Panel"
    );
    cy.get("[data-cy=panel-subtitle]").should(
      "have.attr",
      "data-test",
      "Ask questions directly to Alumni from CSUF"
    );
    cy.get("[data-cy=panel-subject]").should(
      "have.attr",
      "data-test",
      "background"
    );
    cy.get("[data-cy=panel-title]").type(" Edited");
    cy.get("[data-cy=panel-subtitle]").type(" Edited");
    cy.get("[data-cy=panel-subject]").trigger("mouseover").click();
    cy.get("[data-cy=panel-subject-leadership]").trigger("mouseover").click();
    cy.get("[data-cy=mentor-panels-mentors]").within(($list) => {
      cy.get("[data-cy=mentor-panel-mentor-0]").within(($mentor) => {
        cy.get("[data-cy=name]").should("have.attr", "data-test", "Mentor 1");
      });
      cy.get("[data-cy=mentor-panel-mentor-1]").within(($mentor) => {
        cy.get("[data-cy=name]").should("have.attr", "data-test", "Mentor 2");
        cy.get("[data-cy=remove-mentor-panel-mentor]")
          .trigger("mouseover")
          .click();
      });
    });
    cy.get("[data-cy=save-mentor-panel]").trigger("mouseover").click();
    cy.wait(500);
    cy.get("[data-cy=mentor-panels-list]").within(($mentorsList) => {
      cy.get("[data-cy=mentor-panel-0]").within(($mentor) => {
        cy.get("[data-cy=name]").should(
          "have.attr",
          "data-test",
          "CSUF Alumni Panel Edited"
        );
        cy.get("[data-cy=edit-mentor-panel]").trigger("mouseover").click();
      });
    });
    cy.get("[data-cy=edit-mentor-panel]").should("exist");
    cy.get("[data-cy=panel-title]").should(
      "have.attr",
      "data-test",
      "CSUF Alumni Panel Edited"
    );
    cy.get("[data-cy=panel-subtitle]").should(
      "have.attr",
      "data-test",
      "Ask questions directly to Alumni from CSUF Edited"
    );
    cy.get("[data-cy=panel-subject]").should(
      "have.attr",
      "data-test",
      "leadership"
    );
    cy.get("[data-cy=mentor-panels-mentors]").within(($list) => {
      cy.get("[data-cy=mentor-panel-mentor-0]").within(($mentor) => {
        cy.get("[data-cy=name]").should("have.attr", "data-test", "Mentor 1");
      });
    });
  });

  it("admin can create mentor panel", () => {
    cyMockDefault(cy, {
      mentor: [newMentor],
      config: config,
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.ADMIN },
      },
      gqlQueries: [
        mockGQL("Subjects", { subjects: subjects }),
        mockGQL("Mentors", mentors),
        mockGQL("MentorPanels", [
          mentorPanels,
          {
            mentorPanels: {
              edges: [
                {
                  node: {
                    _id: "6222512cf2cca4f228cd2e47",
                    mentors: [
                      "62b4f62482f27ce347ba02e2",
                      "62aa503082f27ce347bdc7f4",
                    ],
                    subject: "background",
                    title: "CSUF Alumni Panel",
                    subtitle: "Ask questions directly to Alumni from CSUF",
                  },
                },
                {
                  node: {
                    _id: "6222512cf2cca4f228cd2e49",
                    mentors: ["62b4f62482f27ce347ba02e2"],
                    subject: "leadership",
                    title: "New",
                    subtitle: "New",
                  },
                },
              ],
            },
          },
        ]),
        mockGQL("AddOrUpdateMentorPanel", {
          me: {
            addOrUpdateMentorPanel: {
              _id: "6222512cf2cca4f228cd2e49",
              mentors: ["62b4f62482f27ce347ba02e2"],
              subject: "leadership",
              title: "New",
              subtitle: "New",
            },
          },
        }),
      ],
    });
    cy.visit("/config");
    cy.get("[data-cy=toggle-featured-mentor-panels]")
      .trigger("mouseover")
      .click();
    cy.get("[data-cy=mentor-panels-list]").within(($mentorsList) => {
      cy.get("[data-cy=mentor-panel-0]").within(($mentor) => {
        cy.get("[data-cy=name]").should(
          "have.attr",
          "data-test",
          "CSUF Alumni Panel"
        );
      });
    });
    cy.get("[data-cy=add-mentor-panel]").trigger("mouseover").click();
    cy.get("[data-cy=edit-mentor-panel]").should("exist");
    cy.get("[data-cy=panel-title]").should("have.attr", "data-test", "");
    cy.get("[data-cy=panel-subtitle]").should("have.attr", "data-test", "");
    cy.get("[data-cy=panel-subject]").should("have.attr", "data-test", "");
    cy.get("[data-cy=panel-title]").type("New");
    cy.get("[data-cy=panel-subtitle]").type("New");
    cy.get("[data-cy=panel-subject]").trigger("mouseover").click();
    cy.get("[data-cy=panel-subject-leadership]").trigger("mouseover").click();
    cy.get("[data-cy=panel-mentors]").trigger("mouseover").click();
    cy.get("[data-cy=panel-mentor-62b4f62482f27ce347ba02e2]")
      .trigger("mouseover")
      .click();
    cy.get("[data-cy=save-mentor-panel]").trigger("mouseover").click();
    cy.wait(500);
    cy.get("[data-cy=mentor-panels-list]").within(($mentorsList) => {
      cy.get("[data-cy=mentor-panel-0]").within(($mentor) => {
        cy.get("[data-cy=name]").should(
          "have.attr",
          "data-test",
          "CSUF Alumni Panel"
        );
      });
      cy.get("[data-cy=mentor-panel-1]").within(($mentor) => {
        cy.get("[data-cy=name]").should("have.attr", "data-test", "New");
        cy.get("[data-cy=edit-mentor-panel]").trigger("mouseover").click();
      });
    });
    cy.get("[data-cy=edit-mentor-panel]").should("exist");
    cy.get("[data-cy=panel-title]").should("have.attr", "data-test", "New");
    cy.get("[data-cy=panel-subtitle]").should("have.attr", "data-test", "New");
    cy.get("[data-cy=panel-subject]").should(
      "have.attr",
      "data-test",
      "leadership"
    );
    cy.get("[data-cy=mentor-panels-mentors]").within(($list) => {
      cy.get("[data-cy=mentor-panel-mentor-0]").within(($mentor) => {
        cy.get("[data-cy=name]").should("have.attr", "data-test", "Mentor 1");
      });
    });
  });

  it("admin can update header styles", () => {
    cyMockDefault(cy, {
      mentor: [newMentor],
      config: {
        ...config,
        styleHeaderColor: "#ff0000",
        styleHeaderTextColor: "#00ff00",
      },
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.ADMIN },
      },
      gqlQueries: [
        mockGQL("Subjects", { subjects: subjects }),
        mockGQL("Mentors", mentors),
        mockGQL("MentorPanels", mentorPanels),
        mockGQL("UpdateConfig", {
          me: {
            updateConfig: {
              ...config,
              styleHeaderColor: "#ff0000",
              styleHeaderTextColor: "#00ff00",
              styleHeaderLogo:
                "https://styles.redditmedia.com/t5_3l2acu/styles/communityIcon_k6hl8k9v3s891.jpeg?width=256&format=pjpg&s=5bc9d810009d151a336731145f4788c8c039c8c3",
            },
          },
        }),
      ],
    });
    cy.visit("/config");
    cy.get("[data-cy=toggle-header-style]").trigger("mouseover").click();
    cy.get("[data-cy=save-button").should("be.disabled");
    cy.get("[data-cy=styleHeaderLogo]").should("have.attr", "data-test", "");
    cy.get("[data-cy=styleHeaderColor]").should(
      "have.attr",
      "data-test",
      "#ff0000"
    );
    cy.get("[data-cy=styleHeaderTextColor]").should(
      "have.attr",
      "data-test",
      "#00ff00"
    );
    cy.get("[data-cy=styleHeaderLogo]").type(
      "https://styles.redditmedia.com/t5_3l2acu/styles/communityIcon_k6hl8k9v3s891.jpeg?width=256&format=pjpg&s=5bc9d810009d151a336731145f4788c8c039c8c3"
    );
    cy.get("[data-cy=save-button").should("not.be.disabled");
    cy.get("[data-cy=save-button").trigger("mouseover").click();
    cy.get("[data-cy=styleHeaderLogo]").should(
      "have.attr",
      "data-test",
      "https://styles.redditmedia.com/t5_3l2acu/styles/communityIcon_k6hl8k9v3s891.jpeg?width=256&format=pjpg&s=5bc9d810009d151a336731145f4788c8c039c8c3"
    );
    cy.get("[data-cy=styleHeaderColor]").should(
      "have.attr",
      "data-test",
      "#ff0000"
    );
    cy.get("[data-cy=styleHeaderTextColor]").should(
      "have.attr",
      "data-test",
      "#00ff00"
    );
    cy.get("[data-cy=save-button").should("be.disabled");
    cy.get("[data-cy=image-thumbnail]").trigger("mouseover").click();
  });

  it("admin can update disclaimer", () => {
    cyMockDefault(cy, {
      mentor: [newMentor],
      config: config,
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.ADMIN },
      },
      gqlQueries: [
        mockGQL("Subjects", { subjects: subjects }),
        mockGQL("Mentors", mentors),
        mockGQL("MentorPanels", mentorPanels),
        mockGQL("UpdateConfig", {
          me: {
            updateConfig: {
              ...config,
              disclaimerTitle: "title",
              disclaimerText: "text",
              disclaimerDisabled: true,
            },
          },
        }),
      ],
    });
    cy.visit("/config");
    cy.get("[data-cy=toggle-disclaimer]").trigger("mouseover").click();
    cy.get("[data-cy=save-button").should("be.disabled");
    cy.get("[data-cy=disclaimerTitle]").should("have.attr", "data-test", "");
    cy.get("[data-cy=disclaimerText]").should("have.attr", "data-test", "");
    cy.get("[data-cy=disclaimerDisabled]").should(
      "have.attr",
      "data-test",
      "false"
    );
    cy.get("[data-cy=disclaimerTitle]").type("title");
    cy.get("[data-cy=disclaimerText]").type("text");
    cy.get("[data-cy=disclaimerDisabled]").trigger("mouseover").click();
    cy.get("[data-cy=save-button").should("not.be.disabled");
    cy.get("[data-cy=save-button").trigger("mouseover").click();
    cy.get("[data-cy=disclaimerTitle]").should(
      "have.attr",
      "data-test",
      "title"
    );
    cy.get("[data-cy=disclaimerText]").should("have.attr", "data-test", "text");
    cy.get("[data-cy=disclaimerDisabled]").should(
      "have.attr",
      "data-test",
      "true"
    );
    cy.get("[data-cy=save-button").should("be.disabled");
  });
});
