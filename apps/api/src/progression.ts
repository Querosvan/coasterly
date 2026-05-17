import type {
  UserParkProgress,
  ProgressionBadgeTone,
  UserProgressionBadge,
  UserProgressionMission
} from "@coasterly/types";

export type ProgressionRideCreditRecord = {
  createdAt: string;
  parkSlug: string;
  rideType: string;
  manufacturer?: string;
};

type BadgeDefinition = {
  id: string;
  title: string;
  summary: string;
  tone: ProgressionBadgeTone;
};

type MissionDefinition = {
  id: string;
  title: string;
  summary: string;
  target: number;
  progressLabel: (current: number, target: number) => string;
};

const badgeDefinitions: BadgeDefinition[] = [
  {
    id: "first-credit",
    title: "First credit",
    summary: "Log your first ride and start your Coasterly collection.",
    tone: "milestone"
  },
  {
    id: "ride-collector-10",
    title: "Ride collector",
    summary: "Reach 10 ridden rides across the catalog.",
    tone: "milestone"
  },
  {
    id: "park-hopper-3",
    title: "Park hopper",
    summary: "Log rides in 3 different parks.",
    tone: "explorer"
  },
  {
    id: "manufacturer-tour-3",
    title: "Manufacturer tour",
    summary: "Ride coasters from 3 different manufacturers.",
    tone: "explorer"
  },
  {
    id: "ride-type-mix-3",
    title: "Ride type mix",
    summary: "Log 3 different ride types.",
    tone: "explorer"
  },
  {
    id: "park-progress-25",
    title: "Lineup starter",
    summary: "Reach 25% completion in one park lineup.",
    tone: "lineup"
  }
];

const missionDefinitions: MissionDefinition[] = [
  {
    id: "next-5-rides",
    title: "Reach 5 ridden rides",
    summary: "Build your first real collection.",
    target: 5,
    progressLabel: (current, target) => `${current}/${target} rides logged`
  },
  {
    id: "three-park-run",
    title: "Log 3 parks",
    summary: "Spread your credits across multiple park lineups.",
    target: 3,
    progressLabel: (current, target) => `${current}/${target} parks with credits`
  },
  {
    id: "manufacturer-tour",
    title: "Ride 3 manufacturers",
    summary: "Start building a broader coaster profile.",
    target: 3,
    progressLabel: (current, target) => `${current}/${target} manufacturers`
  },
  {
    id: "ride-type-mix",
    title: "Ride 3 types",
    summary: "Mix hypers, launches, inverts, woodies, and more.",
    target: 3,
    progressLabel: (current, target) => `${current}/${target} ride types`
  },
  {
    id: "park-quarter",
    title: "Reach 25% in one park",
    summary: "Push one lineup beyond the first few credits.",
    target: 25,
    progressLabel: (current, target) => `${current}%/${target}% park completion`
  }
];

const clampPercentage = (value: number) =>
  Math.max(0, Math.min(100, Math.round(value)));

const toTimestampValue = (value: string) => {
  const timestamp = Date.parse(value);

  return Number.isNaN(timestamp) ? 0 : timestamp;
};

