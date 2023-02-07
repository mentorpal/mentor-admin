/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useState } from "react";
import { makeStyles } from "tss-react/mui";
import {
  Add as AddIcon,
  ChangeHistory as ChangeHistoryIcon,
  NewReleases as NewReleasesIcon,
  Remove as RemoveIcon,
} from "@mui/icons-material";
import { EditType, ImportPreview } from "types";
import { equals } from "helpers";

const useStyles = makeStyles({ name: { ChangeIcon } })(() => ({
  icon: {
    marginLeft: 10,
    marginRight: 20,
  },
}));

export function ChangeIcon<T>(props: {
  preview: ImportPreview<T>;
}): JSX.Element {
  const [preview] = useState<ImportPreview<T>>(props.preview);
  const { classes } = useStyles();
  const editType = preview.editType;

  if (editType === EditType.CREATED) {
    return (
      <NewReleasesIcon
        data-cy="new-icon"
        className={classes.icon}
        style={{ color: "green" }}
      />
    );
  } else if (editType === EditType.ADDED) {
    return (
      <AddIcon
        data-cy="add-icon"
        className={classes.icon}
        style={{ color: "green" }}
      />
    );
  } else if (editType === EditType.REMOVED) {
    return (
      <RemoveIcon
        data-cy="remove-icon"
        className={classes.icon}
        style={{ color: "red" }}
      />
    );
  } else {
    return (
      <ChangeHistoryIcon
        data-cy="change-icon"
        className={classes.icon}
        style={{
          color: "orange",
          visibility:
            preview.importData &&
            preview.curData &&
            !equals(preview.importData, preview.curData)
              ? "visible"
              : "hidden",
        }}
      />
    );
  }
}
