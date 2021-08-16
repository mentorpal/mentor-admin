/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Mentor } from "types";
import { LoadingError } from "hooks/graphql/loading-reducer";
import { useAppSelector } from "store/hooks";
import * as mentorActions from ".";
import { RootState } from "store/store";

export interface UseActiveMentor {
  mentor?: Mentor;
  mentorError?: LoadingError;
  mentorStatus: mentorActions.MentorStatus;
  isMentorLoading: boolean;
  loadMentor: (mentorId?: string) => void;
  onMentorUpdated: (mentor: Mentor) => void;
  clearMentorError: () => void;
}

export function selectActiveMentor(
  state: RootState
): mentorActions.MentorState {
  return state.mentor;
}

export const useActiveMentor = (): UseActiveMentor => {
  const dispatch = useDispatch();
  const {
    data: mentor,
    error: mentorError,
    mentorStatus,
    userLoadedBy,
  } = useAppSelector((state) => state.mentor);
  const loginState = useAppSelector((state) => state.login);
  const isMentorLoading = mentorStatus === mentorActions.MentorStatus.LOADING;

  useEffect(() => {
    if (!loginState.accessToken) {
      return;
    }
    if (mentor && userLoadedBy === loginState.user?._id) {
      return;
    }
    loadMentor();
  }, [loginState.user?._id]);

  const loadMentor = (mentorId?: string) => {
    if (isMentorLoading) {
      return;
    }
    if (!loginState.accessToken) {
      dispatch({
        type: mentorActions.MentorStatus.FAILED,
        payload: "Cannot load mentor if unauthenticated.",
      });
    } else {
      dispatch(mentorActions.loadMentor({ mentorId }));
    }
  };

  const clearMentorError = () => {
    dispatch(mentorActions.mentorSlice.actions.clearError());
  };

  const onMentorUpdated = (mentor: Mentor) => {
    if (!mentor || isMentorLoading) {
      return;
    }
    dispatch(mentorActions.updateMentor(mentor));
  };

  return {
    mentor,
    mentorError,
    mentorStatus,
    isMentorLoading,
    loadMentor,
    clearMentorError,
    onMentorUpdated,
  };
};
