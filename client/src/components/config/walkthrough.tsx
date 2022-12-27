/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@material-ui/core";

import { Config } from "types"

export function Walkthrough(props: {
  config: Config;
  updateConfig: (c: Partial<Config>) => void;
}): JSX.Element {
  const { config, updateConfig } = props;
  return (
    <div>
      <TextField
        fullWidth
        data-cy="walkthroughTitle"
        data-test={config.walkthroughTitle}
        variant="outlined"
        label="Walkthrough Title"
        multiline={true}
        value={config.walkthroughTitle}
        onChange={(e) => updateConfig({ walkthroughTitle: e.target.value })}
        style={{ marginBottom: 20 }}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <TextField
        fullWidth
        data-cy="walkthroughUrl"
        data-test={config.walkthroughUrl}
        variant="outlined"
        label="Walkthrough Video Url"
        multiline={true}
        value={config.walkthroughUrl}
        onChange={(e) => updateConfig({ walkthroughUrl: e.target.value })}
        style={{ marginBottom: 20 }}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <FormControlLabel
        data-cy="walkthroughDisabled"
        data-test={config.walkthroughDisabled}
        control={
          <Checkbox
            checked={config.walkthroughDisabled}
            onChange={() =>
              updateConfig({
                walkthroughDisabled: !config.walkthroughDisabled,
              })
            }
            color="secondary"
          />
        }
        label="Disabled Walkthrough"
        style={{ justifySelf: "center" }}
      />
    </div>
  );
}