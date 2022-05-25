/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import { Mentor, TaskInfo, TrainingInfo, _Ref } from "./types";
import { login as loginDefault } from "../fixtures/login";
import { mentorDefault } from "../fixtures/mentor";
import { TaskStatus, UserAccessToken } from "./types";
import questions from "../fixtures/questions";

const TRAIN_STATUS_URL = `/train/status`;
const UPLOAD_STATUS_URL = `/upload/answer/status`;

interface StaticResponse {
  /**
   * Serve a fixture as the response body.
   */
  fixture?: string;
  /**
   * Serve a static string/JSON object as the response body.
   */
  body?: string | object | object[];
  /**
   * HTTP headers to accompany the response.
   * @default {}
   */
  headers?: { [key: string]: string };
  /**
   * The HTTP status code to send.
   * @default 200
   */
  statusCode?: number;
  /**
   * If 'forceNetworkError' is truthy, Cypress will destroy the browser connection
   * and send no response. Useful for simulating a server that is not reachable.
   * Must not be set in combination with other options.
   */
  forceNetworkError?: boolean;
  /**
   * Milliseconds to delay before the response is sent.
   */
  delayMs?: number;
  /**
   * Kilobits per second to send 'body'.
   */
  throttleKbps?: number;
}

interface MockGraphQLQuery {
  query: string;
  data: any | any[];
  params?: { statusCode: number };
}

function staticResponse(s: StaticResponse): StaticResponse {
  return {
    ...{
      headers: {
        "access-control-allow-origin": window.location.origin,
        "Access-Control-Allow-Credentials": "true",
      },
      ...s,
    },
  };
}

export function cySetup(cy) {
  cy.viewport(1280, 720);
  cy.clearLocalStorage();
}

export interface Config {
  googleClientId: string;
  urlVideoIdleTips: string;
  videoRecorderMaxLength: number;
  classifierLambdaEndpoint: string;
  uploadLambdaEndpoint: string;
}

export const CONFIG_DEFAULT: Config = {
  googleClientId: "fake-google-client-id",
  urlVideoIdleTips: "",
  videoRecorderMaxLength: 300,
  classifierLambdaEndpoint: "https://classifierendpoint.com/classifier",
  uploadLambdaEndpoint: "https://lambdaendpoint.com/upload",
};

export function mockGQLConfig(config: Partial<Config>): MockGraphQLQuery {
  return mockGQL("FetchConfig", {
    config: { ...CONFIG_DEFAULT, ...(config || {}) },
  });
}

export function cyInterceptGraphQL(cy, mocks: MockGraphQLQuery[]): void {
  const queryCalls: any = {};
  for (const mock of mocks) {
    queryCalls[mock.query] = 0;
  }
  cy.intercept("/graphql", (req) => {
    const { body } = req;
    const queryBody = body.query.replace(/\s+/g, " ").replace("\n", "").trim();
    let handled = false;
    for (const mock of mocks) {
      if (
        queryBody.match(new RegExp(`^(mutation|query) ${mock.query}[{(\\s]`))
      ) {
        const data = Array.isArray(mock.data) ? mock.data : [mock.data];
        const val = data[Math.min(queryCalls[mock.query], data.length - 1)];
        let body = val;
        req.alias = mock.query;
        req.reply(
          staticResponse({
            statusCode: mock.params?.statusCode || 200,
            body: {
              data: body,
              errors: null,
            },
          })
        );
        queryCalls[mock.query] += 1;
        handled = true;
        break;
      }
    }
    if (!handled) {
      console.error(`failed to handle query for...`);
      console.error(req);
    }
  });
}

export function mockGQL(
  query: string,
  data: any | any[],
  params?: { statusCode: number }
): MockGraphQLQuery {
  return {
    query,
    data,
    params,
  };
}

export function cyMockLogin(cy): void {
  cy.setLocalStorage("accessToken", "fake-access-token");
}

