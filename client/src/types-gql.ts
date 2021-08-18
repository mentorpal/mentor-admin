/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { CancelTokenSource } from "axios";
import {
  Topic,
  Category,
  Question,
  Media,
  ClassifierAnswerType,
  EditType,
  Feedback,
  MentorType,
  Status,
  UserRole,
  Subject,
  Connection,
  User,
  UserQuestion,
  Mentor,
  UserAccessToken,
  UploadStatus,
  UploadTask,
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
  questions: SubjectQuestionGQL[];
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

export interface AnswerGQL {
  _id: string;
  question: Question;
  transcript: string;
  status: Status;
  media?: Media[];
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
  taskId: string;
  question: Question;
  uploadStatus: UploadStatus;
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

export function convertUserAccessTokenGQL(
  gql: UserAccessTokenGQL
): UserAccessToken {
  return {
    ...gql,
    user: convertUserGQL(gql.user),
  };
}

export function convertUserGQL(gql: UserGQL): User {
  return {
    ...gql,
    defaultMentor: gql.defaultMentor._id,
  };
}

export function convertMentorGQL(gql: MentorGQL): Mentor {
  return {
    ...gql,
    defaultSubject: gql.defaultSubject?._id,
    subjects: gql.subjects.map((s) => s._id),
  };
}

export function convertSubjectGQL(gql: SubjectGQL): Subject {
  return {
    ...gql,
    questions: gql.questions.map((sq) => ({
      question: sq.question.question,
      category: sq.category?.id,
      topics: sq.topics.map((t) => t.id),
    })),
  };
}

export function convertUserQuestionGQL(gql: UserQuestionGQL): UserQuestion {
  return {
    ...gql,
    mentor: gql.mentor._id,
    classifierAnswer: gql.classifierAnswer._id,
    graderAnswer: gql.graderAnswer._id,
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
