import { Pool } from "pg";

import type { Park, ParkStatus } from "@coasterly/types";

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
  } finally {
    client.release();
  }
};

export const listParks = async (): Promise<Park[]> => {
  const result = await pool.query<Park>(
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

export const closeDatabase = async () => {
  await pool.end();
};
