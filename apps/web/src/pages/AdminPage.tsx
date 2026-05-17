import type {
  AdminCatalogFilter,
  AdminParkCatalogItem,
  AdminRideCatalogItem
} from "@coasterly/types";

import { AuthPromptPanel } from "../components/shared/AuthPromptPanel";
import { formatStatusLabel, type Locale } from "../i18n";
import type {
  AdminParksStatus,
  AdminRidesStatus,
  AdminSummaryStatus,
  CurrentUserStatus,
  EditorialNote,
  RideDetailOrigin,
  UiCopy
} from "../lib/types";

interface AdminPageProps {
  adminFilter: AdminCatalogFilter;
  adminFilterLabels: Record<AdminCatalogFilter, string>;
  adminForbiddenBody: string;
  adminForbiddenTitle: string;
  adminInternalNote: string;
  adminLoadingLabel: string;
  adminMediaAvailable: string;
  adminMediaMissing: string;
  adminNavLabel: string;
  adminNeedsCleanup: string;
  adminPageLabel: string;
  adminPageTitle: string;
  adminParkEmptyLabel: string;
  adminParksPage: number;
  adminParksStatus: AdminParksStatus;
  adminParksTitle: string;
  adminQueueMapped: string;
  adminQueueMissing: string;
  adminRideEmptyLabel: string;
  adminRidesPage: number;
  adminRidesStatus: AdminRidesStatus;
  adminRidesTitle: string;
  adminSignedOutBody: string;
  adminSignedOutTitle: string;
  adminSlugLabel: string;
  adminSummaryStatus: AdminSummaryStatus;
  copy: UiCopy;
  currentUserStatus: CurrentUserStatus;
  defaultAdminCatalogPage: number;
  isAdminUser: boolean;
  locale: Locale;
  localizedRideEditorialBySlug: Record<string, EditorialNote>;
  applyAdminFilter: (nextFilter: AdminCatalogFilter) => void;
  beginGoogleSignIn: (returnTo?: string) => void;
  goToNextAdminParksPage: () => void;
  goToNextAdminRidesPage: () => void;
  goToPreviousAdminParksPage: () => void;
  goToPreviousAdminRidesPage: () => void;
  navigateToPark: (slug: string) => void;
  navigateToRide: (
    parkSlug: string,
    rideSlug: string,
    options?: { origin?: RideDetailOrigin }
  ) => void;
}

