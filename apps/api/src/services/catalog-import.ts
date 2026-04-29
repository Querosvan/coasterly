import type { Park, Ride } from "@coasterly/types";

import {
  QUEUE_TIMES_SOURCE_NAME,
  buildQueueTimesPublicParkUrl,
  buildQueueTimesPublicRideUrl,
  fetchQueueTimesParkDirectory,
  fetchQueueTimesParkQueue,
  type QueueTimesParkDirectoryEntry
} from "../integrations/queue-times.js";
import {
  listParkSourceMappingsBySource,
  listRideSourceMappingsForPark,
  upsertExternalSourceMapping,
  upsertParkCatalogRecord,
  upsertRideCatalogRecord
} from "../db.js";

type QueueTimesCatalogImportOptions = {
  parkLimit?: number;
  externalParkIds?: string[];
};

type QueueTimesCatalogImportFailure = {
  externalParkId: string;
  parkName: string;
  message: string;
};

export type QueueTimesCatalogImportSummary = {
  discoveredParks: number;
  selectedParks: number;
  processedParks: number;
  upsertedParks: number;
  upsertedRides: number;
  failures: QueueTimesCatalogImportFailure[];
  finishedAt: string;
};

const DEFAULT_IMPORTED_RIDE_TYPE = "attraction";

const slugify = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");

const normalizeParkDirectory = (parks: QueueTimesParkDirectoryEntry[]) => {
  const seenExternalIds = new Set<string>();

  return parks
    .filter((park) => {
      if (!park.externalId || seenExternalIds.has(park.externalId)) {
        return false;
      }

      seenExternalIds.add(park.externalId);
      return true;
    })
    .sort((left, right) => left.name.localeCompare(right.name));
};

const selectDirectoryParks = (
  parks: QueueTimesParkDirectoryEntry[],
  options: QueueTimesCatalogImportOptions
) => {
  const requestedIds =
    options.externalParkIds
      ?.map((externalId) => externalId.trim())
      .filter(Boolean) ?? [];

  const filteredParks =
    requestedIds.length > 0
      ? parks.filter((park) => requestedIds.includes(park.externalId))
      : parks;

  if (typeof options.parkLimit !== "number" || options.parkLimit < 1) {
    return filteredParks;
  }

  return filteredParks.slice(0, options.parkLimit);
};

const buildImportedParkSlug = (
  directoryPark: QueueTimesParkDirectoryEntry,
  mappedParkSlug: string | undefined
) => mappedParkSlug ?? slugify(directoryPark.name);

const buildImportedRideSlug = (rideName: string, mappedRideSlug?: string) =>
  mappedRideSlug ?? slugify(rideName);

const upsertImportedPark = async (
  directoryPark: QueueTimesParkDirectoryEntry,
  mappedParkSlug?: string
) => {
  const park = await upsertParkCatalogRecord({
    name: directoryPark.name,
    slug: buildImportedParkSlug(directoryPark, mappedParkSlug),
    country: directoryPark.country?.trim() || "Unknown",
    ...(directoryPark.continent ? { continent: directoryPark.continent } : {}),
    ...(directoryPark.timezone ? { timezone: directoryPark.timezone } : {}),
    ...(typeof directoryPark.latitude === "number"
      ? { latitude: directoryPark.latitude }
      : {}),
    ...(typeof directoryPark.longitude === "number"
      ? { longitude: directoryPark.longitude }
      : {}),
    status: "operating"
  });

  await upsertExternalSourceMapping({
    sourceName: QUEUE_TIMES_SOURCE_NAME,
    entityType: "park",
    internalEntityId: park.id,
    externalId: directoryPark.externalId,
    externalUrl: buildQueueTimesPublicParkUrl(directoryPark.externalId),
    lastVerifiedAt: new Date().toISOString()
  });

  return park;
};

const upsertImportedRide = async (input: {
  park: Park;
  externalParkId: string;
  externalRideId: string;
  rideName: string;
  mappedRideSlug?: string;
}): Promise<Ride> => {
  const ride = await upsertRideCatalogRecord({
    parkId: input.park.id,
    name: input.rideName,
    slug: buildImportedRideSlug(input.rideName, input.mappedRideSlug),
    status: "operating",
    rideType: DEFAULT_IMPORTED_RIDE_TYPE
  });

  await upsertExternalSourceMapping({
    sourceName: QUEUE_TIMES_SOURCE_NAME,
    entityType: "ride",
    internalEntityId: ride.id,
    externalId: input.externalRideId,
    externalUrl: buildQueueTimesPublicRideUrl(
      input.externalParkId,
      input.externalRideId
    ),
    lastVerifiedAt: new Date().toISOString()
  });

  return ride;
};

export const runQueueTimesCatalogImport = async (
  options: QueueTimesCatalogImportOptions = {}
): Promise<QueueTimesCatalogImportSummary> => {
  const discoveredDirectory = normalizeParkDirectory(
    await fetchQueueTimesParkDirectory()
  );
  const selectedParks = selectDirectoryParks(discoveredDirectory, options);
  const existingParkMappings = await listParkSourceMappingsBySource(
    QUEUE_TIMES_SOURCE_NAME
  );
  const parkSlugByExternalId = new Map(
    existingParkMappings.map((mapping) => [mapping.externalId, mapping.parkSlug])
  );

  const failures: QueueTimesCatalogImportFailure[] = [];
  let processedParks = 0;
  let upsertedParks = 0;
  let upsertedRides = 0;

  for (const directoryPark of selectedParks) {
    try {
      const park = await upsertImportedPark(
        directoryPark,
        parkSlugByExternalId.get(directoryPark.externalId)
      );
      upsertedParks += 1;
      processedParks += 1;

      const mappedRides = await listRideSourceMappingsForPark(
        park.id,
        QUEUE_TIMES_SOURCE_NAME
      );
      const rideSlugByExternalId = new Map(
        mappedRides.map((mapping) => [mapping.externalId, mapping.ride.slug])
      );
      const liveQueue = await fetchQueueTimesParkQueue(directoryPark.externalId);

      for (const liveRide of liveQueue.rides) {
        if (!liveRide.externalId || !liveRide.name.trim()) {
          continue;
        }

        const mappedRideSlug = rideSlugByExternalId.get(liveRide.externalId);

        if (mappedRideSlug) {
          await upsertImportedRide({
            park,
            externalParkId: directoryPark.externalId,
            externalRideId: liveRide.externalId,
            rideName: liveRide.name.trim(),
            mappedRideSlug
          });
        } else {
          await upsertImportedRide({
            park,
            externalParkId: directoryPark.externalId,
            externalRideId: liveRide.externalId,
            rideName: liveRide.name.trim()
          });
        }

        upsertedRides += 1;
      }
    } catch (error) {
      failures.push({
        externalParkId: directoryPark.externalId,
        parkName: directoryPark.name,
        message: error instanceof Error ? error.message : String(error)
      });
    }
  }

  return {
    discoveredParks: discoveredDirectory.length,
    selectedParks: selectedParks.length,
    processedParks,
    upsertedParks,
    upsertedRides,
    failures,
    finishedAt: new Date().toISOString()
  };
};
