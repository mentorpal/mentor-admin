/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Mentor } from "types";
import { useActiveMentor } from "store/slices/mentor/useActiveMentor";
import { MentorStatus } from "store/slices/mentor";
import { LoadingError } from "./loading-reducer";

interface UseMentorData {
  data?: Mentor;
  editedData?: Mentor;
  isEdited: boolean;
  isLoading: boolean;
  isSaving: boolean;
  error?: LoadingError;
  reloadData: () => void;
  editData: (d: Partial<Mentor>) => void;
  saveMentorDetails: () => void;
  saveMentorSubjects: () => void;
}

export function useWithMentor(): UseMentorData {
  const {
    mentorState,
    editMentor,
    loadMentor,
    saveMentor,
    saveMentorSubjects,
  } = useActiveMentor();

  return {
    data: mentorState.data,
    editedData: mentorState.editedData,
    error: mentorState.error,
    isEdited: Boolean(mentorState.isEdited),
    isLoading: mentorState.mentorStatus === MentorStatus.LOADING,
    isSaving: mentorState.mentorStatus === MentorStatus.SAVING,
    reloadData: loadMentor,
    editData: editMentor,
    saveMentorDetails: saveMentor,
    saveMentorSubjects,
  };
}
