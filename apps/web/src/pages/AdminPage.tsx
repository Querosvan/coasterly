import type { AdminCatalogFilter } from "@coasterly/types";

import { AuthPromptPanel } from "../components/shared/AuthPromptPanel";
import { formatStatusLabel } from "../i18n";

type AdminPageProps = Record<string, any>;

export function AdminPage(props: AdminPageProps) {
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
              <p className="status-label">{adminPageLabel}</p>
              <h2 className="section-title">{adminPageTitle}</h2>
            </div>
          </div>

          {currentUserStatus.state === "signed_out" ? (
            <AuthPromptPanel
              title={adminSignedOutTitle}
              summary={adminSignedOutBody}
              actionLabel={copy.nav.signIn}
              onAction={() => {
                beginGoogleSignIn("/admin");
              }}
            />
          ) : null}

          {currentUserStatus.state === "loading" ? (
            <div className="state-message state-message-loading">
              <p>{adminLoadingLabel}</p>
            </div>
          ) : null}

          {currentUserStatus.state === "signed_in" && !isAdminUser ? (
            <section className="stats-panel auth-prompt-panel" aria-label={adminForbiddenTitle}>
              <div className="auth-prompt-copy">
                <p className="status-label">{adminNavLabel}</p>
                <h3 className="section-title auth-prompt-title">{adminForbiddenTitle}</h3>
                <p className="section-copy">{adminForbiddenBody}</p>
              </div>
            </section>
          ) : null}

          {isAdminUser ? (
            <div className="admin-page-grid">
              <section className="stats-panel admin-summary-panel" aria-label={adminPageTitle}>
                <div className="catalog-copy">
                  <p className="status-label">{adminNavLabel}</p>
                  <h3 className="section-title">{adminPageTitle}</h3>
                  <p className="section-copy">{adminInternalNote}</p>
                </div>
                <div className="admin-filter-row">
                  {(Object.keys(adminFilterLabels) as AdminCatalogFilter[]).map((filterKey) => (
                    <button
                      key={filterKey}
                      className={`ghost-button${adminFilter === filterKey ? " ghost-button-active" : ""}`}
                      type="button"
                      onClick={() => {
                        applyAdminFilter(filterKey);
                      }}
                    >
                      {adminFilterLabels[filterKey]}
                    </button>
                  ))}
                </div>
                {adminSummaryStatus.state === "loading" ? (
                  <div className="state-message state-message-loading state-message-compact">
                    <p>{adminLoadingLabel}</p>
                  </div>
                ) : null}
                {adminSummaryStatus.state === "error" ? (
                  <div className="state-message state-message-error state-message-compact">
                    <p>{adminSummaryStatus.message}</p>
                  </div>
                ) : null}
                {adminSummaryStatus.state === "success" ? (
                  <div className="stats-grid admin-summary-grid">
                    <article className="stats-card">
                      <span className="stats-card-label">{adminParksTitle}</span>
                      <strong className="stats-card-value">{adminSummaryStatus.summary.totalParks}</strong>
                    </article>
                    <article className="stats-card">
                      <span className="stats-card-label">{adminMediaMissing}</span>
                      <strong className="stats-card-value">{adminSummaryStatus.summary.parksMissingMedia}</strong>
                    </article>
                    <article className="stats-card">
                      <span className="stats-card-label">{adminQueueMissing}</span>
                      <strong className="stats-card-value">
                        {adminSummaryStatus.summary.parksMissingQueueTimesMapping}
                      </strong>
                    </article>
                    <article className="stats-card">
                      <span className="stats-card-label">{adminRidesTitle}</span>
                      <strong className="stats-card-value">{adminSummaryStatus.summary.totalRides}</strong>
                    </article>
                    <article className="stats-card">
                      <span className="stats-card-label">{`${adminRidesTitle} / ${adminMediaMissing}`}</span>
                      <strong className="stats-card-value">{adminSummaryStatus.summary.ridesMissingMedia}</strong>
                    </article>
                    <article className="stats-card">
                      <span className="stats-card-label">{`${adminRidesTitle} / ${adminQueueMissing}`}</span>
                      <strong className="stats-card-value">
                        {adminSummaryStatus.summary.ridesMissingQueueTimesMapping}
                      </strong>
                    </article>
                    <article className="stats-card">
                      <span className="stats-card-label">{adminNeedsCleanup}</span>
                      <strong className="stats-card-value">{adminSummaryStatus.summary.ridesNeedingCleanup}</strong>
                    </article>
                  </div>
                ) : null}
              </section>

              <section className="catalog-panel nested-panel">
                <div className="catalog-header landing-header">
                  <div className="catalog-copy">
                    <p className="status-label">{adminNavLabel}</p>
                    <h2 className="section-title">{adminParksTitle}</h2>
                  </div>
                </div>
                {adminParksStatus.state === "loading" ? (
                  <div className="state-message state-message-loading state-message-compact">
                    <p>{adminLoadingLabel}</p>
                  </div>
                ) : null}
                {adminParksStatus.state === "error" ? (
                  <div className="state-message state-message-error state-message-compact">
                    <p>{adminParksStatus.message}</p>
                  </div>
                ) : null}
                {adminParksStatus.state === "success" ? (
                  adminParksStatus.parks.length > 0 ? (
                    <>
                      <div className="admin-review-grid">
                        {adminParksStatus.parks.map((park: any) => (
                          <article className="admin-review-card" key={`admin-park-${park.id}`}>
                            <div className="admin-review-copy">
                              <button
                                className="community-profile-link"
                                type="button"
                                onClick={() => {
                                  navigateToPark(park.slug);
                                }}
                              >
                                {park.name}
                              </button>
                              <p className="card-summary">
                                {park.city ? `${park.city}, ${park.country}` : park.country}
                              </p>
                            </div>
                            <div className="admin-review-meta">
                              <span className="detail-item-label">{adminSlugLabel}</span>
                              <code className="detail-item-value detail-item-code">{park.slug}</code>
                            </div>
                            <div className="detail-chip-row">
                              <span className="catalog-chip route-chip">
                                {formatStatusLabel(locale, park.status)}
                              </span>
                              <span className="catalog-chip route-chip">
                                {park.hasImage ? adminMediaAvailable : adminMediaMissing}
                              </span>
                              <span className="catalog-chip route-chip">
                                {park.hasQueueTimesMapping ? adminQueueMapped : adminQueueMissing}
                              </span>
                              {adminFilter === "needs_cleanup" ? (
                                <span className="catalog-chip route-chip">{adminNeedsCleanup}</span>
                              ) : null}
                            </div>
                          </article>
                        ))}
                      </div>
                      <div className="admin-pagination-row">
                        <span className="catalog-note">
                          {`${(adminParksStatus.pageInfo?.offset ?? 0) + 1}-${Math.min(
                            (adminParksStatus.pageInfo?.offset ?? 0) +
                              adminParksStatus.parks.length,
                            adminParksStatus.pageInfo?.totalCount ?? adminParksStatus.parks.length
                          )} / ${adminParksStatus.pageInfo?.totalCount ?? adminParksStatus.parks.length}`}
                        </span>
                        <div className="detail-chip-row">
                          <button
                            className="ghost-button"
                            type="button"
                            onClick={goToPreviousAdminParksPage}
                            disabled={adminParksPage <= defaultAdminCatalogPage}
                          >
                            {locale === "es" ? "Anterior" : "Previous"}
                          </button>
                          <button
                            className="ghost-button"
                            type="button"
                            onClick={goToNextAdminParksPage}
                            disabled={!adminParksStatus.pageInfo?.hasMore}
                          >
                            {locale === "es" ? "Siguiente" : "Next"}
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="state-message state-message-empty state-message-compact">
                      <p>{adminParkEmptyLabel}</p>
                    </div>
                  )
                ) : null}
              </section>

              <section className="catalog-panel nested-panel">
                <div className="catalog-header landing-header">
                  <div className="catalog-copy">
                    <p className="status-label">{adminNavLabel}</p>
                    <h2 className="section-title">{adminRidesTitle}</h2>
                  </div>
                </div>
                {adminRidesStatus.state === "loading" ? (
                  <div className="state-message state-message-loading state-message-compact">
                    <p>{adminLoadingLabel}</p>
                  </div>
                ) : null}
                {adminRidesStatus.state === "error" ? (
                  <div className="state-message state-message-error state-message-compact">
                    <p>{adminRidesStatus.message}</p>
                  </div>
                ) : null}
                {adminRidesStatus.state === "success" ? (
                  adminRidesStatus.rides.length > 0 ? (
                    <>
                      <div className="admin-review-grid">
                        {adminRidesStatus.rides.map((ride: any) => (
                          <article className="admin-review-card" key={`admin-ride-${ride.id}`}>
                            <div className="admin-review-copy">
                              <button
                                className="community-profile-link"
                                type="button"
                                onClick={() => {
                                  navigateToRide(ride.parkSlug, ride.slug, { origin: "rides" });
                                }}
                              >
                                {ride.name}
                              </button>
                              <p className="card-summary">{`${ride.rideType} / ${ride.parkName}`}</p>
                            </div>
                            <div className="admin-review-meta">
                              <span className="detail-item-label">{adminSlugLabel}</span>
                              <code className="detail-item-value detail-item-code">{ride.slug}</code>
                            </div>
                            <div className="detail-chip-row">
                              <span className="catalog-chip route-chip">
                                {formatStatusLabel(locale, ride.status)}
                              </span>
                              <span className="catalog-chip route-chip">
                                {ride.hasImage ? adminMediaAvailable : adminMediaMissing}
                              </span>
                              <span className="catalog-chip route-chip">
                                {ride.hasQueueTimesMapping ? adminQueueMapped : adminQueueMissing}
                              </span>
                              {ride.needsCleanup ? (
                                <span className="catalog-chip route-chip">{adminNeedsCleanup}</span>
                              ) : null}
                            </div>
                          </article>
                        ))}
                      </div>
                      <div className="admin-pagination-row">
                        <span className="catalog-note">
                          {`${(adminRidesStatus.pageInfo?.offset ?? 0) + 1}-${Math.min(
                            (adminRidesStatus.pageInfo?.offset ?? 0) +
                              adminRidesStatus.rides.length,
                            adminRidesStatus.pageInfo?.totalCount ?? adminRidesStatus.rides.length
                          )} / ${adminRidesStatus.pageInfo?.totalCount ?? adminRidesStatus.rides.length}`}
                        </span>
                        <div className="detail-chip-row">
                          <button
                            className="ghost-button"
                            type="button"
                            onClick={goToPreviousAdminRidesPage}
                            disabled={adminRidesPage <= defaultAdminCatalogPage}
                          >
                            {locale === "es" ? "Anterior" : "Previous"}
                          </button>
                          <button
                            className="ghost-button"
                            type="button"
                            onClick={goToNextAdminRidesPage}
                            disabled={!adminRidesStatus.pageInfo?.hasMore}
                          >
                            {locale === "es" ? "Siguiente" : "Next"}
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="state-message state-message-empty state-message-compact">
                      <p>{adminRideEmptyLabel}</p>
                    </div>
                  )
                ) : null}
              </section>
            </div>
          ) : null}
        </section>
  );
}
