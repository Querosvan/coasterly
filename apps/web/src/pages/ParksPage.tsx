import { CatalogSkeletonGrid } from "../components/shared/CatalogSkeletonGrid";
import { CuratedCollectionCard } from "../components/shared/CuratedCollectionCard";
import { MediaAsset } from "../components/shared/MediaAsset";

type ParksPageProps = Record<string, any>;

export function ParksPage(props: ParksPageProps) {
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
              <p className="status-label">{copy.browse.browse}</p>
              <h2 className="section-title">{copy.browse.parksTitle}</h2>
            </div>
          </div>

          <div className="collection-strip" aria-label={copy.home.collectionsTitle}>
            {parkCollections.map((collection: any) => (
              <CuratedCollectionCard
                collection={collection}
                isActive={collection.id === parkCollectionId}
                key={collection.id}
                locale={locale}
                copy={copy}
                onOpen={() => {
                  navigateToParks({ preserveSearch: true, collectionId: collection.id });
                }}
              />
            ))}
          </div>

          <div className="toolbar-panel browse-toolbar">
            <div className="browse-toolbar-main">
              <label className="search-label" htmlFor="park-search">
                {copy.browse.searchParks}
              </label>
              <div className="hero-search-row">
                <input
                  id="park-search"
                  className="search-input"
                  type="search"
                  name="park-search"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    setParksPage(defaultCatalogPage);
                  }}
                  placeholder={copy.browse.parkPlaceholder}
                />
                {searchQuery ? (
                  <button
                    className="catalog-inline-button"
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setParksPage(defaultCatalogPage);
                    }}
                  >
                    {copy.browse.clear}
                  </button>
                ) : null}
              </div>
            </div>
            <div className="catalog-state-row" aria-label={copy.browse.loadingResults}>
              <span className="catalog-chip">
                {parksStatus.state === "success"
                  ? copy.browse.results(visibleParkCount)
                  : copy.browse.loadingResults}
              </span>
              {parkResultRangeLabel ? (
                <span className="catalog-chip route-chip">{parkResultRangeLabel}</span>
              ) : null}
              {selectedParkCollection ? (
                <span className="catalog-chip route-chip">{selectedParkCollection.title}</span>
              ) : null}
              {hasActiveCatalogSearch ? (
                <span className="catalog-chip route-chip">
                  {copy.browse.searchChip(normalizedSearchQuery)}
                </span>
              ) : null}
              {hasActiveParkCollection ? (
                <button
                  className="catalog-inline-button"
                  type="button"
                  onClick={() => {
                    setParkCollectionId("");
                    setParksPage(defaultCatalogPage);
                  }}
                >
                  {copy.browse.clearCollection}
                </button>
              ) : null}
            </div>
          </div>

          {parksStatus.state === "loading" ? <CatalogSkeletonGrid count={8} variant="park" /> : null}
          {parksStatus.state === "success" ? (
            displayedParks.length > 0 ? (
              <>
                <div className="parks-list">
                  {displayedParks.map((park: any) => {
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
                {parksPageInfo && !selectedParkCollection && parksTotalPages > 1 ? (
                  <div className="catalog-pagination-row">
                    <button
                      className="catalog-inline-button"
                      type="button"
                      onClick={goToPreviousParksPage}
                      disabled={parksPage <= defaultCatalogPage}
                    >
                      {copy.browse.previousPage}
                    </button>
                    <span className="catalog-pagination-label">
                      {copy.browse.page(parksPage, parksTotalPages)}
                    </span>
                    <button
                      className="catalog-inline-button"
                      type="button"
                      onClick={goToNextParksPage}
                      disabled={!parksPageInfo.hasMore}
                    >
                      {copy.browse.nextPage}
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="state-message state-message-empty">
                <p>
                  {selectedParkCollection
                    ? copy.browse.noParksForCollection
                    : copy.browse.noParksForSearch}
                </p>
              </div>
            )
          ) : null}
          {parksStatus.state === "error" ? (
            <div className="state-message state-message-error">
              <p>{copy.browse.unableLoadParks}</p>
              <p>{parksStatus.message}</p>
              <button
                className="catalog-inline-button"
                type="button"
                onClick={() => {
                  window.location.reload();
                }}
              >
                {copy.browse.tryAgain}
              </button>
            </div>
          ) : null}
        </section>
  );
}
