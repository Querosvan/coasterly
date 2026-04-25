import type { ExternalSourceName } from "@coasterly/types";

export const QUEUE_TIMES_SOURCE_NAME: ExternalSourceName = "queue-times";
export const QUEUE_TIMES_ATTRIBUTION_LABEL = "Powered by Queue-Times.com";
export const QUEUE_TIMES_ATTRIBUTION_URL = "https://queue-times.com/";

const queueTimesBaseUrl =
  process.env.QUEUE_TIMES_BASE_URL?.trim() || QUEUE_TIMES_ATTRIBUTION_URL;

const officialQueueTimesParkUrl = (externalParkId: string) =>
  `${QUEUE_TIMES_ATTRIBUTION_URL}parks/${externalParkId}/queue_times`;

const officialQueueTimesParkStatsUrl = (externalParkId: string) =>
  `${QUEUE_TIMES_ATTRIBUTION_URL}parks/${externalParkId}/stats`;

const officialQueueTimesRideUrl = (
  externalParkId: string,
  externalRideId: string
) => `${QUEUE_TIMES_ATTRIBUTION_URL}parks/${externalParkId}/rides/${externalRideId}`;

export type QueueTimesParkSeedMapping = {
  parkSlug: string;
  externalId: string;
  externalUrl: string;
  notes?: string;
};

export type QueueTimesRideSeedMapping = {
  parkSlug: string;
  rideSlug: string;
  externalId: string;
  notes?: string;
};

export const queueTimesParkSeedMappings: QueueTimesParkSeedMapping[] = [
  {
    parkSlug: "europa-park",
    externalId: "51",
    externalUrl: officialQueueTimesParkUrl("51")
  },
  {
    parkSlug: "phantasialand",
    externalId: "56",
    externalUrl: officialQueueTimesParkUrl("56")
  },
  {
    parkSlug: "alton-towers",
    externalId: "1",
    externalUrl: officialQueueTimesParkUrl("1")
  },
  {
    parkSlug: "disneyland-park",
    externalId: "4",
    externalUrl: officialQueueTimesParkUrl("4")
  },
  {
    parkSlug: "parc-asterix",
    externalId: "9",
    externalUrl: officialQueueTimesParkUrl("9"),
    notes: "Queue-Times names this park 'Parc Asterix' with an accent in the public listing."
  },
  {
    parkSlug: "efteling",
    externalId: "160",
    externalUrl: officialQueueTimesParkUrl("160")
  },
  {
    parkSlug: "walibi-holland",
    externalId: "53",
    externalUrl: officialQueueTimesParkUrl("53")
  },
  {
    parkSlug: "portaventura-park",
    externalId: "19",
    externalUrl: officialQueueTimesParkUrl("19")
  },
  {
    parkSlug: "gardaland",
    externalId: "12",
    externalUrl: officialQueueTimesParkUrl("12")
  },
  {
    parkSlug: "energylandia",
    externalId: "317",
    externalUrl: officialQueueTimesParkUrl("317")
  },
  {
    parkSlug: "liseberg",
    externalId: "11",
    externalUrl: officialQueueTimesParkUrl("11")
  }
];

