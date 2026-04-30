import { MediaAsset } from "../components/shared/MediaAsset";
import {
  QueueTimesAttribution,
  QueueTimesExternalLinks
} from "../components/shared/QueueTimes";
import {
  formatLiveWaitLabel,
  formatStatusLabel,
  formatTimeLabel,
  formatWaitStateLabel,
  translateCue
} from "../i18n";

type RideDetailPageProps = Record<string, any>;

export function RideDetailPage(props: RideDetailPageProps) {
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
        <section className="catalog-panel detail-surface" aria-live="polite">
          <div className="detail-layout">
            <div className="detail-nav">
              <button
                className="back-link"
                type="button"
                onClick={() => {
                  navigateBackFromRide(route.parkSlug);
                }}
              >
                {rideDetailOrigin === "rides" ? copy.ride.backToRides : copy.ride.backToLineup}
              </button>
            </div>
            {rideDetailStatus.state === "loading" ? (
              <div className="state-message state-message-loading">
                <p>{copy.ride.loading}</p>
              </div>
            ) : null}
            {rideDetailStatus.state === "success" ? (
              <article className="detail-card detail-card-ride">
                <div className="detail-header detail-header-feature">
                  <div>
                    <p className="status-label">{copy.ride.label}</p>
                    <h2 className="detail-title">{rideDetailStatus.ride.name}</h2>
                    <p className="section-copy detail-summary">
                      {rideDetailStatus.park.name}
                    </p>
                    {activeRideEditorial ? (
                      <p className="detail-story">{activeRideEditorial.summary}</p>
                    ) : null}
                    <div className="detail-micro-nav" aria-label="Ride route context">
                      <span className="detail-micro-item">
                        {locale === "es"
                          ? `En ${formatParkLocation(rideDetailStatus.park)}`
                          : `In ${formatParkLocation(rideDetailStatus.park)}`}
                      </span>
                      <span className="detail-micro-item">
                        {rideDetailStatus.ride.rideType}
                      </span>
                      {activeRideEditorial?.cues.slice(0, 2).map((cue: any) => (
                        <span className="detail-micro-item" key={cue}>
                          {translateCue(locale, cue)}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="detail-chip-row">
                    <span className="catalog-chip">
                      {formatStatusLabel(locale, rideDetailStatus.ride.status)}
                    </span>
                    {currentRideLiveWait ? (
                      <span className="catalog-chip route-chip">
                        {formatLiveWaitLabel(locale, currentRideLiveWait)}
                      </span>
                    ) : null}
                    {isCurrentRideRidden ? (
                      <span className="catalog-chip catalog-chip-ridden">
                        {locale === "es" ? "Montada" : "Ridden"}
                      </span>
                    ) : null}
                  </div>
                </div>

                <MediaAsset
                  kind="ride"
                  slug={rideDetailStatus.ride.slug}
                  imageUrl={rideDetailStatus.ride.imageUrl}
                  alt={`${rideDetailStatus.ride.name} ${locale === "es" ? "atracción" : "ride"} view`}
                  frameClassName="media-frame media-frame-detail"
                  imageClassName="media-image"
                  loading="eager"
                />

                <div className="credit-panel">
                  <div>
                    <p className="status-label">{copy.ride.rideLog}</p>
                    <p className="credit-copy">
                      {currentUserStatus.state === "signed_out"
                        ? rideSignInPrompt
                        : rideCreditsStatus.state === "success"
                        ? isCurrentRideRidden
                          ? copy.ride.saved
                          : copy.ride.savePrompt
                        : rideCreditsStatus.state === "error"
                          ? rideCreditsStatus.message
                          : copy.ride.checking}
                    </p>
                  </div>
                  <button
                    className={`credit-button${isCurrentRideRidden ? " credit-button-active" : ""}`}
                    type="button"
                    onClick={() => {
                      if (currentUserStatus.state === "signed_out") {
                        beginGoogleSignIn(`${window.location.pathname}${window.location.search}`);
                        return;
                      }

                      void toggleRideCredit(!isCurrentRideRidden);
                    }}
                    disabled={
                      isUpdatingRideCredit ||
                      (currentUserStatus.state === "signed_in" && rideCreditsStatus.state !== "success")
                    }
                  >
                    {isUpdatingRideCredit
                      ? copy.ride.saving
                      : currentUserStatus.state === "signed_out"
                        ? copy.nav.signIn
                      : isCurrentRideRidden
                        ? copy.ride.removeRide
                        : copy.ride.markRidden}
                  </button>
                </div>
                {rideCreditMessage ? (
                  <p className="credit-copy">{rideCreditMessage}</p>
                ) : null}

                <div className="queue-times-panel">
                  <div className="section-row section-row-compact">
                    <div>
                      <p className="status-label">{copy.ride.queueTimes}</p>
                    </div>
                    {currentRideLiveWait ? (
                      <span
                        className={`catalog-chip wait-time-chip${
                          currentRideLiveWait.isOpen === false
                            ? " wait-time-chip-closed"
                            : currentRideLiveWait.isOpen === true
                              ? " wait-time-chip-open"
                              : ""
                        }`}
                      >
                        {formatWaitStateLabel(locale, currentRideLiveWait.isOpen)}
                      </span>
                    ) : null}
                  </div>

                  <QueueTimesExternalLinks links={rideQueueTimesLinks} />

                  {parkLiveWaitsStatus.state === "loading" ? (
                    <div className="state-message state-message-loading state-message-compact">
                      <p>{copy.ride.loadingWait}</p>
                    </div>
                  ) : currentRideLiveWait ? (
                    <div className="queue-times-summary">
                      <div className="queue-times-summary-copy">
                        <strong className="queue-times-value">
                          {formatLiveWaitLabel(locale, currentRideLiveWait)}
                        </strong>
                        <p className="wait-time-meta">
                          {currentRideLiveWait.sourceLastUpdated
                            ? copy.common.updatedAt(
                                formatTimeLabel(locale, currentRideLiveWait.sourceLastUpdated) ??
                                  currentRideLiveWait.sourceLastUpdated
                              )
                            : copy.common.currentStatus}
                        </p>
                      </div>
                    </div>
                  ) : parkLiveWaitsStatus.state === "error" ? (
                    <div className="state-message state-message-error state-message-compact">
                      <p>{copy.ride.currentWaitUnavailable}</p>
                      <p>{parkLiveWaitsStatus.message}</p>
                    </div>
                  ) : rideDetailStatus.rideQueueTimes ? (
                    <div className="state-message state-message-empty state-message-compact">
                      <p>{copy.ride.noLiveUpdate}</p>
                    </div>
                  ) : (
                    <div className="state-message state-message-empty state-message-compact">
                      <p>{copy.ride.rideNotLinked}</p>
                    </div>
                  )}

                  <QueueTimesAttribution locale={locale} copy={copy} />
                </div>

                <div className="lineup-nav-panel">
                  <div>
                    <p className="status-label">{copy.ride.rideOrder}</p>
                    <p className="credit-copy">
                      {rideLineupStatus.state === "success"
                        ? rideLineupPositionLabel || copy.park.rideLineup
                        : rideLineupStatus.state === "loading"
                          ? copy.ride.loadingRideOrder
                          : rideLineupStatus.state === "error"
                            ? rideLineupStatus.message
                            : copy.ride.rideOrderUnavailable}
                    </p>
                  </div>
                  <div className="lineup-nav-actions">
                    <button
                      className="lineup-nav-button"
                      type="button"
                      onClick={() => {
                        if (previousRide) {
                          navigateToRide(route.parkSlug, previousRide.slug, {
                            origin: rideDetailOrigin
                          });
                        }
                      }}
                      disabled={!previousRide}
                    >
                      {copy.ride.previousRide}
                    </button>
                    <button
                      className="lineup-nav-button"
                      type="button"
                      onClick={() => {
                        if (nextRide) {
                          navigateToRide(route.parkSlug, nextRide.slug, {
                            origin: rideDetailOrigin
                          });
                        }
                      }}
                      disabled={!nextRide}
                    >
                      {copy.ride.nextRide}
                    </button>
                  </div>
                </div>

                <div className="detail-specs">
                  <div className="section-row section-row-compact">
                    <div>
                      <p className="status-label">{copy.ride.rideFacts}</p>
                    </div>
                  </div>
                  <div className="detail-grid">
                    {rideSpecItems.map((item: any) => (
                      <div
                        className={`detail-item${item.wide ? " detail-item-wide" : ""}`}
                        key={item.label}
                      >
                        <span className="detail-item-label">{item.label}</span>
                        <p>{item.code ? <code>{item.value}</code> : item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ) : null}
            {rideDetailStatus.state === "error" ? (
              <div className="state-message state-message-error">
                <p>{copy.ride.unableLoadRide}</p>
                <p>{rideDetailStatus.message}</p>
              </div>
            ) : null}
          </div>
        </section>
  );
}
