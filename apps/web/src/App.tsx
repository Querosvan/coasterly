import { useEffect, useState } from "react";

import type {
  AdminCatalogFilter,
  AdminParksResponse,
  AdminRidesResponse,
  AdminSummaryResponse,
  CommunityHighlightsResponse,
  CurrentUserResponse,
  DailyChallengeAnswerRequest,
  DailyChallengeResponse,
  DemoUserStatsResponse,
  HealthResponse,
  Park,
  ParkLiveWaitsResponse,
  ParkResponse,
  ParksResponse,
  RideCatalogResponse,
  RideCatalogOptionsResponse,
  RideCreditMutationResponse,
  RideCreditsResponse,
  RideResponse,
  RidesResponse,
  UserProfileResponse,
  UserProgressionResponse
} from "@coasterly/types";

import { AppHeader } from "./components/layout/AppHeader";
import { RouteBar } from "./components/layout/RouteBar";
import {
  curatedCollectionsEs,
  formatCountLabel,
  getInitialLocale,
  journalTeasersEs,
  localeStorageKey,
  messages,
  normalizeLocale,
  parkEditorialBySlugEs,
  rideEditorialBySlugEs,
  type Locale
} from "./i18n";
import {
  adminCatalogPageSize,
  defaultAdminCatalogPage,
  defaultAdminFilter,
  isAdminRole
} from "./lib/admin";
import {
  curatedCollections,
  journalTeasers,
  parkEditorialBySlug,
  rideEditorialBySlug
} from "./lib/catalogContent";
import {
  formatDecimalValue,
  formatParkLocation,
  getDisplayRideTypeFilterOptions,
  getParkCardMetric,
  getRideCardMeta,
  getUniqueSortedFilterValues
} from "./lib/catalogUtils";
import {
  browsePageSize,
  buildPathWithQuery,
  defaultCatalogPage,
  defaultParkRideSort,
  defaultRidesCatalogSort,
  fullCatalogFetchLimit,
  getCatalogPageFromUrl,
  getCollectionIdFromUrl,
  getRideBrowserStateFromUrl,
  getRideDetailOriginFromUrl,
  getRidesCatalogStateFromUrl,
  getRoute,
  getSearchQueryFromUrl
} from "./lib/routes";
import type {
  AdminParksStatus,
  AdminRidesStatus,
  AdminSummaryStatus,
  ApiStatus,
  BreadcrumbItem,
  CommunityHighlightsStatus,
  CuratedCollection,
  CurrentUserStatus,
  DailyChallengeStatus,
  DemoUserStatsStatus,
  ExternalInsightLink,
  ParkDetailStatus,
  ParkLiveWaitsStatus,
  ParkRideOptions,
  ParkRideSort,
  ParkRidesStatus,
  ParksStatus,
  RideCreditsStatus,
  RideDetailOrigin,
  RideDetailStatus,
  RideLineupStatus,
  RideSpecItem,
  RidesCatalogOptions,
  RidesCatalogSort,
  RidesCatalogStatus,
  Route,
  UiCopy,
  UserProfileStatus,
  UserProgressionStatus
} from "./lib/types";
import { JournalPage } from "./pages/JournalPage";
import { AdminPage } from "./pages/AdminPage";
import { DiscoverPage } from "./pages/DiscoverPage";
import { HomePage } from "./pages/HomePage";
import { ParkDetailPage } from "./pages/ParkDetailPage";
import { ParksPage } from "./pages/ParksPage";
import { RideDetailPage } from "./pages/RideDetailPage";
import { RidesPage } from "./pages/RidesPage";
import { ProfilePage } from "./pages/ProfilePage";
import { PublicProfilePage } from "./pages/PublicProfilePage";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const authFailureStatusCode = 401;

