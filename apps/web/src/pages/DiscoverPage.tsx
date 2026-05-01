import type {
  CommunityHighlightsResponse,
  DemoUserStatsResponse,
  Park
} from "@coasterly/types";

import { AuthPromptPanel } from "../components/shared/AuthPromptPanel";
import {
  CommunityHighlightCard,
  CommunityRankingCard
} from "../components/shared/CommunityCards";
import { CuratedCollectionCard } from "../components/shared/CuratedCollectionCard";
import { DailyChallengePanel } from "../components/shared/DailyChallengePanel";
import { MediaAsset } from "../components/shared/MediaAsset";
import { ProgressionPanel } from "../components/shared/ProgressionPanel";
import type { Locale } from "../i18n";
import type {
  CommunityHighlightsStatus,
  CuratedCollection,
  CurrentUserStatus,
  DailyChallengeStatus,
  DemoUserStatsStatus,
  EditorialNote,
  UiCopy,
  UserProgressionStatus
} from "../lib/types";

type ParkProgress = DemoUserStatsResponse["parks"][number];

interface DiscoverPageProps {
  communityHighlights: CommunityHighlightsResponse["profiles"];
  communityHighlightsStatus: CommunityHighlightsStatus;
  copy: UiCopy;
  currentUserStatus: CurrentUserStatus;
  dailyChallengeStatus: DailyChallengeStatus;
  demoUserStatsStatus: DemoUserStatsStatus;
  featuredParks: Park[];
  featuredProgressParks: Array<{ progress: ParkProgress; park: Park }>;
  highestLevelProfiles: CommunityHighlightsResponse["profiles"];
  isClaimingDailyReward: boolean;
  isSubmittingDailyChallenge: boolean;
  locale: Locale;
  localizedCollections: readonly CuratedCollection[];
  localizedParkEditorialBySlug: Record<string, EditorialNote>;
  longestStreakProfiles: CommunityHighlightsResponse["profiles"];
  rankedProgressParks: ParkProgress[];
  recentlyActiveProfiles: CommunityHighlightsResponse["profiles"];
  userProgressionStatus: UserProgressionStatus;
  beginGoogleSignIn: (returnTo?: string) => void;
  claimDailyReward: () => void;
  formatParkLocation: (park: Pick<Park, "country" | "city">) => string;
  getParkCardMetric: (
    copy: UiCopy,
    parkProgress?: Pick<ParkProgress, "riddenRides" | "totalRides">
  ) => { label: string; value: string } | null;
  navigateToPark: (slug: string) => void;
  navigateToParks: (options?: { preserveSearch?: boolean; collectionId?: string }) => void;
  navigateToPublicProfile: (userSlug: string) => void;
  navigateToRide: (parkSlug: string, rideSlug: string) => void;
  navigateToRides: (options?: { preserveFilters?: boolean; collectionId?: string }) => void;
  submitDailyChallengeAnswer: (optionId: string) => void;
}

