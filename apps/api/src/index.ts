import Fastify from "fastify";
import cors from "@fastify/cors";

import { closeDatabase, initializeDatabase, listParks } from "./db.js";

import type { HealthResponse, ParksResponse } from "@coasterly/types";

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

app.get("/parks", async () => {
  const response: ParksResponse = {
    parks: await listParks()
  };

  return response;
});

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
