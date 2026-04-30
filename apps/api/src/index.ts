import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";

import {
  addRideCreditForUser,
  claimDailyRewardForUser,
  claimDemoUserDailyReward,
  closeDatabase,
  getDailyChallengeForUser,
  getDemoUserProgression,
  getDemoUserProfile,
  getDemoUserDailyChallenge,
  getDemoUserRideStats,
  getExternalSourceMapping,
  getUserProfile,
  getUserProfileBySlug,
  getUserProgression,
  getRideStatsForUser,
  getParkBySlug,
  getRideBySlugs,
  initializeDatabase,
  listCommunityHighlights,
  listRideCatalogOptions,
  listRideCreditsForUser,
  listRideCatalog,
  listDemoUserRideCredits,
  listParks,
  listRidesForPark,
  submitDailyChallengeAnswerForUser,
  submitDemoUserDailyChallengeAnswer,
  removeRideCreditForUser
} from "./db.js";
import {
  CurrentUserResolutionError,
  resolveRequestCurrentUser
} from "./current-user.js";
import {
  clearAuthSession,
  completeGoogleAuth,
  isGoogleAuthConfigured,
  registerGoogleAuthStart
} from "./auth.js";
import { getQueueTimesLiveWaitsForPark } from "./services/wait-times.js";
import {
  QUEUE_TIMES_SOURCE_NAME,
  buildQueueTimesPublicParkStatsUrl,
  buildQueueTimesPublicParkUrl,
  buildQueueTimesPublicRideUrl
} from "./integrations/queue-times.js";

import type {
  CommunityHighlightsResponse,
  CurrentUserResponse,
  DailyChallengeAnswerRequest,
  DailyChallengeResponse,
  DemoUserStatsResponse,
  HealthResponse,
  ParkResponse,
  ParkLiveWaitsResponse,
  ParksResponse,
  UserProfileResponse,
  UserProgressionResponse,
  RideCatalogResponse,
  RideCatalogOptionsResponse,
  RideCreditMutationResponse,
  RideCreditsResponse,
  RideResponse,
  RideSort,
  RidesResponse
} from "@coasterly/types";

const app = Fastify({
  logger: true
});

const isRideSort = (value: string | undefined): value is RideSort =>
  value === "name" || value === "opening_year" || value === "speed_kmh";

const parsePositiveInteger = (value: string | undefined) => {
  if (!value) {
    return undefined;
  }

  const parsedValue = Number.parseInt(value, 10);

  return Number.isFinite(parsedValue) && parsedValue >= 0
    ? Math.min(parsedValue, 5000)
    : undefined;
};

const corsOrigin = process.env.CORS_ORIGIN
  ?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions =
  corsOrigin && corsOrigin.length > 0
    ? {
        origin: corsOrigin.length === 1 ? corsOrigin[0]! : corsOrigin,
        credentials: true
      }
    : {
        origin: false
      };

const sessionCookieSecret = process.env.SESSION_COOKIE_SECRET?.trim();

if (!sessionCookieSecret) {
  app.log.warn(
    "SESSION_COOKIE_SECRET is not configured. Google auth session support will stay disabled."
  );
}

await app.register(cookie, {
  secret: sessionCookieSecret ?? "coasterly-dev-cookie-secret"
});

await app.register(cors, {
  // Keep hosted environments deny-by-default until allowed origins are set.
  ...corsOptions
});

app.addHook("onClose", async () => {
  await closeDatabase();
});

app.get("/health", async () => {
  const response: HealthResponse = {
    service: "api",
    status: "ok",
    timestamp: new Date().toISOString()
  };

  return response;
});

app.get<{
  Querystring: { returnTo?: string };
}>("/auth/google/start", async (request, reply) => {
  if (!isGoogleAuthConfigured()) {
    return reply.code(503).send({
      message: "Google auth is not configured."
    });
  }

  registerGoogleAuthStart(reply, request.query.returnTo);
});

app.get<{
  Querystring: { code?: string; state?: string };
}>("/auth/google/callback", async (request, reply) => {
  try {
    await completeGoogleAuth(request, reply, {
      ...(request.query.code ? { code: request.query.code } : {}),
      ...(request.query.state ? { state: request.query.state } : {})
    });
  } catch (error) {
    app.log.error(error);

    return reply.code(400).send({
      message: error instanceof Error ? error.message : "Google sign-in failed."
    });
  }
});

app.post("/auth/sign-out", async (_request, reply) => {
  clearAuthSession(reply);

  return reply.code(204).send();
});

