/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { CLIENT_ENDPOINT } from "api";

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
  params: Record<string, string>,
  opts?: UrlBuildOpts
): string {
  const query = new URLSearchParams();
  Object.keys(params).forEach((n) => {
    /**
     * we have to distinguish between params where the value is `undefined` or `null`
     * (which we generally want to exclude) vs. params where the value is falsy but meaningful (e.g. `0`)
     */
    const pval =
      params[n] !== null && typeof params[n] !== "undefined" ? params[n] : "";
    if (!(pval || opts?.includeEmptyParams)) {
      return;
    }
    query.append(n, encodeURI(pval));
  });
  const qs = query.toString();
  return qs ? `${base}?${qs}` : base; // don't put ? if no query string
}

export function launchMentor(mentorId: string): void {
  const path = urlBuild(`${location.origin}${CLIENT_ENDPOINT}`, {
    mentor: mentorId,
  });
  window.location.href = path;
}

export function getValueIfKeyExists<T>(
  key: string,
  dict: Record<string, T>
): T | null {
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