export function AdminPage({
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
  copy,
  currentUserStatus,
  defaultAdminCatalogPage,
  goToNextAdminParksPage,
  goToNextAdminRidesPage,
  goToPreviousAdminParksPage,
  goToPreviousAdminRidesPage,
  isAdminUser,
  locale,
  localizedRideEditorialBySlug,
  navigateToPark,
  navigateToRide
}: AdminPageProps) {
  const isSpanish = locale === "es";
  const currentFilterLabel = adminFilterLabels[adminFilter];
  const dashboardLead = isSpanish
    ? "Prioriza la cobertura editorial del catálogo: media, mappings de Queue-Times y datos que necesitan revisión."
    : "Prioritize editorial catalog coverage: media, Queue-Times mappings, and records that need cleanup.";
  const filterHelp = isSpanish
    ? "Cambia el foco de revisión sin salir de la cola actual."
    : "Switch the review focus without leaving the current queue.";
  const parksSectionTitle = isSpanish ? "Cola de revisión de parques" : "Park review queue";
  const ridesSectionTitle = isSpanish ? "Cola de revisión de atracciones" : "Ride review queue";
  const parksSectionHelp = isSpanish
    ? "Revisa parques sin imagen o sin mapping de Queue-Times antes de publicarlos como completos."
    : "Review parks missing images or Queue-Times mappings before treating them as complete.";
  const ridesSectionHelp = isSpanish
    ? "Primero media de headliners, atracciones mapeadas en Queue-Times y rides operativas; deja cerradas, planned o sin mapping para después."
    : "Fix media for headliners, Queue-Times mapped rides, and operating rides first; leave closed, planned, or unmapped minor rides for later.";
  const mediaPriorityTitle = isSpanish ? "Orden de media" : "Media priority order";
  const mediaPriorityBody = isSpanish
    ? "1) Parques sin media principal. 2) Rides destacadas, operativas o con Queue-Times. 3) Resto de rides sin mapping o no operativas."
    : "1) Parks missing primary media. 2) Featured, operating, or Queue-Times mapped rides. 3) Remaining unmapped or non-operating rides.";
  const activeFilterLabel = isSpanish ? "Filtro activo" : "Active filter";
  const completeLabel = isSpanish ? "Completo" : "Complete";
  const criticalPriorityLabel = isSpanish ? "Crítico" : "Critical";
  const highValuePriorityLabel = isSpanish ? "Alto valor" : "High value";
  const laterPriorityLabel = isSpanish ? "Después" : "Later";
  const coverageLabel = isSpanish ? "Cobertura" : "Coverage";
  const locationLabel = isSpanish ? "Ubicación" : "Location";
  const parkLabel = isSpanish ? "Parque" : "Park";
  const statusLabel = isSpanish ? "Estado" : "Status";
  const typeLabel = isSpanish ? "Tipo" : "Type";
  const noIssuesLabel = isSpanish ? "Sin incidencias visibles" : "No visible issues";
  const noParksForFilter = isSpanish
    ? `No hay parques en la cola "${currentFilterLabel}".`
    : `No parks are in the "${currentFilterLabel}" queue.`;
  const noRidesForFilter = isSpanish
    ? `No hay atracciones en la cola "${currentFilterLabel}".`
    : `No rides are in the "${currentFilterLabel}" queue.`;
  const pageRangeLabel = (
    pageInfo: { offset: number; totalCount: number } | undefined,
    visibleCount: number
  ) =>
    `${(pageInfo?.offset ?? 0) + 1}-${Math.min(
      (pageInfo?.offset ?? 0) + visibleCount,
      pageInfo?.totalCount ?? visibleCount
    )} / ${pageInfo?.totalCount ?? visibleCount}`;
  const issueCountLabel = (count: number) =>
    isSpanish
      ? `${count} ${count === 1 ? "incidencia" : "incidencias"}`
      : `${count} ${count === 1 ? "issue" : "issues"}`;
  const isFeaturedRide = (ride: AdminRideCatalogItem) => {
    const cues = localizedRideEditorialBySlug[ride.slug]?.cues ?? [];

    return cues.some((cue) => cue === "Featured" || cue === "Headliner" || cue === "Iconic");
  };
  const getParkMediaPriority = (park: AdminParkCatalogItem) => {
    if (!park.hasImage) {
      return {
        label: criticalPriorityLabel,
        className: "admin-chip-critical"
      };
    }

    return {
      label: laterPriorityLabel,
      className: "admin-chip-later"
    };
  };
  const getRideMediaPriority = (ride: AdminRideCatalogItem) => {
    if (
      !ride.hasImage &&
      (isFeaturedRide(ride) || ride.hasQueueTimesMapping || ride.status === "operating")
    ) {
      return {
        label: highValuePriorityLabel,
        className: "admin-chip-high-value"
      };
    }

    return {
      label: laterPriorityLabel,
      className: "admin-chip-later"
    };
  };

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
                <div className="admin-dashboard-header">
                  <div className="catalog-copy">
                    <p className="status-label">{adminNavLabel}</p>
                    <h3 className="section-title">{adminPageTitle}</h3>
                    <p className="section-copy">{adminInternalNote}</p>
                    <p className="section-copy">{dashboardLead}</p>
                  </div>
                  <div className="admin-active-filter" aria-label={activeFilterLabel}>
                    <span className="detail-item-label">{activeFilterLabel}</span>
                    <strong>{currentFilterLabel}</strong>
                  </div>
                </div>
                <div className="admin-filter-panel">
                  <div className="admin-filter-copy">
                    <span className="detail-item-label">{coverageLabel}</span>
                    <p className="catalog-note">{filterHelp}</p>
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
                </div>
                <div className="admin-priority-guide" aria-label={mediaPriorityTitle}>
                  <div className="admin-filter-copy">
                    <span className="detail-item-label">{mediaPriorityTitle}</span>
                    <p className="catalog-note">{mediaPriorityBody}</p>
                  </div>
                  <div className="detail-chip-row">
                    <span className="catalog-chip route-chip admin-chip-critical">
                      {criticalPriorityLabel}
                    </span>
                    <span className="catalog-chip route-chip admin-chip-high-value">
                      {highValuePriorityLabel}
                    </span>
                    <span className="catalog-chip route-chip admin-chip-later">
                      {laterPriorityLabel}
                    </span>
                  </div>
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
                    <article className="stats-card admin-summary-card admin-summary-card-total">
                      <span className="stats-card-label">{adminParksTitle}</span>
                      <strong className="stats-card-value">{adminSummaryStatus.summary.totalParks}</strong>
                      <span className="catalog-note">
                        {isSpanish ? "Parques en catálogo" : "Catalog parks"}
                      </span>
                    </article>
                    <article className="stats-card admin-summary-card admin-summary-card-attention">
                      <span className="stats-card-label">{adminMediaMissing}</span>
                      <strong className="stats-card-value">{adminSummaryStatus.summary.parksMissingMedia}</strong>
                      <span className="catalog-note">
                        {isSpanish ? "Parques sin imagen principal" : "Parks missing primary media"}
                      </span>
                    </article>
                    <article className="stats-card admin-summary-card admin-summary-card-attention">
                      <span className="stats-card-label">{adminQueueMissing}</span>
                      <strong className="stats-card-value">
                        {adminSummaryStatus.summary.parksMissingQueueTimesMapping}
                      </strong>
                      <span className="catalog-note">
                        {isSpanish ? "Parques sin mapping de esperas" : "Parks missing wait-time mapping"}
                      </span>
                    </article>
                    <article className="stats-card admin-summary-card admin-summary-card-total">
                      <span className="stats-card-label">{adminRidesTitle}</span>
                      <strong className="stats-card-value">{adminSummaryStatus.summary.totalRides}</strong>
                      <span className="catalog-note">
                        {isSpanish ? "Atracciones en catálogo" : "Catalog rides"}
                      </span>
                    </article>
                    <article className="stats-card admin-summary-card admin-summary-card-attention">
                      <span className="stats-card-label">{`${adminRidesTitle} / ${adminMediaMissing}`}</span>
                      <strong className="stats-card-value">{adminSummaryStatus.summary.ridesMissingMedia}</strong>
                      <span className="catalog-note">
                        {isSpanish ? "Atracciones sin imagen principal" : "Rides missing primary media"}
                      </span>
                    </article>
                    <article className="stats-card admin-summary-card admin-summary-card-attention">
                      <span className="stats-card-label">{`${adminRidesTitle} / ${adminQueueMissing}`}</span>
                      <strong className="stats-card-value">
                        {adminSummaryStatus.summary.ridesMissingQueueTimesMapping}
                      </strong>
                      <span className="catalog-note">
                        {isSpanish ? "Atracciones sin mapping de esperas" : "Rides missing wait-time mapping"}
                      </span>
                    </article>
                    <article className="stats-card admin-summary-card admin-summary-card-cleanup">
                      <span className="stats-card-label">{adminNeedsCleanup}</span>
                      <strong className="stats-card-value">{adminSummaryStatus.summary.ridesNeedingCleanup}</strong>
                      <span className="catalog-note">
                        {isSpanish ? "Atracciones con datos a revisar" : "Rides with data to review"}
                      </span>
                    </article>
                  </div>
                ) : null}
              </section>

              <section className="catalog-panel nested-panel">
                <div className="catalog-header landing-header">
                  <div className="catalog-copy">
                    <p className="status-label">{adminParksTitle}</p>
                    <h2 className="section-title">{parksSectionTitle}</h2>
                    <p className="section-copy">{parksSectionHelp}</p>
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
                        {adminParksStatus.parks.map((park) => {
                          const issueCount =
                            (park.hasImage ? 0 : 1) + (park.hasQueueTimesMapping ? 0 : 1);
                          const priority = getParkMediaPriority(park);

                          return (
                            <article
                              className={`admin-review-card${
                                issueCount > 0 ? " admin-review-card-attention" : ""
                              }`}
                              key={`admin-park-${park.id}`}
                            >
                              <div className="admin-review-card-header">
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
                                    {issueCount > 0 ? issueCountLabel(issueCount) : noIssuesLabel}
                                  </p>
                                </div>
                                <span
                                  className={`catalog-chip route-chip ${
                                    issueCount > 0 ? priority.className : "admin-chip-good"
                                  }`}
                                >
                                  {issueCount > 0 ? priority.label : completeLabel}
                                </span>
                              </div>
                              <div className="admin-review-meta-grid">
                                <div className="admin-review-meta">
                                  <span className="detail-item-label">{locationLabel}</span>
                                  <span className="detail-item-value">
                                    {park.city ? `${park.city}, ${park.country}` : park.country}
                                  </span>
                                </div>
                                <div className="admin-review-meta">
                                  <span className="detail-item-label">{statusLabel}</span>
                                  <span className="detail-item-value">
                                    {formatStatusLabel(locale, park.status)}
                                  </span>
                                </div>
                                <div className="admin-review-meta admin-review-meta-wide">
                                  <span className="detail-item-label">{adminSlugLabel}</span>
                                  <code className="detail-item-value detail-item-code">{park.slug}</code>
                                </div>
                              </div>
                              <div className="detail-chip-row">
                                <span
                                  className={`catalog-chip route-chip ${
                                    park.hasImage ? "admin-chip-good" : "admin-chip-attention"
                                  }`}
                                >
                                  {park.hasImage ? adminMediaAvailable : adminMediaMissing}
                                </span>
                                <span
                                  className={`catalog-chip route-chip ${
                                    park.hasQueueTimesMapping
                                      ? "admin-chip-good"
                                      : "admin-chip-attention"
                                  }`}
                                >
                                  {park.hasQueueTimesMapping ? adminQueueMapped : adminQueueMissing}
                                </span>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                      <div className="admin-pagination-row">
                        <span className="catalog-note">
                          {pageRangeLabel(adminParksStatus.pageInfo, adminParksStatus.parks.length)}
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
                      <p>{adminFilter === "all" ? adminParkEmptyLabel : noParksForFilter}</p>
                    </div>
                  )
                ) : null}
              </section>

              <section className="catalog-panel nested-panel">
                <div className="catalog-header landing-header">
                  <div className="catalog-copy">
                    <p className="status-label">{adminRidesTitle}</p>
                    <h2 className="section-title">{ridesSectionTitle}</h2>
                    <p className="section-copy">{ridesSectionHelp}</p>
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
                        {adminRidesStatus.rides.map((ride) => {
                          const issueCount =
                            (ride.hasImage ? 0 : 1) +
                            (ride.hasQueueTimesMapping ? 0 : 1) +
                            (ride.needsCleanup ? 1 : 0);
                          const priority = getRideMediaPriority(ride);

                          return (
                            <article
                              className={`admin-review-card${
                                issueCount > 0 ? " admin-review-card-attention" : ""
                              }`}
                              key={`admin-ride-${ride.id}`}
                            >
                              <div className="admin-review-card-header">
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
                                  <p className="card-summary">
                                    {issueCount > 0 ? issueCountLabel(issueCount) : noIssuesLabel}
                                  </p>
                                </div>
                                <span
                                  className={`catalog-chip route-chip ${
                                    issueCount > 0 ? priority.className : "admin-chip-good"
                                  }`}
                                >
                                  {issueCount > 0 ? priority.label : completeLabel}
                                </span>
                              </div>
                              <div className="admin-review-meta-grid">
                                <div className="admin-review-meta">
                                  <span className="detail-item-label">{parkLabel}</span>
                                  <span className="detail-item-value">{ride.parkName}</span>
                                </div>
                                <div className="admin-review-meta">
                                  <span className="detail-item-label">{typeLabel}</span>
                                  <span className="detail-item-value">{ride.rideType}</span>
                                </div>
                                <div className="admin-review-meta">
                                  <span className="detail-item-label">{statusLabel}</span>
                                  <span className="detail-item-value">
                                    {formatStatusLabel(locale, ride.status)}
                                  </span>
                                </div>
                                <div className="admin-review-meta admin-review-meta-wide">
                                  <span className="detail-item-label">{adminSlugLabel}</span>
                                  <code className="detail-item-value detail-item-code">{ride.slug}</code>
                                </div>
                              </div>
                              <div className="detail-chip-row">
                                <span
                                  className={`catalog-chip route-chip ${
                                    ride.hasImage ? "admin-chip-good" : "admin-chip-attention"
                                  }`}
                                >
                                  {ride.hasImage ? adminMediaAvailable : adminMediaMissing}
                                </span>
                                <span
                                  className={`catalog-chip route-chip ${
                                    ride.hasQueueTimesMapping
                                      ? "admin-chip-good"
                                      : "admin-chip-attention"
                                  }`}
                                >
                                  {ride.hasQueueTimesMapping ? adminQueueMapped : adminQueueMissing}
                                </span>
                                {ride.needsCleanup ? (
                                  <span className="catalog-chip route-chip admin-chip-cleanup">
                                    {adminNeedsCleanup}
                                  </span>
                                ) : null}
                              </div>
                            </article>
                          );
                        })}
                      </div>
                      <div className="admin-pagination-row">
                        <span className="catalog-note">
                          {pageRangeLabel(adminRidesStatus.pageInfo, adminRidesStatus.rides.length)}
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
                      <p>{adminFilter === "all" ? adminRideEmptyLabel : noRidesForFilter}</p>
                    </div>
                  )
                ) : null}
              </section>
            </div>
          ) : null}
        </section>
  );
}
