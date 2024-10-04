/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import { Paper, TableContainer, Table, TableBody } from "@mui/material";
import { ColumnDef, ColumnHeader } from "components/column-header";
import { UseUserData } from "hooks/graphql/use-with-users";
import { useWithMentorTrainStatus } from "hooks/users/mentor-train-status";
import { useState, useEffect } from "react";
import { makeStyles } from "tss-react/mui";
import { Organization, User, UserRole } from "types";
import { UserItem } from "./user-item";
import { getTableColumns, TableFooter } from "./table-footer";

const useStyles = makeStyles({ name: { UsersTable } })(() => ({
  root: {
    display: "flex",
    flexFlow: "column",
  },
  container: {
    flexGrow: 1,
  },
}));

export function UsersTable(props: {
  accessToken: string;
  orgs: Organization[];
  selectedOrg: string;
  setSelectedOrg: (orgId: string) => void;
  userPagin: UseUserData;
  user: User;
  viewArchivedMentors: boolean;
  viewUnapprovedMentors: boolean;
  onToggleArchivedMentors: (v: boolean) => void;
  onToggleViewUnapprovedMentors: (v: boolean) => void;
}): JSX.Element {
  const { viewUnapprovedMentors, onToggleViewUnapprovedMentors, selectedOrg } =
    props;
  const { classes: styles } = useStyles();
  const [columns, setColumns] = useState<ColumnDef[]>([]);
  const { addMentorToPoll, mentorTrainStatusDict } = useWithMentorTrainStatus({
    mentors: props.userPagin.data?.edges.map((edge) => edge.node.defaultMentor),
  });

  useEffect(() => {
    const isAdmin =
      props.user.userRole === UserRole.ADMIN ||
      props.user.userRole === UserRole.SUPER_ADMIN;
    setColumns([...getTableColumns(props.viewArchivedMentors, isAdmin)]);
  }, [props.user, props.viewArchivedMentors]);

  return (
    <div className={styles.root}>
      <Paper className={styles.container}>
        <TableContainer style={{ height: "calc(100vh - 128px)" }}>
          <Table stickyHeader aria-label="sticky table">
            <ColumnHeader
              columns={columns}
              sortBy={props.userPagin.pageSearchParams.sortBy}
              sortSub={props.userPagin.pageSearchParams.sortBySub}
              sortAsc={props.userPagin.pageSearchParams.sortAscending}
              onSort={props.userPagin.sortBy}
            />
            <TableBody data-cy="users">
              {props.userPagin.pageData?.edges.map((edge, i) => (
                <UserItem
                  key={i}
                  edge={edge}
                  i={i}
                  accessToken={props.accessToken}
                  mentorTrainStatusDict={mentorTrainStatusDict}
                  addMentorToPoll={addMentorToPoll}
                  orgs={props.orgs}
                  userPagin={props.userPagin}
                  user={props.user}
                  viewArchivedMentors={props.viewArchivedMentors}
                />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <TableFooter
        user={props.user}
        orgs={props.orgs}
        selectedOrg={selectedOrg}
        setSelectedOrg={props.setSelectedOrg}
        userPagin={props.userPagin}
        viewArchivedMentors={props.viewArchivedMentors}
        viewUnapprovedMentors={viewUnapprovedMentors}
        onToggleArchivedMentors={props.onToggleArchivedMentors}
        onToggleViewUnapprovedMentors={onToggleViewUnapprovedMentors}
      />
    </div>
  );
}