export function cyMockDefault(
  cy,
  args: {
    config?: Partial<Config>;
    gqlQueries?: MockGraphQLQuery[];
    noAccessTokenStored?: boolean;
    login?: UserAccessToken;
    mentor?: Mentor | _Ref | Mentor[];
    subject?: any;
    subjects?: any[];
    questions?: any[];
  } = {}
) {
  const config = args?.config || {};
  const gqlQueries = args?.gqlQueries || [];
  cySetup(cy);
  if (!args.noAccessTokenStored) {
    cyMockLogin(cy);
  }
  cyMockUpload(cy);
  cyMockRegenVTT(cy);
  cyMockCancelUpload(cy);

  const mentors = [];
  if (args.mentor) {
    if (Array.isArray(args.mentor)) {
      args.mentor.forEach((mentor) => {
        mentors.push({ mentor: mentor });
      });
    } else {
      mentors.push({ mentor: args.mentor });
    }
  } else {
    if (Array.isArray(mentorDefault)) {
      mentorDefault.forEach((mentor) => {
        mentors.push({ mentor: mentor });
      });
    } else {
      mentors.push({ mentor: mentorDefault });
    }
  }

  const subjectList = [];
  if (args.subject) {
    if (Array.isArray(args.subject)) {
      args.subject.forEach((subject) => {
        subjectList.push({ subject: subject });
      });
    } else {
      subjectList.push({ subject: args.subject });
    }
  }

  const subjectsList = [];
  if (args.subjects) {
    if (Array.isArray(args.subjects)) {
      args.subjects.forEach((subject) => {
        subjectsList.push({ subjects: subject });
      });
    } else {
      subjectsList.push({ subjects: args.subjects });
    }
  }

  const questionsResList = [];
  if (args.questions) {
    if (
      Array.isArray(args.questions) &&
      args.questions.length &&
      Array.isArray(args.questions[0])
    ) {
      args.questions.forEach((questionList) => {
        questionsResList.push({ questionsById: questionList });
      });
    } else {
      questionsResList.push({ questionsById: args.questions });
    }
  }

  cyInterceptGraphQL(cy, [
    mockGQLConfig(config),
    mockGQL("Login", { login: args.login || loginDefault }),
    // ...(args.mentor
    //   ? [mockGQL("mentor", args.mentor, true)]
    //   : [mockGQL("mentor", mentorDefault, true)]),
    ...[mockGQL("MentorFindOne", mentors)],
    ...(args.subject ? [mockGQL("Subject", subjectList)] : []),
    ...(args.subjects ? [mockGQL("Subjects", subjectsList)] : []),
    ...(args.questions
      ? [mockGQL("QuestionsById", questionsResList)]
      : [mockGQL("QuestionsById", { questionsById: questions })]),
    ...gqlQueries,
  ]);
}

export function cyAttachInputFile(
  cy,
  args: {
    fileName: string;
    mimeType?: string;
  }
): Promise<void> {
  const { fileName } = args;
  return cy.fixture(fileName).then((fileContent) => {
    cy.get('input[type="file"]').attachFile({
      fileContent: fileContent.toString(),
      fileName: fileName,
      mimeType: "video/mp4",
    });
  });
}

export function cyAttachUpload(cy, fileName?: string): Promise<void> {
  cy.intercept("**/videos/mentors/*/*.mp4", {
    fixture: fileName || "video.mp4",
  });
  return cy.fixture(fileName || "video.mp4").then((fileContent) => {
    cy.get('input[type="file"]').attachFile({
      fileContent: fileContent.toString(),
      fileName: fileName || "video.mp4",
      mimeType: "video/mp4",
    });
  });
}

export function cyMockTrain(
  cy,
  params: {
    statusUrl?: string;
    statusCode?: number;
  } = {}
): void {
  params = params || {};
  cy.intercept("/classifier/train", (req) => {
    req.alias = "train";
    req.reply(
      staticResponse({
        statusCode: params.statusCode || 200,
        body: {
          data: {
            statusUrl: params.statusUrl || TRAIN_STATUS_URL,
          },
          errors: null,
        },
        headers: {
          "Content-Type": "application/json",
        },
      })
    );
  });
}

