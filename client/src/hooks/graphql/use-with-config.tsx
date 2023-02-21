/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  addOrUpdateMentorPanel,
  deleteMentorPanel,
  fetchConfig,
  fetchMentorPanels,
  fetchMentors,
  fetchOrganizations,
  updateConfig,
  updateOrgConfig,
} from "api";
import {
  copyAndRemove,
  copyAndMove,
  canEditOrganization,
  canEditContent,
  extractErrorMessageFromError,
  canViewMentorOnHome,
  canViewMentorPanelOnHome,
  removeQueryParamFromUrl,
} from "helpers";
import { useEffect, useState } from "react";
import {
  Config,
  DisplaySurveyPopupCondition,
  MentorPanel,
  Organization,
  User,
} from "types";
import { MentorGQL } from "types-gql";
import { LoadingError } from "./loading-reducer";

interface UseWithConfigEdits {
  isLoading: boolean;
  isSaving: boolean;
  error: LoadingError | undefined;
  org: Organization | undefined;
  orgs: Organization[];
  config: Config | undefined;
  mentors: MentorGQL[];
  mentorPanels: MentorPanel[];
  saveConfig: () => void;
  editConfig: (c: Partial<Config>) => void;
  resetToDefault: () => void;
  moveMentor: (from: number, to: number) => void;
  moveMentorPanel: (from: number, to: number) => void;
  toggleFeaturedMentor: (id: string) => void;
  toggleActiveMentor: (id: string) => void;
  toggleFeaturedMentorPanel: (id: string) => void;
  toggleActiveMentorPanel: (id: string) => void;
  setOrganization: (org?: Organization) => void;
  saveMentorPanel: (panel: MentorPanel) => void;
  deleteMentorPanel: (id: string) => void;
}

