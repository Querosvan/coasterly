import { formatDateLabel } from "../../i18n";
import type { Locale } from "../../i18n";
import type { DailyChallengeStatus, UiCopy } from "../../lib/types";
import { MediaAsset } from "./MediaAsset";

type DailyChallengePanelProps = {
  dailyChallengeStatus: DailyChallengeStatus;
  isSubmitting: boolean;
  isClaimingReward: boolean;
  onAnswer: (optionId: string) => void;
  onClaimReward: () => void;
  onOpenRide: (parkSlug: string, rideSlug: string) => void;
  locale: Locale;
  copy: UiCopy;
};

export function DailyChallengePanel({
  dailyChallengeStatus,
  isSubmitting,
  isClaimingReward,
  onAnswer,
  onClaimReward,
  onOpenRide,
  locale,
  copy
}: DailyChallengePanelProps) {
  if (dailyChallengeStatus.state === "idle") {
    return null;
  }

  if (dailyChallengeStatus.state === "loading") {
    return (
      <section className="stats-panel" aria-label={copy.daily.title}>
        <div className="state-message state-message-loading">
          <p>{copy.daily.loading}</p>
        </div>
      </section>
    );
  }

  if (dailyChallengeStatus.state === "error") {
    return (
      <section className="stats-panel" aria-label={copy.daily.title}>
        <div className="state-message state-message-error">
          <p>{copy.daily.error}</p>
          <p>{dailyChallengeStatus.message}</p>
        </div>
      </section>
    );
  }

  const { response } = dailyChallengeStatus;
  const { challenge, summary, attempt, reward } = response;
  const canClaimReward = reward.claimedAt === undefined;
  const resultTone = attempt?.isCorrect
    ? "state-message-success"
    : attempt
      ? "state-message-empty"
      : "state-message-loading";

  return (
    <section className="stats-panel daily-challenge-panel" aria-label={copy.daily.title}>
      <div className="section-row">
        <div>
          <p className="status-label">{copy.daily.today}</p>
          <h2 className="section-title">{copy.daily.title}</h2>
        </div>
        <div className="detail-chip-row">
          <span className="catalog-chip">{copy.daily.level(summary.level)}</span>
          <span className="catalog-chip catalog-chip-ridden">{copy.daily.xp(summary.totalXp)}</span>
          <span className="catalog-chip route-chip">{copy.daily.streak(summary.currentStreak)}</span>
          <button
            className={`catalog-inline-button${canClaimReward ? " catalog-inline-button-accent" : ""}`}
            type="button"
            disabled={!canClaimReward || isClaimingReward}
            onClick={onClaimReward}
          >
            {canClaimReward
              ? isClaimingReward
                ? copy.daily.claiming
                : copy.daily.claimXp(reward.availableXp)
              : copy.daily.claimedXp(reward.claimedXp)}
          </button>
        </div>
      </div>

      <div className="daily-challenge-layout">
        <div className="daily-challenge-media-column">
          <MediaAsset
            kind="ride"
            slug={challenge.ride.slug}
            imageUrl={challenge.ride.imageUrl}
            alt={`${challenge.ride.name} ride view`}
            frameClassName="media-frame media-frame-ride-card"
            imageClassName="media-image"
          />
          <button
            className="catalog-inline-button"
            type="button"
            onClick={() => {
              onOpenRide(challenge.ride.parkSlug, challenge.ride.slug);
            }}
          >
            {copy.daily.openRide}
          </button>
        </div>

        <div className="daily-challenge-copy">
          <p className="status-label">{challenge.title}</p>
          <h3 className="section-title">{challenge.prompt}</h3>

          <div className={`state-message state-message-compact daily-challenge-feedback ${resultTone}`}>
            <p>
              {attempt
                ? attempt.isCorrect
                  ? copy.daily.correct(attempt.earnedXp)
                  : copy.daily.locked(attempt.earnedXp)
                : copy.daily.idle}
            </p>
            <p>
              {canClaimReward
                ? copy.daily.rewardAvailable(reward.availableXp)
                : copy.daily.rewardClaimed(
                    reward.claimedAt ? formatDateLabel(locale, reward.claimedAt) : undefined
                  )}
            </p>
          </div>

          <div className="daily-challenge-options">
            {challenge.options.map((option) => {
              const isSelected = attempt?.selectedOptionId === option.id;
              const isCorrect = attempt?.correctOptionId === option.id;

              return (
                <button
                  key={option.id}
                  className={`daily-challenge-option${
                    isSelected ? " daily-challenge-option-selected" : ""
                  }${isCorrect ? " daily-challenge-option-correct" : ""}`}
                  type="button"
                  disabled={Boolean(attempt) || isSubmitting || isClaimingReward}
                  onClick={() => {
                    onAnswer(option.id);
                  }}
                >
                  <span>{option.label}</span>
                  {attempt ? (
                    <span className="daily-challenge-option-meta">
                      {isCorrect
                        ? locale === "es"
                          ? "Respuesta"
                          : "Answer"
                        : isSelected
                          ? locale === "es"
                            ? "Tu opci\u00f3n"
                            : "Your pick"
                          : ""}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <p className="catalog-note">{copy.daily.completed(summary.completedDays)}</p>
        </div>
      </div>
    </section>
  );
}
