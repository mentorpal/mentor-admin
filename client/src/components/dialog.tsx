/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  DialogContentText,
  Button,
} from "@material-ui/core";
import { LoadingError } from "hooks/graphql/loading-reducer";

export function ErrorDialog(props: {
  error: LoadingError | undefined;
  clearError?: () => void;
}): JSX.Element {
  const { error, clearError } = props;
  const [open, setOpen] = useState<boolean>(true);
  useEffect(() => {
    if (error && !open) setOpen(true);
  }, [error]);
  return (
    <Dialog
      data-cy="error-dialog"
      maxWidth="sm"
      fullWidth={true}
      open={error !== undefined && open}
      onClose={clearError}
    >
      <DialogTitle>{error?.message}</DialogTitle>
      <DialogContent>
        <DialogContentText>{error?.error}</DialogContentText>
      </DialogContent>
      <DialogContent>
        <Button
          onClick={() => {
            setOpen(false);
          }}
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}

export function LoadingDialog(props: { title: string }): JSX.Element {
  const { title } = props;
  return (
    <Dialog
      data-cy="loading-dialog"
      maxWidth="sm"
      fullWidth={true}
      open={Boolean(title)}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <CircularProgress />
      </DialogContent>
    </Dialog>
  );
}
