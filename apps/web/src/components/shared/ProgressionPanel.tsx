import { formatCountLabel, formatDateLabel } from "../../i18n";
import type { Locale } from "../../i18n";
import type { UiCopy, UserProgressionStatus } from "../../lib/types";

type ProgressionPanelProps = {
  userProgressionStatus: UserProgressionStatus;
  locale: Locale;
  copy: UiCopy;
};

export function ProgressionPanel({
  userProgressionStatus,
  locale,
  copy
}: ProgressionPanelProps) {
  if (userProgressionStatus.state === "idle") {
    return null;
  }

  if (userProgressionStatus.state === "loading") {
    return (
      <div className="state-message state-message-loading">
        <p>{copy.progression.loadingMissions}</p>
      </div>
    );
  }

  if (userProgressionStatus.state === "error") {
    return (
      <div className="state-message state-message-error">
        <p>{copy.progression.unableLoadMissions}</p>
        <p>{userProgressionStatus.message}</p>
      </div>
    );
  }

  return (
    <div className="progression-panel">
      <div className="progression-section">
        <div className="section-row section-row-compact">
          <div>
            <p className="status-label">{copy.progression.activeMissions}</p>
          </div>
          <span className="catalog-chip">
            {formatCountLabel(locale, userProgressionStatus.activeMissions.length, "mission")}
          </span>
        </div>
        <div className="mission-grid">
          {userProgressionStatus.activeMissions.map((mission) => (
            <article className="mission-card" key={mission.id}>
              <div className="mission-copy">
                <strong className="mission-title">{mission.title}</strong>
                <p className="card-summary">{mission.summary}</p>
              </div>
              <div className="mission-progress-row">
                <span className="progress-label">{mission.progressLabel}</span>
                <strong className="mission-progress-value">
                  {mission.completionPercentage}%
                </strong>
              </div>
              <div className="progress-rail" aria-hidden="true">
                <span
                  className="progress-fill"
                  style={{ width: `${mission.completionPercentage}%` }}
                />
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="progression-section">
        <div className="section-row section-row-compact">
          <div>
            <p className="status-label">{copy.progression.recentBadges}</p>
          </div>
          <span className="catalog-chip catalog-chip-ridden">
            {formatCountLabel(locale, userProgressionStatus.badges.length, "badge")}
          </span>
        </div>
        <div className="badge-grid">
          {userProgressionStatus.badges.length > 0 ? (
            userProgressionStatus.badges.slice(0, 4).map((badge) => (
              <article className={`badge-card badge-card-${badge.tone}`} key={badge.id}>
                <div className="badge-copy">
                  <strong className="mission-title">{badge.title}</strong>
                  <p className="card-summary">{badge.summary}</p>
                </div>
                <span className="badge-earned-at">
                  {copy.progression.earnedOn(formatDateLabel(locale, badge.earnedAt))}
                </span>
              </article>
            ))
          ) : (
            <div className="state-message state-message-empty state-message-compact">
              <p>{copy.progression.emptyBadges}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
