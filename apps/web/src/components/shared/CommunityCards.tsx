import type { CommunityHighlightsResponse } from "@coasterly/types";

import { formatCountLabel, formatDateLabel } from "../../i18n";
import type { Locale } from "../../i18n";
import type { UiCopy } from "../../lib/types";

export function CommunityHighlightCard({
  profile,
  onOpenProfile,
  onOpenPark,
  onOpenRide,
  locale,
  copy
}: {
  profile: CommunityHighlightsResponse["profiles"][number];
  onOpenProfile: (userSlug: string) => void;
  onOpenPark: (parkSlug: string) => void;
  onOpenRide: (parkSlug: string, rideSlug: string) => void;
  locale: Locale;
  copy: UiCopy;
}) {
  return (
    <article className="community-card">
      <div className="community-card-header">
        <div className="community-card-copy">
          <button
            className="community-profile-link"
            type="button"
            onClick={() => {
              onOpenProfile(profile.user.slug);
            }}
          >
            {profile.user.name}
          </button>
        </div>
        <div className="detail-chip-row">
          {profile.featuredPark ? (
            <button
              className="catalog-chip route-chip"
              type="button"
              onClick={() => {
                onOpenPark(profile.featuredPark!.parkSlug);
              }}
            >
              {copy.community.featuredParkProgress(
                profile.featuredPark.completionPercentage,
                profile.featuredPark.parkName
              )}
            </button>
          ) : null}
        </div>
      </div>

      <div className="community-card-stats">
        <span className="ride-fact-pill ride-fact-pill-accent">
          {copy.profile.level(profile.identity.level)}
        </span>
        <span className="ride-fact-pill">{copy.profile.streak(profile.identity.currentStreak)}</span>
        <span className="ride-fact-pill">
          {formatCountLabel(locale, profile.totalRiddenRides, "riddenRide")}
        </span>
        <span className="ride-fact-pill">
          {formatCountLabel(locale, profile.totalParksWithRiddenRides, "park")}
        </span>
        {profile.badges.map((badge) => (
          <span className="ride-fact-pill ride-fact-pill-accent" key={badge.id}>
            {badge.title}
          </span>
        ))}
      </div>

      {profile.recentActivity.length > 0 ? (
        <div className="community-activity-list">
          {profile.recentActivity.map((entry) => (
            <button
              className="community-activity-item"
              key={`${entry.rideId}-${entry.riddenAt}`}
              type="button"
              onClick={() => {
                onOpenRide(entry.parkSlug, entry.rideSlug);
              }}
            >
              <span className="community-activity-ride">{entry.rideName}</span>
              <span className="community-activity-meta">
                {entry.parkName} / {formatDateLabel(locale, entry.riddenAt)}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="state-message state-message-empty state-message-compact">
          <p>{copy.community.noRecentActivity}</p>
        </div>
      )}
    </article>
  );
}

export function CommunityRankingCard({
  kind,
  title,
  summary,
  profiles,
  onOpenProfile,
  locale,
  copy
}: {
  kind: "level" | "streak" | "recent";
  title: string;
  summary: string;
  profiles: CommunityHighlightsResponse["profiles"];
  onOpenProfile: (userSlug: string) => void;
  locale: Locale;
  copy: UiCopy;
}) {
  return (
    <article className="community-ranking-card">
      <div className="community-ranking-copy">
        <p className="status-label">{copy.rankings.label}</p>
        <h3>{title}</h3>
        <p>{summary}</p>
      </div>
      <div className="community-ranking-list">
        {profiles.map((profile, index) => (
          <button
            className="community-ranking-item"
            key={profile.user.id}
            type="button"
            onClick={() => {
              onOpenProfile(profile.user.slug);
            }}
          >
            <span className="community-ranking-position">{index + 1}</span>
            <div className="community-ranking-item-copy">
              <strong>{profile.user.name}</strong>
              <span>
                {kind === "level"
                  ? copy.rankings.levelValue(
                      profile.identity.level,
                      profile.identity.totalXp
                    )
                  : kind === "streak"
                    ? copy.rankings.streakValue(profile.identity.currentStreak)
                    : profile.recentActivity[0]
                      ? copy.rankings.recentValue(
                          profile.recentActivity[0].rideName,
                          profile.recentActivity[0].parkName
                        )
                      : formatCountLabel(locale, profile.totalRiddenRides, "riddenRide")}
              </span>
            </div>
          </button>
        ))}
      </div>
    </article>
  );
}
