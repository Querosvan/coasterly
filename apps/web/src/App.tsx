import { useEffect, useState } from "react";

import type {
  CommunityHighlightsResponse,
  DailyChallengeAnswerRequest,
  DailyChallengeResponse,
  DemoUserStatsResponse,
  HealthResponse,
  Park,
  ParkLiveWaitsResponse,
  ParkResponse,
  ParksResponse,
  RideCatalogItem,
  RideCatalogResponse,
  RideSort,
  Ride,
  RideCreditMutationResponse,
  RideCreditsResponse,
  RideResponse,
  RidesResponse,
  UserProfileResponse,
  UserProgressionResponse
} from "@coasterly/types";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const brandLogoDark = "/brand/coasterly-logo-horizontal-dark.png";
const brandIconDark = "/brand/coasterly-logo-icon-dark.png";
const placeholderImageHost = "placehold.co";
const queueTimesAttributionLabel = "Powered by Queue-Times.com";
const queueTimesAttributionUrl = "https://queue-times.com/";

const journalTeasers = [
  {
    category: "Guide",
    title: "Europe park-planning notes",
    summary: "Trip planning, lineup context, and progress-ready park guides.",
    status: "Planned"
  },
  {
    category: "Ranking",
    title: "Coaster lists worth revisiting",
    summary: "Editorial rankings, route ideas, and park-by-park comparisons.",
    status: "Planned"
  },
  {
    category: "News",
    title: "Launches, retracks, and major openings",
    summary: "A future home for park news once editorial publishing is added.",
    status: "Planned"
  }
] as const;

const landingJournalTeasers = journalTeasers.slice(0, 1);

type DiscoveryCue = "Featured" | "Headliner" | "Iconic" | "Standout";

type EditorialNote = {
  summary: string;
  cues: DiscoveryCue[];
};

type CuratedCollection = {
  id: string;
  title: string;
  summary: string;
  kind: "park" | "ride";
  badge: string;
  itemSlugs: string[];
};

const parkEditorialBySlug: Record<string, EditorialNote> = {
  "europa-park": {
    summary:
      "A resort-scale park with polished themed lands and one of Europe's deepest all-day coaster lineups.",
    cues: ["Featured", "Standout"]
  },
  phantasialand: {
    summary:
      "Dense theming and terrain-driven coasters make this one of the sharpest park days in Europe.",
    cues: ["Headliner", "Standout"]
  },
  "alton-towers": {
    summary:
      "A British classic where major coasters thread through gardens, ruins, and a distinctly atmospheric setting.",
    cues: ["Iconic"]
  },
  "disneyland-park": {
    summary:
      "A castle park built on polished storytelling, broad appeal, and a few instantly recognizable coaster anchors.",
    cues: ["Featured", "Iconic"]
  },
  "parc-asterix": {
    summary:
      "A French thrill-forward park with a fast-rising coaster lineup and a strong steel headline identity.",
    cues: ["Standout"]
  },
  efteling: {
    summary:
      "Fantasy atmosphere, dark rides, and a selective coaster lineup give this catalog stop a very different pace.",
    cues: ["Iconic"]
  },
  "walibi-holland": {
    summary:
      "Compact and ride-led, with a modern thrill lineup that overdelivers for coaster-focused trips.",
    cues: ["Standout"]
  },
  "portaventura-park": {
    summary:
      "A large destination park known for skyline coasters, strong throughput, and broad resort appeal.",
    cues: ["Headliner"]
  },
  gardaland: {
    summary:
      "Italy's best-known park, mixing family pull with a small set of reliable headline coasters.",
    cues: ["Featured"]
  },
  energylandia: {
    summary:
      "A rapidly expanding ride-heavy park packed with major coasters and strong credit-count appeal.",
    cues: ["Headliner", "Standout"]
  },
  liseberg: {
    summary:
      "A city park with compact energy, strong atmosphere, and a surprisingly high-quality coaster mix.",
    cues: ["Iconic", "Standout"]
  }
};

const rideEditorialBySlug: Record<string, EditorialNote> = {
  "silver-star": {
    summary:
      "An open, high-speed hyper with sustained airtime and one of the biggest first drops in Europe.",
    cues: ["Headliner", "Iconic"]
  },
  "voltron-nevera": {
    summary:
      "A dense modern launch coaster built around rapid pacing, inversions, and forceful transitions.",
    cues: ["Featured", "Standout"]
  },
  taron: {
    summary:
      "Terrain-hugging launches and relentless direction changes make it a modern European benchmark.",
    cues: ["Iconic", "Standout"]
  },
  fly: {
    summary:
      "A flying coaster wrapped in heavy theming, designed to feel immersive rather than exposed.",
    cues: ["Featured"]
  },
  "nemesis-reborn": {
    summary:
      "An iconic inverted layout rebuilt around one of the most recognizable coaster names in Europe.",
    cues: ["Iconic"]
  },
  "wicker-man": {
    summary:
      "A character-led wooden coaster with approachable intensity and a memorable visual identity.",
    cues: ["Standout"]
  },
  "big-thunder-mountain": {
    summary:
      "A classic mine train built around scenery, pacing, and broad repeatability rather than raw stats.",
    cues: ["Iconic"]
  },
  "star-wars-hyperspace-mountain": {
    summary:
      "A compact indoor thrill ride that layers Disney spectacle onto a classic high-intensity layout.",
    cues: ["Featured"]
  },
  toutatis: {
    summary:
      "A recent Intamin built to deliver speed, hangtime, and sustained momentum from the first launch.",
    cues: ["Headliner"]
  },
  oziris: {
    summary:
      "A sweeping B&M invert with strong interaction, confident pacing, and broad re-ride appeal.",
    cues: ["Standout"]
  },
  "baron-1898": {
    summary:
      "A compact dive coaster with one dominant drop and a strong Efteling story wrapper.",
    cues: ["Featured"]
  },
  "joris-en-de-draak": {
    summary:
      "A twin-track wooden coaster that adds race energy to one of Efteling's most kinetic areas.",
    cues: ["Iconic"]
  },
  untamed: {
    summary:
      "An RMC hybrid known for quick-fire airtime moments and an aggressively modern pacing profile.",
    cues: ["Headliner"]
  },
  goliath: {
    summary:
      "A classic Intamin mega built around sustained speed and broad, open-air airtime.",
    cues: ["Iconic"]
  },
  shambhala: {
    summary:
      "A towering hyper coaster with huge scale, floating airtime, and one of Europe's signature skylines.",
    cues: ["Headliner", "Iconic"]
  },
  "dragon-khan": {
    summary:
      "A classic inversion machine that still defines PortAventura's skyline and thrill identity.",
    cues: ["Iconic"]
  },
  raptor: {
    summary:
      "A compact wing coaster that stays forceful by keeping the pacing tight and the interactions close.",
    cues: ["Standout"]
  },
  "oblivion-the-black-hole": {
    summary:
      "A dive machine built around one dramatic pause-and-drop sequence rather than a long layout.",
    cues: ["Featured"]
  },
  hyperion: {
    summary:
      "A giant hyper coaster known for scale, pace, and one of the fastest top speeds in the region.",
    cues: ["Headliner"]
  },
  zadra: {
    summary:
      "A large hybrid that combines towering scale with the quick-fire intensity RMC is known for.",
    cues: ["Headliner", "Standout"]
  },
  helix: {
    summary:
      "A launch coaster built for variety, blending launches, inversions, and hillside terrain.",
    cues: ["Standout"]
  },
  balder: {
    summary:
      "A wood coaster that stays relevant through clean pacing, strong airtime, and easy repeat rides.",
    cues: ["Iconic"]
  }
};

const curatedCollections: CuratedCollection[] = [
  {
    id: "first-time-europe-parks",
    title: "First-time Europe parks",
    summary:
      "Balanced first picks with recognizable coasters, strong atmosphere, and a full-day park rhythm.",
    kind: "park",
    badge: "Parks",
    itemSlugs: ["europa-park", "phantasialand", "portaventura-park", "efteling"]
  },
  {
    id: "parks-with-strong-lineups",
    title: "Parks with strong lineups",
    summary:
      "Dense coaster depth for days where the lineup matters more than a single headline ride.",
    kind: "park",
    badge: "Parks",
    itemSlugs: ["europa-park", "energylandia", "walibi-holland", "phantasialand"]
  },
  {
    id: "best-launches",
    title: "Best launches",
    summary:
      "Fast acceleration, terrain interaction, and momentum-heavy layouts for riders who chase pacing.",
    kind: "ride",
    badge: "Rides",
    itemSlugs: ["taron", "voltron-nevera", "toutatis", "helix"]
  },
  {
    id: "iconic-hypers",
    title: "Iconic hypers",
    summary:
      "Big-airtime headliners that define skylines and still anchor European coaster trip planning.",
    kind: "ride",
    badge: "Rides",
    itemSlugs: ["silver-star", "shambhala", "hyperion"]
  },
  {
    id: "standout-inverts-and-flyers",
    title: "Standout inverts and flyers",
    summary:
      "Suspended or floorless-feeling layouts where interaction and presentation matter as much as stats.",
    kind: "ride",
    badge: "Rides",
    itemSlugs: ["fly", "nemesis-reborn", "oziris", "raptor"]
  }
] as const;

const parkCollections = curatedCollections.filter(
  (collection): collection is CuratedCollection & { kind: "park" } =>
    collection.kind === "park"
);

const rideCollections = curatedCollections.filter(
  (collection): collection is CuratedCollection & { kind: "ride" } =>
    collection.kind === "ride"
);

const landingCollections = [
  curatedCollections.find((collection) => collection.id === "first-time-europe-parks"),
  curatedCollections.find((collection) => collection.id === "best-launches"),
  curatedCollections.find((collection) => collection.id === "parks-with-strong-lineups")
].filter((collection): collection is CuratedCollection => Boolean(collection));

const formatCountLabel = (
  count: number,
  singular: string,
  plural = `${singular}s`
) => `${count} ${count === 1 ? singular : plural}`;

const formatDecimalValue = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

const formatLiveWaitLabel = (
  ride: ParkLiveWaitsResponse["rides"][number]
) => {
  if (ride.isOpen === false) {
    return "Closed";
  }

  if (typeof ride.waitTimeMinutes === "number") {
    return `${ride.waitTimeMinutes} min`;
  }

  if (ride.isOpen === true) {
    return "Open";
  }

  return "No update";
};

const formatSourceTimeLabel = (value?: string) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
};

type Route =
  | { view: "home" }
  | { view: "parks" }
  | { view: "rides" }
  | { view: "discover" }
  | { view: "profile" }
  | { view: "user-profile"; slug: string }
  | { view: "journal" }
  | { view: "park"; slug: string }
  | { view: "ride"; parkSlug: string; rideSlug: string };

type ApiStatus =
  | { state: "loading" }
  | { state: "success"; response: HealthResponse }
  | { state: "error"; message: string };

type ParksStatus =
  | { state: "loading" }
  | { state: "success"; parks: Park[] }
  | { state: "error"; message: string };

type ParkDetailStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "success"; park: Park; queueTimes?: ParkResponse["queueTimes"] }
  | { state: "error"; message: string };

type ParkRidesStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "success"; rides: Ride[] }
  | { state: "error"; message: string };

type RidesCatalogStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "success"; rides: RideCatalogItem[] }
  | { state: "error"; message: string };

type ParkLiveWaitsStatus =
  | { state: "idle" }
  | { state: "loading" }
  | {
      state: "success";
      source: ParkLiveWaitsResponse["source"];
      rides: ParkLiveWaitsResponse["rides"];
    }
  | { state: "error"; message: string };

type ParkRideSort = RideSort;
type RidesCatalogSort = RideSort;

type ParkRideOptions = {
  rideTypes: string[];
  manufacturers: string[];
};

type RidesCatalogOptions = ParkRideOptions & {
  parks: Park[];
};

type RideDetailOrigin = "park" | "rides";

type RideCreditsStatus =
  | { state: "loading" }
  | { state: "success"; rideIds: number[]; userName: string }
  | { state: "error"; message: string };

type DemoUserStatsStatus =
  | { state: "loading" }
  | {
      state: "success";
      userName: string;
      totalRiddenRides: number;
      totalParksWithRiddenRides: number;
      parks: DemoUserStatsResponse["parks"];
    }
  | { state: "error"; message: string };

type UserProgressionStatus =
  | { state: "loading" }
  | {
      state: "success";
      userName: string;
      badges: UserProgressionResponse["badges"];
      activeMissions: UserProgressionResponse["activeMissions"];
    }
  | { state: "error"; message: string };

type UserProfileStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "success"; profile: UserProfileResponse }
  | { state: "error"; message: string };

type CommunityHighlightsStatus =
  | { state: "loading" }
  | { state: "success"; profiles: CommunityHighlightsResponse["profiles"] }
  | { state: "error"; message: string };

type DailyChallengeStatus =
  | { state: "loading" }
  | { state: "success"; response: DailyChallengeResponse }
  | { state: "error"; message: string };

type RideDetailStatus =
  | { state: "idle" }
  | { state: "loading" }
  | {
      state: "success";
      park: Park;
      ride: Ride;
      parkQueueTimes?: RideResponse["parkQueueTimes"];
      rideQueueTimes?: RideResponse["rideQueueTimes"];
    }
  | { state: "error"; message: string };

type RideLineupStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "success"; rides: Ride[] }
  | { state: "error"; message: string };

type RideSpecItem = {
  label: string;
  value: string;
  wide?: true;
  code?: true;
};

type BreadcrumbItem = {
  label: string;
  href?: string;
  onClick?: () => void;
};

type MediaKind = "park" | "ride";
type ExternalInsightLink = {
  label: string;
  href: string;
};

type MediaAssetProps = {
  kind: MediaKind;
  slug: string;
  imageUrl?: string | undefined;
  alt: string;
  frameClassName: string;
  imageClassName: string;
  loading?: "eager" | "lazy";
};

const defaultParkRideSort: ParkRideSort = "name";
const defaultRidesCatalogSort: RidesCatalogSort = "name";

const isParkRideSort = (value: string | null): value is ParkRideSort =>
  value === "name" || value === "opening_year" || value === "speed_kmh";

const isRidesCatalogSort = (value: string | null): value is RidesCatalogSort =>
  value === "name" || value === "opening_year" || value === "speed_kmh";

const getSearchQueryFromUrl = (search: string) => {
  const value = new URLSearchParams(search).get("search")?.trim();

  return value ?? "";
};

const getRideBrowserStateFromUrl = (search: string) => {
  const params = new URLSearchParams(search);
  const rideType = params.get("rideType")?.trim() ?? "";
  const manufacturer = params.get("manufacturer")?.trim() ?? "";
  const sort = params.get("sort");

  return {
    rideType,
    manufacturer,
    sort: isParkRideSort(sort) ? sort : defaultParkRideSort
  };
};

const getRidesCatalogStateFromUrl = (search: string) => {
  const params = new URLSearchParams(search);
  const searchQuery = params.get("search")?.trim() ?? "";
  const park = params.get("park")?.trim() ?? "";
  const rideType = params.get("rideType")?.trim() ?? "";
  const manufacturer = params.get("manufacturer")?.trim() ?? "";
  const sort = params.get("sort");

  return {
    searchQuery,
    park,
    rideType,
    manufacturer,
    sort: isRidesCatalogSort(sort) ? sort : defaultRidesCatalogSort
  };
};

const getCollectionIdFromUrl = (search: string) =>
  new URLSearchParams(search).get("collection")?.trim() ?? "";

const getRideDetailOriginFromUrl = (search: string): RideDetailOrigin =>
  new URLSearchParams(search).get("origin") === "rides" ? "rides" : "park";

const buildPathWithQuery = (pathname: string, params: URLSearchParams) => {
  const query = params.toString();

  return query ? `${pathname}?${query}` : pathname;
};

const isPlaceholderImageUrl = (value?: string) => value?.includes(placeholderImageHost) ?? false;

const getLocalMediaPath = (kind: MediaKind, slug: string) =>
  kind === "park"
    ? `/media/parks/${slug}/cover.png`
    : `/media/rides/${slug}/cover.png`;

const getMediaSources = (kind: MediaKind, slug: string, imageUrl?: string) => {
  const localMediaPath = getLocalMediaPath(kind, slug);

  if (imageUrl && !isPlaceholderImageUrl(imageUrl)) {
    return [imageUrl, localMediaPath];
  }

  if (imageUrl) {
    return [localMediaPath, imageUrl];
  }

  return [localMediaPath];
};

