/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  addOrUpdateMentorPanel,
  fetchConfig,
  fetchMentorPanels,
  fetchMentors,
  updateConfig,
} from "api";
import { copyAndRemove, copyAndMove } from "helpers";
import { useWithData } from "hooks/graphql/use-with-data";
import { useEffect, useState } from "react";
import { Config, Connection, MentorPanel } from "types";
import { MentorGQL } from "types-gql";
import { LoadingError } from "./loading-reducer";
import { useWithDataConnection } from "./use-with-data-connection";

interface UseWithConfig {
  config: Config | undefined;
  mentors: MentorGQL[];
  mentorPanels: MentorPanel[];
  error: LoadingError | undefined;
  isLoading: boolean;
  isSaving: boolean;
  isEdited: boolean;
  saveConfig: () => void;
  updateConfig: (c: Partial<Config>) => void;
  moveMentor: (from: number, to: number) => void;
  moveMentorPanel: (from: number, to: number) => void;
  toggleFeaturedMentor: (id: string) => void;
  toggleActiveMentor: (id: string) => void;
  toggleFeaturedMentorPanel: (id: string) => void;
  toggleActiveMentorPanel: (id: string) => void;
  saveMentorPanel: (panel: MentorPanel) => void;
}

export function useWithConfig(accessToken: string): UseWithConfig {
  const {
    editedData: config,
    error: configError,
    isEdited: isConfigEdited,
    isLoading: isConfigLoading,
    isSaving: isConfigSaving,
    editData: editConfig,
    saveAndReturnData: saveAndReturnConfig,
  } = useWithData<Config>(_fetchConfig);
  const {
    data: mentorsData,
    error: mentorsError,
    isLoading: isMentorsLoading,
    searchParams: mentorsSearchParams,
  } = useWithDataConnection<MentorGQL>(_fetchMentors, { limit: 9999 });
  const {
    data: mentorPanelsData,
    error: mentorPanelsError,
    isLoading: isMentorPanelsLoading,
    searchParams: mentorPanelsSearchParams,
    reloadData: reloadMentorPanels,
  } = useWithDataConnection<MentorPanel>(_fetchMentorPanels, { limit: 9999 });
  const [mentors, setMentors] = useState<MentorGQL[]>([]);
  const [mentorPanels, setMentorPanels] = useState<MentorPanel[]>([]);

  useEffect(() => {
    if (mentorsData && config) {
      if (mentors.length > 0) {
        setMentors([
          ...mentors.filter(
            (m) =>
              config.activeMentors.includes(m._id) ||
              config.featuredMentors.includes(m._id)
          ),
          ...mentors.filter(
            (m) =>
              !config.activeMentors.includes(m._id) &&
              !config.featuredMentors.includes(m._id)
          ),
        ]);
      } else {
        setMentors(
          mentorsData.edges
            .map((e) => e.node)
            .sort((a, b) => {
              let aFeatured = config.featuredMentors.findIndex(
                (m) => m === a._id
              );
              let bFeatured = config.featuredMentors.findIndex(
                (m) => m === b._id
              );
              aFeatured = aFeatured === -1 ? 9999 : aFeatured;
              bFeatured = bFeatured === -1 ? 9999 : bFeatured;
              if (aFeatured !== bFeatured) {
                return aFeatured - bFeatured;
              }
              let aActive = config.activeMentors.findIndex((m) => m === a._id);
              let bActive = config.activeMentors.findIndex((m) => m === b._id);
              aActive = aActive === -1 ? 9999 : aActive;
              bActive = bActive === -1 ? 9999 : bActive;
              return aActive - bActive;
            })
        );
      }
    }
  }, [mentorsData, config?.activeMentors, config?.featuredMentors]);

  useEffect(() => {
    if (mentorPanelsData && config) {
      if (mentorPanels.length > 0) {
        setMentorPanels([
          ...mentorPanels.filter(
            (m) =>
              config.activeMentorPanels.includes(m._id) ||
              config.featuredMentorPanels.includes(m._id)
          ),
          ...mentorPanels.filter(
            (m) =>
              !config.activeMentorPanels.includes(m._id) &&
              !config.featuredMentorPanels.includes(m._id)
          ),
        ]);
      } else {
        setMentorPanels(
          mentorPanelsData.edges
            .map((e) => e.node)
            .sort((a, b) => {
              let aFeatured = config.featuredMentorPanels.findIndex(
                (m) => m === a._id
              );
              let bFeatured = config.featuredMentorPanels.findIndex(
                (m) => m === b._id
              );
              aFeatured = aFeatured === -1 ? 9999 : aFeatured;
              bFeatured = bFeatured === -1 ? 9999 : bFeatured;
              if (aFeatured !== bFeatured) {
                return aFeatured - bFeatured;
              }
              let aActive = config.activeMentorPanels.findIndex(
                (m) => m === a._id
              );
              let bActive = config.activeMentorPanels.findIndex(
                (m) => m === b._id
              );
              aActive = aActive === -1 ? 9999 : aActive;
              bActive = bActive === -1 ? 9999 : bActive;
              return aActive - bActive;
            })
        );
      }
    }
  }, [
    mentorPanelsData,
    config?.activeMentorPanels,
    config?.featuredMentorPanels,
  ]);

  function _fetchConfig(): Promise<Config> {
    return fetchConfig();
  }

  function _fetchMentors(): Promise<Connection<MentorGQL>> {
    return fetchMentors(accessToken, mentorsSearchParams);
  }

  function _fetchMentorPanels() {
    return fetchMentorPanels(mentorPanelsSearchParams);
  }

  function saveConfig(): void {
    saveAndReturnConfig({
      action: async (editedData: Config) => {
        return await updateConfig(accessToken, editedData);
      },
    });
  }

  function edit(c: Partial<Config>): void {
    if (!config) {
      return;
    }
    editConfig({
      ...config,
      ...c,
    });
  }

  function moveMentor(from: number, to: number): void {
    if (!config || !mentorsData) {
      return;
    }
    const _mentors = copyAndMove(mentors, from, to);
    setMentors(_mentors);
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
    if (!config || !mentorsData || !mentorPanelsData) {
      return;
    }
    const _mentorPanels = copyAndMove(mentorPanels, from, to);
    setMentorPanels(_mentorPanels);
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
    if (!config || !mentorsData) {
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
    if (!config || !mentorsData) {
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
    if (!config || !mentorsData || !mentorPanelsData) {
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
    if (!config || !mentorsData || !mentorPanelsData) {
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

  async function saveMentorPanel(panel: MentorPanel): Promise<void> {
    await addOrUpdateMentorPanel(accessToken, panel, panel._id);
    setMentorPanels([]);
    reloadMentorPanels();
  }

  return {
    config,
    mentors,
    mentorPanels,
    error: configError || mentorsError || mentorPanelsError,
    isLoading: isConfigLoading || isMentorsLoading || isMentorPanelsLoading,
    isEdited: isConfigEdited,
    isSaving: isConfigSaving,
    saveConfig,
    updateConfig: edit,
    moveMentor,
    moveMentorPanel,
    toggleFeaturedMentor,
    toggleActiveMentor,
    toggleFeaturedMentorPanel,
    toggleActiveMentorPanel,
    saveMentorPanel,
  };
}
