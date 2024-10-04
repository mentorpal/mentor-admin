/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { CLIENT_ENDPOINT, previewedMentor } from "api";
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import axios from "axios";
import {
  Answer,
  MediaType,
  Mentor,
  MentorPanel,
  MentorType,
  Organization,
  OrgViewPermissionType,
  OrgEditPermissionType,
  Status,
  User,
  UserRole,
  UtteranceName,
} from "types";
import { MentorGQL } from "types-gql";

interface UrlBuildOpts {
  includeEmptyParams?: boolean;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function equals<T>(val1: T, val2: T): boolean {
  return JSON.stringify(val1) === JSON.stringify(val2);
}

export function copyAndSet<T>(a: T[], i: number, item: T): T[] {
  return [...a.slice(0, i), item, ...a.slice(i + 1)];
}

export function copyAndRemove<T>(a: T[], i: number): T[] {
  return [...a.slice(0, i), ...a.slice(i + 1)];
}

export function copyAndMove<T>(a: T[], moveFrom: number, moveTo: number): T[] {
  const item = a[moveFrom];
  const removed = copyAndRemove(a, moveFrom);
  return [...removed.slice(0, moveTo), item, ...removed.slice(moveTo)];
}

export function toTitleCase(convert: string): string {
  return convert[0].toUpperCase() + convert.slice(1).toLowerCase();
}

export function urlBuild(
  base: string,
  params: Record<string, string | string[]>,
  opts?: UrlBuildOpts
): string {
  const query = new URLSearchParams();
  Object.keys(params).forEach((n) => {
    if (Array.isArray(params[n])) {
      (params[n] as string[]).forEach((value) => {
        appendKeyPairToQuery(query, n, value, opts);
      });
    } else {
      appendKeyPairToQuery(query, n, params[n] as string, opts);
    }
  });
  const qs = query.toString();
  return qs ? `${base}?${qs}` : base; // don't put ? if no query string
}

export function removeQueryParamFromUrl(param: string): void {
  const url = new URL(window.location.href);
  url.searchParams.delete(param);
  window.history.pushState({ path: url.href }, "", url.href);
}

/**
 * we have to distinguish between params where the value is `undefined` or `null`
 * (which we generally want to exclude) vs. params where the value is falsy but meaningful (e.g. `0`)
 */
function appendKeyPairToQuery(
  query: URLSearchParams,
  key: string,
  val: string,
  opts?: UrlBuildOpts
) {
  const pval = val !== null && typeof val !== "undefined" ? val : "";
  if (!(pval || opts?.includeEmptyParams)) {
    return;
  }
  query.append(key, pval);
}

export function launchMentor(
  mentorId: string,
  newTab?: boolean,
  previewingOwnMentor?: boolean,
  orgDomain?: string
): void {
  if (previewingOwnMentor) {
    previewedMentor(mentorId);
  }
  let hostname = location.hostname;
  if (hostname === "newdev.mentorpal.org") {
    hostname = "devmentorpal.org";
  } else if (hostname === "v2.mentorpal.org") {
    hostname = "qamentorpal.org";
  } else if (hostname === "careerfair.mentorpal.org") {
    hostname = "mentorpal.org";
  }
  const path = urlBuild(
    `${location.protocol}//${
      orgDomain ? `${orgDomain}.${hostname}` : hostname
    }${CLIENT_ENDPOINT}`,
    {
      mentor: mentorId,
    }
  );
  if (newTab) window.open(path, "_blank");
  else window.location.href = path;
}

export function launchMentorPanel(
  mentorIds: string[],
  newTab?: boolean,
  orgDomain?: string
): void {
  let hostname = location.hostname;
  if (hostname === "newdev.mentorpal.org") {
    hostname = "devmentorpal.org";
  } else if (hostname === "v2.mentorpal.org") {
    hostname = "qamentorpal.org";
  } else if (hostname === "careerfair.mentorpal.org") {
    hostname = "mentorpal.org";
  }
  let path = `${location.protocol}//${
    orgDomain ? `${orgDomain}.${hostname}` : hostname
  }${CLIENT_ENDPOINT}/?`;
  for (const mentorId of mentorIds) {
    path += `&mentor=${mentorId}`;
  }
  if (newTab) window.open(path, "_blank");
  else window.location.href = path;
}

export function getOrgHomeUrl(orgDomain: string): string {
  let hostname = location.hostname;
  if (hostname === "newdev.mentorpal.org") {
    hostname = "devmentorpal.org";
  } else if (hostname === "v2.mentorpal.org") {
    hostname = "qamentorpal.org";
  } else if (hostname === "careerfair.mentorpal.org") {
    hostname = "mentorpal.org";
  }
  if (orgDomain) {
    return `${location.protocol}//${orgDomain}.${hostname}`;
  } else {
    return `${location.protocol}//${hostname}`;
  }
}

export function launchOrg(orgDomain: string, newTab?: boolean): void {
  const path = getOrgHomeUrl(orgDomain);
  if (newTab) window.open(path, "_blank");
  else window.location.href = path;
}

export function getValueIfKeyExists<T>(
  key: string,
  dict: Record<string, T>
): T | null {
  if (!dict || !key) return null;
  const result = dict[key];
  return typeof result !== "undefined" ? result : null;
}

export function onTextInputChanged(
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  update: () => void
): void {
  const caret = e?.target.selectionStart;
  const element = e.target;
  window.requestAnimationFrame(() => {
    element.selectionStart = caret;
    element.selectionEnd = caret;
  });
  update();
}

export function loadSentry(): void {
  Sentry.init({
    dsn: "https://d137124c5ac546639e2536f860a92798@o1081855.ingest.sentry.io/6419221",
    integrations: [new BrowserTracing()],
    tracesSampleRate: process.env.STAGE == "prod" ? 0.2 : 0.0,
    environment: process.env.STAGE,
  });
}

export function getDaysSinceDate(date: string): number {
  const dateInEpoch = Date.parse(date);
  const dateInDays = Math.floor(dateInEpoch / 8.64e7);
  const currentInEpoch = Date.now();
  const currentInDays = Math.floor(currentInEpoch / 8.64e7);
  return currentInDays - dateInDays;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractErrorMessageFromError(err: any | unknown): string {
  if (err instanceof Error) {
    return err.message;
  } else if (axios.isAxiosError(err)) {
    return err.response?.data || err.message;
  } else {
    try {
      const error = JSON.stringify(err);
      return error;
    } catch (err) {
      return "Cannot stringify error, unknown error structure";
    }
  }
}

export function sanitizeWysywigString(str: string): string {
  // When exporting markdown from WYSYWIG editor, it automatically adds a ZERO WIDTH SPACE char and a newline char
  return str.replace(/\u200B/g, "").trimEnd();
}

export function isAnswerValid(
  answer: Answer,
  questionType: UtteranceName | undefined,
  mentorType: MentorType
): boolean {
  if (mentorType === MentorType.CHAT) {
    return Boolean(answer.transcript);
  }
  if (mentorType === MentorType.VIDEO) {
    return (
      Boolean(answer.media?.find((m) => m.type === MediaType.VIDEO)?.url) &&
      (questionType === UtteranceName.IDLE || Boolean(answer.transcript))
    );
  }
  return false;
}

export function isAnswerComplete(
  answer: Answer,
  questionType: UtteranceName | undefined,
  mentorType: MentorType
): boolean {
  return (
    answer.status !== Status.INCOMPLETE &&
    (answer.status === Status.COMPLETE ||
      isAnswerValid(answer, questionType, mentorType))
  );
}

export function doesVideoExist(answer: Answer): boolean {
  return Boolean(answer.media?.find((m) => m.type === MediaType.VIDEO)?.url);
}

export function getFileSizeInMb(file: File): number {
  return file.size / 1024 / 1024;
}

export function cosinesim(A: number[], B: number[]): number {
  let dotproduct = 0;
  let mA = 0;
  let mB = 0;
  for (let i = 0; i < A.length; i++) {
    // here you missed the i++
    dotproduct += A[i] * B[i];
    mA += A[i] * A[i];
    mB += B[i] * B[i];
  }
  mA = Math.sqrt(mA);
  mB = Math.sqrt(mB);
  const similarity = dotproduct / (mA * mB); // here you needed extra brackets
  return similarity;
}

export function canEditContent(user: User | undefined): boolean {
  if (!user) {
    return false;
  }
  const userRole = user.userRole;
  return (
    userRole === UserRole.CONTENT_MANAGER ||
    userRole === UserRole.ADMIN ||
    userRole === UserRole.SUPER_CONTENT_MANAGER ||
    userRole === UserRole.SUPER_ADMIN
  );
}

export function canViewMentorOnHome(
  mentor: MentorGQL,
  org?: Organization
): boolean {
  if (!mentor) {
    return false;
  }
  const orgPerm = mentor.orgPermissions?.find((op) =>
    equals(op.orgId, org?._id)
  );
  if (mentor.isPrivate) {
    return orgPerm?.viewPermission === OrgViewPermissionType.SHARE;
  }
  if (orgPerm) {
    return orgPerm.viewPermission !== OrgViewPermissionType.HIDDEN;
  }
  return true;
}

export function canViewMentorPanelOnHome(
  mentorPanel: MentorPanel,
  mentors: MentorGQL[],
  org?: Organization
): boolean {
  for (const mId of mentorPanel.mentors) {
    const mentor = mentors.find((m) => equals(m._id, mId));
    if (!mentor) {
      return false;
    }
    if (!canViewMentorOnHome(mentor, org)) {
      return false;
    }
  }
  return true;
}

export function canEditMentor(
  mentor: Mentor,
  user: User,
  orgs: Organization[] = []
): boolean {
  if (!mentor || !user) {
    return false;
  }
  const orgPermsThatManageMentor = mentor.orgPermissions?.filter(
    (op) =>
      op.editPermission === OrgEditPermissionType.MANAGE ||
      op.editPermission === OrgEditPermissionType.ADMIN
  );
  if (orgPermsThatManageMentor) {
    const orgIdsThatManageMentor = orgPermsThatManageMentor.map(
      (op) => op.orgId
    );
    const orgsThatManageMentor = orgs.filter((o) =>
      orgIdsThatManageMentor.includes(o._id)
    );
    for (const org of orgsThatManageMentor) {
      if (managesOrg(org, user)) {
        return true;
      }
    }
  }
  const userRole = user.userRole;
  return (
    user.defaultMentor._id === mentor._id ||
    userRole === UserRole.CONTENT_MANAGER ||
    userRole === UserRole.ADMIN ||
    userRole === UserRole.SUPER_CONTENT_MANAGER ||
    userRole === UserRole.SUPER_ADMIN
  );
}

export function canEditMentorPrivacy(
  mentor: Mentor,
  myUser: User,
  orgs: Organization[] = []
): boolean {
  if (!mentor || !myUser) {
    return false;
  }
  const orgPerms = mentor.orgPermissions?.filter(
    (perm) => perm.editPermission === OrgEditPermissionType.ADMIN
  );
  if (orgPerms) {
    const orgIds = orgPerms.map((op) => op.orgId);
    for (const org of orgs.filter((o) => orgIds.includes(o._id))) {
      if (
        org.members.find(
          (m) => m.user._id === myUser._id && m.role === UserRole.ADMIN
        )
      ) {
        return true;
      }
    }
  }
  const userRole = myUser.userRole;
  return (
    myUser.defaultMentor._id === mentor._id ||
    userRole === UserRole.CONTENT_MANAGER ||
    userRole === UserRole.ADMIN ||
    userRole === UserRole.SUPER_CONTENT_MANAGER ||
    userRole === UserRole.SUPER_ADMIN
  );
}

export function canEditUserRole(
  myUser: User,
  toEdit: User,
  role: UserRole
): boolean {
  // only admins and super-admins can edit user roles
  if (
    myUser.userRole !== UserRole.ADMIN &&
    myUser.userRole !== UserRole.SUPER_ADMIN
  ) {
    return false;
  }
  // only super admins can give super admin or super content manager permissions
  if (
    (role === UserRole.SUPER_ADMIN ||
      role === UserRole.SUPER_CONTENT_MANAGER) &&
    myUser.userRole !== UserRole.SUPER_ADMIN
  ) {
    return false;
  }
  // only super admins can edit a super admin or super content manager's permissions
  if (
    (toEdit.userRole == UserRole.SUPER_ADMIN ||
      toEdit.userRole == UserRole.SUPER_CONTENT_MANAGER) &&
    myUser.userRole !== UserRole.SUPER_ADMIN
  ) {
    return false;
  }
  return true;
}

export function canViewOrganization(org: Organization, user: User): boolean {
  if (!org) {
    return false;
  }
  if (org.isPrivate) {
    if (!user) {
      return false;
    }
    if (
      user.userRole === UserRole.SUPER_ADMIN ||
      user.userRole === UserRole.SUPER_CONTENT_MANAGER
    ) {
      return true;
    }
    return Boolean(org.members?.find((m) => equals(m.user._id, user._id)));
  }
  return true;
}

export function canEditOrganization(org: Organization, user: User): boolean {
  if (!org || !user) {
    return false;
  }
  if (
    user.userRole === UserRole.SUPER_ADMIN ||
    user.userRole === UserRole.SUPER_CONTENT_MANAGER
  ) {
    return true;
  }
  return Boolean(
    org.members?.find(
      (m) =>
        equals(m.user._id, user._id) &&
        (m.role === UserRole.CONTENT_MANAGER || m.role === UserRole.ADMIN)
    )
  );
}

/**
 * Checks that both arrays have the exact same elements in the same positions (and therefore are the same length).
 * T must be the element type contain in the array.
 */
export function arraysEqual<T>(a: T[], b: T[]): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

interface EnumObject {
  [enumValue: string]: string;
}

export function getEnumValues(e: EnumObject): string[] {
  return Object.keys(e).map((i) => e[i]);
}

export function isDateWithinLastMonth(date: string): boolean {
  const now = new Date();
  const then = new Date(date);
  const diff = now.getTime() - then.getTime();
  const diffDays = Math.ceil(diff / (1000 * 3600 * 24));
  return diffDays < 30;
}

export function isAdmin(user?: User): boolean {
  return (
    user?.userRole === UserRole.ADMIN || user?.userRole === UserRole.SUPER_ADMIN
  );
}

export function managesOrg(org: Organization, user: User): boolean {
  if (
    user.userRole === UserRole.SUPER_ADMIN ||
    user.userRole === UserRole.SUPER_CONTENT_MANAGER
  ) {
    return true;
  }
  return Boolean(
    org.members.find(
      (m) =>
        m.user._id === user._id &&
        (m.role === UserRole.ADMIN || m.role === UserRole.CONTENT_MANAGER)
    )
  );
}

export function isOrgMember(org: Organization, user: User): boolean {
  const usersOrgPermissions = user.defaultMentor.orgPermissions.find(
    (op) => op.orgId === org._id
  );
  return Boolean(
    org.members.find((m) => m.user._id === user._id) ||
      usersOrgPermissions?.editPermission === OrgEditPermissionType.ADMIN ||
      usersOrgPermissions?.editPermission === OrgEditPermissionType.MANAGE
  );
}
