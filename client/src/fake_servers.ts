import { Mentor, User, UserAccessToken } from "./types";

export interface Schema {
  mentor?: Mentor;
  user?: User;
}

let state: Schema = {
}

export function getState(): Schema {
  return state;
}

export function login(accessToken: string): UserAccessToken {
  const user: User = {
    id: "fake_id",
    name: "Clint Anderson",
    email: "anything@x.com"
  }
  state = {
    ...state,
    user
  }
  return {
    user: user,
    accessToken,
    expirationDate: ""
  }
}

/**
 * This is temporary just for
 * the sprint where we're strictly focused on UI
 */
export function useFakeApis() {
  return process.env.GATSBY_USE_FAKE_APIS === "1";
}
