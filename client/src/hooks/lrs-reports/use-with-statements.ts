/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { useWithXapi } from "./use-with-xapi";
import { StatementsResponse, Statement } from "@xapi/xapi";
import React from "react";

export interface UseWithStatements {
  getStatements: (
    startDate: string,
    endDate: string
  ) => Promise<Statement[] | undefined>;
  xApiLoaded: boolean;
}

const MAX_FETCHES = 50;

export function useWithStatements(): UseWithStatements {
  const { xApi } = useWithXapi();
  const [statementsInState, setStatementsInState] = React.useState<Statement[]>(
    []
  );
  const [lastFetchedStartDate, setLastFetchedStartDate] =
    React.useState<string>("");
  const [lastFetchedEndDate, setLastFetchedEndDate] =
    React.useState<string>("");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function hasMore(object: any): object is StatementsResponse {
    return "more" in object;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function hasStatements(object: any): object is StatementsResponse {
    return "statements" in object;
  }

  async function recursivelyFetchMoreStatements(
    relativeUrl: string,
    statements: Statement[],
    totalFetches: number
  ): Promise<Statement[]> {
    if (!xApi) {
      throw new Error("No xApi initialized");
    }
    if (totalFetches >= MAX_FETCHES) {
      console.error("too many page fetches, try a smaller date range");
      return statements;
    }
    const fetchMoreResponse = await xApi.getMoreStatements(relativeUrl);
    const moreFetchedData = fetchMoreResponse.data;
    if (hasMore(moreFetchedData) && moreFetchedData.more) {
      return recursivelyFetchMoreStatements(
        moreFetchedData.more,
        [...statements, ...moreFetchedData.statements],
        totalFetches + 1
      );
    } else if (hasStatements(moreFetchedData)) {
      return [...statements, ...moreFetchedData.statements];
    } else {
      console.error(JSON.stringify(moreFetchedData));
      throw new Error(
        "unknown response data type, expected StatementsResponse"
      );
    }
  }

  const getStatements = async (startDate: string, endDate: string) => {
    if (!xApi) {
      throw new Error("No xApi initialized");
    }
    if (
      startDate == lastFetchedStartDate &&
      endDate == lastFetchedEndDate &&
      statementsInState.length
    ) {
      return statementsInState;
    }
    const startDateISO = new Date(startDate).toISOString();
    const endDateISO = new Date(endDate).toISOString();
    try {
      const statementsResponse = await xApi.getStatements({
        since: startDateISO,
        until: endDateISO,
      });
      let statements = statementsResponse.data.statements;
      if (statementsResponse.data.more) {
        statements = await recursivelyFetchMoreStatements(
          statementsResponse.data.more,
          statements,
          1
        );
      }
      setLastFetchedStartDate(startDate);
      setLastFetchedEndDate(endDate);
      setStatementsInState(statements);
      return statements;
    } catch (err) {
      console.error("Failed to get statements", err);
    }
  };

  return {
    getStatements,
    xApiLoaded: Boolean(xApi),
  };
}
