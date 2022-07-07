/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { fetchConfig, updateConfigFeatured } from "api";
import { copyAndRemove, copyAndMove } from "helpers";
import { useWithData } from "hooks/graphql/use-with-data";
import { Config } from "types";
import { LoadingError } from "./loading-reducer";

interface UseWithConfig {
  editedData: Config | undefined;
  isEdited: boolean;
  isLoading: boolean;
  isSaving: boolean;
  error: LoadingError | undefined;
  editData: (d: Partial<Config>) => void;
  saveConfig: () => void;
  addFeaturedMentor: (id: string) => void;
  removeFeaturedMentor: (idx: number) => void;
  moveFeaturedMentor: (to: number, from: number) => void;
  addActiveMentor: (id: string) => void;
  removeActiveMentor: (idx: number) => void;
  moveActiveMentor: (to: number, from: number) => void;
  addFeaturedMentorPanel: (id: string) => void;
  removeFeaturedMentorPanel: (idx: number) => void;
  moveFeaturedMentorPanel: (to: number, from: number) => void;
}

export function useWithConfig(accessToken: string): UseWithConfig {
  const {
    editedData,
    isEdited,
    isLoading,
    isSaving,
    error,
    editData,
    saveAndReturnData,
  } = useWithData<Config>(fetch);

  function fetch() {
    return fetchConfig();
  }

  function saveConfig() {
    saveAndReturnData({
      action: async (editedData: Config) => {
        return await updateConfigFeatured(accessToken, editedData);
      },
    });
  }

  function addFeaturedMentor(id: string) {
    editData({
      featuredMentors: [...(editedData?.featuredMentors || []), id],
    });
  }

  function removeFeaturedMentor(idx: number) {
    editData({
      featuredMentors: copyAndRemove(editedData?.featuredMentors || [], idx),
    });
  }

  function moveFeaturedMentor(from: number, to: number) {
    editData({
      featuredMentors: copyAndMove(editedData?.featuredMentors || [], from, to),
    });
  }

  function addActiveMentor(id: string) {
    editData({
      activeMentors: [...(editedData?.activeMentors || []), id],
    });
  }

  function removeActiveMentor(idx: number) {
    editData({
      activeMentors: copyAndRemove(editedData?.activeMentors || [], idx),
    });
  }

  function moveActiveMentor(from: number, to: number) {
    editData({
      activeMentors: copyAndMove(editedData?.activeMentors || [], from, to),
    });
  }

  function addFeaturedMentorPanel(id: string) {
    editData({
      featuredMentorPanels: [...(editedData?.featuredMentorPanels || []), id],
    });
  }

  function removeFeaturedMentorPanel(idx: number) {
    editData({
      featuredMentorPanels: copyAndRemove(
        editedData?.featuredMentorPanels || [],
        idx
      ),
    });
  }

  function moveFeaturedMentorPanel(from: number, to: number) {
    editData({
      featuredMentorPanels: copyAndMove(
        editedData?.featuredMentorPanels || [],
        from,
        to
      ),
    });
  }

  return {
    editedData,
    isEdited,
    isLoading,
    isSaving,
    error,
    editData,
    saveConfig,
    addFeaturedMentor,
    removeFeaturedMentor,
    moveFeaturedMentor,
    addActiveMentor,
    removeActiveMentor,
    moveActiveMentor,
    addFeaturedMentorPanel,
    removeFeaturedMentorPanel,
    moveFeaturedMentorPanel,
  };
}
