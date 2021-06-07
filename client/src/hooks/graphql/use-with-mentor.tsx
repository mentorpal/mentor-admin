/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { fetchMentor, updateMentorDetails, updateMentorSubjects } from "api";
import { Mentor } from "types";
import { UseData, useWithData } from "./use-with-data";

interface UseMentorData extends UseData<Mentor> {
  saveMentorDetails: () => void;
  saveMentorSubjects: () => void;
}

export function useWithMentor(accessToken: string): UseMentorData {
  const {
    data,
    editedData,
    isEdited,
    isLoading,
    isSaving,
    error,
    clearError,
    editData,
    saveData,
    reloadData,
  } = useWithData<Mentor>(fetch);

  function fetch() {
    return fetchMentor(accessToken);
  }

  function saveMentorDetails() {
    saveData({
      callback: (editedData: Mentor) =>
        updateMentorDetails(editedData, accessToken),
    });
  }

  function saveMentorSubjects() {
    saveData({
      callback: (editedData: Mentor) =>
        updateMentorSubjects(editedData, accessToken),
    });
  }

  return {
    data,
    editedData,
    error,
    isEdited,
    isLoading,
    isSaving,
    clearError,
    reloadData,
    editData,
    saveData,
    saveMentorDetails,
    saveMentorSubjects,
  };
}
