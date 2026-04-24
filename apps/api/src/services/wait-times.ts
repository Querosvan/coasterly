import type { ParkLiveWait, ParkLiveWaitsResponse } from "@coasterly/types";

import {
  QUEUE_TIMES_ATTRIBUTION_LABEL,
  QUEUE_TIMES_ATTRIBUTION_URL,
  QUEUE_TIMES_SOURCE_NAME,
  buildQueueTimesPublicParkUrl,
  fetchQueueTimesParkQueue
} from "../integrations/queue-times.js";
import {
  getExternalSourceMapping,
  getParkBySlug,
  insertWaitTimeSnapshots,
  type WaitTimeSnapshotInput,
  listParkSourceMappingsBySource,
  listRideSourceMappingsForPark
} from "../db.js";

type ResolvedQueueTimesLiveWaits = {
  response: ParkLiveWaitsResponse;
  snapshots: WaitTimeSnapshotInput[];
};

export type QueueTimesIngestionParkResult = {
  parkSlug: string;
  sourceState: "mapped" | "unmapped";
  snapshotCount: number;
};

export type QueueTimesIngestionParkFailure = {
  parkSlug: string;
  message: string;
};

export type QueueTimesIngestionRunSummary = {
  startedAt: string;
  finishedAt: string;
  processedParks: number;
  insertedSnapshots: number;
  results: QueueTimesIngestionParkResult[];
  failures: QueueTimesIngestionParkFailure[];
};

const getSnapshotRideStatus = (isOpen: boolean | null) => {
  if (isOpen === true) {
    return "open";
  }

  if (isOpen === false) {
    return "closed";
  }

  return null;
};

const sortLiveWaits = (left: ParkLiveWait, right: ParkLiveWait) => {
  const leftIsOpen = left.isOpen === true;
  const rightIsOpen = right.isOpen === true;

  if (leftIsOpen !== rightIsOpen) {
    return leftIsOpen ? -1 : 1;
  }

  const leftWait = left.waitTimeMinutes ?? -1;
  const rightWait = right.waitTimeMinutes ?? -1;

  if (leftWait !== rightWait) {
    return rightWait - leftWait;
  }

  return left.rideName.localeCompare(right.rideName);
};

const resolveQueueTimesLiveWaitsForPark = async (
  parkSlug: string
): Promise<ResolvedQueueTimesLiveWaits | null> => {
  const park = await getParkBySlug(parkSlug);

  if (!park) {
    return null;
  }

  const parkMapping = await getExternalSourceMapping(
    QUEUE_TIMES_SOURCE_NAME,
    "park",
    park.id
  );
  const fetchedAt = new Date().toISOString();

  if (!parkMapping) {
    const response: ParkLiveWaitsResponse = {
      park,
      source: {
        name: QUEUE_TIMES_SOURCE_NAME,
        state: "unmapped",
        attributionLabel: QUEUE_TIMES_ATTRIBUTION_LABEL,
        attributionUrl: QUEUE_TIMES_ATTRIBUTION_URL,
        fetchedAt
      },
      rides: []
    };

    return {
      response,
      snapshots: []
    };
  }

  const [queueTimesPayload, rideMappings] = await Promise.all([
    fetchQueueTimesParkQueue(parkMapping.externalId),
    listRideSourceMappingsForPark(park.id, QUEUE_TIMES_SOURCE_NAME)
  ]);
  const liveRideByExternalId = new Map(
    queueTimesPayload.rides.map((ride) => [ride.externalId, ride])
  );
  const rides: ParkLiveWait[] = [];
  const snapshots: WaitTimeSnapshotInput[] = [];

  for (const mapping of rideMappings) {
    const liveRide = liveRideByExternalId.get(mapping.externalId);

    if (!liveRide) {
      continue;
    }

    rides.push({
      rideId: mapping.ride.id,
      rideSlug: mapping.ride.slug,
      rideName: mapping.ride.name,
      rideType: mapping.ride.rideType,
      sourceName: QUEUE_TIMES_SOURCE_NAME,
      sourceExternalId: mapping.externalId,
      ...(typeof liveRide.waitTimeMinutes === "number"
        ? { waitTimeMinutes: liveRide.waitTimeMinutes }
        : {}),
      ...(typeof liveRide.isOpen === "boolean"
        ? { isOpen: liveRide.isOpen }
        : {}),
      ...(liveRide.lastUpdated
        ? { sourceLastUpdated: liveRide.lastUpdated }
        : {}),
      ...(mapping.externalUrl
        ? { sourceUrl: mapping.externalUrl }
        : parkMapping.externalUrl
          ? { sourceUrl: parkMapping.externalUrl }
          : {})
    });

    snapshots.push({
      mappingId: mapping.id,
      sourceName: QUEUE_TIMES_SOURCE_NAME,
      entityType: "ride" as const,
      internalEntityId: mapping.internalEntityId,
      externalId: mapping.externalId,
      waitTimeMinutes: liveRide.waitTimeMinutes,
      isOpen: liveRide.isOpen,
      rideStatus: getSnapshotRideStatus(liveRide.isOpen),
      recordedAt: liveRide.lastUpdated ?? queueTimesPayload.fetchedAt
    });
  }

  rides.sort(sortLiveWaits);

  const response: ParkLiveWaitsResponse = {
    park,
    source: {
      name: QUEUE_TIMES_SOURCE_NAME,
      state: "mapped",
      attributionLabel: QUEUE_TIMES_ATTRIBUTION_LABEL,
      attributionUrl: QUEUE_TIMES_ATTRIBUTION_URL,
      fetchedAt: queueTimesPayload.fetchedAt,
      externalId: parkMapping.externalId,
      externalUrl:
        parkMapping.externalUrl ??
        buildQueueTimesPublicParkUrl(parkMapping.externalId)
    },
    rides
  };

  return {
    response,
    snapshots
  };
};

export const getQueueTimesLiveWaitsForPark = async (
  parkSlug: string
): Promise<ParkLiveWaitsResponse | null> => {
  const resolved = await resolveQueueTimesLiveWaitsForPark(parkSlug);

  return resolved?.response ?? null;
};

export const ingestQueueTimesSnapshotsForPark = async (
  parkSlug: string
): Promise<QueueTimesIngestionParkResult | null> => {
  const resolved = await resolveQueueTimesLiveWaitsForPark(parkSlug);

  if (!resolved) {
    return null;
  }

  if (resolved.snapshots.length > 0) {
    await insertWaitTimeSnapshots(resolved.snapshots);
  }

  return {
    parkSlug,
    sourceState: resolved.response.source.state,
    snapshotCount: resolved.snapshots.length
  };
};

export const ingestAllQueueTimesSnapshots = async (): Promise<
  QueueTimesIngestionRunSummary
> => {
  const startedAt = new Date().toISOString();
  const parkMappings = await listParkSourceMappingsBySource(
    QUEUE_TIMES_SOURCE_NAME
  );
  const results: QueueTimesIngestionParkResult[] = [];
  const failures: QueueTimesIngestionParkFailure[] = [];

  for (const mapping of parkMappings) {
    try {
      const result = await ingestQueueTimesSnapshotsForPark(mapping.parkSlug);

      if (result) {
        results.push(result);
      }
    } catch (error) {
      failures.push({
        parkSlug: mapping.parkSlug,
        message: error instanceof Error ? error.message : "Unknown ingestion error."
      });
    }
  }

  return {
    startedAt,
    finishedAt: new Date().toISOString(),
    processedParks: results.length + failures.length,
    insertedSnapshots: results.reduce(
      (total, result) => total + result.snapshotCount,
      0
    ),
    results,
    failures
  };
};
