/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from "@material-ui/core";
import { HelpOutline } from "@material-ui/icons";
import img1 from "images/Home_Markup_1.png";
import img2 from "images/Home_Markup_2.png";
import img3 from "images/Home_Markup_3.png";
import img4 from "images/Home_Markup_4.png";
import img5 from "images/Home_Markup_5.png";
import img6 from "images/Home_Markup_6.png";
import { useWithWindowSize } from "hooks/use-with-window-size";

export function ImageTutorials(): JSX.Element {
  const [openImg, setOpenImg] = useState<number>();
  const { height } = useWithWindowSize();
  const images = [img1, img2, img3, img4, img5, img6];
  const text = [
    "Featured mentors and mentor panels will appear in the banner at the top. Active mentors and mentor panels will be appear in the list below. These can be selected in the Featured Mentors and Featured Mentor Panels tabs. The order that Active mentors and mentor panels appear in the home page can be changed by dragging and ordering mentors and mentor panels in the Featured Mentors and Featured Mentor Panels tabs. The Featured mentor and mentor panel that appears in the banner is random. At least one featured mentor or mentor panel must be selected for the Home Banner to appear.",
    "The Home Banner displayed a random featured mentor and mentor panel. Home banner color will change the card background. Home banner button color will change the button color within the card. At least one featured mentor or mentor panel must be selected for the Home Banner to appear.",
    "The walkthrough popup opens through the Walkthrough button at the top. This button can be hidden by disabling walkthrough in the Prompts tab. The walkthrough video can be linked to in the Prompts tab.",
    "The disclaimer popup opens through the Info button at the top. This button can be hidden by disabling Disclaimer Popup in the Prompts tab. The Disclaimer accepts markup.",
    "The mentor panel selection popup opens through the Build Mentor Panel button below the Home Banner. Only Active mentors appear here. They can be selected through the Featured Mentors tab. Mentors can be sorted with the Featured Keyword Types. These can be selected in the Other tab. Mentors can also be filtered by Featured Subjects. These can be selected in the Other tab. If no Featured Subjects are selected, all subjects will appear.",
    "The guest prompt popup opens the first time a user visits your home page. The text, title, and type of input that is accepted can be set through the Prompts tab.",
  ];

  return (
    <div>
      <IconButton onClick={() => setOpenImg(0)}>
        <HelpOutline />
      </IconButton>
      {openImg === undefined ? undefined : (
        <Dialog maxWidth="xl" open={true} onClose={() => setOpenImg(undefined)}>
          <DialogTitle>
            These settings will customize the look and feel of your home page
            and the content that appears.
          </DialogTitle>
          <DialogContent>
            <img src={images[openImg]} height={height - 150} />
          </DialogContent>
          <DialogContentText style={{ paddingLeft: 20, paddingRight: 20 }}>
            {text[openImg]}
          </DialogContentText>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              marginBottom: 10,
            }}
          >
            {images.map((t, i) => {
              return (
                <img
                  width={50}
                  src={t}
                  key={`tutorial-${i}`}
                  data-cy={`tutorial-${i}`}
                  onClick={() => setOpenImg(i)}
                  style={{
                    marginRight: 10,
                    borderStyle: "solid",
                    borderWidth: openImg === i ? 5 : 0,
                    borderColor: "orange",
                  }}
                />
              );
            })}
          </div>
        </Dialog>
      )}
    </div>
  );
}
