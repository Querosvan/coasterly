import { AuthPromptPanel } from "../components/shared/AuthPromptPanel";
import {
  CommunityHighlightCard,
  CommunityRankingCard
} from "../components/shared/CommunityCards";
import { CuratedCollectionCard } from "../components/shared/CuratedCollectionCard";
import { DailyChallengePanel } from "../components/shared/DailyChallengePanel";
import { MediaAsset } from "../components/shared/MediaAsset";
import { ProgressionPanel } from "../components/shared/ProgressionPanel";

type DiscoverPageProps = Record<string, any>;

export function DiscoverPage(props: DiscoverPageProps) {
  const {
    activeParkEditorial,
    activeParkProgress,
    activeRideEditorial,
    adminFilter,
    adminFilterLabels,
    adminForbiddenBody,
    adminForbiddenTitle,
    adminInternalNote,
    adminLoadingLabel,
    adminMediaAvailable,
    adminMediaMissing,
    adminNavLabel,
    adminNeedsCleanup,
    adminPageLabel,
    adminPageTitle,
    adminParkEmptyLabel,
    adminParksPage,
    adminParksStatus,
    adminParksTitle,
    adminQueueMapped,
    adminQueueMissing,
    adminRideEmptyLabel,
    adminRidesPage,
    adminRidesStatus,
    adminRidesTitle,
    adminSignedOutBody,
    adminSignedOutTitle,
    adminSlugLabel,
    adminSummaryStatus,
    applyAdminFilter,
    beginGoogleSignIn,
    claimDailyReward,
    communityHighlights,
    communityHighlightsStatus,
    copy,
    currentRideLiveWait,
    currentUserStatus,
    dailyChallengeStatus,
    defaultAdminCatalogPage,
    defaultCatalogPage,
    defaultParkRideSort,
    defaultRidesCatalogSort,
    demoUserStatsStatus,
    displayedParks,
    displayedRideCatalogItems,
    featuredParks,
    featuredProgressParks,
    formatParkLocation,
    getDisplayRideTypeFilterOptions,
    getParkCardMetric,
    getRideCardMeta,
    goToNextAdminParksPage,
    goToNextAdminRidesPage,
    goToNextParksPage,
    goToNextRidesCatalogPage,
    goToPreviousAdminParksPage,
    goToPreviousAdminRidesPage,
    goToPreviousParksPage,
    goToPreviousRidesCatalogPage,
    hasActiveCatalogSearch,
    hasActiveParkCollection,
    hasActiveRideCollection,
    highestLevelProfiles,
    heroCountLabel,
    isAdminUser,
    isAuthenticated,
    isClaimingDailyReward,
    isCurrentRideRidden,
    isRideFiltersOpen,
    isSubmittingDailyChallenge,
    isUpdatingRideCredit,
    landingCollections,
    landingCommunityHighlights,
    landingFeaturedParks,
    landingJournalTeasers,
    liveWaitByRideId,
    liveWaitRides,
    liveWaitSource,
    locale,
    localizedCollections,
    localizedParkEditorialBySlug,
    localizedRideEditorialBySlug,
    longestStreakProfiles,
    manufacturerFilter,
    navigateBackFromRide,
    navigateToDiscover,
    navigateToJournal,
    navigateToPark,
    navigateToParks,
    navigateToProfile,
    navigateToPublicProfile,
    navigateToRide,
    navigateToRides,
    nextRide,
    normalizedSearchQuery,
    parkCollectionId,
    parkCollections,
    parkDetailStatus,
    parkLiveWaitsStatus,
    parkQueueTimesLinks,
    parkResultRangeLabel,
    parkRideOptions,
    parkRideSort,
    parkRidesStatus,
    parkProgressBySlug,
    parksPage,
    parksPageInfo,
    parksStatus,
    parksTotalPages,
    previousRide,
    rankedProgressParks,
    recentlyActiveProfiles,
    rideCatalogManufacturerFilter,
    rideCatalogParkFilter,
    rideCatalogRideTypeFilter,
    rideCatalogSearchQuery,
    rideCatalogSort,
    rideCollectionId,
    rideCollections,
    rideCreditMessage,
    rideCreditsStatus,
    rideDetailOrigin,
    rideDetailStatus,
    rideLineupPositionLabel,
    rideLineupStatus,
    rideQueueTimesLinks,
    rideResultRangeLabel,
    rideSignInPrompt,
    rideSpecItems,
    rideTypeFilter,
    riddenRideCountLabel,
    riddenRideIds,
    ridesCatalogOptions,
    ridesCatalogPage,
    ridesCatalogPageInfo,
    ridesCatalogStatus,
    ridesCatalogTotalPages,
    route,
    searchQuery,
    secondaryFeaturedParks,
    selectedParkCollection,
    selectedRideCollection,
    setIsRideFiltersOpen,
    setManufacturerFilter,
    setParkCollectionId,
    setParkRideSort,
    setParksPage,
    setRideCatalogManufacturerFilter,
    setRideCatalogParkFilter,
    setRideCatalogRideTypeFilter,
    setRideCatalogSearchQuery,
    setRideCatalogSort,
    setRideCollectionId,
    setRideTypeFilter,
    setRidesCatalogPage,
    setSearchQuery,
    showParkQueueTimesSupport,
    signInPromptBody,
    signInPromptTitle,
    spotlightPark,
    spotlightParkEditorial,
    spotlightProgress,
    submitDailyChallengeAnswer,
    toggleRideCredit,
    userProgressionStatus,
    visibleParkCount,
    visibleRideCatalogCount
  } = props;

  return (
        <section className="catalog-panel browse-panel" aria-live="polite">
          <div className="catalog-header">
            <div className="catalog-copy">
              <p className="status-label">{copy.discover.label}</p>
              <h2 className="section-title">{copy.discover.title}</h2>
            </div>
          </div>

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

          {demoUserStatsStatus.state === "success" ? (
            <section className="stats-panel" aria-label={copy.discover.rideProgress}>
              <div className="section-row">
                <div>
                  <p className="status-label">{copy.discover.rideProgress}</p>
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
                {rankedProgressParks.map((park: any) => (
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
            <AuthPromptPanel
              title={signInPromptTitle}
              summary={signInPromptBody}
              actionLabel={copy.nav.signIn}
              onAction={() => {
                beginGoogleSignIn();
              }}
            />
          ) : null}

          <section className="catalog-panel nested-panel">
            <div className="catalog-header landing-header">
              <div className="catalog-copy">
                <p className="status-label">{copy.discover.collectionsLabel}</p>
                <h2 className="section-title">{copy.discover.collectionsTitle}</h2>
              </div>
            </div>
            <div className="collection-grid">
              {localizedCollections.map((collection: any) => (
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
                <p className="status-label">Ranked now</p>
                <h2 className="section-title">A quicker read on active riders.</h2>
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
              </div>
            </div>
            <div className="parks-list parks-list-featured">
              {featuredProgressParks.length > 0
                ? featuredProgressParks.map(({ park, progress }: { park: any; progress: any }) => {
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
                : featuredParks.map((park: any) => {
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
                  {communityHighlights.map((profile: any) => (
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
                  <p>No recent ride activity yet.</p>
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
