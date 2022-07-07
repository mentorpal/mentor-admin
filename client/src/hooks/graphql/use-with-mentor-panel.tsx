/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { addOrUpdateMentorPanel, fetchMentorPanel } from "api";
import { useWithData } from "hooks/graphql/use-with-data";
import { MentorPanel } from "types";
import { LoadingError } from "./loading-reducer";

interface UseWithMentorPanel {
  editedData: MentorPanel | undefined;
  isEdited: boolean;
  isLoading: boolean;
  isSaving: boolean;
  error: LoadingError | undefined;
  editData: (d: Partial<MentorPanel>) => void;
  saveData: () => void;
}

export function useWithMentorPanel(
  accessToken: string,
  id?: string
): UseWithMentorPanel {
  const {
    editedData,
    isEdited,
    isLoading,
    isSaving,
    error,
    editData,
    saveAndReturnData,
  } = useWithData<MentorPanel>(fetch);

  function fetch() {
    if (!id) {
      return new Promise<MentorPanel>((resolve) => {
        resolve({
          _id: "",
          subject: "",
          mentors: [],
          title: "",
          subtitle: "",
        });
      });
    }
    return fetchMentorPanel(id);
  }

  function saveData() {
    saveAndReturnData({
      action: async (editedData: MentorPanel) => {
        return await addOrUpdateMentorPanel(accessToken, editedData);
      },
    });
  }

  return {
    editedData,
    isEdited,
    isLoading,
    isSaving,
    error,
    editData,
    saveData,
  };
}
