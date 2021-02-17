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
  query: string,
  data: any | any[],
  me: boolean
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
  cy.server();
  cy.viewport(1280, 720);
}

export function cyInterceptGraphQL(cy, mocks: MockGraphQLQuery[]): void {
  const queryCalls: any = {}
  for (const mock of mocks) {
    queryCalls[mock.query] = 0;
  }
  cy.intercept('**/graphql', (req) => {
    const { body } = req;
    const queryBody = body.query.replace(/\s+/g, " ").replace("\n", "").trim();
    for (const mock of mocks) {
      if (queryBody.indexOf(`{ ${mock.query}(`) !== -1 || queryBody.indexOf(`{ ${mock.query} {`) !== -1) {
        const data = Array.isArray(mock.data) ? mock.data : [mock.data];
        const val = data[Math.min(queryCalls[mock.query], data.length - 1)];
        const body = {};
        if (mock.me) {
          const _inner = {};
          _inner[mock.query] = val;
          body["me"] = _inner;
        } else {
          body[mock.query] = val;
        }
        req.alias = mock.query;
        req.reply(staticResponse({
          body: {
            data: body,
            errors: null,
          }
        }));
        queryCalls[mock.query] = queryCalls[mock.query] + 1;
        break;
      }
    }
  });
}

export function cyMockGQL(query: string, data: any | any[], me = false): MockGraphQLQuery {
  return {
    query,
    data,
    me,
  }
}

export function cyMockLogin(): void {
  cy.intercept("**/config", { GOOGLE_CLIENT_ID: "test" });
  cy.setCookie("accessToken", "accessToken");
}

import { TrainStatus } from "./types";
const TRAIN_STATUS_URL = `/classifier/train/status`;

export function cyMockTrain(
  cy,
  params: {
    statusUrl?: string;
    statusCode?: number;
  } = {}
): void {
  params = params || {};
  cy.intercept("**/classifier/train", (req) => {
    req.alias = "train";
    req.reply(staticResponse({
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
    }))
  });
}

export function cyMockTrainStatus(
  cy,
  params: {
    status?: TrainStatus;
    statusUrl?: string;
    statusCode?: number;
  } = {}
): void {
  params = params || {};
  cy.intercept(`**/${params.statusUrl || TRAIN_STATUS_URL}`, (req) => {
    req.reply(staticResponse({
      statusCode: params.statusCode || 200,
      body: {
        data: params.status,
        errors: null,
      },
      headers: {
        "Content-Type": "application/json",
      },
    }))
  });
}
