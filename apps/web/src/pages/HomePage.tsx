import type { UserStatsResponse, Park } from "@coasterly/types";

import { CuratedCollectionCard } from "../components/shared/CuratedCollectionCard";
import { MediaAsset } from "../components/shared/MediaAsset";
import type { Locale } from "../i18n";
import type { CuratedCollection, EditorialNote, UiCopy } from "../lib/types";

type ParkProgress = UserStatsResponse["parks"][number];

interface HomePageProps {
  copy: UiCopy;
  locale: Locale;
  isAuthenticated: boolean;
  spotlightPark: Park | undefined;
  spotlightParkEditorial: EditorialNote | undefined;
  secondaryFeaturedParks: Park[];
  landingFeaturedParks: Park[];
  landingCollections: readonly CuratedCollection[];
  localizedParkEditorialBySlug: Record<string, EditorialNote>;
  beginGoogleSignIn: (returnTo?: string) => void;
  formatParkLocation: (park: Pick<Park, "country" | "city">) => string;
  navigateToDiscover: () => void;
  navigateToPark: (slug: string) => void;
  navigateToParks: (options?: { preserveSearch?: boolean; collectionId?: string }) => void;
  navigateToProfile: () => void;
  navigateToRides: (options?: { preserveFilters?: boolean; collectionId?: string }) => void;
}

export function HomePage({
  beginGoogleSignIn,
  copy,
  formatParkLocation,
  isAuthenticated,
  landingCollections,
  landingFeaturedParks,
  locale,
  localizedParkEditorialBySlug,
  navigateToDiscover,
  navigateToPark,
  navigateToParks,
  navigateToProfile,
  navigateToRides,
  secondaryFeaturedParks,
  spotlightPark,
  spotlightParkEditorial
}: HomePageProps) {
  const featuredPreviewParks = landingFeaturedParks.slice(0, 2);
  const discoveryCollections = landingCollections.slice(0, 2);

  return (
    <>
      <section className="hero-panel hero-panel-landing">
        <div className="hero-copy hero-copy-landing">
          <h1>{copy.home.heroTitle}</h1>
          <p className="hero-text">{copy.home.heroText}</p>
          <div className="hero-actions hero-actions-minimal">
            <button
              className="primary-button"
              type="button"
              onClick={() => {
                navigateToParks({ preserveSearch: true });
              }}
            >
              {copy.home.browseParks}
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => {
                navigateToRides({ preserveFilters: true });
              }}
            >
              {copy.home.browseRides}
            </button>
            <button
              className="secondary-button"
              type="button"
              onClick={() => {
                if (isAuthenticated) {
                  navigateToProfile();
                  return;
                }

                beginGoogleSignIn();
              }}
            >
              {isAuthenticated ? copy.home.openProfile : copy.home.startTracking}
            </button>
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

      <section className="catalog-panel landing-panel landing-panel-minimal">
        <div className="catalog-header landing-header">
          <div className="catalog-copy">
            <h2 className="section-title">{copy.home.featuredTitle}</h2>
            <p className="section-copy">{copy.discover.featuredSummary}</p>
          </div>
          <div className="landing-actions">
            <button className="catalog-inline-button" type="button" onClick={navigateToDiscover}>
              {copy.home.seeMore}
            </button>
          </div>
        </div>

        <div className="home-discovery-grid">
          <div className="parks-list parks-list-featured parks-list-minimal">
            {featuredPreviewParks.map((park) => {
              const parkEditorial = localizedParkEditorialBySlug[park.slug];

              return (
                <button
                  className="park-card park-card-button park-card-minimal"
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
                  {parkEditorial ? <p className="card-summary">{parkEditorial.summary}</p> : null}
                </button>
              );
            })}
          </div>

          <div className="collection-grid collection-grid-minimal">
            {discoveryCollections.map((collection) => (
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
        </div>
      </section>
    </>
  );
}
