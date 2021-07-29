/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/// <reference types="cypress" />

/**
 * @type {Cypress.PluginConfig}
 */
const {
  addMatchImageSnapshotPlugin,
} = require("cypress-image-snapshot/plugin");

const path = require("path");
const fs = require("fs");
const downloadDirectory = path.join(__dirname, "..", "downloads");
const findFile = (filename) => {
  const FileName = `${downloadDirectory}/${filename}`;
  const contents = fs.existsSync(FileName);
  return contents;
};
const hasFile = (filename, ms) => {
  const delay = 10;
  return new Promise((resolve, reject) => {
    if (ms < 0) {
      return reject(
        new Error(`Could not find ${downloadDirectory}/${filename}`)
      );
    }
    const found = findFile(filename);
    if (found) {
      return resolve(true);
    }
    setTimeout(() => {
      hasFile(filename, ms - delay).then(resolve, reject);
    }, 10);
  });
};

module.exports = (on, config) => {
  addMatchImageSnapshotPlugin(on, config);
  require("@cypress/code-coverage/task")(on, config);
  on("before:browser:launch", (browser, options) => {
    if (browser.family === "chromium") {
      options.preferences.default["download"] = {
        default_directory: downloadDirectory,
      };
      return options;
    }
    if (browser.family === "firefox") {
      options.preferences["browser.download.dir"] = downloadDirectory;
      options.preferences["browser.download.folderList"] = 2;
      options.preferences["browser.helperApps.neverAsk.saveToDisk"] =
        "text/csv";
      return options;
    }
  });
  on("task", {
    isExistFile(filename, ms = 4000) {
      console.log(`looking for file in ${downloadDirectory}`, filename, ms);
      return hasFile(filename, ms);
    },
  });
  return config;
};
