/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useState } from "react";
import {
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tab,
} from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import { TabContext, TabList, TabPanel } from "@mui/lab";

import NavBar from "components/nav-bar";
import { ErrorDialog } from "components/dialog";
import { MentorList } from "components/config/mentor-list";
import { MentorPanelList } from "components/config/mentor-panel-list";
import { HomeStyles } from "components/config/home-styles";
import { Prompts } from "components/config/prompts";
import { Settings } from "components/config/other-settings";
import { ImageTutorials } from "components/config/image-tutorials";
import { canEditContent, launchOrg } from "helpers";
import { useWithConfigEdits } from "hooks/graphql/use-with-config";
import { useWithWindowSize } from "hooks/use-with-window-size";
import withAuthorizationOnly from "hooks/wrap-with-authorization-only";
import { useWithSubjects } from "hooks/graphql/use-with-subjects";
import { useWithKeywords } from "hooks/graphql/use-with-keywords";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import { User } from "types";
import withLocation from "wrap-with-location";

const useStyles = makeStyles(() => ({
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
    margin: 10,
  },
  tab: {
    width: "95%",
  },
}));

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
    resetToDefault,
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

  const tabHeight = height - 275;
  return (
    <div className={styles.root}>
      <NavBar title={`Manage${org ? ` ${org.name} ` : " "}Config`} />
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "flex-end",
        }}
      >
        <FormControl>
          <InputLabel>Organization</InputLabel>
          <Select
            data-cy="select-org"
            value={org?._id || "Default"}
            cy-value={org?._id}
            onChange={(event: SelectChangeEvent<string>) =>
              setOrganization(
                orgs.find((o) => (event.target.value as string) === o._id)
              )
            }
            style={{ width: 200 }}
          >
            <MenuItem
              data-cy="org-none"
              value="Default"
              disabled={!canEditContent(props.user)}
            >
              Default
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
        </FormControl>
        <ImageTutorials />
      </div>
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
            value="home-styles"
            data-cy="toggle-home-styles"
          />
          <Tab label="Prompts" value="prompts" data-cy="toggle-prompts" />
          <Tab label="Other" value="settings" data-cy="toggle-settings" />
        </TabList>
        <TabPanel
          className={styles.tab}
          style={{ height: tabHeight, overflow: "auto" }}
          value="featured-mentors"
        >
          <MentorList
            config={config}
            org={org}
            mentors={mentors}
            move={moveMentor}
            toggleActive={toggleActiveMentor}
            toggleFeatured={toggleFeaturedMentor}
          />
        </TabPanel>
        <TabPanel
          className={styles.tab}
          style={{ height: tabHeight, overflow: "auto" }}
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
          style={{ height: tabHeight, overflow: "auto" }}
          value="home-styles"
        >
          <HomeStyles
            org={org}
            config={config}
            accessToken={props.accessToken}
            updateConfig={editConfig}
          />
        </TabPanel>
        <TabPanel
          className={styles.tab}
          style={{ height: tabHeight, overflow: "auto" }}
          value="prompts"
        >
          <Prompts config={config} updateConfig={editConfig} />
        </TabPanel>
        <TabPanel
          className={styles.tab}
          style={{ height: tabHeight, overflow: "auto" }}
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
      <div>
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
        <Button
          data-cy="view-button"
          variant="contained"
          className={styles.button}
          onClick={() => launchOrg(org?.subdomain || "", true)}
        >
          View Home Page
        </Button>
        <Button
          data-cy="view-button"
          variant="contained"
          color="secondary"
          className={styles.button}
          onClick={resetToDefault}
        >
          Reset to Default
        </Button>
      </div>
      <ErrorDialog error={error} />
    </div>
  );
}

export default withAuthorizationOnly(withLocation(ConfigPage));
