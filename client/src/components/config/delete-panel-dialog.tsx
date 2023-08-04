/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Tooltip,
} from "@mui/material";
import { MentorPanel, Organization } from "types";

export function DeletePanelDialog(props: {
  closeDialog: () => void;
  mpToDelete?: MentorPanel;
  organizationsUsing: Organization[];
  deleteMentorPanel: (id: string) => void;
}): JSX.Element {
  const { closeDialog, mpToDelete, organizationsUsing, deleteMentorPanel } =
    props;

  if (!mpToDelete) {
    return <></>;
  }

  return (
    <Dialog
      data-cy="two-option-dialog"
      maxWidth="sm"
      fullWidth={true}
      open={Boolean(mpToDelete)}
    >
      <DialogTitle
        sx={{ fontWeight: "bold" }}
      >{`Deleting: ${mpToDelete.title}`}</DialogTitle>
      <DialogContent>
        <span>{"Are you sure you want to delete this panel?"}</span>
        <br />
        <br />
        {organizationsUsing.length > 0 && (
          <span>
            <Tooltip
              title={
                <>
                  {organizationsUsing.map((o) => {
                    return <div key={o._id}>{o.name}</div>;
                  })}
                </>
              }
            >
              <span
                style={{
                  color: "grey",
                  margin: "10px",
                  padding: "10px",
                  cursor: "default",
                }}
              >
                Used by {organizationsUsing.length} organizations.
              </span>
            </Tooltip>
            <br />
            <br />
          </span>
        )}

        <Button
          data-cy="option-1"
          onClick={() => {
            deleteMentorPanel(mpToDelete._id);
            closeDialog();
          }}
        >
          {"Yes"}
        </Button>
        <Button
          data-cy="option-2"
          onClick={() => {
            closeDialog();
          }}
        >
          {"No"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