const fetchWithSession = (input: URL | RequestInfo, init?: RequestInit) =>
  fetch(input, {
    ...init,
    credentials: "include"
  });

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
  const [currentUserStatus, setCurrentUserStatus] = useState<CurrentUserStatus>({
    state: "loading"
  });
  const [adminParksStatus, setAdminParksStatus] = useState<AdminParksStatus>({
    state: "idle"
  });
  const [adminRidesStatus, setAdminRidesStatus] = useState<AdminRidesStatus>({
    state: "idle"
  });
  const [adminSummaryStatus, setAdminSummaryStatus] = useState<AdminSummaryStatus>({
    state: "idle"
  });
  const [adminParksPage, setAdminParksPage] = useState(defaultAdminCatalogPage);
  const [adminRidesPage, setAdminRidesPage] = useState(defaultAdminCatalogPage);
  const [adminFilter, setAdminFilter] = useState<AdminCatalogFilter>(defaultAdminFilter);
  const [rideCreditsStatus, setRideCreditsStatus] = useState<RideCreditsStatus>({
    state: "idle"
  });
  const [demoUserStatsStatus, setDemoUserStatsStatus] = useState<DemoUserStatsStatus>({
    state: "idle"
  });
  const [userProgressionStatus, setUserProgressionStatus] = useState<UserProgressionStatus>({
    state: "idle"
  });
  const [userProfileStatus, setUserProfileStatus] = useState<UserProfileStatus>({
    state: "idle"
  });
  const [communityHighlightsStatus, setCommunityHighlightsStatus] =
    useState<CommunityHighlightsStatus>({
      state: "loading"
    });
  const [dailyChallengeStatus, setDailyChallengeStatus] = useState<DailyChallengeStatus>({
    state: "idle"
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
  const signInPromptTitle =
    locale === "es"
      ? "Inicia sesi\u00f3n para guardar tu progreso."
      : "Sign in to save your progress.";
  const signInPromptBody =
    locale === "es"
      ? "Usa Google para guardar cr\u00e9ditos, misiones y progreso del perfil."
      : "Use Google to save credits, missions, and profile progress.";
  const rideSignInPrompt =
    locale === "es"
      ? "Inicia sesi\u00f3n para guardar esta atracci\u00f3n."
      : "Sign in to track this ride.";
  const adminNavLabel = "Admin";
  const adminPageLabel = locale === "es" ? "Revision editorial" : "Editorial review";
  const adminPageTitle =
    locale === "es" ? "Dashboard de revision editorial" : "Editorial review dashboard";
  const adminParksTitle = locale === "es" ? "Parques" : "Parks";
  const adminRidesTitle = locale === "es" ? "Atracciones" : "Rides";
  const adminInternalNote =
    locale === "es"
      ? "Vista interna para priorizar calidad, cobertura y readiness del catalogo."
      : "Internal view for prioritizing catalog quality, coverage, and readiness.";
  const adminSignedOutTitle = locale === "es" ? "Inicia sesion para abrir admin." : "Sign in to open admin.";
  const adminSignedOutBody =
    locale === "es"
      ? "Solo moderadores, editores y administradores pueden revisar el catalogo."
      : "Only moderators, editors, and admins can review the catalog.";
  const adminForbiddenTitle = locale === "es" ? "No tienes acceso a admin." : "You do not have admin access.";
  const adminForbiddenBody =
    locale === "es"
      ? "Esta vista solo esta disponible para moderadores, roles editoriales y administradores."
      : "This view is only available to moderators, editorial roles, and admins.";
  const adminLoadingLabel = locale === "es" ? "Cargando catalogo admin..." : "Loading admin catalog...";
  const adminParkEmptyLabel =
    locale === "es" ? "No hay parques pendientes en esta cola." : "No parks are pending in this queue.";
  const adminRideEmptyLabel =
    locale === "es"
      ? "No hay atracciones pendientes en esta cola."
      : "No rides are pending in this queue.";
  const adminMediaAvailable = locale === "es" ? "Media lista" : "Media ready";
  const adminMediaMissing = locale === "es" ? "Media pendiente" : "Media missing";
  const adminQueueMapped = locale === "es" ? "Queue-Times listo" : "Queue-Times ready";
  const adminQueueMissing =
    locale === "es" ? "Mapping Queue-Times pendiente" : "Queue-Times mapping missing";
  const adminSlugLabel = "Slug";
  const adminNeedsCleanup = locale === "es" ? "Necesita limpieza" : "Needs cleanup";
  const adminFilterLabels: Record<AdminCatalogFilter, string> = {
    all: locale === "es" ? "Todo" : "All",
    missing_media: locale === "es" ? "Sin media" : "Missing media",
    missing_queue_times:
      locale === "es" ? "Sin Queue-Times" : "Missing Queue-Times",
    needs_cleanup: adminNeedsCleanup
  };
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
  const isAdminUser =
    currentUserStatus.state === "signed_in" &&
    isAdminRole(currentUserStatus.currentUser.user.role);

  const loadCurrentUser = async (signal?: AbortSignal) => {
    if (!apiBaseUrl) {
      setCurrentUserStatus({
        state: "error",
        message: "VITE_API_BASE_URL is not configured."
      });

      return;
    }

    setCurrentUserStatus({ state: "loading" });

    try {
      const response = await fetchWithSession(new URL("/me", apiBaseUrl), {
        ...(signal ? { signal } : {})
      });

      if (response.status === authFailureStatusCode) {
        setCurrentUserStatus({ state: "signed_out" });
        return;
      }

      if (!response.ok) {
        setCurrentUserStatus({
          state: "error",
          message: `Current user request failed with status ${response.status}.`
        });

        return;
      }

      const payload = (await response.json()) as CurrentUserResponse;

      setCurrentUserStatus({
        state: "signed_in",
        currentUser: payload
      });
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      setCurrentUserStatus({
        state: "error",
        message: error instanceof Error ? error.message : "The current user request failed."
      });
    }
  };

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
      const response = await fetchWithSession(new URL("/me/stats", apiBaseUrl), {
        ...(signal ? { signal } : {})
      });

      if (response.status === authFailureStatusCode) {
        setDemoUserStatsStatus({ state: "idle" });

        return;
      }

      if (!response.ok) {
        setDemoUserStatsStatus({
          state: "error",
          message: `User stats request failed with status ${response.status}.`
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
            : "The user stats request failed."
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
      const response = await fetchWithSession(new URL("/me/progression", apiBaseUrl), {
        ...(signal ? { signal } : {})
      });

      if (response.status === authFailureStatusCode) {
        setUserProgressionStatus({ state: "idle" });

        return;
      }

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
      const response = await fetchWithSession(new URL("/me/profile", apiBaseUrl), {
        ...(signal ? { signal } : {})
      });

      if (response.status === authFailureStatusCode) {
        setUserProfileStatus({ state: "idle" });

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

  const loadAdminParks = async (signal?: AbortSignal) => {
    if (!apiBaseUrl) {
      setAdminParksStatus({
        state: "error",
        message: "VITE_API_BASE_URL is not configured."
      });

      return;
    }

    setAdminParksStatus({ state: "loading" });

    try {
      const response = await fetchWithSession(
        new URL(
          `/admin/parks?limit=${adminCatalogPageSize}&offset=${(adminParksPage - 1) * adminCatalogPageSize}&filter=${adminFilter}`,
          apiBaseUrl
        ),
        {
          ...(signal ? { signal } : {})
        }
      );

      if (!response.ok) {
        setAdminParksStatus({
          state: "error",
          message: `Admin parks request failed with status ${response.status}.`
        });

        return;
      }

      const payload = (await response.json()) as AdminParksResponse;

      setAdminParksStatus({
        state: "success",
        parks: payload.parks,
        pageInfo: payload.pageInfo
      });
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      setAdminParksStatus({
        state: "error",
        message:
          error instanceof Error ? error.message : "The admin parks request failed."
      });
    }
  };

  const loadAdminRides = async (signal?: AbortSignal) => {
    if (!apiBaseUrl) {
      setAdminRidesStatus({
        state: "error",
        message: "VITE_API_BASE_URL is not configured."
      });

      return;
    }

    setAdminRidesStatus({ state: "loading" });

    try {
      const response = await fetchWithSession(
        new URL(
          `/admin/rides?limit=${adminCatalogPageSize}&offset=${(adminRidesPage - 1) * adminCatalogPageSize}&filter=${adminFilter}`,
          apiBaseUrl
        ),
        {
          ...(signal ? { signal } : {})
        }
      );

      if (!response.ok) {
        setAdminRidesStatus({
          state: "error",
          message: `Admin rides request failed with status ${response.status}.`
        });

        return;
      }

      const payload = (await response.json()) as AdminRidesResponse;

      setAdminRidesStatus({
        state: "success",
        rides: payload.rides,
        pageInfo: payload.pageInfo
      });
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      setAdminRidesStatus({
        state: "error",
        message:
          error instanceof Error ? error.message : "The admin rides request failed."
      });
    }
  };

  const loadAdminSummary = async (signal?: AbortSignal) => {
    if (!apiBaseUrl) {
      setAdminSummaryStatus({
        state: "error",
        message: "VITE_API_BASE_URL is not configured."
      });

      return;
    }

    setAdminSummaryStatus({ state: "loading" });

    try {
      const response = await fetchWithSession(new URL("/admin/summary", apiBaseUrl), {
        ...(signal ? { signal } : {})
      });

      if (!response.ok) {
        setAdminSummaryStatus({
          state: "error",
          message: `Admin summary request failed with status ${response.status}.`
        });

        return;
      }

      const payload = (await response.json()) as AdminSummaryResponse;

      setAdminSummaryStatus({
        state: "success",
        summary: payload.summary
      });
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      setAdminSummaryStatus({
        state: "error",
        message:
          error instanceof Error ? error.message : "The admin summary request failed."
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
      const response = await fetchWithSession(new URL("/me/daily-challenge", apiBaseUrl), {
        ...(signal ? { signal } : {})
      });

      if (response.status === authFailureStatusCode) {
        setDailyChallengeStatus({ state: "idle" });

        return;
      }

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
    const controller = new AbortController();

    void loadCurrentUser(controller.signal);

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (currentUserStatus.state !== "signed_in") {
      setRideCreditsStatus({ state: "idle" });

      return;
    }

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
        const response = await fetchWithSession(new URL("/me/ride-credits", apiBaseUrl), {
          signal: controller.signal
        });

        if (response.status === authFailureStatusCode) {
          setRideCreditsStatus({ state: "idle" });

          return;
        }

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
  }, [currentUserStatus.state]);

  useEffect(() => {
    const controller = new AbortController();

    if (currentUserStatus.state === "signed_in") {
      void loadDemoUserStats(controller.signal);
      void loadUserProgression(controller.signal);
      void loadDailyChallenge(controller.signal);
    } else {
      setDemoUserStatsStatus({ state: "idle" });
      setUserProgressionStatus({ state: "idle" });
      setDailyChallengeStatus({ state: "idle" });
    }

    void loadCommunityHighlights(controller.signal);

    return () => {
      controller.abort();
    };
  }, [currentUserStatus.state]);

  useEffect(() => {
    if (route.view !== "profile" && route.view !== "user-profile") {
      setUserProfileStatus({ state: "idle" });
      setProfileShareMessage(null);

      return;
    }

    const controller = new AbortController();

    if (route.view === "profile" && currentUserStatus.state === "signed_in") {
      void loadUserProfile(controller.signal);
    } else if (route.view === "user-profile") {
      void loadPublicUserProfile(route.slug, controller.signal);
    } else {
      setUserProfileStatus({ state: "idle" });
    }

    return () => {
      controller.abort();
    };
  }, [route, currentUserStatus.state]);

  useEffect(() => {
    if (route.view !== "admin" || !isAdminUser) {
      setAdminParksStatus({ state: "idle" });
      setAdminRidesStatus({ state: "idle" });
      setAdminSummaryStatus({ state: "idle" });

      return;
    }

    const controller = new AbortController();

    void loadAdminSummary(controller.signal);
    void loadAdminParks(controller.signal);
    void loadAdminRides(controller.signal);

    return () => {
      controller.abort();
    };
  }, [route, isAdminUser, adminFilter, adminParksPage, adminRidesPage]);

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
          rideTypes: getUniqueSortedFilterValues(payload.rideTypes, {
            excludeGenericRideTypes: true
          }),
          manufacturers: getUniqueSortedFilterValues(payload.manufacturers)
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
        const rideTypes = getUniqueSortedFilterValues(
          payload.rides.map((ride) => ride.rideType),
          {
            excludeGenericRideTypes: true
          }
        );

        const manufacturers = getUniqueSortedFilterValues(
          payload.rides.map((ride) => ride.manufacturer)
        );

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

  const beginGoogleSignIn = (returnTo?: string) => {
    if (!apiBaseUrl) {
      return;
    }

    const authUrl = new URL("/auth/google/start", apiBaseUrl);
    authUrl.searchParams.set(
      "returnTo",
      returnTo ?? `${window.location.pathname}${window.location.search}`
    );
    window.location.assign(authUrl.toString());
  };

  const signOut = async () => {
    if (!apiBaseUrl) {
      return;
    }

    await fetchWithSession(new URL("/auth/sign-out", apiBaseUrl), {
      method: "POST"
    });

    setCurrentUserStatus({ state: "signed_out" });
    setRideCreditsStatus({ state: "idle" });
    setDemoUserStatsStatus({ state: "idle" });
    setUserProgressionStatus({ state: "idle" });
    setDailyChallengeStatus({ state: "idle" });
    setUserProfileStatus({ state: "idle" });
    setProfileShareMessage(null);

    if (route.view === "profile" || route.view === "admin") {
      navigateHome();
    }
  };

  const navigateToParks = (options?: { preserveSearch?: boolean; collectionId?: string }) => {
    if (!options?.preserveSearch) {
      setSearchQuery("");
    }
    const nextCollectionId = options?.preserveSearch
      ? options && "collectionId" in options
        ? options.collectionId ?? ""
        : parkCollectionId
      : "";
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
    const nextCollectionId = options?.preserveFilters
      ? options && "collectionId" in options
        ? options.collectionId ?? ""
        : rideCollectionId
      : "";
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

  const navigateToAdmin = () => {
    setAdminParksPage(defaultAdminCatalogPage);
    setAdminRidesPage(defaultAdminCatalogPage);
    setAdminFilter(defaultAdminFilter);
    navigateWithParams("/admin", new URLSearchParams());
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

  const goToPreviousAdminParksPage = () => {
    setAdminParksPage((currentPage) =>
      currentPage > defaultAdminCatalogPage ? currentPage - 1 : currentPage
    );
  };

  const goToNextAdminParksPage = () => {
    if (adminParksStatus.state !== "success" || !adminParksStatus.pageInfo?.hasMore) {
      return;
    }

    setAdminParksPage((currentPage) => currentPage + 1);
  };

  const goToPreviousAdminRidesPage = () => {
    setAdminRidesPage((currentPage) =>
      currentPage > defaultAdminCatalogPage ? currentPage - 1 : currentPage
    );
  };

  const goToNextAdminRidesPage = () => {
    if (adminRidesStatus.state !== "success" || !adminRidesStatus.pageInfo?.hasMore) {
      return;
    }

    setAdminRidesPage((currentPage) => currentPage + 1);
  };

  const applyAdminFilter = (nextFilter: AdminCatalogFilter) => {
    setAdminFilter(nextFilter);
    setAdminParksPage(defaultAdminCatalogPage);
    setAdminRidesPage(defaultAdminCatalogPage);
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
      const response = await fetchWithSession(new URL("/me/daily-challenge/answer", apiBaseUrl), {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          optionId
        } satisfies DailyChallengeAnswerRequest)
      });

      if (!response.ok) {
        if (response.status === authFailureStatusCode) {
          setCurrentUserStatus({ state: "signed_out" });
          setDailyChallengeStatus({ state: "idle" });
          return;
        }

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
      const response = await fetchWithSession(new URL("/me/daily-challenge/reward", apiBaseUrl), {
        method: "POST"
      });

      if (!response.ok) {
        if (response.status === authFailureStatusCode) {
          setCurrentUserStatus({ state: "signed_out" });
          setDailyChallengeStatus({ state: "idle" });
          return;
        }

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

    if (currentUserStatus.state !== "signed_in") {
      setRideCreditMessage(rideSignInPrompt);
      beginGoogleSignIn(`${window.location.pathname}${window.location.search}`);

      return;
    }

    setIsUpdatingRideCredit(true);
    setRideCreditMessage(null);

    try {
      const creditUrl = new URL(
        `/parks/${route.parkSlug}/rides/${route.rideSlug}/credit`,
        apiBaseUrl
      );
      const response = await fetchWithSession(creditUrl, {
        method: nextRidden ? "PUT" : "DELETE"
      });

      if (!response.ok) {
        if (response.status === authFailureStatusCode) {
          setCurrentUserStatus({ state: "signed_out" });
          setRideCreditsStatus({ state: "idle" });
          setRideCreditMessage(rideSignInPrompt);
          return;
        }

        setRideCreditMessage(`Unable to update ride credit (${response.status}).`);

        return;
      }

      const payload = (await response.json()) as RideCreditMutationResponse;

      updateRiddenRide(payload.rideId, payload.ridden);
      await loadDemoUserStats();
      await loadUserProgression();
      await loadUserProfile();
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
  const isAuthenticated = currentUserStatus.state === "signed_in";
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
      : currentUserStatus.state === "signed_out"
        ? copy.nav.signIn
      : demoUserStatsStatus.state === "loading"
        ? copy.browse.loadingResults
        : copy.route.statsUnavailable;
  const riddenParkCountLabel =
    demoUserStatsStatus.state === "success"
      ? formatCountLabel(locale, demoUserStatsStatus.totalParksWithRiddenRides, "park")
      : currentUserStatus.state === "signed_out"
        ? copy.nav.signIn
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
        : route.view === "admin"
          ? adminPageTitle
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
        : route.view === "admin"
          ? adminPageLabel
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
        : route.view === "admin"
          ? [{ label: adminNavLabel }]
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
      : route.view === "admin"
        ? [adminParksTitle, adminRidesTitle]
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
    ...(isAdminUser
      ? [
          {
            label: adminNavLabel,
            href: "/admin",
            active: route.view === "admin",
            onClick: navigateToAdmin
          }
        ]
      : []),
    ...(isAuthenticated
      ? [
          {
            label: copy.nav.profile,
            href: "/profile",
            active: route.view === "profile" || route.view === "user-profile",
            onClick: navigateToProfile
          }
        ]
      : []),
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
      <AppHeader
        isMobileNavOpen={isMobileNavOpen}
        activeNavigationLabel={activeNavigationLabel}
        topNavigation={topNavigation}
        locale={locale}
        copy={copy}
        isAuthenticated={isAuthenticated}
        apiStatus={apiStatus}
        onToggleMobileNav={() => {
          setIsMobileNavOpen((isOpen) => !isOpen);
        }}
        onCloseMobileNav={() => {
          setIsMobileNavOpen(false);
        }}
        onNavigateHome={navigateHome}
        onLocaleChange={setLocale}
        onSignIn={() => {
          beginGoogleSignIn();
        }}
        onSignOut={() => {
          void signOut();
        }}
      />

      {showRouteBar ? (
        <RouteBar
          breadcrumbItems={breadcrumbItems}
          routeBarLabel={routeBarLabel}
          routeBarTitle={routeBarTitle}
          routeBarChips={routeBarChips}
        />
      ) : null}

      {route.view === "home" ? (
        <HomePage
          beginGoogleSignIn={beginGoogleSignIn}
          claimDailyReward={claimDailyReward}
          communityHighlightsStatus={communityHighlightsStatus}
          copy={copy}
          currentUserStatus={currentUserStatus}
          dailyChallengeStatus={dailyChallengeStatus}
          demoUserStatsStatus={demoUserStatsStatus}
          formatParkLocation={formatParkLocation}
          getParkCardMetric={getParkCardMetric}
          heroCountLabel={heroCountLabel}
          isAuthenticated={isAuthenticated}
          isClaimingDailyReward={isClaimingDailyReward}
          isSubmittingDailyChallenge={isSubmittingDailyChallenge}
          landingCollections={landingCollections}
          landingCommunityHighlights={landingCommunityHighlights}
          landingFeaturedParks={landingFeaturedParks}
          landingJournalTeasers={landingJournalTeasers}
          locale={locale}
          localizedParkEditorialBySlug={localizedParkEditorialBySlug}
          navigateToDiscover={navigateToDiscover}
          navigateToJournal={navigateToJournal}
          navigateToPark={navigateToPark}
          navigateToParks={navigateToParks}
          navigateToProfile={navigateToProfile}
          navigateToPublicProfile={navigateToPublicProfile}
          navigateToRide={navigateToRide}
          navigateToRides={navigateToRides}
          parkProgressBySlug={parkProgressBySlug}
          rankedProgressParks={rankedProgressParks}
          riddenRideCountLabel={riddenRideCountLabel}
          secondaryFeaturedParks={secondaryFeaturedParks}
          signInPromptBody={signInPromptBody}
          signInPromptTitle={signInPromptTitle}
          spotlightPark={spotlightPark}
          spotlightParkEditorial={spotlightParkEditorial}
          spotlightProgress={spotlightProgress}
          submitDailyChallengeAnswer={submitDailyChallengeAnswer}
          userProgressionStatus={userProgressionStatus}
        />
      ) : null}

      {route.view === "parks" ? (
        <ParksPage
          copy={copy}
          defaultCatalogPage={defaultCatalogPage}
          displayedParks={displayedParks}
          formatParkLocation={formatParkLocation}
          getParkCardMetric={getParkCardMetric}
          goToNextParksPage={goToNextParksPage}
          goToPreviousParksPage={goToPreviousParksPage}
          hasActiveCatalogSearch={hasActiveCatalogSearch}
          hasActiveParkCollection={hasActiveParkCollection}
          locale={locale}
          localizedParkEditorialBySlug={localizedParkEditorialBySlug}
          navigateToPark={navigateToPark}
          navigateToParks={navigateToParks}
          normalizedSearchQuery={normalizedSearchQuery}
          parkCollectionId={parkCollectionId}
          parkCollections={parkCollections}
          parkProgressBySlug={parkProgressBySlug}
          parkResultRangeLabel={parkResultRangeLabel}
          parksPage={parksPage}
          parksPageInfo={parksPageInfo}
          parksStatus={parksStatus}
          parksTotalPages={parksTotalPages}
          searchQuery={searchQuery}
          selectedParkCollection={selectedParkCollection}
          setParkCollectionId={setParkCollectionId}
          setParksPage={setParksPage}
          setSearchQuery={setSearchQuery}
          visibleParkCount={visibleParkCount}
        />
      ) : null}

      {route.view === "rides" ? (
        <RidesPage
          copy={copy}
          defaultCatalogPage={defaultCatalogPage}
          defaultRidesCatalogSort={defaultRidesCatalogSort}
          displayedRideCatalogItems={displayedRideCatalogItems}
          getDisplayRideTypeFilterOptions={getDisplayRideTypeFilterOptions}
          getRideCardMeta={getRideCardMeta}
          goToNextRidesCatalogPage={goToNextRidesCatalogPage}
          goToPreviousRidesCatalogPage={goToPreviousRidesCatalogPage}
          hasActiveRideCollection={hasActiveRideCollection}
          isRideFiltersOpen={isRideFiltersOpen}
          locale={locale}
          localizedRideEditorialBySlug={localizedRideEditorialBySlug}
          navigateToRide={navigateToRide}
          navigateToRides={navigateToRides}
          rideCatalogManufacturerFilter={rideCatalogManufacturerFilter}
          rideCatalogParkFilter={rideCatalogParkFilter}
          rideCatalogRideTypeFilter={rideCatalogRideTypeFilter}
          rideCatalogSearchQuery={rideCatalogSearchQuery}
          rideCatalogSort={rideCatalogSort}
          rideCollectionId={rideCollectionId}
          rideCollections={rideCollections}
          rideResultRangeLabel={rideResultRangeLabel}
          riddenRideIds={riddenRideIds}
          ridesCatalogOptions={ridesCatalogOptions}
          ridesCatalogPage={ridesCatalogPage}
          ridesCatalogPageInfo={ridesCatalogPageInfo}
          ridesCatalogStatus={ridesCatalogStatus}
          ridesCatalogTotalPages={ridesCatalogTotalPages}
          selectedRideCollection={selectedRideCollection}
          setIsRideFiltersOpen={setIsRideFiltersOpen}
          setRideCatalogManufacturerFilter={setRideCatalogManufacturerFilter}
          setRideCatalogParkFilter={setRideCatalogParkFilter}
          setRideCatalogRideTypeFilter={setRideCatalogRideTypeFilter}
          setRideCatalogSearchQuery={setRideCatalogSearchQuery}
          setRideCatalogSort={setRideCatalogSort}
          setRideCollectionId={setRideCollectionId}
          setRidesCatalogPage={setRidesCatalogPage}
          visibleRideCatalogCount={visibleRideCatalogCount}
        />
      ) : null}

      {route.view === "discover" ? (
        <DiscoverPage
          beginGoogleSignIn={beginGoogleSignIn}
          claimDailyReward={claimDailyReward}
          communityHighlights={communityHighlights}
          communityHighlightsStatus={communityHighlightsStatus}
          copy={copy}
          currentUserStatus={currentUserStatus}
          dailyChallengeStatus={dailyChallengeStatus}
          demoUserStatsStatus={demoUserStatsStatus}
          featuredParks={featuredParks}
          featuredProgressParks={featuredProgressParks}
          formatParkLocation={formatParkLocation}
          getParkCardMetric={getParkCardMetric}
          highestLevelProfiles={highestLevelProfiles}
          isClaimingDailyReward={isClaimingDailyReward}
          isSubmittingDailyChallenge={isSubmittingDailyChallenge}
          locale={locale}
          localizedCollections={localizedCollections}
          localizedParkEditorialBySlug={localizedParkEditorialBySlug}
          longestStreakProfiles={longestStreakProfiles}
          navigateToPark={navigateToPark}
          navigateToParks={navigateToParks}
          navigateToPublicProfile={navigateToPublicProfile}
          navigateToRide={navigateToRide}
          navigateToRides={navigateToRides}
          rankedProgressParks={rankedProgressParks}
          recentlyActiveProfiles={recentlyActiveProfiles}
          signInPromptBody={signInPromptBody}
          signInPromptTitle={signInPromptTitle}
          submitDailyChallengeAnswer={submitDailyChallengeAnswer}
          userProgressionStatus={userProgressionStatus}
        />
      ) : null}

      {route.view === "admin" ? (
        <AdminPage
          adminFilter={adminFilter}
          adminFilterLabels={adminFilterLabels}
          adminForbiddenBody={adminForbiddenBody}
          adminForbiddenTitle={adminForbiddenTitle}
          adminInternalNote={adminInternalNote}
          adminLoadingLabel={adminLoadingLabel}
          adminMediaAvailable={adminMediaAvailable}
          adminMediaMissing={adminMediaMissing}
          adminNavLabel={adminNavLabel}
          adminNeedsCleanup={adminNeedsCleanup}
          adminPageLabel={adminPageLabel}
          adminPageTitle={adminPageTitle}
          adminParkEmptyLabel={adminParkEmptyLabel}
          adminParksPage={adminParksPage}
          adminParksStatus={adminParksStatus}
          adminParksTitle={adminParksTitle}
          adminQueueMapped={adminQueueMapped}
          adminQueueMissing={adminQueueMissing}
          adminRideEmptyLabel={adminRideEmptyLabel}
          adminRidesPage={adminRidesPage}
          adminRidesStatus={adminRidesStatus}
          adminRidesTitle={adminRidesTitle}
          adminSignedOutBody={adminSignedOutBody}
          adminSignedOutTitle={adminSignedOutTitle}
          adminSlugLabel={adminSlugLabel}
          adminSummaryStatus={adminSummaryStatus}
          applyAdminFilter={applyAdminFilter}
          beginGoogleSignIn={beginGoogleSignIn}
          copy={copy}
          currentUserStatus={currentUserStatus}
          defaultAdminCatalogPage={defaultAdminCatalogPage}
          goToNextAdminParksPage={goToNextAdminParksPage}
          goToNextAdminRidesPage={goToNextAdminRidesPage}
          goToPreviousAdminParksPage={goToPreviousAdminParksPage}
          goToPreviousAdminRidesPage={goToPreviousAdminRidesPage}
          isAdminUser={isAdminUser}
          locale={locale}
          navigateToPark={navigateToPark}
          navigateToRide={navigateToRide}
        />
      ) : null}

      {route.view === "profile" ? (
        <ProfilePage
          currentUserStatus={currentUserStatus}
          userProfileStatus={userProfileStatus}
          dailyChallengeStatus={dailyChallengeStatus}
          isSubmittingDailyChallenge={isSubmittingDailyChallenge}
          isClaimingDailyReward={isClaimingDailyReward}
          profileShareMessage={profileShareMessage}
          signInPromptTitle={signInPromptTitle}
          signInPromptBody={signInPromptBody}
          locale={locale}
          copy={copy}
          onSignIn={beginGoogleSignIn}
          onOpenPark={(parkSlug) => {
            navigateToPark(parkSlug);
          }}
          onOpenRide={(parkSlug, rideSlug) => {
            navigateToRide(parkSlug, rideSlug);
          }}
          onBrowseParks={() => {
            navigateToParks();
          }}
          onBrowseRides={() => {
            navigateToRides();
          }}
          onOpenPublicProfile={navigateToPublicProfile}
          onCopyPublicProfile={copyPublicProfileLink}
          onAnswerDailyChallenge={submitDailyChallengeAnswer}
          onClaimDailyReward={claimDailyReward}
        />
      ) : null}

      {route.view === "user-profile" ? (
        <PublicProfilePage
          userProfileStatus={userProfileStatus}
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

      {route.view === "journal" ? (
        <JournalPage
          journalTeasers={journalTeasers}
          copy={copy}
          onBrowseParks={() => {
            navigateToParks({ preserveSearch: true });
          }}
        />
      ) : null}

      {route.view === "park" ? (
        <ParkDetailPage
          activeParkEditorial={activeParkEditorial}
          activeParkProgress={activeParkProgress}
          copy={copy}
          defaultParkRideSort={defaultParkRideSort}
          formatParkLocation={formatParkLocation}
          getDisplayRideTypeFilterOptions={getDisplayRideTypeFilterOptions}
          getRideCardMeta={getRideCardMeta}
          liveWaitByRideId={liveWaitByRideId}
          liveWaitRides={liveWaitRides}
          liveWaitSource={liveWaitSource}
          locale={locale}
          localizedRideEditorialBySlug={localizedRideEditorialBySlug}
          manufacturerFilter={manufacturerFilter}
          navigateToParks={navigateToParks}
          navigateToRide={navigateToRide}
          parkDetailStatus={parkDetailStatus}
          parkLiveWaitsStatus={parkLiveWaitsStatus}
          parkQueueTimesLinks={parkQueueTimesLinks}
          parkRideOptions={parkRideOptions}
          parkRideSort={parkRideSort}
          parkRidesStatus={parkRidesStatus}
          parkSlug={route.slug}
          rideTypeFilter={rideTypeFilter}
          riddenRideIds={riddenRideIds}
          setManufacturerFilter={setManufacturerFilter}
          setParkRideSort={setParkRideSort}
          setRideTypeFilter={setRideTypeFilter}
          showParkQueueTimesSupport={showParkQueueTimesSupport}
        />
      ) : null}

      {route.view === "ride" ? (
        <RideDetailPage
          activeRideEditorial={activeRideEditorial}
          beginGoogleSignIn={beginGoogleSignIn}
          copy={copy}
          currentRideLiveWait={currentRideLiveWait}
          currentUserStatus={currentUserStatus}
          formatParkLocation={formatParkLocation}
          isCurrentRideRidden={isCurrentRideRidden}
          isUpdatingRideCredit={isUpdatingRideCredit}
          locale={locale}
          navigateBackFromRide={navigateBackFromRide}
          navigateToRide={navigateToRide}
          nextRide={nextRide}
          parkLiveWaitsStatus={parkLiveWaitsStatus}
          parkSlug={route.parkSlug}
          previousRide={previousRide}
          rideCreditMessage={rideCreditMessage}
          rideCreditsStatus={rideCreditsStatus}
          rideDetailOrigin={rideDetailOrigin}
          rideDetailStatus={rideDetailStatus}
          rideLineupPositionLabel={rideLineupPositionLabel}
          rideLineupStatus={rideLineupStatus}
          rideQueueTimesLinks={rideQueueTimesLinks}
          rideSignInPrompt={rideSignInPrompt}
          rideSpecItems={rideSpecItems}
          toggleRideCredit={toggleRideCredit}
        />
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
