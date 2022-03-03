/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/

import { CancelTokenSource } from "axios";
import {
  UserRole,
  MentorType,
  Subject,
  Topic,
  Answer,
  Category,
  Question,
  Status,
  Media,
  Feedback,
  ClassifierAnswerType,
  EditType,
  Connection,
  Mentor,
  UploadTask,
  UserQuestion,
  TaskInfo,
} from "types";

export interface UserAccessTokenGQL {
  user: UserGQL;
  accessToken: string;
  expirationDate: string;
}

export interface UserGQL {
  _id: string;
  name: string;
  email: string;
  userRole: UserRole;
  defaultMentor: MentorGQL;
}

export interface MentorGQL {
  _id: string;
  name: string;
  firstName: string;
  title: string;
  email: string;
  allowContact: boolean;
  thumbnail: string;
  mentorType: MentorType;
  lastTrainedAt: string;
  isDirty: boolean;
  defaultSubject?: SubjectGQL;
  subjects: SubjectGQL[];
  topics: Topic[];
  answers: AnswerGQL[];
}

export interface SubjectGQL {
  _id: string;
  name: string;
  description: string;
  isRequired: boolean;
  categories: Category[];
  topics: Topic[];
  questions: SubjectQuestionGQL[];
}

export interface SubjectQuestionGQL {
  question: Question;
  category?: Category;
  topics: Topic[];
}

export interface AddOrUpdateQuestionGQL {
  question: string;
  category?: string;
  topics: string[];
}

export interface AnswerGQL {
  _id: string;
  question: Question;
  hasEditedTranscript: boolean;
  transcript: string;
  status: Status;
  media?: Media[];
  hasUntransferredMedia: boolean;
}

export interface UserQuestionGQL {
  _id: string;
  question: string;
  confidence: number;
  feedback: Feedback;
  mentor: MentorGQL;
  classifierAnswerType: ClassifierAnswerType;
  classifierAnswer: AnswerGQL;
  graderAnswer: AnswerGQL;
  updatedAt: string;
  createdAt: string;
}

export interface UploadTaskGQL {
  question: Question;
  taskList: TaskInfo[];
  uploadProgress: number;
  errorMessage?: string;
  isCancelling?: boolean;
  tokenSource?: CancelTokenSource;
  transcript?: string;
  media?: Media[];
}

export interface MentorExportJson {
  subjects: SubjectGQL[];
  questions: Question[];
  answers: AnswerGQL[];
}

export interface ImportPreview<T> {
  importData: T | undefined;
  curData: T | undefined;
  editType: EditType;
}

export interface MentorImportPreview {
  subjects: ImportPreview<SubjectGQL>[];
  questions: ImportPreview<Question>[];
  answers: ImportPreview<AnswerGQL>[];
}

export function convertMentorGQL(gql: MentorGQL): Mentor {
  return {
    ...gql,
    defaultSubject: gql.defaultSubject
      ? convertSubjectGQL(gql.defaultSubject)
      : undefined,
    subjects: gql.subjects?.map((s) => convertSubjectGQL(s)),
    answers: gql.answers?.map((a) => convertAnswerGQL(a)),
  };
}

export function convertSubjectGQL(gql: SubjectGQL): Subject {
  return {
    ...gql,
    questions: gql.questions?.map((sq) => ({
      ...sq,
      question: sq.question?._id,
    })),
  };
}

export function convertAnswerGQL(gql: AnswerGQL): Answer {
  return {
    ...gql,
    question: gql?.question?._id,
    questionClientId: gql?.question?.clientId,
  };
}

export function convertUserQuestionGQL(gql: UserQuestionGQL): UserQuestion {
  return {
    ...gql,
    mentor: convertMentorGQL(gql.mentor),
    classifierAnswer: convertAnswerGQL(gql.classifierAnswer),
    graderAnswer: convertAnswerGQL(gql.graderAnswer),
  };
}

export function convertUploadTaskGQL(gql: UploadTaskGQL): UploadTask {
  return {
    ...gql,
    question: gql.question._id,
  };
}

export function convertConnectionGQL<T, U>(
  gql: Connection<T>,
  convert: (gql: T) => U
): Connection<U> {
  return {
    ...gql,
    edges: gql.edges.map((edge) => ({
      ...edge,
      node: convert(edge.node),
    })),
  };
}
