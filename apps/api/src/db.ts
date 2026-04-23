import { Pool } from "pg";

import type {
  DemoUser,
  Park,
  ParkStatus,
  Ride,
  RideStatus
} from "@coasterly/types";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to start the API.");
}

const pool = new Pool({
  connectionString: databaseUrl
});

const demoUserSeed = {
  slug: "demo-user",
  name: "Demo User"
} as const;

const seedParks: Omit<Park, "id">[] = [
  {
    name: "Europa-Park",
    slug: "europa-park",
    country: "Germany",
    city: "Rust",
    status: "operating"
  },
  {
    name: "Phantasialand",
    slug: "phantasialand",
    country: "Germany",
    city: "Bruehl",
    status: "operating"
  },
  {
    name: "Alton Towers",
    slug: "alton-towers",
    country: "United Kingdom",
    city: "Alton",
    status: "operating"
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
    manufacturer: "Great Coasters International",
    model: "Wooden Coaster",
    openingYear: 2018,
    heightM: 20,
    speedKmh: 70,
    inversions: 0
  }
];

export const initializeDatabase = async () => {
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        slug TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS parks (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        country TEXT NOT NULL,
        city TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('operating', 'closed', 'planned'))
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS rides (
        id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        park_id INTEGER NOT NULL REFERENCES parks (id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        slug TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('operating', 'closed', 'planned')),
        ride_type TEXT NOT NULL,
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

    await client.query(
      `
        INSERT INTO users (slug, name)
        VALUES ($1, $2)
        ON CONFLICT (slug) DO UPDATE
        SET name = EXCLUDED.name
      `,
      [demoUserSeed.slug, demoUserSeed.name]
    );

    for (const park of seedParks) {
      await client.query(
        `
          INSERT INTO parks (name, slug, country, city, status)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (slug) DO UPDATE
          SET
            name = EXCLUDED.name,
            country = EXCLUDED.country,
            city = EXCLUDED.city,
            status = EXCLUDED.status
        `,
        [park.name, park.slug, park.country, park.city, park.status]
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
            manufacturer,
            model,
            opening_year,
            height_m,
            speed_kmh,
            inversions
          )
          SELECT parks.id, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
          FROM parks
          WHERE parks.slug = $1
          ON CONFLICT (park_id, slug) DO UPDATE
          SET
            name = EXCLUDED.name,
            status = EXCLUDED.status,
            ride_type = EXCLUDED.ride_type,
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
          ride.manufacturer ?? null,
          ride.model ?? null,
          ride.openingYear ?? null,
          ride.heightM ?? null,
          ride.speedKmh ?? null,
          ride.inversions ?? null
        ]
      );
    }
  } finally {
    client.release();
  }
};

const escapeLikePattern = (value: string) => value.replace(/[\\%_]/g, "\\$&");

const toOptionalRideFields = (fields: {
  manufacturer: string | null;
  model: string | null;
  openingYear: number | null;
  heightM: number | null;
  speedKmh: number | null;
  inversions: number | null;
}) => ({
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
  sort?: string;
};

const getDemoUser = async (): Promise<DemoUser> => {
  const result = await pool.query<DemoUser>(
    `
      SELECT id, slug, name
      FROM users
      WHERE slug = $1
      LIMIT 1
    `,
    [demoUserSeed.slug]
  );

  const user = result.rows[0];

  if (!user) {
    throw new Error("Demo user is not available.");
  }

  return user;
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
    ? await pool.query<Park>(
        `
          SELECT id, name, slug, country, city, status
          FROM parks
          WHERE
            name ILIKE $1 ESCAPE '\\'
            OR country ILIKE $1 ESCAPE '\\'
            OR city ILIKE $1 ESCAPE '\\'
          ORDER BY name ASC
        `,
        [`%${escapeLikePattern(normalizedSearch)}%`]
      )
    : await pool.query<Park>(
        `
          SELECT id, name, slug, country, city, status
          FROM parks
          ORDER BY name ASC
        `
      );

  return result.rows.map((park) => ({
    ...park,
    status: park.status as ParkStatus
  }));
};

export const getParkBySlug = async (slug: string): Promise<Park | null> => {
  const result = await pool.query<Park>(
    `
      SELECT id, name, slug, country, city, status
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
    ...park,
    status: park.status as ParkStatus
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
      manufacturer: ride.manufacturer,
      model: ride.model,
      openingYear: ride.opening_year,
      heightM: ride.height_m,
      speedKmh: ride.speed_kmh,
      inversions: ride.inversions
    })
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
    ride_id: number;
    ride_name: string;
    ride_slug: string;
    ride_status: string;
    ride_type: string;
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
        rides.id AS ride_id,
        rides.name AS ride_name,
        rides.slug AS ride_slug,
        rides.status AS ride_status,
        rides.ride_type AS ride_type,
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
      status: record.park_status as ParkStatus
    },
    ride: {
      id: record.ride_id,
      parkId: record.park_id,
      name: record.ride_name,
      slug: record.ride_slug,
      status: record.ride_status as RideStatus,
      rideType: record.ride_type,
      ...toOptionalRideFields({
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

export const listDemoUserRideCredits = async (): Promise<{
  user: DemoUser;
  rideIds: number[];
}> => {
  const user = await getDemoUser();
  const result = await pool.query<{ ride_id: number }>(
    `
      SELECT ride_id
      FROM user_ride_credits
      WHERE user_id = $1
      ORDER BY ride_id ASC
    `,
    [user.id]
  );

  return {
    user,
    rideIds: result.rows.map((row) => row.ride_id)
  };
};

export const addDemoUserRideCredit = async (
  parkSlug: string,
  rideSlug: string
): Promise<{ user: DemoUser; rideId: number } | null> => {
  const [user, ride] = await Promise.all([
    getDemoUser(),
    getRideIdentityBySlugs(parkSlug, rideSlug)
  ]);

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

export const removeDemoUserRideCredit = async (
  parkSlug: string,
  rideSlug: string
): Promise<{ user: DemoUser; rideId: number } | null> => {
  const [user, ride] = await Promise.all([
    getDemoUser(),
    getRideIdentityBySlugs(parkSlug, rideSlug)
  ]);

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

export const closeDatabase = async () => {
  await pool.end();
};
