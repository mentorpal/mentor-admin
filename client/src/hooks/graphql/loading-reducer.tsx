/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

export interface LoadingError {
  message: string;
  error: string;
}

export interface LoadingState {
  isLoading: boolean;
  isSaving: boolean;
  error: LoadingError | undefined;
}

export interface LoadingAction {
  type: LoadingActionType;
  payload: boolean | LoadingError | undefined;
}

export enum LoadingActionType {
  LOADING = "LOADING",
  SAVING = "SAVING",
  ERROR = "ERROR",
}

export function LoadingReducer(
  state: LoadingState,
  action: LoadingAction
): LoadingState {
  const { type, payload } = action;
  switch (type) {
    case LoadingActionType.LOADING:
      if (typeof payload !== "boolean") {
        return state;
      }
      return { ...state, isLoading: payload };
    case LoadingActionType.SAVING:
      if (typeof payload !== "boolean") {
        return state;
      }
      return { ...state, isSaving: payload };
    case LoadingActionType.ERROR:
      if (typeof payload !== "object" && typeof payload !== "undefined") {
        return state;
      }
      return { ...state, error: payload };
    default:
      return state;
  }
}
