/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useEffect, useState } from "react";
import { Connection, Edge } from "types";
import { LoadingError } from "./loading-reducer";
import {
  defaultSearchParams,
  SearchParams,
  useWithDataConnection,
} from "./use-with-data-connection";

const PAGE_LIMIT = 20;
export interface UseStaticDataConnection<T> {
  data?: Connection<T>;
  error?: LoadingError;
  isLoading: boolean;
  searchParams: SearchParams;
  searchData?: Connection<T>;
  pageData?: Connection<T>;
  pageSearchParams: SearchParams;
  pageSize?: number;
  reloadData: () => void;
  nextPage: () => void;
  prevPage: () => void;
  setPageSize: (n: number) => void;
  sortBy: (attribute: string, subAttribute?: string[]) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filter: (f: Record<string, any>) => void;
  setPreFilter: (pf?: PreFilter<T>) => void;
  setPostSort: (ps?: PostSort<T>) => void;
}

export interface StaticSearchParams extends SearchParams {
  sortBySub?: string[];
}

export interface PreFilter<T> {
  filter: (v: T) => boolean;
}

export interface PostSort<T> {
  sort: (a: T, b: T) => number;
}

export function useWithStaticDataConnection<T>(
  fetch: () => Promise<Connection<T>>,
  initalSearchParams?: Partial<SearchParams>
): UseStaticDataConnection<T> {
  const [page, setPage] = useState<number>(PAGE_LIMIT);
  const [pageLimit, setPageLimit] = useState<number>(PAGE_LIMIT);
  const [pageData, setPageData] = useState<Connection<T>>();
  const [pageSearchParams, setPageSearchParams] = useState<StaticSearchParams>({
    ...defaultSearchParams,
    ...initalSearchParams,
  });
  const [preFilter, setPreFilter] = useState<PreFilter<T>>();
  const [postSort, setPostSort] = useState<PostSort<T>>();
  const [searchData, setSearchData] = useState<Connection<T>>();

  const { data, searchParams, isLoading, error, reloadData } =
    useWithDataConnection<T>(fetch, {
      ...pageSearchParams,
      limit: 9999,
    });

  useEffect(() => {
    if (!data) {
      return;
    }
    const edges = sortFilter(data.edges);
    const pd: Connection<T> = {
      edges: edges.slice(page - pageLimit, page),
      pageInfo: {
        ...data.pageInfo,
        hasNextPage: edges.length > page,
        hasPreviousPage: page !== pageLimit,
      },
    };
    setPageData(pd);
    setSearchData({
      ...data,
      edges: data.edges
        .filter((e) => (preFilter ? preFilter.filter(e.node) : true))
        .sort((a, b) => {
          if (!postSort) {
            return 0;
          }
          return postSort.sort(a.node, b.node);
        }),
    });
  }, [data, page, pageSearchParams, preFilter, postSort]);

  function sortFilter(e: Edge<T>[]): Edge<T>[] {
    let edges = e.filter((edge) => !preFilter || preFilter.filter(edge.node));
    if (pageSearchParams.sortBy) {
      const sortAscending = pageSearchParams.sortAscending ? 1 : -1;
      edges = edges.sort((a, b) =>
        sortComparator(
          a.node,
          b.node,
          sortAscending,
          pageSearchParams.sortBy,
          pageSearchParams.sortBySub || []
        )
      );
    }
    if (postSort) {
      edges = edges.sort((a, b) => postSort.sort(a.node, b.node));
    }
    if (Object.keys(pageSearchParams.filter).length > 0) {
      edges = edges.filter((e) =>
        filterComparator(e.node, pageSearchParams.filter)
      );
    }
    return edges;
  }

  function sortComparator(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    a: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    b: any,
    ascending: number,
    attribute: string,
    subAttributes: string[]
  ): number {
    const aVal = a[attribute];
    const bVal = b[attribute];
    if (typeof aVal === "string" && typeof bVal === "string") {
      return aVal.localeCompare(bVal) * ascending;
    }
    if (typeof aVal === "number" && typeof bVal === "number") {
      return (aVal - bVal) * ascending;
    }
    if (typeof aVal === "object" && typeof bVal === "object") {
      if (subAttributes.length > 0) {
        return sortComparator(
          aVal,
          bVal,
          ascending,
          subAttributes[0],
          subAttributes.slice(1)
        );
      } else {
        return 0;
      }
    }
    if (typeof aVal !== typeof bVal) {
      if (aVal === null || aVal === undefined) {
        return 1;
      } else if (bVal === null || bVal === undefined) {
        return -1;
      }
    }
    return 0;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function filterComparator(node: any, filter: Record<string, any>): boolean {
    for (const [k, v] of Object.entries(filter)) {
      if (k === "$or" && Array.isArray(v)) {
        return v.some((f) => filterComparator(node, f));
      }
      if (k === "$and" && Array.isArray(v)) {
        return v.every((f) => filterComparator(node, f));
      }
      if (k === "$in" && Array.isArray(v)) {
        return v.find((v) => v === node);
      }
      if (
        typeof v === "number" &&
        typeof node[k] === "number" &&
        node[k] !== v
      ) {
        return false;
      }
      if (
        typeof v === "string" &&
        typeof node[k] === "string" &&
        !(
          node[k].toLowerCase() === v.toLowerCase() ||
          node[k].toLowerCase().includes(v.toLowerCase())
        )
      ) {
        return false;
      }
      if (
        typeof v === "boolean" &&
        typeof node[k] === "boolean" &&
        node[k] !== v
      ) {
        return false;
      }
      if (typeof v === "object" && typeof node[k] === "object") {
        return filterComparator(node[k], v);
      }
      if (typeof v === "object" && typeof node[k] !== "object") {
        return filterComparator(node[k], v);
      }
    }
    return true;
  }

  function sortBy(attribute: string, subAttribute?: string[]) {
    setPage(pageLimit);
    setPageSearchParams({
      ...pageSearchParams,
      sortBy: attribute,
      sortBySub: subAttribute,
      sortAscending:
        pageSearchParams.sortBy === attribute
          ? !pageSearchParams.sortAscending
          : pageSearchParams.sortAscending,
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function filter(f: Record<string, any>) {
    setPage(pageLimit);
    setPageSearchParams({ ...pageSearchParams, filter: f });
  }

  function nextPage(): void {
    if (hasNextPage()) {
      setPage(page + pageLimit);
    }
  }

  function prevPage(): void {
    if (hasPrevPage()) {
      setPage(page - pageLimit);
    }
  }

  function hasNextPage(): boolean {
    return sortFilter(data?.edges || []).length > page;
  }

  function hasPrevPage(): boolean {
    return page !== pageLimit;
  }

  function setPageSize(num: number): void {
    setPageLimit(num);
    setPage(num);
  }

  return {
    data,
    searchData,
    error,
    isLoading,
    searchParams,
    pageData,
    pageSearchParams,
    pageSize: pageLimit,
    reloadData,
    sortBy,
    filter,
    nextPage,
    prevPage,
    setPageSize,
    setPreFilter,
    setPostSort,
  };
}
