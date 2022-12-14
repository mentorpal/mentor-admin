/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useState } from "react";
import { SketchPicker } from "react-color";
import {
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  makeStyles,
  MenuItem,
  Select,
  Tab,
  TextField,
  Typography,
} from "@material-ui/core";
import { Autocomplete, TabContext, TabList, TabPanel } from "@material-ui/lab";

import NavBar from "components/nav-bar";
import { ErrorDialog, LoadingDialog } from "components/dialog";
import { MentorList } from "components/config/mentor-list";
import { canEditContent } from "helpers";
import { useWithConfigEdits } from "hooks/graphql/use-with-config";
import { useWithWindowSize } from "hooks/use-with-window-size";
import withAuthorizationOnly from "hooks/wrap-with-authorization-only";
import { useWithSubjects } from "hooks/graphql/use-with-subjects";
import { useWithKeywords } from "hooks/graphql/use-with-keywords";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import { Config, Keyword, User } from "types";
import { SubjectGQL } from "types-gql";
import withLocation from "wrap-with-location";
import { MentorPanelList } from "components/config/mentor-panel-list";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    margin: 0,
  },
  progress: {
    position: "fixed",
    top: "50%",
    left: "50%",
  },
  button: {
    width: 200,
    padding: 5,
    margin: theme.spacing(2),
  },
  tab: {
    width: "95%",
  },
  list: {
    background: "#F5F5F5",
  },
  expand: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: "rotate(180deg)",
  },
  thumbnail: {
    boxSizing: "border-box",
    height: 56,
    padding: 5,
  },
}));

function HeaderStyle(props: {
  styles: Record<string, string>;
  config: Config;
  updateConfig: (c: Partial<Config>) => void;
}): JSX.Element {
  const { styles, config, updateConfig } = props;
  return (
    <div>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <TextField
          fullWidth
          data-cy="styleHeaderLogo"
          data-test={config.styleHeaderLogo}
          variant="outlined"
          label="Header Logo"
          value={config.styleHeaderLogo}
          onChange={(e) => updateConfig({ styleHeaderLogo: e.target.value })}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <img
          data-cy="image-thumbnail"
          className={styles.thumbnail}
          src={config.styleHeaderLogo}
          onClick={() => {
            window.open(config.styleHeaderLogo || "", "_blank");
          }}
        />
      </div>
      <TextField
        fullWidth
        data-cy="styleHeaderTitle"
        data-test={config.styleHeaderTitle}
        variant="outlined"
        label="Header Title"
        value={config.styleHeaderTitle}
        onChange={(e) => updateConfig({ styleHeaderTitle: e.target.value })}
        style={{ marginTop: 20 }}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <TextField
        fullWidth
        data-cy="styleHeaderText"
        data-test={config.styleHeaderText}
        variant="outlined"
        label="Header Text"
        value={config.styleHeaderText}
        onChange={(e) => updateConfig({ styleHeaderText: e.target.value })}
        style={{ marginTop: 20 }}
        InputLabelProps={{
          shrink: true,
        }}
      />
      <Typography
        variant="subtitle1"
        data-cy="styleHeaderTextColor"
        data-test={config.styleHeaderTextColor}
        style={{ marginTop: 20, textAlign: "start" }}
      >
        Header Text Color: {config.styleHeaderTextColor}
      </Typography>
      <SketchPicker
        color={config.styleHeaderTextColor}
        onChangeComplete={(color: { hex: string }) =>
          updateConfig({ styleHeaderTextColor: color.hex })
        }
      />
      <Typography
        variant="subtitle1"
        data-cy="styleHeaderColor"
        data-test={config.styleHeaderColor}
        style={{ marginTop: 20, textAlign: "start" }}
      >
        Header Color: {config.styleHeaderColor}
      </Typography>
      <SketchPicker
        color={config.styleHeaderColor}
        onChangeComplete={(color: { hex: string }) =>
          updateConfig({ styleHeaderColor: color.hex })
        }
      />
    </div>
  );
}

function Disclaimer(props: {
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
    </div>
  );
}

