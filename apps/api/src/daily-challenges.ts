import type {
  DailyChallengeAttempt,
  DailyChallengeQuestion,
  DailyChallengeSummary
} from "@coasterly/types";

export type DailyChallengeCatalogItem = {
  rideId: number;
  rideName: string;
  rideSlug: string;
  rideImageUrl?: string;
  parkSlug: string;
  parkName: string;
};

export const DAILY_CHALLENGE_CORRECT_XP = 25;
export const DAILY_CHALLENGE_INCORRECT_XP = 10;
export const DAILY_REWARD_XP = 15;

const toUtcDateKey = (value: Date) => value.toISOString().slice(0, 10);

const toDayNumber = (value: string) =>
  Math.floor(Date.parse(`${value}T00:00:00.000Z`) / 86_400_000);

const shuffleDeterministically = <T>(items: T[], seed: number) => {
  const nextItems = [...items];

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = (seed + index * 7) % (index + 1);
    const current = nextItems[index];
    nextItems[index] = nextItems[swapIndex]!;
    nextItems[swapIndex] = current!;
  }

  return nextItems;
};

export const getTodayChallengeDateKey = (now = new Date()) => toUtcDateKey(now);

export const buildDailyChallengeQuestion = (
  catalog: DailyChallengeCatalogItem[],
  challengeDate: string
): DailyChallengeQuestion | null => {
  if (catalog.length === 0) {
    return null;
  }

  const sortedCatalog = [...catalog].sort(
    (left, right) =>
      left.rideName.localeCompare(right.rideName) ||
      left.parkName.localeCompare(right.parkName)
  );
  const challengeSeed = toDayNumber(challengeDate);
  const selectedRide = sortedCatalog[challengeSeed % sortedCatalog.length]!;
  const allParkOptions = Array.from(
    new Map(
      sortedCatalog.map((item) => [
        item.parkSlug,
        {
          id: item.parkSlug,
          label: item.parkName
        }
      ])
    ).values()
  ).sort((left, right) => left.label.localeCompare(right.label));
  const distractors = allParkOptions.filter((option) => option.id !== selectedRide.parkSlug);
  const chosenDistractors = shuffleDeterministically(distractors, challengeSeed).slice(0, 3);
  const options = shuffleDeterministically(
    [
      ...chosenDistractors,
      {
        id: selectedRide.parkSlug,
        label: selectedRide.parkName
      }
    ],
    challengeSeed + 13
  );

  return {
    id: `ride-park-${challengeDate}`,
    challengeDate,
    title: "Daily ride challenge",
    prompt: `Which park is ${selectedRide.rideName} in?`,
    ride: {
      id: selectedRide.rideId,
      name: selectedRide.rideName,
      slug: selectedRide.rideSlug,
      parkSlug: selectedRide.parkSlug,
      ...(selectedRide.rideImageUrl ? { imageUrl: selectedRide.rideImageUrl } : {})
    },
    options
  };
};

export const buildDailyChallengeSummary = (
  attempts: Array<Pick<DailyChallengeAttempt, "earnedXp"> & { challengeDate: string }>,
  bonusXpTotal = 0
): DailyChallengeSummary => {
  const sortedAttempts = [...attempts].sort((left, right) =>
    left.challengeDate.localeCompare(right.challengeDate)
  );
  const totalXp =
    sortedAttempts.reduce((total, attempt) => total + attempt.earnedXp, 0) + bonusXpTotal;
  const level = Math.floor(totalXp / 100) + 1;
  let currentStreak = 0;
  const todayDayNumber = toDayNumber(getTodayChallengeDateKey());

  if (sortedAttempts.length > 0) {
    const lastAttemptDayNumber = toDayNumber(sortedAttempts[sortedAttempts.length - 1]!.challengeDate);

    if (todayDayNumber - lastAttemptDayNumber <= 1) {
      for (let index = sortedAttempts.length - 1; index >= 0; index -= 1) {
        const current = sortedAttempts[index];
        const previous = sortedAttempts[index - 1];

        currentStreak += 1;

        if (!previous) {
          break;
        }

        if (toDayNumber(current!.challengeDate) - toDayNumber(previous.challengeDate) !== 1) {
          break;
        }
      }
    }
  }

  return {
    totalXp,
    level,
    currentStreak,
    completedDays: sortedAttempts.length
  };
};
