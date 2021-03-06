/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect, useState } from "react";
import { Connection } from "types";
import { LoadingError } from "./loading-reducer";
import { useWithData } from "./use-with-data";

export interface SearchParams {
  limit: number;
  cursor: string;
  sortBy: string;
  sortAscending: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filter: Record<string, any>;
}

export interface UseDataConnection<T> {
  data: Connection<T> | undefined;
  error: LoadingError | undefined;
  isLoading: boolean;
  searchParams: SearchParams;
  reloadData: () => void;
  nextPage: () => void;
  prevPage: () => void;
  sortBy: (attribute: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filter: (f: Record<string, any>) => void;
}

const defaultSearchParams: SearchParams = {
  limit: 20,
  cursor: "",
  sortBy: "",
  sortAscending: true,
  filter: {},
};

export function useWithDataConnection<T>(
  fetch: () => Promise<Connection<T>>
): UseDataConnection<T> {
  const [searchParams, setSearchParams] =
    useState<SearchParams>(defaultSearchParams);
  const { data, isLoading, error, reloadData } =
    useWithData<Connection<T>>(fetch);

  useEffect(() => {
    reloadData();
  }, [searchParams]);

  function sortBy(id: string) {
    if (isLoading) {
      return;
    }
    searchParams.cursor = "";
    if (searchParams.sortBy === id) {
      searchParams.sortAscending = !searchParams.sortAscending;
    } else {
      searchParams.sortBy = id;
    }
    setSearchParams({ ...searchParams });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function filter(f: Record<string, any>) {
    setSearchParams({ ...searchParams, filter: f });
  }

  function nextPage() {
    if (!data || isLoading) {
      return;
    }
    searchParams.cursor = "next__" + data.pageInfo.endCursor;
    setSearchParams({ ...searchParams });
  }

  function prevPage() {
    if (!data || isLoading) {
      return;
    }
    searchParams.cursor = "prev__" + data.pageInfo.startCursor;
    setSearchParams({ ...searchParams });
  }

  return {
    data,
    error,
    isLoading,
    searchParams,
    reloadData,
    sortBy,
    filter,
    nextPage,
    prevPage,
  };
}
