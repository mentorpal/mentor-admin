export interface StaticResponse {
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

export interface MockGraphQLQuery {
  query: string,
  data: any | any[]
}

export function staticResponse(s: StaticResponse): StaticResponse {
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
  cy.intercept('POST', '**/graphql', (req) => {
    const { body } = req;
    const queryBody = body.query.replace(/\s+/g, " ").replace("\n", "").trim();
    for (const mock of mocks) {
      if (queryBody.indexOf(`mutation { ${mock.query}`) !== -1 ||
        queryBody.indexOf(`query { ${mock.query}`) !== -1
      ) {
        const data = Array.isArray(mock.data) ? mock.data : [mock.data];
        const val = data[Math.min(queryCalls[mock.query], data.length - 1)];
        const body = {};
        body[mock.query] = val;
        console.log(body);
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

export function cyMockGQL(query: string, data: any | any[]): MockGraphQLQuery {
  return {
    query,
    data
  }
}

export function cyMockLogin(): void {
  cy.intercept("**/config", { GOOGLE_CLIENT_ID: "test" });
  cy.setCookie("accessToken", "accessToken");
}