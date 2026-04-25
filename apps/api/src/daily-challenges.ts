import type {
  DailyChallengeAttempt,
  DailyChallengeQuestion,
  DailyChallengeQuestionKind,
  DailyChallengeSummary
} from "@coasterly/types";

export type DailyChallengeCatalogItem = {
  rideId: number;
  rideName: string;
  rideSlug: string;
  rideImageUrl?: string;
  parkSlug: string;
  parkName: string;
  rideType: string;
  manufacturer?: string;
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

type ChallengeTemplate = {
  kind: DailyChallengeQuestionKind;
  title: string;
  buildOptions: (
    catalog: DailyChallengeCatalogItem[],
    selectedRide: DailyChallengeCatalogItem,
    seed: number
  ) => {
    prompt: string;
    correctOptionId: string;
    options: DailyChallengeQuestion["options"];
  } | null;
};

const buildDistinctOptions = (
  values: Array<{ id: string; label: string }>,
  correctOption: { id: string; label: string },
  seed: number
) => {
  const distractors = values.filter((option) => option.id !== correctOption.id);
  const chosenDistractors = shuffleDeterministically(distractors, seed).slice(0, 3);

  return shuffleDeterministically([...chosenDistractors, correctOption], seed + 13);
};

const challengeTemplates: ChallengeTemplate[] = [
  {
    kind: "ride_to_park",
    title: "Daily park challenge",
    buildOptions: (catalog, selectedRide, seed) => {
      const values = Array.from(
        new Map(
          catalog.map((item) => [
            item.parkSlug,
            {
              id: item.parkSlug,
              label: item.parkName
            }
          ])
        ).values()
      ).sort((left, right) => left.label.localeCompare(right.label));

      return {
        prompt: `Which park is ${selectedRide.rideName} in?`,
        correctOptionId: selectedRide.parkSlug,
        options: buildDistinctOptions(
          values,
          {
            id: selectedRide.parkSlug,
            label: selectedRide.parkName
          },
          seed
        )
      };
    }
  },
  {
    kind: "ride_to_manufacturer",
    title: "Daily manufacturer challenge",
    buildOptions: (catalog, selectedRide, seed) => {
      if (!selectedRide.manufacturer) {
        return null;
      }

      const values = Array.from(
        new Map(
          catalog
            .filter((item) => item.manufacturer)
            .map((item) => [
              item.manufacturer!,
              {
                id: item.manufacturer!,
                label: item.manufacturer!
              }
            ])
        ).values()
      ).sort((left, right) => left.label.localeCompare(right.label));

      return {
        prompt: `Who manufactured ${selectedRide.rideName}?`,
        correctOptionId: selectedRide.manufacturer,
        options: buildDistinctOptions(
          values,
          {
            id: selectedRide.manufacturer,
            label: selectedRide.manufacturer
          },
          seed
        )
      };
    }
  },
  {
    kind: "ride_to_type",
    title: "Daily ride type challenge",
    buildOptions: (catalog, selectedRide, seed) => {
      const values = Array.from(
        new Map(
          catalog.map((item) => [
            item.rideType,
            {
              id: item.rideType,
              label: item.rideType
            }
          ])
        ).values()
      ).sort((left, right) => left.label.localeCompare(right.label));

      return {
        prompt: `What type of coaster is ${selectedRide.rideName}?`,
        correctOptionId: selectedRide.rideType,
        options: buildDistinctOptions(
          values,
          {
            id: selectedRide.rideType,
            label: selectedRide.rideType
          },
          seed
        )
      };
    }
  }
];

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
  const template = challengeTemplates[challengeSeed % challengeTemplates.length]!;
  const templateEligibleCatalog =
    template.kind === "ride_to_manufacturer"
      ? sortedCatalog.filter((item) => item.manufacturer)
      : sortedCatalog;
  const eligibleCatalog =
    templateEligibleCatalog.length > 0 ? templateEligibleCatalog : sortedCatalog;
  const selectedRide = eligibleCatalog[challengeSeed % eligibleCatalog.length]!;
  const builtQuestion = template.buildOptions(sortedCatalog, selectedRide, challengeSeed);

  if (!builtQuestion) {
    return null;
  }

  return {
    id: `${template.kind}-${challengeDate}`,
    challengeDate,
    kind: template.kind,
    title: template.title,
    prompt: builtQuestion.prompt,
    ride: {
      id: selectedRide.rideId,
      name: selectedRide.rideName,
      slug: selectedRide.rideSlug,
      parkSlug: selectedRide.parkSlug,
      ...(selectedRide.rideImageUrl ? { imageUrl: selectedRide.rideImageUrl } : {})
    },
    options: builtQuestion.options
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
