/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { cySetup, cyInterceptGraphQL, cyMockLogin, cyMockGQL } from "../support/functions";
import login from "../fixtures/login"
import allSubjects from "../fixtures/subjects/all-subjects";
import { background } from "../fixtures/subjects";

const mentor = {
  _id: "clint"
}

describe("Edit subjects", () => {

  it("redirects to login page if not logged in", () => {
    cySetup(cy);
    cy.visit("/author/subjects");
    cy.location("pathname").should("contain", "/login");
  });

  it("shows list of subjects", () => {
    cySetup(cy);
    cyMockLogin(cy);
    cyInterceptGraphQL(cy, [
      cyMockGQL("login", login),
      cyMockGQL("mentor", mentor, true),
      cyMockGQL("subjects", [allSubjects])
    ]);
    cy.visit("/author/subjects");
    cy.get("#subjects").children().should("have.length", 3);
    cy.get("#subject-0 #name").contains("Background");
    cy.get("#subject-0 #description").contains("These questions will ask general questions about your background that might be relevant to how people understand your career");
    cy.get("#subject-1 #name").contains("Repeat After Me");
    cy.get("#subject-1 #description").contains("These are miscellaneous phrases you'll be asked to repeat");
    cy.get("#subject-2 #name").contains("Leadership");
    cy.get("#subject-2 #description").contains("These questions will ask about being in a leadership role");
  });

  it("can go to edit subject page", () => {
    cySetup(cy);
    cyMockLogin(cy);
    cyInterceptGraphQL(cy, [
      cyMockGQL("login", login),
      cyMockGQL("mentor", mentor, true),
      cyMockGQL("subjects", [allSubjects]),
      cyMockGQL("subject", background),
    ]);
    cy.visit("/author/subjects");
    cy.get("#subject-0 #name a").trigger("mouseover").click();
    cy.location("pathname").should("contain", "/author/subject");
    cy.location("search").should("contain", "?id=background");
  })

  it("can delete a subject", () => {
    // not implemented
  });
});
