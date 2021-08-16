/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "store/hooks";
import * as mentorActions from ".";
import { RootState } from "store/store";

export function selectActiveMentor(
  state: RootState
): mentorActions.MentorState {
  return state.mentor;
}

export function isMentorLoading(
  mentorState: mentorActions.MentorState
): boolean {
  return mentorState.mentorStatus === mentorActions.MentorStatus.LOADING;
}

export interface SelectFromMentorStateFunc<T> {
  (mentorState: mentorActions.MentorState, rootState: RootState): T;
}

export interface ActiveMentorActions {
  clearMentorError: () => void;
  loadMentor: (mentorId?: string) => void;
}

export function useActiveMentorActions(): ActiveMentorActions {
  const dispatch = useDispatch();
  const loginToken = useAppSelector((state) => state.login.accessToken);

  function loadMentor(mentorId?: string): void {
    if (!loginToken) {
      dispatch({
        type: mentorActions.MentorStatus.FAILED,
        payload: "Cannot load mentor if unauthenticated.",
      });
    } else {
      dispatch(mentorActions.loadMentor({ mentorId }));
    }
  }

  function clearMentorError(): void {
    dispatch(mentorActions.mentorSlice.actions.clearError());
  }

  return {
    clearMentorError,
    loadMentor,
  };
}
export function useActiveMentor<T>(selector: SelectFromMentorStateFunc<T>): T {
  const loginUser = useAppSelector((state) => state.login.user);
  const data = useAppSelector((state) => {
    return selector(selectActiveMentor(state), state);
  });
  const { loadMentor } = useActiveMentorActions();

  useEffect(() => {
    const data = useAppSelector((state) => state.mentor.data);
    const userLoadedBy = useAppSelector((state) => state.mentor.userLoadedBy);
    if (data && userLoadedBy === loginUser?._id) {
      return;
    }
    loadMentor();
  }, [loginUser?._id]);

  return data;
}

export default useActiveMentor;
