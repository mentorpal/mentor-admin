import { cySetup } from "../support/functions";

describe("Select Subjects", () => {
  it("redirects to login page if the user is not logged in", () => {
    cySetup(cy);
    cy.visit("/subjects");
    cy.location("pathname").should("contain", "/login");
  });
});
