/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect, useReducer, useState } from "react";
import { equals } from "helpers";
import {
  LoadingStatusType,
  LoadingError,
  LoadingReducer,
  LoadingState,
} from "./loading-reducer";

const initialState: LoadingState = {
  status: LoadingStatusType.LOADING,
  error: undefined,
};

interface UpdateFunc<T> {
  action: (data: T) => Promise<void>;
}

export interface UseData<T> {
  data: T | undefined;
  editedData: T | undefined;
  isEdited: boolean;
  isLoading: boolean;
  isSaving: boolean;
  error: LoadingError | undefined;
  clearError: () => void;
  reloadData: () => void;
  editData: (d: Partial<T>) => void;
  saveData: (action: UpdateFunc<T>) => Promise<void>;
}

export function useWithData<T>(fetch: () => Promise<T>): UseData<T> {
  const [data, setData] = useState<T>();
  const [editedData, setEditedData] = useState<T>();
  const [state, dispatch] = useReducer(LoadingReducer, initialState);
  const loading = state.status === LoadingStatusType.LOADING;
  const saving = state.status === LoadingStatusType.SAVING;
  const actionInProgress = loading || saving;

  useEffect(() => {
    if (!loading) {
      return;
    }
    fetch()
      .then((data) => {
        dispatch({ statusType: LoadingStatusType.DONE });
        setData(data);
      })
      .catch((err) => {
        console.error(err);
        dispatch({
          statusType: LoadingStatusType.ERROR,
          payload: { message: "Failed to load", error: err.message },
        });
      });
  }, [state.status]);

  function clearError() {
    dispatch({ statusType: LoadingStatusType.CLEAR_ERROR });
  }

  function reloadData() {
    if (actionInProgress) {
      return;
    }
    dispatch({ statusType: LoadingStatusType.LOADING });
  }

  function editData(edits: Partial<T>) {
    if (actionInProgress || !data) {
      return;
    }
    setEditedData({ ...data, ...(editedData || {}), ...edits });
  }

  async function saveData(update: UpdateFunc<T>): Promise<void> {
    if (actionInProgress || !editedData || !update) {
      return;
    }
    dispatch({ statusType: LoadingStatusType.SAVING });
    try {
      await update.action(editedData);
    } catch (err) {
      console.error(err);
      dispatch({
        statusType: LoadingStatusType.ERROR,
        payload: { message: "Failed to save", error: err.message },
      });
      return;
    }
    if (loading) {
      return;
    }
    dispatch({ statusType: LoadingStatusType.DONE });
    setData(editedData);
    setEditedData(undefined);
  }

  return {
    data,
    editedData: editedData || data,
    isEdited: editedData !== undefined && !equals(data, editedData),
    isLoading: loading,
    isSaving: saving,
    error: state.error,
    editData,
    saveData,
    reloadData,
    clearError,
  };
}
