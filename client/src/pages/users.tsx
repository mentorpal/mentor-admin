/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";
import { makeStyles } from "tss-react/mui";
import NavBar from "components/nav-bar";
import { ErrorDialog, LoadingDialog } from "components/dialog";
import { useWithUsers } from "hooks/graphql/use-with-users";
import withAuthorizationOnly from "hooks/wrap-with-authorization-only";
import { User } from "types";
import withLocation from "wrap-with-location";
import { canEditMentor, isOrgMember } from "../helpers";
import useActiveMentor from "store/slices/mentor/useActiveMentor";
import { useWithOrganizations } from "hooks/graphql/use-with-organizations";
import { UsersTable } from "components/users/users-table";

const useStyles = makeStyles({ name: { UsersPage } })(() => ({
  root: {
    display: "flex",
    flexFlow: "column",
  },
  progress: {
    position: "fixed",
    top: "50%",
    left: "50%",
  },
}));

function UsersPage(props: { accessToken: string; user: User }): JSX.Element {
  const { accessToken } = props;
  const userPagin = useWithUsers(accessToken);
  const orgsPagin = useWithOrganizations(accessToken);
  const { classes: styles } = useStyles();
  const { switchActiveMentor } = useActiveMentor();
  const [viewArchivedMentors, setViewArchivedMentors] =
    useState<boolean>(false);
  const [viewUnapprovedMentors, setViewUnapprovedMentors] =
    useState<boolean>(false);
  const orgs = orgsPagin.data?.edges.map((e) => e.node) || [];
  const [selectedOrg, setSelectedOrg] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const orgParam = params.get("org");
    setSelectedOrg(orgParam || "");

    const viewUnapprovedMentors = params.get("unapproved");
    if (viewUnapprovedMentors === "true") {
      setViewUnapprovedMentors(true);
    }
    switchActiveMentor();
  }, []);

  useEffect(() => {
    if (!viewUnapprovedMentors) {
      userPagin.setPreFilter({ filter: filterEditableUsers });
    } else {
      userPagin.setPreFilter({
        filter: (u) => {
          return !u.defaultMentor.isPublicApproved && filterEditableUsers(u);
        },
      });
    }
  }, [
    location.search,
    orgsPagin.data,
    viewArchivedMentors,
    viewUnapprovedMentors,
  ]);

  useEffect(() => {
    if (viewArchivedMentors) {
      userPagin.setPostSort({ sort: sortArchivedMentors });
    } else {
      userPagin.setPostSort();
    }
  }, [viewArchivedMentors, userPagin.pageSearchParams]);

  function onToggleArchivedMentors(tf: boolean) {
    setViewArchivedMentors(tf);
  }

  function onToggleViewUnapprovedMentors(tf: boolean) {
    setViewUnapprovedMentors(tf);
  }

  function filterEditableUsers(u: User): boolean {
    if (!viewArchivedMentors && u.defaultMentor.isArchived) {
      return false;
    }
    if (selectedOrg) {
      const org = orgs.find((o) => o._id === selectedOrg);
      if (org) {
        const _isOrgMemeber = isOrgMember(org, u);
        return (
          _isOrgMemeber && canEditMentor(u.defaultMentor, props.user, [org])
        );
      }
    }
    return canEditMentor(u.defaultMentor, props.user, orgs);
  }

  function sortArchivedMentors(a: User, b: User): number {
    if (a.defaultMentor.isArchived === b.defaultMentor.isArchived) {
      return 0;
    }
    const sortByArchived =
      userPagin.pageSearchParams.sortBySub?.includes("isArchived");
    const sortAscending = userPagin.pageSearchParams.sortAscending;
    if (a.defaultMentor.isArchived) {
      if (sortByArchived) {
        return sortAscending ? -1 : 1;
      }
      return 1;
    } else {
      if (sortByArchived) {
        return sortAscending ? 1 : -1;
      }
      return -1;
    }
  }

  if (!userPagin.data) {
    return (
      <div className={styles.root}>
        <CircularProgress className={styles.progress} />
      </div>
    );
  }

  return (
    <div>
      <NavBar title="Manage Users" />
      <UsersTable
        accessToken={props.accessToken}
        user={props.user}
        userPagin={userPagin}
        orgs={orgs}
        viewArchivedMentors={viewArchivedMentors}
        viewUnapprovedMentors={viewUnapprovedMentors}
        onToggleViewUnapprovedMentors={onToggleViewUnapprovedMentors}
        onToggleArchivedMentors={onToggleArchivedMentors}
      />
      <ErrorDialog error={userPagin.userDataError} />
      <LoadingDialog title={userPagin.isLoading ? "Loading..." : ""} />
    </div>
  );
}

export default withAuthorizationOnly(withLocation(UsersPage));
