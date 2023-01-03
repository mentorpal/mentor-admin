/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useState } from "react";
import {
  Button,
  CircularProgress,
  makeStyles,
  MenuItem,
  Select,
  Tab,
} from "@material-ui/core";
import { TabContext, TabList, TabPanel } from "@material-ui/lab";

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
import { User } from "types";
import withLocation from "wrap-with-location";
import { MentorPanelList } from "components/config/mentor-panel-list";
import { HomeStyles } from "components/config/home-styles";
import { Prompts } from "components/config/prompts";
import { Settings } from "components/config/other-settings";

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
            value="home-styles"
            data-cy="toggle-home-styles"
          />
          <Tab label="Prompts" value="prompts" data-cy="toggle-prompts" />
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
          value="home-styles"
        >
          <HomeStyles config={config} updateConfig={editConfig} />
        </TabPanel>
        <TabPanel
          className={styles.tab}
          style={{ height: height - 250, overflow: "auto" }}
          value="prompts"
        >
          <Prompts config={config} updateConfig={editConfig} />
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
