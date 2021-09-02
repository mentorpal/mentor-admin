/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { Card, CardContent, Grid } from "@material-ui/core";
import StageToast from "./stage-toast";
import { ErrorDialog, LoadingDialog } from "components/dialog";
import { UseMentorEdits } from "store/slices/mentor/useMentorEdits";
import useActiveMentor, {
  isActiveMentorLoading,
  isActiveMentorSaving,
} from "store/slices/mentor/useActiveMentor";

import "styles/layout.css";
import MentorThumbnail from "./top-mentor-card/mentor-thumbnail";
import MentorStatus from "./top-mentor-card/mentor-status";
import parseMentor, { defaultMentorInfo } from "./mentor-info";
import { useWithThumbnail } from "hooks/graphql/use-with-thumbnail";

export default function MyMentorCard(props: {
  editDisabled: boolean;
  continueAction: () => void;
  useMentor: UseMentorEdits;
}): JSX.Element {
  const mentorError = useActiveMentor((ms) => ms.error);
  const isMentorLoading = isActiveMentorLoading();
  const isMentorSaving = isActiveMentorSaving();
  const { editedMentor, editMentor } = props.useMentor;
  const mentorId = useActiveMentor((ms) => ms.data?._id || "");
  const [thumbnail, updateThumbnail] = useWithThumbnail();

  if (!mentorId || !editedMentor) {
    return <div />;
  }
  const mentorInfo = useActiveMentor((ms) =>
    ms.data ? parseMentor(ms.data) : defaultMentorInfo
  );
  const [open, setOpen] = React.useState<boolean>(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
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
                editDisabled={props.editDisabled}
                open={open}
                thumbnail={thumbnail}
                updateThumbnail={updateThumbnail}
              />
            </Grid>
            <Grid item xs={8}>
              <MentorStatus
                continueAction={props.continueAction}
                updateThumbnail={updateThumbnail}
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
