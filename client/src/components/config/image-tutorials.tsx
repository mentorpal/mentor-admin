/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useState } from "react";
import { Dialog, IconButton, Typography } from "@material-ui/core";
import { ArrowBack, ArrowForward } from "@material-ui/icons";
import img1 from "images/Home_Markup_1.png";
import img2 from "images/Home_Markup_2.png";
import img3 from "images/Home_Markup_3.png";
import img4 from "images/Home_Markup_4.png";
import img5 from "images/Home_Markup_5.png";
import img6 from "images/Home_Markup_6.png";
import { useWithWindowSize } from "hooks/use-with-window-size";

interface ImageTutorial {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  image: any;
}

export function ImageTutorials(props: { text: string }): JSX.Element {
  const [tutorials, setTutorials] = useState<ImageTutorial[]>([]);
  const [openImg, setOpenImg] = useState<number>();
  const { height } = useWithWindowSize();

  useEffect(() => {
    if (tutorials.length === 0) {
      const t = [];
      t.push({ image: img1 });
      t.push({ image: img2 });
      t.push({ image: img3 });
      t.push({ image: img4 });
      t.push({ image: img5 });
      t.push({ image: img6 });
      setTutorials(t);
    }
  }, []);

  return (
    <div>
      <Typography>{props.text}</Typography>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {tutorials.map((t, i) => {
          return (
            <div
              key={`tutorial-${i}`}
              data-cy={`tutorial-${i}`}
              onClick={() => setOpenImg(i)}
              style={{
                width: 50,
                height: 50,
                backgroundImage: `url(${t.image})`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "contain",
                marginRight: 10,
              }}
            />
          );
        })}
      </div>
      <Typography variant="subtitle1">
        Click images to see more details.
      </Typography>
      {openImg === undefined ? undefined : (
        <Dialog maxWidth="xl" open={true} onClose={() => setOpenImg(undefined)}>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <IconButton
              onClick={() =>
                setOpenImg(openImg === 0 ? tutorials.length - 1 : openImg - 1)
              }
            >
              <ArrowBack />
            </IconButton>
            <img src={tutorials[openImg].image} height={height - 100} />
            <IconButton
              onClick={() => setOpenImg((openImg + 1) % tutorials.length)}
            >
              <ArrowForward />
            </IconButton>
          </div>
        </Dialog>
      )}
    </div>
  );
}
