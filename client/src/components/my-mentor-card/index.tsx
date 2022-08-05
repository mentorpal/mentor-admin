/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { Card, CardContent, Grid } from "@material-ui/core";
import StageToast from "./stage-toast";
import { ErrorDialog, LoadingDialog } from "components/dialog";
import useActiveMentor from "store/slices/mentor/useActiveMentor";

import "styles/layout.css";
import MentorThumbnail from "./top-mentor-card/mentor-thumbnail";
import MentorStatus from "./top-mentor-card/mentor-status";
import parseMentor, { defaultMentorInfo } from "./mentor-info";
import { useWithThumbnail } from "hooks/graphql/use-with-thumbnail";
import { Mentor } from "types";

function MyMentorCard(props: {
  continueAction: () => void;
  incrementTooltip: () => void;
  idxTooltip: number;
  hasSeenTooltips: boolean;
  localHasSeenTooltips: boolean;
  editedMentor?: Mentor;
  editMentor: (edits: Partial<Mentor>) => void;
  saveMentorDetails: () => void;
}): JSX.Element {
  const {
    error: mentorError,
    isLoading: isMentorLoading,
    isSaving: isMentorSaving,
    getData,
  } = useActiveMentor();
  const { editedMentor, editMentor, saveMentorDetails } = props;
  const mentorId = getData((ms) => ms.data?._id || "");
  const [thumbnail, updateThumbnail] = useWithThumbnail();

  if (!mentorId || !editedMentor) {
    return <div />;
  }
  const mentorInfo = getData((ms) =>
    ms.data ? parseMentor(ms.data) : defaultMentorInfo
  );
  const [open, setOpen] = React.useState<boolean>(false);
  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    saveMentorDetails();
  };

  return (
    <div style={{ marginTop: 2, flexGrow: 1, marginLeft: 25, marginRight: 25 }}>
      <Card data-cy="my-mentor-card">
        <CardContent>
          {/* card-container */}
          <Grid container spacing={3}>
            <Grid item xs={4}>
              <MentorThumbnail
                handleOpen={handleOpen}
                editedMentor={editedMentor}
                handleClose={handleClose}
                editMentor={editMentor}
                open={open}
                incrementTooltip={props.incrementTooltip}
                idxTooltip={props.idxTooltip}
                thumbnail={thumbnail}
                updateThumbnail={updateThumbnail}
                hasSeenTooltips={props.hasSeenTooltips}
              />
            </Grid>
            <Grid item xs={8}>
              <MentorStatus
                continueAction={props.continueAction}
                updateThumbnail={updateThumbnail}
                incrementTooltip={props.incrementTooltip}
                idxTooltip={props.idxTooltip}
                localHasSeenTooltips={props.localHasSeenTooltips}
                hasSeenTooltips={props.hasSeenTooltips}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <StageToast
        value={mentorInfo.value}
        floor={mentorInfo.currentStage.floor}
        name={mentorInfo.currentStage.name}
      />
      <LoadingDialog
        title={isMentorLoading ? "Loading" : isMentorSaving ? "Saving" : ""}
      />
      <ErrorDialog error={mentorError} />
    </div>
  );
}

export default React.memo(MyMentorCard);
