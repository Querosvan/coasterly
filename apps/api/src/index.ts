import Fastify from "fastify";
import cors from "@fastify/cors";

import {
  addDemoUserRideCredit,
  closeDatabase,
  getDemoUserRideStats,
  getParkBySlug,
  getRideBySlugs,
  initializeDatabase,
  listDemoUserRideCredits,
  listParks,
  listRidesForPark,
  removeDemoUserRideCredit
} from "./db.js";
import { getQueueTimesLiveWaitsForPark } from "./services/wait-times.js";

import type {
  DemoUserStatsResponse,
  HealthResponse,
  ParkResponse,
  ParkLiveWaitsResponse,
  ParksResponse,
  RideCreditMutationResponse,
  RideCreditsResponse,
  RideResponse,
  RidesResponse
} from "@coasterly/types";

const app = Fastify({
  logger: true
});

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

    const response: RidesResponse = {
      rides: await listRidesForPark(park.id, {
        ...(request.query.rideType
          ? { rideType: request.query.rideType }
          : {}),
        ...(request.query.manufacturer
          ? { manufacturer: request.query.manufacturer }
          : {}),
        ...(request.query.sort ? { sort: request.query.sort } : {})
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
    const credit = await addDemoUserRideCredit(
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
  }
);

app.delete<{ Params: { slug: string; rideSlug: string } }>(
  "/parks/:slug/rides/:rideSlug/credit",
  async (request, reply) => {
    const credit = await removeDemoUserRideCredit(
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
