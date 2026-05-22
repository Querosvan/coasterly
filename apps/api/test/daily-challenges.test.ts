import { describe, expect, it, vi } from "vitest";

import {
  buildDailyChallengeQuestion,
  buildDailyChallengeSummary,
  DAILY_CHALLENGE_CORRECT_XP,
  DAILY_CHALLENGE_INCORRECT_XP,
  DAILY_REWARD_XP
} from "../src/daily-challenges.js";
import type { DailyChallengeCatalogItem } from "../src/daily-challenges.js";

const catalog: DailyChallengeCatalogItem[] = [
  {
    rideId: 1,
    rideName: "Falcon",
    rideSlug: "falcon",
    parkSlug: "coaster-bay",
    parkName: "Coaster Bay",
    rideType: "launch coaster",
    manufacturer: "Intamin"
  },
  {
    rideId: 2,
    rideName: "High Timber",
    rideSlug: "high-timber",
    parkSlug: "forest-point",
    parkName: "Forest Point",
    rideType: "wood coaster",
    manufacturer: "GCI"
  },
  {
    rideId: 3,
    rideName: "Manta Loop",
    rideSlug: "manta-loop",
    parkSlug: "ocean-world",
    parkName: "Ocean World",
    rideType: "flying coaster",
    manufacturer: "B&M"
  },
  {
    rideId: 4,
    rideName: "Mine Runner",
    rideSlug: "mine-runner",
    parkSlug: "desert-rails",
    parkName: "Desert Rails",
    rideType: "mine train coaster",
    manufacturer: "Vekoma"
  }
];

describe("buildDailyChallengeQuestion", () => {
  it("builds a deterministic question with the correct option included", () => {
    const firstQuestion = buildDailyChallengeQuestion(catalog, "2026-05-22");
    const secondQuestion = buildDailyChallengeQuestion([...catalog].reverse(), "2026-05-22");

    expect(firstQuestion).toEqual(secondQuestion);
    expect(firstQuestion).not.toBeNull();
    const question = firstQuestion!;
    const selectedCatalogItem = catalog.find((item) => item.rideId === question.ride.id)!;
    const correctOptionId =
      question.kind === "ride_to_park"
        ? question.ride.parkSlug
        : selectedCatalogItem[
            question.kind === "ride_to_manufacturer" ? "manufacturer" : "rideType"
          ];

    expect(question.challengeDate).toBe("2026-05-22");
    expect(question.options.map((option) => option.id)).toContain(
      correctOptionId
    );
    expect(question.options).toHaveLength(4);
  });

  it("returns null when there are no catalog rides", () => {
    expect(buildDailyChallengeQuestion([], "2026-05-22")).toBeNull();
  });
});

describe("buildDailyChallengeSummary", () => {
  it("adds earned and bonus XP, computes levels, and counts active streaks", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-22T12:00:00.000Z"));

    try {
      expect(
        buildDailyChallengeSummary(
          [
            {
              challengeDate: "2026-05-20",
              earnedXp: DAILY_CHALLENGE_INCORRECT_XP
            },
            {
              challengeDate: "2026-05-21",
              earnedXp: DAILY_CHALLENGE_CORRECT_XP
            },
            {
              challengeDate: "2026-05-22",
              earnedXp: DAILY_CHALLENGE_CORRECT_XP
            }
          ],
          DAILY_REWARD_XP
        )
      ).toEqual({
        totalXp: 75,
        level: 1,
        currentStreak: 3,
        completedDays: 3
      });
    } finally {
      vi.useRealTimers();
    }
  });
});
