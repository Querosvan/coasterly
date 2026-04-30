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
  RideCatalogOptionsResponse,
  RideSort,
  Ride,
  RideCreditMutationResponse,
  RideCreditsResponse,
  RideResponse,
  RidesResponse,
  UserProfileResponse,
  UserProgressionResponse
} from "@coasterly/types";

import {
  curatedCollectionsEs,
  formatCountLabel,
  formatDateLabel,
  formatLiveWaitLabel,
  formatStatusLabel,
  formatTimeLabel,
  formatWaitStateLabel,
  getInitialLocale,
  journalTeasersEs,
  localeLabels,
  localeStorageKey,
  messages,
  normalizeLocale,
  parkEditorialBySlugEs,
  queueTimesAttribution,
  rideEditorialBySlugEs,
  translateCue,
  type Locale
} from "./i18n";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const brandLogoDark = "/brand/coasterly-logo-horizontal-dark.png";
const brandIconDark = "/brand/coasterly-logo-icon-dark.png";
const placeholderImageHost = "placehold.co";
const queueTimesAttributionUrl = "https://queue-times.com/";

const journalTeasers = [
  {
    category: "Guide",
    title: "Park-planning notes",
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
  itemSlugs: readonly string[];
};

type UiCopy = (typeof messages)[Locale];

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

const formatParkLocation = (park: Pick<Park, "country" | "city">) =>
  park.city ? `${park.city}, ${park.country}` : park.country;

const browsePageSize = 24;
const fullCatalogFetchLimit = 5000;
const defaultCatalogPage = 1;

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

const formatDecimalValue = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

const titleCase = (value: string) =>
  value.replace(/\b\w/g, (match) => match.toUpperCase());

const rideTypeDisplayLabels: Record<Locale, Record<string, string>> = {
  en: {
    coaster: "Coaster",
    "steel coaster": "Steel coaster",
    "launch coaster": "Launch coaster",
    "wood coaster": "Wooden coaster",
    "wooden coaster": "Wooden coaster",
    "dark ride": "Dark ride",
    "water ride": "Water ride",
    "family ride": "Family ride",
    "thrill ride": "Thrill ride",
    "flying coaster": "Flying coaster",
    "inverted coaster": "Inverted coaster",
    "mine train coaster": "Mine train coaster",
    "indoor coaster": "Indoor coaster",
    "dive coaster": "Dive coaster",
    "hybrid coaster": "Hybrid coaster",
    "mega coaster": "Mega coaster",
    "hyper coaster": "Hyper coaster",
    "sit-down coaster": "Sit-down coaster",
    "wing coaster": "Wing coaster"
  },
  es: {
    coaster: "Montaña rusa",
    "steel coaster": "Montaña rusa de acero",
    "launch coaster": "Montaña rusa lanzada",
    "wood coaster": "Montaña rusa de madera",
    "wooden coaster": "Montaña rusa de madera",
    "dark ride": "Dark ride",
    "water ride": "Atracción acuática",
    "family ride": "Atracción familiar",
    "thrill ride": "Atracción intensa",
    "flying coaster": "Flying coaster",
    "inverted coaster": "Montaña rusa invertida",
    "mine train coaster": "Mine train",
    "indoor coaster": "Montaña rusa indoor",
    "dive coaster": "Dive coaster",
    "hybrid coaster": "Montaña rusa híbrida",
    "mega coaster": "Mega coaster",
    "hyper coaster": "Hyper coaster",
    "sit-down coaster": "Sit-down coaster",
    "wing coaster": "Wing coaster"
  }
};

const genericRideTypeValues = new Set(["", "ride", "attraction", "attractions"]);

const formatRideTypeDisplay = (locale: Locale, rideType?: string | null) => {
  const normalizedRideType = rideType?.trim().toLowerCase() ?? "";

  if (genericRideTypeValues.has(normalizedRideType)) {
    return null;
  }

  return (
    rideTypeDisplayLabels[locale][normalizedRideType] ??
    (rideType ? titleCase(rideType.trim()) : null)
  );
};

const getParkCardMetric = (
  locale: Locale,
  copy: UiCopy,
  park: Pick<Park, "status">,
  parkProgress?: { riddenRides: number; completionPercentage: number }
) => {
  if (parkProgress && parkProgress.riddenRides > 0) {
    return {
      label: copy.home.progressLabel,
      value: `${parkProgress.completionPercentage}%`
    };
  }

  return {
    label: copy.park.status,
    value: formatStatusLabel(locale, park.status)
  };
};

const getRideCardMeta = (
  locale: Locale,
  copy: UiCopy,
  ride: Pick<Ride, "rideType" | "manufacturer" | "openingYear" | "speedKmh">
) => {
  const rideTypeDisplay = formatRideTypeDisplay(locale, ride.rideType);

  if (rideTypeDisplay && ride.manufacturer) {
    return `${rideTypeDisplay} · ${ride.manufacturer}`;
  }

  if (rideTypeDisplay) {
    return rideTypeDisplay;
  }

  if (ride.manufacturer && ride.openingYear !== undefined) {
    return `${ride.manufacturer} · ${ride.openingYear}`;
  }

  if (ride.manufacturer) {
    return ride.manufacturer;
  }

  if (ride.openingYear !== undefined && ride.speedKmh !== undefined) {
    return `${ride.openingYear} · ${formatDecimalValue(ride.speedKmh)} km/h`;
  }

  if (ride.speedKmh !== undefined) {
    return `${copy.browse.topSpeed} · ${formatDecimalValue(ride.speedKmh)} km/h`;
  }

  if (ride.openingYear !== undefined) {
    return `${copy.ride.openingYear} · ${ride.openingYear}`;
  }

  return formatRideTypeDisplay(locale, ride.rideType) ?? copy.ride.rideFacts;
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
  | { state: "success"; parks: Park[]; pageInfo?: ParksResponse["pageInfo"] }
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
  | {
      state: "success";
      rides: RideCatalogItem[];
      pageInfo?: RideCatalogResponse["pageInfo"];
    }
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

const getCatalogPageFromUrl = (search: string) => {
  const rawValue = new URLSearchParams(search).get("page");
  const parsedValue = rawValue ? Number.parseInt(rawValue, 10) : Number.NaN;

  return Number.isFinite(parsedValue) && parsedValue >= 1
    ? parsedValue
    : defaultCatalogPage;
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

function QueueTimesAttribution({
  locale,
  copy
}: {
  locale: Locale;
  copy: UiCopy;
}) {
  return (
    <p className="source-note">
      {copy.common.source}:{" "}
      <a href={queueTimesAttributionUrl} target="_blank" rel="noreferrer">
        {queueTimesAttribution[locale]}
      </a>
    </p>
  );
}

function ProgressionPanel({
  userProgressionStatus,
  locale,
  copy
}: {
  userProgressionStatus: UserProgressionStatus;
  locale: Locale;
  copy: UiCopy;
}) {
  if (userProgressionStatus.state === "loading") {
    return (
      <div className="state-message state-message-loading">
        <p>{copy.progression.loadingMissions}</p>
      </div>
    );
  }

  if (userProgressionStatus.state === "error") {
    return (
      <div className="state-message state-message-error">
        <p>{copy.progression.unableLoadMissions}</p>
        <p>{userProgressionStatus.message}</p>
      </div>
    );
  }

  return (
    <div className="progression-panel">
      <div className="progression-section">
        <div className="section-row section-row-compact">
          <div>
            <p className="status-label">{copy.progression.activeMissions}</p>
          </div>
          <span className="catalog-chip">
            {formatCountLabel(locale, userProgressionStatus.activeMissions.length, "mission")}
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
            <p className="status-label">{copy.progression.recentBadges}</p>
          </div>
          <span className="catalog-chip catalog-chip-ridden">
            {formatCountLabel(locale, userProgressionStatus.badges.length, "badge")}
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
                  {copy.progression.earnedOn(formatDateLabel(locale, badge.earnedAt))}
                </span>
              </article>
            ))
          ) : (
            <div className="state-message state-message-empty state-message-compact">
              <p>{copy.progression.emptyBadges}</p>
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
  onCopyPublicProfile,
  locale,
  copy
}: {
  profile: UserProfileResponse;
  isCurrentUser: boolean;
  onOpenPark: (parkSlug: string) => void;
  onOpenRide: (parkSlug: string, rideSlug: string) => void;
  onOpenPublicProfile?: (userSlug: string) => void;
  onCopyPublicProfile?: (userSlug: string) => void;
  locale: Locale;
  copy: UiCopy;
}) {
  const showProfileActions =
    isCurrentUser && (onOpenPublicProfile !== undefined || onCopyPublicProfile !== undefined);

  return (
    <div className="profile-layout">
      <section className="profile-hero">
        <div className="profile-hero-copy">
          <h3 className="section-title">{profile.user.name}</h3>
          <div className="profile-identity-strip" aria-label={copy.profile.progressionLabel}>
            <span className="ride-fact-pill ride-fact-pill-accent">
              {copy.profile.level(profile.identity.level)}
            </span>
            <span className="ride-fact-pill">{copy.profile.xp(profile.identity.totalXp)}</span>
            <span className="ride-fact-pill">
              {copy.profile.streak(profile.identity.currentStreak)}
            </span>
            <span className="ride-fact-pill">
              {copy.profile.completedChallenges(profile.identity.completedDays)}
            </span>
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
                {copy.profile.viewPublicPage}
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
                {copy.profile.copyLink}
              </button>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="stats-panel" aria-label={copy.profile.title}>
        <div className="stats-grid">
          <article className="stats-card">
            <span className="stats-card-label">{copy.profile.ridesLabel}</span>
            <strong className="stats-card-value">{profile.totalRiddenRides}</strong>
          </article>
          <article className="stats-card">
            <span className="stats-card-label">{copy.profile.parksLabel}</span>
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
                {copy.park.riddenOutOf(park.riddenRides, park.totalRides)}
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

      <section className="stats-panel" aria-label={copy.profile.progressionLabel}>
        <ProgressionPanel
          userProgressionStatus={{
            state: "success",
            userName: profile.user.name,
            badges: profile.badges,
            activeMissions: profile.activeMissions
          }}
          locale={locale}
          copy={copy}
        />
      </section>

      <section className="catalog-panel nested-panel">
        <div className="catalog-header landing-header">
          <div className="catalog-copy">
            <p className="status-label">{copy.profile.recentActivityLabel}</p>
            <h2 className="section-title">{copy.profile.latestCredits}</h2>
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
                  <span className="badge-earned-at">{formatDateLabel(locale, entry.riddenAt)}</span>
                  <button
                    className="catalog-inline-button"
                    type="button"
                    onClick={() => {
                      onOpenRide(entry.parkSlug, entry.rideSlug);
                    }}
                  >
                    {copy.profile.openRide}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="state-message state-message-empty">
            <p>{copy.profile.noRecentCredits}</p>
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
  onOpenRide,
  locale,
  copy
}: {
  profile: CommunityHighlightsResponse["profiles"][number];
  onOpenProfile: (userSlug: string) => void;
  onOpenPark: (parkSlug: string) => void;
  onOpenRide: (parkSlug: string, rideSlug: string) => void;
  locale: Locale;
  copy: UiCopy;
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
              {copy.community.featuredParkProgress(
                profile.featuredPark.completionPercentage,
                profile.featuredPark.parkName
              )}
            </button>
          ) : null}
        </div>
      </div>

      <div className="community-card-stats">
        <span className="ride-fact-pill ride-fact-pill-accent">
          {copy.profile.level(profile.identity.level)}
        </span>
        <span className="ride-fact-pill">{copy.profile.streak(profile.identity.currentStreak)}</span>
        <span className="ride-fact-pill">
          {formatCountLabel(locale, profile.totalRiddenRides, "riddenRide")}
        </span>
        <span className="ride-fact-pill">
          {formatCountLabel(locale, profile.totalParksWithRiddenRides, "park")}
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
                {entry.parkName} / {formatDateLabel(locale, entry.riddenAt)}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div className="state-message state-message-empty state-message-compact">
          <p>{copy.community.noRecentActivity}</p>
        </div>
      )}
    </article>
  );
}

