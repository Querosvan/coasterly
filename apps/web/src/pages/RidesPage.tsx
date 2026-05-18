import type { Park, Ride, RideCatalogItem, RideCatalogResponse } from "@coasterly/types";
import type { Dispatch, SetStateAction } from "react";
import { useEffect, useMemo, useState } from "react";

import { CatalogSkeletonGrid } from "../components/shared/CatalogSkeletonGrid";
import { CuratedCollectionCard } from "../components/shared/CuratedCollectionCard";
import { MediaAsset } from "../components/shared/MediaAsset";
import { formatStatusLabel, type Locale } from "../i18n";
import { editorialFeaturedRideSlugs } from "../lib/catalogContent";
import { fullCatalogFetchLimit } from "../lib/routes";
import type {
  CuratedCollection,
  EditorialNote,
  RideDetailOrigin,
  RidesCatalogOptions,
  RidesCatalogSort,
  RidesCatalogStatus,
  UiCopy
} from "../lib/types";
import { apiBaseUrl } from "../hooks/userDataApi";

const dedupeStrings = (values: string[]) => Array.from(new Set(values));

const selectEditorialRideItems = (
  rides: RideCatalogItem[],
  rideSlugOrder: string[],
  rideEditorialBySlug: Record<string, EditorialNote>,
  limit: number
) => {
  const rideBySlug = new Map(rides.map((entry) => [entry.ride.slug, entry]));
  const orderedRides = rideSlugOrder
    .map((slug) => rideBySlug.get(slug))
    .filter((entry): entry is RideCatalogItem => Boolean(entry));
  const orderedSlugs = new Set(orderedRides.map((entry) => entry.ride.slug));
  const remainingEditorialRides = rides.filter(
    (entry) => !orderedSlugs.has(entry.ride.slug) && Boolean(rideEditorialBySlug[entry.ride.slug])
  );

  return [...orderedRides, ...remainingEditorialRides].slice(0, limit);
};

interface RidesPageProps {
  copy: UiCopy;
  locale: Locale;
  defaultCatalogPage: number;
  defaultRidesCatalogSort: RidesCatalogSort;
  displayedRideCatalogItems: RideCatalogItem[];
  hasActiveRideCollection: boolean;
  isRideFiltersOpen: boolean;
  localizedRideEditorialBySlug: Record<string, EditorialNote>;
  rideCatalogManufacturerFilter: string;
  rideCatalogParkFilter: string;
  rideCatalogRideTypeFilter: string;
  rideCatalogSearchQuery: string;
  rideCatalogSort: RidesCatalogSort;
  rideCollectionId: string;
  rideCollections: readonly CuratedCollection[];
  rideResultRangeLabel: string | null;
  riddenRideIds: Set<number> | null;
  ridesCatalogOptions: RidesCatalogOptions;
  ridesCatalogPage: number;
  ridesCatalogPageInfo:
    | Extract<RidesCatalogStatus, { state: "success" }>["pageInfo"]
    | undefined;
  ridesCatalogStatus: RidesCatalogStatus;
  ridesCatalogTotalPages: number;
  selectedRideCollection: CuratedCollection | undefined;
  visibleRideCatalogCount: number;
  getDisplayRideTypeFilterOptions: (
    locale: Locale,
    rideTypes: string[]
  ) => Array<{ value: string; label: string }>;
  getRideCardMeta: (
    locale: Locale,
    ride: Pick<Ride, "rideType" | "manufacturer" | "openingYear" | "speedKmh">
  ) => string | null;
  goToNextRidesCatalogPage: () => void;
  goToPreviousRidesCatalogPage: () => void;
  navigateToRide: (
    parkSlug: string,
    rideSlug: string,
    options?: { origin?: RideDetailOrigin }
  ) => void;
  navigateToRides: (options?: { preserveFilters?: boolean; collectionId?: string }) => void;
  setIsRideFiltersOpen: Dispatch<SetStateAction<boolean>>;
  setRideCatalogManufacturerFilter: Dispatch<SetStateAction<string>>;
  setRideCatalogParkFilter: Dispatch<SetStateAction<string>>;
  setRideCatalogRideTypeFilter: Dispatch<SetStateAction<string>>;
  setRideCatalogSearchQuery: Dispatch<SetStateAction<string>>;
  setRideCatalogSort: Dispatch<SetStateAction<RidesCatalogSort>>;
  setRideCollectionId: Dispatch<SetStateAction<string>>;
  setRidesCatalogPage: Dispatch<SetStateAction<number>>;
}

