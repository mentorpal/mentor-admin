/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

import "cypress-fill-command";
import "cypress-localstorage-commands";
import "cypress-file-upload";
import { addMatchImageSnapshotCommand } from "cypress-image-snapshot/command";

addMatchImageSnapshotCommand({
  customDiffDir: Cypress.env("CYPRESS_SNAPSHOT_DIFF_DIR"),
  comparisonMethod: "ssim",
  failureThreshold: 0.01,
  failureThresholdType: "percent",
});

// recursively gets an element, returning only after it's determined to be attached to the DOM for good
Cypress.Commands.add("getSettled", (selector, opts = {}) => {
  const retries = opts.retries || 3;
  const delay = opts.delay || 100;

  const isAttached = (resolve, count = 0) => {
    try {
      var el = Cypress.$(selector) as JQuery<HTMLElement>;

      // is element attached to the DOM?
      count = Cypress.dom.isAttached(el) ? count + 1 : 0;

      // hit our base case, return the element
      if (count >= retries) {
        return resolve(el);
      }

      // retry after a bit of a delay
      setTimeout(() => isAttached(resolve, count), delay);
    } catch (e) {
      throw new Error(e);
    }
  };

  // wrap, so we can chain cypress commands off the result
  return cy.wrap(null).then(() => {
    return new Cypress.Promise((resolve) => {
      return isAttached(resolve, 0);
    })
      .then((el) => {
        return cy.wrap(el);
      })
      .catch((err) => {
        throw new Error(`Failed to resolve isAttached: ${JSON.stringify(err)}`);
      });
  });
});