app.get<{
  Querystring: { search?: string; limit?: string; offset?: string };
}>("/parks", async (request) => {
  const limit = parsePositiveInteger(request.query.limit);
  const offset = parsePositiveInteger(request.query.offset);
  const result = await listParks(request.query.search, {
    ...(typeof limit === "number" ? { limit } : {}),
    ...(typeof offset === "number" ? { offset } : {})
  });

  const response: ParksResponse = {
    parks: result.parks,
    pageInfo: result.pageInfo
  };

  return response;
});

app.get<{
  Querystring: {
    search?: string;
    park?: string;
    rideType?: string;
    manufacturer?: string;
    sort?: "name" | "opening_year" | "speed_kmh";
    limit?: string;
    offset?: string;
  };
}>("/rides", async (request) => {
  const sort = isRideSort(request.query.sort)
    ? request.query.sort
    : undefined;
  const limit = parsePositiveInteger(request.query.limit);
  const offset = parsePositiveInteger(request.query.offset);
  const result = await listRideCatalog({
    ...(request.query.search ? { search: request.query.search } : {}),
    ...(request.query.park ? { parkSlug: request.query.park } : {}),
    ...(request.query.rideType ? { rideType: request.query.rideType } : {}),
    ...(request.query.manufacturer
      ? { manufacturer: request.query.manufacturer }
      : {}),
    ...(sort ? { sort } : {}),
    ...(typeof limit === "number" ? { limit } : {}),
    ...(typeof offset === "number" ? { offset } : {})
  });

  const response: RideCatalogResponse = {
    rides: result.rides,
    pageInfo: result.pageInfo
  };

  return response;
});

app.get("/rides/options", async () => {
  const options = await listRideCatalogOptions();

  const response: RideCatalogOptionsResponse = {
    parks: options.parks,
    rideTypes: options.rideTypes,
    manufacturers: options.manufacturers
  };

  return response;
});

app.get<{ Params: { slug: string } }>("/parks/:slug", async (request, reply) => {
  const park = await getParkBySlug(request.params.slug);

  if (!park) {
    return reply.code(404).send({
      message: "Park not found."
    });
  }

  const response: ParkResponse = {
    park,
    ...(await getExternalSourceMapping(
      QUEUE_TIMES_SOURCE_NAME,
      "park",
      park.id
    ).then((mapping) =>
      mapping
        ? {
            queueTimes: {
              sourceName: QUEUE_TIMES_SOURCE_NAME,
              externalId: mapping.externalId,
              queueUrl:
                mapping.externalUrl ?? buildQueueTimesPublicParkUrl(mapping.externalId),
              statsUrl: buildQueueTimesPublicParkStatsUrl(mapping.externalId)
            }
          }
        : {}
    ))
  };

  return response;
});

app.get<{
  Params: { slug: string };
  Querystring: {
    rideType?: string;
    manufacturer?: string;
    sort?: string;
  };
}>(
  "/parks/:slug/rides",
  async (request, reply) => {
    const park = await getParkBySlug(request.params.slug);

    if (!park) {
      return reply.code(404).send({
        message: "Park not found."
      });
    }

    const sort = isRideSort(request.query.sort)
      ? request.query.sort
      : undefined;

    const response: RidesResponse = {
      rides: await listRidesForPark(park.id, {
        ...(request.query.rideType
          ? { rideType: request.query.rideType }
          : {}),
        ...(request.query.manufacturer
          ? { manufacturer: request.query.manufacturer }
          : {}),
        ...(sort ? { sort } : {})
      })
    };

    return response;
  }
);

app.get<{ Params: { slug: string } }>(
  "/parks/:slug/live-waits",
  async (request, reply) => {
    try {
      const liveWaits = await getQueueTimesLiveWaitsForPark(request.params.slug);

      if (!liveWaits) {
        return reply.code(404).send({
          message: "Park not found."
        });
      }

      const response: ParkLiveWaitsResponse = liveWaits;

      return response;
    } catch (error) {
      app.log.error(error);

      return reply.code(502).send({
        message: "Unable to load Queue-Times data right now."
      });
    }
  }
);

app.get("/demo-user/ride-credits", async () => {
  const credits = await listDemoUserRideCredits();

  const response: RideCreditsResponse = {
    user: credits.user,
    rideIds: credits.rideIds
  };

  return response;
});

app.get("/demo-user/stats", async () => {
  const stats = await getDemoUserRideStats();

  const response: DemoUserStatsResponse = {
    user: stats.user,
    totalRiddenRides: stats.totalRiddenRides,
    totalParksWithRiddenRides: stats.totalParksWithRiddenRides,
    parks: stats.parks
  };

  return response;
});

