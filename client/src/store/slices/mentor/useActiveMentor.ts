/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "store/hooks";
import { Mentor } from "types";
import * as mentorActions from ".";

interface UseActiveMentor {
  mentorState: mentorActions.MentorState;
  loadMentor: () => void;
  saveMentor: () => void;
  saveMentorSubjects: () => void;
  editMentor: (edits: Partial<Mentor>) => void;
  clearError: () => void;
}

export const useActiveMentor = (): UseActiveMentor => {
  const dispatch = useDispatch();
  const mentorState = useAppSelector((state) => state.mentor);
  const loginState = useAppSelector((state) => state.login);

  useEffect(() => {
    if (mentorState.data || !loginState.accessToken) {
      return;
    }
    loadMentor();
  }, [loginState]);

  const loadMentor = () => {
    if (!loginState.accessToken) {
      dispatch({
        type: mentorActions.MentorStatus.FAILED,
        payload: "Cannot load mentor if unauthenticated.",
      });
    } else {
      dispatch(mentorActions.loadMentor(loginState.accessToken));
    }
  };

  const saveMentor = () => {
    if (
      mentorState.mentorStatus === mentorActions.MentorStatus.LOADING ||
      mentorState.mentorStatus === mentorActions.MentorStatus.SAVING
    ) {
      return;
    }
    if (!loginState.accessToken) {
      dispatch({
        type: mentorActions.MentorStatus.FAILED,
        payload: "Cannot save mentor if unauthenticated.",
      });
    } else if (mentorState.editedData && mentorState.isEdited) {
      dispatch(
        mentorActions.saveMentor({
          accessToken: loginState.accessToken,
          editedData: mentorState.editedData,
        })
      );
    }
  };

  const saveMentorSubjects = () => {
    if (
      mentorState.mentorStatus === mentorActions.MentorStatus.LOADING ||
      mentorState.mentorStatus === mentorActions.MentorStatus.SAVING
    ) {
      return;
    }
    if (!loginState.accessToken) {
      dispatch({
        type: mentorActions.MentorStatus.FAILED,
        payload: "Cannot save mentor if unauthenticated.",
      });
    } else if (mentorState.editedData && mentorState.isEdited) {
      dispatch(
        mentorActions.saveMentorSubjects({
          accessToken: loginState.accessToken,
          editedData: mentorState.editedData,
        })
      );
    }
  };

  const editMentor = (edits: Partial<Mentor>) => {
    if (
      mentorState.mentorStatus === mentorActions.MentorStatus.LOADING ||
      mentorState.mentorStatus === mentorActions.MentorStatus.SAVING
    ) {
      return;
    }
    dispatch(mentorActions.mentorSlice.actions.editMentor(edits));
  };

  const clearError = () => {
    dispatch(mentorActions.mentorSlice.actions.clearError());
  };

  return {
    mentorState,
    loadMentor,
    saveMentor,
    saveMentorSubjects,
    editMentor,
    clearError,
  };
};
