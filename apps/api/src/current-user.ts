import type { FastifyRequest } from "fastify";

import { resolveCurrentUser } from "./db.js";
import { getSessionIdentityFromRequest } from "./auth.js";

export class CurrentUserResolutionError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 401) {
    super(message);
    this.name = "CurrentUserResolutionError";
    this.statusCode = statusCode;
  }
}

const readSingleHeaderValue = (
  value: string | string[] | undefined
): string | undefined => {
  const normalizedValue = Array.isArray(value) ? value[0] : value;
  const trimmedValue = normalizedValue?.trim();

  return trimmedValue ? trimmedValue : undefined;
};

export const getAuthIdentityFromRequest = (request: FastifyRequest) => {
  const headerAuthProvider = readSingleHeaderValue(
    request.headers["x-coasterly-auth-provider"]
  );
  const headerAuthSubject = readSingleHeaderValue(
    request.headers["x-coasterly-auth-subject"]
  );
  const sessionIdentity = getSessionIdentityFromRequest(request);
  const authProvider = headerAuthProvider ?? sessionIdentity?.authProvider;
  const authSubject = headerAuthSubject ?? sessionIdentity?.authSubject;

  return {
    ...(authProvider ? { authProvider } : {}),
    ...(authSubject ? { authSubject } : {})
  };
};

export const resolveRequestCurrentUser = async (request: FastifyRequest) => {
  try {
    return await resolveCurrentUser(getAuthIdentityFromRequest(request));
  } catch (error) {
    if (error instanceof Error) {
      if (
        error.message === "Auth identity is required." ||
        error.message === "Incomplete auth identity." ||
        error.message === "Auth identity is not linked to a Coasterly user."
      ) {
        throw new CurrentUserResolutionError(error.message, 401);
      }
    }

    throw error;
  }
};
