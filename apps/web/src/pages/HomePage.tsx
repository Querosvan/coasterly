import type {
  CommunityHighlightsResponse,
  DemoUserStatsResponse,
  Park
} from "@coasterly/types";

import { AuthPromptPanel } from "../components/shared/AuthPromptPanel";
import { CommunityHighlightCard } from "../components/shared/CommunityCards";
import { CuratedCollectionCard } from "../components/shared/CuratedCollectionCard";
import { DailyChallengePanel } from "../components/shared/DailyChallengePanel";
import { MediaAsset } from "../components/shared/MediaAsset";
import { ProgressionPanel } from "../components/shared/ProgressionPanel";
import type { Locale } from "../i18n";
import type {
  CommunityHighlightsStatus,
  CuratedCollection,
  DailyChallengeStatus,
  DemoUserStatsStatus,
  EditorialNote,
  CurrentUserStatus,
  UiCopy,
  UserProgressionStatus
} from "../lib/types";

type ParkProgress = DemoUserStatsResponse["parks"][number];

type JournalTeaser = {
  category: string;
  title: string;
  summary: string;
  status: string;
};

interface HomePageProps {
  copy: UiCopy;
  locale: Locale;
  currentUserStatus: CurrentUserStatus;
  dailyChallengeStatus: DailyChallengeStatus;
  demoUserStatsStatus: DemoUserStatsStatus;
  userProgressionStatus: UserProgressionStatus;
  communityHighlightsStatus: CommunityHighlightsStatus;
  heroCountLabel: string;
  riddenRideCountLabel: string;
  isAuthenticated: boolean;
  isSubmittingDailyChallenge: boolean;
  isClaimingDailyReward: boolean;
  signInPromptTitle: string;
  signInPromptBody: string;
  spotlightPark: Park | undefined;
  spotlightParkEditorial: EditorialNote | undefined;
  spotlightProgress: ParkProgress | undefined;
  secondaryFeaturedParks: Park[];
  landingFeaturedParks: Park[];
  rankedProgressParks: ParkProgress[];
  landingCollections: readonly CuratedCollection[];
  landingCommunityHighlights: CommunityHighlightsResponse["profiles"];
  landingJournalTeasers: JournalTeaser[];
  parkProgressBySlug: Map<string, ParkProgress> | null;
  localizedParkEditorialBySlug: Record<string, EditorialNote>;
  beginGoogleSignIn: (returnTo?: string) => void;
  claimDailyReward: () => void;
  formatParkLocation: (park: Pick<Park, "country" | "city">) => string;
  getParkCardMetric: (
    copy: UiCopy,
    parkProgress?: Pick<ParkProgress, "riddenRides" | "totalRides">
  ) => { label: string; value: string } | null;
  navigateToDiscover: () => void;
  navigateToJournal: () => void;
  navigateToPark: (slug: string) => void;
  navigateToParks: (options?: { preserveSearch?: boolean; collectionId?: string }) => void;
  navigateToProfile: () => void;
  navigateToPublicProfile: (userSlug: string) => void;
  navigateToRide: (parkSlug: string, rideSlug: string) => void;
  navigateToRides: (options?: { preserveFilters?: boolean; collectionId?: string }) => void;
  submitDailyChallengeAnswer: (optionId: string) => void;
}

