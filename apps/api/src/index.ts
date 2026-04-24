import Fastify from "fastify";
import cors from "@fastify/cors";

import {
  addRideCreditForUser,
  closeDatabase,
  getDemoUserRideStats,
  getRideStatsForUser,
  getParkBySlug,
  getRideBySlugs,
  initializeDatabase,
  listRideCreditsForUser,
  listRideCatalog,
  listDemoUserRideCredits,
  listParks,
  listRidesForPark,
  removeRideCreditForUser
} from "./db.js";
import {
  CurrentUserResolutionError,
  resolveRequestCurrentUser
} from "./current-user.js";
import { getQueueTimesLiveWaitsForPark } from "./services/wait-times.js";

import type {
  CurrentUserResponse,
  DemoUserStatsResponse,
  HealthResponse,
  ParkResponse,
  ParkLiveWaitsResponse,
  ParksResponse,
  RideCatalogResponse,
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

const corsOrigin = process.env.CORS_ORIGIN
  ?.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions =
  corsOrigin && corsOrigin.length > 0
    ? {
        origin: corsOrigin.length === 1 ? corsOrigin[0]! : corsOrigin
      }
    : {
        origin: false
      };

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

app.get<{ Querystring: { search?: string } }>("/parks", async (request) => {
  const response: ParksResponse = {
    parks: await listParks(request.query.search)
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
  };
}>("/rides", async (request) => {
  const sort = isRideSort(request.query.sort)
    ? request.query.sort
    : undefined;

  const response: RideCatalogResponse = {
    rides: await listRideCatalog({
      ...(request.query.search ? { search: request.query.search } : {}),
      ...(request.query.park ? { parkSlug: request.query.park } : {}),
      ...(request.query.rideType ? { rideType: request.query.rideType } : {}),
      ...(request.query.manufacturer
        ? { manufacturer: request.query.manufacturer }
        : {}),
      ...(sort ? { sort } : {})
    })
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
    park
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
      ride: rideRecord.ride
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
