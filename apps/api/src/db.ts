import { Pool } from "pg";

import type {
  CurrentUserResponse,
  DemoUserParkProgress,
  ExternalEntityType,
  ExternalSourceName,
  Park,
  ParkStatus,
  UserProgressionResponse,
  RideCatalogItem,
  RideSort,
  Ride,
  RideStatus,
  UserRole,
  UserSummary
} from "@coasterly/types";

import {
  QUEUE_TIMES_SOURCE_NAME,
  queueTimesParkSeedMappings,
  queueTimesRideSeedMappings
} from "./integrations/queue-times.js";
import {
  buildUserProgression,
  type ProgressionRideCreditRecord
} from "./progression.js";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to start the API.");
}

const pool = new Pool({
  connectionString: databaseUrl
});

const demoUserSeed = {
  slug: "demo-user",
  name: "Demo User",
  role: "user" as const,
  isSeeded: true
} as const;

const createSeedImageUrl = (kind: "park" | "ride", name: string) =>
  `https://placehold.co/${
    kind === "park" ? "1600x900" : "1400x900"
  }/13253b/f58220/png?text=${encodeURIComponent(name)}`;

const seedParks: Omit<Park, "id">[] = [
  {
    name: "Europa-Park",
    slug: "europa-park",
    country: "Germany",
    city: "Rust",
    status: "operating",
    imageUrl: createSeedImageUrl("park", "Europa-Park")
  },
  {
    name: "Phantasialand",
    slug: "phantasialand",
    country: "Germany",
    city: "Bruhl",
    status: "operating",
    imageUrl: createSeedImageUrl("park", "Phantasialand")
  },
  {
    name: "Alton Towers",
    slug: "alton-towers",
    country: "United Kingdom",
    city: "Alton",
    status: "operating",
    imageUrl: createSeedImageUrl("park", "Alton Towers")
  },
  {
    name: "Disneyland Park",
    slug: "disneyland-park",
    country: "France",
    city: "Chessy",
    status: "operating",
    imageUrl: createSeedImageUrl("park", "Disneyland Park")
  },
  {
    name: "Parc Asterix",
    slug: "parc-asterix",
    country: "France",
    city: "Plailly",
    status: "operating",
    imageUrl: createSeedImageUrl("park", "Parc Asterix")
  },
  {
    name: "Efteling",
    slug: "efteling",
    country: "Netherlands",
    city: "Kaatsheuvel",
    status: "operating",
    imageUrl: createSeedImageUrl("park", "Efteling")
  },
  {
    name: "Walibi Holland",
    slug: "walibi-holland",
    country: "Netherlands",
    city: "Biddinghuizen",
    status: "operating",
    imageUrl: createSeedImageUrl("park", "Walibi Holland")
  },
  {
    name: "PortAventura Park",
    slug: "portaventura-park",
    country: "Spain",
    city: "Salou",
    status: "operating",
    imageUrl: createSeedImageUrl("park", "PortAventura Park")
  },
  {
    name: "Gardaland",
    slug: "gardaland",
    country: "Italy",
    city: "Castelnuovo del Garda",
    status: "operating",
    imageUrl: createSeedImageUrl("park", "Gardaland")
  },
  {
    name: "Energylandia",
    slug: "energylandia",
    country: "Poland",
    city: "Zator",
    status: "operating",
    imageUrl: createSeedImageUrl("park", "Energylandia")
  },
  {
    name: "Liseberg",
    slug: "liseberg",
    country: "Sweden",
    city: "Gothenburg",
    status: "operating",
    imageUrl: createSeedImageUrl("park", "Liseberg")
  }
];

const seedRides: Array<
  Omit<Ride, "id" | "parkId"> & {
    parkSlug: string;
  }
