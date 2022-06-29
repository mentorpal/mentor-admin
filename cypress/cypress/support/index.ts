/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "cypress-fill-command";
import "cypress-localstorage-commands";
import "cypress-file-upload";
import "./commands";

// Alternatively you can use CommonJS syntax:
// require('./commands')

Cypress.Commands.add("getSettled", (selector, opts = {}) => {
  const retries = opts.retries || 3;
  const delay = opts.delay || 100;

  const isAttached = (resolve, count = 0) => {
    var el = Cypress.$(selector) as JQuery<HTMLElement>;

    // is element attached to the DOM?
    count = Cypress.dom.isAttached(el) ? count + 1 : 0;

    // hit our base case, return the element
    if (count >= retries) {
      return resolve(el);
    }

    // retry after a bit of a delay
    setTimeout(() => isAttached(resolve, count), delay);
  };

  // wrap, so we can chain cypress commands off the result
  return cy.wrap(null).then(() => {
    return new Cypress.Promise((resolve) => {
      return isAttached(resolve, 0);
    }).then((el) => {
      return cy.wrap(el);
    });
  });
});

declare global {
  namespace Cypress {
    interface Chainable<Subject = any> {
      matchImageSnapshot(value: string): Chainable<void>;
      fill(value: string): Chainable<void>;
    }
    interface cy extends Chainable<undefined> {}
  }
}
