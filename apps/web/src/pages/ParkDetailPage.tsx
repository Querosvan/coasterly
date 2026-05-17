import type { UserStatsResponse, Park, Ride } from "@coasterly/types";
import type { Dispatch, SetStateAction } from "react";

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
import type {
  EditorialNote,
  ExternalInsightLink,
  ParkDetailStatus,
  ParkLiveWaitsStatus,
  ParkRideOptions,
  ParkRideSort,
  ParkRidesStatus,
  RideDetailOrigin,
  UiCopy
} from "../lib/types";
import type { Locale } from "../i18n";

type ParkProgress = UserStatsResponse["parks"][number];
type ParkLiveWait = Extract<ParkLiveWaitsStatus, { state: "success" }>["rides"][number];

const editorialCueRank = {
  Headliner: 0,
  Featured: 1,
  Iconic: 2,
  Standout: 3
} as const;

const getRideEditorialRank = (rideEditorial: EditorialNote | undefined) => {
  if (!rideEditorial) {
    return Number.POSITIVE_INFINITY;
  }

  return Math.min(
    ...rideEditorial.cues.map((cue) => editorialCueRank[cue] ?? Number.POSITIVE_INFINITY)
  );
};

interface ParkDetailPageProps {
  activeParkEditorial: EditorialNote | undefined;
  activeParkProgress: ParkProgress | undefined;
  copy: UiCopy;
  defaultParkRideSort: ParkRideSort;
  locale: Locale;
  localizedRideEditorialBySlug: Record<string, EditorialNote>;
  liveWaitByRideId: Map<number, ParkLiveWait>;
  liveWaitRides: ParkLiveWait[];
  liveWaitSource: Extract<ParkLiveWaitsStatus, { state: "success" }>["source"] | null;
  manufacturerFilter: string;
  parkDetailStatus: ParkDetailStatus;
  parkLiveWaitsStatus: ParkLiveWaitsStatus;
  parkQueueTimesLinks: ExternalInsightLink[];
  parkRideOptions: ParkRideOptions;
  parkRideSort: ParkRideSort;
  parkRidesStatus: ParkRidesStatus;
  parkSlug: string;
  rideTypeFilter: string;
  riddenRideIds: Set<number> | null;
  showParkQueueTimesSupport: boolean;
  formatParkLocation: (park: Pick<Park, "country" | "city">) => string;
  getDisplayRideTypeFilterOptions: (
    locale: Locale,
    rideTypes: string[]
  ) => Array<{ value: string; label: string }>;
  getRideCardMeta: (
    locale: Locale,
    ride: Pick<Ride, "rideType" | "manufacturer" | "openingYear" | "speedKmh">
  ) => string | null;
  navigateToParks: (options?: { preserveSearch?: boolean; collectionId?: string }) => void;
  navigateToRide: (
    parkSlug: string,
    rideSlug: string,
    options?: { origin?: RideDetailOrigin }
  ) => void;
  setManufacturerFilter: Dispatch<SetStateAction<string>>;
  setParkRideSort: Dispatch<SetStateAction<ParkRideSort>>;
  setRideTypeFilter: Dispatch<SetStateAction<string>>;
}

export function ParkDetailPage({
  activeParkEditorial,
  activeParkProgress,
  copy,
  defaultParkRideSort,
  formatParkLocation,
  getDisplayRideTypeFilterOptions,
  getRideCardMeta,
  liveWaitByRideId,
  liveWaitRides,
  liveWaitSource,
  locale,
  localizedRideEditorialBySlug,
  manufacturerFilter,
  navigateToParks,
  navigateToRide,
  parkDetailStatus,
  parkLiveWaitsStatus,
  parkQueueTimesLinks,
  parkRideOptions,
  parkRideSort,
  parkRidesStatus,
  parkSlug,
  rideTypeFilter,
  riddenRideIds,
  setManufacturerFilter,
  setParkRideSort,
  setRideTypeFilter,
  showParkQueueTimesSupport
}: ParkDetailPageProps) {
  const shouldUseEditorialLineupOrder =
    !rideTypeFilter && !manufacturerFilter && parkRideSort === defaultParkRideSort;
  const getDisplayLineupRides = (rides: Ride[]) => {
    if (!shouldUseEditorialLineupOrder) {
      return rides;
    }

    return rides
      .map((ride, index) => ({ ride, index }))
      .sort((left, right) => {
        const leftRank = getRideEditorialRank(localizedRideEditorialBySlug[left.ride.slug]);
        const rightRank = getRideEditorialRank(localizedRideEditorialBySlug[right.ride.slug]);

        return leftRank - rightRank || left.index - right.index;
      })
      .map(({ ride }) => ride);
  };

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
                        {activeParkEditorial.cues.slice(0, 2).map((cue) => (
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
                            ({ value, label }) => (
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
                          {parkRideOptions.manufacturers.map((manufacturer) => (
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
                      <div className="rides-list rides-list-lineup">
                        {getDisplayLineupRides(parkRidesStatus.rides).map((ride) => {
                          const rideEditorial = localizedRideEditorialBySlug[ride.slug];
                          const isEditorialRide = Boolean(rideEditorial);
                          const isHeadlineRide =
                            rideEditorial?.cues.some(
                              (cue) => cue === "Headliner" || cue === "Featured" || cue === "Iconic"
                            ) ?? false;
                          const rideLiveWait = liveWaitByRideId.get(ride.id);
                          const rideMeta = getRideCardMeta(locale, ride);

                          return (
                            <button
                              className={`ride-card ride-card-button ride-card-lineup${
                                isEditorialRide ? " ride-card-editorial" : " ride-card-compact"
                              }${isHeadlineRide ? " ride-card-headline" : ""}${
                                riddenRideIds?.has(ride.id) ? " ride-card-ridden" : ""
                              }`}
                              key={ride.id}
                              type="button"
                              onClick={() => {
                                navigateToRide(parkSlug, ride.slug);
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
                              {rideEditorial?.cues.length ? (
                                <div className="card-cues" aria-label="Ride discovery cues">
                                  {rideEditorial.cues.slice(0, 2).map((cue) => (
                                    <span className="detail-micro-item" key={cue}>
                                      {translateCue(locale, cue)}
                                    </span>
                                  ))}
                                </div>
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
