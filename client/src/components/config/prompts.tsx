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
  SelectChangeEvent,
  TextField,
} from "@mui/material";

import { Config, DisplaySurveyPopupCondition } from "types";
import { getEnumValues } from "helpers";

export function Prompts(props: {
  config: Config;
  updateConfig: (c: Partial<Config>) => void;
}): JSX.Element {
  const { config, updateConfig } = props;
  return (
    <div>
      <TextField
        fullWidth
        data-cy="disclaimerTitle"
        data-test={config.disclaimerTitle}
        variant="outlined"
        label="Disclaimer Title"
        helperText="Shows at the top of your privacy policy dialogue"
        multiline={true}
        value={config.disclaimerTitle}
        onChange={(e) => updateConfig({ disclaimerTitle: e.target.value })}
        style={{ marginBottom: 20 }}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <TextField
        fullWidth
        data-cy="disclaimerText"
        data-test={config.disclaimerText}
        variant="outlined"
        label="Disclaimer Text"
        helperText="Shows your privacy policy. Accepts Markup Text Language."
        multiline={true}
        value={config.disclaimerText}
        onChange={(e) => updateConfig({ disclaimerText: e.target.value })}
        style={{ marginBottom: 20 }}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <FormControlLabel
        data-cy="disclaimerDisabled"
        data-test={config.disclaimerDisabled}
        control={
          <Checkbox
            checked={config.disclaimerDisabled}
            onChange={() =>
              updateConfig({
                disclaimerDisabled: !config.disclaimerDisabled,
              })
            }
            color="secondary"
          />
        }
        label="Disable Disclaimer Popup"
        style={{ justifySelf: "center" }}
      />
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
        helperText="Shows the first time someone visits your home page."
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
          onChange={(event: SelectChangeEvent<string>) =>
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
      <FormControl fullWidth>
        <InputLabel>Display Survey Popup Condition</InputLabel>
        <Select
          data-cy="display-survey-condition"
          label="Display Survey Popup Condition"
          value={
            config.displaySurveyPopupCondition ||
            DisplaySurveyPopupCondition.USER_ID
          }
          style={{ width: 300, marginRight: 20 }}
          onChange={(event: SelectChangeEvent<string>) => {
            updateConfig({
              displaySurveyPopupCondition: event.target
                .value as DisplaySurveyPopupCondition,
            });
          }}
        >
          {getEnumValues(DisplaySurveyPopupCondition).map((condition) => {
            return (
              <MenuItem key={condition} value={condition}>
                {condition}
              </MenuItem>
            );
          })}
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
        data-cy="urlVideoMentorpalWalkthrough"
        data-test={config.urlVideoMentorpalWalkthrough}
        variant="outlined"
        label="Walkthrough Video Url"
        multiline={true}
        value={config.urlVideoMentorpalWalkthrough}
        onChange={(e) =>
          updateConfig({ urlVideoMentorpalWalkthrough: e.target.value })
        }
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
      <TextField
        fullWidth
        data-cy="postSurveyLink"
        data-test={config.postSurveyLink}
        variant="outlined"
        label="Post Survey Link"
        multiline={true}
        value={config.postSurveyLink}
        onChange={(e) => updateConfig({ postSurveyLink: e.target.value })}
        style={{ marginBottom: 20 }}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <TextField
        fullWidth
        data-cy="postSurveyTimer"
        data-test={config.postSurveyTimer}
        variant="outlined"
        label="Post Survey Timer (seconds)"
        value={config.postSurveyTimer}
        onChange={(e) =>
          updateConfig({ postSurveyTimer: Number(e.target.value) || 0 })
        }
        style={{ marginBottom: 20 }}
        inputProps={{ inputMode: "numeric", pattern: "[0-9]+" }}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <FormControlLabel
        data-cy="postSurveyUserIdEnabled"
        data-test={config.postSurveyUserIdEnabled}
        control={
          <Checkbox
            checked={config.postSurveyUserIdEnabled}
            onChange={() =>
              updateConfig({
                postSurveyUserIdEnabled: !config.postSurveyUserIdEnabled,
              })
            }
            color="secondary"
          />
        }
        label="Post Survey Send User ID"
        style={{ justifySelf: "center" }}
      />
      <FormControlLabel
        data-cy="postSurveyReferrerEnabled"
        data-test={config.postSurveyReferrerEnabled}
        control={
          <Checkbox
            checked={config.postSurveyReferrerEnabled}
            onChange={() =>
              updateConfig({
                postSurveyReferrerEnabled: !config.postSurveyReferrerEnabled,
              })
            }
            color="secondary"
          />
        }
        label="Post Survey Send Referrer"
        style={{ justifySelf: "center" }}
      />
    </div>
  );
}
