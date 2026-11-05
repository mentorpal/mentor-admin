/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React from "react";
import IndexPage from "pages/index";
import ConfigPage from "pages/config";
import FeedbackPage from "pages/feedback";
import FollowupsPage from "pages/followups";
import ImportExportPage from "pages/importexport";
import LrsReportsPage from "pages/lrsreports";
import OrganizationsPage from "pages/organizations";
import RecordPage from "pages/record";
import SetupPage from "pages/setup";
import SignupPage from "pages/signup";
import SubjectsPage from "pages/subjects";
import UsersPage from "pages/users";
import AuthorSubjectsPage from "pages/author/subjects";
import AuthorSubjectPage from "pages/author/subject";
import ImportQuestionsPage from "pages/author/subject/importquestions";

export const appRoutes: { path: string; Component: React.ComponentType }[] = [
  { path: "/", Component: IndexPage },
  { path: "/config", Component: ConfigPage },
  { path: "/feedback", Component: FeedbackPage },
  { path: "/followups", Component: FollowupsPage },
  { path: "/importexport", Component: ImportExportPage },
  { path: "/lrsreports", Component: LrsReportsPage },
  { path: "/organizations", Component: OrganizationsPage },
  { path: "/record", Component: RecordPage },
  { path: "/setup", Component: SetupPage },
  { path: "/signup", Component: SignupPage },
  { path: "/subjects", Component: SubjectsPage },
  { path: "/users", Component: UsersPage },
  { path: "/author/subjects", Component: AuthorSubjectsPage },
  { path: "/author/subject", Component: AuthorSubjectPage },
  {
    path: "/author/subject/importquestions",
    Component: ImportQuestionsPage,
  },
];
