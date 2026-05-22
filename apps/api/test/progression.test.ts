import { describe, expect, it } from "vitest";

import { buildUserProgression } from "../src/progression.js";
import type { ProgressionRideCreditRecord } from "../src/progression.js";
import type { UserParkProgress } from "@coasterly/types";

const buildCredit = (
  index: number,
  overrides?: Partial<ProgressionRideCreditRecord>
): ProgressionRideCreditRecord => ({
  createdAt: `2026-05-${String(index + 1).padStart(2, "0")}T10:00:00.000Z`,
  parkSlug: `park-${index}`,
  rideType: `type-${index}`,
  manufacturer: `manufacturer-${index}`,
  ...overrides
});

describe("buildUserProgression", () => {
  it("awards earned badges in newest-first order", () => {
    const rideCredits = Array.from({ length: 10 }, (_, index) =>
      buildCredit(index, {
        parkSlug: index < 4 ? "home-park" : `park-${index}`,
        rideType: index < 3 ? `type-${index}` : "coaster",
        manufacturer: index < 3 ? `manufacturer-${index}` : "B&M"
      })
    );
    const parkProgress: UserParkProgress[] = [
      {
        parkId: 1,
        parkName: "Home Park",
        parkSlug: "home-park",
        totalRides: 12,
        riddenRides: 4,
        completionPercentage: 33
      }
    ];

    const result = buildUserProgression({
      rideCredits,
      parkProgress,
      totalRiddenRides: 10,
      totalParksWithRiddenRides: 7
    });

    expect(result.badges.map((badge) => badge.id)).toEqual([
      "ride-collector-10",
      "park-hopper-3",
      "manufacturer-tour-3",
      "ride-type-mix-3",
      "park-progress-25",
      "first-credit"
    ]);
    expect(result.activeMissions).toEqual([]);
  });

  it("returns the four most complete active missions and excludes completed missions", () => {
    const result = buildUserProgression({
      rideCredits: [
        buildCredit(0, {
          parkSlug: "coaster-bay",
          rideType: "launch coaster",
          manufacturer: "Intamin"
        }),
        buildCredit(1, {
          parkSlug: "coaster-bay",
          rideType: "wood coaster",
          manufacturer: "GCI"
        })
      ],
      parkProgress: [
        {
          parkId: 1,
          parkName: "Coaster Bay",
          parkSlug: "coaster-bay",
          totalRides: 6,
          riddenRides: 2,
          completionPercentage: 33
        }
      ],
      totalRiddenRides: 2,
      totalParksWithRiddenRides: 1
    });

    expect(result.activeMissions.map((mission) => mission.id)).toEqual([
      "manufacturer-tour",
      "ride-type-mix",
      "next-5-rides",
      "three-park-run"
    ]);
    expect(result.activeMissions).not.toContainEqual(
      expect.objectContaining({
        id: "park-quarter"
      })
    );
    expect(result.activeMissions[0]).toMatchObject({
      id: "manufacturer-tour",
      progressCurrent: 2,
      progressTarget: 3,
      completionPercentage: 67
    });
  });
});
