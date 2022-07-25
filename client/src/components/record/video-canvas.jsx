/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState, useRef } from "react";
import videojs from "video.js";

// Get the Component base class from Video.js
const Component = videojs.getComponent("Component");

class VideoCanvas extends Component {
  // The constructor of a component receives two arguments: the
  // player it will be associated with and an object of options.
  constructor(player, options = {}) {
    // It is important to invoke the superclass before anything else,
    // to get all the features of components out of the box!
    super(player, options);

    // If a `text` option was passed in, update the text content of
    // the component.
    if (options.text) {
      this.updateTextContent(options.text);
    }
  }

  // The `createEl` function of a component creates its DOM element.
  createEl() {
    return videojs.dom.createEl("div", {
      // Prefixing classes of elements within a player with "vjs-"
      // is a convention used in Video.js.
      className: "vjs-title-bar",
    });
  }

  // This function could be called at any time to update the text
  // contents of the component.
  updateTextContent(text) {
    // If no text was provided, default to "Title Unknown"
    if (typeof text !== "string") {
      text = "Title Unknown";
    }

    // Use Video.js utility DOM methods to manipulate the content
    // of the component's element.
    videojs.emptyEl(this.el());
    videojs.appendContent(this.el(), text);
  }
}

export default VideoCanvas;