> = [
  {
    parkSlug: "europa-park",
    name: "Silver Star",
    slug: "silver-star",
    status: "operating",
    rideType: "steel coaster",
    imageUrl: createSeedImageUrl("ride", "Silver Star"),
    manufacturer: "Bolliger & Mabillard",
    model: "Hyper Coaster",
    openingYear: 2002,
    heightM: 73,
    speedKmh: 130,
    inversions: 0
  },
  {
    parkSlug: "europa-park",
    name: "Voltron Nevera",
    slug: "voltron-nevera",
    status: "operating",
    rideType: "launch coaster",
    imageUrl: createSeedImageUrl("ride", "Voltron Nevera"),
    manufacturer: "Mack Rides",
    model: "Stryker Coaster",
    openingYear: 2024,
    heightM: 32.5,
    speedKmh: 100,
    inversions: 7
  },
  {
    parkSlug: "phantasialand",
    name: "Taron",
    slug: "taron",
    status: "operating",
    rideType: "launch coaster",
    imageUrl: createSeedImageUrl("ride", "Taron"),
    manufacturer: "Intamin",
    model: "LSM Launch Coaster",
    openingYear: 2016,
    heightM: 30,
    speedKmh: 117,
    inversions: 0
  },
  {
    parkSlug: "phantasialand",
    name: "F.L.Y.",
    slug: "fly",
    status: "operating",
    rideType: "flying coaster",
    imageUrl: createSeedImageUrl("ride", "F.L.Y."),
    manufacturer: "Vekoma",
    model: "Flying Coaster",
    openingYear: 2020,
    heightM: 19.5,
    speedKmh: 78,
    inversions: 2
  },
  {
    parkSlug: "alton-towers",
    name: "Nemesis Reborn",
    slug: "nemesis-reborn",
    status: "operating",
    rideType: "inverted coaster",
    imageUrl: createSeedImageUrl("ride", "Nemesis Reborn"),
    manufacturer: "Bolliger & Mabillard",
    model: "Inverted Coaster",
    openingYear: 1994,
    heightM: 13,
    speedKmh: 81,
    inversions: 4
  },
  {
    parkSlug: "alton-towers",
    name: "Wicker Man",
    slug: "wicker-man",
    status: "operating",
    rideType: "wood coaster",
    imageUrl: createSeedImageUrl("ride", "Wicker Man"),
    manufacturer: "Great Coasters International",
    model: "Wooden Coaster",
    openingYear: 2018,
    heightM: 20,
    speedKmh: 70,
    inversions: 0
  },
  {
    parkSlug: "disneyland-park",
    name: "Big Thunder Mountain",
    slug: "big-thunder-mountain",
    status: "operating",
    rideType: "mine train coaster",
    imageUrl: createSeedImageUrl("ride", "Big Thunder Mountain"),
    manufacturer: "Vekoma",
    openingYear: 1992
  },
  {
    parkSlug: "disneyland-park",
    name: "Star Wars Hyperspace Mountain",
    slug: "star-wars-hyperspace-mountain",
    status: "operating",
    rideType: "indoor coaster",
    imageUrl: createSeedImageUrl("ride", "Star Wars Hyperspace Mountain"),
    openingYear: 1995,
    inversions: 3
  },
  {
    parkSlug: "parc-asterix",
    name: "Toutatis",
    slug: "toutatis",
    status: "operating",
    rideType: "launch coaster",
    imageUrl: createSeedImageUrl("ride", "Toutatis"),
    manufacturer: "Intamin",
    openingYear: 2023,
    heightM: 51,
    speedKmh: 110
  },
  {
    parkSlug: "parc-asterix",
    name: "OzIris",
    slug: "oziris",
    status: "operating",
    rideType: "inverted coaster",
    imageUrl: createSeedImageUrl("ride", "OzIris"),
    manufacturer: "Bolliger & Mabillard",
    openingYear: 2012,
    heightM: 40,
    speedKmh: 90,
    inversions: 5
  },
  {
    parkSlug: "efteling",
    name: "Baron 1898",
    slug: "baron-1898",
    status: "operating",
    rideType: "dive coaster",
    imageUrl: createSeedImageUrl("ride", "Baron 1898"),
    manufacturer: "Bolliger & Mabillard",
    openingYear: 2015,
    heightM: 37.5,
    speedKmh: 90,
    inversions: 2
  },
  {
    parkSlug: "efteling",
    name: "Joris en de Draak",
    slug: "joris-en-de-draak",
    status: "operating",
    rideType: "wood coaster",
    imageUrl: createSeedImageUrl("ride", "Joris en de Draak"),
    manufacturer: "Great Coasters International",
    openingYear: 2010,
    speedKmh: 75
  },
  {
    parkSlug: "walibi-holland",
    name: "Untamed",
    slug: "untamed",
    status: "operating",
    rideType: "hybrid coaster",
    imageUrl: createSeedImageUrl("ride", "Untamed"),
    manufacturer: "Rocky Mountain Construction",
    openingYear: 2019,
    heightM: 36.5,
    speedKmh: 92,
    inversions: 5
  },
  {
    parkSlug: "walibi-holland",
    name: "Goliath",
    slug: "goliath",
    status: "operating",
    rideType: "mega coaster",
    imageUrl: createSeedImageUrl("ride", "Goliath"),
    manufacturer: "Intamin",
    openingYear: 2002,
    heightM: 46.8,
    speedKmh: 106
  },
  {
    parkSlug: "portaventura-park",
    name: "Shambhala",
    slug: "shambhala",
    status: "operating",
    rideType: "hyper coaster",
    imageUrl: createSeedImageUrl("ride", "Shambhala"),
    manufacturer: "Bolliger & Mabillard",
    model: "Hyper Coaster",
    openingYear: 2012,
    heightM: 76,
    speedKmh: 134
  },
  {
    parkSlug: "portaventura-park",
    name: "Dragon Khan",
    slug: "dragon-khan",
    status: "operating",
    rideType: "sit-down coaster",
    imageUrl: createSeedImageUrl("ride", "Dragon Khan"),
    manufacturer: "Bolliger & Mabillard",
    openingYear: 1995,
    heightM: 45,
    speedKmh: 110,
    inversions: 8
  },
  {
    parkSlug: "gardaland",
    name: "Raptor",
    slug: "raptor",
    status: "operating",
    rideType: "wing coaster",
    imageUrl: createSeedImageUrl("ride", "Raptor"),
    manufacturer: "Bolliger & Mabillard",
    openingYear: 2011,
    heightM: 33,
    speedKmh: 90,
    inversions: 3
  },
  {
    parkSlug: "gardaland",
    name: "Oblivion: The Black Hole",
    slug: "oblivion-the-black-hole",
    status: "operating",
    rideType: "dive coaster",
    imageUrl: createSeedImageUrl("ride", "Oblivion The Black Hole"),
    manufacturer: "Bolliger & Mabillard",
    openingYear: 2015,
    heightM: 42.5,
    speedKmh: 100
  },
  {
    parkSlug: "energylandia",
    name: "Hyperion",
    slug: "hyperion",
    status: "operating",
    rideType: "hyper coaster",
    imageUrl: createSeedImageUrl("ride", "Hyperion"),
    manufacturer: "Intamin",
    openingYear: 2018,
    heightM: 77,
    speedKmh: 142
  },
  {
    parkSlug: "energylandia",
    name: "Zadra",
    slug: "zadra",
    status: "operating",
    rideType: "hybrid coaster",
    imageUrl: createSeedImageUrl("ride", "Zadra"),
    manufacturer: "Rocky Mountain Construction",
    openingYear: 2019,
    heightM: 63.8,
    speedKmh: 121
  },
  {
    parkSlug: "liseberg",
    name: "Helix",
    slug: "helix",
    status: "operating",
    rideType: "launch coaster",
    imageUrl: createSeedImageUrl("ride", "Helix"),
    manufacturer: "Mack Rides",
    openingYear: 2014,
    heightM: 41,
    speedKmh: 100,
    inversions: 7
  },
  {
    parkSlug: "liseberg",
    name: "Balder",
    slug: "balder",
    status: "operating",
    rideType: "wood coaster",
    imageUrl: createSeedImageUrl("ride", "Balder"),
    manufacturer: "Intamin",
    openingYear: 2003,
    heightM: 36,
    speedKmh: 90
  }
];