app.get("/demo-user/progression", async () => {
  const response: UserProgressionResponse = await getDemoUserProgression();

  return response;
});

app.get("/demo-user/profile", async () => {
  const response: UserProfileResponse = await getDemoUserProfile();

  return response;
});

app.get("/demo-user/daily-challenge", async () => {
  const response: DailyChallengeResponse = await getDemoUserDailyChallenge();

  return response;
});

app.post<{ Body: DailyChallengeAnswerRequest }>(
  "/demo-user/daily-challenge/answer",
  async (request, reply) => {
    const optionId = request.body?.optionId?.trim();

    if (!optionId) {
      return reply.code(400).send({
        message: "optionId is required."
      });
    }

    try {
      const response: DailyChallengeResponse = await submitDemoUserDailyChallengeAnswer(
        optionId
      );

      return response;
    } catch (error) {
      if (error instanceof Error && error.message === "Invalid daily challenge option.") {
        return reply.code(400).send({
          message: error.message
        });
      }

      throw error;
    }
  }
);

app.post("/demo-user/daily-challenge/reward", async () => {
  const response: DailyChallengeResponse = await claimDemoUserDailyReward();

  return response;
});

app.get("/community/highlights", async () => {
  const response: CommunityHighlightsResponse = {
    profiles: await listCommunityHighlights()
  };

  return response;
});

app.get("/me", async (request, reply) => {
  try {
    const response: CurrentUserResponse = await resolveRequestCurrentUser(request);

    return response;
  } catch (error) {
    if (error instanceof CurrentUserResolutionError) {
      return reply.code(error.statusCode).send({
        message: error.message
      });
    }

    throw error;
  }
});

app.get("/me/ride-credits", async (request, reply) => {
  try {
    const currentUser = await resolveRequestCurrentUser(request);
    const rideIds = await listRideCreditsForUser(currentUser.user);

    const response: RideCreditsResponse = {
      user: currentUser.user,
      rideIds
    };

    return response;
  } catch (error) {
    if (error instanceof CurrentUserResolutionError) {
      return reply.code(error.statusCode).send({
        message: error.message
      });
    }

    throw error;
  }
});

app.get("/me/stats", async (request, reply) => {
  try {
    const currentUser = await resolveRequestCurrentUser(request);
    const stats = await getRideStatsForUser(currentUser.user);

    const response: DemoUserStatsResponse = {
      user: stats.user,
      totalRiddenRides: stats.totalRiddenRides,
      totalParksWithRiddenRides: stats.totalParksWithRiddenRides,
      parks: stats.parks
    };

    return response;
  } catch (error) {
    if (error instanceof CurrentUserResolutionError) {
      return reply.code(error.statusCode).send({
        message: error.message
      });
    }

    throw error;
  }
});

app.get("/me/progression", async (request, reply) => {
  try {
    const currentUser = await resolveRequestCurrentUser(request);
    const response: UserProgressionResponse = await getUserProgression(
      currentUser.user
    );

    return response;
  } catch (error) {
    if (error instanceof CurrentUserResolutionError) {
      return reply.code(error.statusCode).send({
        message: error.message
      });
    }

    throw error;
  }
});

app.get("/me/profile", async (request, reply) => {
  try {
    const currentUser = await resolveRequestCurrentUser(request);
    const response: UserProfileResponse = await getUserProfile(currentUser.user);

    return response;
  } catch (error) {
    if (error instanceof CurrentUserResolutionError) {
      return reply.code(error.statusCode).send({
        message: error.message
      });
    }

    throw error;
  }
});

app.get("/me/daily-challenge", async (request, reply) => {
  try {
    const currentUser = await resolveRequestCurrentUser(request);
    const response: DailyChallengeResponse = await getDailyChallengeForUser(
      currentUser.user
    );

    return response;
  } catch (error) {
    if (error instanceof CurrentUserResolutionError) {
      return reply.code(error.statusCode).send({
        message: error.message
      });
    }

    throw error;
  }
});

app.post<{ Body: DailyChallengeAnswerRequest }>(
  "/me/daily-challenge/answer",
  async (request, reply) => {
    const optionId = request.body?.optionId?.trim();

    if (!optionId) {
      return reply.code(400).send({
        message: "optionId is required."
      });
    }

    try {
      const currentUser = await resolveRequestCurrentUser(request);
      const response: DailyChallengeResponse = await submitDailyChallengeAnswerForUser(
        currentUser.user,
        optionId
      );

      return response;
    } catch (error) {
      if (error instanceof CurrentUserResolutionError) {
        return reply.code(error.statusCode).send({
          message: error.message
        });
      }

      if (error instanceof Error && error.message === "Invalid daily challenge option.") {
        return reply.code(400).send({
          message: error.message
        });
      }

      throw error;
    }
  }
);

