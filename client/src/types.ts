/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

export interface Connection<T> {
  edges: Edge<T>[];
  pageInfo: PageInfo;
}

export interface Edge<T> {
  cursor: string;
  node: T;
}

export interface PageInfo {
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  startCursor: string;
  endCursor: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface UserAccessToken {
  user: User;
  accessToken: string;
  expirationDate: string;
}

export interface Mentor {
  _id: string;
  name: string;
  firstName: string;
  title: string;
  isBuilt: boolean;
  subjects: Subject[];
  questions: Question[];
}

export interface QuestionSet {
  subject: Subject;
  questions: Question[];
}

export interface Subject {
  _id: string;
  name: string;
  description: string;
}

export interface Topic {
  _id: string;
  name: string;
  description: string;
}

export interface Question {
  id: string;
  question: string;
  subject?: Subject;
  topics: Topic[];
  video: string;
  transcript: string;
  status: Status;
  recordedAt: string;
}

export enum Status {
  INCOMPLETE = "Incomplete",
  COMPLETE = "Complete",
}