export function useWithConfigEdits(
  accessToken: string,
  user: User
): UseWithConfigEdits {
  const params = new URLSearchParams(location.search);
  const [error, setError] = useState<LoadingError>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [config, setConfig] = useState<Config>();
  const [org, setOrg] = useState<Organization>();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [mentors, setMentors] = useState<MentorGQL[]>([]);
  const [mentorPanels, setMentorPanels] = useState<MentorPanel[]>([]);
  const [defaultConfig, setDefaultConfig] = useState<Config>();
  const [allMentors, setAllMentors] = useState<MentorGQL[]>([]);
  const [allMentorPanels, setAllMentorPanels] = useState<MentorPanel[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData(): Promise<void> {
    try {
      setIsLoading(true);
      // load organization data (only orgs the user can edit the config of)
      const orgData = await fetchOrganizations(accessToken, { limit: 9999 });
      const orgs = orgData.edges
        .map((o) => o.node)
        .filter((o) => canEditOrganization(o, user));
      let org: Organization | undefined;
      if (params.get("org")) {
        org = orgs.find((o) => o._id === params.get("org"));
        removeQueryParamFromUrl("org");
      }
      // load config data (only if the user can edit it)
      const defaultConfig = await fetchConfig();
      let config: Config | undefined;
      if (org) {
        config = org.config;
      } else if (canEditContent(user)) {
        config = defaultConfig;
      }
      if (config === undefined) {
        setIsLoading(false);
        return;
      }
      // load mentor data (only mentors that can be viewed on home page)
      const mentorsData = await fetchMentors(accessToken, { limit: 9999 });
      const allMentors = mentorsData.edges.map((m) => m.node);
      const mentors = visibleMentors(config, org, allMentors);
      // load mentor panel data (only mentor panels where all mentors can be viewed on home page)
      const mentorPanelsData = await fetchMentorPanels({ limit: 9999 });
      const allMentorPanels = mentorPanelsData.edges.map((m) => m.node);
      const mentorPanels = visibleMentorPanels(
        config,
        org,
        allMentors,
        allMentorPanels
      );
      setConfig(config);
      setOrg(org);
      setOrgs(orgs);
      setMentors(mentors);
      setMentorPanels(mentorPanels);
      setAllMentors(allMentors);
      setAllMentorPanels(allMentorPanels);
      setDefaultConfig(defaultConfig);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setError({
        error: "Failed to load data",
        message: extractErrorMessageFromError(err),
      });
    }
  }

  async function saveConfig(): Promise<void> {
    if (!config) {
      return;
    }
    try {
      setIsSaving(true);
      let updatedConfig: Config;
      if (org) {
        updatedConfig = await updateOrgConfig(accessToken, org._id, config);
        const orgData = await fetchOrganizations(accessToken, { limit: 9999 });
        const orgs = orgData.edges
          .map((o) => o.node)
          .filter((o) => canEditOrganization(o, user));
        setOrgs(orgs);
      } else {
        updatedConfig = await updateConfig(accessToken, config);
        setDefaultConfig(updatedConfig);
      }
      setConfig(updatedConfig);
      setMentors(visibleMentors(updatedConfig, org));
      setMentorPanels(visibleMentorPanels(updatedConfig, org));
      setIsSaving(false);
    } catch (err) {
      setIsSaving(false);
      setError({
        error: "Failed to save config",
        message: extractErrorMessageFromError(err),
      });
    }
  }

  async function saveMentorPanel(panel: MentorPanel): Promise<void> {
    if (!config) {
      return;
    }
    try {
      setIsSaving(true);
      await addOrUpdateMentorPanel(accessToken, panel, panel._id);
      const mentorPanelsData = await fetchMentorPanels({ limit: 9999 });
      const allMentorPanels = mentorPanelsData.edges.map((m) => m.node);
      const mentorPanels = visibleMentorPanels(
        config,
        org,
        allMentors,
        allMentorPanels
      );
      setAllMentorPanels(allMentorPanels);
      setMentorPanels(mentorPanels);
      setIsSaving(false);
    } catch (err) {
      setIsSaving(false);
      setError({
        error: "Failed to save mentor panel",
        message: extractErrorMessageFromError(err),
      });
    }
  }

  async function _deleteMentorPanel(id: string): Promise<void> {
    if (!config) {
      return;
    }
    try {
      setIsSaving(true);
      await deleteMentorPanel(accessToken, id);
      const mentorPanelsData = await fetchMentorPanels({ limit: 9999 });
      const allMentorPanels = mentorPanelsData.edges.map((m) => m.node);
      const mentorPanels = visibleMentorPanels(
        config,
        org,
        allMentors,
        allMentorPanels
      );
      setAllMentorPanels(allMentorPanels);
      setMentorPanels(mentorPanels);
      setIsSaving(false);
    } catch (err) {
      setIsSaving(false);
      setError({
        error: "Failed to delete mentor panel",
        message: extractErrorMessageFromError(err),
      });
    }
  }

  function resetToDefault(): void {
    const config = {
      ...defaultConfig,
      // home style settings
      styleHeaderTitle: "",
      styleHeaderText: "",
      styleHeaderLogo: "",
      styleHeaderLogoUrl: "",
      styleHeaderColor: "#025a87",
      styleHeaderTextColor: "#ffffff",
      homeFooterColor: "#025a87",
      homeFooterTextColor: "#ffffff",
      homeFooterImages: [],
      homeFooterLinks: [],
      homeBannerColor: "#ffffff",
      homeBannerButtonColor: "#007cba",
      homeCarouselColor: "#398bb4",
      walkthroughDisabled: false,
      walkthroughTitle: "",
      urlVideoMentorpalWalkthrough: "https://youtu.be/EGdSl4Q8NAY",
      disclaimerDisabled: false,
      disclaimerTitle: "",
      disclaimerText: "",
      termsOfServiceDisabled: false,
      termsOfServiceText: "",
      displayGuestPrompt: false,
      displaySurveyPopupCondition: DisplaySurveyPopupCondition.USER_ID,
      guestPromptTitle: "",
      guestPromptText: "",
      guestPromptInputType: "email",
      activeMentors: [],
      activeMentorPanels: [],
      featuredMentors: [],
      featuredMentorPanels: [],
      featuredSubjects: [],
      featuredKeywordTypes: [],
      defaultSubject: "",
    };
    editConfig(config);
  }

  // sort active and featured mentors first, only include mentors that can be viewed on home page
  function visibleMentors(
    config: Config,
    org: Organization | undefined,
    mentors: MentorGQL[] = allMentors
  ): MentorGQL[] {
    // filter out mentors that cannot be viewed on home page
    const vm = mentors.filter((m) => canViewMentorOnHome(m, org));
    const afm: MentorGQL[] = [];
    // sort featured first
    for (const fm of config.featuredMentors) {
      const mentor = vm.find((m) => fm === m._id);
      if (mentor && !afm.find((m) => m._id === fm)) {
        afm.push(mentor);
      }
    }
    // sort active next
    for (const am of config.activeMentors) {
      const mentor = vm.find((m) => am === m._id);
      if (mentor && !afm.find((m) => m._id === am)) {
        afm.push(mentor);
      }
    }
    // add the rest to the end
    return [
      ...afm,
      ...vm.filter(
        (m) =>
          !config.activeMentors.includes(m._id) &&
          !config.featuredMentors.includes(m._id)
      ),
    ];
  }

  // sort active and featured mentor panels first, only include mentors that can be viewed on home page
  function visibleMentorPanels(
    config: Config,
    org: Organization | undefined,
    mentors: MentorGQL[] = allMentors,
    mentorPanels: MentorPanel[] = allMentorPanels
  ): MentorPanel[] {
    // filter out mentors that cannot be viewed on home page
    const vm = mentorPanels.filter((m) =>
      canViewMentorPanelOnHome(m, mentors, org)
    );
    const afm: MentorPanel[] = [];
    // sort featured first
    for (const fm of config.featuredMentorPanels) {
      const mentor = vm.find((m) => fm === m._id);
      if (mentor && !afm.find((m) => m._id === fm)) {
        afm.push(mentor);
      }
    }
    // sort active next
    for (const am of config.activeMentorPanels) {
      const mentor = vm.find((m) => am === m._id);
      if (mentor && !afm.find((m) => m._id === am)) {
        afm.push(mentor);
      }
    }
    // add the rest to the end
    return [
      ...afm,
      ...vm.filter(
        (m) =>
          !config.activeMentorPanels.includes(m._id) &&
          !config.featuredMentorPanels.includes(m._id)
      ),
    ];
  }

  function editConfig(c: Partial<Config>): void {
    if (!config) {
      return;
    }
    const updatedConfig = {
      ...config,
      ...c,
    };
    setConfig(updatedConfig);
    if (c.activeMentors || c.featuredMentors) {
      setMentors(visibleMentors(updatedConfig, org));
    }
    if (c.activeMentorPanels || c.featuredMentorPanels) {
      setMentorPanels(visibleMentorPanels(updatedConfig, org));
    }
  }

  function moveMentor(from: number, to: number): void {
    if (!config) {
      return;
    }
    const _mentors = copyAndMove(mentors, from, to);
    editConfig({
      activeMentors: _mentors
        .filter((m) => config.activeMentors.includes(m._id))
        .map((m) => m._id),
      featuredMentors: _mentors
        .filter((m) => config.featuredMentors.includes(m._id))
        .map((m) => m._id),
    });
  }

  function moveMentorPanel(from: number, to: number): void {
    if (!config) {
      return;
    }
    const _mentorPanels = copyAndMove(mentorPanels, from, to);
    editConfig({
      activeMentorPanels: _mentorPanels
        .filter((m) => config.activeMentorPanels.includes(m._id))
        .map((m) => m._id),
      featuredMentorPanels: _mentorPanels
        .filter((m) => config.featuredMentorPanels.includes(m._id))
        .map((m) => m._id),
    });
  }

  function toggleFeaturedMentor(id: string): void {
    if (!config) {
      return;
    }
    const idx = config.featuredMentors.findIndex((i) => i === id);
    const featuredMentors =
      idx === -1
        ? [...config.featuredMentors, id]
        : copyAndRemove(config.featuredMentors, idx);
    editConfig({
      featuredMentors: mentors
        .filter((m) => featuredMentors.includes(m._id))
        .map((m) => m._id),
    });
  }

  function toggleActiveMentor(id: string): void {
    if (!config) {
      return;
    }
    const idx = config.activeMentors.findIndex((i) => i === id);
    const activeMentors =
      idx === -1
        ? [...config.activeMentors, id]
        : copyAndRemove(config.activeMentors, idx);
    editConfig({
      activeMentors: mentors
        .filter((m) => activeMentors.includes(m._id))
        .map((m) => m._id),
    });
  }

  function toggleFeaturedMentorPanel(id: string): void {
    if (!config) {
      return;
    }
    const idx = config.featuredMentorPanels.findIndex((i) => i === id);
    const featuredMentorPanels =
      idx === -1
        ? [...config.featuredMentorPanels, id]
        : copyAndRemove(config.featuredMentorPanels, idx);
    editConfig({
      featuredMentorPanels: mentorPanels
        .filter((m) => featuredMentorPanels.includes(m._id))
        .map((m) => m._id),
    });
  }

  function toggleActiveMentorPanel(id: string): void {
    if (!config) {
      return;
    }
    const idx = config.activeMentorPanels.findIndex((i) => i === id);
    const activeMentorPanels =
      idx === -1
        ? [...config.activeMentorPanels, id]
        : copyAndRemove(config.activeMentorPanels, idx);
    editConfig({
      activeMentorPanels: mentorPanels
        .filter((m) => activeMentorPanels.includes(m._id))
        .map((m) => m._id),
    });
  }

  function setOrganization(org?: Organization): void {
    if (!config) {
      return;
    }
    setOrg(org);
    let updatedConfig: Config;
    if (org) {
      updatedConfig = org.config;
      setConfig(org.config);
    } else if (defaultConfig) {
      updatedConfig = defaultConfig;
    } else {
      return;
    }
    setConfig(updatedConfig);
    setMentors(visibleMentors(updatedConfig, org));
    setMentorPanels(visibleMentorPanels(updatedConfig, org));
  }

  return {
    isLoading,
    isSaving,
    error,
    config,
    mentors,
    mentorPanels,
    org,
    orgs,
    editConfig,
    saveConfig,
    resetToDefault,
    moveMentor,
    moveMentorPanel,
    saveMentorPanel,
    deleteMentorPanel: _deleteMentorPanel,
    toggleFeaturedMentor,
    toggleActiveMentor,
    toggleFeaturedMentorPanel,
    toggleActiveMentorPanel,
    setOrganization,
  };
}
