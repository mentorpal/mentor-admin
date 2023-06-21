/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { cyMockDefault, mockGQL } from "../support/functions";
import newMentor from "../fixtures/mentor/clint_new";
import { login as loginDefault } from "../fixtures/login";
import { JobState, MentorDirtyReason, UserRole } from "../support/types";
import { users } from "../fixtures/users";

describe("users screen", () => {
  it("admins can edit all users roles", () => {
    cyMockDefault(cy, {
      mentor: [newMentor],
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.ADMIN },
      },
      gqlQueries: [mockGQL("Users", { users })],
    });
    cy.visit("/users");
    cy.get("[data-cy=user-0]").within(($within) => {
      cy.get("[data-cy=name]").should("have.text", "Admin User");
      cy.get("[data-cy=defaultMentor]").should("have.text", "Admin");
      cy.get("[data-cy=select-role]").should("exist");
    });
    cy.get("[data-cy=user-1]").within(($within) => {
      cy.get("[data-cy=name]").should("have.text", "Content Manager");
      cy.get("[data-cy=defaultMentor]").should("have.text", "Content Manager");
      cy.get("[data-cy=select-role]").should("exist");
    });
    cy.get("[data-cy=user-2]").within(($within) => {
      cy.get("[data-cy=name]").should("have.text", "User");
      cy.get("[data-cy=defaultMentor]").should("have.text", "User");
      cy.get("[data-cy=select-role]").should("exist");
    });
  });

  it("failed to update user permissions error display", () => {
    cyMockDefault(cy, {
      mentor: [newMentor],
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.ADMIN },
      },
      gqlQueries: [
        mockGQL("Users", { users }),
        mockGQL("UpdateUserPermissions", undefined),
      ],
    });
    cy.visit("/users");
    cy.get("[data-cy=user-0]").within(($within) => {
      cy.get("[data-cy=defaultMentor]").should("have.text", "Admin");
      cy.get("[data-cy=select-role]").invoke("mouseover").click();
    });
    cy.get("[data-cy=role-dropdown-USER]").invoke("mouseover").click();
    cy.get("[data-cy=error-dialog]").within(($within) => {
      cy.get("[data-cy=error-dialog-title]").should(
        "have.text",
        "Failed to update user permissions"
      );
    });
  });

  it("content managers cannot edit user roles", () => {
    cyMockDefault(cy, {
      mentor: [newMentor],
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.CONTENT_MANAGER },
      },
      gqlQueries: [mockGQL("Users", { users })],
    });
    cy.visit("/users");
    cy.get("[data-cy=user-0]").within(($within) => {
      cy.get("[data-cy=defaultMentor]").should("have.text", "Admin");
      cy.get("[data-cy=select-role]").should("not.exist");
    });
    cy.get("[data-cy=user-1]").within(($within) => {
      cy.get("[data-cy=defaultMentor]").should("have.text", "Content Manager");
      cy.get("[data-cy=select-role]").should("not.exist");
    });
    cy.get("[data-cy=user-2]").within(($within) => {
      cy.get("[data-cy=defaultMentor]").should("have.text", "User");
      cy.get("[data-cy=select-role]").should("not.exist");
    });
  });

  it("admin can edit mentor privacy", () => {
    cyMockDefault(cy, {
      mentor: [newMentor],
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.ADMIN },
      },
      gqlQueries: [
        mockGQL("Users", [
          { users },
          {
            users: {
              edges: [
                {
                  cursor: "cursor 1",
                  node: {
                    _id: "admin",
                    name: "Admin",
                    email: "admin@opentutor.org",
                    userRole: UserRole.ADMIN,
                    defaultMentor: {
                      _id: "clintanderson",
                      name: "Admin",
                      isPrivate: true,
                    },
                  },
                },
                {
                  cursor: "cursor 2",
                  node: {
                    _id: "contentmanager",
                    name: "Content Manager",
                    email: "contentmanager@opentutor.org",
                    userRole: UserRole.CONTENT_MANAGER,
                    defaultMentor: {
                      _id: "clintanderson",
                      name: "Content Manager",
                      isPrivate: false,
                    },
                  },
                },
                {
                  cursor: "cursor 2",
                  node: {
                    _id: "user",
                    name: "User",
                    email: "user@opentutor.org",
                    userRole: UserRole.USER,
                    defaultMentor: {
                      _id: "clintanderson",
                      name: "User",
                      isPrivate: false,
                    },
                  },
                },
              ],
              pageInfo: {
                hasNextPage: false,
                endCursor: "cursor 2",
              },
            },
          },
        ]),
        mockGQL("UpdateMentorPrivacy", {
          me: {
            updateMentorPrivacy: true,
          },
        }),
      ],
    });
    cy.visit("/users");
    cy.get("[data-cy=user-0]").within(($within) => {
      cy.get("[data-cy=defaultMentor]").should("have.text", "Admin");
      cy.get("[data-cy=select-privacy]").should("exist");
      cy.get("[data-cy=select-privacy]")
        .contains("Public")
        .trigger("mouseover")
        .click();
    });
    cy.get("[data-cy=privacy-dropdown-private]")
      .contains("Private")
      .trigger("mouseover")
      .click();
    cy.get("[data-cy=user-0]").within(($within) => {
      cy.get("[data-cy=defaultMentor]").should("have.text", "Admin");
      cy.get("[data-cy=select-privacy]").should("exist");
      cy.get("[data-cy=select-privacy]").contains("Private");
    });
  });

  it("can toggle archived mentors", () => {
    cyMockDefault(cy, {
      mentor: [newMentor],
      login: {
        ...loginDefault,
        user: { ...loginDefault.user, userRole: UserRole.ADMIN },
      },
      gqlQueries: [
        mockGQL("Users", {
          users: {
            edges: [
              {
                cursor: "cursor 3",
                node: {
                  _id: "archived",
                  name: "Archived",
                  email: "archived@mentor.com",
                  userRole: UserRole.USER,
                  defaultMentor: {
                    _id: "clintanderson",
                    name: "User",
                    isPrivate: false,
                    isArchived: true,
                  },
                },
              },
              ...users.edges,
            ],
          },
        }),
      ],
    });
    cy.visit("/users");
    cy.get("[data-cy=user-0]").within(($within) => {
      cy.get("[data-cy=name]").should("have.text", "Admin User");
      cy.get("[data-cy=defaultMentor]").should("have.text", "Admin");
      cy.get("[data-cy=select-role]").should("exist");
    });
    cy.get("[data-cy=user-1]").within(($within) => {
      cy.get("[data-cy=name]").should("have.text", "Content Manager");
      cy.get("[data-cy=defaultMentor]").should("have.text", "Content Manager");
      cy.get("[data-cy=select-role]").should("exist");
    });
    cy.get("[data-cy=user-2]").within(($within) => {
      cy.get("[data-cy=name]").should("have.text", "User");
      cy.get("[data-cy=defaultMentor]").should("have.text", "User");
      cy.get("[data-cy=select-role]").should("exist");
    });
    cy.get("[data-cy=archive-mentor-switch]").should(
      "have.attr",
      "data-test",
      "false"
    );
    cy.get("[data-cy=archive-mentor-switch]").click();
    cy.get("[data-cy=user-0]").within(($within) => {
      cy.get("[data-cy=name]").should("have.text", "Admin User");
      cy.get("[data-cy=defaultMentor]").should("have.text", "Admin");
      cy.get("[data-cy=select-role]").should("exist");
    });
    cy.get("[data-cy=user-1]").within(($within) => {
      cy.get("[data-cy=name]").should("have.text", "Content Manager");
      cy.get("[data-cy=defaultMentor]").should("have.text", "Content Manager");
      cy.get("[data-cy=select-role]").should("exist");
    });
    cy.get("[data-cy=user-2]").within(($within) => {
      cy.get("[data-cy=name]").should("have.text", "User");
      cy.get("[data-cy=defaultMentor]").should("have.text", "User");
      cy.get("[data-cy=select-role]").should("exist");
    });
    cy.get("[data-cy=user-3]").within(($within) => {
      cy.get("[data-cy=name]").should("have.text", "Archived");
      cy.get("[data-cy=defaultMentor]").should("have.text", "User Archived");
    });
  });

  describe.only("training mentors via users page", () => {
    it("dirty mentors display build icon", () => {
      cyMockDefault(cy, {
        mentor: [newMentor],
        login: {
          ...loginDefault,
          user: { ...loginDefault.user, userRole: UserRole.ADMIN },
        },
        gqlQueries: [
          mockGQL("Users", {
            users: {
              edges: [
                ...users.edges.map((user, i) => {
                  if (i === 0) {
                    return {
                      ...user,
                      node: {
                        ...user.node,
                        defaultMentor: {
                          ...user.node.defaultMentor,
                          isDirty: true,
                          dirtyReason: MentorDirtyReason.ANSWERS_ADDED,
                          numAnswersComplete: 5,
                        },
                      },
                    };
                  }
                  return user;
                }),
              ],
            },
          }),
        ],
      });
      cy.visit("/users");
      cy.wait(2000);
      cy.get("[data-cy=user-0]").within(($within) => {
        cy.get("[data-cy=train-mentor-clintanderson]")
          .should("exist")
          .should("be.visible");
      });
    });

    it("can train mentors from users page and see success icon", () => {
      cyMockDefault(cy, {
        mentor: [newMentor],
        login: {
          ...loginDefault,
          user: { ...loginDefault.user, userRole: UserRole.ADMIN },
        },
        gqlQueries: [
          mockGQL("Users", {
            users: {
              edges: [
                ...users.edges.map((user, i) => {
                  if (i === 0) {
                    return {
                      ...user,
                      node: {
                        ...user.node,
                        defaultMentor: {
                          ...user.node.defaultMentor,
                          isDirty: true,
                          dirtyReason: MentorDirtyReason.ANSWERS_ADDED,
                          numAnswersComplete: 5,
                        },
                      },
                    };
                  }
                  return user;
                }),
              ],
            },
          }),

          mockGQL("MentorsById", {
            mentorsById: [
              {
                _id: "clintanderson",
                lastTrainStatus: JobState.SUCCESS,
              },
            ],
          }),
        ],
      });
      cy.visit("/users");
      cy.wait(2000);
      cy.get("[data-cy=user-0]").within(($within) => {
        cy.get("[data-cy=train-mentor-clintanderson]")
          .should("exist")
          .should("be.visible");
        cy.get("[data-cy=train-mentor-clintanderson]").invoke("click");
        cy.get("[data-cy=train-mentor-clintanderson]").should("not.exist");
        cy.get("[data-cy=success-icon]").should("exist");
      });
      cy.get("[data-cy=user-1]").within(($within) => {
        cy.get("[data-cy=train-mentor-clintanderson]").should("not.exist");
      });
    });

    it("failed builds revert to build icon", () => {
      cyMockDefault(cy, {
        mentor: [newMentor],
        login: {
          ...loginDefault,
          user: { ...loginDefault.user, userRole: UserRole.ADMIN },
        },
        gqlQueries: [
          mockGQL("Users", {
            users: {
              edges: [
                ...users.edges.map((user, i) => {
                  if (i === 0) {
                    return {
                      ...user,
                      node: {
                        ...user.node,
                        defaultMentor: {
                          ...user.node.defaultMentor,
                          _id: "clintanderson1",
                          isDirty: true,
                          dirtyReason: MentorDirtyReason.ANSWERS_ADDED,
                          numAnswersComplete: 5,
                        },
                      },
                    };
                  }
                  return user;
                }),
              ],
            },
          }),

          mockGQL("MentorsById", {
            mentorsById: [
              {
                _id: "clintanderson1",
                lastTrainStatus: JobState.FAILURE,
              },
            ],
          }),
        ],
      });
      cy.visit("/users");
      cy.wait(2000);
      cy.get("[data-cy=user-0]").within(($within) => {
        cy.get("[data-cy=train-mentor-clintanderson1]")
          .should("exist")
          .should("be.visible");
        cy.get("[data-cy=train-mentor-clintanderson1]").invoke("click");
        cy.get("[data-cy=train-mentor-clintanderson1]").should("not.exist");
        cy.get("[data-cy=progress-icon]").should("exist");
        // after failure
        cy.get("[data-cy=train-mentor-clintanderson1]").should("exist");
      });
      cy.get("[data-cy=user-1]").within(($within) => {
        cy.get("[data-cy=train-mentor-clintanderson]").should("not.exist");
      });
    });

    it("can build multiple mentors at the same time", () => {
      cyMockDefault(cy, {
        mentor: [newMentor],
        login: {
          ...loginDefault,
          user: { ...loginDefault.user, userRole: UserRole.ADMIN },
        },
        gqlQueries: [
          mockGQL("Users", {
            users: {
              edges: [
                ...users.edges.map((user, i) => {
                  if (i === 0 || i === 1) {
                    return {
                      ...user,
                      node: {
                        ...user.node,
                        defaultMentor: {
                          ...user.node.defaultMentor,
                          _id: `${user.node.defaultMentor._id}${i}`,
                          isDirty: true,
                          dirtyReason: MentorDirtyReason.ANSWERS_ADDED,
                          numAnswersComplete: 5,
                        },
                      },
                    };
                  }
                  return user;
                }),
              ],
            },
          }),

          mockGQL("MentorsById", [
            {
              mentorsById: [
                {
                  _id: "clintanderson0",
                  lastTrainStatus: JobState.FAILURE,
                },
                {
                  _id: "clintanderson1",
                  lastTrainStatus: JobState.IN_PROGRESS,
                },
              ],
            },
            {
              mentorsById: [
                {
                  _id: "clintanderson0",
                  lastTrainStatus: JobState.FAILURE,
                },
                {
                  _id: "clintanderson1",
                  lastTrainStatus: JobState.SUCCESS,
                },
              ],
            },
          ]),
        ],
      });
      cy.visit("/users");
      cy.wait(2000);
      cy.get("[data-cy=user-0]").within(($within) => {
        cy.get("[data-cy=train-mentor-clintanderson0]")
          .should("exist")
          .should("be.visible");
        cy.get("[data-cy=train-mentor-clintanderson0]").invoke("click");
        cy.get("[data-cy=train-mentor-clintanderson0]").should("not.exist");
        cy.get("[data-cy=progress-icon]").should("exist");
      });

      cy.get("[data-cy=user-1]").within(($within) => {
        cy.get("[data-cy=train-mentor-clintanderson1]")
          .should("exist")
          .should("be.visible");
        cy.get("[data-cy=train-mentor-clintanderson1]").invoke("click");
        cy.get("[data-cy=train-mentor-clintanderson1]").should("not.exist");
        cy.get("[data-cy=progress-icon]").should("exist");
      });
      // wait for 2 polls
      cy.wait(8000);
      cy.get("[data-cy=user-0]").within(($within) => {
        // after failure, reverts to build icon
        cy.get("[data-cy=train-mentor-clintanderson0]").should("exist");
      });

      cy.get("[data-cy=user-1]").within(($within) => {
        cy.get("[data-cy=success-icon]").should("exist");
      });
    });

    it("automatically polls for mentors with training in progress", () => {
      cyMockDefault(cy, {
        mentor: [newMentor],
        login: {
          ...loginDefault,
          user: { ...loginDefault.user, userRole: UserRole.ADMIN },
        },
        gqlQueries: [
          mockGQL("Users", {
            users: {
              edges: [
                ...users.edges.map((user, i) => {
                  if (i === 0) {
                    return {
                      ...user,
                      node: {
                        ...user.node,
                        defaultMentor: {
                          ...user.node.defaultMentor,
                          _id: "clintanderson1",
                          isDirty: true,
                          dirtyReason: MentorDirtyReason.ANSWERS_ADDED,
                          lastTrainStatus: JobState.IN_PROGRESS,
                          numAnswersComplete: 5,
                        },
                      },
                    };
                  }
                  return user;
                }),
              ],
            },
          }),

          mockGQL("MentorsById", [
            {
              mentorsById: [
                {
                  _id: "clintanderson1",
                  lastTrainStatus: JobState.SUCCESS,
                },
              ],
            },
          ]),
        ],
      });
      cy.visit("/users");
      cy.wait(2000);
      cy.get("[data-cy=user-0]").within(($within) => {
        cy.get("[data-cy=progress-icon]").should("exist");
        cy.wait(3000);
        cy.get("[data-cy=success-icon]").should("exist");
      });
    });

    it("dirty mentors with a last train status of SUCCESS still need training", () => {
      cyMockDefault(cy, {
        mentor: [newMentor],
        login: {
          ...loginDefault,
          user: { ...loginDefault.user, userRole: UserRole.ADMIN },
        },
        gqlQueries: [
          mockGQL("Users", {
            users: {
              edges: [
                ...users.edges.map((user, i) => {
                  if (i === 0) {
                    return {
                      ...user,
                      node: {
                        ...user.node,
                        defaultMentor: {
                          ...user.node.defaultMentor,
                          _id: "clintanderson1",
                          isDirty: true,
                          dirtyReason: MentorDirtyReason.ANSWERS_ADDED,
                          lastTrainStatus: JobState.SUCCESS,
                          numAnswersComplete: 5,
                        },
                      },
                    };
                  }
                  return user;
                }),
              ],
            },
          }),

          mockGQL("MentorsById", [
            {
              mentorsById: [
                {
                  _id: "clintanderson1",
                  lastTrainStatus: JobState.IN_PROGRESS,
                },
              ],
            },
          ]),
        ],
      });
      cy.visit("/users");
      cy.wait(2000);
      cy.get("[data-cy=user-0]").within(($within) => {
        cy.get("[data-cy=train-mentor-clintanderson1]")
          .should("exist")
          .should("be.visible");
        cy.get("[data-cy=train-mentor-clintanderson1]").invoke("click");
        cy.get("[data-cy=train-mentor-clintanderson1]").should("not.exist");
        cy.get("[data-cy=progress-icon]").should("exist");
      });
    });
  });
});
