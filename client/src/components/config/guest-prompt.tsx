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

export function GuestPrompt(props: {
  config: Config;
  updateConfig: (c: Partial<Config>) => void;
}): JSX.Element {
  const { config, updateConfig } = props;
  return (
    <div>
      <TextField
        fullWidth
        data-cy="guestPromptTitle"
        data-test={config.guestPromptTitle}
        variant="outlined"
        label="Guest Prompt Title"
        multiline={true}
        value={config.guestPromptTitle}
        onChange={(e) => updateConfig({ guestPromptTitle: e.target.value })}
        style={{ marginBottom: 20 }}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <TextField
        fullWidth
        data-cy="guestPromptText"
        data-test={config.guestPromptText}
        variant="outlined"
        label="Guest Prompt Text"
        multiline={true}
        value={config.guestPromptText}
        onChange={(e) => updateConfig({ guestPromptText: e.target.value })}
        style={{ marginBottom: 20 }}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <FormControl fullWidth>
        <InputLabel>Guest Prompt Input Type</InputLabel>
        <Select
          data-cy="guestPromptInputType"
          label="Guest Prompt Input Type"
          value={config.guestPromptInputType || "Email"}
          style={{ width: 300, marginRight: 20 }}
          onChange={(
            event: React.ChangeEvent<{ value: unknown; name?: unknown }>
          ) =>
            updateConfig({
              guestPromptInputType: event.target.value as string,
            })
          }
        >
          <MenuItem data-cy="question-type" value="Email">
            Email
              </MenuItem>
          <MenuItem data-cy="utterance-type" value="Text">
            Text
              </MenuItem>
        </Select>
      </FormControl>
      <FormControlLabel
        data-cy="displayGuestPrompt"
        data-test={config.displayGuestPrompt}
        control={
          <Checkbox
            checked={config.displayGuestPrompt}
            onChange={() =>
              updateConfig({
                displayGuestPrompt: !config.displayGuestPrompt,
              })
            }
            color="secondary"
          />
        }
        label="Display Guest Prompt"
        style={{ justifySelf: "center" }}
      />
    </div>
  );
}