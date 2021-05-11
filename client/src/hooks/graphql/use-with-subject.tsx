/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect } from "react";
import { fetchSubject, updateSubject } from "api";
import { Subject } from "types";
import { useWithData } from "./use-with-data";

export function useWithSubject(subjectId: string, accessToken: string) {
  const {
    data,
    editedData,
    isEdited,
    isLoading,
    isSaving,
    error,
    editData,
    saveData,
  } = useWithData<Subject>(fetch, update);

  useEffect(() => {
    editData({
      _id: "",
      name: "",
      description: "",
      isRequired: false,
      categories: [],
      topics: [],
      questions: [],
    });
  }, [subjectId]);

  function fetch() {
    return fetchSubject(subjectId);
  }

  function update(editedData: Subject) {
    return updateSubject(editedData, accessToken);
  }

  return {
    subject: data,
    editedSubject: editedData,
    isSubjectEdited: isEdited,
    isSubjectLoading: isLoading,
    isSubjectSaving: isSaving,
    subjectError: error,
    editSubject: editData,
    saveSubject: saveData,
  };
}