export function DiscoverPage({
  beginGoogleSignIn,
  claimDailyReward,
  communityHighlights,
  communityHighlightsStatus,
  copy,
  currentUserStatus,
  dailyChallengeStatus,
  demoUserStatsStatus,
  featuredParks,
  featuredProgressParks,
  formatParkLocation,
  getParkCardMetric,
  highestLevelProfiles,
  isClaimingDailyReward,
  isSubmittingDailyChallenge,
  locale,
  localizedCollections,
  localizedParkEditorialBySlug,
  longestStreakProfiles,
  navigateToPark,
  navigateToParks,
  navigateToPublicProfile,
  navigateToRide,
  navigateToRides,
  rankedProgressParks,
  recentlyActiveProfiles,
  submitDailyChallengeAnswer,
  userProgressionStatus
}: DiscoverPageProps) {
  const hasProgress = demoUserStatsStatus.state === "success";

  return (
        <section className="catalog-panel browse-panel" aria-live="polite">
          <div className="catalog-header">
            <div className="catalog-copy">
              <p className="status-label">{copy.discover.label}</p>
              <h2 className="section-title">{copy.discover.title}</h2>
              <p className="section-copy">{copy.discover.intro}</p>
            </div>
            <div className="landing-actions">
              <button
                className="catalog-inline-button"
                type="button"
                onClick={() => {
                  navigateToParks({ preserveSearch: true });
                }}
              >
                {copy.discover.browseParks}
              </button>
              <button
                className="catalog-inline-button"
                type="button"
                onClick={() => {
                  navigateToRides({ preserveFilters: true });
                }}
              >
                {copy.discover.browseRides}
              </button>
            </div>
          </div>

          {currentUserStatus.state === "signed_out" ? (
            <AuthPromptPanel
              title={copy.discover.signedOutTitle}
              summary={copy.discover.signedOutBody}
              actionLabel={copy.home.startTracking}
              onAction={() => {
                beginGoogleSignIn();
              }}
            />
          ) : (
            <DailyChallengePanel
              dailyChallengeStatus={dailyChallengeStatus}
              isSubmitting={isSubmittingDailyChallenge}
              isClaimingReward={isClaimingDailyReward}
              onAnswer={submitDailyChallengeAnswer}
              onClaimReward={claimDailyReward}
              locale={locale}
              copy={copy}
              onOpenRide={(parkSlug, rideSlug) => {
                navigateToRide(parkSlug, rideSlug);
              }}
            />
          )}

          {hasProgress ? (
            <section className="stats-panel" aria-label={copy.discover.rideProgress}>
              <div className="section-row">
                <div>
                  <p className="status-label">{copy.discover.rideProgress}</p>
                  <h2 className="section-title auth-prompt-title">{copy.home.progressTitle}</h2>
                </div>
                <button className="catalog-inline-button" type="button" onClick={() => {
                  navigateToParks({ preserveSearch: true });
                }}>
                  {copy.discover.browseParks}
                </button>
              </div>
              <div className="stats-grid">
                <article className="stats-card">
                  <span className="stats-card-label">{copy.profile.ridesLabel}</span>
                  <strong className="stats-card-value">
                    {demoUserStatsStatus.totalRiddenRides}
                  </strong>
                </article>
                <article className="stats-card">
                  <span className="stats-card-label">{copy.profile.parksLabel}</span>
                  <strong className="stats-card-value">
                    {demoUserStatsStatus.totalParksWithRiddenRides}
                  </strong>
                </article>
              </div>
              <div className="stats-breakdown">
                {rankedProgressParks.map((park) => (
                  <button
                    className="stats-park-card"
                    key={park.parkId}
                    type="button"
                    onClick={() => {
                      navigateToPark(park.parkSlug);
                    }}
                  >
                    <span className="stats-park-name">{park.parkName}</span>
                    <span className="stats-park-value">
                      {copy.park.riddenOutOf(park.riddenRides, park.totalRides)}
                    </span>
                    <div className="progress-rail" aria-hidden="true">
                      <span
                        className="progress-fill"
                        style={{
                          width: `${park.completionPercentage}%`
                        }}
                      />
                    </div>
                  </button>
                ))}
              </div>
              <ProgressionPanel
                userProgressionStatus={userProgressionStatus}
                locale={locale}
                copy={copy}
              />
            </section>
          ) : currentUserStatus.state === "signed_out" ? (
            null
          ) : null}

          <section className="catalog-panel nested-panel">
            <div className="catalog-header landing-header">
              <div className="catalog-copy">
                <p className="status-label">{copy.discover.collectionsLabel}</p>
                <h2 className="section-title">{copy.discover.collectionsTitle}</h2>
                <p className="section-copy">{copy.discover.collectionsSummary}</p>
              </div>
            </div>
            <div className="collection-grid">
              {localizedCollections.map((collection) => (
                <CuratedCollectionCard
                  collection={collection}
                  key={collection.id}
                  locale={locale}
                  copy={copy}
                  onOpen={() => {
                    if (collection.kind === "park") {
                      navigateToParks({ collectionId: collection.id });
                      return;
                    }

                    navigateToRides({ collectionId: collection.id });
                  }}
                />
              ))}
            </div>
          </section>

          <section className="catalog-panel nested-panel">
            <div className="catalog-header landing-header">
              <div className="catalog-copy">
                <p className="status-label">{copy.discover.rankedLabel}</p>
                <h2 className="section-title">{copy.discover.rankedTitle}</h2>
              </div>
            </div>
            {communityHighlightsStatus.state === "loading" ? (
              <div className="state-message state-message-loading state-message-compact">
                <p>{copy.discover.rankingsLoading}</p>
              </div>
            ) : null}
            {communityHighlightsStatus.state === "success" ? (
              communityHighlights.length > 0 ? (
                <div className="community-ranking-grid">
                  <CommunityRankingCard
                    kind="level"
                    title={copy.rankings.highestLevelTitle}
                    summary={copy.rankings.highestLevelSummary}
                    profiles={highestLevelProfiles}
                    locale={locale}
                    copy={copy}
                    onOpenProfile={navigateToPublicProfile}
                  />
                  <CommunityRankingCard
                    kind="streak"
                    title={copy.rankings.longestStreakTitle}
                    summary={copy.rankings.longestStreakSummary}
                    profiles={longestStreakProfiles}
                    locale={locale}
                    copy={copy}
                    onOpenProfile={navigateToPublicProfile}
                  />
                  <CommunityRankingCard
                    kind="recent"
                    title={copy.rankings.recentTitle}
                    summary={copy.rankings.recentSummary}
                    profiles={recentlyActiveProfiles}
                    locale={locale}
                    copy={copy}
                    onOpenProfile={navigateToPublicProfile}
                  />
                </div>
              ) : (
                <div className="state-message state-message-empty state-message-compact">
                  <p>{copy.discover.rankingsEmpty}</p>
                </div>
              )
            ) : null}
            {communityHighlightsStatus.state === "error" ? (
              <div className="state-message state-message-error state-message-compact">
                <p>{copy.discover.rankingsError}</p>
                <p>{communityHighlightsStatus.message}</p>
              </div>
            ) : null}
          </section>

          <section className="catalog-panel nested-panel">
            <div className="catalog-header landing-header">
              <div className="catalog-copy">
                <p className="status-label">{copy.discover.featuredLabel}</p>
                <h2 className="section-title">{copy.discover.featuredTitle}</h2>
                <p className="section-copy">{copy.discover.featuredSummary}</p>
              </div>
            </div>
            <div className="parks-list parks-list-featured">
              {featuredProgressParks.length > 0
                ? featuredProgressParks.map(({ park, progress }) => {
                    const parkEditorial = localizedParkEditorialBySlug[park.slug];
                    const parkMetric = getParkCardMetric(copy, progress);

                    return (
                    <button
                      className="park-card park-card-button"
                      key={park.id}
                      type="button"
                      onClick={() => {
                        navigateToPark(park.slug);
                      }}
                    >
                      <MediaAsset
                        kind="park"
                        slug={park.slug}
                        imageUrl={park.imageUrl}
                        alt={`${park.name} park view`}
                        frameClassName="media-frame media-frame-park"
                        imageClassName="media-image"
                      />
                      <div className="card-header">
                        <div className="park-link">
                          <p className="park-name">{park.name}</p>
                        </div>
                      </div>
                      <p className="park-location">{formatParkLocation(park)}</p>
                      {parkEditorial ? (
                        <p className="card-summary">{parkEditorial.summary}</p>
                      ) : null}
                      {parkMetric ? (
                        <p className="card-key-stat">
                          <span className="card-stat-label">{parkMetric.label}</span>
                          <strong className="card-stat-value">{parkMetric.value}</strong>
                        </p>
                      ) : null}
                    </button>
                    );
                  })
                : featuredParks.map((park) => {
                    const parkEditorial = localizedParkEditorialBySlug[park.slug];
                    const parkMetric = getParkCardMetric(copy);

                    return (
                    <button
                      className="park-card park-card-button"
                      key={park.id}
                      type="button"
                      onClick={() => {
                        navigateToPark(park.slug);
                      }}
                    >
                      <MediaAsset
                        kind="park"
                        slug={park.slug}
                        imageUrl={park.imageUrl}
                        alt={`${park.name} park view`}
                        frameClassName="media-frame media-frame-park"
                        imageClassName="media-image"
                      />
                      <div className="card-header">
                        <div className="park-link">
                          <p className="park-name">{park.name}</p>
                        </div>
                      </div>
                      <p className="park-location">{formatParkLocation(park)}</p>
                      {parkEditorial ? (
                        <p className="card-summary">{parkEditorial.summary}</p>
                      ) : null}
                      {parkMetric ? (
                        <p className="card-key-stat">
                          <span className="card-stat-label">{parkMetric.label}</span>
                          <strong className="card-stat-value">{parkMetric.value}</strong>
                        </p>
                      ) : null}
                    </button>
                    );
                  })}
            </div>
          </section>

          <section className="catalog-panel nested-panel">
            <div className="catalog-header landing-header">
              <div className="catalog-copy">
                <p className="status-label">{copy.discover.communityLabel}</p>
                <h2 className="section-title">{copy.discover.communityTitle}</h2>
              </div>
            </div>
            {communityHighlightsStatus.state === "loading" ? (
              <div className="state-message state-message-loading state-message-compact">
                <p>{copy.community.loadingActivity}</p>
              </div>
            ) : null}
            {communityHighlightsStatus.state === "success" ? (
              communityHighlights.length > 0 ? (
                <div className="community-grid">
                  {communityHighlights.map((profile) => (
                    <CommunityHighlightCard
                      key={profile.user.id}
                      profile={profile}
                      locale={locale}
                      copy={copy}
                      onOpenProfile={navigateToPublicProfile}
                      onOpenPark={navigateToPark}
                      onOpenRide={(parkSlug, rideSlug) => {
                        navigateToRide(parkSlug, rideSlug);
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="state-message state-message-empty state-message-compact">
                  <p>{copy.discover.communityEmpty}</p>
                </div>
              )
            ) : null}
            {communityHighlightsStatus.state === "error" ? (
              <div className="state-message state-message-error state-message-compact">
                <p>{copy.community.unableLoadActivity}</p>
                <p>{communityHighlightsStatus.message}</p>
              </div>
            ) : null}
          </section>
        </section>
  );
}
