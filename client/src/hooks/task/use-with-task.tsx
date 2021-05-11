/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useReducer, useState } from "react";
import { AsyncJob, JobState, TaskStatus } from "types";
import { TaskActionType, TaskReducer, TaskState } from "./task-reducer";
import useInterval from "./use-interval";

const initialState: TaskState = {
  isPolling: false,
};

export function useWithTask<T, U>(
  start: (params: U) => Promise<AsyncJob>,
  poll: (statusUrl: string) => Promise<TaskStatus<T>>,
  pollingInterval = 1000
) {
  const [statusUrl, setStatusUrl] = useState<string>();
  const [status, setStatus] = useState<TaskStatus<T>>();
  const [state, dispatch] = useReducer(TaskReducer, initialState);

  useInterval(
    (isCancelled) => {
      if (!statusUrl || isCancelled()) {
        return;
      }
      poll(statusUrl)
        .then((status) => {
          setStatus(status);
          if (isCancelled()) {
            dispatch({ type: TaskActionType.POLLING_END });
            return;
          }
          if (status.state === JobState.SUCCESS) {
            dispatch({ type: TaskActionType.POLLING_END });
          }
          if (status.state === JobState.FAILURE) {
            dispatch({ type: TaskActionType.POLLING_END });
          }
        })
        .catch((err: Error) => {
          console.error(err);
          dispatch({ type: TaskActionType.POLLING_END });
        });
    },
    state.isPolling ? pollingInterval : null
  );

  function startTask(params: U) {
    if (state.isPolling) {
      return;
    }
    start(params)
      .then((job) => {
        setStatusUrl(job.statusUrl);
        dispatch({ type: TaskActionType.POLLING_START });
      })
      .catch((err) => {
        console.error(err);
        dispatch({ type: TaskActionType.POLLING_END });
      });
  }

  return {
    isPolling: state.isPolling,
    status,
    statusUrl,
    startTask,
  };
}
