import { useCallback, useEffect, type Dispatch, type SetStateAction } from "react";
import { useNavigate, type Location, type NavigateFunction } from "react-router-dom";

import {
  buildPathWithQuery,
  defaultCatalogPage,
  defaultParkRideSort,
  defaultRidesCatalogSort
} from "../lib/routes";
import type {
  ParksStatus,
  ParkRideSort,
  RideDetailOrigin,
  RidesCatalogSort,
  RidesCatalogStatus,
  Route
} from "../lib/types";

export type NavigateToParksOptions = {
  preserveSearch?: boolean;
  collectionId?: string;
};

export type NavigateToRidesOptions = {
  preserveFilters?: boolean;
  collectionId?: string;
};

export type NavigateToParkOptions = {
  preserveRideBrowserState?: boolean;
};

export type NavigateToRideOptions = {
  origin?: RideDetailOrigin;
};

export type UseAppNavigationOptions = {
  route: Route;
  location: Location;
  currentLocation: string;
  parksStatus: ParksStatus;
  ridesCatalogStatus: RidesCatalogStatus;
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  parkCollectionId: string;
  setParkCollectionId: Dispatch<SetStateAction<string>>;
  parksPage: number;
  setParksPage: Dispatch<SetStateAction<number>>;
  rideTypeFilter: string;
  setRideTypeFilter: Dispatch<SetStateAction<string>>;
  manufacturerFilter: string;
  setManufacturerFilter: Dispatch<SetStateAction<string>>;
  parkRideSort: ParkRideSort;
  setParkRideSort: Dispatch<SetStateAction<ParkRideSort>>;
  rideCatalogSearchQuery: string;
  setRideCatalogSearchQuery: Dispatch<SetStateAction<string>>;
  rideCatalogParkFilter: string;
  setRideCatalogParkFilter: Dispatch<SetStateAction<string>>;
  rideCatalogRideTypeFilter: string;
  setRideCatalogRideTypeFilter: Dispatch<SetStateAction<string>>;
  rideCatalogManufacturerFilter: string;
  setRideCatalogManufacturerFilter: Dispatch<SetStateAction<string>>;
  rideCatalogSort: RidesCatalogSort;
  setRideCatalogSort: Dispatch<SetStateAction<RidesCatalogSort>>;
  ridesCatalogPage: number;
  setRidesCatalogPage: Dispatch<SetStateAction<number>>;
  rideCollectionId: string;
  setRideCollectionId: Dispatch<SetStateAction<string>>;
  rideDetailOrigin: RideDetailOrigin;
  setRideDetailOrigin: Dispatch<SetStateAction<RideDetailOrigin>>;
  resetAdminCatalog: () => void;
};

export type UseAppNavigationResult = {
  getCatalogSearchParams: () => URLSearchParams;
  getRidesCatalogParams: () => URLSearchParams;
  getRideBrowserParams: () => URLSearchParams;
  navigateWithParams: (pathname: string, params: URLSearchParams) => void;
  navigateHome: () => void;
  navigateToParks: (options?: NavigateToParksOptions) => void;
  navigateToRides: (options?: NavigateToRidesOptions) => void;
  navigateToAdmin: () => void;
  navigateToDiscover: () => void;
  navigateToProfile: () => void;
  navigateToPublicProfile: (userSlug: string) => void;
  navigateToJournal: () => void;
  navigateToPark: (slug: string, options?: NavigateToParkOptions) => void;
  navigateToRide: (
    parkSlug: string,
    rideSlug: string,
    options?: NavigateToRideOptions
  ) => void;
  navigateBackFromRide: (slug: string) => void;
  goToPreviousParksPage: () => void;
  goToNextParksPage: () => void;
  goToPreviousRidesCatalogPage: () => void;
  goToNextRidesCatalogPage: () => void;
};

const useStableNavigate = (): NavigateFunction => useNavigate();