export type ExternalSourceMappingRecord = {
  id: number;
  sourceName: ExternalSourceName;
  entityType: ExternalEntityType;
  internalEntityId: number;
  externalId: string;
  externalUrl?: string;
  lastVerifiedAt?: string;
  notes?: string;
};

export type ParkSourceMappingRecord = ExternalSourceMappingRecord & {
  parkSlug: string;
};

export type RideSourceMappingRecord = ExternalSourceMappingRecord & {
  ride: Ride;
};

export type WaitTimeSnapshotInput = {
  mappingId: number;
  sourceName: ExternalSourceName;
  entityType: ExternalEntityType;
  internalEntityId: number;
  externalId: string;
  waitTimeMinutes: number | null;
  isOpen: boolean | null;
  rideStatus: string | null;
  recordedAt: string;
};

export const initializeDatabase = async () => {
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'regional_editor', 'global_editor', 'super_admin')),
        email TEXT,
        auth_provider TEXT,
        auth_subject TEXT,
        is_seeded BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user',
      ADD COLUMN IF NOT EXISTS email TEXT,
      ADD COLUMN IF NOT EXISTS auth_provider TEXT,
      ADD COLUMN IF NOT EXISTS auth_subject TEXT,
      ADD COLUMN IF NOT EXISTS is_seeded BOOLEAN NOT NULL DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    `);

    await client.query(`
      ALTER TABLE users
      DROP CONSTRAINT IF EXISTS users_role_check
    `);

    await client.query(`
      ALTER TABLE users
      ADD CONSTRAINT users_role_check
      CHECK (role IN ('user', 'moderator', 'regional_editor', 'global_editor', 'super_admin'))
    `);

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx
      ON users (LOWER(email))
      WHERE email IS NOT NULL
    `);

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS users_auth_identity_unique_idx
      ON users (auth_provider, auth_subject)
      WHERE auth_provider IS NOT NULL AND auth_subject IS NOT NULL
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS parks (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        country TEXT NOT NULL,
        city TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('operating', 'closed', 'planned')),
        image_url TEXT
      )
    `);

    await client.query(`
      ALTER TABLE parks
      ADD COLUMN IF NOT EXISTS image_url TEXT
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS rides (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        park_id INTEGER NOT NULL REFERENCES parks (id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('operating', 'closed', 'planned')),
        ride_type TEXT NOT NULL,
        image_url TEXT,
        manufacturer TEXT,
        model TEXT,
        opening_year INTEGER,
        height_m DOUBLE PRECISION,
        speed_kmh DOUBLE PRECISION,
        inversions INTEGER,
        UNIQUE (park_id, slug)
      )
    `);

    await client.query(`
      ALTER TABLE rides
      ADD COLUMN IF NOT EXISTS image_url TEXT,
      ADD COLUMN IF NOT EXISTS manufacturer TEXT,
      ADD COLUMN IF NOT EXISTS model TEXT,
      ADD COLUMN IF NOT EXISTS opening_year INTEGER,
      ADD COLUMN IF NOT EXISTS height_m DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS speed_kmh DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS inversions INTEGER
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_ride_credits (
        user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
        ride_id INTEGER NOT NULL REFERENCES rides (id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, ride_id)
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS external_source_mappings (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        source_name TEXT NOT NULL,
        entity_type TEXT NOT NULL CHECK (entity_type IN ('park', 'ride')),
        internal_entity_id INTEGER NOT NULL,
        external_id TEXT NOT NULL,
        external_url TEXT,
        last_verified_at TIMESTAMPTZ,
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (source_name, entity_type, internal_entity_id),
        UNIQUE (source_name, entity_type, external_id)
      )
    `);

    await client.query(`
      ALTER TABLE external_source_mappings
      ADD COLUMN IF NOT EXISTS external_url TEXT,
      ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ,
      ADD COLUMN IF NOT EXISTS notes TEXT,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS wait_time_snapshots (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        external_source_mapping_id INTEGER NOT NULL REFERENCES external_source_mappings (id) ON DELETE CASCADE,
        source_name TEXT NOT NULL,
        entity_type TEXT NOT NULL CHECK (entity_type IN ('park', 'ride')),
        internal_entity_id INTEGER NOT NULL,
        external_id TEXT NOT NULL,
        wait_time_minutes INTEGER,
        is_open BOOLEAN,
        ride_status TEXT,
        recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS wait_time_snapshots_mapping_recorded_at_idx
      ON wait_time_snapshots (external_source_mapping_id, recorded_at DESC)
    `);

    await client.query(
      `
        INSERT INTO users (slug, name, role, is_seeded, updated_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (slug) DO UPDATE
        SET
          name = EXCLUDED.name,
          role = EXCLUDED.role,
          is_seeded = EXCLUDED.is_seeded,
          updated_at = NOW()
      `,
      [
        demoUserSeed.slug,
        demoUserSeed.name,
        demoUserSeed.role,
        demoUserSeed.isSeeded
      ]
    );

    for (const park of seedParks) {
      await client.query(
        `
          INSERT INTO parks (name, slug, country, city, status, image_url)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (slug) DO UPDATE
          SET
            name = EXCLUDED.name,
            country = EXCLUDED.country,
            city = EXCLUDED.city,
            status = EXCLUDED.status,
            image_url = EXCLUDED.image_url
        `,
        [
          park.name,
          park.slug,
          park.country,
          park.city,
          park.status,
          park.imageUrl ?? null
        ]
      );
    }

    for (const ride of seedRides) {
      await client.query(
        `
          INSERT INTO rides (
            park_id,
            name,
            slug,
            status,
            ride_type,
            image_url,
            manufacturer,
            model,
            opening_year,
            height_m,
            speed_kmh,
            inversions
          )
          SELECT parks.id, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
          FROM parks
          WHERE parks.slug = $1
          ON CONFLICT (park_id, slug) DO UPDATE
          SET
            name = EXCLUDED.name,
            status = EXCLUDED.status,
            ride_type = EXCLUDED.ride_type,
            image_url = EXCLUDED.image_url,
            manufacturer = EXCLUDED.manufacturer,
            model = EXCLUDED.model,
            opening_year = EXCLUDED.opening_year,
            height_m = EXCLUDED.height_m,
            speed_kmh = EXCLUDED.speed_kmh,
            inversions = EXCLUDED.inversions
        `,
        [
          ride.parkSlug,
          ride.name,
          ride.slug,
          ride.status,
          ride.rideType,
          ride.imageUrl ?? null,
          ride.manufacturer ?? null,
          ride.model ?? null,
          ride.openingYear ?? null,
          ride.heightM ?? null,
          ride.speedKmh ?? null,
          ride.inversions ?? null
        ]
      );
    }

    for (const mapping of queueTimesParkSeedMappings) {
      await client.query(
        `
          INSERT INTO external_source_mappings (
            source_name,
            entity_type,
            internal_entity_id,
            external_id,
            external_url,
            last_verified_at,
            notes,
            updated_at
          )
          SELECT $2, 'park', parks.id, $3, $4, NOW(), $5, NOW()
          FROM parks
          WHERE parks.slug = $1
          ON CONFLICT (source_name, entity_type, internal_entity_id) DO UPDATE
          SET
            external_id = EXCLUDED.external_id,
            external_url = EXCLUDED.external_url,
            last_verified_at = EXCLUDED.last_verified_at,
            notes = EXCLUDED.notes,
            updated_at = NOW()
        `,
        [
          mapping.parkSlug,
          QUEUE_TIMES_SOURCE_NAME,
          mapping.externalId,
          mapping.externalUrl,
          mapping.notes ?? null
        ]
      );
    }

    for (const mapping of queueTimesRideSeedMappings) {
      await client.query(
        `
          INSERT INTO external_source_mappings (
            source_name,
            entity_type,
            internal_entity_id,
            external_id,
            external_url,
            last_verified_at,
            notes,
            updated_at
          )
          SELECT $3, 'ride', rides.id, $4, NULL, NOW(), $5, NOW()
          FROM rides
          INNER JOIN parks ON parks.id = rides.park_id
          WHERE parks.slug = $1 AND rides.slug = $2
          ON CONFLICT (source_name, entity_type, internal_entity_id) DO UPDATE
          SET
            external_id = EXCLUDED.external_id,
            external_url = EXCLUDED.external_url,
            last_verified_at = EXCLUDED.last_verified_at,
            notes = EXCLUDED.notes,
            updated_at = NOW()
        `,
        [
          mapping.parkSlug,
          mapping.rideSlug,
          QUEUE_TIMES_SOURCE_NAME,
          mapping.externalId,
          mapping.notes ?? null
        ]
      );
    }
  } finally {
    client.release();
  }
};

const escapeLikePattern = (value: string) => value.replace(/[\\%_]/g, "\\$&");

const toOptionalRideFields = (fields: {
  imageUrl: string | null;
  manufacturer: string | null;
  model: string | null;
  openingYear: number | null;
  heightM: number | null;
  speedKmh: number | null;
  inversions: number | null;
}) => ({
  ...(fields.imageUrl !== null ? { imageUrl: fields.imageUrl } : {}),
  ...(fields.manufacturer !== null ? { manufacturer: fields.manufacturer } : {}),
  ...(fields.model !== null ? { model: fields.model } : {}),
  ...(fields.openingYear !== null ? { openingYear: fields.openingYear } : {}),
  ...(fields.heightM !== null ? { heightM: fields.heightM } : {}),
  ...(fields.speedKmh !== null ? { speedKmh: fields.speedKmh } : {}),
  ...(fields.inversions !== null ? { inversions: fields.inversions } : {})
});

type RideListOptions = {
  rideType?: string;
  manufacturer?: string;
  sort?: RideSort;
};

type RideCatalogListOptions = RideListOptions & {
  search?: string;
  parkSlug?: string;
};

const getUserBySlug = async (slug: string): Promise<UserSummary | null> => {
  const result = await pool.query<{
    id: number;
    slug: string;
    name: string;
    role: string;
    is_seeded: boolean;
  }>(
    `
      SELECT id, slug, name, role, is_seeded
      FROM users
      WHERE slug = $1
      LIMIT 1
    `,
    [slug]
  );

  const record = result.rows[0];

  if (!record) {
    return null;
  }

  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    role: record.role as UserRole,
    ...(record.is_seeded ? { isSeeded: true } : {})
  };
};

const getPrimarySeedUser = async (): Promise<UserSummary> => {
  const user = await getUserBySlug(demoUserSeed.slug);

  if (!user) {
    throw new Error("Primary seeded user is not available.");
  }

  return user;
};

const getUserByAuthIdentity = async (
  authProvider: string,
  authSubject: string
): Promise<UserSummary | null> => {
  const normalizedAuthProvider = authProvider.trim();
  const normalizedAuthSubject = authSubject.trim();

  if (!normalizedAuthProvider || !normalizedAuthSubject) {
    return null;
  }

  const result = await pool.query<{
    id: number;
    slug: string;
    name: string;
    role: string;
    is_seeded: boolean;
  }>(
    `
      SELECT id, slug, name, role, is_seeded
      FROM users
      WHERE auth_provider = $1 AND auth_subject = $2
      LIMIT 1
    `,
    [normalizedAuthProvider, normalizedAuthSubject]
  );

  const record = result.rows[0];

  if (!record) {
    return null;
  }

  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    role: record.role as UserRole,
    ...(record.is_seeded ? { isSeeded: true } : {})
  };
};

export const resolveCurrentUser = async (options?: {
  authProvider?: string;
  authSubject?: string;
}): Promise<CurrentUserResponse> => {
  const normalizedAuthProvider = options?.authProvider?.trim();
  const normalizedAuthSubject = options?.authSubject?.trim();

  if (normalizedAuthProvider || normalizedAuthSubject) {
    if (!normalizedAuthProvider || !normalizedAuthSubject) {
      throw new Error("Incomplete auth identity.");
    }

    const authenticatedUser = await getUserByAuthIdentity(
      normalizedAuthProvider,
      normalizedAuthSubject
    );

    if (!authenticatedUser) {
      throw new Error("Auth identity is not linked to a Coasterly user.");
    }

    return {
      user: authenticatedUser,
      identity: {
        source: "auth_identity",
        provider: normalizedAuthProvider,
        subject: normalizedAuthSubject
      }
    };
  }

  const fallbackUser = await getPrimarySeedUser();

  return {
    user: fallbackUser,
    identity: {
      source: "seeded_fallback"
    }
  };
};

const getRideIdentityBySlugs = async (parkSlug: string, rideSlug: string) => {
  const result = await pool.query<{ id: number }>(
    `
      SELECT rides.id
      FROM rides
      INNER JOIN parks ON parks.id = rides.park_id
      WHERE parks.slug = $1 AND rides.slug = $2
      LIMIT 1
    `,
    [parkSlug, rideSlug]
  );

  return result.rows[0] ?? null;
};

export const listParks = async (search?: string): Promise<Park[]> => {
  const normalizedSearch = search?.trim();

  const result = normalizedSearch
    ? await pool.query<{
        id: number;
        name: string;
        slug: string;
        country: string;
        city: string;
        status: string;
        image_url: string | null;
      }>(
        `
          SELECT id, name, slug, country, city, status, image_url
          FROM parks
          WHERE
            name ILIKE $1 ESCAPE '\\'
            OR country ILIKE $1 ESCAPE '\\'
            OR city ILIKE $1 ESCAPE '\\'
          ORDER BY name ASC
        `,
        [`%${escapeLikePattern(normalizedSearch)}%`]
      )
    : await pool.query<{
        id: number;
        name: string;
        slug: string;
        country: string;
        city: string;
        status: string;
        image_url: string | null;
      }>(
        `
          SELECT id, name, slug, country, city, status, image_url
          FROM parks
          ORDER BY name ASC
        `
      );

  return result.rows.map((park) => ({
    id: park.id,
    name: park.name,
    slug: park.slug,
    country: park.country,
    city: park.city,
    status: park.status as ParkStatus,
    ...(park.image_url ? { imageUrl: park.image_url } : {})
  }));
};

export const getParkBySlug = async (slug: string): Promise<Park | null> => {
  const result = await pool.query<{
    id: number;
    name: string;
    slug: string;
    country: string;
    city: string;
    status: string;
    image_url: string | null;
  }>(
    `
      SELECT id, name, slug, country, city, status, image_url
      FROM parks
      WHERE slug = $1
      LIMIT 1
    `,
    [slug]
  );

  const park = result.rows[0];

  if (!park) {
    return null;
  }

  return {
    id: park.id,
    name: park.name,
    slug: park.slug,
    country: park.country,
    city: park.city,
    status: park.status as ParkStatus,
    ...(park.image_url ? { imageUrl: park.image_url } : {})
  };
};

export const listRidesForPark = async (
  parkId: number,
  options: RideListOptions = {}
): Promise<Ride[]> => {
  const normalizedRideType = options.rideType?.trim();
  const normalizedManufacturer = options.manufacturer?.trim();
  const sortColumnMap = {
    name: "name",
    opening_year: "opening_year",
    speed_kmh: "speed_kmh"
  } as const;
  const sortColumn =
    options.sort && options.sort in sortColumnMap
      ? sortColumnMap[options.sort as keyof typeof sortColumnMap]
      : sortColumnMap.name;
  const filters = ["park_id = $1"];
  const values: Array<number | string> = [parkId];

  if (normalizedRideType) {
    values.push(normalizedRideType);
    filters.push(`ride_type = $${values.length}`);
  }

  if (normalizedManufacturer) {
    values.push(normalizedManufacturer);
    filters.push(`manufacturer = $${values.length}`);
  }

  const orderBy =
    sortColumn === "name"
      ? "name ASC"
      : `${sortColumn} DESC NULLS LAST, name ASC`;

  const result = await pool.query<{
    id: number;
    park_id: number;
    name: string;
    slug: string;
    status: string;
    ride_type: string;
    image_url: string | null;
    manufacturer: string | null;
    model: string | null;
    opening_year: number | null;
    height_m: number | null;
    speed_kmh: number | null;
    inversions: number | null;
  }>(
    `
      SELECT
        id,
        park_id,
        name,
        slug,
        status,
        ride_type,
        image_url,
        manufacturer,
        model,
        opening_year,
        height_m,
        speed_kmh,
        inversions
      FROM rides
      WHERE ${filters.join(" AND ")}
      ORDER BY ${orderBy}
    `,
    values
  );

  return result.rows.map((ride) => ({
    id: ride.id,
    parkId: ride.park_id,
    name: ride.name,
    slug: ride.slug,
    status: ride.status as RideStatus,
    rideType: ride.ride_type,
    ...toOptionalRideFields({
      imageUrl: ride.image_url,
      manufacturer: ride.manufacturer,
      model: ride.model,
      openingYear: ride.opening_year,
      heightM: ride.height_m,
      speedKmh: ride.speed_kmh,
      inversions: ride.inversions
    })
  }));
};

export const listRideCatalog = async (
  options: RideCatalogListOptions = {}
): Promise<RideCatalogItem[]> => {
  const normalizedSearch = options.search?.trim();
  const normalizedParkSlug = options.parkSlug?.trim();
  const normalizedRideType = options.rideType?.trim();
  const normalizedManufacturer = options.manufacturer?.trim();
  const sortColumnMap = {
    name: "rides.name",
    opening_year: "rides.opening_year",
    speed_kmh: "rides.speed_kmh"
  } as const;
  const sortColumn =
    options.sort && options.sort in sortColumnMap
      ? sortColumnMap[options.sort]
      : sortColumnMap.name;
  const filters: string[] = [];
  const values: string[] = [];

  if (normalizedSearch) {
    values.push(`%${escapeLikePattern(normalizedSearch)}%`);
    filters.push(`rides.name ILIKE $${values.length} ESCAPE '\\'`);
  }

  if (normalizedParkSlug) {
    values.push(normalizedParkSlug);
    filters.push(`parks.slug = $${values.length}`);
  }

  if (normalizedRideType) {
    values.push(normalizedRideType);
    filters.push(`rides.ride_type = $${values.length}`);
  }

  if (normalizedManufacturer) {
    values.push(normalizedManufacturer);
    filters.push(`rides.manufacturer = $${values.length}`);
  }

  const orderBy =
    sortColumn === "rides.name"
      ? "rides.name ASC"
      : `${sortColumn} DESC NULLS LAST, rides.name ASC`;

  const result = await pool.query<{
    park_id: number;
    park_name: string;
    park_slug: string;
    park_country: string;
    park_city: string;
    park_status: string;
    park_image_url: string | null;
    ride_id: number;
    ride_name: string;
    ride_slug: string;
    ride_status: string;
    ride_type: string;
    ride_image_url: string | null;
    ride_manufacturer: string | null;
    ride_model: string | null;
    ride_opening_year: number | null;
    ride_height_m: number | null;
    ride_speed_kmh: number | null;
    ride_inversions: number | null;
  }>(
    `
      SELECT
        parks.id AS park_id,
        parks.name AS park_name,
        parks.slug AS park_slug,
        parks.country AS park_country,
        parks.city AS park_city,
        parks.status AS park_status,
        parks.image_url AS park_image_url,
        rides.id AS ride_id,
        rides.name AS ride_name,
        rides.slug AS ride_slug,
        rides.status AS ride_status,
        rides.ride_type AS ride_type,
        rides.image_url AS ride_image_url,
        rides.manufacturer AS ride_manufacturer,
        rides.model AS ride_model,
        rides.opening_year AS ride_opening_year,
        rides.height_m AS ride_height_m,
        rides.speed_kmh AS ride_speed_kmh,
        rides.inversions AS ride_inversions
      FROM rides
      INNER JOIN parks ON parks.id = rides.park_id
      ${filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : ""}
      ORDER BY ${orderBy}
    `,
    values
  );

  return result.rows.map((row) => ({
    park: {
      id: row.park_id,
      name: row.park_name,
      slug: row.park_slug,
      country: row.park_country,
      city: row.park_city,
      status: row.park_status as ParkStatus,
      ...(row.park_image_url ? { imageUrl: row.park_image_url } : {})
    },
    ride: {
      id: row.ride_id,
      parkId: row.park_id,
      name: row.ride_name,
      slug: row.ride_slug,
      status: row.ride_status as RideStatus,
      rideType: row.ride_type,
      ...toOptionalRideFields({
        imageUrl: row.ride_image_url,
        manufacturer: row.ride_manufacturer,
        model: row.ride_model,
        openingYear: row.ride_opening_year,
        heightM: row.ride_height_m,
        speedKmh: row.ride_speed_kmh,
        inversions: row.ride_inversions
      })
    }
  }));
};

export const getRideBySlugs = async (
  parkSlug: string,
  rideSlug: string
): Promise<{ park: Park; ride: Ride } | null> => {
  const result = await pool.query<{
    park_id: number;
    park_name: string;
    park_slug: string;
    park_country: string;
    park_city: string;
    park_status: string;
    park_image_url: string | null;
    ride_id: number;
    ride_name: string;
    ride_slug: string;
    ride_status: string;
    ride_type: string;
    ride_image_url: string | null;
    ride_manufacturer: string | null;
    ride_model: string | null;
    ride_opening_year: number | null;
    ride_height_m: number | null;
    ride_speed_kmh: number | null;
    ride_inversions: number | null;
  }>(
    `
      SELECT
        parks.id AS park_id,
        parks.name AS park_name,
        parks.slug AS park_slug,
        parks.country AS park_country,
        parks.city AS park_city,
        parks.status AS park_status,
        parks.image_url AS park_image_url,
        rides.id AS ride_id,
        rides.name AS ride_name,
        rides.slug AS ride_slug,
        rides.status AS ride_status,
        rides.ride_type AS ride_type,
        rides.image_url AS ride_image_url,
        rides.manufacturer AS ride_manufacturer,
        rides.model AS ride_model,
        rides.opening_year AS ride_opening_year,
        rides.height_m AS ride_height_m,
        rides.speed_kmh AS ride_speed_kmh,
        rides.inversions AS ride_inversions
      FROM rides
      INNER JOIN parks ON parks.id = rides.park_id
      WHERE parks.slug = $1 AND rides.slug = $2
      LIMIT 1
    `,
    [parkSlug, rideSlug]
  );

  const record = result.rows[0];

  if (!record) {
    return null;
  }

  return {
    park: {
      id: record.park_id,
      name: record.park_name,
      slug: record.park_slug,
      country: record.park_country,
      city: record.park_city,
      status: record.park_status as ParkStatus,
      ...(record.park_image_url ? { imageUrl: record.park_image_url } : {})
    },
    ride: {
      id: record.ride_id,
      parkId: record.park_id,
      name: record.ride_name,
      slug: record.ride_slug,
      status: record.ride_status as RideStatus,
      rideType: record.ride_type,
      ...toOptionalRideFields({
        imageUrl: record.ride_image_url,
        manufacturer: record.ride_manufacturer,
        model: record.ride_model,
        openingYear: record.ride_opening_year,
        heightM: record.ride_height_m,
        speedKmh: record.ride_speed_kmh,
        inversions: record.ride_inversions
      })
    }
  };
};

export const listRideCreditsForUser = async (
  user: UserSummary
): Promise<number[]> => {
  const result = await pool.query<{ ride_id: number }>(
    `
      SELECT ride_id
      FROM user_ride_credits
      WHERE user_id = $1
      ORDER BY ride_id ASC
    `,
    [user.id]
  );

  return result.rows.map((row) => row.ride_id);
};

const listUserRideCreditsBySlug = async (userSlug: string): Promise<{
  user: UserSummary;
  rideIds: number[];
}> => {
  const user = await getUserBySlug(userSlug);

  if (!user) {
    throw new Error(`User "${userSlug}" is not available.`);
  }

  return {
    user,
    rideIds: await listRideCreditsForUser(user)
  };
};

export const listDemoUserRideCredits = async () =>
  listUserRideCreditsBySlug(demoUserSeed.slug);

export const getRideStatsForUser = async (
  user: UserSummary
): Promise<Omit<CurrentUserResponse, "identity"> & {
  totalRiddenRides: number;
  totalParksWithRiddenRides: number;
  parks: DemoUserParkProgress[];
}> => {
  const result = await pool.query<{
    park_id: number;
    park_name: string;
    park_slug: string;
    total_rides: string;
    ridden_rides: string;
  }>(
    `
      SELECT
        parks.id AS park_id,
        parks.name AS park_name,
        parks.slug AS park_slug,
        COUNT(rides.id)::text AS total_rides,
        COUNT(user_ride_credits.ride_id)::text AS ridden_rides
      FROM parks
      LEFT JOIN rides ON rides.park_id = parks.id
      LEFT JOIN user_ride_credits
        ON user_ride_credits.ride_id = rides.id
        AND user_ride_credits.user_id = $1
      GROUP BY parks.id, parks.name, parks.slug
      HAVING COUNT(rides.id) > 0
      ORDER BY parks.name ASC
    `,
    [user.id]
  );

  const parks = result.rows.map((row) => ({
    parkId: row.park_id,
    parkName: row.park_name,
    parkSlug: row.park_slug,
    totalRides: Number(row.total_rides),
    riddenRides: Number(row.ridden_rides),
    completionPercentage:
      Number(row.total_rides) > 0
        ? Math.round((Number(row.ridden_rides) / Number(row.total_rides)) * 100)
        : 0
  }));

  return {
    user,
    totalRiddenRides: parks.reduce(
      (total, park) => total + park.riddenRides,
      0
    ),
    totalParksWithRiddenRides: parks.filter((park) => park.riddenRides > 0).length,
    parks
  };
};

const getUserRideStatsBySlug = async (userSlug: string): Promise<{
  user: UserSummary;
  totalRiddenRides: number;
  totalParksWithRiddenRides: number;
  parks: DemoUserParkProgress[];
}> => {
  const user = await getUserBySlug(userSlug);

  if (!user) {
    throw new Error(`User "${userSlug}" is not available.`);
  }

  return getRideStatsForUser(user);
};

export const getDemoUserRideStats = async () =>
  getUserRideStatsBySlug(demoUserSeed.slug);

const listRideCreditDetailsForUser = async (
  user: UserSummary
): Promise<ProgressionRideCreditRecord[]> => {
  const result = await pool.query<{
    created_at: string | Date;
    park_slug: string;
    ride_type: string;
    manufacturer: string | null;
  }>(
    `
      SELECT
        user_ride_credits.created_at,
        parks.slug AS park_slug,
        rides.ride_type,
        rides.manufacturer
      FROM user_ride_credits
      INNER JOIN rides ON rides.id = user_ride_credits.ride_id
      INNER JOIN parks ON parks.id = rides.park_id
      WHERE user_ride_credits.user_id = $1
      ORDER BY user_ride_credits.created_at ASC, rides.id ASC
    `,
    [user.id]
  );

  return result.rows.map((row) => ({
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : row.created_at,
    parkSlug: row.park_slug,
    rideType: row.ride_type,
    ...(row.manufacturer ? { manufacturer: row.manufacturer } : {})
  }));
};

export const getUserProgression = async (
  user: UserSummary
): Promise<UserProgressionResponse> => {
  const [stats, rideCredits] = await Promise.all([
    getRideStatsForUser(user),
    listRideCreditDetailsForUser(user)
  ]);
  const progression = buildUserProgression({
    rideCredits,
    parkProgress: stats.parks,
    totalRiddenRides: stats.totalRiddenRides,
    totalParksWithRiddenRides: stats.totalParksWithRiddenRides
  });

  return {
    user,
    badges: progression.badges,
    activeMissions: progression.activeMissions
  };
};

export const getDemoUserProgression = async () => {
  const user = await getPrimarySeedUser();

  return getUserProgression(user);
};

export const addRideCreditForUser = async (
  user: UserSummary,
  parkSlug: string,
  rideSlug: string
): Promise<{ user: UserSummary; rideId: number } | null> => {
  const ride = await getRideIdentityBySlugs(parkSlug, rideSlug);

  if (!ride) {
    return null;
  }

  await pool.query(
    `
      INSERT INTO user_ride_credits (user_id, ride_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, ride_id) DO NOTHING
    `,
    [user.id, ride.id]
  );

  return {
    user,
    rideId: ride.id
  };
};

export const addDemoUserRideCredit = async (
  parkSlug: string,
  rideSlug: string
): Promise<{ user: UserSummary; rideId: number } | null> => {
  const user = await getPrimarySeedUser();

  return addRideCreditForUser(user, parkSlug, rideSlug);
};

export const removeRideCreditForUser = async (
  user: UserSummary,
  parkSlug: string,
  rideSlug: string
): Promise<{ user: UserSummary; rideId: number } | null> => {
  const ride = await getRideIdentityBySlugs(parkSlug, rideSlug);

  if (!ride) {
    return null;
  }

  await pool.query(
    `
      DELETE FROM user_ride_credits
      WHERE user_id = $1 AND ride_id = $2
    `,
    [user.id, ride.id]
  );

  return {
    user,
    rideId: ride.id
  };
};

export const removeDemoUserRideCredit = async (
  parkSlug: string,
  rideSlug: string
): Promise<{ user: UserSummary; rideId: number } | null> => {
  const user = await getPrimarySeedUser();

  return removeRideCreditForUser(user, parkSlug, rideSlug);
};

export const getExternalSourceMapping = async (
  sourceName: ExternalSourceName,
  entityType: ExternalEntityType,
  internalEntityId: number
): Promise<ExternalSourceMappingRecord | null> => {
  const result = await pool.query<{
    id: number;
    source_name: string;
    entity_type: string;
    internal_entity_id: number;
    external_id: string;
    external_url: string | null;
    last_verified_at: string | null;
    notes: string | null;
  }>(
    `
      SELECT
        id,
        source_name,
        entity_type,
        internal_entity_id,
        external_id,
        external_url,
        last_verified_at,
        notes
      FROM external_source_mappings
      WHERE
        source_name = $1
        AND entity_type = $2
        AND internal_entity_id = $3
      LIMIT 1
    `,
    [sourceName, entityType, internalEntityId]
  );

  const mapping = result.rows[0];

  if (!mapping) {
    return null;
  }

  return {
    id: mapping.id,
    sourceName: mapping.source_name as ExternalSourceName,
    entityType: mapping.entity_type as ExternalEntityType,
    internalEntityId: mapping.internal_entity_id,
    externalId: mapping.external_id,
    ...(mapping.external_url ? { externalUrl: mapping.external_url } : {}),
    ...(mapping.last_verified_at
      ? { lastVerifiedAt: mapping.last_verified_at }
      : {}),
    ...(mapping.notes ? { notes: mapping.notes } : {})
  };
};

export const listParkSourceMappingsBySource = async (
  sourceName: ExternalSourceName
): Promise<ParkSourceMappingRecord[]> => {
  const result = await pool.query<{
    id: number;
    source_name: string;
    entity_type: string;
    internal_entity_id: number;
    external_id: string;
    external_url: string | null;
    last_verified_at: string | null;
    notes: string | null;
    park_slug: string;
  }>(
    `
      SELECT
        mappings.id,
        mappings.source_name,
        mappings.entity_type,
        mappings.internal_entity_id,
        mappings.external_id,
        mappings.external_url,
        mappings.last_verified_at,
        mappings.notes,
        parks.slug AS park_slug
      FROM external_source_mappings AS mappings
      INNER JOIN parks ON parks.id = mappings.internal_entity_id
      WHERE mappings.source_name = $1 AND mappings.entity_type = 'park'
      ORDER BY parks.name ASC
    `,
    [sourceName]
  );

  return result.rows.map((mapping) => ({
    id: mapping.id,
    sourceName: mapping.source_name as ExternalSourceName,
    entityType: mapping.entity_type as ExternalEntityType,
    internalEntityId: mapping.internal_entity_id,
    externalId: mapping.external_id,
    parkSlug: mapping.park_slug,
    ...(mapping.external_url ? { externalUrl: mapping.external_url } : {}),
    ...(mapping.last_verified_at
      ? { lastVerifiedAt: mapping.last_verified_at }
      : {}),
    ...(mapping.notes ? { notes: mapping.notes } : {})
  }));
};

export const listRideSourceMappingsForPark = async (
  parkId: number,
  sourceName: ExternalSourceName
): Promise<RideSourceMappingRecord[]> => {
  const result = await pool.query<{
    mapping_id: number;
    source_name: string;
    entity_type: string;
    internal_entity_id: number;
    external_id: string;
    external_url: string | null;
    last_verified_at: string | null;
    notes: string | null;
    ride_id: number;
    ride_name: string;
    ride_slug: string;
    ride_status: string;
    ride_type: string;
    ride_image_url: string | null;
    ride_manufacturer: string | null;
    ride_model: string | null;
    ride_opening_year: number | null;
    ride_height_m: number | null;
    ride_speed_kmh: number | null;
    ride_inversions: number | null;
  }>(
    `
      SELECT
        mappings.id AS mapping_id,
        mappings.source_name,
        mappings.entity_type,
        mappings.internal_entity_id,
        mappings.external_id,
        mappings.external_url,
        mappings.last_verified_at,
        mappings.notes,
        rides.id AS ride_id,
        rides.name AS ride_name,
        rides.slug AS ride_slug,
        rides.status AS ride_status,
        rides.ride_type AS ride_type,
        rides.image_url AS ride_image_url,
        rides.manufacturer AS ride_manufacturer,
        rides.model AS ride_model,
        rides.opening_year AS ride_opening_year,
        rides.height_m AS ride_height_m,
        rides.speed_kmh AS ride_speed_kmh,
        rides.inversions AS ride_inversions
      FROM external_source_mappings AS mappings
      INNER JOIN rides ON rides.id = mappings.internal_entity_id
      WHERE
        mappings.source_name = $2
        AND mappings.entity_type = 'ride'
        AND rides.park_id = $1
      ORDER BY rides.name ASC
    `,
    [parkId, sourceName]
  );

  return result.rows.map((row) => ({
    id: row.mapping_id,
    sourceName: row.source_name as ExternalSourceName,
    entityType: row.entity_type as ExternalEntityType,
    internalEntityId: row.internal_entity_id,
    externalId: row.external_id,
    ...(row.external_url ? { externalUrl: row.external_url } : {}),
    ...(row.last_verified_at ? { lastVerifiedAt: row.last_verified_at } : {}),
    ...(row.notes ? { notes: row.notes } : {}),
    ride: {
      id: row.ride_id,
      parkId,
      name: row.ride_name,
      slug: row.ride_slug,
      status: row.ride_status as RideStatus,
      rideType: row.ride_type,
      ...toOptionalRideFields({
        imageUrl: row.ride_image_url,
        manufacturer: row.ride_manufacturer,
        model: row.ride_model,
        openingYear: row.ride_opening_year,
        heightM: row.ride_height_m,
        speedKmh: row.ride_speed_kmh,
        inversions: row.ride_inversions
      })
    }
  }));
};

export const insertWaitTimeSnapshots = async (
  snapshots: WaitTimeSnapshotInput[]
) => {
  if (snapshots.length === 0) {
    return;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (const snapshot of snapshots) {
      await client.query(
        `
          INSERT INTO wait_time_snapshots (
            external_source_mapping_id,
            source_name,
            entity_type,
            internal_entity_id,
            external_id,
            wait_time_minutes,
            is_open,
            ride_status,
            recorded_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `,
        [
          snapshot.mappingId,
          snapshot.sourceName,
          snapshot.entityType,
          snapshot.internalEntityId,
          snapshot.externalId,
          snapshot.waitTimeMinutes,
          snapshot.isOpen,
          snapshot.rideStatus,
          snapshot.recordedAt
        ]
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const closeDatabase = async () => {
  await pool.end();
};