function CommunityRankingCard({
  kind,
  title,
  summary,
  profiles,
  onOpenProfile,
  locale,
  copy
}: {
  kind: "level" | "streak" | "recent";
  title: string;
  summary: string;
  profiles: CommunityHighlightsResponse["profiles"];
  onOpenProfile: (userSlug: string) => void;
  locale: Locale;
  copy: UiCopy;
}) {
  return (
    <article className="community-ranking-card">
      <div className="community-ranking-copy">
        <p className="status-label">{copy.rankings.label}</p>
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
                {kind === "level"
                  ? copy.rankings.levelValue(
                      profile.identity.level,
                      profile.identity.totalXp
                    )
                  : kind === "streak"
                    ? copy.rankings.streakValue(profile.identity.currentStreak)
                    : profile.recentActivity[0]
                      ? copy.rankings.recentValue(
                          profile.recentActivity[0].rideName,
                          profile.recentActivity[0].parkName
                        )
                      : formatCountLabel(locale, profile.totalRiddenRides, "riddenRide")}
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
  onOpenRide,
  locale,
  copy
}: {
  dailyChallengeStatus: DailyChallengeStatus;
  isSubmitting: boolean;
  isClaimingReward: boolean;
  onAnswer: (optionId: string) => void;
  onClaimReward: () => void;
  onOpenRide: (parkSlug: string, rideSlug: string) => void;
  locale: Locale;
  copy: UiCopy;
}) {
  if (dailyChallengeStatus.state === "loading") {
    return (
      <section className="stats-panel" aria-label={copy.daily.title}>
        <div className="state-message state-message-loading">
          <p>{copy.daily.loading}</p>
        </div>
      </section>
    );
  }

  if (dailyChallengeStatus.state === "error") {
    return (
      <section className="stats-panel" aria-label={copy.daily.title}>
        <div className="state-message state-message-error">
          <p>{copy.daily.error}</p>
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
    <section className="stats-panel daily-challenge-panel" aria-label={copy.daily.title}>
      <div className="section-row">
        <div>
          <p className="status-label">{copy.daily.today}</p>
          <h2 className="section-title">{copy.daily.title}</h2>
        </div>
        <div className="detail-chip-row">
          <span className="catalog-chip">{copy.daily.level(summary.level)}</span>
          <span className="catalog-chip catalog-chip-ridden">{copy.daily.xp(summary.totalXp)}</span>
          <span className="catalog-chip route-chip">{copy.daily.streak(summary.currentStreak)}</span>
          <button
            className={`catalog-inline-button${canClaimReward ? " catalog-inline-button-accent" : ""}`}
            type="button"
            disabled={!canClaimReward || isClaimingReward}
            onClick={onClaimReward}
          >
            {canClaimReward
              ? isClaimingReward
                ? copy.daily.claiming
                : copy.daily.claimXp(reward.availableXp)
              : copy.daily.claimedXp(reward.claimedXp)}
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
            {copy.daily.openRide}
          </button>
        </div>

        <div className="daily-challenge-copy">
          <p className="status-label">{challenge.title}</p>
          <h3 className="section-title">{challenge.prompt}</h3>

          <div className={`state-message state-message-compact daily-challenge-feedback ${resultTone}`}>
            <p>
              {attempt
                ? attempt.isCorrect
                  ? copy.daily.correct(attempt.earnedXp)
                  : copy.daily.locked(attempt.earnedXp)
                : copy.daily.idle}
            </p>
            <p>
              {canClaimReward
                ? copy.daily.rewardAvailable(reward.availableXp)
                : copy.daily.rewardClaimed(
                    reward.claimedAt ? formatDateLabel(locale, reward.claimedAt) : undefined
                  )}
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
                      {isCorrect
                        ? locale === "es"
                          ? "Respuesta"
                          : "Answer"
                        : isSelected
                          ? locale === "es"
                            ? "Tu opci\u00f3n"
                            : "Your pick"
                          : ""}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <p className="catalog-note">{copy.daily.completed(summary.completedDays)}</p>
        </div>
      </div>
    </section>
  );
}

type CuratedCollectionCardProps = {
  collection: CuratedCollection;
  isActive?: boolean;
  onOpen: () => void;
  locale: Locale;
  copy: UiCopy;
};

function CuratedCollectionCard({
  collection,
  isActive = false,
  onOpen,
  locale,
  copy
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
          <span className="catalog-chip catalog-chip-ridden">{copy.collections.viewingNow}</span>
        ) : null}
      </div>
      <div className="collection-card-copy">
        <h3>{collection.title}</h3>
        <p>{collection.summary}</p>
      </div>
      <span className="collection-card-meta">
        {copy.collections.insideCollection(
          formatCountLabel(locale, collection.itemSlugs.length, collection.kind)
        )}
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
  const [locale, setLocale] = useState<Locale>(() => getInitialLocale());
  const [rideCatalogSearchQuery, setRideCatalogSearchQuery] = useState(() =>
    getRidesCatalogStateFromUrl(window.location.search).searchQuery
  );
  const [parksStatus, setParksStatus] = useState<ParksStatus>({
    state: "loading"
  });
  const [parksPage, setParksPage] = useState(() =>
    getCatalogPageFromUrl(window.location.search)
  );
  const [ridesCatalogStatus, setRidesCatalogStatus] = useState<RidesCatalogStatus>({
    state: "idle"
  });
  const [ridesCatalogPage, setRidesCatalogPage] = useState(() =>
    getCatalogPageFromUrl(window.location.search)
  );
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
  const copy = messages[locale];
  const localizedJournalTeasers = locale === "es" ? journalTeasersEs : journalTeasers;
  const landingJournalTeasers = localizedJournalTeasers.slice(0, 1);
  const localizedParkEditorialBySlug =
    locale === "es" ? parkEditorialBySlugEs : parkEditorialBySlug;
  const localizedRideEditorialBySlug =
    locale === "es" ? rideEditorialBySlugEs : rideEditorialBySlug;
  const localizedCollections = locale === "es" ? curatedCollectionsEs : curatedCollections;
  const parkCollections = localizedCollections.filter(
    (collection): collection is CuratedCollection & { kind: "park" } => collection.kind === "park"
  );
  const rideCollections = localizedCollections.filter(
    (collection): collection is CuratedCollection & { kind: "ride" } => collection.kind === "ride"
  );
  const landingCollections = [
    localizedCollections.find((collection) => collection.id === "first-time-europe-parks"),
    localizedCollections.find((collection) => collection.id === "best-launches"),
    localizedCollections.find((collection) => collection.id === "parks-with-strong-lineups")
  ].filter((collection): collection is CuratedCollection => Boolean(collection));

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

  useEffect(() => {
    window.localStorage.setItem(localeStorageKey, locale);
    document.documentElement.lang = locale;
  }, [locale]);

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
      setParksPage(getCatalogPageFromUrl(window.location.search));
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
      setRidesCatalogPage(getCatalogPageFromUrl(window.location.search));
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
      } else if (parksPage > defaultCatalogPage) {
        params.set("page", String(parksPage));
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
      } else if (ridesCatalogPage > defaultCatalogPage) {
        params.set("page", String(ridesCatalogPage));
      }
    }

    if (route.view === "park" || route.view === "ride") {
      if (route.view === "park") {
        const catalogParams = getCatalogSearchParams();

        catalogParams.forEach((value, key) => {
          params.set(key, value);
        });
      }

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
        } else if (ridesCatalogPage > defaultCatalogPage) {
          params.set("page", String(ridesCatalogPage));
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
    parksPage,
    ridesCatalogPage,
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
    const shouldPaginateParks = route.view === "parks" && !parkCollectionId;
    const effectiveParkLimit =
      route.view === "parks"
        ? shouldPaginateParks
          ? browsePageSize
          : fullCatalogFetchLimit
        : 24;
    const effectiveParkOffset = shouldPaginateParks
      ? (parksPage - 1) * browsePageSize
      : 0;

    setParksStatus({ state: "loading" });

    const timeoutId = window.setTimeout(() => {
      const loadParks = async () => {
        try {
          const parksUrl = new URL("/parks", apiBaseUrl);

          if (activeSearchQuery) {
            parksUrl.searchParams.set("search", activeSearchQuery);
          }

          parksUrl.searchParams.set("limit", String(effectiveParkLimit));
          parksUrl.searchParams.set("offset", String(effectiveParkOffset));

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
            parks: payload.parks,
            ...(payload.pageInfo ? { pageInfo: payload.pageInfo } : {})
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
  }, [route, searchQuery, parkCollectionId, parksPage]);

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
        const response = await fetch(new URL("/rides/options", apiBaseUrl), {
          signal: controller.signal
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as RideCatalogOptionsResponse;

        setRidesCatalogOptions({
          parks: payload.parks,
          rideTypes: payload.rideTypes,
          manufacturers: payload.manufacturers
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
    const shouldPaginateRides = !rideCollectionId;
    const effectiveRideLimit = shouldPaginateRides
      ? browsePageSize
      : fullCatalogFetchLimit;
    const effectiveRideOffset = shouldPaginateRides
      ? (ridesCatalogPage - 1) * browsePageSize
      : 0;

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
          ridesUrl.searchParams.set("limit", String(effectiveRideLimit));
          ridesUrl.searchParams.set("offset", String(effectiveRideOffset));

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
            rides: payload.rides,
            ...(payload.pageInfo ? { pageInfo: payload.pageInfo } : {})
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
    rideCatalogSort,
    rideCollectionId,
    ridesCatalogPage
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
    } else if (parksPage > defaultCatalogPage) {
      params.set("page", String(parksPage));
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
    } else if (ridesCatalogPage > defaultCatalogPage) {
      params.set("page", String(ridesCatalogPage));
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
    const shouldPreserveParksPage = Boolean(options?.preserveSearch) && !nextCollectionId;
    const nextParksPage = shouldPreserveParksPage ? parksPage : defaultCatalogPage;

    setParksPage(nextParksPage);

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

            if (!nextCollectionId && nextParksPage > defaultCatalogPage) {
              params.set("page", String(nextParksPage));
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
    const shouldPreserveRidesPage = Boolean(options?.preserveFilters) && !nextCollectionId;
    const nextRidesCatalogPage = shouldPreserveRidesPage
      ? ridesCatalogPage
      : defaultCatalogPage;

    setRidesCatalogPage(nextRidesCatalogPage);

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

            if (!nextCollectionId && nextRidesCatalogPage > defaultCatalogPage) {
              params.set("page", String(nextRidesCatalogPage));
            }

            return params;
          })()
        : new URLSearchParams()
    );
  };

  const goToPreviousParksPage = () => {
    setParksPage((currentPage) =>
      currentPage > defaultCatalogPage ? currentPage - 1 : currentPage
    );
  };

  const goToNextParksPage = () => {
    if (parksStatus.state !== "success" || !parksStatus.pageInfo?.hasMore) {
      return;
    }

    setParksPage((currentPage) => currentPage + 1);
  };

  const goToPreviousRidesCatalogPage = () => {
    setRidesCatalogPage((currentPage) =>
      currentPage > defaultCatalogPage ? currentPage - 1 : currentPage
    );
  };

  const goToNextRidesCatalogPage = () => {
    if (ridesCatalogStatus.state !== "success" || !ridesCatalogStatus.pageInfo?.hasMore) {
      return;
    }

    setRidesCatalogPage((currentPage) => currentPage + 1);
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
      setProfileShareMessage(copy.common.copiedPublicProfile);
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

    const params = options?.preserveRideBrowserState
      ? getRideBrowserParams()
      : route.view === "parks"
        ? getCatalogSearchParams()
        : new URLSearchParams();

    navigateWithParams(`/parks/${slug}`, params);
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
      ? formatCountLabel(
          locale,
          parksStatus.pageInfo?.totalCount ?? parksStatus.parks.length,
          "park"
        )
      : copy.route.parkResults;
  const riddenRideCountLabel =
    demoUserStatsStatus.state === "success"
      ? formatCountLabel(locale, demoUserStatsStatus.totalRiddenRides, "riddenRide")
      : demoUserStatsStatus.state === "loading"
        ? copy.browse.loadingResults
        : copy.route.statsUnavailable;
  const riddenParkCountLabel =
    demoUserStatsStatus.state === "success"
      ? formatCountLabel(locale, demoUserStatsStatus.totalParksWithRiddenRides, "park")
      : demoUserStatsStatus.state === "loading"
        ? copy.browse.loadingResults
        : copy.route.statsUnavailable;
  const parkProgressBySlug =
    demoUserStatsStatus.state === "success"
      ? new Map(
          demoUserStatsStatus.parks.map((park) => [park.parkSlug, park])
        )
      : null;
  const riddenRideIds =
    rideCreditsStatus.state === "success" ? new Set(rideCreditsStatus.rideIds) : null;
  const allParks = parksStatus.state === "success" ? parksStatus.parks : [];
  const parksPageInfo = parksStatus.state === "success" ? parksStatus.pageInfo : undefined;
  const selectedParkCollection = parkCollections.find(
    (collection) => collection.id === parkCollectionId
  );
  const displayedParks = selectedParkCollection
    ? allParks.filter((park) => selectedParkCollection.itemSlugs.includes(park.slug))
    : allParks;
  const parkBySlug = new Map(allParks.map((park) => [park.slug, park]));
  const allRideCatalogItems =
    ridesCatalogStatus.state === "success" ? ridesCatalogStatus.rides : [];
  const ridesCatalogPageInfo =
    ridesCatalogStatus.state === "success" ? ridesCatalogStatus.pageInfo : undefined;
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
  const visibleParkCount =
    hasActiveParkCollection || !parksPageInfo
      ? displayedParks.length
      : parksPageInfo.totalCount;
  const visibleRideCatalogCount =
    hasActiveRideCollection || !ridesCatalogPageInfo
      ? displayedRideCatalogItems.length
      : ridesCatalogPageInfo.totalCount;
  const parksTotalPages = parksPageInfo
    ? Math.max(1, Math.ceil(parksPageInfo.totalCount / parksPageInfo.limit))
    : 1;
  const ridesCatalogTotalPages = ridesCatalogPageInfo
    ? Math.max(1, Math.ceil(ridesCatalogPageInfo.totalCount / ridesCatalogPageInfo.limit))
    : 1;
  const parkResultRangeLabel =
    parksPageInfo && visibleParkCount > 0
      ? copy.browse.showing(
          parksPageInfo.offset + 1,
          parksPageInfo.offset + displayedParks.length,
          parksPageInfo.totalCount
        )
      : null;
  const rideResultRangeLabel =
    ridesCatalogPageInfo && visibleRideCatalogCount > 0
      ? copy.browse.showing(
          ridesCatalogPageInfo.offset + 1,
          ridesCatalogPageInfo.offset + displayedRideCatalogItems.length,
          ridesCatalogPageInfo.totalCount
        )
      : null;
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
    ? localizedParkEditorialBySlug[spotlightPark.slug]
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
      ? localizedParkEditorialBySlug[parkDetailStatus.park.slug]
      : undefined;
  const parkQueueTimesReference =
    parkDetailStatus.state === "success" ? parkDetailStatus.queueTimes : undefined;
  const liveWaitSource =
    parkLiveWaitsStatus.state === "success" ? parkLiveWaitsStatus.source : null;
  const hasMappedLiveWaits = liveWaitSource?.state === "mapped";
  const liveWaitRides =
    parkLiveWaitsStatus.state === "success" ? parkLiveWaitsStatus.rides : [];
  const liveWaitByRideId = new Map(liveWaitRides.map((ride) => [ride.rideId, ride]));
  const parkQueueTimesLinks = dedupeExternalLinks(
    parkQueueTimesReference
      ? [
          { label: copy.common.parkWaits, href: parkQueueTimesReference.queueUrl },
          { label: copy.common.parkStats, href: parkQueueTimesReference.statsUrl }
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
      ? localizedRideEditorialBySlug[rideDetailStatus.ride.slug]
      : undefined;
  const showParkQueueTimesSupport =
    parkLiveWaitsStatus.state !== "idle" || parkQueueTimesLinks.length > 0;
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
                  label: copy.common.rideStats,
                  href: rideDetailStatus.rideQueueTimes.statsUrl
                }
              ]
            : []),
          ...(rideDetailStatus.parkQueueTimes
            ? [
                {
                  label: copy.common.parkWaits,
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
        label: copy.ride.parentPark,
        value: rideDetailStatus.park.name,
        wide: true
      },
      {
        label: copy.ride.rideType,
        value: rideDetailStatus.ride.rideType
      }
    );

    if (rideDetailStatus.ride.manufacturer) {
      rideSpecItems.push({
        label: copy.ride.manufacturer,
        value: rideDetailStatus.ride.manufacturer
      });
    }

    if (rideDetailStatus.ride.model) {
      rideSpecItems.push({
        label: copy.ride.model,
        value: rideDetailStatus.ride.model
      });
    }

    if (rideDetailStatus.ride.openingYear !== undefined) {
      rideSpecItems.push({
        label: copy.ride.openingYear,
        value: String(rideDetailStatus.ride.openingYear)
      });
    }

    if (rideDetailStatus.ride.heightM !== undefined) {
      rideSpecItems.push({
        label: copy.ride.height,
        value: `${formatDecimalValue(rideDetailStatus.ride.heightM)} m`
      });
    }

    if (rideDetailStatus.ride.speedKmh !== undefined) {
      rideSpecItems.push({
        label: copy.ride.topSpeed,
        value: `${formatDecimalValue(rideDetailStatus.ride.speedKmh)} km/h`
      });
    }

    if (rideDetailStatus.ride.inversions !== undefined) {
      rideSpecItems.push({
        label: copy.ride.inversions,
        value: String(rideDetailStatus.ride.inversions)
      });
    }
  }

  const parksSearchLabel = hasActiveCatalogSearch
    ? copy.route.search(normalizedSearchQuery)
    : copy.route.allParks;
  const ridesSearchLabel = hasActiveRideCatalogSearch
    ? copy.route.search(normalizedRideCatalogSearchQuery)
    : copy.route.allRides;
  const routeBarTitle =
    route.view === "parks"
      ? parksSearchLabel
      : route.view === "rides"
        ? ridesSearchLabel
      : route.view === "discover"
        ? copy.discover.label
        : route.view === "profile"
          ? copy.profile.title
        : route.view === "user-profile"
          ? userProfileStatus.state === "success"
            ? userProfileStatus.profile.user.name
            : route.slug
        : route.view === "journal"
          ? copy.nav.journal
          : route.view === "park"
            ? parkDetailStatus.state === "success"
              ? parkDetailStatus.park.name
              : route.slug
            : route.view === "ride"
              ? rideDetailStatus.state === "success"
                ? rideDetailStatus.ride.name
                : route.rideSlug
              : copy.nav.home;
  const routeBarLabel =
    route.view === "parks"
      ? copy.route.parksBrowse
      : route.view === "rides"
        ? copy.route.ridesBrowse
      : route.view === "discover"
        ? copy.route.discovery
        : route.view === "profile"
          ? copy.route.profile
        : route.view === "user-profile"
          ? copy.route.publicProfile
        : route.view === "journal"
          ? copy.route.journal
          : route.view === "park"
            ? copy.route.parkDetail
            : route.view === "ride"
              ? copy.route.rideDetail
              : copy.route.landing;
  const breadcrumbItems: BreadcrumbItem[] =
    route.view === "parks"
      ? [
          { label: copy.nav.parks },
          { label: parksSearchLabel }
        ]
      : route.view === "rides"
        ? [
            { label: copy.nav.rides },
            { label: ridesSearchLabel }
          ]
        : route.view === "discover"
        ? [{ label: copy.nav.discover }]
        : route.view === "profile"
          ? [{ label: copy.nav.profile }]
        : route.view === "user-profile"
          ? [
              {
                label: copy.nav.profile,
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
          ? [{ label: copy.nav.journal }]
          : route.view === "park"
            ? [
                {
                  label: copy.nav.parks,
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
                          label: copy.nav.rides,
                          href: buildPathWithQuery("/rides", getRidesCatalogParams()),
                          onClick: () => {
                            navigateToRides({ preserveFilters: true });
                          }
                        }
                      ]
                    : [
                        {
                          label: copy.nav.parks,
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
          catalogStateChip(locale, copy, parksStatus),
          hasActiveCatalogSearch ? copy.route.search(normalizedSearchQuery) : copy.route.browse
        ].filter(Boolean)
      : route.view === "rides"
        ? [
            catalogStateChip(locale, copy, ridesCatalogStatus),
            rideCatalogParkFilter
              ? ridesCatalogOptions.parks.find((park) => park.slug === rideCatalogParkFilter)?.name ??
                rideCatalogParkFilter
              : copy.browse.allParks
          ].filter(Boolean)
      : route.view === "discover"
        ? [heroCountLabel, riddenRideCountLabel]
      : route.view === "profile"
        ? userProfileStatus.state === "success"
          ? [
              copy.profile.level(userProfileStatus.profile.identity.level),
              copy.profile.streak(userProfileStatus.profile.identity.currentStreak)
            ]
          : [riddenRideCountLabel, riddenParkCountLabel]
      : route.view === "user-profile"
        ? userProfileStatus.state === "success"
          ? [
              copy.profile.level(userProfileStatus.profile.identity.level),
              formatCountLabel(locale, userProfileStatus.profile.totalRiddenRides, "riddenRide")
            ]
          : [copy.route.publicProfile]
      : route.view === "journal"
          ? [copy.route.comingSoon]
          : route.view === "park"
            ? [
                activeParkProgress
                  ? copy.park.riddenOutOf(
                      activeParkProgress.riddenRides,
                      activeParkProgress.totalRides
                    )
                  : copy.route.parkDetail
              ]
            : route.view === "ride"
              ? [
                  rideDetailStatus.state === "success"
                    ? `${rideDetailStatus.park.name} ${locale === "es" ? "lineup" : "lineup"}`
                    : copy.route.rideDetail,
                  rideLineupPositionLabel
                ].filter(Boolean)
              : [];
  const topNavigation = [
    {
      label: copy.nav.home,
      href: "/",
      active: route.view === "home",
      onClick: navigateHome
    },
    {
      label: copy.nav.parks,
      href: "/parks",
      active:
        route.view === "parks" ||
        route.view === "park" ||
        (route.view === "ride" && rideDetailOrigin !== "rides"),
      onClick: () => {
        navigateToParks();
      }
    },
    {
      label: copy.nav.rides,
      href: "/rides",
      active: route.view === "rides" || (route.view === "ride" && rideDetailOrigin === "rides"),
      onClick: () => {
        navigateToRides();
      }
    },
    {
      label: copy.nav.discover,
      href: "/discover",
      active: route.view === "discover",
      onClick: navigateToDiscover
    },
    {
      label: copy.nav.profile,
      href: "/profile",
      active: route.view === "profile" || route.view === "user-profile",
      onClick: navigateToProfile
    },
    {
      label: copy.nav.journal,
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
            {copy.nav.menu}
          </button>
        </div>
        <nav className="topbar-nav" id="primary-navigation" aria-label={copy.nav.menu}>
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
          <div className="language-switcher" aria-label={copy.nav.language}>
            {(Object.keys(localeLabels) as Locale[]).map((nextLocale) => (
              <button
                key={nextLocale}
                className={`language-button${locale === nextLocale ? " language-button-active" : ""}`}
                type="button"
                onClick={() => {
                  setLocale(nextLocale);
                }}
              >
                {localeLabels[nextLocale]}
              </button>
            ))}
          </div>
          <div className="status-cluster" aria-live="polite">
            {apiStatus.state === "error" ? (
              <span className="status-chip status-chip-error">{copy.common.serviceIssue}</span>
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
              <h1>{copy.home.heroTitle}</h1>
              <p className="hero-text">{copy.home.heroText}</p>
              <div className="hero-actions">
                <button className="primary-button" type="button" onClick={() => {
                  navigateToParks({ preserveSearch: true });
                }}>
                  {copy.home.browseParks}
                </button>
                <button className="secondary-button" type="button" onClick={navigateToProfile}>
                  {copy.home.openProfile}
                </button>
              </div>
              <div className="hero-stats" aria-label="Catalog summary">
                <div className="hero-stat">
                  <span className="hero-stat-label">{copy.home.parksStat}</span>
                  <strong>{heroCountLabel}</strong>
                </div>
                <div className="hero-stat">
                  <span className="hero-stat-label">{copy.home.riddenStat}</span>
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
                      <span className="catalog-chip">
                        {getParkCardMetric(locale, copy, spotlightPark, spotlightProgress).value}
                      </span>
                    </div>
                    <p className="eyebrow">{copy.home.featuredPark}</p>
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
                    <p className="eyebrow">{copy.home.featuredPark}</p>
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

          <section className="landing-grid">
            <section className="catalog-panel landing-panel">
              <div className="catalog-header landing-header">
                <div className="catalog-copy">
                  <p className="status-label">{copy.home.featuredLabel}</p>
                  <h2 className="section-title">{copy.home.featuredTitle}</h2>
                </div>
                <div className="landing-actions">
                  <button
                    className="catalog-inline-button"
                    type="button"
                    onClick={() => {
                      navigateToParks({ preserveSearch: true });
                    }}
                  >
                    {copy.home.browseParks}
                  </button>
                </div>
              </div>
              <div className="parks-list parks-list-featured">
                {landingFeaturedParks.map((park) => {
                  const parkProgress = parkProgressBySlug?.get(park.slug);
                  const parkEditorial = localizedParkEditorialBySlug[park.slug];
                  const parkMetric = getParkCardMetric(locale, copy, park, parkProgress);

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
                      <p className="card-key-stat">
                        <span className="card-stat-label">{parkMetric.label}</span>
                        <strong className="card-stat-value">{parkMetric.value}</strong>
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="catalog-panel landing-panel">
              <div className="catalog-header landing-header">
                <div className="catalog-copy">
                  <p className="status-label">{copy.home.progressLabel}</p>
                  <h2 className="section-title">{copy.home.progressTitle}</h2>
                </div>
                <div className="landing-actions">
                  <button className="catalog-inline-button" type="button" onClick={navigateToDiscover}>
                    {copy.home.seeProgress}
                  </button>
                </div>
              </div>
              {demoUserStatsStatus.state === "success" ? (
                <div className="stats-panel stats-panel-compact" aria-label="Ride progress">
                  <div className="stats-grid">
                    <article className="stats-card">
                      <span className="stats-card-label">{copy.profile.ridesLabel}</span>
                      <strong className="stats-card-value">
                        {demoUserStatsStatus.totalRiddenRides}
                      </strong>
                    </article>
                    <article className="stats-card">
                      <span className="stats-card-label">{copy.profile.parksLabel}</span>
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
                          {copy.park.riddenOutOf(park.riddenRides, park.totalRides)}
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
                  <ProgressionPanel
                    userProgressionStatus={userProgressionStatus}
                    locale={locale}
                    copy={copy}
                  />
                </div>
              ) : demoUserStatsStatus.state === "loading" ? (
                <div className="state-message state-message-loading">
                  <p>{copy.browse.loadingResults}</p>
                </div>
              ) : (
                <div className="state-message state-message-error">
                  <p>{copy.progression.unableLoadMissions}</p>
                  <p>{demoUserStatsStatus.message}</p>
                </div>
              )}
            </section>
          </section>

          <section className="catalog-panel landing-panel">
            <div className="catalog-header landing-header">
                <div className="catalog-copy">
                  <p className="status-label">{copy.home.collectionsLabel}</p>
                  <h2 className="section-title">{copy.home.collectionsTitle}</h2>
                </div>
              </div>
            <div className="collection-grid">
              {landingCollections.map((collection) => (
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

          <DailyChallengePanel
            dailyChallengeStatus={dailyChallengeStatus}
            isSubmitting={isSubmittingDailyChallenge}
            isClaimingReward={isClaimingDailyReward}
            onAnswer={submitDailyChallengeAnswer}
            onClaimReward={claimDailyReward}
            locale={locale}
            copy={copy}
            onOpenRide={(parkSlug, rideSlug) => {
              navigateToRide(parkSlug, rideSlug);
            }}
          />

          <section className="catalog-panel landing-panel">
              <div className="catalog-header landing-header">
                <div className="catalog-copy">
                  <p className="status-label">{copy.home.communityLabel}</p>
                  <h2 className="section-title">{copy.home.communityTitle}</h2>
                </div>
                <div className="landing-actions">
                  <button className="catalog-inline-button" type="button" onClick={navigateToDiscover}>
                    {copy.home.seeMore}
                  </button>
                </div>
              </div>
            {communityHighlightsStatus.state === "loading" ? (
              <div className="state-message state-message-loading state-message-compact">
                <p>{copy.community.loadingActivity}</p>
              </div>
            ) : null}
            {communityHighlightsStatus.state === "success" ? (
              landingCommunityHighlights.length > 0 ? (
                <div className="community-grid">
                  {landingCommunityHighlights.map((profile) => (
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
                  <p>{copy.home.noPublicActivity}</p>
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

          <section className="catalog-panel editorial-panel">
            <div className="catalog-header landing-header">
                <div className="catalog-copy">
                  <p className="status-label">{copy.home.journalLabel}</p>
                  <h2 className="section-title">{copy.home.journalTitle}</h2>
                </div>
                <div className="landing-actions">
                  <button className="catalog-inline-button" type="button" onClick={navigateToJournal}>
                    {copy.home.readJournal}
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
              <p className="status-label">{copy.browse.browse}</p>
              <h2 className="section-title">{copy.browse.parksTitle}</h2>
            </div>
          </div>

          <div className="collection-strip" aria-label={copy.home.collectionsTitle}>
            {parkCollections.map((collection) => (
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
                  {displayedParks.map((park) => {
                    const parkProgress = parkProgressBySlug?.get(park.slug);
                    const parkEditorial = localizedParkEditorialBySlug[park.slug];
                    const parkMetric = getParkCardMetric(locale, copy, park, parkProgress);

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
                        <p className="card-key-stat">
                          <span className="card-stat-label">{parkMetric.label}</span>
                          <strong className="card-stat-value">{parkMetric.value}</strong>
                        </p>
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
      ) : null}

      {route.view === "rides" ? (
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
                  setIsRideFiltersOpen((isOpen) => !isOpen);
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
                  {ridesCatalogOptions.parks.map((park) => (
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
                  {ridesCatalogOptions.rideTypes.map((rideType) => (
                    <option key={rideType} value={rideType}>
                      {rideType}
                    </option>
                  ))}
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
                <div className="rides-list rides-list-catalog">
                  {displayedRideCatalogItems.map((entry) => {
                    const rideEditorial = localizedRideEditorialBySlug[entry.ride.slug];
                    const isRidden = riddenRideIds?.has(entry.ride.id) === true;
                    const rideMeta = getRideCardMeta(locale, copy, entry.ride);

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
                        </div>
                        {rideEditorial ? (
                          <p className="card-summary">{rideEditorial.summary}</p>
                        ) : null}
                        <p className="card-meta-line">{rideMeta}</p>
                        {entry.ride.status !== "operating" ? (
                          <p className="card-support-line">
                            {formatStatusLabel(locale, entry.ride.status)}
                          </p>
                        ) : null}
                      </button>
                    );
                  })}
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
      ) : null}

      {route.view === "discover" ? (
        <section className="catalog-panel browse-panel" aria-live="polite">
          <div className="catalog-header">
            <div className="catalog-copy">
              <p className="status-label">{copy.discover.label}</p>
              <h2 className="section-title">{copy.discover.title}</h2>
            </div>
          </div>

          <DailyChallengePanel
            dailyChallengeStatus={dailyChallengeStatus}
            isSubmitting={isSubmittingDailyChallenge}
            isClaimingReward={isClaimingDailyReward}
            onAnswer={submitDailyChallengeAnswer}
            onClaimReward={claimDailyReward}
            locale={locale}
            copy={copy}
            onOpenRide={(parkSlug, rideSlug) => {
              navigateToRide(parkSlug, rideSlug);
            }}
          />

          {demoUserStatsStatus.state === "success" ? (
            <section className="stats-panel" aria-label={copy.discover.rideProgress}>
              <div className="section-row">
                <div>
                  <p className="status-label">{copy.discover.rideProgress}</p>
                </div>
                <button className="catalog-inline-button" type="button" onClick={() => {
                  navigateToParks({ preserveSearch: true });
                }}>
                  {copy.discover.browseParks}
                </button>
              </div>
              <div className="stats-grid">
                <article className="stats-card">
                  <span className="stats-card-label">{copy.profile.ridesLabel}</span>
                  <strong className="stats-card-value">
                    {demoUserStatsStatus.totalRiddenRides}
                  </strong>
                </article>
                <article className="stats-card">
                  <span className="stats-card-label">{copy.profile.parksLabel}</span>
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
                      {copy.park.riddenOutOf(park.riddenRides, park.totalRides)}
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
              <ProgressionPanel
                userProgressionStatus={userProgressionStatus}
                locale={locale}
                copy={copy}
              />
            </section>
          ) : null}

          <section className="catalog-panel nested-panel">
            <div className="catalog-header landing-header">
              <div className="catalog-copy">
                <p className="status-label">{copy.discover.collectionsLabel}</p>
                <h2 className="section-title">{copy.discover.collectionsTitle}</h2>
              </div>
            </div>
            <div className="collection-grid">
              {localizedCollections.map((collection) => (
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

          <section className="catalog-panel nested-panel">
            <div className="catalog-header landing-header">
              <div className="catalog-copy">
                <p className="status-label">Ranked now</p>
                <h2 className="section-title">A quicker read on active riders.</h2>
              </div>
            </div>
            {communityHighlightsStatus.state === "loading" ? (
              <div className="state-message state-message-loading state-message-compact">
                <p>{copy.discover.rankingsLoading}</p>
              </div>
            ) : null}
            {communityHighlightsStatus.state === "success" ? (
              communityHighlights.length > 0 ? (
                <div className="community-ranking-grid">
                  <CommunityRankingCard
                    kind="level"
                    title={copy.rankings.highestLevelTitle}
                    summary={copy.rankings.highestLevelSummary}
                    profiles={highestLevelProfiles}
                    locale={locale}
                    copy={copy}
                    onOpenProfile={navigateToPublicProfile}
                  />
                  <CommunityRankingCard
                    kind="streak"
                    title={copy.rankings.longestStreakTitle}
                    summary={copy.rankings.longestStreakSummary}
                    profiles={longestStreakProfiles}
                    locale={locale}
                    copy={copy}
                    onOpenProfile={navigateToPublicProfile}
                  />
                  <CommunityRankingCard
                    kind="recent"
                    title={copy.rankings.recentTitle}
                    summary={copy.rankings.recentSummary}
                    profiles={recentlyActiveProfiles}
                    locale={locale}
                    copy={copy}
                    onOpenProfile={navigateToPublicProfile}
                  />
                </div>
              ) : (
                <div className="state-message state-message-empty state-message-compact">
                  <p>{copy.discover.rankingsEmpty}</p>
                </div>
              )
            ) : null}
            {communityHighlightsStatus.state === "error" ? (
              <div className="state-message state-message-error state-message-compact">
                <p>{copy.discover.rankingsError}</p>
                <p>{communityHighlightsStatus.message}</p>
              </div>
            ) : null}
          </section>

          <section className="catalog-panel nested-panel">
            <div className="catalog-header landing-header">
              <div className="catalog-copy">
                <p className="status-label">{copy.discover.featuredLabel}</p>
                <h2 className="section-title">{copy.discover.featuredTitle}</h2>
              </div>
            </div>
            <div className="parks-list parks-list-featured">
              {featuredProgressParks.length > 0
                ? featuredProgressParks.map(({ park, progress }) => {
                    const parkEditorial = localizedParkEditorialBySlug[park.slug];
                    const parkMetric = getParkCardMetric(locale, copy, park, progress);

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
                      <p className="card-key-stat">
                        <span className="card-stat-label">{parkMetric.label}</span>
                        <strong className="card-stat-value">{parkMetric.value}</strong>
                      </p>
                    </button>
                    );
                  })
                : featuredParks.map((park) => {
                    const parkEditorial = localizedParkEditorialBySlug[park.slug];
                    const parkMetric = getParkCardMetric(locale, copy, park);

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
                      <p className="card-key-stat">
                        <span className="card-stat-label">{parkMetric.label}</span>
                        <strong className="card-stat-value">{parkMetric.value}</strong>
                      </p>
                    </button>
                    );
                  })}
            </div>
          </section>

          <section className="catalog-panel nested-panel">
            <div className="catalog-header landing-header">
              <div className="catalog-copy">
                <p className="status-label">{copy.discover.communityLabel}</p>
                <h2 className="section-title">{copy.discover.communityTitle}</h2>
              </div>
            </div>
            {communityHighlightsStatus.state === "loading" ? (
              <div className="state-message state-message-loading state-message-compact">
                <p>{copy.community.loadingActivity}</p>
              </div>
            ) : null}
            {communityHighlightsStatus.state === "success" ? (
              communityHighlights.length > 0 ? (
                <div className="community-grid">
                  {communityHighlights.map((profile) => (
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
                  <p>No recent ride activity yet.</p>
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
      ) : null}

      {route.view === "profile" ? (
        <section className="catalog-panel browse-panel" aria-live="polite">
          <div className="catalog-header">
            <div className="catalog-copy">
              <p className="status-label">{copy.nav.profile}</p>
              <h2 className="section-title">{copy.profile.title}</h2>
            </div>
          </div>

          {userProfileStatus.state === "loading" ? (
            <div className="state-message state-message-loading">
              <p>{locale === "es" ? "Cargando perfil..." : "Loading profile..."}</p>
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
                locale={locale}
                copy={copy}
                onOpenRide={(parkSlug, rideSlug) => {
                  navigateToRide(parkSlug, rideSlug);
                }}
              />
              <ProfileSurface
                profile={userProfileStatus.profile}
                isCurrentUser
                locale={locale}
                copy={copy}
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
              <p>{locale === "es" ? "No se puede cargar tu perfil." : "Unable to load your profile."}</p>
              <p>{userProfileStatus.message}</p>
            </div>
          ) : null}
        </section>
      ) : null}

      {route.view === "user-profile" ? (
        <section className="catalog-panel browse-panel" aria-live="polite">
          {userProfileStatus.state === "loading" ? (
            <div className="state-message state-message-loading">
              <p>{locale === "es" ? "Cargando perfil..." : "Loading profile..."}</p>
            </div>
          ) : null}

          {userProfileStatus.state === "success" ? (
            <ProfileSurface
              profile={userProfileStatus.profile}
              isCurrentUser={false}
              locale={locale}
              copy={copy}
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
              <p>{locale === "es" ? "No se puede cargar este perfil." : "Unable to load this profile."}</p>
              <p>{userProfileStatus.message}</p>
            </div>
          ) : null}
        </section>
      ) : null}

      {route.view === "journal" ? (
        <section className="catalog-panel browse-panel" aria-live="polite">
          <div className="catalog-header">
            <div className="catalog-copy">
              <p className="status-label">{copy.nav.journal}</p>
              <h2 className="section-title">{copy.journal.title}</h2>
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
                  {copy.journal.browseParks}
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
                          {copy.ride.rideType}
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
                          {parkRideOptions.rideTypes.map((rideType) => (
                            <option key={rideType} value={rideType}>
                              {rideType}
                            </option>
                          ))}
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
                      <div className="rides-list">
                        {parkRidesStatus.rides.map((ride) => {
                          const rideEditorial = localizedRideEditorialBySlug[ride.slug];
                          const rideLiveWait = liveWaitByRideId.get(ride.id);
                          const rideMeta = getRideCardMeta(locale, copy, ride);

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
                              <p className="card-meta-line">{rideMeta}</p>
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
                      {activeRideEditorial?.cues.slice(0, 2).map((cue) => (
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
                      {rideCreditsStatus.state === "success"
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
                      void toggleRideCredit(!isCurrentRideRidden);
                    }}
                    disabled={isUpdatingRideCredit || rideCreditsStatus.state !== "success"}
                  >
                    {isUpdatingRideCredit
                      ? copy.ride.saving
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
                <p>{copy.ride.unableLoadRide}</p>
                <p>{rideDetailStatus.message}</p>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}
    </main>
  );
}

function catalogStateChip(locale: Locale, copy: UiCopy, status: ParksStatus | RidesCatalogStatus) {
  if (status.state === "success") {
    return copy.browse.results("rides" in status ? status.rides.length : status.parks.length);
  }

  if (status.state === "loading") {
    return null;
  }

  return copy.route.parkResults;
}

export default App;

