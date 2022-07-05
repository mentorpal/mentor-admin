/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import ml5 from "ml5";
import p5 from "p5";

function createCanvas(arg0: number, arg1: number): React.ReactNode {
  throw new Error("Function not implemented from: " + arg0 + " and " + arg1);
}

function background(arg0: number): React.ReactNode {
  throw new Error("Function not implemented from: " + arg0);
}

const ML5JS = () => {
  return (
    <html lang="en">
      <body>
        <script>
          console.log("ml5 version:", ml5.version); function setup(){" "}
          {createCanvas(400, 400)}
          function draw() {background(200)}
        </script>
      </body>
    </html>
  );
};

export default ML5JS;
