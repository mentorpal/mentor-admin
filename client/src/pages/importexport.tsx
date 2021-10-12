/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import NavBar from "components/nav-bar";
import ImportView from "components/import-export/import-view";
import { useWithImportExport } from "hooks/graphql/use-with-import-export";
import withAuthorizationOnly from "hooks/wrap-with-authorization-only";
import useActiveMentor from "store/slices/mentor/useActiveMentor";

const useStyles = makeStyles(() => ({
  root: {
    width: "100%",
    height: "100%",
  },
}));

function ImportPage(): JSX.Element {
  const classes = useStyles();
  const useImportExport = useWithImportExport();
  const { getData } = useActiveMentor();

  const mentorId = getData((state) => state.data?._id);
  const mentorAnswers = getData((state) => state.data?.answers);

  if (!mentorId || !mentorAnswers) {
    return <div />;
  }
  const needsTransfer = mentorAnswers.some((a) => a.hasUntransferredMedia);
  return (
    <div className={classes.root}>
      <NavBar title="Export Mentor" mentorId={mentorId} />
      <ImportView useImportExport={useImportExport} />
      <div style={{ padding: 10 }}>
        <Button
          data-cy="download-mentor"
          color="primary"
          variant="contained"
          onClick={useImportExport.onMentorExported}
          style={{ marginRight: 10 }}
        >
          Export
        </Button>
        <Button color="primary" variant="outlined" component="label">
          Import
          <input
            data-cy="upload-mentor"
            type="file"
            accept="text/json"
            hidden
            onChange={(e) => {
              e.target.files instanceof FileList
                ? useImportExport.onMentorUploaded(e.target.files[0])
                : undefined;
            }}
          />
        </Button>
        {needsTransfer ? (
          <Button
            data-cy="transfer-media"
            variant="contained"
            onClick={useImportExport.onTransferMedia}
            style={{ marginLeft: 10 }}
          >
            Transfer Answers
          </Button>
        ) : undefined}
      </div>
    </div>
  );
}

export default withAuthorizationOnly(ImportPage);
