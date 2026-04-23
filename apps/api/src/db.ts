import { Pool } from "pg";

import type { Park, ParkStatus, Ride, RideStatus } from "@coasterly/types";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to start the API.");
}

const pool = new Pool({
  connectionString: databaseUrl
});

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
    rideType: "steel coaster"
  },
  {
    parkSlug: "europa-park",
    name: "Voltron Nevera",
    slug: "voltron-nevera",
    status: "operating",
    rideType: "launch coaster"
  },
  {
    parkSlug: "phantasialand",
    name: "Taron",
    slug: "taron",
    status: "operating",
    rideType: "launch coaster"
  },
  {
    parkSlug: "phantasialand",
    name: "F.L.Y.",
    slug: "fly",
    status: "operating",
    rideType: "flying coaster"
  },
  {
    parkSlug: "alton-towers",
    name: "Nemesis Reborn",
    slug: "nemesis-reborn",
    status: "operating",
    rideType: "inverted coaster"
  },
  {
    parkSlug: "alton-towers",
    name: "Wicker Man",
    slug: "wicker-man",
    status: "operating",
    rideType: "wood coaster"
  }
];

export const initializeDatabase = async () => {
  const client = await pool.connect();

  try {
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
        UNIQUE (park_id, slug)
      )
    `);

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
          INSERT INTO rides (park_id, name, slug, status, ride_type)
          SELECT parks.id, $2, $3, $4, $5
          FROM parks
          WHERE parks.slug = $1
          ON CONFLICT (park_id, slug) DO UPDATE
          SET
            name = EXCLUDED.name,
            status = EXCLUDED.status,
            ride_type = EXCLUDED.ride_type
        `,
        [ride.parkSlug, ride.name, ride.slug, ride.status, ride.rideType]
      );
    }
  } finally {
    client.release();
  }
};

const escapeLikePattern = (value: string) => value.replace(/[\\%_]/g, "\\$&");

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

export const listRidesForPark = async (parkId: number): Promise<Ride[]> => {
  const result = await pool.query<{
    id: number;
    park_id: number;
    name: string;
    slug: string;
    status: string;
    ride_type: string;
  }>(
    `
      SELECT id, park_id, name, slug, status, ride_type
      FROM rides
      WHERE park_id = $1
      ORDER BY name ASC
    `,
    [parkId]
  );

  return result.rows.map((ride) => ({
    id: ride.id,
    parkId: ride.park_id,
    name: ride.name,
    slug: ride.slug,
    status: ride.status as RideStatus,
    rideType: ride.ride_type
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
        rides.ride_type AS ride_type
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
      rideType: record.ride_type
    }
  };
};

export const closeDatabase = async () => {
  await pool.end();
};