export function RidesPage({
  copy,
  defaultCatalogPage,
  defaultRidesCatalogSort,
  displayedRideCatalogItems,
  getDisplayRideTypeFilterOptions,
  getRideCardMeta,
  goToNextRidesCatalogPage,
  goToPreviousRidesCatalogPage,
  hasActiveRideCollection,
  isRideFiltersOpen,
  locale,
  localizedRideEditorialBySlug,
  navigateToRide,
  navigateToRides,
  rideCatalogManufacturerFilter,
  rideCatalogParkFilter,
  rideCatalogRideTypeFilter,
  rideCatalogSearchQuery,
  rideCatalogSort,
  rideCollectionId,
  rideCollections,
  rideResultRangeLabel,
  riddenRideIds,
  ridesCatalogOptions,
  ridesCatalogPage,
  ridesCatalogPageInfo,
  ridesCatalogStatus,
  ridesCatalogTotalPages,
  selectedRideCollection,
  setIsRideFiltersOpen,
  setRideCatalogManufacturerFilter,
  setRideCatalogParkFilter,
  setRideCatalogRideTypeFilter,
  setRideCatalogSearchQuery,
  setRideCatalogSort,
  setRideCollectionId,
  setRidesCatalogPage,
  visibleRideCatalogCount
}: RidesPageProps) {
  const isDefaultRidesView =
    !rideCatalogSearchQuery.trim() &&
    !rideCatalogParkFilter &&
    !rideCatalogRideTypeFilter &&
    !rideCatalogManufacturerFilter &&
    !hasActiveRideCollection &&
    rideCatalogSort === defaultRidesCatalogSort &&
    ridesCatalogPage === defaultCatalogPage;
  const editorialRideSlugOrder = useMemo(
    () =>
      dedupeStrings([
        ...editorialFeaturedRideSlugs,
        ...rideCollections.flatMap((collection) => collection.itemSlugs),
        ...Object.keys(localizedRideEditorialBySlug)
      ]),
    [localizedRideEditorialBySlug, rideCollections]
  );
  const [editorialRideItems, setEditorialRideItems] = useState<RideCatalogItem[]>([]);

  useEffect(() => {
    if (!isDefaultRidesView || !apiBaseUrl) {
      setEditorialRideItems([]);
      return;
    }

    const controller = new AbortController();

    const loadEditorialRides = async () => {
      try {
        const ridesUrl = new URL("/rides", apiBaseUrl);
        ridesUrl.searchParams.set("sort", defaultRidesCatalogSort);
        ridesUrl.searchParams.set("limit", String(fullCatalogFetchLimit));
        ridesUrl.searchParams.set("offset", "0");

        const response = await fetch(ridesUrl, {
          signal: controller.signal
        });

        if (!response.ok) {
          setEditorialRideItems([]);
          return;
        }

        const payload = (await response.json()) as RideCatalogResponse;

        setEditorialRideItems(
          selectEditorialRideItems(
            payload.rides,
            editorialRideSlugOrder,
            localizedRideEditorialBySlug,
            8
          )
        );
      } catch {
        if (!controller.signal.aborted) {
          setEditorialRideItems([]);
        }
      }
    };

    void loadEditorialRides();

    return () => {
      controller.abort();
    };
  }, [
    defaultRidesCatalogSort,
    editorialRideSlugOrder,
    isDefaultRidesView,
    localizedRideEditorialBySlug
  ]);

  const renderRideCard = (
    entry: RideCatalogItem,
    variant: "editorial" | "catalog" = "catalog"
  ) => {
    const rideEditorial = localizedRideEditorialBySlug[entry.ride.slug];
    const isRidden = riddenRideIds?.has(entry.ride.id) === true;
    const rideMeta = getRideCardMeta(locale, entry.ride);
    const isHeadlineRide =
      rideEditorial?.cues.some(
        (cue) => cue === "Headliner" || cue === "Featured" || cue === "Iconic"
      ) ?? false;

    return (
      <button
        className={`ride-card ride-card-button${
          variant === "editorial" ? " ride-card-editorial ride-card-headline" : ""
        }${variant === "catalog" && !rideEditorial ? " ride-card-compact" : ""}${
          isHeadlineRide ? " ride-card-featured-signal" : ""
        }${isRidden ? " ride-card-ridden" : ""}`}
        key={`${variant}-${entry.park.slug}-${entry.ride.slug}`}
        type="button"
        onClick={() => {
          navigateToRide(entry.park.slug, entry.ride.slug, {
            origin: "rides"
          });
        }}
      >
        <MediaAsset
          kind="ride"
          slug={entry.ride.slug}
          imageUrl={entry.ride.imageUrl}
          alt={`${entry.ride.name} ride view`}
          frameClassName="media-frame media-frame-ride-card"
          imageClassName="media-image"
        />
        <div className="card-header">
          <div className="ride-card-heading">
            <p className="ride-card-kicker">{entry.park.name}</p>
            <div className="ride-link">
              <p className="ride-name">{entry.ride.name}</p>
            </div>
          </div>
        </div>
        {rideEditorial ? <p className="card-summary">{rideEditorial.summary}</p> : null}
        {rideMeta ? <p className="card-meta-line">{rideMeta}</p> : null}
        {entry.ride.status !== "operating" ? (
          <p className="card-support-line">
            {formatStatusLabel(locale, entry.ride.status)}
          </p>
        ) : null}
      </button>
    );
  };

  return (
        <section className="catalog-panel browse-panel" aria-live="polite">
          <div className="catalog-header">
            <div className="catalog-copy">
              <p className="status-label">{copy.browse.browse}</p>
              <h2 className="section-title">{copy.browse.ridesTitle}</h2>
            </div>
          </div>

          <div className="collection-strip" aria-label={copy.home.collectionsTitle}>
            {rideCollections.map((collection) => (
              <CuratedCollectionCard
                collection={collection}
                isActive={collection.id === rideCollectionId}
                key={collection.id}
                locale={locale}
                copy={copy}
                onOpen={() => {
                  navigateToRides({ preserveFilters: true, collectionId: collection.id });
                }}
              />
            ))}
          </div>

          <div className="toolbar-panel browse-toolbar browse-toolbar-stacked">
            <div className="browse-toolbar-main">
              <label className="search-label" htmlFor="ride-catalog-search">
                {copy.browse.searchRides}
              </label>
              <div className="hero-search-row">
                <input
                  id="ride-catalog-search"
                  className="search-input"
                  type="search"
                  name="ride-catalog-search"
                  value={rideCatalogSearchQuery}
                  onChange={(event) => {
                    setRideCatalogSearchQuery(event.target.value);
                    setRidesCatalogPage(defaultCatalogPage);
                  }}
                  placeholder={copy.browse.ridePlaceholder}
                />
                {rideCatalogSearchQuery ? (
                  <button
                    className="catalog-inline-button"
                    type="button"
                    onClick={() => {
                      setRideCatalogSearchQuery("");
                      setRidesCatalogPage(defaultCatalogPage);
                    }}
                  >
                    {copy.browse.clear}
                  </button>
                ) : null}
              </div>
            </div>

            <div className={`filter-disclosure${isRideFiltersOpen ? " filter-disclosure-open" : ""}`}>
              <button
                className="catalog-inline-button filter-summary"
                type="button"
                aria-expanded={isRideFiltersOpen}
                onClick={() => {
                  setIsRideFiltersOpen((isOpen: boolean) => !isOpen);
                }}
              >
                {locale === "es" ? "Filtros" : "Filters"}
              </button>
              <div className="ride-toolbar ride-toolbar-catalog">
              <div className="toolbar-field">
                <label className="search-label" htmlFor="ride-catalog-park">
                  {locale === "es" ? "Parque" : "Park"}
                </label>
                <select
                  id="ride-catalog-park"
                  className="toolbar-select"
                  value={rideCatalogParkFilter}
                  onChange={(event) => {
                    setRideCatalogParkFilter(event.target.value);
                    setRidesCatalogPage(defaultCatalogPage);
                  }}
                >
                  <option value="">{copy.browse.allParks}</option>
                  {ridesCatalogOptions.parks.map((park: Park) => (
                    <option key={park.slug} value={park.slug}>
                      {park.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="toolbar-field">
                <label className="search-label" htmlFor="ride-catalog-type">
                  {copy.browse.rideType}
                </label>
                <select
                  id="ride-catalog-type"
                  className="toolbar-select"
                  value={rideCatalogRideTypeFilter}
                  onChange={(event) => {
                    setRideCatalogRideTypeFilter(event.target.value);
                    setRidesCatalogPage(defaultCatalogPage);
                  }}
                >
                  <option value="">{copy.browse.allRideTypes}</option>
                  {getDisplayRideTypeFilterOptions(locale, ridesCatalogOptions.rideTypes).map(
                    ({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div className="toolbar-field">
                <label className="search-label" htmlFor="ride-catalog-manufacturer">
                  {copy.browse.manufacturer}
                </label>
                <select
                  id="ride-catalog-manufacturer"
                  className="toolbar-select"
                  value={rideCatalogManufacturerFilter}
                  onChange={(event) => {
                    setRideCatalogManufacturerFilter(event.target.value);
                    setRidesCatalogPage(defaultCatalogPage);
                  }}
                >
                  <option value="">{copy.browse.allManufacturers}</option>
                  {ridesCatalogOptions.manufacturers.map((manufacturer) => (
                    <option key={manufacturer} value={manufacturer}>
                      {manufacturer}
                    </option>
                  ))}
                </select>
              </div>
              <div className="toolbar-field">
                <label className="search-label" htmlFor="ride-catalog-sort">
                  {copy.browse.sortBy}
                </label>
                <select
                  id="ride-catalog-sort"
                  className="toolbar-select"
                  value={rideCatalogSort}
                  onChange={(event) => {
                    setRideCatalogSort(event.target.value as RidesCatalogSort);
                    setRidesCatalogPage(defaultCatalogPage);
                  }}
                >
                  <option value="name">{copy.browse.name}</option>
                  <option value="opening_year">{copy.browse.openingYear}</option>
                  <option value="speed_kmh">{copy.browse.topSpeed}</option>
                </select>
              </div>
              </div>
            </div>

            <div className="catalog-state-row" aria-label={copy.route.ridesBrowse}>
              <span className="catalog-chip">
                {ridesCatalogStatus.state === "success"
                  ? copy.browse.results(visibleRideCatalogCount)
                  : copy.browse.loadingResults}
              </span>
              {rideResultRangeLabel ? (
                <span className="catalog-chip route-chip">{rideResultRangeLabel}</span>
              ) : null}
              {selectedRideCollection ? (
                <span className="catalog-chip route-chip">{selectedRideCollection.title}</span>
              ) : null}
              {(rideCatalogSearchQuery.trim() ||
                rideCatalogParkFilter ||
                rideCatalogRideTypeFilter ||
                rideCatalogManufacturerFilter ||
                rideCatalogSort !== defaultRidesCatalogSort) ? (
                <button
                  className="catalog-inline-button"
                  type="button"
                  onClick={() => {
                    setRideCatalogSearchQuery("");
                    setRideCatalogParkFilter("");
                    setRideCatalogRideTypeFilter("");
                    setRideCatalogManufacturerFilter("");
                    setRideCatalogSort(defaultRidesCatalogSort);
                    setRidesCatalogPage(defaultCatalogPage);
                  }}
                >
                  {copy.browse.clearFilters}
                </button>
              ) : null}
              {hasActiveRideCollection ? (
                <button
                  className="catalog-inline-button"
                  type="button"
                  onClick={() => {
                    setRideCollectionId("");
                    setRidesCatalogPage(defaultCatalogPage);
                  }}
                >
                  {copy.browse.clearCollection}
                </button>
              ) : null}
            </div>
          </div>

          {ridesCatalogStatus.state === "loading" ? (
            <CatalogSkeletonGrid count={8} variant="ride" />
          ) : null}
          {ridesCatalogStatus.state === "success" ? (
            displayedRideCatalogItems.length > 0 ? (
              <>
                {isDefaultRidesView && editorialRideItems.length > 0 ? (
                  <section className="rides-editorial-section" aria-label={copy.browse.editorialRidesTitle}>
                    <div className="catalog-header landing-header">
                      <div className="catalog-copy">
                        <h3 className="section-title">{copy.browse.editorialRidesTitle}</h3>
                        <p className="section-copy">{copy.browse.editorialRidesSummary}</p>
                      </div>
                    </div>
                    <div className="rides-list rides-list-editorial">
                      {editorialRideItems.map((entry) => renderRideCard(entry, "editorial"))}
                    </div>
                  </section>
                ) : null}
                <div className="catalog-header landing-header rides-all-header">
                  <div className="catalog-copy">
                    <h3 className="section-title">{copy.browse.allRidesTitle}</h3>
                  </div>
                </div>
                <div className="rides-list rides-list-catalog">
                  {displayedRideCatalogItems.map((entry) => renderRideCard(entry))}
                </div>
                {ridesCatalogPageInfo && !selectedRideCollection && ridesCatalogTotalPages > 1 ? (
                  <div className="catalog-pagination-row">
                    <button
                      className="catalog-inline-button"
                      type="button"
                      onClick={goToPreviousRidesCatalogPage}
                      disabled={ridesCatalogPage <= defaultCatalogPage}
                    >
                      {copy.browse.previousPage}
                    </button>
                    <span className="catalog-pagination-label">
                      {copy.browse.page(ridesCatalogPage, ridesCatalogTotalPages)}
                    </span>
                    <button
                      className="catalog-inline-button"
                      type="button"
                      onClick={goToNextRidesCatalogPage}
                      disabled={!ridesCatalogPageInfo.hasMore}
                    >
                      {copy.browse.nextPage}
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="state-message state-message-empty">
                <p>
                  {selectedRideCollection
                    ? copy.browse.noRidesForCollection
                    : copy.browse.noRidesForView}
                </p>
                {!selectedRideCollection ? (
                  <p>{copy.browse.broadenRideSearch}</p>
                ) : null}
              </div>
            )
          ) : null}
          {ridesCatalogStatus.state === "error" ? (
            <div className="state-message state-message-error">
              <p>{copy.browse.unableLoadRides}</p>
              <p>{ridesCatalogStatus.message}</p>
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
