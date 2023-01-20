/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import {
  addOrUpdateOrganization,
  fetchOrganizations,
  updateOrgConfig,
} from "api";
import { Config, Connection, Organization } from "types";
import {
  UseStaticDataConnection,
  useWithStaticDataConnection,
} from "./use-with-static-data-connection";

export interface UseOrganizationData
  extends UseStaticDataConnection<Organization> {
  saveOrganization: (org: Partial<Organization>) => void;
  updateOrganizationConfig: (org: Organization, config: Config) => void;
}

export function useWithOrganizations(accessToken: string): UseOrganizationData {
  const {
    data,
    error,
    isLoading,
    searchParams,
    pageData,
    pageSearchParams,
    sortBy,
    filter,
    setPreFilter,
    setPostSort,
    nextPage,
    prevPage,
    reloadData,
  } = useWithStaticDataConnection<Organization>(fetch);

  function fetch(): Promise<Connection<Organization>> {
    return fetchOrganizations(accessToken, searchParams);
  }

  function updateOrganizationConfig(org: Organization, config: Config): void {
    updateOrgConfig(accessToken, org._id, config).then(() => reloadData());
  }

  function saveOrganization(org: Partial<Organization>): void {
    addOrUpdateOrganization(accessToken, org, org._id).then(() => reloadData());
  }

  return {
    data,
    error,
    isLoading,
    searchParams,
    pageSearchParams,
    pageData,
    sortBy,
    filter,
    setPreFilter,
    setPostSort,
    nextPage,
    prevPage,
    reloadData,
    updateOrganizationConfig,
    saveOrganization,
  };
}
