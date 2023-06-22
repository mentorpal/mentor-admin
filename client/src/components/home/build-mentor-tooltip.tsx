/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import { ColorTooltip, TooltipStep } from ".";
import React, { useEffect, useState } from "react";
import { IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

export function BuildMentorTooltip(props: {
  children: JSX.Element;
  hasSeenTooltips: boolean;
  idxTooltip: number;
  buildTooltipHovered: boolean;
  incrementTooltip: () => void;
}): JSX.Element {
  const {
    children,
    hasSeenTooltips,
    idxTooltip,
    buildTooltipHovered,
    incrementTooltip,
  } = props;
  const { getData } = useActiveMentor();
  enum BuildMentorTooltipPhases {
    VIEWING_INITIAL_TOOLTIPS = "VIEWING_INITIAL_TOOLTIPS",
    VIEWING_DIRTY_MENTOR_WARNING = "VIEWING_DIRTY_MENTOR_WARNING",
    VIEWING_TOOLTIP_ON_HOVER = "VIEWING_TOOLTIP_ON_HOVER",
  }
  const mentorIsDirty = getData((m) => m.data?.isDirty || false);
  const mentorNumAnswersComplete = getData(
    (m) => m.data?.numAnswersComplete || false
  );
  const [curPhase, setCurPhase] = useState<BuildMentorTooltipPhases>(
    BuildMentorTooltipPhases.VIEWING_TOOLTIP_ON_HOVER
  );
  const [open, setOpen] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [warnedMentorIsDirty, setWarnedMentorIsDirty] = useState(false);

  useEffect(() => {
    if (!hasSeenTooltips) {
      setCurPhase(BuildMentorTooltipPhases.VIEWING_INITIAL_TOOLTIPS);
    } else if (
      mentorIsDirty &&
      !warnedMentorIsDirty &&
      mentorNumAnswersComplete >= 5
    ) {
      setCurPhase(BuildMentorTooltipPhases.VIEWING_DIRTY_MENTOR_WARNING);
    } else {
      setCurPhase(BuildMentorTooltipPhases.VIEWING_TOOLTIP_ON_HOVER);
    }
  }, [hasSeenTooltips, mentorIsDirty, curPhase, warnedMentorIsDirty]);

  useEffect(() => {
    if (
      curPhase === BuildMentorTooltipPhases.VIEWING_INITIAL_TOOLTIPS &&
      idxTooltip == TooltipStep.BUILD
    ) {
      setDisplayText(
        "Build every time you change an answer so it is correct and build after you add a batch of questions."
      );
      setOpen(true);
    } else if (
      curPhase === BuildMentorTooltipPhases.VIEWING_DIRTY_MENTOR_WARNING
    ) {
      setDisplayText(
        "Your mentor is out of date. Once you are done recording, please re-train your mentor."
      );
      setOpen(true);
    } else {
      setDisplayText(
        "Build every time you change an answer so it is correct and build after you add a batch of questions."
      );
      setOpen(buildTooltipHovered);
    }
  }, [curPhase, buildTooltipHovered, idxTooltip]);

  return (
    <ColorTooltip
      data-cy="build-tooltip"
      open={open}
      onClose={() => {
        if (
          curPhase === BuildMentorTooltipPhases.VIEWING_DIRTY_MENTOR_WARNING
        ) {
          setWarnedMentorIsDirty(true);
        }
        incrementTooltip();
      }}
      disableHoverListener={!hasSeenTooltips}
      enterDelay={1500}
      arrow
      title={
        <React.Fragment>
          <IconButton
            data-cy="build-tooltip-close-btn"
            color="inherit"
            size="small"
            text-align="right"
            align-content="right"
            onClick={() => {
              if (
                curPhase ===
                BuildMentorTooltipPhases.VIEWING_DIRTY_MENTOR_WARNING
              ) {
                setWarnedMentorIsDirty(true);
              }
              incrementTooltip();
            }}
          >
            <CloseIcon />
          </IconButton>
          <Typography
            color="inherit"
            align="center"
            data-cy="build-tooltip-title"
          >
            Build
          </Typography>
          <p data-cy="build-tooltip-body" style={{ textAlign: "center" }}>
            {displayText}
          </p>
        </React.Fragment>
      }
      PopperProps={{
        style: { maxWidth: 250, textAlign: "right" },
      }}
    >
      {children}
    </ColorTooltip>
  );
}
