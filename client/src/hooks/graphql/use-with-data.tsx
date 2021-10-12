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
  LoadingActionType,
} from "./loading-reducer";

const initialState: LoadingState = {
  status: LoadingStatusType.LOADING,
  error: undefined,
};

export interface UpdateFunc<T> {
  action: (data: T) => Promise<void>;
}

export interface UpdateAndReturnFunc<T> {
  action: (data: T) => Promise<T>;
}

export interface UseData<T> {
  data?: T;
  editedData?: T;
  isEdited: boolean;
  isLoading: boolean;
  isSaving: boolean;
  error?: LoadingError;
  reloadData: () => void;
  editData: (d: Partial<T>) => void;
  saveData: (action: UpdateFunc<T>) => Promise<void>;
  saveAndReturnData: (action: UpdateAndReturnFunc<T>) => Promise<T | undefined>;
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
        dispatch({ type: LoadingActionType.LOADING_SUCCEEDED });
        setData(data);
      })
      .catch((err) => {
        console.error(err);
        dispatch({
          type: LoadingActionType.LOADING_FAILED,
          payload: { message: "Failed to load", error: err.message },
        });
      });
  }, [state.status]);

  function reloadData() {
    if (actionInProgress) {
      return;
    }
    dispatch({ type: LoadingActionType.LOADING_STARTED });
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
    dispatch({ type: LoadingActionType.SAVING_STARTED });
    try {
      await update.action(editedData);
    } catch (err) {
      console.error(err);
      dispatch({
        type: LoadingActionType.SAVING_FAILED,
        payload: { message: "Failed to save", error: err.message },
      });
      return;
    }
    if (loading) {
      return;
    }
    dispatch({ type: LoadingActionType.SAVING_SUCCEEDED });
    setData(editedData);
    setEditedData(undefined);
  }

  async function saveAndReturnData(
    update: UpdateAndReturnFunc<T>
  ): Promise<T | undefined> {
    if (actionInProgress || !editedData || !update) {
      return;
    }
    dispatch({ type: LoadingActionType.SAVING_STARTED });
    try {
      const updated = await update.action(editedData);
      dispatch({ type: LoadingActionType.SAVING_SUCCEEDED });
      setData(updated);
      setEditedData(undefined);
      return updated;
    } catch (err) {
      console.error(err);
      dispatch({
        type: LoadingActionType.SAVING_FAILED,
        payload: { message: "Failed to save", error: err.message },
      });
      return;
    }
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
    saveAndReturnData,
    reloadData,
  };
}
