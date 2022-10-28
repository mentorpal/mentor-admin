/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect, useState } from "react";
import { Connection } from "types";
import { LoadingError } from "./loading-reducer";
import { UpdateFunc, useWithData } from "./use-with-data";

export interface SearchParams {
  limit: number;
  cursor: string;
  sortBy: string;
  sortAscending: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filter: Record<string, any>;
}

export interface UseDataConnection<T> {
  data?: Connection<T>;
  error?: LoadingError;
  isLoading: boolean;
  searchParams: SearchParams;
  editData: (edits: Partial<T>) => void;
  saveData: (action: UpdateFunc<Connection<T>>) => Promise<void>;
  reloadData: () => void;
  nextPage: () => void;
  prevPage: () => void;
  sortBy: (attribute: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filter: (f: Record<string, any>) => void;
  setSearchParams: React.Dispatch<React.SetStateAction<SearchParams>>;
}

export const defaultSearchParams: SearchParams = {
  limit: 20,
  cursor: "",
  sortBy: "",
  sortAscending: true,
  filter: {},
};

export function useWithDataConnection<T>(
  fetch: () => Promise<Connection<T>>,
  initalSearchParams?: Partial<SearchParams>
): UseDataConnection<T> {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    ...defaultSearchParams,
    ...initalSearchParams,
  });
  const { data, isLoading, error, editData, saveData, reloadData } =
    useWithData<Connection<T>>(fetch);

  useEffect(() => {
    reloadData();
  }, [searchParams]);

  function sortBy(id: string) {
    if (isLoading) {
      return;
    }
    const newSearchParams = { ...searchParams, cursor: "" };
    if (searchParams.sortBy === id) {
      newSearchParams["sortAscending"] = !searchParams.sortAscending;
    } else {
      newSearchParams["sortBy"] = id;
    }

    setSearchParams(newSearchParams);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function filter(f: Record<string, any>) {
    setSearchParams({ ...searchParams, filter: f });
  }

  function nextPage() {
    if (!data || isLoading) {
      return;
    }
    setSearchParams({
      ...searchParams,
      cursor: "next__" + data.pageInfo.endCursor,
    });
  }

  function prevPage() {
    if (!data || isLoading) {
      return;
    }
    setSearchParams({
      ...searchParams,
      cursor: "prev__" + data.pageInfo.startCursor,
    });
  }

  return {
    data,
    error,
    isLoading,
    searchParams,
    editData,
    saveData,
    reloadData,
    sortBy,
    filter,
    nextPage,
    prevPage,
    setSearchParams,
  };
}