export const useAppNavigation = ({
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
}: UseAppNavigationOptions): UseAppNavigationResult => {
  const navigate = useStableNavigate();

  const getCatalogSearchParams = useCallback(() => {
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
  }, [parkCollectionId, parksPage, searchQuery]);

  const getRidesCatalogParams = useCallback(() => {
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
  }, [
    rideCatalogManufacturerFilter,
    rideCatalogParkFilter,
    rideCatalogRideTypeFilter,
    rideCatalogSearchQuery,
    rideCatalogSort,
    rideCollectionId,
    ridesCatalogPage
  ]);

  const getRideBrowserParams = useCallback(() => {
    const params = new URLSearchParams();

    if (rideTypeFilter) {
      params.set("rideType", rideTypeFilter);
    }

    if (manufacturerFilter) {
      params.set("manufacturer", manufacturerFilter);
    }

    params.set("sort", parkRideSort);

    return params;
  }, [manufacturerFilter, parkRideSort, rideTypeFilter]);

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

    const nextLocation = buildPathWithQuery(location.pathname, params);

    if (nextLocation !== currentLocation) {
      navigate(nextLocation, { replace: true });
    }
  }, [
    currentLocation,
    getCatalogSearchParams,
    location.pathname,
    manufacturerFilter,
    navigate,
    parkCollectionId,
    parkRideSort,
    parksPage,
    rideCatalogManufacturerFilter,
    rideCatalogParkFilter,
    rideCatalogRideTypeFilter,
    rideCatalogSearchQuery,
    rideCatalogSort,
    rideCollectionId,
    rideDetailOrigin,
    rideTypeFilter,
    ridesCatalogPage,
    route,
    searchQuery
  ]);

  const navigateWithParams = useCallback(
    (pathname: string, params: URLSearchParams) => {
      const nextLocation = buildPathWithQuery(pathname, params);

      if (currentLocation !== nextLocation) {
        navigate(nextLocation);
      }
    },
    [currentLocation, navigate]
  );

  const navigateHome = useCallback(() => {
    navigateWithParams("/", new URLSearchParams());
  }, [navigateWithParams]);

  const navigateToParks = useCallback(
    (options?: NavigateToParksOptions) => {
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
    },
    [
      navigateWithParams,
      parkCollectionId,
      parksPage,
      searchQuery,
      setParkCollectionId,
      setParksPage,
      setSearchQuery
    ]
  );

  const navigateToRides = useCallback(
    (options?: NavigateToRidesOptions) => {
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
    },
    [
      getRidesCatalogParams,
      navigateWithParams,
      rideCollectionId,
      ridesCatalogPage,
      setRideCatalogManufacturerFilter,
      setRideCatalogParkFilter,
      setRideCatalogRideTypeFilter,
      setRideCatalogSearchQuery,
      setRideCatalogSort,
      setRideCollectionId,
      setRidesCatalogPage
    ]
  );

  const navigateToAdmin = useCallback(() => {
    resetAdminCatalog();
    navigateWithParams("/admin", new URLSearchParams());
  }, [navigateWithParams, resetAdminCatalog]);

  const goToPreviousParksPage = useCallback(() => {
    setParksPage((currentPage) =>
      currentPage > defaultCatalogPage ? currentPage - 1 : currentPage
    );
  }, [setParksPage]);

  const goToNextParksPage = useCallback(() => {
    if (parksStatus.state !== "success" || !parksStatus.pageInfo?.hasMore) {
      return;
    }

    setParksPage((currentPage) => currentPage + 1);
  }, [parksStatus, setParksPage]);

  const goToPreviousRidesCatalogPage = useCallback(() => {
    setRidesCatalogPage((currentPage) =>
      currentPage > defaultCatalogPage ? currentPage - 1 : currentPage
    );
  }, [setRidesCatalogPage]);

  const goToNextRidesCatalogPage = useCallback(() => {
    if (ridesCatalogStatus.state !== "success" || !ridesCatalogStatus.pageInfo?.hasMore) {
      return;
    }

    setRidesCatalogPage((currentPage) => currentPage + 1);
  }, [ridesCatalogStatus, setRidesCatalogPage]);

  const navigateToDiscover = useCallback(() => {
    navigateWithParams("/discover", new URLSearchParams());
  }, [navigateWithParams]);

  const navigateToProfile = useCallback(() => {
    navigateWithParams("/profile", new URLSearchParams());
  }, [navigateWithParams]);

  const navigateToPublicProfile = useCallback(
    (userSlug: string) => {
      navigateWithParams(`/users/${userSlug}`, new URLSearchParams());
    },
    [navigateWithParams]
  );

  const navigateToJournal = useCallback(() => {
    navigateWithParams("/journal", new URLSearchParams());
  }, [navigateWithParams]);

  const navigateToPark = useCallback(
    (slug: string, options?: NavigateToParkOptions) => {
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
    },
    [
      getCatalogSearchParams,
      getRideBrowserParams,
      navigateWithParams,
      route.view,
      setManufacturerFilter,
      setParkRideSort,
      setRideTypeFilter
    ]
  );

  const navigateToRide = useCallback(
    (parkSlug: string, rideSlug: string, options?: NavigateToRideOptions) => {
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
    },
    [
      getRideBrowserParams,
      getRidesCatalogParams,
      navigateWithParams,
      rideCatalogManufacturerFilter,
      rideCatalogRideTypeFilter,
      rideCatalogSort,
      setManufacturerFilter,
      setParkRideSort,
      setRideDetailOrigin,
      setRideTypeFilter
    ]
  );

  const navigateBackFromRide = useCallback(
    (slug: string) => {
      if (rideDetailOrigin === "rides") {
        navigateToRides({ preserveFilters: true });

        return;
      }

      navigateToPark(slug, { preserveRideBrowserState: true });
    },
    [navigateToPark, navigateToRides, rideDetailOrigin]
  );

  return {
    getCatalogSearchParams,
    getRidesCatalogParams,
    getRideBrowserParams,
    navigateWithParams,
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
  };
};