export const buildUserProgression = (input: {
  rideCredits: ProgressionRideCreditRecord[];
  parkProgress: UserParkProgress[];
  totalRiddenRides: number;
  totalParksWithRiddenRides: number;
}): {
  badges: UserProgressionBadge[];
  activeMissions: UserProgressionMission[];
} => {
  const badgeEarnedAt = new Map<string, string>();
  const parkTotalsBySlug = new Map(
    input.parkProgress.map((park) => [park.parkSlug, park.totalRides])
  );
  const riddenParks = new Set<string>();
  const riddenManufacturers = new Set<string>();
  const riddenRideTypes = new Set<string>();
  const riddenCountsByPark = new Map<string, number>();

  input.rideCredits.forEach((credit, index) => {
    if (index === 0 && !badgeEarnedAt.has("first-credit")) {
      badgeEarnedAt.set("first-credit", credit.createdAt);
    }

    const rideIndex = index + 1;

    if (rideIndex >= 10 && !badgeEarnedAt.has("ride-collector-10")) {
      badgeEarnedAt.set("ride-collector-10", credit.createdAt);
    }

    if (!riddenParks.has(credit.parkSlug)) {
      riddenParks.add(credit.parkSlug);

      if (riddenParks.size >= 3 && !badgeEarnedAt.has("park-hopper-3")) {
        badgeEarnedAt.set("park-hopper-3", credit.createdAt);
      }
    }

    if (credit.manufacturer && !riddenManufacturers.has(credit.manufacturer)) {
      riddenManufacturers.add(credit.manufacturer);

      if (
        riddenManufacturers.size >= 3 &&
        !badgeEarnedAt.has("manufacturer-tour-3")
      ) {
        badgeEarnedAt.set("manufacturer-tour-3", credit.createdAt);
      }
    }

    if (!riddenRideTypes.has(credit.rideType)) {
      riddenRideTypes.add(credit.rideType);

      if (riddenRideTypes.size >= 3 && !badgeEarnedAt.has("ride-type-mix-3")) {
        badgeEarnedAt.set("ride-type-mix-3", credit.createdAt);
      }
    }

    const nextParkCount = (riddenCountsByPark.get(credit.parkSlug) ?? 0) + 1;
    riddenCountsByPark.set(credit.parkSlug, nextParkCount);

    const totalParkRides = parkTotalsBySlug.get(credit.parkSlug);

    if (
      totalParkRides &&
      totalParkRides > 0 &&
      !badgeEarnedAt.has("park-progress-25")
    ) {
      const completionPercentage = Math.round((nextParkCount / totalParkRides) * 100);

      if (completionPercentage >= 25) {
        badgeEarnedAt.set("park-progress-25", credit.createdAt);
      }
    }
  });

  const badges = badgeDefinitions
    .map((badge) => {
      const earnedAt = badgeEarnedAt.get(badge.id);

      if (!earnedAt) {
        return null;
      }

      return {
        ...badge,
        earnedAt
      };
    })
    .filter((badge): badge is UserProgressionBadge => Boolean(badge))
    .sort(
      (left, right) =>
        toTimestampValue(right.earnedAt) - toTimestampValue(left.earnedAt)
    );

  const distinctManufacturers = new Set(
    input.rideCredits
      .map((credit) => credit.manufacturer?.trim())
      .filter((manufacturer): manufacturer is string => Boolean(manufacturer))
  ).size;
  const distinctRideTypes = new Set(input.rideCredits.map((credit) => credit.rideType)).size;
  const bestParkCompletion = input.parkProgress.reduce(
    (best, park) => Math.max(best, park.completionPercentage),
    0
  );

  const missionProgress = new Map<string, number>([
    ["next-5-rides", input.totalRiddenRides],
    ["three-park-run", input.totalParksWithRiddenRides],
    ["manufacturer-tour", distinctManufacturers],
    ["ride-type-mix", distinctRideTypes],
    ["park-quarter", bestParkCompletion]
  ]);

  const activeMissions = missionDefinitions
    .map((mission) => {
      const current = missionProgress.get(mission.id) ?? 0;

      if (current >= mission.target) {
        return null;
      }

      return {
        id: mission.id,
        title: mission.title,
        summary: mission.summary,
        progressCurrent: current,
        progressTarget: mission.target,
        progressLabel: mission.progressLabel(current, mission.target),
        completionPercentage: clampPercentage((current / mission.target) * 100)
      };
    })
    .filter((mission): mission is UserProgressionMission => Boolean(mission))
    .sort(
      (left, right) =>
        right.completionPercentage - left.completionPercentage ||
        left.title.localeCompare(right.title)
    )
    .slice(0, 4);

  return {
    badges,
    activeMissions
  };
};