export const queueTimesRideSeedMappings: QueueTimesRideSeedMapping[] = [
  {
    parkSlug: "europa-park",
    rideSlug: "silver-star",
    externalId: "5604"
  },
  {
    parkSlug: "europa-park",
    rideSlug: "voltron-nevera",
    externalId: "13349",
    notes:
      "Queue-Times names this ride 'Voltron Nevera powered by Rimac'; the VirtualLine entry is intentionally ignored."
  },
  {
    parkSlug: "phantasialand",
    rideSlug: "taron",
    externalId: "6805"
  },
  {
    parkSlug: "phantasialand",
    rideSlug: "fly",
    externalId: "8236"
  },
  {
    parkSlug: "alton-towers",
    rideSlug: "nemesis-reborn",
    externalId: "4641"
  },
  {
    parkSlug: "alton-towers",
    rideSlug: "wicker-man",
    externalId: "5489"
  },
  {
    parkSlug: "disneyland-park",
    rideSlug: "big-thunder-mountain",
    externalId: "25"
  },
  {
    parkSlug: "disneyland-park",
    rideSlug: "star-wars-hyperspace-mountain",
    externalId: "8"
  },
  {
    parkSlug: "parc-asterix",
    rideSlug: "toutatis",
    externalId: "11770"
  },
  {
    parkSlug: "parc-asterix",
    rideSlug: "oziris",
    externalId: "5649"
  },
  {
    parkSlug: "efteling",
    rideSlug: "baron-1898",
    externalId: "6170"
  },
  {
    parkSlug: "efteling",
    rideSlug: "joris-en-de-draak",
    externalId: "6167"
  },
  {
    parkSlug: "walibi-holland",
    rideSlug: "untamed",
    externalId: "7349"
  },
  {
    parkSlug: "walibi-holland",
    rideSlug: "goliath",
    externalId: "6086"
  },
  {
    parkSlug: "portaventura-park",
    rideSlug: "shambhala",
    externalId: "615"
  },
  {
    parkSlug: "portaventura-park",
    rideSlug: "dragon-khan",
    externalId: "593"
  },
  {
    parkSlug: "gardaland",
    rideSlug: "raptor",
    externalId: "452"
  },
  {
    parkSlug: "gardaland",
    rideSlug: "oblivion-the-black-hole",
    externalId: "1905",
    notes: "Queue-Times omits the colon and uses 'Oblivion The Black Hole'."
  },
  {
    parkSlug: "energylandia",
    rideSlug: "hyperion",
    externalId: "11270",
    notes: "Queue-Times uses the shortened ride name 'Hyperion Rc'."
  },
  {
    parkSlug: "energylandia",
    rideSlug: "zadra",
    externalId: "11276",
    notes: "Queue-Times uses the shortened ride name 'Zadra Rc'."
  },
  {
    parkSlug: "liseberg",
    rideSlug: "helix",
    externalId: "477"
  },
  {
    parkSlug: "liseberg",
    rideSlug: "balder",
    externalId: "472"
  }
];

type QueueTimesRideRecord = {
  id: number;
  name: string;
  is_open?: boolean;
  wait_time?: number;
  last_updated?: string;
};

type QueueTimesLandRecord = {
  rides?: QueueTimesRideRecord[];
};

type QueueTimesParkQueueResponse = {
  lands?: QueueTimesLandRecord[];
  rides?: QueueTimesRideRecord[];
};

export type QueueTimesLiveRide = {
  externalId: string;
  name: string;
  isOpen: boolean | null;
  waitTimeMinutes: number | null;
  lastUpdated: string | null;
};

export const buildQueueTimesPublicParkUrl = officialQueueTimesParkUrl;
export const buildQueueTimesPublicParkStatsUrl = officialQueueTimesParkStatsUrl;
export const buildQueueTimesPublicRideUrl = officialQueueTimesRideUrl;

export const fetchQueueTimesParkQueue = async (externalParkId: string) => {
  const response = await fetch(
    new URL(`/parks/${externalParkId}/queue_times.json`, queueTimesBaseUrl),
    {
      headers: {
        accept: "application/json"
      }
    }
  );

  if (!response.ok) {
    throw new Error(
      `Queue-Times request failed for park ${externalParkId} with status ${response.status}.`
    );
  }

  const payload =
    (await response.json()) as QueueTimesParkQueueResponse;
  const flattenedRides = [
    ...(payload.lands?.flatMap((land) => land.rides ?? []) ?? []),
    ...(payload.rides ?? [])
  ];
  const ridesByExternalId = new Map<string, QueueTimesLiveRide>();

  for (const ride of flattenedRides) {
    ridesByExternalId.set(String(ride.id), {
      externalId: String(ride.id),
      name: ride.name,
      isOpen:
        typeof ride.is_open === "boolean" ? ride.is_open : null,
      waitTimeMinutes:
        typeof ride.wait_time === "number" ? ride.wait_time : null,
      lastUpdated: ride.last_updated ?? null
    });
  }

  return {
    fetchedAt: new Date().toISOString(),
    rides: Array.from(ridesByExternalId.values())
  };
};