export function HomePage({
  beginGoogleSignIn,
  claimDailyReward,
  communityHighlightsStatus,
  copy,
  currentUserStatus,
  dailyChallengeStatus,
  demoUserStatsStatus,
  formatParkLocation,
  getParkCardMetric,
  heroCountLabel,
  isAuthenticated,
  isClaimingDailyReward,
  isSubmittingDailyChallenge,
  landingCollections,
  landingCommunityHighlights,
  landingFeaturedParks,
  landingJournalTeasers,
  locale,
  localizedParkEditorialBySlug,
  navigateToDiscover,
  navigateToJournal,
  navigateToPark,
  navigateToParks,
  navigateToProfile,
  navigateToPublicProfile,
  navigateToRide,
  navigateToRides,
  parkProgressBySlug,
  rankedProgressParks,
  riddenRideCountLabel,
  secondaryFeaturedParks,
  signInPromptBody,
  signInPromptTitle,
  spotlightPark,
  spotlightParkEditorial,
  spotlightProgress,
  submitDailyChallengeAnswer,
  userProgressionStatus
}: HomePageProps) {
  return (
        <>
          <section className="hero-panel hero-panel-landing">
            <div className="hero-copy hero-copy-landing">
              <h1>{copy.home.heroTitle}</h1>
              <p className="hero-text">{copy.home.heroText}</p>
              <div className="hero-actions">
                <button className="primary-button" type="button" onClick={() => {
                  navigateToParks({ preserveSearch: true });
                }}>
                  {copy.home.browseParks}
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  onClick={() => {
                    if (isAuthenticated) {
                      navigateToProfile();
                    } else {
                      beginGoogleSignIn();
                    }
                  }}
                >
                  {isAuthenticated ? copy.home.openProfile : copy.nav.signIn}
                </button>
              </div>
              <div className="hero-stats" aria-label="Catalog summary">
                <div className="hero-stat">
                  <span className="hero-stat-label">{copy.home.parksStat}</span>
                  <strong>{heroCountLabel}</strong>
                </div>
                <div className="hero-stat">
                  <span className="hero-stat-label">{copy.home.riddenStat}</span>
                  <strong>{riddenRideCountLabel}</strong>
                </div>
              </div>
            </div>
            <div className="hero-visual">
              {spotlightPark ? (
                <button
                  className="spotlight-card"
                  type="button"
                  onClick={() => {
                    navigateToPark(spotlightPark.slug);
                  }}
                >
                  <MediaAsset
                    kind="park"
                    slug={spotlightPark.slug}
                    imageUrl={spotlightPark.imageUrl}
                    alt={`${spotlightPark.name} park view`}
                    frameClassName="spotlight-media"
                    imageClassName="spotlight-image"
                    loading="eager"
                  />
                  <div className="spotlight-overlay" />
                  <div className="spotlight-copy">
                    <div className="spotlight-row">
                      <span className="catalog-chip">
                        {(getParkCardMetric(copy, spotlightProgress)?.value ??
                          formatParkLocation(spotlightPark))}
                      </span>
                    </div>
                    <p className="eyebrow">{copy.home.featuredPark}</p>
                    <h2>{spotlightPark.name}</h2>
                    <p>{formatParkLocation(spotlightPark)}</p>
                    {spotlightParkEditorial ? (
                      <p className="spotlight-summary">{spotlightParkEditorial.summary}</p>
                    ) : null}
                  </div>
                </button>
              ) : (
                <div className="spotlight-card spotlight-card-empty">
                  <div className="spotlight-copy">
                    <p className="eyebrow">{copy.home.featuredPark}</p>
                    <h2>{copy.browse.loadingResults}</h2>
                    <p>{copy.home.spotlightEmpty}</p>
                  </div>
                </div>
              )}
              {secondaryFeaturedParks.length > 0 ? (
                <div className="spotlight-stack">
                  {secondaryFeaturedParks.map((park) => (
                    <button
                      className="stack-card"
                      key={park.slug}
                      type="button"
                      onClick={() => {
                        navigateToPark(park.slug);
                      }}
                    >
                      <MediaAsset
                        kind="park"
                        slug={park.slug}
                        imageUrl={park.imageUrl}
                        alt=""
                        frameClassName="stack-card-media"
                        imageClassName="stack-card-image"
                      />
                      <div className="stack-card-copy">
                        <span className="stack-card-label">{park.country}</span>
                        <strong>{park.name}</strong>
                      </div>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </section>

          <section className="landing-grid">
            <section className="catalog-panel landing-panel">
              <div className="catalog-header landing-header">
                <div className="catalog-copy">
                  <p className="status-label">{copy.home.featuredLabel}</p>
                  <h2 className="section-title">{copy.home.featuredTitle}</h2>
                </div>
                <div className="landing-actions">
                  <button
                    className="catalog-inline-button"
                    type="button"
                    onClick={() => {
                      navigateToParks({ preserveSearch: true });
                    }}
                  >
                    {copy.home.browseParks}
                  </button>
                </div>
              </div>
              <div className="parks-list parks-list-featured">
                {landingFeaturedParks.map((park) => {
                  const parkProgress = parkProgressBySlug?.get(park.slug);
                  const parkEditorial = localizedParkEditorialBySlug[park.slug];
                  const parkMetric = getParkCardMetric(copy, parkProgress);

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

            <section className="catalog-panel landing-panel">
              <div className="catalog-header landing-header">
                <div className="catalog-copy">
                  <p className="status-label">{copy.home.progressLabel}</p>
                  <h2 className="section-title">{copy.home.progressTitle}</h2>
                </div>
                <div className="landing-actions">
                  <button className="catalog-inline-button" type="button" onClick={navigateToDiscover}>
                    {copy.home.seeProgress}
                  </button>
                </div>
              </div>
              {demoUserStatsStatus.state === "success" ? (
                <div className="stats-panel stats-panel-compact" aria-label="Ride progress">
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
                </div>
              ) : currentUserStatus.state === "signed_out" ? (
                <AuthPromptPanel
                  title={signInPromptTitle}
                  summary={signInPromptBody}
                  actionLabel={copy.nav.signIn}
                  onAction={() => {
                    beginGoogleSignIn();
                  }}
                />
              ) : demoUserStatsStatus.state === "loading" || currentUserStatus.state === "loading" ? (
                <div className="state-message state-message-loading">
                  <p>{copy.browse.loadingResults}</p>
                </div>
              ) : demoUserStatsStatus.state === "error" ? (
                <div className="state-message state-message-error">
                  <p>{copy.progression.unableLoadMissions}</p>
                  <p>{demoUserStatsStatus.message}</p>
                </div>
              ) : null}
            </section>
          </section>

          <section className="catalog-panel landing-panel">
            <div className="catalog-header landing-header">
                <div className="catalog-copy">
                  <p className="status-label">{copy.home.collectionsLabel}</p>
                  <h2 className="section-title">{copy.home.collectionsTitle}</h2>
                </div>
              </div>
            <div className="collection-grid">
              {landingCollections.map((collection) => (
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

          {currentUserStatus.state === "signed_out" ? (
            <AuthPromptPanel
              title={signInPromptTitle}
              summary={signInPromptBody}
              actionLabel={copy.nav.signIn}
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

          <section className="catalog-panel landing-panel">
              <div className="catalog-header landing-header">
                <div className="catalog-copy">
                  <p className="status-label">{copy.home.communityLabel}</p>
                  <h2 className="section-title">{copy.home.communityTitle}</h2>
                </div>
                <div className="landing-actions">
                  <button className="catalog-inline-button" type="button" onClick={navigateToDiscover}>
                    {copy.home.seeMore}
                  </button>
                </div>
              </div>
            {communityHighlightsStatus.state === "loading" ? (
              <div className="state-message state-message-loading state-message-compact">
                <p>{copy.community.loadingActivity}</p>
              </div>
            ) : null}
            {communityHighlightsStatus.state === "success" ? (
              landingCommunityHighlights.length > 0 ? (
                <div className="community-grid">
                  {landingCommunityHighlights.map((profile) => (
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
                  <p>{copy.home.noPublicActivity}</p>
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

          <section className="catalog-panel editorial-panel">
            <div className="catalog-header landing-header">
                <div className="catalog-copy">
                  <p className="status-label">{copy.home.journalLabel}</p>
                  <h2 className="section-title">{copy.home.journalTitle}</h2>
                </div>
                <div className="landing-actions">
                  <button className="catalog-inline-button" type="button" onClick={navigateToJournal}>
                    {copy.home.readJournal}
                  </button>
                </div>
              </div>
            <div className="editorial-grid">
              {landingJournalTeasers.map((entry) => (
                <article className="editorial-card" key={entry.title}>
                  <span className="editorial-tag">{entry.category}</span>
                  <h3>{entry.title}</h3>
                  <p>{entry.summary}</p>
                  <span className="catalog-chip route-chip">{entry.status}</span>
                </article>
              ))}
            </div>
          </section>
        </>
  );
}
