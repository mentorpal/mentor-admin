/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu
The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useCallback, useEffect, useState } from "react";
import { equals } from "helpers";
import { Mentor } from "types";
import useActiveMentor from "./useActiveMentor";

export interface UseMentorEdits {
  editedMentor?: Mentor;
  isMentorEdited: boolean;
  editMentor: (edits: Partial<Mentor>) => void;
  saveMentorDetails: () => void;
  saveMentorSubjects: () => void;
}

export const useMentorEdits = (): UseMentorEdits => {
  const [editedMentor, setEditedMentor] = useState<Mentor>();
  const {
    mentor,
    isLoading: isMentorLoading,
    isSaving: isMentorSaving,
    saveMentorDetails: saveDetails,
    saveMentorSubjects: saveSubjects,
  } = useActiveMentor();
  const isMentorEdited = !equals(mentor, editedMentor);
  const declineMentorSave =
    !mentor ||
    isMentorLoading ||
    isMentorSaving ||
    !isMentorEdited ||
    !editedMentor;

  useEffect(() => {
    setEditedMentor(mentor);
  }, [mentor]);

  const _editMentor = useCallback(
    (edits: Partial<Mentor>) => {
      if (!mentor || isMentorLoading || isMentorSaving) {
        return;
      }
      setEditedMentor({ ...mentor, ...(editedMentor || {}), ...edits });
    },
    [mentor, editedMentor, isMentorLoading, isMentorSaving]
  );

  const _saveMentorDetails = useCallback(() => {
    if (declineMentorSave) {
      return;
    }
    saveDetails(editedMentor);
  }, [declineMentorSave, editedMentor]);

  const saveMentorSubjects = () => {
    if (
      !mentor ||
      isMentorLoading ||
      isMentorSaving ||
      !isMentorEdited ||
      !editedMentor
    ) {
      return;
    }
    saveSubjects(editedMentor);
  };

  return {
    editedMentor,
    isMentorEdited,
    editMentor: _editMentor,
    saveMentorDetails: _saveMentorDetails,
    saveMentorSubjects,
  };
};