const dedupeExternalLinks = (links: ExternalInsightLink[]) => {
  const seen = new Set<string>();

  return links.filter((link) => {
    const key = `${link.label}|${link.href}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);

    return true;
  });
};

const getRoute = (pathname: string): Route => {
  const rideMatch = pathname.match(/^\/parks\/([^/]+)\/rides\/([^/]+)\/?$/);

  if (rideMatch?.[1] && rideMatch[2]) {
    return {
      view: "ride",
      parkSlug: decodeURIComponent(rideMatch[1]),
      rideSlug: decodeURIComponent(rideMatch[2])
    };
  }

  if (pathname === "/parks" || pathname === "/parks/") {
    return { view: "parks" };
  }

  if (pathname === "/rides" || pathname === "/rides/") {
    return { view: "rides" };
  }

  const parkMatch = pathname.match(/^\/parks\/([^/]+)\/?$/);

  if (parkMatch?.[1]) {
    return {
      view: "park",
      slug: decodeURIComponent(parkMatch[1])
    };
  }

  if (pathname === "/discover" || pathname === "/discover/") {
    return { view: "discover" };
  }

  if (pathname === "/profile" || pathname === "/profile/") {
    return { view: "profile" };
  }

  const userProfileMatch = pathname.match(/^\/users\/([^/]+)\/?$/);

  if (userProfileMatch?.[1]) {
    return {
      view: "user-profile",
      slug: decodeURIComponent(userProfileMatch[1])
    };
  }

  if (pathname === "/journal" || pathname === "/journal/") {
    return { view: "journal" };
  }

  return { view: "home" };
};

const renderBreadcrumbs = (items: BreadcrumbItem[]) => (
  <nav className="breadcrumbs" aria-label="Breadcrumb">
    <ol className="breadcrumb-list">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <li className="breadcrumb-item" key={`${item.label}-${index}`}>
            {item.href && item.onClick && !isLast ? (
              <a
                className="breadcrumb-link"
                href={item.href}
                onClick={(event) => {
                  event.preventDefault();
                  item.onClick?.();
                }}
              >
                {item.label}
              </a>
            ) : (
              <span
                className={`breadcrumb-current${isLast ? " breadcrumb-current-active" : ""}`}
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
            {!isLast ? <span className="breadcrumb-separator">/</span> : null}
          </li>
        );
      })}
    </ol>
  </nav>
);

function MediaAsset({
  kind,
  slug,
  imageUrl,
  alt,
  frameClassName,
  imageClassName,
  loading = "lazy"
}: MediaAssetProps) {
  const sources = getMediaSources(kind, slug, imageUrl);
  const sourceKey = sources.join("|");
  const [activeSourceIndex, setActiveSourceIndex] = useState(0);

  useEffect(() => {
    setActiveSourceIndex(0);
  }, [sourceKey]);

  const activeSource = sources[activeSourceIndex];

  return (
    <div className={`${frameClassName}${activeSource ? "" : " media-frame-fallback"}`}>
      {activeSource ? (
        <img
          className={imageClassName}
          src={activeSource}
          alt={alt}
          loading={loading}
          onError={() => {
            setActiveSourceIndex((currentIndex) => currentIndex + 1);
          }}
        />
      ) : (
        <div className="media-fallback" aria-hidden="true">
          <img className="media-fallback-mark" src={brandIconDark} alt="" />
        </div>
      )}
    </div>
  );
}

function QueueTimesExternalLinks({ links }: { links: ExternalInsightLink[] }) {
  if (links.length === 0) {
    return null;
  }

  return (
    <div className="queue-times-links">
      {links.map((link) => (
        <a
          className="catalog-inline-button catalog-inline-link"
          href={link.href}
          key={`${link.label}-${link.href}`}
          target="_blank"
          rel="noreferrer"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}

function QueueTimesAttribution() {
  return (
    <p className="source-note">
      Source:{" "}
      <a href={queueTimesAttributionUrl} target="_blank" rel="noreferrer">
        {queueTimesAttributionLabel}
      </a>
    </p>
  );
}

function ProgressionPanel({
  userProgressionStatus
}: {
  userProgressionStatus: UserProgressionStatus;
}) {
  if (userProgressionStatus.state === "loading") {
    return (
      <div className="state-message state-message-loading">
        <p>Loading missions...</p>
      </div>
    );
  }

  if (userProgressionStatus.state === "error") {
    return (
      <div className="state-message state-message-error">
        <p>Unable to load missions.</p>
        <p>{userProgressionStatus.message}</p>
      </div>
    );
  }

  return (
    <div className="progression-panel">
      <div className="progression-section">
        <div className="section-row section-row-compact">
          <div>
            <p className="status-label">Active missions</p>
          </div>
          <span className="catalog-chip">
            {formatCountLabel(userProgressionStatus.activeMissions.length, "mission")}
          </span>
        </div>
        <div className="mission-grid">
          {userProgressionStatus.activeMissions.map((mission) => (
            <article className="mission-card" key={mission.id}>
              <div className="mission-copy">
                <strong className="mission-title">{mission.title}</strong>
                <p className="card-summary">{mission.summary}</p>
              </div>
              <div className="mission-progress-row">
                <span className="progress-label">{mission.progressLabel}</span>
                <strong className="mission-progress-value">
                  {mission.completionPercentage}%
                </strong>
              </div>
              <div className="progress-rail" aria-hidden="true">
                <span
                  className="progress-fill"
                  style={{ width: `${mission.completionPercentage}%` }}
                />
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="progression-section">
        <div className="section-row section-row-compact">
          <div>
            <p className="status-label">Recent badges</p>
          </div>
          <span className="catalog-chip catalog-chip-ridden">
            {formatCountLabel(userProgressionStatus.badges.length, "badge")}
          </span>
        </div>
        <div className="badge-grid">
          {userProgressionStatus.badges.length > 0 ? (
            userProgressionStatus.badges.slice(0, 4).map((badge) => (
              <article className={`badge-card badge-card-${badge.tone}`} key={badge.id}>
                <div className="badge-copy">
                  <strong className="mission-title">{badge.title}</strong>
                  <p className="card-summary">{badge.summary}</p>
                </div>
                <span className="badge-earned-at">
                  Earned {new Date(badge.earnedAt).toLocaleDateString()}
                </span>
              </article>
            ))
          ) : (
            <div className="state-message state-message-empty state-message-compact">
              <p>Badges will appear as you log more rides.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProfileSurface({
  profile,
  isCurrentUser,
  onOpenPark,
  onOpenRide,
  onOpenPublicProfile,
  onCopyPublicProfile
}: {
  profile: UserProfileResponse;
  isCurrentUser: boolean;
  onOpenPark: (parkSlug: string) => void;
  onOpenRide: (parkSlug: string, rideSlug: string) => void;
  onOpenPublicProfile?: (userSlug: string) => void;
  onCopyPublicProfile?: (userSlug: string) => void;
}) {
  const showProfileActions =
    isCurrentUser && (onOpenPublicProfile !== undefined || onCopyPublicProfile !== undefined);

  return (
    <div className="profile-layout">
      <section className="profile-hero">
        <div className="profile-hero-copy">
          <h3 className="section-title">{profile.user.name}</h3>
          <div className="profile-identity-strip" aria-label="Profile level and streak">
            <span className="ride-fact-pill ride-fact-pill-accent">{`Level ${profile.identity.level}`}</span>
            <span className="ride-fact-pill">{`${profile.identity.totalXp} XP`}</span>
            <span className="ride-fact-pill">{`${profile.identity.currentStreak} day streak`}</span>
            <span className="ride-fact-pill">{`${profile.identity.completedDays} challenges played`}</span>
          </div>
        </div>
        {showProfileActions ? (
          <div className="detail-chip-row">
            {isCurrentUser && onOpenPublicProfile ? (
              <button
                className="catalog-inline-button"
                type="button"
                onClick={() => {
                  onOpenPublicProfile(profile.user.slug);
                }}
              >
                View public page
              </button>
            ) : null}
            {isCurrentUser && onCopyPublicProfile ? (
              <button
                className="catalog-inline-button"
                type="button"
                onClick={() => {
                  onCopyPublicProfile(profile.user.slug);
                }}
              >
                Copy link
              </button>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="stats-panel" aria-label="Profile stats">
        <div className="stats-grid">
          <article className="stats-card">
            <span className="stats-card-label">Ridden rides</span>
            <strong className="stats-card-value">{profile.totalRiddenRides}</strong>
          </article>
          <article className="stats-card">
            <span className="stats-card-label">Parks ridden</span>
            <strong className="stats-card-value">{profile.totalParksWithRiddenRides}</strong>
          </article>
        </div>
        <div className="stats-breakdown">
          {profile.parks.slice(0, 4).map((park) => (
            <button
              className="stats-park-card"
              key={park.parkId}
              type="button"
              onClick={() => {
                onOpenPark(park.parkSlug);
              }}
            >
              <span className="stats-park-name">{park.parkName}</span>
              <span className="stats-park-value">
                {`${park.riddenRides}/${park.totalRides} ridden`}
              </span>
              <div className="progress-rail" aria-hidden="true">
                <span
                  className="progress-fill"
                  style={{ width: `${park.completionPercentage}%` }}
                />
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="stats-panel" aria-label="Profile progression">
        <ProgressionPanel
          userProgressionStatus={{
            state: "success",
            userName: profile.user.name,
            badges: profile.badges,
            activeMissions: profile.activeMissions
          }}
        />
      </section>

      <section className="catalog-panel nested-panel">
        <div className="catalog-header landing-header">
          <div className="catalog-copy">
            <p className="status-label">Recent activity</p>
            <h2 className="section-title">Latest credits</h2>
          </div>
        </div>
        {profile.recentActivity.length > 0 ? (
          <div className="activity-list">
            {profile.recentActivity.map((entry) => (
              <article className="activity-card" key={`${entry.rideId}-${entry.riddenAt}`}>
                <div className="activity-copy">
                  <strong className="mission-title">{entry.rideName}</strong>
                  <p className="card-summary">{entry.parkName}</p>
                </div>
                <div className="activity-meta">
                  <span className="badge-earned-at">
                    {new Date(entry.riddenAt).toLocaleDateString()}
                  </span>
                  <button
                    className="catalog-inline-button"
                    type="button"
                    onClick={() => {
                      onOpenRide(entry.parkSlug, entry.rideSlug);
                    }}
                  >
                    Open ride
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="state-message state-message-empty">
            <p>Recent ride credits will appear here.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function CommunityHighlightCard({
  profile,
  onOpenProfile,
  onOpenPark,
  onOpenRide
}: {
  profile: CommunityHighlightsResponse["profiles"][number];
  onOpenProfile: (userSlug: string) => void;
  onOpenPark: (parkSlug: string) => void;
  onOpenRide: (parkSlug: string, rideSlug: string) => void;
}) {
  return (
    <article className="community-card">
      <div className="community-card-header">
        <div className="community-card-copy">
          <button
            className="community-profile-link"
            type="button"
            onClick={() => {
              onOpenProfile(profile.user.slug);
            }}
          >
            {profile.user.name}
          </button>
        </div>
        <div className="detail-chip-row">
          {profile.featuredPark ? (
            <button
              className="catalog-chip route-chip"
              type="button"
              onClick={() => {
                onOpenPark(profile.featuredPark!.parkSlug);
              }}
            >
              {`${profile.featuredPark.completionPercentage}% at ${profile.featuredPark.parkName}`}
            </button>
          ) : null}
        </div>
      </div>

      <div className="community-card-stats">
        <span className="ride-fact-pill ride-fact-pill-accent">
          {`Level ${profile.identity.level}`}
        </span>
        <span className="ride-fact-pill">{`${profile.identity.currentStreak} day streak`}</span>
        <span className="ride-fact-pill">
          {formatCountLabel(profile.totalRiddenRides, "ridden ride")}
        </span>
        <span className="ride-fact-pill">
          {formatCountLabel(profile.totalParksWithRiddenRides, "park")}
        </span>
        {profile.badges.map((badge) => (
          <span className="ride-fact-pill ride-fact-pill-accent" key={badge.id}>
            {badge.title}
          </span>
        ))}
      </div>

      {profile.recentActivity.length > 0 ? (
        <div className="community-activity-list">
          {profile.recentActivity.map((entry) => (
            <button
              className="community-activity-item"
              key={`${entry.rideId}-${entry.riddenAt}`}
              type="button"
              onClick={() => {
                onOpenRide(entry.parkSlug, entry.rideSlug);
              }}
            >
              <span className="community-activity-ride">{entry.rideName}</span>
              <span className="community-activity-meta">
                {entry.parkName} / {new Date(entry.riddenAt).toLocaleDateString()}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="state-message state-message-empty state-message-compact">
          <p>No recent ride activity yet.</p>
        </div>
      )}
    </article>
  );
}

function CommunityRankingCard({
  title,
  summary,
  profiles,
  onOpenProfile
}: {
  title: string;
  summary: string;
  profiles: CommunityHighlightsResponse["profiles"];
  onOpenProfile: (userSlug: string) => void;
}) {
  return (
    <article className="community-ranking-card">
      <div className="community-ranking-copy">
        <p className="status-label">Ranking</p>
        <h3>{title}</h3>
        <p>{summary}</p>
      </div>
      <div className="community-ranking-list">
        {profiles.map((profile, index) => (
          <button
            className="community-ranking-item"
            key={profile.user.id}
            type="button"
            onClick={() => {
              onOpenProfile(profile.user.slug);
            }}
          >
            <span className="community-ranking-position">{index + 1}</span>
            <div className="community-ranking-item-copy">
              <strong>{profile.user.name}</strong>
              <span>
                {title === "Highest level"
                  ? `Level ${profile.identity.level} / ${profile.identity.totalXp} XP`
                  : title === "Longest streak"
                    ? `${profile.identity.currentStreak} day streak`
                    : profile.recentActivity[0]
                      ? `${profile.recentActivity[0].rideName} / ${profile.recentActivity[0].parkName}`
                      : `${profile.totalRiddenRides} ridden`}
              </span>
            </div>
          </button>
        ))}
      </div>
    </article>
  );
}

function DailyChallengePanel({
  dailyChallengeStatus,
  isSubmitting,
  isClaimingReward,
  onAnswer,
  onClaimReward,
  onOpenRide
}: {
  dailyChallengeStatus: DailyChallengeStatus;
  isSubmitting: boolean;
  isClaimingReward: boolean;
  onAnswer: (optionId: string) => void;
  onClaimReward: () => void;
  onOpenRide: (parkSlug: string, rideSlug: string) => void;
}) {
  if (dailyChallengeStatus.state === "loading") {
    return (
      <section className="stats-panel" aria-label="Daily challenge">
        <div className="state-message state-message-loading">
          <p>Loading daily challenge...</p>
        </div>
      </section>
    );
  }

  if (dailyChallengeStatus.state === "error") {
    return (
      <section className="stats-panel" aria-label="Daily challenge">
        <div className="state-message state-message-error">
          <p>Unable to load the daily challenge.</p>
          <p>{dailyChallengeStatus.message}</p>
        </div>
      </section>
    );
  }

  const { response } = dailyChallengeStatus;
  const { challenge, summary, attempt, reward } = response;
  const canClaimReward = reward.claimedAt === undefined;
  const resultTone = attempt?.isCorrect
    ? "state-message-success"
    : attempt
      ? "state-message-empty"
      : "state-message-loading";

  return (
    <section className="stats-panel daily-challenge-panel" aria-label="Daily challenge">
      <div className="section-row">
        <div>
          <p className="status-label">Today</p>
          <h2 className="section-title">Daily challenge</h2>
        </div>
        <div className="detail-chip-row">
          <span className="catalog-chip">{`Level ${summary.level}`}</span>
          <span className="catalog-chip catalog-chip-ridden">{`${summary.totalXp} XP`}</span>
          <span className="catalog-chip route-chip">{`${summary.currentStreak} day streak`}</span>
          <button
            className={`catalog-inline-button${canClaimReward ? " catalog-inline-button-accent" : ""}`}
            type="button"
            disabled={!canClaimReward || isClaimingReward}
            onClick={onClaimReward}
          >
            {canClaimReward
              ? isClaimingReward
                ? "Claiming..."
                : `Claim ${reward.availableXp} XP`
              : `Reward claimed${reward.claimedXp ? ` / ${reward.claimedXp} XP` : ""}`}
          </button>
        </div>
      </div>

      <div className="daily-challenge-layout">
        <div className="daily-challenge-media-column">
          <MediaAsset
            kind="ride"
            slug={challenge.ride.slug}
            imageUrl={challenge.ride.imageUrl}
            alt={`${challenge.ride.name} ride view`}
            frameClassName="media-frame media-frame-ride-card"
            imageClassName="media-image"
          />
          <button
            className="catalog-inline-button"
            type="button"
            onClick={() => {
              onOpenRide(challenge.ride.parkSlug, challenge.ride.slug);
            }}
          >
            Open ride
          </button>
        </div>

        <div className="daily-challenge-copy">
          <p className="status-label">{challenge.title}</p>
          <h3 className="section-title">{challenge.prompt}</h3>

          <div className={`state-message state-message-compact daily-challenge-feedback ${resultTone}`}>
            <p>
              {attempt
                ? attempt.isCorrect
                  ? `Correct. +${attempt.earnedXp} XP from the challenge.`
                  : `Answer locked. +${attempt.earnedXp} XP from the challenge.`
                : "Answer once today, then claim the reward."}
            </p>
            <p>
              {canClaimReward
                ? `Daily reward available: ${reward.availableXp} XP.`
                : `Daily reward claimed${reward.claimedAt ? ` on ${new Date(reward.claimedAt).toLocaleDateString()}` : ""}.`}
            </p>
          </div>

          <div className="daily-challenge-options">
            {challenge.options.map((option) => {
              const isSelected = attempt?.selectedOptionId === option.id;
              const isCorrect = attempt?.correctOptionId === option.id;

              return (
                <button
                  key={option.id}
                  className={`daily-challenge-option${
                    isSelected ? " daily-challenge-option-selected" : ""
                  }${isCorrect ? " daily-challenge-option-correct" : ""}`}
                  type="button"
                  disabled={Boolean(attempt) || isSubmitting || isClaimingReward}
                  onClick={() => {
                    onAnswer(option.id);
                  }}
                >
                  <span>{option.label}</span>
                  {attempt ? (
                    <span className="daily-challenge-option-meta">
                      {isCorrect ? "Answer" : isSelected ? "Your pick" : ""}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <p className="catalog-note">{`${summary.completedDays} challenges completed.`}</p>
        </div>
      </div>
    </section>
  );
}

type CuratedCollectionCardProps = {
  collection: CuratedCollection;
  isActive?: boolean;
  onOpen: () => void;
};

function CuratedCollectionCard({
  collection,
  isActive = false,
  onOpen
}: CuratedCollectionCardProps) {
  return (
    <button
      className={`collection-card${isActive ? " collection-card-active" : ""}`}
      type="button"
      onClick={onOpen}
    >
      <div className="collection-card-header">
        <span className="editorial-tag">{collection.badge}</span>
        {isActive ? (
          <span className="catalog-chip catalog-chip-ridden">Viewing now</span>
        ) : null}
      </div>
      <div className="collection-card-copy">
        <h3>{collection.title}</h3>
        <p>{collection.summary}</p>
      </div>
      <span className="collection-card-meta">
        {`${formatCountLabel(collection.itemSlugs.length, collection.kind)} inside this collection`}
      </span>
    </button>
  );
}

function CatalogSkeletonGrid({
  count,
  variant
}: {
  count: number;
  variant: "park" | "ride";
}) {
  return (
    <div
      className={`catalog-skeleton-grid ${
        variant === "ride" ? "rides-list-catalog" : "parks-list"
      }`}
      aria-label={`${variant === "ride" ? "Rides" : "Parks"} loading`}
      aria-busy="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <article className="catalog-skeleton-card" key={`${variant}-skeleton-${index}`}>
          <div className="skeleton-block skeleton-media" />
          <div className="skeleton-row skeleton-row-title" />
          <div className="skeleton-row skeleton-row-short" />
          <div className="skeleton-row" />
          <div className="skeleton-row skeleton-row-medium" />
          <div className="skeleton-chip-row">
            <span className="skeleton-chip" />
            <span className="skeleton-chip" />
          </div>
        </article>
      ))}
    </div>
  );
}

function App() {
  const [route, setRoute] = useState<Route>(() => getRoute(window.location.pathname));
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isRideFiltersOpen, setIsRideFiltersOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState<ApiStatus>({ state: "loading" });
  const [searchQuery, setSearchQuery] = useState(() =>
    getSearchQueryFromUrl(window.location.search)
  );
  const [parkCollectionId, setParkCollectionId] = useState(() =>
    getCollectionIdFromUrl(window.location.search)
  );
  const [rideCatalogSearchQuery, setRideCatalogSearchQuery] = useState(() =>
    getRidesCatalogStateFromUrl(window.location.search).searchQuery
  );
  const [parksStatus, setParksStatus] = useState<ParksStatus>({
    state: "loading"
  });
  const [ridesCatalogStatus, setRidesCatalogStatus] = useState<RidesCatalogStatus>({
    state: "idle"
  });
  const [parkDetailStatus, setParkDetailStatus] = useState<ParkDetailStatus>({
    state: "idle"
  });
  const [parkLiveWaitsStatus, setParkLiveWaitsStatus] =
    useState<ParkLiveWaitsStatus>({
      state: "idle"
    });
  const [parkRidesStatus, setParkRidesStatus] = useState<ParkRidesStatus>({
    state: "idle"
  });
  const [parkRideOptions, setParkRideOptions] = useState<ParkRideOptions>({
    rideTypes: [],
    manufacturers: []
  });
  const [ridesCatalogOptions, setRidesCatalogOptions] = useState<RidesCatalogOptions>({
    parks: [],
    rideTypes: [],
    manufacturers: []
  });
  const [rideTypeFilter, setRideTypeFilter] = useState(
    () => getRideBrowserStateFromUrl(window.location.search).rideType
  );
  const [manufacturerFilter, setManufacturerFilter] = useState(
    () => getRideBrowserStateFromUrl(window.location.search).manufacturer
  );
  const [parkRideSort, setParkRideSort] = useState<ParkRideSort>(
    () => getRideBrowserStateFromUrl(window.location.search).sort
  );
  const [rideCatalogParkFilter, setRideCatalogParkFilter] = useState(
    () => getRidesCatalogStateFromUrl(window.location.search).park
  );
  const [rideCatalogRideTypeFilter, setRideCatalogRideTypeFilter] = useState(
    () => getRidesCatalogStateFromUrl(window.location.search).rideType
  );
  const [rideCatalogManufacturerFilter, setRideCatalogManufacturerFilter] = useState(
    () => getRidesCatalogStateFromUrl(window.location.search).manufacturer
  );
  const [rideCatalogSort, setRideCatalogSort] = useState<RidesCatalogSort>(
    () => getRidesCatalogStateFromUrl(window.location.search).sort
  );
  const [rideCollectionId, setRideCollectionId] = useState(() =>
    getCollectionIdFromUrl(window.location.search)
  );
  const [rideDetailOrigin, setRideDetailOrigin] = useState<RideDetailOrigin>(() =>
    getRideDetailOriginFromUrl(window.location.search)
  );
  const [rideCreditsStatus, setRideCreditsStatus] = useState<RideCreditsStatus>({
    state: "loading"
  });
  const [demoUserStatsStatus, setDemoUserStatsStatus] = useState<DemoUserStatsStatus>({
    state: "loading"
  });
  const [userProgressionStatus, setUserProgressionStatus] = useState<UserProgressionStatus>({
    state: "loading"
  });
  const [userProfileStatus, setUserProfileStatus] = useState<UserProfileStatus>({
    state: "idle"
  });
  const [communityHighlightsStatus, setCommunityHighlightsStatus] =
    useState<CommunityHighlightsStatus>({
      state: "loading"
    });
  const [dailyChallengeStatus, setDailyChallengeStatus] = useState<DailyChallengeStatus>({
    state: "loading"
  });
  const [rideDetailStatus, setRideDetailStatus] = useState<RideDetailStatus>({
    state: "idle"
  });
  const [rideLineupStatus, setRideLineupStatus] = useState<RideLineupStatus>({
    state: "idle"
  });
  const [isUpdatingRideCredit, setIsUpdatingRideCredit] = useState(false);
  const [isSubmittingDailyChallenge, setIsSubmittingDailyChallenge] = useState(false);
  const [isClaimingDailyReward, setIsClaimingDailyReward] = useState(false);
  const [rideCreditMessage, setRideCreditMessage] = useState<string | null>(null);
  const [profileShareMessage, setProfileShareMessage] = useState<string | null>(null);

  const loadDemoUserStats = async (signal?: AbortSignal) => {
    if (!apiBaseUrl) {
      setDemoUserStatsStatus({
        state: "error",
        message: "VITE_API_BASE_URL is not configured."
      });

      return;
    }

    setDemoUserStatsStatus({ state: "loading" });

    try {
      const response = await fetch(new URL("/demo-user/stats", apiBaseUrl), {
        ...(signal ? { signal } : {})
      });

      if (!response.ok) {
        setDemoUserStatsStatus({
          state: "error",
          message: `Demo user stats request failed with status ${response.status}.`
        });

        return;
      }

      const payload = (await response.json()) as DemoUserStatsResponse;

      setDemoUserStatsStatus({
        state: "success",
        userName: payload.user.name,
        totalRiddenRides: payload.totalRiddenRides,
        totalParksWithRiddenRides: payload.totalParksWithRiddenRides,
        parks: payload.parks
      });
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      setDemoUserStatsStatus({
        state: "error",
        message:
          error instanceof Error
            ? error.message
            : "The demo user stats request failed."
      });
    }
  };

  const loadUserProgression = async (signal?: AbortSignal) => {
    if (!apiBaseUrl) {
      setUserProgressionStatus({
        state: "error",
        message: "VITE_API_BASE_URL is not configured."
      });

      return;
    }

    setUserProgressionStatus({ state: "loading" });

    try {
      const response = await fetch(new URL("/me/progression", apiBaseUrl), {
        ...(signal ? { signal } : {})
      });

      if (!response.ok) {
        setUserProgressionStatus({
          state: "error",
          message: `Progression request failed with status ${response.status}.`
        });

        return;
      }

      const payload = (await response.json()) as UserProgressionResponse;

      setUserProgressionStatus({
        state: "success",
        userName: payload.user.name,
        badges: payload.badges,
        activeMissions: payload.activeMissions
      });
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      setUserProgressionStatus({
        state: "error",
        message:
          error instanceof Error
            ? error.message
            : "The progression request failed."
      });
    }
  };

  const loadUserProfile = async (signal?: AbortSignal) => {
    if (!apiBaseUrl) {
      setUserProfileStatus({
        state: "error",
        message: "VITE_API_BASE_URL is not configured."
      });

      return;
    }

    setUserProfileStatus({ state: "loading" });

    try {
      const response = await fetch(new URL("/me/profile", apiBaseUrl), {
        ...(signal ? { signal } : {})
      });

      if (!response.ok) {
        setUserProfileStatus({
          state: "error",
          message: `Profile request failed with status ${response.status}.`
        });

        return;
      }

      const payload = (await response.json()) as UserProfileResponse;

      setUserProfileStatus({
        state: "success",
        profile: payload
      });
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      setUserProfileStatus({
        state: "error",
        message:
          error instanceof Error ? error.message : "The profile request failed."
      });
    }
  };

  const loadCommunityHighlights = async (signal?: AbortSignal) => {
    if (!apiBaseUrl) {
      setCommunityHighlightsStatus({
        state: "error",
        message: "VITE_API_BASE_URL is not configured."
      });

      return;
    }

    setCommunityHighlightsStatus({ state: "loading" });

    try {
      const response = await fetch(new URL("/community/highlights", apiBaseUrl), {
        ...(signal ? { signal } : {})
      });

      if (!response.ok) {
        setCommunityHighlightsStatus({
          state: "error",
          message: `Community request failed with status ${response.status}.`
        });

        return;
      }

      const payload = (await response.json()) as CommunityHighlightsResponse;

      setCommunityHighlightsStatus({
        state: "success",
        profiles: payload.profiles
      });
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      setCommunityHighlightsStatus({
        state: "error",
        message:
          error instanceof Error ? error.message : "The community request failed."
      });
    }
  };

  const loadDailyChallenge = async (signal?: AbortSignal) => {
    if (!apiBaseUrl) {
      setDailyChallengeStatus({
        state: "error",
        message: "VITE_API_BASE_URL is not configured."
      });

      return;
    }

    setDailyChallengeStatus({ state: "loading" });

    try {
      const response = await fetch(new URL("/me/daily-challenge", apiBaseUrl), {
        ...(signal ? { signal } : {})
      });

      if (!response.ok) {
        setDailyChallengeStatus({
          state: "error",
          message: `Daily challenge request failed with status ${response.status}.`
        });

        return;
      }

      const payload = (await response.json()) as DailyChallengeResponse;

      setDailyChallengeStatus({
        state: "success",
        response: payload
      });
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      setDailyChallengeStatus({
        state: "error",
        message:
          error instanceof Error
            ? error.message
            : "The daily challenge request failed."
      });
    }
  };

  const loadPublicUserProfile = async (userSlug: string, signal?: AbortSignal) => {
    if (!apiBaseUrl) {
      setUserProfileStatus({
        state: "error",
        message: "VITE_API_BASE_URL is not configured."
      });

      return;
    }

    setUserProfileStatus({ state: "loading" });

    try {
      const response = await fetch(new URL(`/users/${userSlug}/profile`, apiBaseUrl), {
        ...(signal ? { signal } : {})
      });

      if (response.status === 404) {
        setUserProfileStatus({
          state: "error",
          message: "User not found."
        });

        return;
      }

      if (!response.ok) {
        setUserProfileStatus({
          state: "error",
          message: `Profile request failed with status ${response.status}.`
        });

        return;
      }

      const payload = (await response.json()) as UserProfileResponse;

      setUserProfileStatus({
        state: "success",
        profile: payload
      });
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      setUserProfileStatus({
        state: "error",
        message:
          error instanceof Error ? error.message : "The profile request failed."
      });
    }
  };

  useEffect(() => {
    const syncRoute = () => {
      setRoute(getRoute(window.location.pathname));
      setIsMobileNavOpen(false);
      setIsRideFiltersOpen(false);
      setSearchQuery(getSearchQueryFromUrl(window.location.search));
      setParkCollectionId(getCollectionIdFromUrl(window.location.search));
      setRideCatalogSearchQuery(
        getRidesCatalogStateFromUrl(window.location.search).searchQuery
      );

      const rideBrowserState = getRideBrowserStateFromUrl(window.location.search);
      const ridesCatalogState = getRidesCatalogStateFromUrl(window.location.search);

      setRideTypeFilter(rideBrowserState.rideType);
      setManufacturerFilter(rideBrowserState.manufacturer);
      setParkRideSort(rideBrowserState.sort);
      setRideCatalogParkFilter(ridesCatalogState.park);
      setRideCatalogRideTypeFilter(ridesCatalogState.rideType);
      setRideCatalogManufacturerFilter(ridesCatalogState.manufacturer);
      setRideCatalogSort(ridesCatalogState.sort);
      setRideCollectionId(getCollectionIdFromUrl(window.location.search));
      setRideDetailOrigin(getRideDetailOriginFromUrl(window.location.search));
    };

    window.addEventListener("popstate", syncRoute);

    return () => {
      window.removeEventListener("popstate", syncRoute);
    };
  }, []);

  useEffect(() => {
    if (!apiBaseUrl) {
      setApiStatus({
        state: "error",
        message: "VITE_API_BASE_URL is not configured."
      });

      return;
    }

    const controller = new AbortController();

    const loadHealth = async () => {
      try {
        const response = await fetch(new URL("/health", apiBaseUrl), {
          signal: controller.signal
        });

        if (!response.ok) {
          setApiStatus({
            state: "error",
            message: `Health check failed with status ${response.status}.`
          });

          return;
        }

        const payload = (await response.json()) as HealthResponse;

        setApiStatus({
          state: "success",
          response: payload
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setApiStatus({
          state: "error",
          message:
            error instanceof Error
              ? error.message
              : "The API health check failed."
        });
      }
    };

    void loadHealth();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!apiBaseUrl) {
      setRideCreditsStatus({
        state: "error",
        message: "VITE_API_BASE_URL is not configured."
      });

      return;
    }

    const controller = new AbortController();

    const loadRideCredits = async () => {
      try {
        const response = await fetch(
          new URL("/demo-user/ride-credits", apiBaseUrl),
          { signal: controller.signal }
        );

        if (!response.ok) {
          setRideCreditsStatus({
            state: "error",
            message: `Ride credits request failed with status ${response.status}.`
          });

          return;
        }

        const payload = (await response.json()) as RideCreditsResponse;

        setRideCreditsStatus({
          state: "success",
          rideIds: payload.rideIds,
          userName: payload.user.name
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setRideCreditsStatus({
          state: "error",
          message:
            error instanceof Error
              ? error.message
              : "The ride credits request failed."
        });
      }
    };

    void loadRideCredits();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void loadDemoUserStats(controller.signal);
    void loadUserProgression(controller.signal);
    void loadCommunityHighlights(controller.signal);
    void loadDailyChallenge(controller.signal);

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (route.view !== "profile" && route.view !== "user-profile") {
      setUserProfileStatus({ state: "idle" });
      setProfileShareMessage(null);

      return;
    }

    const controller = new AbortController();

    if (route.view === "profile") {
      void loadUserProfile(controller.signal);
    } else {
      void loadPublicUserProfile(route.slug, controller.signal);
    }

    return () => {
      controller.abort();
    };
  }, [route]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (route.view === "parks") {
      const normalizedQuery = searchQuery.trim();

      if (normalizedQuery) {
        params.set("search", normalizedQuery);
      }

      if (parkCollectionId) {
        params.set("collection", parkCollectionId);
      }
    }

    if (route.view === "rides") {
      const normalizedQuery = rideCatalogSearchQuery.trim();

      if (normalizedQuery) {
        params.set("search", normalizedQuery);
      }

      if (rideCatalogParkFilter) {
        params.set("park", rideCatalogParkFilter);
      }

      if (rideCatalogRideTypeFilter) {
        params.set("rideType", rideCatalogRideTypeFilter);
      }

      if (rideCatalogManufacturerFilter) {
        params.set("manufacturer", rideCatalogManufacturerFilter);
      }

      params.set("sort", rideCatalogSort);

      if (rideCollectionId) {
        params.set("collection", rideCollectionId);
      }
    }

    if (route.view === "park" || route.view === "ride") {
      if (rideTypeFilter) {
        params.set("rideType", rideTypeFilter);
      }

      if (manufacturerFilter) {
        params.set("manufacturer", manufacturerFilter);
      }

      params.set("sort", parkRideSort);

      if (route.view === "ride" && rideDetailOrigin === "rides") {
        const normalizedCatalogQuery = rideCatalogSearchQuery.trim();

        params.set("origin", "rides");

        if (normalizedCatalogQuery) {
          params.set("search", normalizedCatalogQuery);
        }

        if (rideCatalogParkFilter) {
          params.set("park", rideCatalogParkFilter);
        }

        if (rideCollectionId) {
          params.set("collection", rideCollectionId);
        }
      }
    }

    const nextLocation = buildPathWithQuery(window.location.pathname, params);
    const currentLocation = `${window.location.pathname}${window.location.search}`;

    if (nextLocation !== currentLocation) {
      window.history.replaceState({}, "", nextLocation);
    }
  }, [
    route,
    searchQuery,
    parkCollectionId,
    rideCatalogSearchQuery,
    rideCatalogParkFilter,
    rideCatalogRideTypeFilter,
    rideCatalogManufacturerFilter,
    rideCatalogSort,
    rideCollectionId,
    rideTypeFilter,
    manufacturerFilter,
    parkRideSort,
    rideDetailOrigin
  ]);

  useEffect(() => {
    if (!apiBaseUrl) {
      setParksStatus({
        state: "error",
        message: "VITE_API_BASE_URL is not configured."
      });

      return;
    }

    const controller = new AbortController();
    const activeSearchQuery = route.view === "parks" ? searchQuery.trim() : "";

    setParksStatus({ state: "loading" });

    const timeoutId = window.setTimeout(() => {
      const loadParks = async () => {
        try {
          const parksUrl = new URL("/parks", apiBaseUrl);

          if (activeSearchQuery) {
            parksUrl.searchParams.set("search", activeSearchQuery);
          }

          const response = await fetch(parksUrl, {
            signal: controller.signal
          });

          if (!response.ok) {
            setParksStatus({
              state: "error",
              message: `Parks request failed with status ${response.status}.`
            });

            return;
          }

          const payload = (await response.json()) as ParksResponse;

          setParksStatus({
            state: "success",
            parks: payload.parks
          });
        } catch (error) {
          if (controller.signal.aborted) {
            return;
          }

          setParksStatus({
            state: "error",
            message:
              error instanceof Error
                ? error.message
                : "The parks request failed."
          });
        }
      };

      void loadParks();
    }, activeSearchQuery ? 250 : 0);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [route, searchQuery]);

  useEffect(() => {
    if (route.view !== "rides") {
      setRidesCatalogOptions({
        parks: [],
        rideTypes: [],
        manufacturers: []
      });

      return;
    }

    if (!apiBaseUrl) {
      return;
    }

    const controller = new AbortController();

    const loadRidesCatalogOptions = async () => {
      try {
        const ridesUrl = new URL("/rides", apiBaseUrl);

        ridesUrl.searchParams.set("sort", defaultRidesCatalogSort);

        const response = await fetch(ridesUrl, {
          signal: controller.signal
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as RideCatalogResponse;
        const rideTypes = Array.from(
          new Set(payload.rides.map((entry) => entry.ride.rideType))
        ).sort((left, right) => left.localeCompare(right));
        const manufacturers = Array.from(
          new Set(
            payload.rides
              .map((entry) => entry.ride.manufacturer)
              .filter((manufacturer): manufacturer is string => Boolean(manufacturer))
          )
        ).sort((left, right) => left.localeCompare(right));
        const parks = Array.from(
          new Map(payload.rides.map((entry) => [entry.park.slug, entry.park])).values()
        ).sort((left, right) => left.name.localeCompare(right.name));

        setRidesCatalogOptions({
          parks,
          rideTypes,
          manufacturers
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
      }
    };

    void loadRidesCatalogOptions();

    return () => {
      controller.abort();
    };
  }, [route, apiBaseUrl]);

  useEffect(() => {
    if (route.view !== "rides") {
      setRidesCatalogStatus({ state: "idle" });

      return;
    }

    if (!apiBaseUrl) {
      setRidesCatalogStatus({
        state: "error",
        message: "VITE_API_BASE_URL is not configured."
      });

      return;
    }

    const controller = new AbortController();
    const activeSearchQuery = rideCatalogSearchQuery.trim();

    setRidesCatalogStatus({ state: "loading" });

    const timeoutId = window.setTimeout(() => {
      const loadRidesCatalog = async () => {
        try {
          const ridesUrl = new URL("/rides", apiBaseUrl);

          if (activeSearchQuery) {
            ridesUrl.searchParams.set("search", activeSearchQuery);
          }

          if (rideCatalogParkFilter) {
            ridesUrl.searchParams.set("park", rideCatalogParkFilter);
          }

          if (rideCatalogRideTypeFilter) {
            ridesUrl.searchParams.set("rideType", rideCatalogRideTypeFilter);
          }

          if (rideCatalogManufacturerFilter) {
            ridesUrl.searchParams.set("manufacturer", rideCatalogManufacturerFilter);
          }

          ridesUrl.searchParams.set("sort", rideCatalogSort);

          const response = await fetch(ridesUrl, {
            signal: controller.signal
          });

          if (!response.ok) {
            setRidesCatalogStatus({
              state: "error",
              message: `Rides request failed with status ${response.status}.`
            });

            return;
          }

          const payload = (await response.json()) as RideCatalogResponse;

          setRidesCatalogStatus({
            state: "success",
            rides: payload.rides
          });
        } catch (error) {
          if (controller.signal.aborted) {
            return;
          }

          setRidesCatalogStatus({
            state: "error",
            message:
              error instanceof Error
                ? error.message
                : "The rides request failed."
          });
        }
      };

      void loadRidesCatalog();
    }, activeSearchQuery ? 250 : 0);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [
    route,
    rideCatalogSearchQuery,
    rideCatalogParkFilter,
    rideCatalogRideTypeFilter,
    rideCatalogManufacturerFilter,
    rideCatalogSort
  ]);

  useEffect(() => {
    if (route.view !== "park") {
      setParkDetailStatus({ state: "idle" });

      return;
    }

    if (!apiBaseUrl) {
      setParkDetailStatus({
        state: "error",
        message: "VITE_API_BASE_URL is not configured."
      });

      return;
    }

    const controller = new AbortController();

    const loadPark = async () => {
      setParkDetailStatus({ state: "loading" });

      try {
        const response = await fetch(
          new URL(`/parks/${route.slug}`, apiBaseUrl),
          { signal: controller.signal }
        );

        if (response.status === 404) {
          setParkDetailStatus({
            state: "error",
            message: "Park not found."
          });

          return;
        }

        if (!response.ok) {
          setParkDetailStatus({
            state: "error",
            message: `Park request failed with status ${response.status}.`
          });

          return;
        }

        const payload = (await response.json()) as ParkResponse;

        setParkDetailStatus({
          state: "success",
          park: payload.park,
          ...(payload.queueTimes ? { queueTimes: payload.queueTimes } : {})
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setParkDetailStatus({
          state: "error",
          message:
            error instanceof Error
              ? error.message
              : "The park request failed."
        });
      }
    };

    void loadPark();

    return () => {
      controller.abort();
    };
  }, [route]);

  useEffect(() => {
    const liveWaitParkSlug =
      route.view === "park"
        ? route.slug
        : route.view === "ride"
          ? route.parkSlug
          : null;

    if (!liveWaitParkSlug) {
      setParkLiveWaitsStatus({ state: "idle" });

      return;
    }

    if (!apiBaseUrl) {
      setParkLiveWaitsStatus({
        state: "error",
        message: "VITE_API_BASE_URL is not configured."
      });

      return;
    }

    const controller = new AbortController();

    const loadParkLiveWaits = async () => {
      setParkLiveWaitsStatus({ state: "loading" });

      try {
        const response = await fetch(
          new URL(`/parks/${liveWaitParkSlug}/live-waits`, apiBaseUrl),
          { signal: controller.signal }
        );

        if (response.status === 404) {
          setParkLiveWaitsStatus({
            state: "error",
            message: "Park not found."
          });

          return;
        }

        if (!response.ok) {
          setParkLiveWaitsStatus({
            state: "error",
            message: `Live waits request failed with status ${response.status}.`
          });

          return;
        }

        const payload = (await response.json()) as ParkLiveWaitsResponse;

        setParkLiveWaitsStatus({
          state: "success",
          source: payload.source,
          rides: payload.rides
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setParkLiveWaitsStatus({
          state: "error",
          message:
            error instanceof Error
              ? error.message
              : "The live waits request failed."
        });
      }
    };

    void loadParkLiveWaits();

    return () => {
      controller.abort();
    };
  }, [route]);

  useEffect(() => {
    if (route.view !== "park") {
      setParkRideOptions({
        rideTypes: [],
        manufacturers: []
      });

      return;
    }

    if (!apiBaseUrl) {
      return;
    }

    const controller = new AbortController();

    const loadRideOptions = async () => {
      try {
        const ridesUrl = new URL(`/parks/${route.slug}/rides`, apiBaseUrl);

        ridesUrl.searchParams.set("sort", defaultParkRideSort);

        const response = await fetch(ridesUrl, { signal: controller.signal });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as RidesResponse;
        const rideTypes = Array.from(
          new Set(payload.rides.map((ride) => ride.rideType))
        );
        rideTypes.sort((left, right) => left.localeCompare(right));

        const manufacturers = Array.from(
          new Set(
            payload.rides
              .map((ride) => ride.manufacturer)
              .filter((manufacturer): manufacturer is string => Boolean(manufacturer))
          )
        );
        manufacturers.sort((left, right) => left.localeCompare(right));

        setParkRideOptions({
          rideTypes,
          manufacturers
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
      }
    };

    void loadRideOptions();

    return () => {
      controller.abort();
    };
  }, [route, apiBaseUrl]);

  useEffect(() => {
    if (route.view !== "park") {
      setParkRidesStatus({ state: "idle" });

      return;
    }

    if (!apiBaseUrl) {
      setParkRidesStatus({
        state: "error",
        message: "VITE_API_BASE_URL is not configured."
      });

      return;
    }

    const controller = new AbortController();

    const loadRides = async () => {
      setParkRidesStatus({ state: "loading" });

      try {
        const ridesUrl = new URL(`/parks/${route.slug}/rides`, apiBaseUrl);

        if (rideTypeFilter) {
          ridesUrl.searchParams.set("rideType", rideTypeFilter);
        }

        if (manufacturerFilter) {
          ridesUrl.searchParams.set("manufacturer", manufacturerFilter);
        }

        ridesUrl.searchParams.set("sort", parkRideSort);

        const response = await fetch(ridesUrl, { signal: controller.signal });

        if (response.status === 404) {
          setParkRidesStatus({
            state: "error",
            message: "Park not found."
          });

          return;
        }

        if (!response.ok) {
          setParkRidesStatus({
            state: "error",
            message: `Rides request failed with status ${response.status}.`
          });

          return;
        }

        const payload = (await response.json()) as RidesResponse;

        setParkRidesStatus({
          state: "success",
          rides: payload.rides
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setParkRidesStatus({
          state: "error",
          message:
            error instanceof Error
              ? error.message
              : "The rides request failed."
        });
      }
    };

    void loadRides();

    return () => {
      controller.abort();
    };
  }, [route, rideTypeFilter, manufacturerFilter, parkRideSort]);

  useEffect(() => {
    if (route.view !== "ride") {
      setRideLineupStatus({ state: "idle" });

      return;
    }

    if (!apiBaseUrl) {
      setRideLineupStatus({
        state: "error",
        message: "VITE_API_BASE_URL is not configured."
      });

      return;
    }

    const controller = new AbortController();

    const loadRideLineup = async () => {
      setRideLineupStatus({ state: "loading" });

      try {
        const ridesUrl = new URL(`/parks/${route.parkSlug}/rides`, apiBaseUrl);

        if (rideTypeFilter) {
          ridesUrl.searchParams.set("rideType", rideTypeFilter);
        }

        if (manufacturerFilter) {
          ridesUrl.searchParams.set("manufacturer", manufacturerFilter);
        }

        ridesUrl.searchParams.set("sort", parkRideSort);

        const response = await fetch(ridesUrl, { signal: controller.signal });

        if (response.status === 404) {
          setRideLineupStatus({
            state: "error",
            message: "Park not found."
          });

          return;
        }

        if (!response.ok) {
          setRideLineupStatus({
            state: "error",
            message: `Ride lineup request failed with status ${response.status}.`
          });

          return;
        }

        const payload = (await response.json()) as RidesResponse;

        setRideLineupStatus({
          state: "success",
          rides: payload.rides
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setRideLineupStatus({
          state: "error",
          message:
            error instanceof Error
              ? error.message
              : "The ride lineup request failed."
        });
      }
    };

    void loadRideLineup();

    return () => {
      controller.abort();
    };
  }, [route, rideTypeFilter, manufacturerFilter, parkRideSort]);

  useEffect(() => {
    if (route.view !== "ride") {
      setRideDetailStatus({ state: "idle" });

      return;
    }

    if (!apiBaseUrl) {
      setRideDetailStatus({
        state: "error",
        message: "VITE_API_BASE_URL is not configured."
      });

      return;
    }

    const controller = new AbortController();

    const loadRide = async () => {
      setRideDetailStatus({ state: "loading" });

      try {
        const response = await fetch(
          new URL(`/parks/${route.parkSlug}/rides/${route.rideSlug}`, apiBaseUrl),
          { signal: controller.signal }
        );

        if (response.status === 404) {
          setRideDetailStatus({
            state: "error",
            message: "Ride not found."
          });

          return;
        }

        if (!response.ok) {
          setRideDetailStatus({
            state: "error",
            message: `Ride request failed with status ${response.status}.`
          });

          return;
        }

        const payload = (await response.json()) as RideResponse;

        setRideDetailStatus({
          state: "success",
          park: payload.park,
          ride: payload.ride,
          ...(payload.parkQueueTimes
            ? { parkQueueTimes: payload.parkQueueTimes }
            : {}),
          ...(payload.rideQueueTimes
            ? { rideQueueTimes: payload.rideQueueTimes }
            : {})
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setRideDetailStatus({
          state: "error",
          message:
            error instanceof Error
              ? error.message
              : "The ride request failed."
        });
      }
    };

    void loadRide();

    return () => {
      controller.abort();
    };
  }, [route]);

  const getCatalogSearchParams = () => {
    const params = new URLSearchParams();

    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    }

    if (parkCollectionId) {
      params.set("collection", parkCollectionId);
    }

    return params;
  };

  const getRidesCatalogParams = () => {
    const params = new URLSearchParams();

    if (rideCatalogSearchQuery.trim()) {
      params.set("search", rideCatalogSearchQuery.trim());
    }

    if (rideCatalogParkFilter) {
      params.set("park", rideCatalogParkFilter);
    }

    if (rideCatalogRideTypeFilter) {
      params.set("rideType", rideCatalogRideTypeFilter);
    }

    if (rideCatalogManufacturerFilter) {
      params.set("manufacturer", rideCatalogManufacturerFilter);
    }

    params.set("sort", rideCatalogSort);

    if (rideCollectionId) {
      params.set("collection", rideCollectionId);
    }

    return params;
  };

  const getRideBrowserParams = () => {
    const params = new URLSearchParams();

    if (rideTypeFilter) {
      params.set("rideType", rideTypeFilter);
    }

    if (manufacturerFilter) {
      params.set("manufacturer", manufacturerFilter);
    }

    params.set("sort", parkRideSort);

    return params;
  };

  const navigateWithParams = (pathname: string, params: URLSearchParams) => {
    const nextLocation = buildPathWithQuery(pathname, params);
    const currentLocation = `${window.location.pathname}${window.location.search}`;

    if (currentLocation !== nextLocation) {
      window.history.pushState({}, "", nextLocation);
      setRoute(getRoute(pathname));
    }
  };

  const navigateHome = () => {
    navigateWithParams("/", new URLSearchParams());
  };

  const navigateToParks = (options?: { preserveSearch?: boolean; collectionId?: string }) => {
    if (!options?.preserveSearch) {
      setSearchQuery("");
    }

    const nextCollectionId =
      options && "collectionId" in options ? options.collectionId ?? "" : parkCollectionId;

    setParkCollectionId(nextCollectionId);

    navigateWithParams(
      "/parks",
      options?.preserveSearch || nextCollectionId
        ? (() => {
            const params = new URLSearchParams();

            if (options?.preserveSearch && searchQuery.trim()) {
              params.set("search", searchQuery.trim());
            }

            if (nextCollectionId) {
              params.set("collection", nextCollectionId);
            }

            return params;
          })()
        : new URLSearchParams()
    );
  };

  const navigateToRides = (options?: { preserveFilters?: boolean; collectionId?: string }) => {
    if (!options?.preserveFilters) {
      setRideCatalogSearchQuery("");
      setRideCatalogParkFilter("");
      setRideCatalogRideTypeFilter("");
      setRideCatalogManufacturerFilter("");
      setRideCatalogSort(defaultRidesCatalogSort);
    }

    const nextCollectionId =
      options && "collectionId" in options ? options.collectionId ?? "" : rideCollectionId;

    setRideCollectionId(nextCollectionId);

    navigateWithParams(
      "/rides",
      options?.preserveFilters || nextCollectionId
        ? (() => {
            const params = options?.preserveFilters
              ? getRidesCatalogParams()
              : new URLSearchParams();

            if (nextCollectionId) {
              params.set("collection", nextCollectionId);
            } else if (!options?.preserveFilters) {
              params.delete("collection");
            }

            return params;
          })()
        : new URLSearchParams()
    );
  };

  const navigateToDiscover = () => {
    navigateWithParams("/discover", new URLSearchParams());
  };

  const navigateToProfile = () => {
    navigateWithParams("/profile", new URLSearchParams());
  };

  const navigateToPublicProfile = (userSlug: string) => {
    navigateWithParams(`/users/${userSlug}`, new URLSearchParams());
  };

  const copyPublicProfileLink = async (userSlug: string) => {
    const profileUrl = `${window.location.origin}/users/${userSlug}`;

    try {
      await navigator.clipboard.writeText(profileUrl);
      setProfileShareMessage("Public profile link copied.");
    } catch {
      setProfileShareMessage(profileUrl);
    }
  };

  const submitDailyChallengeAnswer = async (optionId: string) => {
    if (!apiBaseUrl || dailyChallengeStatus.state !== "success") {
      return;
    }

    setIsSubmittingDailyChallenge(true);

    try {
      const response = await fetch(new URL("/me/daily-challenge/answer", apiBaseUrl), {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          optionId
        } satisfies DailyChallengeAnswerRequest)
      });

      if (!response.ok) {
        setDailyChallengeStatus({
          state: "error",
          message: `Daily challenge answer failed with status ${response.status}.`
        });

        return;
      }

      const payload = (await response.json()) as DailyChallengeResponse;

      setDailyChallengeStatus({
        state: "success",
        response: payload
      });
    } catch (error) {
      setDailyChallengeStatus({
        state: "error",
        message:
          error instanceof Error
            ? error.message
            : "The daily challenge answer failed."
      });
    } finally {
      setIsSubmittingDailyChallenge(false);
    }
  };

  const claimDailyReward = async () => {
    if (!apiBaseUrl || dailyChallengeStatus.state !== "success") {
      return;
    }

    setIsClaimingDailyReward(true);

    try {
      const response = await fetch(new URL("/me/daily-challenge/reward", apiBaseUrl), {
        method: "POST"
      });

      if (!response.ok) {
        setDailyChallengeStatus({
          state: "error",
          message: `Daily reward claim failed with status ${response.status}.`
        });

        return;
      }

      const payload = (await response.json()) as DailyChallengeResponse;

      setDailyChallengeStatus({
        state: "success",
        response: payload
      });
    } catch (error) {
      setDailyChallengeStatus({
        state: "error",
        message:
          error instanceof Error ? error.message : "The daily reward claim failed."
      });
    } finally {
      setIsClaimingDailyReward(false);
    }
  };

  const navigateToJournal = () => {
    navigateWithParams("/journal", new URLSearchParams());
  };

  const navigateToPark = (
    slug: string,
    options?: { preserveRideBrowserState?: boolean }
  ) => {
    if (!options?.preserveRideBrowserState) {
      setRideTypeFilter("");
      setManufacturerFilter("");
      setParkRideSort(defaultParkRideSort);
    }

    navigateWithParams(
      `/parks/${slug}`,
      options?.preserveRideBrowserState ? getRideBrowserParams() : new URLSearchParams()
    );
  };

  const navigateToRide = (
    parkSlug: string,
    rideSlug: string,
    options?: { origin?: RideDetailOrigin }
  ) => {
    const origin = options?.origin ?? "park";

    setRideDetailOrigin(origin);

    if (origin === "rides") {
      setRideTypeFilter(rideCatalogRideTypeFilter);
      setManufacturerFilter(rideCatalogManufacturerFilter);
      setParkRideSort(rideCatalogSort);
    }

    const params =
      origin === "rides"
        ? (() => {
            const nextParams = getRidesCatalogParams();
            nextParams.set("origin", "rides");
            return nextParams;
          })()
        : getRideBrowserParams();

    navigateWithParams(`/parks/${parkSlug}/rides/${rideSlug}`, params);
  };

  const navigateBackFromRide = (slug: string) => {
    if (rideDetailOrigin === "rides") {
      navigateToRides({ preserveFilters: true });

      return;
    }

    navigateToPark(slug, { preserveRideBrowserState: true });
  };

  const updateRiddenRide = (rideId: number, ridden: boolean) => {
    setRideCreditsStatus((current) => {
      if (current.state !== "success") {
        return current;
      }

      const rideIds = ridden
        ? current.rideIds.includes(rideId)
          ? current.rideIds
          : [...current.rideIds, rideId]
        : current.rideIds.filter((currentRideId) => currentRideId !== rideId);

      return {
        ...current,
        rideIds
      };
    });
  };

  const toggleRideCredit = async (nextRidden: boolean) => {
    if (!apiBaseUrl || route.view !== "ride" || rideDetailStatus.state !== "success") {
      return;
    }

    setIsUpdatingRideCredit(true);
    setRideCreditMessage(null);

    try {
      const creditUrl = new URL(
        `/parks/${route.parkSlug}/rides/${route.rideSlug}/credit`,
        apiBaseUrl
      );
      const response = await fetch(creditUrl, {
        method: nextRidden ? "PUT" : "DELETE"
      });

      if (!response.ok) {
        setRideCreditMessage(`Unable to update ride credit (${response.status}).`);

        return;
      }

      const payload = (await response.json()) as RideCreditMutationResponse;

      updateRiddenRide(payload.rideId, payload.ridden);
      await loadDemoUserStats();
      await loadUserProgression();
      setRideCreditMessage(
        payload.ridden ? "Ride marked as ridden." : "Ride marked as not ridden."
      );
    } catch (error) {
      setRideCreditMessage(
        error instanceof Error ? error.message : "Unable to update ride credit."
      );
    } finally {
      setIsUpdatingRideCredit(false);
    }
  };

  const normalizedSearchQuery = searchQuery.trim();
  const isParksBrowseRoute = route.view === "parks";
  const hasActiveCatalogSearch = isParksBrowseRoute && normalizedSearchQuery.length > 0;
  const normalizedRideCatalogSearchQuery = rideCatalogSearchQuery.trim();
  const hasActiveRideCatalogSearch =
    route.view === "rides" && normalizedRideCatalogSearchQuery.length > 0;
  const heroCountLabel =
    parksStatus.state === "success"
      ? formatCountLabel(parksStatus.parks.length, "park")
      : "Catalog";
  const riddenRideCountLabel =
    demoUserStatsStatus.state === "success"
      ? formatCountLabel(demoUserStatsStatus.totalRiddenRides, "ridden ride")
      : demoUserStatsStatus.state === "loading"
        ? "Loading stats"
        : "Stats unavailable";
  const riddenParkCountLabel =
    demoUserStatsStatus.state === "success"
      ? formatCountLabel(demoUserStatsStatus.totalParksWithRiddenRides, "park")
      : demoUserStatsStatus.state === "loading"
        ? "Loading stats"
        : "Stats unavailable";
  const parkProgressBySlug =
    demoUserStatsStatus.state === "success"
      ? new Map(
          demoUserStatsStatus.parks.map((park) => [park.parkSlug, park])
        )
      : null;
  const riddenRideIds =
    rideCreditsStatus.state === "success" ? new Set(rideCreditsStatus.rideIds) : null;
  const allParks = parksStatus.state === "success" ? parksStatus.parks : [];
  const selectedParkCollection = parkCollections.find(
    (collection) => collection.id === parkCollectionId
  );
  const displayedParks = selectedParkCollection
    ? allParks.filter((park) => selectedParkCollection.itemSlugs.includes(park.slug))
    : allParks;
  const parkBySlug = new Map(allParks.map((park) => [park.slug, park]));
  const allRideCatalogItems =
    ridesCatalogStatus.state === "success" ? ridesCatalogStatus.rides : [];
  const selectedRideCollection = rideCollections.find(
    (collection) => collection.id === rideCollectionId
  );
  const displayedRideCatalogItems = selectedRideCollection
    ? allRideCatalogItems.filter((entry) =>
        selectedRideCollection.itemSlugs.includes(entry.ride.slug)
      )
    : allRideCatalogItems;
  const hasActiveParkCollection = Boolean(selectedParkCollection);
  const hasActiveRideCollection = Boolean(selectedRideCollection);
  const featuredParks = allParks.slice(0, 4);
  const landingFeaturedParks = featuredParks.slice(0, 3);
  const communityHighlights =
    communityHighlightsStatus.state === "success" ? communityHighlightsStatus.profiles : [];
  const landingCommunityHighlights = communityHighlights.slice(0, 2);
  const highestLevelProfiles = [...communityHighlights]
    .sort(
      (left, right) =>
        right.identity.level - left.identity.level ||
        right.identity.totalXp - left.identity.totalXp ||
        right.totalRiddenRides - left.totalRiddenRides ||
        left.user.name.localeCompare(right.user.name)
    )
    .slice(0, 3);
  const longestStreakProfiles = [...communityHighlights]
    .sort(
      (left, right) =>
        right.identity.currentStreak - left.identity.currentStreak ||
        right.identity.completedDays - left.identity.completedDays ||
        right.identity.totalXp - left.identity.totalXp ||
        left.user.name.localeCompare(right.user.name)
    )
    .slice(0, 3);
  const recentlyActiveProfiles = [...communityHighlights]
    .sort((left, right) => {
      const leftTime = left.recentActivity[0]?.riddenAt
        ? Date.parse(left.recentActivity[0].riddenAt)
        : 0;
      const rightTime = right.recentActivity[0]?.riddenAt
        ? Date.parse(right.recentActivity[0].riddenAt)
        : 0;

      return (
        rightTime - leftTime ||
        right.identity.currentStreak - left.identity.currentStreak ||
        left.user.name.localeCompare(right.user.name)
      );
    })
    .slice(0, 3);
  const spotlightPark = landingFeaturedParks[0];
  const spotlightProgress = spotlightPark
    ? parkProgressBySlug?.get(spotlightPark.slug)
    : undefined;
  const spotlightParkEditorial = spotlightPark
    ? parkEditorialBySlug[spotlightPark.slug]
    : undefined;
  const secondaryFeaturedParks = landingFeaturedParks.slice(1);
  const rankedProgressParks =
    demoUserStatsStatus.state === "success"
      ? [...demoUserStatsStatus.parks]
          .sort(
            (left, right) =>
              right.completionPercentage - left.completionPercentage ||
              right.riddenRides - left.riddenRides ||
              left.parkName.localeCompare(right.parkName)
          )
          .slice(0, 3)
      : [];
  const featuredProgressParks = rankedProgressParks
    .map((progress) => ({
      progress,
      park: parkBySlug.get(progress.parkSlug)
    }))
    .filter((entry): entry is { progress: DemoUserStatsResponse["parks"][number]; park: Park } =>
      Boolean(entry.park)
    );
  const activeParkProgress =
    route.view === "park" ? parkProgressBySlug?.get(route.slug) : undefined;
  const activeParkEditorial =
    route.view === "park" && parkDetailStatus.state === "success"
      ? parkEditorialBySlug[parkDetailStatus.park.slug]
      : undefined;
  const parkQueueTimesReference =
    parkDetailStatus.state === "success" ? parkDetailStatus.queueTimes : undefined;
  const liveWaitSource =
    parkLiveWaitsStatus.state === "success" ? parkLiveWaitsStatus.source : null;
  const hasMappedLiveWaits = liveWaitSource?.state === "mapped";
  const liveWaitRides =
    parkLiveWaitsStatus.state === "success" ? parkLiveWaitsStatus.rides : [];
  const parkQueueTimesLinks = dedupeExternalLinks(
    parkQueueTimesReference
      ? [
          { label: "Park waits", href: parkQueueTimesReference.queueUrl },
          { label: "Park stats", href: parkQueueTimesReference.statsUrl }
        ]
      : []
  );
  const rideLineup =
    rideLineupStatus.state === "success" ? rideLineupStatus.rides : [];
  const activeRideIndex =
    rideDetailStatus.state === "success"
      ? rideLineup.findIndex((ride) => ride.slug === rideDetailStatus.ride.slug)
      : -1;
  const previousRide =
    activeRideIndex > 0 ? rideLineup[activeRideIndex - 1] : undefined;
  const nextRide =
    activeRideIndex >= 0 && activeRideIndex < rideLineup.length - 1
      ? rideLineup[activeRideIndex + 1]
      : undefined;
  const rideLineupPositionLabel =
    activeRideIndex >= 0
      ? `${activeRideIndex + 1} of ${rideLineup.length} in this lineup`
      : rideLineupStatus.state === "success" && rideLineup.length > 0
        ? "Outside the current lineup"
        : null;
  const isCurrentRideRidden =
    rideDetailStatus.state === "success" &&
    riddenRideIds?.has(rideDetailStatus.ride.id) === true;
  const activeRideEditorial =
    route.view === "ride" && rideDetailStatus.state === "success"
      ? rideEditorialBySlug[rideDetailStatus.ride.slug]
      : undefined;
  const currentRideLiveWait =
    route.view === "ride" &&
    rideDetailStatus.state === "success" &&
    parkLiveWaitsStatus.state === "success"
      ? parkLiveWaitsStatus.rides.find(
          (ride) => ride.rideSlug === rideDetailStatus.ride.slug
        ) ?? null
      : null;
  const rideQueueTimesLinks =
    rideDetailStatus.state === "success"
      ? dedupeExternalLinks([
          ...(rideDetailStatus.rideQueueTimes
            ? [
                {
                  label: "Ride stats",
                  href: rideDetailStatus.rideQueueTimes.statsUrl
                }
              ]
            : []),
          ...(rideDetailStatus.parkQueueTimes
            ? [
                {
                  label: "Park waits",
                  href: rideDetailStatus.parkQueueTimes.queueUrl
                }
              ]
            : [])
        ])
      : [];
  const rideSpecItems: RideSpecItem[] = [];

  if (rideDetailStatus.state === "success") {
    rideSpecItems.push(
      {
        label: "Parent park",
        value: rideDetailStatus.park.name,
        wide: true
      },
      {
        label: "Ride type",
        value: rideDetailStatus.ride.rideType
      }
    );

    if (rideDetailStatus.ride.manufacturer) {
      rideSpecItems.push({
        label: "Manufacturer",
        value: rideDetailStatus.ride.manufacturer
      });
    }

    if (rideDetailStatus.ride.model) {
      rideSpecItems.push({
        label: "Model",
        value: rideDetailStatus.ride.model
      });
    }

    if (rideDetailStatus.ride.openingYear !== undefined) {
      rideSpecItems.push({
        label: "Opening year",
        value: String(rideDetailStatus.ride.openingYear)
      });
    }

    if (rideDetailStatus.ride.heightM !== undefined) {
      rideSpecItems.push({
        label: "Height",
        value: `${formatDecimalValue(rideDetailStatus.ride.heightM)} m`
      });
    }

    if (rideDetailStatus.ride.speedKmh !== undefined) {
      rideSpecItems.push({
        label: "Top speed",
        value: `${formatDecimalValue(rideDetailStatus.ride.speedKmh)} km/h`
      });
    }

    if (rideDetailStatus.ride.inversions !== undefined) {
      rideSpecItems.push({
        label: "Inversions",
        value: String(rideDetailStatus.ride.inversions)
      });
    }
  }

  const parksSearchLabel = hasActiveCatalogSearch
    ? `Search: "${normalizedSearchQuery}"`
    : "All parks";
  const ridesSearchLabel = hasActiveRideCatalogSearch
    ? `Search: "${normalizedRideCatalogSearchQuery}"`
    : "All rides";
  const routeBarTitle =
    route.view === "parks"
      ? parksSearchLabel
      : route.view === "rides"
        ? ridesSearchLabel
      : route.view === "discover"
        ? "Discover"
        : route.view === "profile"
          ? "Profile"
        : route.view === "user-profile"
          ? userProfileStatus.state === "success"
            ? userProfileStatus.profile.user.name
            : route.slug
        : route.view === "journal"
          ? "Journal"
          : route.view === "park"
            ? parkDetailStatus.state === "success"
              ? parkDetailStatus.park.name
              : route.slug
            : route.view === "ride"
              ? rideDetailStatus.state === "success"
                ? rideDetailStatus.ride.name
                : route.rideSlug
              : "Home";
  const routeBarLabel =
    route.view === "parks"
      ? "Parks browse"
      : route.view === "rides"
        ? "Rides browse"
      : route.view === "discover"
        ? "Discovery"
        : route.view === "profile"
          ? "Profile"
        : route.view === "user-profile"
          ? "Public profile"
        : route.view === "journal"
          ? "Journal"
          : route.view === "park"
            ? "Park detail"
            : route.view === "ride"
              ? "Ride detail"
              : "Landing";
  const breadcrumbItems: BreadcrumbItem[] =
    route.view === "parks"
      ? [
          { label: "Parks" },
          { label: parksSearchLabel }
        ]
      : route.view === "rides"
        ? [
            { label: "Rides" },
            { label: ridesSearchLabel }
          ]
        : route.view === "discover"
        ? [{ label: "Discover" }]
        : route.view === "profile"
          ? [{ label: "Profile" }]
        : route.view === "user-profile"
          ? [
              {
                label: "Profile",
                href: "/profile",
                onClick: navigateToProfile
              },
              {
                label:
                  userProfileStatus.state === "success"
                    ? userProfileStatus.profile.user.name
                    : route.slug
              }
            ]
        : route.view === "journal"
          ? [{ label: "Journal" }]
          : route.view === "park"
            ? [
                {
                  label: "Parks",
                  href: buildPathWithQuery("/parks", getCatalogSearchParams()),
                  onClick: () => {
                    navigateToParks({ preserveSearch: true });
                  }
                },
                {
                  label:
                    parkDetailStatus.state === "success"
                      ? parkDetailStatus.park.name
                      : route.slug
                }
              ]
            : route.view === "ride"
              ? [
                  ...(rideDetailOrigin === "rides"
                    ? [
                        {
                          label: "Rides",
                          href: buildPathWithQuery("/rides", getRidesCatalogParams()),
                          onClick: () => {
                            navigateToRides({ preserveFilters: true });
                          }
                        }
                      ]
                    : [
                        {
                          label: "Parks",
                          href: buildPathWithQuery("/parks", getCatalogSearchParams()),
                          onClick: () => {
                            navigateToParks({ preserveSearch: true });
                          }
                        },
                        {
                          label:
                            rideDetailStatus.state === "success"
                              ? rideDetailStatus.park.name
                              : route.parkSlug,
                          href: buildPathWithQuery(
                            `/parks/${
                              rideDetailStatus.state === "success"
                                ? rideDetailStatus.park.slug
                                : route.parkSlug
                            }`,
                            getRideBrowserParams()
                          ),
                          onClick: () => {
                            navigateToPark(
                              rideDetailStatus.state === "success"
                                ? rideDetailStatus.park.slug
                                : route.parkSlug,
                              { preserveRideBrowserState: true }
                            );
                          }
                        }
                      ]),
                  {
                    label:
                      rideDetailStatus.state === "success"
                        ? rideDetailStatus.ride.name
                        : route.rideSlug
                  }
                ]
              : [];
  const showRouteBar = route.view !== "home";
  const routeBarChips =
    route.view === "parks"
      ? [
          catalogStateChip(parksStatus),
          hasActiveCatalogSearch ? `Search: ${normalizedSearchQuery}` : "Browse"
        ].filter(Boolean)
      : route.view === "rides"
        ? [
            catalogStateChip(ridesCatalogStatus),
            rideCatalogParkFilter
              ? ridesCatalogOptions.parks.find((park) => park.slug === rideCatalogParkFilter)?.name ??
                rideCatalogParkFilter
              : "All parks"
          ].filter(Boolean)
      : route.view === "discover"
        ? [heroCountLabel, riddenRideCountLabel]
      : route.view === "profile"
        ? userProfileStatus.state === "success"
          ? [
              `Level ${userProfileStatus.profile.identity.level}`,
              `${userProfileStatus.profile.identity.currentStreak} day streak`
            ]
          : [riddenRideCountLabel, riddenParkCountLabel]
      : route.view === "user-profile"
        ? userProfileStatus.state === "success"
          ? [
              `Level ${userProfileStatus.profile.identity.level}`,
              `${userProfileStatus.profile.totalRiddenRides} ridden`
            ]
          : ["Public profile"]
      : route.view === "journal"
          ? ["Coming soon"]
          : route.view === "park"
            ? [
                activeParkProgress
                  ? `${activeParkProgress.riddenRides}/${activeParkProgress.totalRides} ridden`
                  : "Park detail"
              ]
            : route.view === "ride"
              ? [
                  rideDetailStatus.state === "success"
                    ? `${rideDetailStatus.park.name} lineup`
                    : "Ride detail",
                  rideLineupPositionLabel
                ].filter(Boolean)
              : [];
  const topNavigation = [
    {
      label: "Home",
      href: "/",
      active: route.view === "home",
      onClick: navigateHome
    },
    {
      label: "Parks",
      href: buildPathWithQuery("/parks", getCatalogSearchParams()),
      active:
        route.view === "parks" ||
        route.view === "park" ||
        (route.view === "ride" && rideDetailOrigin !== "rides"),
      onClick: () => {
        navigateToParks({ preserveSearch: true });
      }
    },
    {
      label: "Rides",
      href: buildPathWithQuery("/rides", getRidesCatalogParams()),
      active: route.view === "rides" || (route.view === "ride" && rideDetailOrigin === "rides"),
      onClick: () => {
        navigateToRides({ preserveFilters: true });
      }
    },
    {
      label: "Discover",
      href: "/discover",
      active: route.view === "discover",
      onClick: navigateToDiscover
    },
    {
      label: "Profile",
      href: "/profile",
      active: route.view === "profile" || route.view === "user-profile",
      onClick: navigateToProfile
    },
    {
      label: "Journal",
      href: "/journal",
      active: route.view === "journal",
      onClick: navigateToJournal
    }
  ];
  const activeNavigationLabel =
    topNavigation.find((item) => item.active)?.label ?? routeBarTitle;

  return (
    <main className="app-shell">
      <header className={`topbar${isMobileNavOpen ? " topbar-nav-open" : ""}`}>
        <div className="topbar-primary">
          <button
            className="brand-link brand-link-image"
            type="button"
            onClick={() => {
              setIsMobileNavOpen(false);
              navigateHome();
            }}
          >
            <img className="brand-logo" src={brandLogoDark} alt="Coasterly" />
          </button>
          <span className="mobile-route-label">{activeNavigationLabel}</span>
          <button
            className="mobile-menu-button"
            type="button"
            aria-expanded={isMobileNavOpen}
            aria-controls="primary-navigation"
            onClick={() => {
              setIsMobileNavOpen((isOpen) => !isOpen);
            }}
          >
            Menu
          </button>
        </div>
        <nav className="topbar-nav" id="primary-navigation" aria-label="Primary">
          {topNavigation.map((item) => (
            <a
              key={item.label}
              className={`topbar-nav-link${item.active ? " topbar-nav-link-active" : ""}`}
              href={item.href}
              onClick={(event) => {
                event.preventDefault();
                setIsMobileNavOpen(false);
                item.onClick();
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="topbar-meta">
          <div className="status-cluster" aria-live="polite">
            {apiStatus.state === "error" ? (
              <span className="status-chip status-chip-error">Service issue</span>
            ) : null}
          </div>
        </div>
      </header>

      {showRouteBar ? (
        <section className="route-bar" aria-label="Current route">
          <div className="route-bar-main">
            {renderBreadcrumbs(breadcrumbItems)}
            <div className="route-context">
              <p className="route-context-label">{routeBarLabel}</p>
              <strong className="route-context-value">{routeBarTitle}</strong>
            </div>
          </div>
          <div className="route-bar-actions">
            {routeBarChips.map((chip) => (
              <span className="catalog-chip route-chip" key={chip}>
                {chip}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      {route.view === "home" ? (
        <>
          <section className="hero-panel hero-panel-landing">
            <div className="hero-copy hero-copy-landing">
              <h1>Europe&apos;s park catalog, built for coaster people.</h1>
              <p className="hero-text">
                Browse standout parks, track what you&apos;ve ridden, and move through each lineup
                with less noise.
              </p>
              <div className="hero-actions">
                <button className="primary-button" type="button" onClick={() => {
                  navigateToParks({ preserveSearch: true });
                }}>
                  Browse parks
                </button>
                <button className="secondary-button" type="button" onClick={navigateToProfile}>
                  Open profile
                </button>
              </div>
              <div className="hero-stats" aria-label="Catalog summary">
                <div className="hero-stat">
                  <span className="hero-stat-label">Parks</span>
                  <strong>{heroCountLabel}</strong>
                </div>
                <div className="hero-stat">
                  <span className="hero-stat-label">Rides logged</span>
                  <strong>{riddenRideCountLabel}</strong>
                </div>
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
                    <div className="spotlight-row">
                      <span className="catalog-chip">{spotlightPark.status}</span>
                      {spotlightParkEditorial?.cues.slice(0, 1).map((cue) => (
                        <span className="catalog-chip route-chip" key={cue}>
                          {cue}
                        </span>
                      ))}
                      {spotlightProgress ? (
                        <span className="catalog-chip catalog-chip-ridden">
                          {spotlightProgress.completionPercentage}% complete
                        </span>
                      ) : null}
                    </div>
                    <p className="eyebrow">Featured park</p>
                    <h2>{spotlightPark.name}</h2>
                    <p>{spotlightPark.city}, {spotlightPark.country}</p>
                    {spotlightParkEditorial ? (
                      <p className="spotlight-summary">{spotlightParkEditorial.summary}</p>
                    ) : null}
                  </div>
                </button>
              ) : (
                <div className="spotlight-card spotlight-card-empty">
                  <div className="spotlight-copy">
                    <p className="eyebrow">Featured park</p>
                    <h2>Catalog loading</h2>
                    <p>Featured parks will appear here shortly.</p>
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

          <section className="landing-grid">
            <section className="catalog-panel landing-panel">
              <div className="catalog-header landing-header">
                <div className="catalog-copy">
                  <p className="status-label">Featured parks</p>
                  <h2 className="section-title">Parks worth opening next.</h2>
                </div>
                <div className="landing-actions">
                  <button
                    className="catalog-inline-button"
                    type="button"
                    onClick={() => {
                      navigateToParks({ preserveSearch: true });
                    }}
                  >
                    Explore parks
                  </button>
                </div>
              </div>
              <div className="parks-list parks-list-featured">
                {landingFeaturedParks.map((park) => {
                  const parkProgress = parkProgressBySlug?.get(park.slug);
                  const parkEditorial = parkEditorialBySlug[park.slug];

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
                        <span className="catalog-chip">{park.status}</span>
                      </div>
                      <p className="park-location">
                        {park.city}, {park.country}
                      </p>
                      {parkEditorial ? (
                        <p className="card-summary">{parkEditorial.summary}</p>
                      ) : null}
                      {parkEditorial?.cues.length ? (
                        <div className="card-cues">
                          {parkEditorial.cues.slice(0, 2).map((cue) => (
                            <span className="catalog-chip route-chip" key={cue}>
                              {cue}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      {parkProgress && parkProgress.riddenRides > 0 ? (
                        <div className="park-progress">
                          <div className="progress-copy">
                            <span className="progress-label">Progress</span>
                            <strong className="progress-value">
                              {parkProgress.completionPercentage}%
                            </strong>
                          </div>
                          <div className="progress-rail" aria-hidden="true">
                            <span
                              className="progress-fill"
                              style={{
                                width: `${parkProgress.completionPercentage}%`
                              }}
                            />
                          </div>
                        </div>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="catalog-panel landing-panel">
              <div className="catalog-header landing-header">
                <div className="catalog-copy">
                  <p className="status-label">Progress</p>
                  <h2 className="section-title">Keep your collection in view.</h2>
                </div>
                <div className="landing-actions">
                  <button className="catalog-inline-button" type="button" onClick={navigateToDiscover}>
                    See progress
                  </button>
                </div>
              </div>
              {demoUserStatsStatus.state === "success" ? (
                <div className="stats-panel stats-panel-compact" aria-label="Ride progress">
                  <div className="stats-grid">
                    <article className="stats-card">
                      <span className="stats-card-label">Ridden rides</span>
                      <strong className="stats-card-value">
                        {demoUserStatsStatus.totalRiddenRides}
                      </strong>
                    </article>
                    <article className="stats-card">
                      <span className="stats-card-label">Parks ridden</span>
                      <strong className="stats-card-value">
                        {demoUserStatsStatus.totalParksWithRiddenRides}
                      </strong>
                    </article>
                  </div>
                  <div className="stats-breakdown">
                    {rankedProgressParks.map((park) => (
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
                          {`${park.riddenRides}/${park.totalRides} ridden`}
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
                  <ProgressionPanel userProgressionStatus={userProgressionStatus} />
                </div>
              ) : demoUserStatsStatus.state === "loading" ? (
                <div className="state-message state-message-loading">
                  <p>Loading progress...</p>
                </div>
              ) : (
                <div className="state-message state-message-error">
                  <p>Unable to load progress.</p>
                  <p>{demoUserStatsStatus.message}</p>
                </div>
              )}
            </section>
          </section>

          <section className="catalog-panel landing-panel">
            <div className="catalog-header landing-header">
              <div className="catalog-copy">
                <p className="status-label">Collections</p>
                <h2 className="section-title">Curated ways into the catalog.</h2>
              </div>
            </div>
            <div className="collection-grid">
              {landingCollections.map((collection) => (
                <CuratedCollectionCard
                  collection={collection}
                  key={collection.id}
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

          <DailyChallengePanel
            dailyChallengeStatus={dailyChallengeStatus}
            isSubmitting={isSubmittingDailyChallenge}
            isClaimingReward={isClaimingDailyReward}
            onAnswer={submitDailyChallengeAnswer}
            onClaimReward={claimDailyReward}
            onOpenRide={(parkSlug, rideSlug) => {
              navigateToRide(parkSlug, rideSlug);
            }}
          />

          <section className="catalog-panel landing-panel">
              <div className="catalog-header landing-header">
                <div className="catalog-copy">
                  <p className="status-label">Community</p>
                  <h2 className="section-title">Recent rider profiles.</h2>
                </div>
                <div className="landing-actions">
                  <button className="catalog-inline-button" type="button" onClick={navigateToDiscover}>
                    See more
                  </button>
                </div>
              </div>
            {communityHighlightsStatus.state === "loading" ? (
              <div className="state-message state-message-loading state-message-compact">
                <p>Loading community activity...</p>
              </div>
            ) : null}
            {communityHighlightsStatus.state === "success" ? (
              landingCommunityHighlights.length > 0 ? (
                <div className="community-grid">
                  {landingCommunityHighlights.map((profile) => (
                    <CommunityHighlightCard
                      key={profile.user.id}
                      profile={profile}
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
                  <p>No public activity yet.</p>
                </div>
              )
            ) : null}
            {communityHighlightsStatus.state === "error" ? (
              <div className="state-message state-message-error state-message-compact">
                <p>Unable to load community activity.</p>
                <p>{communityHighlightsStatus.message}</p>
              </div>
            ) : null}
          </section>

          <section className="catalog-panel editorial-panel">
            <div className="catalog-header landing-header">
              <div className="catalog-copy">
                <p className="status-label">Journal</p>
                <h2 className="section-title">Guides, rankings, and park news.</h2>
              </div>
              <div className="landing-actions">
                <button className="catalog-inline-button" type="button" onClick={navigateToJournal}>
                  Read journal
                </button>
              </div>
            </div>
            <div className="editorial-grid">
              {landingJournalTeasers.map((entry) => (
                <article className="editorial-card" key={entry.title}>
                  <span className="editorial-tag">{entry.category}</span>
                  <h3>{entry.title}</h3>
                  <p>{entry.summary}</p>
                  <span className="catalog-chip route-chip">{entry.status}</span>
                </article>
              ))}
            </div>
          </section>
        </>
      ) : null}

      {route.view === "parks" ? (
        <section className="catalog-panel browse-panel" aria-live="polite">
          <div className="catalog-header">
            <div className="catalog-copy">
              <p className="status-label">Browse</p>
              <h2 className="section-title">Parks</h2>
            </div>
          </div>

          <div className="collection-strip" aria-label="Park collections">
            {parkCollections.map((collection) => (
              <CuratedCollectionCard
                collection={collection}
                isActive={collection.id === parkCollectionId}
                key={collection.id}
                onOpen={() => {
                  navigateToParks({ preserveSearch: true, collectionId: collection.id });
                }}
              />
            ))}
          </div>

          <div className="toolbar-panel browse-toolbar">
            <div className="browse-toolbar-main">
              <label className="search-label" htmlFor="park-search">
                Search parks
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
                  }}
                  placeholder="Park name, country, or city"
                />
                {searchQuery ? (
                  <button
                    className="catalog-inline-button"
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                    }}
                  >
                    Clear
                  </button>
                ) : null}
              </div>
            </div>
            <div className="catalog-state-row" aria-label="Browse state">
              <span className="catalog-chip">
                {parksStatus.state === "success"
                  ? `${displayedParks.length} results`
                  : "Loading results"}
              </span>
              {selectedParkCollection ? (
                <span className="catalog-chip route-chip">{selectedParkCollection.title}</span>
              ) : null}
              {hasActiveCatalogSearch ? (
                <span className="catalog-chip route-chip">{`"${normalizedSearchQuery}"`}</span>
              ) : null}
              {hasActiveParkCollection ? (
                <button
                  className="catalog-inline-button"
                  type="button"
                  onClick={() => {
                    setParkCollectionId("");
                  }}
                >
                  Clear collection
                </button>
              ) : null}
            </div>
          </div>

          {parksStatus.state === "loading" ? <CatalogSkeletonGrid count={8} variant="park" /> : null}
          {parksStatus.state === "success" ? (
            displayedParks.length > 0 ? (
              <div className="parks-list">
                {displayedParks.map((park) => {
                  const parkProgress = parkProgressBySlug?.get(park.slug);
                  const parkEditorial = parkEditorialBySlug[park.slug];

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
                        <span className="catalog-chip">{park.status}</span>
                      </div>
                      <p className="park-location">
                        {park.city}, {park.country}
                      </p>
                      {parkEditorial ? (
                        <p className="card-summary">{parkEditorial.summary}</p>
                      ) : null}
                      {parkEditorial?.cues.length ? (
                        <div className="card-cues">
                          {parkEditorial.cues.slice(0, 2).map((cue) => (
                            <span className="catalog-chip route-chip" key={cue}>
                              {cue}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      {parkProgress && parkProgress.riddenRides > 0 ? (
                        <div className="park-progress">
                          <div className="progress-copy">
                            <span className="progress-label">Progress</span>
                            <strong className="progress-value">
                              {parkProgress.completionPercentage}%
                            </strong>
                          </div>
                          <div className="progress-rail" aria-hidden="true">
                            <span
                              className="progress-fill"
                              style={{
                                width: `${parkProgress.completionPercentage}%`
                              }}
                            />
                          </div>
                          <p className="park-meta">
                            {`${parkProgress.riddenRides} of ${parkProgress.totalRides} rides ridden`}
                          </p>
                        </div>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="state-message state-message-empty">
                <p>
                  {selectedParkCollection
                    ? "No parks match this collection yet."
                    : "No parks match this search yet."}
                </p>
              </div>
            )
          ) : null}
          {parksStatus.state === "error" ? (
            <div className="state-message state-message-error">
              <p>Unable to load parks.</p>
              <p>{parksStatus.message}</p>
              <button
                className="catalog-inline-button"
                type="button"
                onClick={() => {
                  window.location.reload();
                }}
              >
                Try again
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      {route.view === "rides" ? (
        <section className="catalog-panel browse-panel" aria-live="polite">
          <div className="catalog-header">
            <div className="catalog-copy">
              <p className="status-label">Browse</p>
              <h2 className="section-title">Rides</h2>
            </div>
          </div>

          <div className="collection-strip" aria-label="Ride collections">
            {rideCollections.map((collection) => (
              <CuratedCollectionCard
                collection={collection}
                isActive={collection.id === rideCollectionId}
                key={collection.id}
                onOpen={() => {
                  navigateToRides({ preserveFilters: true, collectionId: collection.id });
                }}
              />
            ))}
          </div>

          <div className="toolbar-panel browse-toolbar browse-toolbar-stacked">
            <div className="browse-toolbar-main">
              <label className="search-label" htmlFor="ride-catalog-search">
                Search rides
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
                  }}
                  placeholder="Ride name"
                />
                {rideCatalogSearchQuery ? (
                  <button
                    className="catalog-inline-button"
                    type="button"
                    onClick={() => {
                      setRideCatalogSearchQuery("");
                    }}
                  >
                    Clear
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
                  setIsRideFiltersOpen((isOpen) => !isOpen);
                }}
              >
                Filters
              </button>
              <div className="ride-toolbar ride-toolbar-catalog">
              <div className="toolbar-field">
                <label className="search-label" htmlFor="ride-catalog-park">
                  Park
                </label>
                <select
                  id="ride-catalog-park"
                  className="toolbar-select"
                  value={rideCatalogParkFilter}
                  onChange={(event) => {
                    setRideCatalogParkFilter(event.target.value);
                  }}
                >
                  <option value="">All parks</option>
                  {ridesCatalogOptions.parks.map((park) => (
                    <option key={park.slug} value={park.slug}>
                      {park.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="toolbar-field">
                <label className="search-label" htmlFor="ride-catalog-type">
                  Ride type
                </label>
                <select
                  id="ride-catalog-type"
                  className="toolbar-select"
                  value={rideCatalogRideTypeFilter}
                  onChange={(event) => {
                    setRideCatalogRideTypeFilter(event.target.value);
                  }}
                >
                  <option value="">All ride types</option>
                  {ridesCatalogOptions.rideTypes.map((rideType) => (
                    <option key={rideType} value={rideType}>
                      {rideType}
                    </option>
                  ))}
                </select>
              </div>
              <div className="toolbar-field">
                <label className="search-label" htmlFor="ride-catalog-manufacturer">
                  Manufacturer
                </label>
                <select
                  id="ride-catalog-manufacturer"
                  className="toolbar-select"
                  value={rideCatalogManufacturerFilter}
                  onChange={(event) => {
                    setRideCatalogManufacturerFilter(event.target.value);
                  }}
                >
                  <option value="">All manufacturers</option>
                  {ridesCatalogOptions.manufacturers.map((manufacturer) => (
                    <option key={manufacturer} value={manufacturer}>
                      {manufacturer}
                    </option>
                  ))}
                </select>
              </div>
              <div className="toolbar-field">
                <label className="search-label" htmlFor="ride-catalog-sort">
                  Sort by
                </label>
                <select
                  id="ride-catalog-sort"
                  className="toolbar-select"
                  value={rideCatalogSort}
                  onChange={(event) => {
                    setRideCatalogSort(event.target.value as RidesCatalogSort);
                  }}
                >
                  <option value="name">Name</option>
                  <option value="opening_year">Opening year</option>
                  <option value="speed_kmh">Top speed</option>
                </select>
              </div>
              </div>
            </div>

            <div className="catalog-state-row" aria-label="Ride browse state">
              <span className="catalog-chip">
                {ridesCatalogStatus.state === "success"
                  ? `${displayedRideCatalogItems.length} results`
                  : "Loading results"}
              </span>
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
                  }}
                >
                  Clear filters
                </button>
              ) : null}
              {hasActiveRideCollection ? (
                <button
                  className="catalog-inline-button"
                  type="button"
                  onClick={() => {
                    setRideCollectionId("");
                  }}
                >
                  Clear collection
                </button>
              ) : null}
            </div>
          </div>

          {ridesCatalogStatus.state === "loading" ? (
            <CatalogSkeletonGrid count={8} variant="ride" />
          ) : null}
          {ridesCatalogStatus.state === "success" ? (
            displayedRideCatalogItems.length > 0 ? (
              <div className="rides-list rides-list-catalog">
                {displayedRideCatalogItems.map((entry) => {
                  const isRidden = riddenRideIds?.has(entry.ride.id) === true;
                  const rideEditorial = rideEditorialBySlug[entry.ride.slug];

                  return (
                    <button
                      className={`ride-card ride-card-button${isRidden ? " ride-card-ridden" : ""}`}
                      key={`${entry.park.slug}-${entry.ride.slug}`}
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
                        <div className="ride-card-chips">
                          {isRidden ? (
                            <span className="catalog-chip catalog-chip-ridden">Ridden</span>
                          ) : null}
                          <span className="catalog-chip">{entry.ride.status}</span>
                        </div>
                      </div>
                      <p className="park-location">
                        {entry.park.city}, {entry.park.country}
                      </p>
                      {rideEditorial ? (
                        <p className="card-summary">{rideEditorial.summary}</p>
                      ) : null}
                      <div className="ride-facts-row">
                        {rideEditorial?.cues.slice(0, 2).map((cue) => (
                          <span className="ride-fact-pill ride-fact-pill-accent" key={cue}>
                            {cue}
                          </span>
                        ))}
                        <span className="ride-fact-pill">{entry.ride.rideType}</span>
                        {entry.ride.manufacturer ? (
                          <span className="ride-fact-pill">{entry.ride.manufacturer}</span>
                        ) : null}
                        {entry.ride.openingYear !== undefined ? (
                          <span className="ride-fact-pill">{entry.ride.openingYear}</span>
                        ) : null}
                        {entry.ride.speedKmh !== undefined ? (
                          <span className="ride-fact-pill">
                            {`${formatDecimalValue(entry.ride.speedKmh)} km/h`}
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="state-message state-message-empty">
                <p>
                  {selectedRideCollection
                    ? "No rides match this collection yet."
                    : "No rides match this view yet."}
                </p>
                {!selectedRideCollection ? (
                  <p>Try a broader ride name or clear one of the current filters.</p>
                ) : null}
              </div>
            )
          ) : null}
          {ridesCatalogStatus.state === "error" ? (
            <div className="state-message state-message-error">
              <p>Unable to load rides.</p>
              <p>{ridesCatalogStatus.message}</p>
              <button
                className="catalog-inline-button"
                type="button"
                onClick={() => {
                  window.location.reload();
                }}
              >
                Try again
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      {route.view === "discover" ? (
        <section className="catalog-panel browse-panel" aria-live="polite">
          <div className="catalog-header">
            <div className="catalog-copy">
              <p className="status-label">Discover</p>
              <h2 className="section-title">Pick the next park worth opening.</h2>
            </div>
          </div>

          <DailyChallengePanel
            dailyChallengeStatus={dailyChallengeStatus}
            isSubmitting={isSubmittingDailyChallenge}
            isClaimingReward={isClaimingDailyReward}
            onAnswer={submitDailyChallengeAnswer}
            onClaimReward={claimDailyReward}
            onOpenRide={(parkSlug, rideSlug) => {
              navigateToRide(parkSlug, rideSlug);
            }}
          />

          {demoUserStatsStatus.state === "success" ? (
            <section className="stats-panel" aria-label="Ride progress">
              <div className="section-row">
                <div>
                  <p className="status-label">Ride progress</p>
                </div>
                <button className="catalog-inline-button" type="button" onClick={() => {
                  navigateToParks({ preserveSearch: true });
                }}>
                  Browse parks
                </button>
              </div>
              <div className="stats-grid">
                <article className="stats-card">
                  <span className="stats-card-label">Ridden rides</span>
                  <strong className="stats-card-value">
                    {demoUserStatsStatus.totalRiddenRides}
                  </strong>
                </article>
                <article className="stats-card">
                  <span className="stats-card-label">Parks ridden</span>
                  <strong className="stats-card-value">
                    {demoUserStatsStatus.totalParksWithRiddenRides}
                  </strong>
                </article>
              </div>
              <div className="stats-breakdown">
                {rankedProgressParks.map((park) => (
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
                      {`${park.riddenRides}/${park.totalRides} ridden`}
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
              <ProgressionPanel userProgressionStatus={userProgressionStatus} />
            </section>
          ) : null}

          <section className="catalog-panel nested-panel">
            <div className="catalog-header landing-header">
              <div className="catalog-copy">
                <p className="status-label">Collections</p>
                <h2 className="section-title">Browse by collection.</h2>
              </div>
            </div>
            <div className="collection-grid">
              {curatedCollections.map((collection) => (
                <CuratedCollectionCard
                  collection={collection}
                  key={collection.id}
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
                <p>Loading rankings...</p>
              </div>
            ) : null}
            {communityHighlightsStatus.state === "success" ? (
              communityHighlights.length > 0 ? (
                <div className="community-ranking-grid">
                  <CommunityRankingCard
                    title="Highest level"
                    summary="Riders stacking the most XP so far."
                    profiles={highestLevelProfiles}
                    onOpenProfile={navigateToPublicProfile}
                  />
                  <CommunityRankingCard
                    title="Longest streak"
                    summary="Riders keeping the daily loop alive."
                    profiles={longestStreakProfiles}
                    onOpenProfile={navigateToPublicProfile}
                  />
                  <CommunityRankingCard
                    title="Recently active"
                    summary="Fresh credits and profile momentum."
                    profiles={recentlyActiveProfiles}
                    onOpenProfile={navigateToPublicProfile}
                  />
                </div>
              ) : (
                <div className="state-message state-message-empty state-message-compact">
                  <p>No rankings yet.</p>
                </div>
              )
            ) : null}
            {communityHighlightsStatus.state === "error" ? (
              <div className="state-message state-message-error state-message-compact">
                <p>Unable to load rankings.</p>
                <p>{communityHighlightsStatus.message}</p>
              </div>
            ) : null}
          </section>

          <section className="catalog-panel nested-panel">
            <div className="catalog-header landing-header">
              <div className="catalog-copy">
                <p className="status-label">Featured now</p>
                <h2 className="section-title">Highlighted parks.</h2>
              </div>
            </div>
            <div className="parks-list parks-list-featured">
              {featuredProgressParks.length > 0
                ? featuredProgressParks.map(({ park, progress }) => (
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
                        <span className="catalog-chip catalog-chip-ridden">
                          {progress.completionPercentage}% complete
                        </span>
                      </div>
                      <p className="park-location">
                        {park.city}, {park.country}
                      </p>
                    </button>
                  ))
                : featuredParks.map((park) => (
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
                        <span className="catalog-chip">{park.status}</span>
                      </div>
                      <p className="park-location">
                        {park.city}, {park.country}
                      </p>
                    </button>
                  ))}
            </div>
          </section>

          <section className="catalog-panel nested-panel">
            <div className="catalog-header landing-header">
              <div className="catalog-copy">
                <p className="status-label">Community</p>
                <h2 className="section-title">Recent rider activity.</h2>
              </div>
            </div>
            {communityHighlightsStatus.state === "loading" ? (
              <div className="state-message state-message-loading state-message-compact">
                <p>Loading community activity...</p>
              </div>
            ) : null}
            {communityHighlightsStatus.state === "success" ? (
              communityHighlights.length > 0 ? (
                <div className="community-grid">
                  {communityHighlights.map((profile) => (
                    <CommunityHighlightCard
                      key={profile.user.id}
                      profile={profile}
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
                <p>Unable to load community activity.</p>
                <p>{communityHighlightsStatus.message}</p>
              </div>
            ) : null}
          </section>
        </section>
      ) : null}

      {route.view === "profile" ? (
        <section className="catalog-panel browse-panel" aria-live="polite">
          <div className="catalog-header">
            <div className="catalog-copy">
              <p className="status-label">Profile</p>
              <h2 className="section-title">Your profile</h2>
            </div>
          </div>

          {userProfileStatus.state === "loading" ? (
            <div className="state-message state-message-loading">
              <p>Loading profile...</p>
            </div>
          ) : null}

          {userProfileStatus.state === "success" ? (
            <>
              {profileShareMessage ? (
                <div className="state-message state-message-compact">
                  <p>{profileShareMessage}</p>
                </div>
              ) : null}
              <DailyChallengePanel
                dailyChallengeStatus={dailyChallengeStatus}
                isSubmitting={isSubmittingDailyChallenge}
                isClaimingReward={isClaimingDailyReward}
                onAnswer={submitDailyChallengeAnswer}
                onClaimReward={claimDailyReward}
                onOpenRide={(parkSlug, rideSlug) => {
                  navigateToRide(parkSlug, rideSlug);
                }}
              />
              <ProfileSurface
                profile={userProfileStatus.profile}
                isCurrentUser
                onOpenPark={(parkSlug) => {
                  navigateToPark(parkSlug);
                }}
                onOpenRide={(parkSlug, rideSlug) => {
                  navigateToRide(parkSlug, rideSlug);
                }}
                onOpenPublicProfile={navigateToPublicProfile}
                onCopyPublicProfile={copyPublicProfileLink}
              />
            </>
          ) : null}

          {userProfileStatus.state === "error" ? (
            <div className="state-message state-message-error">
              <p>Unable to load your profile.</p>
              <p>{userProfileStatus.message}</p>
            </div>
          ) : null}
        </section>
      ) : null}

      {route.view === "user-profile" ? (
        <section className="catalog-panel browse-panel" aria-live="polite">
          {userProfileStatus.state === "loading" ? (
            <div className="state-message state-message-loading">
              <p>Loading profile...</p>
            </div>
          ) : null}

          {userProfileStatus.state === "success" ? (
            <ProfileSurface
              profile={userProfileStatus.profile}
              isCurrentUser={false}
              onOpenPark={(parkSlug) => {
                navigateToPark(parkSlug);
              }}
              onOpenRide={(parkSlug, rideSlug) => {
                navigateToRide(parkSlug, rideSlug);
              }}
            />
          ) : null}

          {userProfileStatus.state === "error" ? (
            <div className="state-message state-message-error">
              <p>Unable to load this profile.</p>
              <p>{userProfileStatus.message}</p>
            </div>
          ) : null}
        </section>
      ) : null}

      {route.view === "journal" ? (
        <section className="catalog-panel browse-panel" aria-live="polite">
          <div className="catalog-header">
            <div className="catalog-copy">
              <p className="status-label">Journal</p>
              <h2 className="section-title">Rankings, guides, and park news will live here.</h2>
            </div>
          </div>
          <div className="editorial-grid">
            {journalTeasers.map((entry) => (
              <article className="editorial-card" key={entry.title}>
                <span className="editorial-tag">{entry.category}</span>
                <h3>{entry.title}</h3>
                <p>{entry.summary}</p>
                <button className="catalog-inline-button" type="button" onClick={() => {
                  navigateToParks({ preserveSearch: true });
                }}>
                  Browse parks
                </button>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {route.view === "park" ? (
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
                Back to parks
              </button>
            </div>
            {parkDetailStatus.state === "loading" ? (
              <div className="state-message state-message-loading">
                <p>Loading park details...</p>
              </div>
            ) : null}
            {parkDetailStatus.state === "success" ? (
              <article className="detail-card detail-card-park">
                <div className="detail-header detail-header-feature">
                  <div>
                    <p className="status-label">Park</p>
                    <h2 className="detail-title">{parkDetailStatus.park.name}</h2>
                    <p className="section-copy detail-summary">
                      {parkDetailStatus.park.city}, {parkDetailStatus.park.country}
                    </p>
                    {activeParkEditorial ? (
                      <p className="detail-story">{activeParkEditorial.summary}</p>
                    ) : null}
                    {activeParkEditorial?.cues.length ? (
                      <div className="detail-micro-nav" aria-label="Park discovery cues">
                        {activeParkEditorial.cues.slice(0, 2).map((cue) => (
                          <span className="detail-micro-item" key={cue}>
                            {cue}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="detail-chip-row">
                    <span className="catalog-chip">{parkDetailStatus.park.status}</span>
                    {activeParkProgress ? (
                      <span className="catalog-chip catalog-chip-ridden">
                        {activeParkProgress.completionPercentage}% complete
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
                      <p className="status-label">Your progress</p>
                      <div className="progress-copy">
                        <span className="progress-label">Completion</span>
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
                        {`${activeParkProgress.riddenRides} of ${activeParkProgress.totalRides} rides ridden`}
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-item-label">City</span>
                    <p>{parkDetailStatus.park.city}</p>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item-label">Country</span>
                    <p>{parkDetailStatus.park.country}</p>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item-label">Status</span>
                    <p>{parkDetailStatus.park.status}</p>
                  </div>
                </div>

                {parkLiveWaitsStatus.state !== "idle" ||
                parkQueueTimesLinks.length > 0 ? (
                  <div className="live-waits-section">
                    <div className="section-row">
                      <div>
                        <p className="status-label">Queue-Times</p>
                      </div>
                      <div className="detail-chip-row">
                        {liveWaitSource ? (
                          <span className="catalog-chip">
                            {liveWaitSource.state === "mapped"
                              ? formatCountLabel(liveWaitRides.length, "live ride")
                              : "Not mapped"}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <QueueTimesExternalLinks links={parkQueueTimesLinks} />

                    {parkLiveWaitsStatus.state === "loading" ? (
                      <div className="state-message state-message-loading state-message-compact">
                        <p>Loading live waits...</p>
                      </div>
                    ) : null}

                    {parkLiveWaitsStatus.state === "error" ? (
                      <div className="state-message state-message-error state-message-compact">
                        <p>Live waits unavailable right now.</p>
                        <p>{parkLiveWaitsStatus.message}</p>
                      </div>
                    ) : null}

                    {parkLiveWaitsStatus.state === "success" &&
                    parkLiveWaitsStatus.source.state === "mapped" ? (
                      parkLiveWaitsStatus.rides.length > 0 ? (
                        <>
                          <div className="wait-times-list">
                            {parkLiveWaitsStatus.rides.map((ride) => (
                              <article className="wait-time-card" key={ride.rideId}>
                                <div>
                                  <p className="wait-time-ride-name">{ride.rideName}</p>
                                  <p className="wait-time-meta">
                                    {ride.rideType}
                                    {ride.sourceLastUpdated
                                      ? ` | Updated ${formatSourceTimeLabel(
                                          ride.sourceLastUpdated
                                        )}`
                                      : ""}
                                  </p>
                                </div>
                                <div className="wait-time-value-block">
                                  <strong className="wait-time-value">
                                    {formatLiveWaitLabel(ride)}
                                  </strong>
                                  <span
                                    className={`catalog-chip wait-time-chip${
                                      ride.isOpen === false
                                        ? " wait-time-chip-closed"
                                        : ride.isOpen === true
                                          ? " wait-time-chip-open"
                                          : ""
                                    }`}
                                  >
                                    {ride.isOpen === false
                                      ? "Closed"
                                      : ride.isOpen === true
                                        ? "Open"
                                        : "Unknown"}
                                  </span>
                                </div>
                              </article>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="state-message state-message-empty state-message-compact">
                          <p>No live ride updates right now.</p>
                        </div>
                      )
                    ) : parkLiveWaitsStatus.state === "success" ? (
                      <div className="state-message state-message-empty state-message-compact">
                        <p>This park is not linked to Queue-Times yet.</p>
                      </div>
                    ) : null}

                    <QueueTimesAttribution />
                  </div>
                ) : null}

                <div className="rides-section">
                  <div className="section-row">
                    <div>
                      <p className="status-label">Ride lineup</p>
                    </div>
                    <div className="detail-chip-row">
                      {parkRidesStatus.state === "success" ? (
                        <span className="catalog-chip">
                          {formatCountLabel(parkRidesStatus.rides.length, "ride")}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="toolbar-panel">
                    <div className="ride-toolbar" aria-label="Ride filters and sorting">
                      <div className="toolbar-field">
                        <label className="search-label" htmlFor="ride-type-filter">
                          Ride type
                        </label>
                        <select
                          id="ride-type-filter"
                          className="toolbar-select"
                          value={rideTypeFilter}
                          onChange={(event) => {
                            setRideTypeFilter(event.target.value);
                          }}
                        >
                          <option value="">All ride types</option>
                          {parkRideOptions.rideTypes.map((rideType) => (
                            <option key={rideType} value={rideType}>
                              {rideType}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="toolbar-field">
                        <label className="search-label" htmlFor="manufacturer-filter">
                          Manufacturer
                        </label>
                        <select
                          id="manufacturer-filter"
                          className="toolbar-select"
                          value={manufacturerFilter}
                          onChange={(event) => {
                            setManufacturerFilter(event.target.value);
                          }}
                        >
                          <option value="">All manufacturers</option>
                          {parkRideOptions.manufacturers.map((manufacturer) => (
                            <option key={manufacturer} value={manufacturer}>
                              {manufacturer}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="toolbar-field">
                        <label className="search-label" htmlFor="ride-sort">
                          Sort by
                        </label>
                        <select
                          id="ride-sort"
                          className="toolbar-select"
                          value={parkRideSort}
                          onChange={(event) => {
                            setParkRideSort(event.target.value as ParkRideSort);
                          }}
                        >
                          <option value="name">Name</option>
                          <option value="opening_year">Opening year</option>
                          <option value="speed_kmh">Top speed</option>
                        </select>
                      </div>
                    </div>
                    <div className="catalog-state-row">
                      {parkRidesStatus.state === "success" ? (
                        <span className="catalog-chip">
                          {formatCountLabel(parkRidesStatus.rides.length, "visible ride")}
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
                          Clear filters
                        </button>
                      ) : null}
                    </div>
                  </div>
                  {parkRidesStatus.state === "loading" ? (
                    <div className="state-message state-message-loading">
                      <p>Loading rides...</p>
                    </div>
                  ) : null}
                  {parkRidesStatus.state === "success" ? (
                    parkRidesStatus.rides.length > 0 ? (
                      <div className="rides-list">
                        {parkRidesStatus.rides.map((ride) => {
                          const rideEditorial = rideEditorialBySlug[ride.slug];

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
                                <div className="ride-card-chips">
                                  {riddenRideIds?.has(ride.id) ? (
                                    <span className="catalog-chip catalog-chip-ridden">
                                      Ridden
                                    </span>
                                  ) : null}
                                  <span className="catalog-chip">{ride.status}</span>
                                </div>
                              </div>
                              {rideEditorial ? (
                                <p className="card-summary">{rideEditorial.summary}</p>
                              ) : null}
                              <div className="ride-facts-row">
                                {rideEditorial?.cues.slice(0, 1).map((cue) => (
                                  <span className="ride-fact-pill ride-fact-pill-accent" key={cue}>
                                    {cue}
                                  </span>
                                ))}
                                <span className="ride-fact-pill">{ride.rideType}</span>
                                {ride.manufacturer ? (
                                  <span className="ride-fact-pill">{ride.manufacturer}</span>
                                ) : null}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="state-message state-message-empty">
                        <p>
                          {rideTypeFilter || manufacturerFilter
                            ? "No rides match the current filters."
                            : "No rides available yet."}
                        </p>
                        <p>
                          {rideTypeFilter || manufacturerFilter
                            ? "Try clearing one filter or switching the sort order."
                            : "This park has no seeded rides in the current catalog."}
                        </p>
                      </div>
                    )
                  ) : null}
                  {parkRidesStatus.state === "error" ? (
                    <div className="state-message state-message-error">
                      <p>Unable to load rides.</p>
                      <p>{parkRidesStatus.message}</p>
                    </div>
                  ) : null}
                </div>
              </article>
            ) : null}
            {parkDetailStatus.state === "error" ? (
              <div className="state-message state-message-error">
                <p>Unable to load this park.</p>
                <p>{parkDetailStatus.message}</p>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {route.view === "ride" ? (
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
                {rideDetailOrigin === "rides" ? "Back to rides" : "Back to lineup"}
              </button>
            </div>
            {rideDetailStatus.state === "loading" ? (
              <div className="state-message state-message-loading">
                <p>Loading ride details...</p>
              </div>
            ) : null}
            {rideDetailStatus.state === "success" ? (
              <article className="detail-card detail-card-ride">
                <div className="detail-header detail-header-feature">
                  <div>
                    <p className="status-label">Ride</p>
                    <h2 className="detail-title">{rideDetailStatus.ride.name}</h2>
                    <p className="section-copy detail-summary">
                      {rideDetailStatus.park.name}
                    </p>
                    {activeRideEditorial ? (
                      <p className="detail-story">{activeRideEditorial.summary}</p>
                    ) : null}
                    <div className="detail-micro-nav" aria-label="Ride route context">
                      <span className="detail-micro-item">
                        In {rideDetailStatus.park.city}, {rideDetailStatus.park.country}
                      </span>
                      <span className="detail-micro-item">
                        {rideDetailStatus.ride.rideType}
                      </span>
                      {activeRideEditorial?.cues.slice(0, 2).map((cue) => (
                        <span className="detail-micro-item" key={cue}>
                          {cue}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="detail-chip-row">
                    <span className="catalog-chip">{rideDetailStatus.ride.status}</span>
                    {isCurrentRideRidden ? (
                      <span className="catalog-chip catalog-chip-ridden">Ridden</span>
                    ) : null}
                  </div>
                </div>

                <MediaAsset
                  kind="ride"
                  slug={rideDetailStatus.ride.slug}
                  imageUrl={rideDetailStatus.ride.imageUrl}
                  alt={`${rideDetailStatus.ride.name} ride view`}
                  frameClassName="media-frame media-frame-detail"
                  imageClassName="media-image"
                  loading="eager"
                />

                <div className="credit-panel">
                  <div>
                    <p className="status-label">Ride log</p>
                    <p className="credit-copy">
                      {rideCreditsStatus.state === "success"
                        ? isCurrentRideRidden
                          ? "Saved to your ridden list."
                          : "Save this ride to your ridden list."
                        : rideCreditsStatus.state === "error"
                          ? rideCreditsStatus.message
                          : "Checking ride status."}
                    </p>
                  </div>
                  <button
                    className={`credit-button${isCurrentRideRidden ? " credit-button-active" : ""}`}
                    type="button"
                    onClick={() => {
                      void toggleRideCredit(!isCurrentRideRidden);
                    }}
                    disabled={isUpdatingRideCredit || rideCreditsStatus.state !== "success"}
                  >
                    {isUpdatingRideCredit
                      ? "Saving..."
                      : isCurrentRideRidden
                        ? "Remove ride"
                        : "Mark ridden"}
                  </button>
                </div>
                {rideCreditMessage ? (
                  <p className="credit-copy">{rideCreditMessage}</p>
                ) : null}

                <div className="queue-times-panel">
                  <div className="section-row section-row-compact">
                    <div>
                      <p className="status-label">Queue-Times</p>
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
                        {currentRideLiveWait.isOpen === false
                          ? "Closed"
                          : currentRideLiveWait.isOpen === true
                            ? "Open"
                            : "Unknown"}
                      </span>
                    ) : null}
                  </div>

                  <QueueTimesExternalLinks links={rideQueueTimesLinks} />

                  {parkLiveWaitsStatus.state === "loading" ? (
                    <div className="state-message state-message-loading state-message-compact">
                      <p>Loading current wait.</p>
                    </div>
                  ) : currentRideLiveWait ? (
                    <div className="queue-times-summary">
                      <div className="queue-times-summary-copy">
                        <strong className="queue-times-value">
                          {formatLiveWaitLabel(currentRideLiveWait)}
                        </strong>
                        <p className="wait-time-meta">
                          {currentRideLiveWait.sourceLastUpdated
                            ? `Updated ${formatSourceTimeLabel(
                                currentRideLiveWait.sourceLastUpdated
                              )}`
                            : "Current status from Queue-Times."}
                        </p>
                      </div>
                    </div>
                  ) : parkLiveWaitsStatus.state === "error" ? (
                    <div className="state-message state-message-error state-message-compact">
                      <p>Current wait unavailable right now.</p>
                      <p>{parkLiveWaitsStatus.message}</p>
                    </div>
                  ) : rideDetailStatus.rideQueueTimes ? (
                    <div className="state-message state-message-empty state-message-compact">
                      <p>No live Queue-Times update is available for this ride.</p>
                    </div>
                  ) : (
                    <div className="state-message state-message-empty state-message-compact">
                      <p>This ride is not linked to Queue-Times yet.</p>
                    </div>
                  )}

                  <QueueTimesAttribution />
                </div>

                <div className="lineup-nav-panel">
                  <div>
                    <p className="status-label">Ride order</p>
                    <p className="credit-copy">
                      {rideLineupStatus.state === "success"
                        ? rideLineupPositionLabel || "Ride lineup"
                        : rideLineupStatus.state === "loading"
                          ? "Loading ride order."
                          : rideLineupStatus.state === "error"
                            ? rideLineupStatus.message
                            : "Ride order unavailable."}
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
                      Previous ride
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
                      Next ride
                    </button>
                  </div>
                </div>

                <div className="detail-specs">
                  <div className="section-row section-row-compact">
                    <div>
                      <p className="status-label">Ride facts</p>
                    </div>
                  </div>
                  <div className="detail-grid">
                    {rideSpecItems.map((item) => (
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
                <p>Unable to load this ride.</p>
                <p>{rideDetailStatus.message}</p>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </main>
  );
}

function catalogStateChip(status: ParksStatus | RidesCatalogStatus) {
  if (status.state === "success") {
    return `${"rides" in status ? status.rides.length : status.parks.length} results`;
  }

  if (status.state === "loading") {
    return null;
  }

  return "Catalog unavailable";
}

export default App;

