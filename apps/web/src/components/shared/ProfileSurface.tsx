import type { UserProfileResponse } from "@coasterly/types";

import { formatDateLabel } from "../../i18n";
import type { Locale } from "../../i18n";
import type { UiCopy } from "../../lib/types";
import { ProgressionPanel } from "./ProgressionPanel";

type ProfileSurfaceProps = {
  profile: UserProfileResponse;
  isCurrentUser: boolean;
  onOpenPark: (parkSlug: string) => void;
  onOpenRide: (parkSlug: string, rideSlug: string) => void;
  onBrowseParks?: () => void;
  onBrowseRides?: () => void;
  onOpenPublicProfile?: (userSlug: string) => void;
  onCopyPublicProfile?: (userSlug: string) => void;
  locale: Locale;
  copy: UiCopy;
};

export function ProfileSurface({
  profile,
  isCurrentUser,
  onOpenPark,
  onOpenRide,
  onBrowseParks,
  onBrowseRides,
  onOpenPublicProfile,
  onCopyPublicProfile,
  locale,
  copy
}: ProfileSurfaceProps) {
  const showProfileActions =
    isCurrentUser && (onOpenPublicProfile !== undefined || onCopyPublicProfile !== undefined);
  const hasRideActivity = profile.totalRiddenRides > 0;
  const showOnboardingState = isCurrentUser && !hasRideActivity;
  const emptyStateLabel = locale === "es" ? "Empieza aqu\u00ed" : "Get started";
  const emptyStateTitle =
    locale === "es"
      ? "Empieza a construir tu historial coaster."
      : "Start building your coaster history.";
  const emptyStateBody =
    locale === "es"
      ? "Registra tus primeras atracciones para guardar cr\u00e9ditos, ver tu progreso en parques y crear un perfil p\u00fablico presentable."
      : "Log your first rides to track credits, build park progress, and turn this into a public profile worth sharing.";
  const emptyStateValueCredits =
    locale === "es" ? "Guardar cr\u00e9ditos coaster" : "Track coaster credits";
  const emptyStateValueParks =
    locale === "es" ? "Construir progreso en parques" : "Build park progress";
  const emptyStateValuePublic =
    locale === "es" ? "Crear un perfil p\u00fablico" : "Create a public profile";
  const emptyStateBrowseParks = locale === "es" ? "Ver parques" : "Browse parks";
  const emptyStateBrowseRides = locale === "es" ? "Ver atracciones" : "Browse rides";
  const publicEmptyTitle =
    locale === "es" ? "Todav\u00eda no hay atracciones registradas." : "No rides logged yet.";
  const publicEmptyBody =
    locale === "es"
      ? "Este perfil ganar\u00e1 contexto cuando empiece a registrar atracciones."
      : "This profile will start to fill out once rides are logged.";

  return (
    <div className="profile-layout">
      <section className="profile-hero">
        <div className="profile-hero-copy">
          <h3 className="section-title">{profile.user.name}</h3>
          <div className="profile-identity-strip" aria-label={copy.profile.progressionLabel}>
            <span className="ride-fact-pill ride-fact-pill-accent">
              {copy.profile.level(profile.identity.level)}
            </span>
            <span className="ride-fact-pill">{copy.profile.xp(profile.identity.totalXp)}</span>
            <span className="ride-fact-pill">
              {copy.profile.streak(profile.identity.currentStreak)}
            </span>
            <span className="ride-fact-pill">
              {copy.profile.completedChallenges(profile.identity.completedDays)}
            </span>
          </div>
        </div>
        {showProfileActions ? (
          <div className="detail-chip-row">
            {isCurrentUser && onOpenPublicProfile ? (
              <button
                className="catalog-inline-button"
                type="button"
                onClick={() => {
                  onOpenPublicProfile(profile.user.slug);
                }}
              >
                {copy.profile.viewPublicPage}
              </button>
            ) : null}
            {isCurrentUser && onCopyPublicProfile ? (
              <button
                className="catalog-inline-button"
                type="button"
                onClick={() => {
                  onCopyPublicProfile(profile.user.slug);
                }}
              >
                {copy.profile.copyLink}
              </button>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="stats-panel" aria-label={copy.profile.title}>
        <div className="stats-grid">
          <article className="stats-card">
            <span className="stats-card-label">{copy.profile.ridesLabel}</span>
            <strong className="stats-card-value">{profile.totalRiddenRides}</strong>
          </article>
          <article className="stats-card">
            <span className="stats-card-label">{copy.profile.parksLabel}</span>
            <strong className="stats-card-value">{profile.totalParksWithRiddenRides}</strong>
          </article>
        </div>
        {profile.parks.length > 0 ? (
          <div className="stats-breakdown">
            {profile.parks.slice(0, 4).map((park) => (
              <button
                className="stats-park-card"
                key={park.parkId}
                type="button"
                onClick={() => {
                  onOpenPark(park.parkSlug);
                }}
              >
                <span className="stats-park-name">{park.parkName}</span>
                <span className="stats-park-value">
                  {copy.park.riddenOutOf(park.riddenRides, park.totalRides)}
                </span>
                <div className="progress-rail" aria-hidden="true">
                  <span
                    className="progress-fill"
                    style={{ width: `${park.completionPercentage}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        ) : null}
      </section>

      {showOnboardingState ? (
        <section className="stats-panel profile-empty-panel" aria-label={emptyStateTitle}>
          <div className="profile-empty-copy">
            <p className="status-label">{emptyStateLabel}</p>
            <h2 className="section-title">{emptyStateTitle}</h2>
            <p className="section-copy">{emptyStateBody}</p>
          </div>
          <div className="profile-empty-value-grid">
            <article className="profile-empty-value-card">
              <strong>{emptyStateValueCredits}</strong>
            </article>
            <article className="profile-empty-value-card">
              <strong>{emptyStateValueParks}</strong>
            </article>
            <article className="profile-empty-value-card">
              <strong>{emptyStateValuePublic}</strong>
            </article>
          </div>
          <div className="profile-empty-actions">
            {onBrowseParks ? (
              <button className="primary-button" type="button" onClick={onBrowseParks}>
                {emptyStateBrowseParks}
              </button>
            ) : null}
            {onBrowseRides ? (
              <button className="ghost-button" type="button" onClick={onBrowseRides}>
                {emptyStateBrowseRides}
              </button>
            ) : null}
          </div>
        </section>
      ) : null}

      {hasRideActivity ? (
        <section className="stats-panel" aria-label={copy.profile.progressionLabel}>
          <ProgressionPanel
            userProgressionStatus={{
              state: "success",
              userName: profile.user.name,
              badges: profile.badges,
              activeMissions: profile.activeMissions
            }}
            locale={locale}
            copy={copy}
          />
        </section>
      ) : null}

      {hasRideActivity ? (
        <section className="catalog-panel nested-panel">
          <div className="catalog-header landing-header">
            <div className="catalog-copy">
              <p className="status-label">{copy.profile.recentActivityLabel}</p>
              <h2 className="section-title">{copy.profile.latestCredits}</h2>
            </div>
          </div>
          {profile.recentActivity.length > 0 ? (
            <div className="activity-list">
              {profile.recentActivity.map((entry) => (
                <article className="activity-card" key={`${entry.rideId}-${entry.riddenAt}`}>
                  <div className="activity-copy">
                    <strong className="mission-title">{entry.rideName}</strong>
                    <p className="card-summary">{entry.parkName}</p>
                  </div>
                  <div className="activity-meta">
                    <span className="badge-earned-at">{formatDateLabel(locale, entry.riddenAt)}</span>
                    <button
                      className="catalog-inline-button"
                      type="button"
                      onClick={() => {
                        onOpenRide(entry.parkSlug, entry.rideSlug);
                      }}
                    >
                      {copy.profile.openRide}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="state-message state-message-empty">
              <p>{copy.profile.noRecentCredits}</p>
            </div>
          )}
        </section>
      ) : !isCurrentUser ? (
        <section
          className="stats-panel profile-empty-panel profile-empty-panel-compact"
          aria-label={publicEmptyTitle}
        >
          <div className="profile-empty-copy">
            <p className="status-label">{copy.profile.publicTitle}</p>
            <h2 className="section-title">{publicEmptyTitle}</h2>
            <p className="section-copy">{publicEmptyBody}</p>
          </div>
        </section>
      ) : null}
    </div>
  );
}
