import { closeDatabase, initializeDatabase } from "../../api/src/db.js";
import { runQueueTimesCatalogImport } from "../../api/src/services/catalog-import.js";

const logPrefix = "[catalog-import]";

const parseParkLimit = (value: string | undefined) => {
  if (!value) {
    return undefined;
  }

  const parsedValue = Number.parseInt(value, 10);

  return Number.isFinite(parsedValue) && parsedValue > 0
    ? parsedValue
    : undefined;
};

const parseExternalParkIds = (value: string | undefined) => {
  const ids =
    value
      ?.split(",")
      .map((entry) => entry.trim())
      .filter(Boolean) ?? [];

  return ids.length > 0 ? ids : undefined;
};

const parseCsvList = (value: string | undefined) => {
  const values =
    value
      ?.split(",")
      .map((entry) => entry.trim())
      .filter(Boolean) ?? [];

  return values.length > 0 ? values : undefined;
};

const run = async () => {
  const startedAt = new Date().toISOString();
  console.log(`${logPrefix} starting Queue-Times catalog import at ${startedAt}`);

  try {
    await initializeDatabase();

    const parkLimit = parseParkLimit(process.env.QUEUE_TIMES_IMPORT_PARK_LIMIT);
    const externalParkIds = parseExternalParkIds(
      process.env.QUEUE_TIMES_IMPORT_PARK_IDS
    );
    const continents = parseCsvList(process.env.QUEUE_TIMES_IMPORT_CONTINENTS);
    const countries = parseCsvList(process.env.QUEUE_TIMES_IMPORT_COUNTRIES);

    const summary = await runQueueTimesCatalogImport({
      ...(typeof parkLimit === "number" ? { parkLimit } : {}),
      ...(externalParkIds ? { externalParkIds } : {}),
      ...(continents ? { continents } : {}),
      ...(countries ? { countries } : {})
    });

    console.log(
      `${logPrefix} discovered ${summary.discoveredParks} parks, selected ${summary.selectedParks}, processed ${summary.processedParks}, upserted ${summary.upsertedParks} parks, and upserted ${summary.upsertedRides} rides`
    );

    if (summary.failures.length > 0) {
      for (const failure of summary.failures) {
        console.error(
          `${logPrefix} park ${failure.externalParkId} (${failure.parkName}) failed: ${failure.message}`
        );
      }

      console.error(
        `${logPrefix} completed with ${summary.failures.length} failed park imports`
      );

      process.exitCode = 1;
      return;
    }

    console.log(`${logPrefix} completed successfully at ${summary.finishedAt}`);
  } catch (error) {
    console.error(
      `${logPrefix} run failed`,
      error instanceof Error ? error.message : error
    );
    process.exitCode = 1;
  } finally {
    await closeDatabase();
    console.log(`${logPrefix} database connections closed`);
  }
};

await run();
