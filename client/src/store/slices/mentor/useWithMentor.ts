/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { equals } from "helpers";
import { Mentor } from "types";
import { LoadingError } from "hooks/graphql/loading-reducer";
import { useAppSelector } from "store/hooks";
import * as mentorActions from ".";

export interface UseWithMentor {
  mentor?: Mentor;
  mentorError?: LoadingError;
  editedMentor?: Mentor;
  isMentorEdited: boolean;
  isMentorLoading: boolean;
  isMentorSaving: boolean;
  editMentor: (edits: Partial<Mentor>) => void;
  loadMentor: () => void;
  saveMentorDetails: () => void;
  saveMentorSubjects: () => void;
  clearMentorError: () => void;
  onMentorUpdated: (mentor: Mentor) => void;
}

export const useWithMentor = (): UseWithMentor => {
  const dispatch = useDispatch();
  const {
    data: mentor,
    error: mentorError,
    mentorStatus,
  } = useAppSelector((state) => state.mentor);
  const { accessToken } = useAppSelector((state) => state.login);
  const [editedMentor, setEditedMentor] = useState<Mentor>();

  const isMentorEdited = !equals(mentor, editedMentor);
  const isMentorLoading = mentorStatus === mentorActions.MentorStatus.LOADING;
  const isMentorSaving = mentorStatus === mentorActions.MentorStatus.SAVING;

  useEffect(() => {
    setEditedMentor(mentor);
  }, [mentor]);

  const loadMentor = () => {
    if (isMentorLoading || isMentorSaving) {
      return;
    }
    if (!accessToken) {
      dispatch({
        type: mentorActions.MentorStatus.FAILED,
        payload: "Cannot load mentor if unauthenticated.",
      });
    } else {
      dispatch(mentorActions.loadMentor(accessToken));
    }
  };

  function editMentor(edits: Partial<Mentor>): void {
    if (!mentor || isMentorLoading || isMentorSaving) {
      return;
    }
    setEditedMentor({ ...mentor, ...(editedMentor || {}), ...edits });
  }

  const saveMentorDetails = () => {
    if (isMentorLoading || isMentorSaving || !isMentorEdited || !editedMentor) {
      return;
    }
    if (!accessToken) {
      dispatch({
        type: mentorActions.MentorStatus.FAILED,
        payload: "Cannot save mentor if unauthenticated.",
      });
    } else {
      dispatch(
        mentorActions.saveMentor({
          accessToken: accessToken,
          editedData: editedMentor,
        })
      );
    }
  };

  const saveMentorSubjects = () => {
    if (isMentorLoading || isMentorSaving || !isMentorEdited || !editedMentor) {
      return;
    }
    if (!accessToken) {
      dispatch({
        type: mentorActions.MentorStatus.FAILED,
        payload: "Cannot save mentor if unauthenticated.",
      });
    } else {
      dispatch(
        mentorActions.saveMentorSubjects({
          accessToken: accessToken,
          editedData: editedMentor,
        })
      );
    }
  };

  const clearMentorError = () => {
    dispatch(mentorActions.mentorSlice.actions.clearError());
  };

  const onMentorUpdated = (mentor: Mentor) => {
    if (!mentor || isMentorLoading || isMentorSaving) {
      return;
    }
    dispatch(mentorActions.updateMentor(mentor));
  };

  return {
    mentor,
    mentorError,
    editedMentor,
    isMentorEdited,
    isMentorLoading,
    isMentorSaving,
    editMentor,
    loadMentor,
    saveMentorDetails,
    saveMentorSubjects,
    clearMentorError,
    onMentorUpdated,
  };
};
