/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { fetchImportTask } from "api";
import useInterval from "hooks/task/use-interval";
import { useEffect, useState } from "react";
import { useWithLogin } from "store/slices/login/useWithLogin";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import { ImportTask } from "types";

export interface UseWithImportStatus {
  importTask: ImportTask | undefined;
  importInProgress: boolean;
  setImportInProgress: (b: boolean) => void;
}

export function useWithImportStatus(
  pollingInterval = 1000
): UseWithImportStatus {
  const { state: loginState } = useWithLogin();
  const { getData } = useActiveMentor();
  const mentorId = getData((state) => state.data?._id);
  const [importTask, setImportTask] = useState<ImportTask>();
  const [importInProgress, setImportInProgress] = useState<boolean>(false);
  const accessToken = loginState.accessToken;

  useEffect(() => {
    let mounted = true;
    if (!mentorId || !accessToken) {
      return;
    }
    fetchImportTask(mentorId, accessToken)
      .then((task) => {
        if (!mounted) {
          return;
        }
        setImportTask(task);
        setImportInProgress(Boolean(task));
      })
      .catch((err) => {
        console.error(err);
      });
    return () => {
      mounted = false;
    };
  }, [mentorId, accessToken]);

  useInterval(
    (isCancelled) => {
      if (!mentorId || !accessToken) {
        return;
      }
      fetchImportTask(mentorId, accessToken)
        .then((task) => {
          setImportTask(task);
          setImportInProgress(Boolean(task));
        })
        .catch((err) => {
          console.error(err);
        });
    },
    importInProgress ? pollingInterval : null
  );

  return {
    importTask,
    importInProgress,
    setImportInProgress,
  };
}
