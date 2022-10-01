/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

export interface LoadingError {
  message: string;
  error: string;
}

export enum LoadingStatus {
  NONE = 0,
  LOADING = 1,
  SAVING = 2,
  SUCCEEDED = 3,
  FAILED = 4,
}

export interface LoadingState<T> {
  status: LoadingStatusType;
  data?: T;
  error?: LoadingError;
}

export interface LoadingAction<T> {
  type: LoadingActionType;
  dataPayload?: T;
  errorPayload?: LoadingError;
}

export enum LoadingActionType {
  LOADING_STARTED = "LOADING_STARTED",
  LOADING_SUCCEEDED = "LOADING_SUCCEEDED",
  LOADING_FAILED = "LOADING_FAILED",
  SAVING_STARTED = "SAVING_STARTED",
  SAVING_SUCCEEDED = "SAVING_SUCCEEDED",
  SAVING_FAILED = "SAVING_FAILED",
}

export enum LoadingStatusType {
  NONE = "NONE",
  SAVING = "SAVING",
  LOADING = "LOADING",
  SUCCESS = "SUCCESS",
  ERROR = "ERROR",
}

export function LoadingReducer<T>(
  state: LoadingState<T>,
  action: LoadingAction<T>
): LoadingState<T> {
  const { type, dataPayload, errorPayload } = action;
  switch (type) {
    case LoadingActionType.LOADING_STARTED:
      return { status: LoadingStatusType.LOADING };
    case LoadingActionType.SAVING_STARTED:
      return { status: LoadingStatusType.SAVING };
    case LoadingActionType.LOADING_SUCCEEDED:
    case LoadingActionType.SAVING_SUCCEEDED:
      console.log("storing");
      console.log(dataPayload);
      return { status: LoadingStatusType.SUCCESS, data: dataPayload };
    case LoadingActionType.LOADING_FAILED:
    case LoadingActionType.SAVING_FAILED:
      return {
        status: LoadingStatusType.ERROR,
        error: errorPayload,
        data: undefined,
      };
    default:
      return { status: LoadingStatusType.NONE };
  }
}