function GuestPrompt(props: {
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

function Settings(props: {
  config: Config;
  keywords: Keyword[];
  subjects: SubjectGQL[];
  updateConfig: (c: Partial<Config>) => void;
}): JSX.Element {
  const featuredSubjects = props.subjects.filter((s) =>
    props.config.featuredSubjects?.includes(s._id)
  );
  const defaultSubject = props.subjects.find(
    (s) => props.config.defaultSubject === s._id
  );

  return (
    <div>
      <Autocomplete
        data-cy="keyword-input"
        multiple
        value={props.config.featuredKeywordTypes}
        options={
          props.keywords
            ?.map((k) => k.type)
            ?.filter((v, i, a) => a.indexOf(v) === i) || []
        }
        getOptionLabel={(option: string) => option}
        onChange={(e, v) => props.updateConfig({ featuredKeywordTypes: v })}
        renderTags={(value: readonly string[], getTagProps) =>
          value.map((option: string, index: number) => (
            <Chip
              key={`keyword-${option}`}
              data-cy={`keyword-${option}`}
              variant="default"
              label={option}
              {...getTagProps({ index })}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder="Featured Keyword Types"
          />
        )}
        renderOption={(option) => (
          <Typography align="left" data-cy={`keyword-option-${option}`}>
            {option}
          </Typography>
        )}
        style={{ width: "100%", marginBottom: 10 }}
      />
      <Autocomplete
        data-cy="subject-input"
        multiple
        value={featuredSubjects}
        options={props.subjects}
        getOptionLabel={(option: SubjectGQL) => option.name}
        onChange={(e, v) =>
          props.updateConfig({ featuredSubjects: v.map((s) => s._id) })
        }
        renderTags={(value: readonly SubjectGQL[], getTagProps) =>
          value.map((option: SubjectGQL, index: number) => (
            <Chip
              key={`subject-${option._id}`}
              data-cy={`subject-${option._id}`}
              variant="default"
              label={option.name}
              {...getTagProps({ index })}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder="Featured Subjects"
          />
        )}
        renderOption={(option) => (
          <Typography align="left" data-cy={`subject-option-${option._id}`}>
            {option.name}
          </Typography>
        )}
        style={{ width: "100%", marginBottom: 10 }}
      />
      <Autocomplete
        data-cy="default-subject-input"
        value={defaultSubject}
        options={featuredSubjects}
        getOptionLabel={(option: SubjectGQL) => option.name}
        onChange={(e, v) =>
          props.updateConfig({ defaultSubject: v?._id || undefined })
        }
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            placeholder="Default Subject"
          />
        )}
        renderOption={(option) => (
          <Typography
            align="left"
            data-cy={`default-subject-option-${option._id}`}
          >
            {option.name}
          </Typography>
        )}
        style={{ width: "100%", marginBottom: 10 }}
      />
    </div>
  );
}

function ConfigPage(props: { accessToken: string; user: User }): JSX.Element {
  const styles = useStyles();
  const {
    org,
    orgs,
    config,
    mentors,
    mentorPanels,
    error,
    isLoading,
    isSaving,
    saveConfig,
    editConfig,
    moveMentor,
    moveMentorPanel,
    toggleActiveMentor,
    toggleFeaturedMentor,
    toggleFeaturedMentorPanel,
    toggleActiveMentorPanel,
    setOrganization,
    saveMentorPanel,
  } = useWithConfigEdits(props.accessToken, props.user);
  const { switchActiveMentor } = useActiveMentor();
  const { data: keywords } = useWithKeywords();
  const { data: subjects } = useWithSubjects();
  const { height } = useWithWindowSize();
  const [tab, setTab] = useState<string>("featured-mentors");

  useEffect(() => {
    switchActiveMentor();
  }, []);

  if (isLoading) {
    return (
      <div className={styles.root}>
        <CircularProgress className={styles.progress} />
      </div>
    );
  }
  if (!config) {
    return (
      <div>You must be an admin or content manager to view this page.</div>
    );
  }

  return (
    <div className={styles.root}>
      <NavBar title={`Manage${org ? ` ${org.name} ` : " "}Config`} />
      <TabContext value={tab}>
        <TabList onChange={(_event, newValue) => setTab(newValue)}>
          <Tab
            label="Featured Mentors"
            value="featured-mentors"
            data-cy="toggle-featured-mentors"
          />
          <Tab
            label="Featured Mentor Panels"
            value="featured-mentor-panels"
            data-cy="toggle-featured-mentor-panels"
          />
          <Tab
            label="Home Styles"
            value="header-style"
            data-cy="toggle-header-style"
          />
          <Tab
            label="Home Disclaimer"
            value="disclaimer"
            data-cy="toggle-disclaimer"
          />
          <Tab
            label="Home Guest Prompt"
            value="guest-prompt"
            data-cy="toggle-guest-prompt"
          />
          <Tab label="Other" value="settings" data-cy="toggle-settings" />
        </TabList>
        <TabPanel
          className={styles.tab}
          style={{ height: height - 250, overflow: "auto" }}
          value="featured-mentors"
        >
          <MentorList
            config={config}
            mentors={mentors}
            move={moveMentor}
            toggleActive={toggleActiveMentor}
            toggleFeatured={toggleFeaturedMentor}
          />
        </TabPanel>
        <TabPanel
          className={styles.tab}
          style={{ height: height - 250, overflow: "auto" }}
          value="featured-mentor-panels"
        >
          <MentorPanelList
            config={config}
            org={org}
            mentors={mentors}
            mentorPanels={mentorPanels}
            organizations={orgs}
            subjects={subjects?.edges.map((s) => s.node) || []}
            move={moveMentorPanel}
            toggleFeatured={toggleFeaturedMentorPanel}
            toggleActive={toggleActiveMentorPanel}
            saveMentorPanel={saveMentorPanel}
          />
        </TabPanel>
        <TabPanel
          className={styles.tab}
          style={{ height: height - 250, overflow: "auto" }}
          value="header-style"
        >
          <HeaderStyle
            styles={styles}
            config={config}
            updateConfig={editConfig}
          />
        </TabPanel>
        <TabPanel
          className={styles.tab}
          style={{ height: height - 250, overflow: "auto" }}
          value="disclaimer"
        >
          <Disclaimer config={config} updateConfig={editConfig} />
        </TabPanel>
        <TabPanel
          className={styles.tab}
          style={{ height: height - 250, overflow: "auto" }}
          value="guest-prompt"
        >
          <GuestPrompt config={config} updateConfig={editConfig} />
        </TabPanel>
        <TabPanel
          className={styles.tab}
          style={{ height: height - 250, overflow: "auto" }}
          value="settings"
        >
          <Settings
            config={config}
            subjects={subjects?.edges.map((s) => s.node) || []}
            keywords={keywords?.edges.map((k) => k.node) || []}
            updateConfig={editConfig}
          />
        </TabPanel>
      </TabContext>
      {orgs.length > 0 ? (
        <Select
          data-cy="select-org"
          label="Organization"
          value={org?._id}
          cy-value={org?._id}
          onChange={(
            event: React.ChangeEvent<{ value: unknown; name?: unknown }>
          ) =>
            setOrganization(
              orgs.find((o) => (event.target.value as string) === o._id)
            )
          }
          style={{ width: 270, position: "absolute", bottom: 25, right: 25 }}
        >
          <MenuItem
            data-cy="org-none"
            value={undefined}
            disabled={!canEditContent(props.user)}
          >
            None
          </MenuItem>
          {orgs.map((o) => (
            <MenuItem
              data-cy={`org-${o._id}`}
              key={`org-${o._id}`}
              value={o._id}
            >
              {o.name}
            </MenuItem>
          ))}
        </Select>
      ) : undefined}
      <Button
        data-cy="save-button"
        variant="contained"
        color="primary"
        className={styles.button}
        disabled={isSaving}
        onClick={saveConfig}
      >
        Save
      </Button>
      <ErrorDialog error={error} />
      <LoadingDialog title={isLoading ? "Loading..." : ""} />
    </div>
  );
}

export default withAuthorizationOnly(withLocation(ConfigPage));
