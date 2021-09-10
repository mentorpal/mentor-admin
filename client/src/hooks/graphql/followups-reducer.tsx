/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

export interface FollowupsError {
  message: string;
  error: string;
}

export interface FollowupsPageState {
  status: FollowupsPageStatusType;
  error?: FollowupsError;
}

export interface FollowupsAction {
  type: FollowupsActionType;
  payload?: FollowupsError;
}

export enum FollowupsActionType {
  PROMPT_GENERATE_FOLLOWUPS = "PROMPT_GENERATE_FOLLOWUPS",
  GENERATING_FOLLOWUPS = "GENERATING_FOLLOWUPS",
  FAILED_GENERATING_FOLLOWUPS = "FAILED_GENERATING_FOLLOWUPS",
  SUCCESS_GENERATING_FOLLOWUPS = "SUCCESS_GENERATING_FOLLOWUPS",
  SAVING_SELECTED_FOLLOWUPS = "SAVING_SELECTED_FOLLOWUPS",
  FAILED_SAVING_SELECTED_FOLLOWUPS = "FAILED_SAVING_SELECTED_FOLLOWUPS",
  SUCCESS_SAVING_SELECTED_FOLLOWUPS = "SUCCESS_SAVING_SELECTED_FOLLOWUPS",
}

export enum FollowupsPageStatusType {
  INIT = "INIT",
  SAVING = "SAVING",
  LOADING = "LOADING",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

export function FollowupsReducer(
  state: FollowupsPageState,
  action: FollowupsAction
): FollowupsPageState {
  const { type, payload } = action;
  switch (type) {
    case FollowupsActionType.GENERATING_FOLLOWUPS:
      return { status: FollowupsPageStatusType.LOADING };
    case FollowupsActionType.SAVING_SELECTED_FOLLOWUPS:
      return { status: FollowupsPageStatusType.SAVING };
    case FollowupsActionType.SUCCESS_GENERATING_FOLLOWUPS:
    case FollowupsActionType.SUCCESS_SAVING_SELECTED_FOLLOWUPS:
      return { status: FollowupsPageStatusType.SUCCESS };
    case FollowupsActionType.FAILED_GENERATING_FOLLOWUPS:
    case FollowupsActionType.FAILED_SAVING_SELECTED_FOLLOWUPS:
      return { status: FollowupsPageStatusType.ERROR, error: payload };
    default:
      return { status: FollowupsPageStatusType.INIT };
  }
}
