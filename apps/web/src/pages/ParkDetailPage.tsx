import { MediaAsset } from "../components/shared/MediaAsset";
import {
  QueueTimesAttribution,
  QueueTimesExternalLinks
} from "../components/shared/QueueTimes";
import {
  formatCountLabel,
  formatLiveWaitLabel,
  formatStatusLabel,
  formatTimeLabel,
  formatWaitStateLabel,
  translateCue
} from "../i18n";
import type { ParkRideSort } from "../lib/types";

type ParkDetailPageProps = Record<string, any>;

export function ParkDetailPage(props: ParkDetailPageProps) {
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
                  navigateToParks({ preserveSearch: true });
                }}
              >
                {copy.park.backToParks}
              </button>
            </div>
            {parkDetailStatus.state === "loading" ? (
              <div className="state-message state-message-loading">
                <p>{copy.park.loading}</p>
              </div>
            ) : null}
            {parkDetailStatus.state === "success" ? (
              <article className="detail-card detail-card-park">
                <div className="detail-header detail-header-feature">
                  <div>
                    <p className="status-label">{copy.park.label}</p>
                    <h2 className="detail-title">{parkDetailStatus.park.name}</h2>
                    <p className="section-copy detail-summary">
                      {formatParkLocation(parkDetailStatus.park)}
                    </p>
                    {activeParkEditorial ? (
                      <p className="detail-story">{activeParkEditorial.summary}</p>
                    ) : null}
                    {activeParkEditorial?.cues.length ? (
                      <div className="detail-micro-nav" aria-label="Park discovery cues">
                        {activeParkEditorial.cues.slice(0, 2).map((cue: any) => (
                          <span className="detail-micro-item" key={cue}>
                            {translateCue(locale, cue)}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="detail-chip-row">
                    <span className="catalog-chip">
                      {formatStatusLabel(locale, parkDetailStatus.park.status)}
                    </span>
                    {activeParkProgress ? (
                      <span className="catalog-chip catalog-chip-ridden">
                        {`${activeParkProgress.completionPercentage}% ${copy.park.completion}`}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="detail-overview">
                  <MediaAsset
                    kind="park"
                    slug={parkDetailStatus.park.slug}
                    imageUrl={parkDetailStatus.park.imageUrl}
                    alt={`${parkDetailStatus.park.name} park view`}
                    frameClassName="media-frame media-frame-detail"
                    imageClassName="media-image"
                    loading="eager"
                  />
                  {activeParkProgress ? (
                    <div className="progress-card">
                      <p className="status-label">{copy.park.progressLabel}</p>
                      <div className="progress-copy">
                        <span className="progress-label">{copy.park.completion}</span>
                        <strong className="progress-value">
                          {activeParkProgress.completionPercentage}%
                        </strong>
                      </div>
                      <div className="progress-rail" aria-hidden="true">
                        <span
                          className="progress-fill"
                          style={{
                            width: `${activeParkProgress.completionPercentage}%`
                          }}
                        />
                      </div>
                      <p className="credit-copy">
                        {copy.park.riddenOutOf(
                          activeParkProgress.riddenRides,
                          activeParkProgress.totalRides
                        )}
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className="detail-grid">
                  {parkDetailStatus.park.city ? (
                    <div className="detail-item">
                      <span className="detail-item-label">{copy.park.city}</span>
                      <p>{parkDetailStatus.park.city}</p>
                    </div>
                  ) : null}
                  <div className="detail-item">
                    <span className="detail-item-label">{copy.park.country}</span>
                    <p>{parkDetailStatus.park.country}</p>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item-label">{copy.park.status}</span>
                    <p>{formatStatusLabel(locale, parkDetailStatus.park.status)}</p>
                  </div>
                </div>

                <div className="rides-section">
                  <div className="section-row">
                    <div>
                      <p className="status-label">{copy.park.rideLineup}</p>
                    </div>
                    <div className="detail-chip-row">
                      {parkRidesStatus.state === "success" ? (
                        <span className="catalog-chip">
                          {formatCountLabel(locale, parkRidesStatus.rides.length, "ride")}
                        </span>
                      ) : null}
                      {liveWaitSource ? (
                        <span className="catalog-chip">
                          {liveWaitSource.state === "mapped"
                            ? copy.park.liveRideCount(liveWaitRides.length)
                            : copy.park.notMapped}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  {showParkQueueTimesSupport ? (
                    <div className="queue-times-inline-panel">
                      <div className="queue-times-inline-header">
                        <p className="status-label">{copy.park.queueTimes}</p>
                        <QueueTimesExternalLinks links={parkQueueTimesLinks} />
                      </div>
                      {parkLiveWaitsStatus.state === "loading" ? (
                        <div className="state-message state-message-loading state-message-compact">
                          <p>{copy.park.loadingLiveWaits}</p>
                        </div>
                      ) : null}
                      {parkLiveWaitsStatus.state === "error" ? (
                        <div className="state-message state-message-error state-message-compact">
                          <p>{copy.park.liveWaitsUnavailable}</p>
                          <p>{parkLiveWaitsStatus.message}</p>
                        </div>
                      ) : null}
                      {parkLiveWaitsStatus.state === "success" &&
                      parkLiveWaitsStatus.source.state === "mapped" &&
                      parkLiveWaitsStatus.rides.length === 0 ? (
                        <div className="state-message state-message-empty state-message-compact">
                          <p>{copy.park.noLiveRideUpdates}</p>
                        </div>
                      ) : null}
                      {parkLiveWaitsStatus.state === "success" &&
                      parkLiveWaitsStatus.source.state === "unmapped" ? (
                        <div className="state-message state-message-empty state-message-compact">
                          <p>{copy.park.parkNotLinked}</p>
                        </div>
                      ) : null}
                      {parkLiveWaitsStatus.state === "success" ? (
                        <QueueTimesAttribution locale={locale} copy={copy} />
                      ) : null}
                    </div>
                  ) : null}
                  <div className="toolbar-panel">
                    <div className="ride-toolbar" aria-label="Ride filters and sorting">
                      <div className="toolbar-field">
                        <label className="search-label" htmlFor="ride-type-filter">
                          {copy.browse.rideType}
                        </label>
                        <select
                          id="ride-type-filter"
                          className="toolbar-select"
                          value={rideTypeFilter}
                          onChange={(event) => {
                            setRideTypeFilter(event.target.value);
                          }}
                        >
                          <option value="">{copy.browse.allRideTypes}</option>
                          {getDisplayRideTypeFilterOptions(locale, parkRideOptions.rideTypes).map(
                            ({ value, label }: { value: any; label: any }) => (
                              <option key={value} value={value}>
                                {label}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                      <div className="toolbar-field">
                        <label className="search-label" htmlFor="manufacturer-filter">
                          {copy.browse.manufacturer}
                        </label>
                        <select
                          id="manufacturer-filter"
                          className="toolbar-select"
                          value={manufacturerFilter}
                          onChange={(event) => {
                            setManufacturerFilter(event.target.value);
                          }}
                        >
                          <option value="">{copy.browse.allManufacturers}</option>
                          {parkRideOptions.manufacturers.map((manufacturer: any) => (
                            <option key={manufacturer} value={manufacturer}>
                              {manufacturer}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="toolbar-field">
                        <label className="search-label" htmlFor="ride-sort">
                          {copy.browse.sortBy}
                        </label>
                        <select
                          id="ride-sort"
                          className="toolbar-select"
                          value={parkRideSort}
                          onChange={(event) => {
                            setParkRideSort(event.target.value as ParkRideSort);
                          }}
                        >
                          <option value="name">{copy.browse.name}</option>
                          <option value="opening_year">{copy.browse.openingYear}</option>
                          <option value="speed_kmh">{copy.browse.topSpeed}</option>
                        </select>
                      </div>
                    </div>
                    <div className="catalog-state-row">
                      {parkRidesStatus.state === "success" ? (
                        <span className="catalog-chip">
                          {copy.park.visibleRides(parkRidesStatus.rides.length)}
                        </span>
                      ) : null}
                      {(rideTypeFilter ||
                        manufacturerFilter ||
                        parkRideSort !== defaultParkRideSort) ? (
                        <button
                          className="catalog-inline-button"
                          type="button"
                          onClick={() => {
                            setRideTypeFilter("");
                            setManufacturerFilter("");
                            setParkRideSort(defaultParkRideSort);
                          }}
                        >
                          {copy.browse.clearFilters}
                        </button>
                      ) : null}
                    </div>
                  </div>
                  {parkRidesStatus.state === "loading" ? (
                    <div className="state-message state-message-loading">
                      <p>{copy.park.loadingRides}</p>
                    </div>
                  ) : null}
                  {parkRidesStatus.state === "success" ? (
                    parkRidesStatus.rides.length > 0 ? (
                      <div className="rides-list">
                        {parkRidesStatus.rides.map((ride: any) => {
                          const rideEditorial = localizedRideEditorialBySlug[ride.slug];
                          const rideLiveWait = liveWaitByRideId.get(ride.id);
                          const rideMeta = getRideCardMeta(locale, ride);

                          return (
                            <button
                              className={`ride-card ride-card-button${riddenRideIds?.has(ride.id) ? " ride-card-ridden" : ""}`}
                              key={ride.id}
                              type="button"
                              onClick={() => {
                                navigateToRide(route.slug, ride.slug);
                              }}
                            >
                              <MediaAsset
                                kind="ride"
                                slug={ride.slug}
                                imageUrl={ride.imageUrl}
                                alt=""
                                frameClassName="media-frame media-frame-ride-card"
                                imageClassName="media-image"
                              />
                              <div className="card-header">
                                <div className="ride-link">
                                  <p className="ride-name">{ride.name}</p>
                                </div>
                              </div>
                              {rideEditorial ? (
                                <p className="card-summary">{rideEditorial.summary}</p>
                              ) : null}
                              {rideMeta ? <p className="card-meta-line">{rideMeta}</p> : null}
                              {rideLiveWait ? (
                                <div className="ride-live-row">
                                  <div className="ride-live-copy">
                                    <span className="ride-live-label">{copy.park.queueTimes}</span>
                                    <strong className="ride-live-value">
                                      {formatLiveWaitLabel(locale, rideLiveWait)}
                                    </strong>
                                    <span className="ride-live-meta">
                                      {rideLiveWait.sourceLastUpdated
                                        ? copy.common.updatedAt(
                                            formatTimeLabel(
                                              locale,
                                              rideLiveWait.sourceLastUpdated
                                            ) ?? rideLiveWait.sourceLastUpdated
                                          )
                                        : copy.common.currentStatus}
                                    </span>
                                  </div>
                                  <span
                                    className={`catalog-chip wait-time-chip${
                                      rideLiveWait.isOpen === false
                                        ? " wait-time-chip-closed"
                                        : rideLiveWait.isOpen === true
                                          ? " wait-time-chip-open"
                                          : ""
                                    }`}
                                  >
                                    {formatWaitStateLabel(locale, rideLiveWait.isOpen)}
                                  </span>
                                </div>
                              ) : ride.status !== "operating" ? (
                                <p className="card-support-line">
                                  {formatStatusLabel(locale, ride.status)}
                                </p>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="state-message state-message-empty">
                        <p>
                          {rideTypeFilter || manufacturerFilter
                            ? copy.park.noRidesForFilters
                            : copy.park.noRidesAvailable}
                        </p>
                        <p>
                          {rideTypeFilter || manufacturerFilter
                            ? copy.park.clearOneFilter
                            : copy.park.noSeededRides}
                        </p>
                      </div>
                    )
                  ) : null}
                  {parkRidesStatus.state === "error" ? (
                    <div className="state-message state-message-error">
                      <p>{copy.park.unableLoadRides}</p>
                      <p>{parkRidesStatus.message}</p>
                    </div>
                  ) : null}
                </div>
              </article>
            ) : null}
            {parkDetailStatus.state === "error" ? (
              <div className="state-message state-message-error">
                <p>{copy.park.unableLoadPark}</p>
                <p>{parkDetailStatus.message}</p>
              </div>
            ) : null}
          </div>
        </section>
  );
}
