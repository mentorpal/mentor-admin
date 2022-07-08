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
          subject: "60930672f5ded648ffb65d69",
          title: "CSUF Alumni Panel",
          subtitle: "Ask questions directly to Alumni from CSUF",
        },
      },
    ],
  },
};

describe("users screen", () => {
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
        mockGQL("UpdateConfigFeatured", {
          me: { updateConfigFeatured: config },
        }),
      ],
    });
    cy.visit("/config");
  });
});
