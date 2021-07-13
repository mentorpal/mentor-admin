/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect, useReducer, useState } from "react";
import { equals } from "helpers";
import {
  LoadingActionType,
  LoadingError,
  LoadingReducer,
  LoadingState,
} from "./loading-reducer";

const initialState: LoadingState = {
  isLoading: true,
  isSaving: false,
  error: undefined,
};

interface UpdateFunc<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback: (data: T) => Promise<any>;
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
  saveData: (update: UpdateFunc<T>) => Promise<void>;
}

export function useWithData<T>(fetch: () => Promise<T>): UseData<T> {
  const [data, setData] = useState<T>();
  const [editedData, setEditedData] = useState<T>();
  const [state, dispatch] = useReducer(LoadingReducer, initialState);

  // Load data from graphql
  useEffect(() => {
    if (!state.isLoading || state.isSaving) {
      return;
    }
    let mounted = true;
    fetch()
      .then((data) => {
        if (!mounted || !state.isLoading || state.isSaving) {
          return;
        }
        dispatch({ type: LoadingActionType.LOADING, payload: false });
        setData(data);
      })
      .catch((err) => {
        console.error(err);
        dispatch({
          type: LoadingActionType.ERROR,
          payload: { message: "Failed to load", error: err.message },
        });
        dispatch({ type: LoadingActionType.LOADING, payload: false });
      });
    return () => {
      mounted = false;
    };
  }, [state.isLoading]);

  function clearError() {
    dispatch({ type: LoadingActionType.ERROR, payload: undefined });
  }

  function reloadData() {
    if (state.isLoading || state.isSaving) {
      return;
    }
    dispatch({ type: LoadingActionType.LOADING, payload: true });
  }

  function editData(edits: Partial<T>) {
    if (state.isLoading || state.isSaving || !data) {
      return;
    }
    setEditedData({ ...data, ...(editedData || {}), ...edits });
  }

  async function saveData(update: UpdateFunc<T>): Promise<void> {
    if (state.isLoading || state.isSaving || !editedData || !update) {
      return;
    }
    dispatch({ type: LoadingActionType.SAVING, payload: true });
    await update
      .callback(editedData)
      .then((updated) => {
        if (state.isLoading) {
          return;
        }
        if (!updated) {
          dispatch({ type: LoadingActionType.SAVING, payload: false });
          return;
        }
        dispatch({ type: LoadingActionType.SAVING, payload: false });
        setData(editedData);
        setEditedData(undefined);
      })
      .catch((err) => {
        console.error(err);
        dispatch({
          type: LoadingActionType.ERROR,
          payload: { message: "Failed to save", error: err.message },
        });
        dispatch({ type: LoadingActionType.SAVING, payload: false });
      });
  }

  return {
    data,
    editedData: editedData || data,
    isEdited: editedData !== undefined && !equals(data, editedData),
    isLoading: state.isLoading,
    isSaving: state.isSaving,
    error: state.error,
    editData,
    saveData,
    reloadData,
    clearError,
  };
}