app.post("/me/daily-challenge/reward", async (request, reply) => {
  try {
    const currentUser = await resolveRequestCurrentUser(request);
    const response: DailyChallengeResponse = await claimDailyRewardForUser(
      currentUser.user
    );

    return response;
  } catch (error) {
    if (error instanceof CurrentUserResolutionError) {
      return reply.code(error.statusCode).send({
        message: error.message
      });
    }

    throw error;
  }
});

app.get<{ Params: { slug: string } }>("/users/:slug/profile", async (request, reply) => {
  const profile = await getUserProfileBySlug(request.params.slug);

  if (!profile) {
    return reply.code(404).send({
      message: "User not found."
    });
  }

  const response: UserProfileResponse = profile;

  return response;
});

app.get<{ Params: { slug: string; rideSlug: string } }>(
  "/parks/:slug/rides/:rideSlug",
  async (request, reply) => {
    const rideRecord = await getRideBySlugs(
      request.params.slug,
      request.params.rideSlug
    );

    if (!rideRecord) {
      return reply.code(404).send({
        message: "Ride not found."
      });
    }

    const response: RideResponse = {
      park: rideRecord.park,
      ride: rideRecord.ride,
      ...(await Promise.all([
        getExternalSourceMapping(
          QUEUE_TIMES_SOURCE_NAME,
          "park",
          rideRecord.park.id
        ),
        getExternalSourceMapping(
          QUEUE_TIMES_SOURCE_NAME,
          "ride",
          rideRecord.ride.id
        )
      ]).then(([parkMapping, rideMapping]) => ({
        ...(parkMapping
          ? {
              parkQueueTimes: {
                sourceName: QUEUE_TIMES_SOURCE_NAME,
                externalId: parkMapping.externalId,
                queueUrl:
                  parkMapping.externalUrl ??
                  buildQueueTimesPublicParkUrl(parkMapping.externalId),
                statsUrl: buildQueueTimesPublicParkStatsUrl(parkMapping.externalId)
              }
            }
          : {}),
        ...(parkMapping && rideMapping
          ? {
              rideQueueTimes: {
                sourceName: QUEUE_TIMES_SOURCE_NAME,
                externalId: rideMapping.externalId,
                queueUrl:
                  rideMapping.externalUrl ??
                  buildQueueTimesPublicRideUrl(
                    parkMapping.externalId,
                    rideMapping.externalId
                  ),
                statsUrl: buildQueueTimesPublicRideUrl(
                  parkMapping.externalId,
                  rideMapping.externalId
                )
              }
            }
          : {})
      })))
    };

    return response;
  }
);

app.put<{ Params: { slug: string; rideSlug: string } }>(
  "/parks/:slug/rides/:rideSlug/credit",
  async (request, reply) => {
    try {
      const currentUser = await resolveRequestCurrentUser(request);
      const credit = await addRideCreditForUser(
        currentUser.user,
        request.params.slug,
        request.params.rideSlug
      );

      if (!credit) {
        return reply.code(404).send({
          message: "Ride not found."
        });
      }

      const response: RideCreditMutationResponse = {
        user: credit.user,
        rideId: credit.rideId,
        ridden: true
      };

      return response;
    } catch (error) {
      if (error instanceof CurrentUserResolutionError) {
        return reply.code(error.statusCode).send({
          message: error.message
        });
      }

      throw error;
    }
  }
);

app.delete<{ Params: { slug: string; rideSlug: string } }>(
  "/parks/:slug/rides/:rideSlug/credit",
  async (request, reply) => {
    try {
      const currentUser = await resolveRequestCurrentUser(request);
      const credit = await removeRideCreditForUser(
        currentUser.user,
        request.params.slug,
        request.params.rideSlug
      );

      if (!credit) {
        return reply.code(404).send({
          message: "Ride not found."
        });
      }

      const response: RideCreditMutationResponse = {
        user: credit.user,
        rideId: credit.rideId,
        ridden: false
      };

      return response;
    } catch (error) {
      if (error instanceof CurrentUserResolutionError) {
        return reply.code(error.statusCode).send({
          message: error.message
        });
      }

      throw error;
    }
  }
);

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? "0.0.0.0";

const start = async () => {
  try {
    await initializeDatabase();
    await app.listen({ port, host });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
};

await start();