export function cyMockTrainStatus(
  cy,
  params: {
    status?: TaskStatus<TrainingInfo>;
    statusUrl?: string;
    statusCode?: number;
  } = {}
): void {
  params = params || {};
  cy.intercept(`/classifier/${TRAIN_STATUS_URL}*`, (req) => {
    req.reply(
      staticResponse({
        statusCode: params.statusCode || 200,
        body: {
          data: params.status,
          errors: null,
        },
        headers: {
          "Content-Type": "application/json",
        },
      })
    );
  });
}

export function cyMockUpload(
  cy,
  params: {
    taskList?: TaskInfo[];
    statusUrl?: string;
    statusCode?: number;
  } = {}
): void {
  // First: intercept the presigned url request
  cy.intercept("/upload/url", (req) => {
    req.alias = "upload_url";
    req.reply(
      staticResponse({
        statusCode: 200,
        body: {
          data: {
            url: "https://fakesigneduploadurl.com",
            fields: {
              key: "video/bucket/path",
            },
          },
          errors: null,
        },
      })
    );
  });
  // Second: intercept the upload request to the presigned url
  cy.intercept("https://fakesigneduploadurl.com", (req) => {
    req.alias = "presigned_url_upload";
    req.reply(
      staticResponse({
        statusCode: 200,
      })
    );
  });

  // Third: intercept the actual answer upload request
  params = params || {};
  cy.intercept("/upload/answer", (req) => {
    req.alias = "upload";
    req.reply(
      staticResponse({
        statusCode: params.statusCode || 200,
        body: {
          data: {
            taskList: params.taskList || [{}],
            statusUrl: params.statusUrl || UPLOAD_STATUS_URL,
          },
          errors: null,
        },
        headers: {
          "Content-Type": "application/json",
        },
      })
    );
  });
}

export function cyMockRegenVTT(
  cy,
  params: {
    statusCode?: number;
  } = {}
): void {
  cy.intercept("/upload/answer/regen_vtt", (req) => {
    req.alias = "uploadThumbnail";
    req.reply(
      staticResponse({
        statusCode: params.statusCode || 200,
        body: {
          data: {
            regen_vtt: true,
          },
        },
        headers: {
          "Content-Type": "application/json",
        },
      })
    );
  });
}

export function cyMockUploadThumbnail(
  cy,
  args: {
    thumbnail: string;
  }
): void {
  const { thumbnail } = args;
  cy.intercept("/thumbnail", (req) => {
    req.alias = "uploadThumbnail";
    req.reply(
      staticResponse({
        statusCode: 200,
        body: {
          data: {
            data: {
              thumbnail,
            },
          },
        },
        headers: {
          "Content-Type": "application/json",
        },
      })
    );
  });
}

function cyMockCancelUpload(
  cy,
  params: {
    id?: string;
    cancelledId?: string;
    statusCode?: number;
  } = {}
): void {
  params = params || {};
  cy.intercept("/upload/answer/cancel", (req) => {
    req.alias = "cancelUpload";
    req.reply(
      staticResponse({
        statusCode: params.statusCode || 200,
        body: {
          data: {
            id: params.id || "fake_cancel_id",
            cancelledId: params.cancelledId || "fake_task_id",
          },
          errors: null,
        },
        headers: {
          "Content-Type": "application/json",
        },
      })
    );
  });
}

export function cyMockFollowUpQuestions(
  cy,
  params: {
    errors?: null | string[];
    data?: {};
    statusCode?: number;
  } = {}
): void {
  params = params || {};
  cy.intercept("POST", "/classifier/me/followups/*/*", (req) => {
    req.alias = "followups";
    req.reply(
      staticResponse({
        statusCode: params.statusCode || 200,
        body: {
          errors: params.errors,
          data: params.data || {},
        },
        headers: {
          "Content-Type": "application/json",
        },
      })
    );
  });
}
