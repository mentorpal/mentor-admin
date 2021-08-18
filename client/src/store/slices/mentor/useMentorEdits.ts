/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu
The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { equals } from "helpers";
import * as mentorActions from ".";
import useActiveMentor, {
  isActiveMentorLoading,
  isActiveMentorSaving,
  useActiveMentorActions,
} from "./useActiveMentor";
import { Mentor } from "types";

export interface UseMentorEdits {
  editedMentor?: Mentor;
  isMentorEdited: boolean;
  editMentor: (edits: Partial<Mentor>) => void;
  saveMentorDetails: () => void;
  saveMentorSubjects: () => void;
  onMentorUpdated: (mentor: Mentor) => void;
}

export const useMentorEdits = (): UseMentorEdits => {
  const dispatch = useDispatch();
  const [editedMentor, setEditedMentor] = useState<Mentor>();
  const mentor = useActiveMentor((state) => state.data);
  const isMentorEdited = !equals(mentor, editedMentor);
  const isMentorLoading = isActiveMentorLoading();
  const isMentorSaving = isActiveMentorSaving();
  const { saveMentorDetails: saveDetails, saveMentorSubjects: saveSubjects } =
    useActiveMentorActions();

  useEffect(() => {
    setEditedMentor(mentor);
  }, [mentor]);

  function editMentor(edits: Partial<Mentor>): void {
    if (!mentor || isMentorLoading || isMentorSaving) {
      return;
    }
    setEditedMentor({ ...mentor, ...(editedMentor || {}), ...edits });
  }

  const saveMentorDetails = () => {
    if (
      !mentor ||
      isMentorLoading ||
      isMentorSaving ||
      !isMentorEdited ||
      !editedMentor
    ) {
      return;
    }
    saveDetails(editedMentor);
  };

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

  const onMentorUpdated = (mentor: Mentor) => {
    if (!mentor || isMentorLoading || isMentorSaving) {
      return;
    }
    dispatch(mentorActions.updateMentor(mentor));
  };

  return {
    editedMentor,
    isMentorEdited,
    editMentor,
    saveMentorDetails,
    saveMentorSubjects,
    onMentorUpdated,
  };
};
