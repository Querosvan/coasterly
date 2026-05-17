import type {
  CommunityHighlightsResponse,
  UserStatsResponse,
  Park
} from "@coasterly/types";

import { CommunityHighlightCard } from "../components/shared/CommunityCards";
import { CuratedCollectionCard } from "../components/shared/CuratedCollectionCard";
import { MediaAsset } from "../components/shared/MediaAsset";
import type { Locale } from "../i18n";
import type {
  CommunityHighlightsStatus,
  CuratedCollection,
  EditorialNote,
  UiCopy
} from "../lib/types";

type ParkProgress = UserStatsResponse["parks"][number];

interface DiscoverPageProps {
  communityHighlights: CommunityHighlightsResponse["profiles"];
  communityHighlightsStatus: CommunityHighlightsStatus;
  copy: UiCopy;
  featuredParks: Park[];
  featuredProgressParks: Array<{ progress: ParkProgress; park: Park }>;
  locale: Locale;
  localizedCollections: readonly CuratedCollection[];
  localizedParkEditorialBySlug: Record<string, EditorialNote>;
  formatParkLocation: (park: Pick<Park, "country" | "city">) => string;
  getParkCardMetric: (
    copy: UiCopy,
    parkProgress?: Pick<ParkProgress, "riddenRides" | "totalRides">
  ) => { label: string; value: string } | null;
  navigateToPark: (slug: string) => void;
  navigateToParks: (options?: { preserveSearch?: boolean; collectionId?: string }) => void;
  navigateToPublicProfile: (userSlug: string) => void;
  navigateToRide: (parkSlug: string, rideSlug: string) => void;
  navigateToRides: (options?: { preserveFilters?: boolean; collectionId?: string }) => void;
}

export function DiscoverPage({
  communityHighlights,
  communityHighlightsStatus,
  copy,
  featuredParks,
  featuredProgressParks,
  formatParkLocation,
  getParkCardMetric,
  locale,
  localizedCollections,
  localizedParkEditorialBySlug,
  navigateToPark,
  navigateToParks,
  navigateToPublicProfile,
  navigateToRide,
  navigateToRides
}: DiscoverPageProps) {
  const recommendedParks =
    featuredProgressParks.length > 0
      ? featuredProgressParks.slice(0, 3)
      : featuredParks.slice(0, 3).map((park) => ({ park, progress: undefined }));
  const discoveryCollections = localizedCollections.slice(0, 4);
  const visibleCommunityHighlights = communityHighlights.slice(0, 2);

  return (
    <section className="catalog-panel browse-panel discover-minimal" aria-live="polite">
      <div className="catalog-header discover-hero">
        <div className="catalog-copy">
          <h2 className="section-title">{copy.discover.title}</h2>
          <p className="section-copy">{copy.discover.intro}</p>
        </div>
        <div className="landing-actions">
          <button
            className="primary-button primary-button-compact"
            type="button"
            onClick={() => {
              navigateToParks({ preserveSearch: true });
            }}
          >
            {copy.discover.browseParks}
          </button>
          <button
            className="catalog-inline-button"
            type="button"
            onClick={() => {
              navigateToRides({ preserveFilters: true });
            }}
          >
            {copy.discover.browseRides}
          </button>
        </div>
      </div>

      <section className="discover-section discover-section-open">
        <div className="catalog-header landing-header">
          <div className="catalog-copy">
            <h2 className="section-title">{copy.discover.collectionsTitle}</h2>
            <p className="section-copy">{copy.discover.collectionsSummary}</p>
          </div>
        </div>
        <div className="collection-grid collection-grid-minimal discover-collection-grid">
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
      </section>

      <section className="discover-section">
        <div className="catalog-header landing-header">
          <div className="catalog-copy">
            <h2 className="section-title">{copy.discover.featuredTitle}</h2>
            <p className="section-copy">{copy.discover.featuredSummary}</p>
          </div>
        </div>
        <div className="parks-list parks-list-featured parks-list-minimal">
          {recommendedParks.map(({ park, progress }) => {
            const parkEditorial = localizedParkEditorialBySlug[park.slug];
            const parkMetric = getParkCardMetric(copy, progress);

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
                {parkMetric ? (
                  <p className="card-key-stat card-key-stat-subtle">
                    <span className="card-stat-label">{parkMetric.label}</span>
                    <strong className="card-stat-value">{parkMetric.value}</strong>
                  </p>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      <section className="discover-section discover-section-muted">
        <div className="catalog-header landing-header">
          <div className="catalog-copy">
            <h2 className="section-title">{copy.discover.communityTitle}</h2>
          </div>
        </div>
        {communityHighlightsStatus.state === "loading" ? (
          <div className="state-message state-message-loading state-message-compact">
            <p>{copy.community.loadingActivity}</p>
          </div>
        ) : null}
        {communityHighlightsStatus.state === "success" ? (
          visibleCommunityHighlights.length > 0 ? (
            <div className="community-grid community-grid-compact">
              {visibleCommunityHighlights.map((profile) => (
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
              <p>{copy.discover.communityEmpty}</p>
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
