/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { CLIENT_ENDPOINT } from "api";
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";
import axios from "axios";
import { Answer, MediaType, MentorType, Status, UtteranceName } from "types";

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

export function launchMentor(mentorId: string, newTab?: boolean): void {
  const path = urlBuild(`${location.origin}${CLIENT_ENDPOINT}`, {
    mentor: mentorId,
  });
  if (newTab) window.open(path, "_blank");
  else window.location.href = path;
}

export function launchMentorPanel(mentorIds: string[], newTab?: boolean): void {
  let path = `${location.origin}${CLIENT_ENDPOINT}/?`;
  for (const mentorId of mentorIds) {
    path += `&mentor=${mentorId}`;
  }
  if (newTab) window.open(path, "_blank");
  else window.location.href = path;
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

export function loadSentry(): void {
  Sentry.init({
    dsn: "https://d137124c5ac546639e2536f860a92798@o1081855.ingest.sentry.io/6419221",
    integrations: [new BrowserTracing()],
    tracesSampleRate: process.env.STAGE == "cf" ? 0.2 : 0.0,
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
  return str.replace(/\u200B/g, "").trimRight();
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
    answer.status === Status.COMPLETE ||
    (answer.status === Status.NONE &&
      isAnswerValid(answer, questionType, mentorType))
  );
}

export function getFileSizeInMb(file: File): number {
  return file.size / 1024 / 1024;
}

export function cosinesim(A: number[], B: number[]) {
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
