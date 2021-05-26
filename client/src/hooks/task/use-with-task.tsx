/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useReducer, useState } from "react";
import { equals } from "helpers";
import { AsyncJob, JobState, TaskStatus } from "types";
import {
  TaskActionType,
  TaskError,
  TaskReducer,
  TaskState,
} from "./task-reducer";
import useInterval from "./use-interval";

const initialState: TaskState = {
  isPolling: false,
  error: undefined,
};

export interface Task<T, U> {
  isPolling: boolean;
  error: TaskError | undefined;
  status: TaskStatus<T> | undefined;
  statusUrl: string | undefined;
  startTask: (params: U) => void;
  clearError: () => void;
}

export function useWithTask<T, U>(
  start: (params: U) => Promise<AsyncJob>,
  poll: (statusUrl: string) => Promise<TaskStatus<T>>,
  pollingInterval = 1000
): Task<T, U> {
  const [statusUrl, setStatusUrl] = useState<string>();
  const [status, setStatus] = useState<TaskStatus<T>>();
  const [state, dispatch] = useReducer(TaskReducer, initialState);

  useInterval(
    (isCancelled) => {
      if (!statusUrl || isCancelled()) {
        return;
      }
      poll(statusUrl)
        .then((s) => {
          if (!equals(s, status)) {
            setStatus(s);
          }
          if (isCancelled()) {
            dispatch({ type: TaskActionType.POLLING, payload: false });
            return;
          }
          if (s.state === JobState.SUCCESS) {
            dispatch({ type: TaskActionType.POLLING, payload: false });
          }
          if (s.state === JobState.FAILURE) {
            dispatch({ type: TaskActionType.POLLING, payload: false });
            dispatch({
              type: TaskActionType.ERROR,
              payload: {
                message: "Failed job",
                error: "Job returned with fail",
              },
            });
          }
        })
        .catch((err: Error) => {
          console.error(err);
          dispatch({ type: TaskActionType.POLLING, payload: false });
          dispatch({
            type: TaskActionType.ERROR,
            payload: { message: "Failed job", error: err.message },
          });
        });
    },
    state.isPolling ? pollingInterval : null
  );

  function startTask(params: U) {
    if (state.isPolling) {
      return;
    }
    setStatus(undefined);
    setStatusUrl(undefined);
    start(params)
      .then((job) => {
        setStatusUrl(job.statusUrl);
        dispatch({ type: TaskActionType.POLLING, payload: true });
      })
      .catch((err) => {
        console.error(err);
        dispatch({ type: TaskActionType.POLLING, payload: false });
        dispatch({
          type: TaskActionType.ERROR,
          payload: { message: "Failed to start job", error: err.message },
        });
      });
  }

  function clearError() {
    dispatch({ type: TaskActionType.ERROR, payload: undefined });
  }

  return {
    isPolling: state.isPolling,
    error: state.error,
    status,
    statusUrl,
    startTask,
    clearError,
  };
}
