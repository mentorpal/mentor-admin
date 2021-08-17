/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAppSelector } from "store/hooks";
import { RootState } from "store/store";
import { Mentor } from "types";
import * as loginActions from "../login/actions";
import * as loginState from "../login";

export function selectActiveMentor(state: RootState): loginState.ActiveMentor {
  return state.login.activeMentor;
}

export function isActiveMentorLoading(): boolean {
  return useActiveMentor(
    (state) => state.mentorStatus === loginState.MentorStatus.LOADING
  );
}

export function isActiveMentorSaving(): boolean {
  return useActiveMentor(
    (state) => state.mentorStatus === loginState.MentorStatus.SAVING
  );
}

export interface SelectFromMentorStateFunc<T> {
  (mentorState: loginState.ActiveMentor, rootState: RootState): T;
}

export interface ActiveMentorActions {
  loadMentor: (mentorId?: string) => void;
  saveMentorDetails: (mentor: Mentor) => void;
  saveMentorSubjects: (mentor: Mentor) => void;
  clearMentorError: () => void;
}

export function useActiveMentorActions(): ActiveMentorActions {
  const dispatch = useDispatch();

  function loadMentor(mentorId?: string): void {
    dispatch(loginActions.loadMentor({ mentorId }));
  }

  function saveMentorDetails(data: Mentor): void {
    dispatch(loginActions.saveMentor(data));
  }

  function saveMentorSubjects(data: Mentor): void {
    dispatch(loginActions.saveMentorSubjects(data));
  }

  function clearMentorError(): void {
    dispatch(loginState.loginSlice.actions.clearError());
  }

  return {
    loadMentor,
    saveMentorDetails,
    saveMentorSubjects,
    clearMentorError,
  };
}

export function useActiveMentor<T>(selector: SelectFromMentorStateFunc<T>): T {
  const loginUser = useAppSelector((state) => state.login.user);
  const data = useAppSelector((state) => {
    return selector(selectActiveMentor(state), state);
  });
  const { loadMentor } = useActiveMentorActions();
  const mentor = useAppSelector((state) => state.login.activeMentor.data);
  const userLoadedBy = useAppSelector(
    (state) => state.login.activeMentor.userLoadedBy
  );

  useEffect(() => {
    if (mentor && userLoadedBy === loginUser?._id) {
      return;
    }
    loadMentor();
  }, [loginUser?._id]);

  return data;
}

export default useActiveMentor;
