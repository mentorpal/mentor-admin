/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { fetchTrainingStatus, trainMentor } from "api";
import { useEffect } from "react";
import { useWithConfig } from "store/slices/config/useWithConfig";
import { useWithLogin } from "store/slices/login/useWithLogin";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import { JobState, TrainingInfo } from "types";
import { Task, useWithTask } from "./use-with-task";

export function useWithTraining(
  pollingInterval = 1000
): Task<TrainingInfo, string> {
  const { state: configState } = useWithConfig();
  const { state: loginState } = useWithLogin();
  const { status, statusUrl, error, isPolling, startTask, clearError } =
    useWithTask<TrainingInfo, string>(train, poll, pollingInterval);
  const { loadMentor } = useActiveMentor();

  useEffect(() => {
    if (status?.state === JobState.SUCCESS) {
      loadMentor();
    }
  }, [status]);

  function train(mentorId: string) {
    return trainMentor(
      mentorId,
      loginState.accessToken || "",
      configState?.config?.classifierLambdaEndpoint
    );
  }

  function poll(statusUrl: string) {
    return fetchTrainingStatus(
      statusUrl,
      loginState.accessToken,
      configState?.config?.classifierLambdaEndpoint
    );
  }

  return {
    isPolling,
    error: error
      ? {
          message: "Oops, training failed. Please try again.",
          error: error?.error,
        }
      : error,
    status,
    statusUrl,
    startTask,
    clearError,
  };
}
