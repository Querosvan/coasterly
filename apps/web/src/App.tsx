import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import type {
  AdminCatalogFilter,
  DemoUserStatsResponse,
  Park,
  RideCreditMutationResponse,
  RideResponse
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
import { useAdminData } from "./hooks/useAdminData";
import { useApiHealth } from "./hooks/useApiHealth";
import { useAppNavigation } from "./hooks/useAppNavigation";
import { useCatalogQueryState } from "./hooks/useCatalogQueryState";
import { useCommunityHighlights } from "./hooks/useCommunityHighlights";
import { useCurrentUser } from "./hooks/useCurrentUser";
import { useDailyChallenge } from "./hooks/useDailyChallenge";
import { useParkDetail } from "./hooks/useParkDetail";
import { useParkRides } from "./hooks/useParkRides";
import { useParksCatalog } from "./hooks/useParksCatalog";
import { useRideDetail } from "./hooks/useRideDetail";
import { useRideCredits } from "./hooks/useRideCredits";
import { useRidesCatalog } from "./hooks/useRidesCatalog";
import { useUserProfile } from "./hooks/useUserProfile";
import { useUserProgression } from "./hooks/useUserProgression";
import { useUserStats } from "./hooks/useUserStats";
import {
  apiBaseUrl,
  authFailureStatusCode,
  fetchWithSession
} from "./hooks/userDataApi";
import {
  defaultAdminCatalogPage,
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
  getRideCardMeta
} from "./lib/catalogUtils";
import {
  buildPathWithQuery,
  defaultCatalogPage,
  defaultParkRideSort,
  defaultRidesCatalogSort,
  fullCatalogFetchLimit,
  getRoute
} from "./lib/routes";
import type {
  BreadcrumbItem,
  CuratedCollection,
  ExternalInsightLink,
  ParksStatus,
  RideSpecItem,
  RidesCatalogStatus,
  Route,
  UiCopy
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
  const location = useLocation();
  const route = useMemo<Route>(() => getRoute(location.pathname), [location.pathname]);
  const currentLocation = `${location.pathname}${location.search}`;
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isRideFiltersOpen, setIsRideFiltersOpen] = useState(false);
  const { apiStatus } = useApiHealth();
  const [locale, setLocale] = useState<Locale>(() => getInitialLocale());
  const {
    searchQuery,
    setSearchQuery,
    parkCollectionId,
    setParkCollectionId,
    parksPage,
    setParksPage,
    rideTypeFilter,
    setRideTypeFilter,
    manufacturerFilter,
    setManufacturerFilter,
    parkRideSort,
    setParkRideSort,
    rideCatalogSearchQuery,
    setRideCatalogSearchQuery,
    rideCatalogParkFilter,
    setRideCatalogParkFilter,
    rideCatalogRideTypeFilter,
    setRideCatalogRideTypeFilter,
    rideCatalogManufacturerFilter,
    setRideCatalogManufacturerFilter,
    rideCatalogSort,
    setRideCatalogSort,
    ridesCatalogPage,
    setRidesCatalogPage,
    rideCollectionId,
    setRideCollectionId,
    rideDetailOrigin,
    setRideDetailOrigin
  } = useCatalogQueryState(location.search);
  const { parksStatus } = useParksCatalog({
    route,
    searchQuery,
    parkCollectionId,
    parksPage
  });
  const { ridesCatalogStatus, ridesCatalogOptions } = useRidesCatalog({
    route,
    rideCatalogSearchQuery,
    rideCatalogParkFilter,
    rideCatalogRideTypeFilter,
    rideCatalogManufacturerFilter,
    rideCatalogSort,
    rideCollectionId,
    ridesCatalogPage
  });
  const { parkDetailStatus, parkLiveWaitsStatus } = useParkDetail(route);
  const { parkRidesStatus, parkRideOptions } = useParkRides({
    route,
    rideTypeFilter,
    manufacturerFilter,
    parkRideSort
  });
  const { currentUserStatus, markSignedOut } = useCurrentUser();
  const {
    rideCreditsStatus,
    resetRideCredits,
    updateRiddenRide
  } = useRideCredits(currentUserStatus.state);
  const {
    demoUserStatsStatus,
    loadDemoUserStats,
    resetDemoUserStats
  } = useUserStats();
  const {
    userProgressionStatus,
    loadUserProgression,
    resetUserProgression
  } = useUserProgression();
  const {
    userProfileStatus,
    loadUserProfile,
    loadPublicUserProfile,
    resetUserProfile
  } = useUserProfile();
  const { communityHighlightsStatus, loadCommunityHighlights } =
    useCommunityHighlights();
  const handleUserAuthFailure = useCallback(() => {
    markSignedOut();
  }, [markSignedOut]);
  const {
    dailyChallengeStatus,
    isSubmittingDailyChallenge,
    isClaimingDailyReward,
    loadDailyChallenge,
    submitDailyChallengeAnswer,
    claimDailyReward,
    resetDailyChallenge
  } = useDailyChallenge({ onAuthFailure: handleUserAuthFailure });
  const { rideDetailStatus, rideLineupStatus } = useRideDetail({
    route,
    rideTypeFilter,
    manufacturerFilter,
    parkRideSort
  });
  const [isUpdatingRideCredit, setIsUpdatingRideCredit] = useState(false);
  const [rideCreditMessage, setRideCreditMessage] = useState<string | null>(null);
  const [profileShareMessage, setProfileShareMessage] = useState<string | null>(null);
  const copy = messages[locale];
  const signInPromptTitle =
    locale === "es"
      ? "Guarda tus cr\u00e9ditos y construye tu perfil coaster."
      : "Save your credits and build your coaster profile.";
  const signInPromptBody =
    locale === "es"
      ? "Usa Google para guardar monta\u00f1as rusas montadas, avance por parque, retos diarios y un perfil p\u00fablico para compartir."
      : "Use Google to save ridden coasters, park progress, daily challenges, and a public profile you can share.";
  const rideSignInPrompt =
    locale === "es"
      ? "Inicia sesi\u00f3n para guardar esta atracci\u00f3n."
      : "Sign in to track this ride.";
  const adminNavLabel = "Admin";
  const adminPageLabel = locale === "es" ? "Revisi\u00f3n editorial" : "Editorial review";
  const adminPageTitle =
    locale === "es" ? "Dashboard de revisi\u00f3n editorial" : "Editorial review dashboard";
  const adminParksTitle = locale === "es" ? "Parques" : "Parks";
  const adminRidesTitle = locale === "es" ? "Atracciones" : "Rides";
  const adminInternalNote =
    locale === "es"
      ? "Vista interna para priorizar calidad, cobertura y readiness del cat\u00e1logo."
      : "Internal view for prioritizing catalog quality, coverage, and readiness.";
  const adminSignedOutTitle = locale === "es" ? "Inicia sesi\u00f3n para abrir admin." : "Sign in to open admin.";
  const adminSignedOutBody =
    locale === "es"
      ? "Solo moderadores, editores y administradores pueden revisar el cat\u00e1logo."
      : "Only moderators, editors, and admins can review the catalog.";
  const adminForbiddenTitle = locale === "es" ? "No tienes acceso a admin." : "You do not have admin access.";
  const adminForbiddenBody =
    locale === "es"
      ? "Esta vista solo est\u00e1 disponible para moderadores, roles editoriales y administradores."
      : "This view is only available to moderators, editorial roles, and admins.";
  const adminLoadingLabel = locale === "es" ? "Cargando cat\u00e1logo admin..." : "Loading admin catalog...";
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
  const {
    adminParksStatus,
    adminRidesStatus,
    adminSummaryStatus,
    adminParksPage,
    adminRidesPage,
    adminFilter,
    applyAdminFilter,
    resetAdminCatalog,
    goToPreviousAdminParksPage,
    goToNextAdminParksPage,
    goToPreviousAdminRidesPage,
    goToNextAdminRidesPage
  } = useAdminData({ route, isAdminUser });
  const {
    getCatalogSearchParams,
    getRidesCatalogParams,
    getRideBrowserParams,
    navigateHome,
    navigateToParks,
    navigateToRides,
    navigateToAdmin,
    navigateToDiscover,
    navigateToProfile,
    navigateToPublicProfile,
    navigateToJournal,
    navigateToPark,
    navigateToRide,
    navigateBackFromRide,
    goToPreviousParksPage,
    goToNextParksPage,
    goToPreviousRidesCatalogPage,
    goToNextRidesCatalogPage
  } = useAppNavigation({
    route,
    location,
    currentLocation,
    parksStatus,
    ridesCatalogStatus,
    searchQuery,
    setSearchQuery,
    parkCollectionId,
    setParkCollectionId,
    parksPage,
    setParksPage,
    rideTypeFilter,
    setRideTypeFilter,
    manufacturerFilter,
    setManufacturerFilter,
    parkRideSort,
    setParkRideSort,
    rideCatalogSearchQuery,
    setRideCatalogSearchQuery,
    rideCatalogParkFilter,
    setRideCatalogParkFilter,
    rideCatalogRideTypeFilter,
    setRideCatalogRideTypeFilter,
    rideCatalogManufacturerFilter,
    setRideCatalogManufacturerFilter,
    rideCatalogSort,
    setRideCatalogSort,
    ridesCatalogPage,
    setRidesCatalogPage,
    rideCollectionId,
    setRideCollectionId,
    rideDetailOrigin,
    setRideDetailOrigin,
    resetAdminCatalog
  });

  useEffect(() => {
    window.localStorage.setItem(localeStorageKey, locale);
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    setIsMobileNavOpen(false);
    setIsRideFiltersOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const controller = new AbortController();

    if (currentUserStatus.state === "signed_in") {
      void loadDemoUserStats(controller.signal);
      void loadUserProgression(controller.signal);
      void loadDailyChallenge(controller.signal);
    } else {
      resetDemoUserStats();
      resetUserProgression();
      resetDailyChallenge();
    }

    void loadCommunityHighlights(controller.signal);

    return () => {
      controller.abort();
    };
  }, [
    currentUserStatus.state,
    loadDailyChallenge,
    loadDemoUserStats,
    loadUserProgression,
    loadCommunityHighlights,
    resetDailyChallenge,
    resetDemoUserStats,
    resetUserProgression
  ]);

  useEffect(() => {
    if (route.view !== "profile" && route.view !== "user-profile") {
      resetUserProfile();
      setProfileShareMessage(null);

      return;
    }

    const controller = new AbortController();

    if (route.view === "profile" && currentUserStatus.state === "signed_in") {
      void loadUserProfile(controller.signal);
    } else if (route.view === "user-profile") {
      void loadPublicUserProfile(route.slug, controller.signal);
    } else {
      resetUserProfile();
    }

    return () => {
      controller.abort();
    };
  }, [
    route,
    currentUserStatus.state,
    loadPublicUserProfile,
    loadUserProfile,
    resetUserProfile
  ]);

  const beginGoogleSignIn = (returnTo?: string) => {
    if (!apiBaseUrl) {
      return;
    }

    const authUrl = new URL("/auth/google/start", apiBaseUrl);
    authUrl.searchParams.set(
      "returnTo",
      returnTo ?? currentLocation
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

    markSignedOut();
    resetRideCredits();
    resetDemoUserStats();
    resetUserProgression();
    resetDailyChallenge();
    resetUserProfile();
    setProfileShareMessage(null);

    if (route.view === "profile" || route.view === "admin") {
      navigateHome();
    }
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

  const toggleRideCredit = async (nextRidden: boolean) => {
    if (!apiBaseUrl || route.view !== "ride" || rideDetailStatus.state !== "success") {
      return;
    }

    if (currentUserStatus.state !== "signed_in") {
      setRideCreditMessage(rideSignInPrompt);
      beginGoogleSignIn(currentLocation);

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
          markSignedOut();
          resetRideCredits();
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
