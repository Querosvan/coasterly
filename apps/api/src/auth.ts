import { randomBytes } from "node:crypto";

import type { FastifyReply, FastifyRequest } from "fastify";

import { findOrCreateUserFromAuthIdentity } from "./db.js";

const authSessionCookieName = "coasterly_session";
const authStateCookieName = "coasterly_oauth_state";

const googleAuthProvider = "google";
const googleAuthorizeUrl = "https://accounts.google.com/o/oauth2/v2/auth";
const googleTokenUrl = "https://oauth2.googleapis.com/token";
const googleUserInfoUrl = "https://openidconnect.googleapis.com/v1/userinfo";

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI?.trim();
const webBaseUrl = process.env.WEB_BASE_URL?.trim();
const sessionCookieSecret = process.env.SESSION_COOKIE_SECRET?.trim();

const isSecureCookie = process.env.NODE_ENV === "production";

type AuthSessionIdentity = {
  authProvider: string;
  authSubject: string;
};

type GoogleUserInfo = {
  sub: string;
  name?: string;
  email?: string;
  email_verified?: boolean;
};

const baseCookieOptions = {
  path: "/",
  httpOnly: true,
  secure: isSecureCookie,
  sameSite: isSecureCookie ? ("none" as const) : ("lax" as const)
};

const normalizeRelativeReturnTo = (value?: string | null) => {
  const normalizedValue = value?.trim();

  if (!normalizedValue || !normalizedValue.startsWith("/") || normalizedValue.startsWith("//")) {
    return "/";
  }

  return normalizedValue;
};

const getRequiredGoogleConfig = () => {
  if (
    !googleClientId ||
    !googleClientSecret ||
    !googleRedirectUri ||
    !webBaseUrl ||
    !sessionCookieSecret
  ) {
    throw new Error("Google auth is not fully configured.");
  }

  return {
    googleClientId,
    googleClientSecret,
    googleRedirectUri,
    webBaseUrl,
    sessionCookieSecret
  };
};

const parseSignedCookieJson = <T>(
  request: FastifyRequest,
  cookieName: string
): T | null => {
  const cookieValue = request.cookies[cookieName];

  if (!cookieValue) {
    return null;
  }

  const unsignedCookie = request.unsignCookie(cookieValue);

  if (!unsignedCookie.valid) {
    return null;
  }

  try {
    return JSON.parse(unsignedCookie.value) as T;
  } catch {
    return null;
  }
};

const buildGoogleAuthorizeHref = (state: string) => {
  const { googleClientId, googleRedirectUri } = getRequiredGoogleConfig();
  const params = new URLSearchParams({
    client_id: googleClientId,
    redirect_uri: googleRedirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "online",
    prompt: "select_account",
    state
  });

  return `${googleAuthorizeUrl}?${params.toString()}`;
};

const exchangeGoogleCode = async (code: string) => {
  const { googleClientId, googleClientSecret, googleRedirectUri } = getRequiredGoogleConfig();
  const response = await fetch(googleTokenUrl, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      code,
      client_id: googleClientId,
      client_secret: googleClientSecret,
      redirect_uri: googleRedirectUri,
      grant_type: "authorization_code"
    })
  });

  if (!response.ok) {
    throw new Error(`Google token exchange failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as { access_token?: string };

  if (!payload.access_token) {
    throw new Error("Google token response did not include an access token.");
  }

  return payload.access_token;
};

const fetchGoogleUserInfo = async (accessToken: string) => {
  const response = await fetch(googleUserInfoUrl, {
    headers: {
      authorization: `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`Google user info failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as GoogleUserInfo;

  if (!payload.sub) {
    throw new Error("Google user info did not include a subject.");
  }

  return payload;
};

export const isGoogleAuthConfigured = () => {
  try {
    getRequiredGoogleConfig();
    return true;
  } catch {
    return false;
  }
};

export const registerGoogleAuthStart = (
  reply: FastifyReply,
  returnTo?: string | null
) => {
  getRequiredGoogleConfig();

  const state = randomBytes(24).toString("hex");

  reply.setCookie(
    authStateCookieName,
    JSON.stringify({
      state,
      returnTo: normalizeRelativeReturnTo(returnTo)
    }),
    {
      ...baseCookieOptions,
      signed: true,
      maxAge: 60 * 10
    }
  );

  reply.redirect(buildGoogleAuthorizeHref(state));
};

export const completeGoogleAuth = async (
  request: FastifyRequest,
  reply: FastifyReply,
  options: {
    code?: string;
    state?: string;
  }
) => {
  const { webBaseUrl } = getRequiredGoogleConfig();

  const normalizedCode = options.code?.trim();
  const normalizedState = options.state?.trim();
  const storedState = parseSignedCookieJson<{ state: string; returnTo?: string }>(
    request,
    authStateCookieName
  );

  reply.clearCookie(authStateCookieName, baseCookieOptions);

  if (!normalizedCode || !normalizedState || !storedState || storedState.state !== normalizedState) {
    throw new Error("Invalid Google OAuth state.");
  }

  const accessToken = await exchangeGoogleCode(normalizedCode);
  const googleUser = await fetchGoogleUserInfo(accessToken);
  const currentUser = await findOrCreateUserFromAuthIdentity({
    authProvider: googleAuthProvider,
    authSubject: googleUser.sub,
    ...(googleUser.email_verified && googleUser.email
      ? { email: googleUser.email }
      : {}),
    ...(googleUser.name ? { name: googleUser.name } : {})
  });

  reply.setCookie(
    authSessionCookieName,
    JSON.stringify({
      authProvider: googleAuthProvider,
      authSubject: googleUser.sub
    } satisfies AuthSessionIdentity),
    {
      ...baseCookieOptions,
      signed: true,
      maxAge: 60 * 60 * 24 * 30
    }
  );

  reply.redirect(`${webBaseUrl}${normalizeRelativeReturnTo(storedState.returnTo)}`);

  return currentUser;
};

export const getSessionIdentityFromRequest = (
  request: FastifyRequest
): AuthSessionIdentity | null => parseSignedCookieJson<AuthSessionIdentity>(request, authSessionCookieName);

export const clearAuthSession = (reply: FastifyReply) => {
  reply.clearCookie(authSessionCookieName, baseCookieOptions);
  reply.clearCookie(authStateCookieName, baseCookieOptions);
};
