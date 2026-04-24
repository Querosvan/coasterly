import { useEffect, useState } from "react";

import type {
  DemoUserStatsResponse,
  HealthResponse,
  Park,
  ParkResponse,
  ParksResponse,
  Ride,
  RideCreditMutationResponse,
  RideCreditsResponse,
  RideResponse,
  RidesResponse
} from "@coasterly/types";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();
const brandLogoDark = "/brand/coasterly-logo-horizontal-dark.png";
const brandIconDark = "/brand/coasterly-logo-icon-dark.png";

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

const formatCountLabel = (
  count: number,
  singular: string,
  plural = `${singular}s`
) => `${count} ${count === 1 ? singular : plural}`;

const formatDecimalValue = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

type Route =
  | { view: "home" }
  | { view: "parks" }
  | { view: "discover" }
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
  | { state: "success"; park: Park }
  | { state: "error"; message: string };

type ParkRidesStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "success"; rides: Ride[] }
  | { state: "error"; message: string };

type ParkRideSort = "name" | "opening_year" | "speed_kmh";

type ParkRideOptions = {
  rideTypes: string[];
  manufacturers: string[];
};

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

type RideDetailStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "success"; park: Park; ride: Ride }
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

const defaultParkRideSort: ParkRideSort = "name";

const isParkRideSort = (value: string | null): value is ParkRideSort =>
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

const buildPathWithQuery = (pathname: string, params: URLSearchParams) => {
  const query = params.toString();

  return query ? `${pathname}?${query}` : pathname;
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

function App() {
  const [route, setRoute] = useState<Route>(() => getRoute(window.location.pathname));
  const [apiStatus, setApiStatus] = useState<ApiStatus>({ state: "loading" });
  const [searchQuery, setSearchQuery] = useState(() =>
    getSearchQueryFromUrl(window.location.search)
  );
  const [parksStatus, setParksStatus] = useState<ParksStatus>({
    state: "loading"
  });
  const [parkDetailStatus, setParkDetailStatus] = useState<ParkDetailStatus>({
    state: "idle"
  });
  const [parkRidesStatus, setParkRidesStatus] = useState<ParkRidesStatus>({
    state: "idle"
  });
  const [parkRideOptions, setParkRideOptions] = useState<ParkRideOptions>({
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
  const [rideCreditsStatus, setRideCreditsStatus] = useState<RideCreditsStatus>({
    state: "loading"
  });
  const [demoUserStatsStatus, setDemoUserStatsStatus] = useState<DemoUserStatsStatus>({
    state: "loading"
  });
  const [rideDetailStatus, setRideDetailStatus] = useState<RideDetailStatus>({
    state: "idle"
  });
  const [rideLineupStatus, setRideLineupStatus] = useState<RideLineupStatus>({
    state: "idle"
  });
  const [isUpdatingRideCredit, setIsUpdatingRideCredit] = useState(false);
  const [rideCreditMessage, setRideCreditMessage] = useState<string | null>(null);

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

  useEffect(() => {
    const syncRoute = () => {
      setRoute(getRoute(window.location.pathname));
      setSearchQuery(getSearchQueryFromUrl(window.location.search));

      const rideBrowserState = getRideBrowserStateFromUrl(window.location.search);

      setRideTypeFilter(rideBrowserState.rideType);
      setManufacturerFilter(rideBrowserState.manufacturer);
      setParkRideSort(rideBrowserState.sort);
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

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();

    if (route.view === "parks") {
      const normalizedQuery = searchQuery.trim();

      if (normalizedQuery) {
        params.set("search", normalizedQuery);
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
    }

    const nextLocation = buildPathWithQuery(window.location.pathname, params);
    const currentLocation = `${window.location.pathname}${window.location.search}`;

    if (nextLocation !== currentLocation) {
      window.history.replaceState({}, "", nextLocation);
    }
  }, [route, searchQuery, rideTypeFilter, manufacturerFilter, parkRideSort]);

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
          park: payload.park
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
          ride: payload.ride
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

  const navigateToParks = (options?: { preserveSearch?: boolean }) => {
    if (!options?.preserveSearch) {
      setSearchQuery("");
    }

    navigateWithParams(
      "/parks",
      options?.preserveSearch ? getCatalogSearchParams() : new URLSearchParams()
    );
  };

  const navigateToDiscover = () => {
    navigateWithParams("/discover", new URLSearchParams());
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

  const navigateToRide = (parkSlug: string, rideSlug: string) => {
    navigateWithParams(
      `/parks/${parkSlug}/rides/${rideSlug}`,
      getRideBrowserParams()
    );
  };

  const navigateBackToPark = (slug: string) => {
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
  const apiStatusLabel =
    apiStatus.state === "success"
      ? `API ${apiStatus.response.status}`
      : apiStatus.state === "loading"
        ? "API loading"
        : "API issue";
  const browseSummary =
    parksStatus.state === "success"
      ? hasActiveCatalogSearch
        ? `Showing ${formatCountLabel(parksStatus.parks.length, "result")} for "${normalizedSearchQuery}".`
        : `Browsing ${formatCountLabel(parksStatus.parks.length, "park")} in the current catalog.`
      : null;
  const heroCountLabel =
    parksStatus.state === "success"
      ? formatCountLabel(parksStatus.parks.length, "park")
      : "Live catalog";
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
  const parkBySlug = new Map(allParks.map((park) => [park.slug, park]));
  const featuredParks = allParks.slice(0, 4);
  const spotlightPark = featuredParks[0];
  const spotlightProgress = spotlightPark
    ? parkProgressBySlug?.get(spotlightPark.slug)
    : undefined;
  const secondaryFeaturedParks = featuredParks.slice(1, 4);
  const rankedProgressParks =
    demoUserStatsStatus.state === "success"
      ? [...demoUserStatsStatus.parks]
          .sort(
            (left, right) =>
              right.completionPercentage - left.completionPercentage ||
              right.riddenRides - left.riddenRides ||
              left.parkName.localeCompare(right.parkName)
          )
          .slice(0, 4)
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
  const parkRideSortLabel =
    parkRideSort === "name"
      ? "Name"
      : parkRideSort === "opening_year"
        ? "Opening year"
        : "Top speed";
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
      ? `${activeRideIndex + 1} of ${rideLineup.length} in current lineup`
      : rideLineupStatus.state === "success" && rideLineup.length > 0
        ? "Current ride is outside the active lineup filters"
        : null;
  const isCurrentRideRidden =
    rideDetailStatus.state === "success" &&
    riddenRideIds?.has(rideDetailStatus.ride.id) === true;
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

    rideSpecItems.push({
      label: "Slug",
      value: rideDetailStatus.ride.slug,
      code: true
    });
  }

  const parksSearchLabel = hasActiveCatalogSearch
    ? `Search: "${normalizedSearchQuery}"`
    : "All parks";
  const routeBarTitle =
    route.view === "parks"
      ? parksSearchLabel
      : route.view === "discover"
        ? "Discover"
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
      : route.view === "discover"
        ? "Discovery"
        : route.view === "journal"
          ? "Editorial roadmap"
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
      : route.view === "discover"
        ? [{ label: "Discover" }]
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
                      navigateBackToPark(
                        rideDetailStatus.state === "success"
                          ? rideDetailStatus.park.slug
                          : route.parkSlug
                      );
                    }
                  },
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
          hasActiveCatalogSearch ? "Search active" : "Browse surface"
        ].filter(Boolean)
      : route.view === "discover"
        ? [heroCountLabel, riddenRideCountLabel]
        : route.view === "journal"
          ? ["Editorial roadmap", "No CMS yet"]
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
      active: route.view === "parks" || route.view === "park" || route.view === "ride",
      onClick: () => {
        navigateToParks({ preserveSearch: true });
      }
    },
    {
      label: "Discover",
      href: "/discover",
      active: route.view === "discover",
      onClick: navigateToDiscover
    },
    {
      label: "Journal",
      href: "/journal",
      active: route.view === "journal",
      onClick: navigateToJournal
    }
  ];

  return (
    <main className="app-shell">
      <header className="topbar">
        <button className="brand-link brand-link-image" type="button" onClick={navigateHome}>
          <img className="brand-logo" src={brandLogoDark} alt="Coasterly" />
        </button>
        <nav className="topbar-nav" aria-label="Primary">
          {topNavigation.map((item) => (
            <a
              key={item.label}
              className={`topbar-nav-link${item.active ? " topbar-nav-link-active" : ""}`}
              href={item.href}
              onClick={(event) => {
                event.preventDefault();
                item.onClick();
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="topbar-meta">
          <span className="product-pill">Theme park tracker</span>
          <div className="status-cluster" aria-live="polite">
            <span className={`status-chip status-chip-${apiStatus.state}`}>
              {apiStatusLabel}
            </span>
            {demoUserStatsStatus.state === "success" ? (
              <span className="catalog-chip">
                {demoUserStatsStatus.totalRiddenRides} ridden
              </span>
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
              <div className="hero-brand">
                <img className="hero-mark" src={brandIconDark} alt="" />
                <p className="eyebrow">Coasterly</p>
              </div>
              <h1>Track parks, lineups, and ride progress without the clutter.</h1>
              <p className="hero-text">
                A cleaner public entry into Europe&apos;s major theme parks, with
                progress tracking and catalog depth ready behind the landing page.
              </p>
              <div className="hero-actions">
                <button className="primary-button" type="button" onClick={() => {
                  navigateToParks({ preserveSearch: true });
                }}>
                  Browse parks
                </button>
                <button className="secondary-button" type="button" onClick={navigateToDiscover}>
                  Discover next stops
                </button>
              </div>
              <div className="hero-stats" aria-label="Catalog summary">
                <div className="hero-stat">
                  <span className="hero-stat-label">Catalog</span>
                  <strong>{heroCountLabel}</strong>
                </div>
                <div className="hero-stat">
                  <span className="hero-stat-label">Ridden rides</span>
                  <strong>{riddenRideCountLabel}</strong>
                </div>
                <div className="hero-stat">
                  <span className="hero-stat-label">Parks ridden</span>
                  <strong>{riddenParkCountLabel}</strong>
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
                  {spotlightPark.imageUrl ? (
                    <img
                      className="spotlight-image"
                      src={spotlightPark.imageUrl}
                      alt={`${spotlightPark.name} park view`}
                    />
                  ) : null}
                  <div className="spotlight-overlay" />
                  <div className="spotlight-copy">
                    <div className="spotlight-row">
                      <span className="catalog-chip">{spotlightPark.status}</span>
                      {spotlightProgress ? (
                        <span className="catalog-chip catalog-chip-ridden">
                          {spotlightProgress.completionPercentage}% complete
                        </span>
                      ) : null}
                    </div>
                    <p className="eyebrow">Featured park</p>
                    <h2>{spotlightPark.name}</h2>
                    <p>{spotlightPark.city}, {spotlightPark.country}</p>
                  </div>
                </button>
              ) : (
                <div className="spotlight-card spotlight-card-empty">
                  <div className="spotlight-copy">
                    <p className="eyebrow">Featured park</p>
                    <h2>Catalog loading</h2>
                    <p>The current catalog will appear here once the API responds.</p>
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
                      {park.imageUrl ? (
                        <img
                          className="stack-card-image"
                          src={park.imageUrl}
                          alt=""
                        />
                      ) : null}
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
                  <p className="status-label">Start with parks</p>
                  <h2 className="section-title">Use the landing page to choose a direction, not to operate the whole app.</h2>
                  <p className="section-copy">
                    Featured parks stay visible here. Search and deeper catalog work now live in the dedicated parks surface.
                  </p>
                </div>
                <div className="landing-actions">
                  <button
                    className="catalog-inline-button"
                    type="button"
                    onClick={() => {
                      navigateToParks({ preserveSearch: true });
                    }}
                  >
                    Open parks
                  </button>
                </div>
              </div>
              <div className="parks-list parks-list-featured">
                {featuredParks.map((park) => {
                  const parkProgress = parkProgressBySlug?.get(park.slug);

                  return (
                    <article className="park-card" key={park.id}>
                      {park.imageUrl ? (
                        <div className="media-frame media-frame-park">
                          <img
                            className="media-image"
                            src={park.imageUrl}
                            alt={`${park.name} park view`}
                            loading="lazy"
                          />
                        </div>
                      ) : null}
                      <div className="card-header">
                        <a
                          className="park-link"
                          href={`/parks/${park.slug}`}
                          onClick={(event) => {
                            event.preventDefault();
                            navigateToPark(park.slug);
                          }}
                        >
                          <p className="park-name">{park.name}</p>
                        </a>
                        <span className="catalog-chip">{park.status}</span>
                      </div>
                      <p className="park-location">
                        {park.city}, {park.country}
                      </p>
                      {parkProgress ? (
                        <div className="park-progress">
                          <div className="progress-copy">
                            <span className="progress-label">Demo progress</span>
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
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="catalog-panel landing-panel">
              <div className="catalog-header landing-header">
                <div className="catalog-copy">
                  <p className="status-label">Progress</p>
                  <h2 className="section-title">Keep the value visible without dropping users into browse controls immediately.</h2>
                  <p className="section-copy">
                    Demo ride credits and park completion stay visible as a product signal, while the landing page stays compact.
                  </p>
                </div>
                <div className="landing-actions">
                  <button className="catalog-inline-button" type="button" onClick={navigateToDiscover}>
                    Open discover
                  </button>
                </div>
              </div>
              {demoUserStatsStatus.state === "success" ? (
                <div className="stats-panel stats-panel-compact" aria-label="Demo user stats">
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
                </div>
              ) : demoUserStatsStatus.state === "loading" ? (
                <div className="state-message state-message-loading">
                  <p>Loading demo rider stats...</p>
                </div>
              ) : (
                <div className="state-message state-message-error">
                  <p>Unable to load demo rider stats.</p>
                  <p>{demoUserStatsStatus.message}</p>
                </div>
              )}
            </section>
          </section>

          <section className="catalog-panel editorial-panel">
            <div className="catalog-header landing-header">
              <div className="catalog-copy">
                <p className="status-label">Future journal</p>
                <h2 className="section-title">Leave room for rankings, guides, and park news without building a CMS yet.</h2>
                <p className="section-copy">
                  The product structure now has a clear place for editorial and SEO-oriented content.
                </p>
              </div>
              <div className="landing-actions">
                <button className="catalog-inline-button" type="button" onClick={navigateToJournal}>
                  Open journal
                </button>
              </div>
            </div>
            <div className="editorial-grid">
              {journalTeasers.map((entry) => (
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
              <p className="status-label">Parks browse</p>
              <h2 className="section-title">Search the park catalog without mixing it into the landing page.</h2>
              <p className="section-copy">
                Search is URL-backed here, so results, refreshes, and direct links stay consistent.
              </p>
            </div>
            <div className="catalog-support">
              <p className="catalog-note">{browseSummary}</p>
              <p className="catalog-note">Open a park to move into the lineup and ride flow.</p>
            </div>
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
                  ? `${parksStatus.parks.length} results`
                  : "Loading results"}
              </span>
              {hasActiveCatalogSearch ? (
                <span className="catalog-chip route-chip">
                  Query: {normalizedSearchQuery}
                </span>
              ) : (
                <span className="catalog-chip route-chip">Search state is active here</span>
              )}
            </div>
          </div>

          {parksStatus.state === "loading" ? (
            <div className="state-message state-message-loading">
              <p>Loading parks...</p>
              <p>Refreshing the current catalog view from the API.</p>
            </div>
          ) : null}
          {parksStatus.state === "success" ? (
            parksStatus.parks.length > 0 ? (
              <div className="parks-list">
                {parksStatus.parks.map((park) => {
                  const parkProgress = parkProgressBySlug?.get(park.slug);

                  return (
                    <article className="park-card" key={park.id}>
                      {park.imageUrl ? (
                        <div className="media-frame media-frame-park">
                          <img
                            className="media-image"
                            src={park.imageUrl}
                            alt={`${park.name} park view`}
                            loading="lazy"
                          />
                        </div>
                      ) : null}
                      <div className="card-header">
                        <a
                          className="park-link"
                          href={`/parks/${park.slug}`}
                          onClick={(event) => {
                            event.preventDefault();
                            navigateToPark(park.slug);
                          }}
                        >
                          <p className="park-name">{park.name}</p>
                        </a>
                        <span className="catalog-chip">{park.status}</span>
                      </div>
                      <p className="park-location">
                        {park.city}, {park.country}
                      </p>
                      {parkProgress ? (
                        <div className="park-progress">
                          <div className="progress-copy">
                            <span className="progress-label">Demo progress</span>
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
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="state-message state-message-empty">
                <p>No parks match this search yet.</p>
                <p>Try a broader park name, city, or country query.</p>
              </div>
            )
          ) : null}
          {parksStatus.state === "error" ? (
            <div className="state-message state-message-error">
              <p>Unable to load parks.</p>
              <p>{parksStatus.message}</p>
            </div>
          ) : null}
        </section>
      ) : null}

      {route.view === "discover" ? (
        <section className="catalog-panel browse-panel" aria-live="polite">
          <div className="catalog-header">
            <div className="catalog-copy">
              <p className="status-label">Discover</p>
              <h2 className="section-title">Use progress and featured parks to decide where to go deeper next.</h2>
              <p className="section-copy">
                This surface stays lighter than the full browse view and points back into parks and ride detail.
              </p>
            </div>
            <div className="catalog-support">
              <p className="catalog-note">{heroCountLabel}</p>
              <p className="catalog-note">{riddenRideCountLabel}</p>
            </div>
          </div>

          {demoUserStatsStatus.state === "success" ? (
            <section className="stats-panel" aria-label="Demo rider progress">
              <div className="section-row">
                <div>
                  <p className="status-label">Demo rider progress</p>
                  <p className="section-copy">
                    Keep the next few parks visible while the public product stays compact.
                  </p>
                </div>
                <button className="catalog-inline-button" type="button" onClick={() => {
                  navigateToParks({ preserveSearch: true });
                }}>
                  Open parks
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
            </section>
          ) : null}

          <section className="catalog-panel nested-panel">
            <div className="catalog-header landing-header">
              <div className="catalog-copy">
                <p className="status-label">Featured now</p>
                <h2 className="section-title">Highlighted parks keep discovery visual and lightweight.</h2>
              </div>
            </div>
            <div className="parks-list parks-list-featured">
              {featuredProgressParks.length > 0
                ? featuredProgressParks.map(({ park, progress }) => (
                    <article className="park-card" key={park.id}>
                      {park.imageUrl ? (
                        <div className="media-frame media-frame-park">
                          <img
                            className="media-image"
                            src={park.imageUrl}
                            alt={`${park.name} park view`}
                            loading="lazy"
                          />
                        </div>
                      ) : null}
                      <div className="card-header">
                        <a
                          className="park-link"
                          href={`/parks/${park.slug}`}
                          onClick={(event) => {
                            event.preventDefault();
                            navigateToPark(park.slug);
                          }}
                        >
                          <p className="park-name">{park.name}</p>
                        </a>
                        <span className="catalog-chip catalog-chip-ridden">
                          {progress.completionPercentage}% complete
                        </span>
                      </div>
                      <p className="park-location">
                        {park.city}, {park.country}
                      </p>
                    </article>
                  ))
                : featuredParks.map((park) => (
                    <article className="park-card" key={park.id}>
                      {park.imageUrl ? (
                        <div className="media-frame media-frame-park">
                          <img
                            className="media-image"
                            src={park.imageUrl}
                            alt={`${park.name} park view`}
                            loading="lazy"
                          />
                        </div>
                      ) : null}
                      <div className="card-header">
                        <a
                          className="park-link"
                          href={`/parks/${park.slug}`}
                          onClick={(event) => {
                            event.preventDefault();
                            navigateToPark(park.slug);
                          }}
                        >
                          <p className="park-name">{park.name}</p>
                        </a>
                        <span className="catalog-chip">{park.status}</span>
                      </div>
                      <p className="park-location">
                        {park.city}, {park.country}
                      </p>
                    </article>
                  ))}
            </div>
          </section>
        </section>
      ) : null}

      {route.view === "journal" ? (
        <section className="catalog-panel browse-panel" aria-live="polite">
          <div className="catalog-header">
            <div className="catalog-copy">
              <p className="status-label">Journal</p>
              <h2 className="section-title">A future home for rankings, guides, and park news.</h2>
              <p className="section-copy">
                The route exists now so the product structure can scale into editorial and SEO-oriented content later.
              </p>
            </div>
            <div className="catalog-support">
              <p className="catalog-note">No CMS or publishing backend yet.</p>
              <p className="catalog-note">This is an information architecture placeholder, not a dead-end landing panel.</p>
            </div>
          </div>
          <div className="editorial-grid">
            {journalTeasers.map((entry) => (
              <article className="editorial-card" key={entry.title}>
                <span className="editorial-tag">{entry.category}</span>
                <h3>{entry.title}</h3>
                <p>{entry.summary}</p>
                <button className="catalog-inline-button" type="button" onClick={navigateToDiscover}>
                  Explore discover
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
              <p className="detail-nav-copy">
                Return to the parks surface or stay here to work through this park&apos;s lineup.
              </p>
            </div>
            {parkDetailStatus.state === "loading" ? (
              <div className="state-message state-message-loading">
                <p>Loading park details...</p>
                <p>Pulling the park profile, progress, and lineup from the API.</p>
              </div>
            ) : null}
            {parkDetailStatus.state === "success" ? (
              <article className="detail-card detail-card-park">
                <div className="detail-header detail-header-feature">
                  <div>
                    <p className="status-label">Park profile</p>
                    <h2 className="detail-title">{parkDetailStatus.park.name}</h2>
                    <p className="section-copy detail-summary">
                      {parkDetailStatus.park.city}, {parkDetailStatus.park.country}. Review the lineup, keep filters close, and move into ride detail when needed.
                    </p>
                    <div className="detail-micro-nav" aria-label="Park route context">
                      <span className="detail-micro-item">Parks to park</span>
                      <span className="detail-micro-item">
                        {activeParkProgress
                          ? `${activeParkProgress.totalRides} tracked rides`
                          : "Ride lineup available"}
                      </span>
                    </div>
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

                {parkDetailStatus.park.imageUrl || activeParkProgress ? (
                  <div className="detail-overview">
                    {parkDetailStatus.park.imageUrl ? (
                      <div className="media-frame media-frame-detail">
                        <img
                          className="media-image"
                          src={parkDetailStatus.park.imageUrl}
                          alt={`${parkDetailStatus.park.name} park view`}
                        />
                      </div>
                    ) : null}
                    {activeParkProgress ? (
                      <div className="progress-card">
                        <p className="status-label">Demo rider progress</p>
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
                          {`${activeParkProgress.riddenRides} of ${activeParkProgress.totalRides} rides ridden in this park.`}
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : null}

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
                    <span className="detail-item-label">Slug</span>
                    <p><code>{parkDetailStatus.park.slug}</code></p>
                  </div>
                </div>

                <div className="rides-section">
                  <div className="section-row">
                    <div>
                      <p className="status-label">Ride lineup</p>
                      <p className="section-copy">
                        Filter and sort the tracked rides inside the park surface.
                      </p>
                    </div>
                    <div className="detail-chip-row">
                      {parkRidesStatus.state === "success" ? (
                        <span className="catalog-chip">
                          {formatCountLabel(parkRidesStatus.rides.length, "ride")}
                        </span>
                      ) : null}
                      <span className="catalog-chip route-chip">Open a ride for full specs</span>
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
                    <p className="parks-summary">
                      Filters: <strong>{rideTypeFilter || "All ride types"}</strong>
                      {" | "}
                      <strong>{manufacturerFilter || "All manufacturers"}</strong>
                      {" | "}
                      <strong>{parkRideSortLabel}</strong>
                    </p>
                    <div className="catalog-state-row">
                      <span className="catalog-chip route-chip">State lives in the URL</span>
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
                          Reset lineup view
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
                        {parkRidesStatus.rides.map((ride) => (
                          <article
                            className={`ride-card${riddenRideIds?.has(ride.id) ? " ride-card-ridden" : ""}`}
                            key={ride.id}
                          >
                            {ride.imageUrl ? (
                              <div className="media-frame media-frame-ride-card">
                                <img
                                  className="media-image"
                                  src={ride.imageUrl}
                                  alt=""
                                  loading="lazy"
                                />
                              </div>
                            ) : null}
                            <div className="card-header">
                              <a
                                className="ride-link"
                                href={buildPathWithQuery(
                                  `/parks/${route.slug}/rides/${ride.slug}`,
                                  getRideBrowserParams()
                                )}
                                onClick={(event) => {
                                  event.preventDefault();
                                  navigateToRide(route.slug, ride.slug);
                                }}
                              >
                                <p className="ride-name">{ride.name}</p>
                              </a>
                              <div className="ride-card-chips">
                                {riddenRideIds?.has(ride.id) ? (
                                  <span className="catalog-chip catalog-chip-ridden">
                                    Ridden
                                  </span>
                                ) : null}
                                <span className="catalog-chip">{ride.status}</span>
                              </div>
                            </div>
                            <p className="park-meta">Type: {ride.rideType}</p>
                            {ride.manufacturer ? (
                              <p className="park-meta">Maker: {ride.manufacturer}</p>
                            ) : null}
                          </article>
                        ))}
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
                  navigateBackToPark(route.parkSlug);
                }}
              >
                Back to lineup
              </button>
              <p className="detail-nav-copy">
                Return to the park lineup or move through rides without leaving this park context.
              </p>
            </div>
            {rideDetailStatus.state === "loading" ? (
              <div className="state-message state-message-loading">
                <p>Loading ride details...</p>
                <p>Pulling the ride profile, media, and credit state from the API.</p>
              </div>
            ) : null}
            {rideDetailStatus.state === "success" ? (
              <article className="detail-card detail-card-ride">
                <div className="detail-header detail-header-feature">
                  <div>
                    <p className="status-label">Ride profile</p>
                    <h2 className="detail-title">{rideDetailStatus.ride.name}</h2>
                    <p className="section-copy detail-summary">
                      Inside {rideDetailStatus.park.name}. Ride detail stays focused while the surrounding park context remains visible.
                    </p>
                    <div className="detail-micro-nav" aria-label="Ride route context">
                      <span className="detail-micro-item">
                        In {rideDetailStatus.park.city}, {rideDetailStatus.park.country}
                      </span>
                      <span className="detail-micro-item">
                        {rideDetailStatus.ride.rideType}
                      </span>
                    </div>
                  </div>
                  <div className="detail-chip-row">
                    <span className="catalog-chip">{rideDetailStatus.ride.status}</span>
                    {isCurrentRideRidden ? (
                      <span className="catalog-chip catalog-chip-ridden">Ridden</span>
                    ) : null}
                  </div>
                </div>

                {rideDetailStatus.ride.imageUrl ? (
                  <div className="media-frame media-frame-detail">
                    <img
                      className="media-image"
                      src={rideDetailStatus.ride.imageUrl}
                      alt={`${rideDetailStatus.ride.name} ride view`}
                    />
                  </div>
                ) : null}

                <div className="credit-panel">
                  <div>
                    <p className="status-label">Demo rider</p>
                    <p className="credit-copy">
                      {rideCreditsStatus.state === "success"
                        ? `${rideCreditsStatus.userName} can track whether this ride has been ridden.`
                        : rideCreditsStatus.state === "error"
                          ? rideCreditsStatus.message
                          : "Ride credit state is loading."}
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
                        ? "Remove ridden credit"
                        : "Mark as ridden"}
                  </button>
                </div>
                {rideCreditMessage ? (
                  <p className="credit-copy">{rideCreditMessage}</p>
                ) : null}

                <div className="lineup-nav-panel">
                  <div>
                    <p className="status-label">Ride lineup navigation</p>
                    <p className="credit-copy">
                      {rideLineupStatus.state === "success"
                        ? rideLineupPositionLabel ||
                          "Move through the current park lineup without returning to the park page."
                        : rideLineupStatus.state === "loading"
                          ? "Loading the current park lineup."
                          : rideLineupStatus.state === "error"
                            ? rideLineupStatus.message
                            : "Lineup navigation is unavailable."}
                    </p>
                  </div>
                  <div className="lineup-nav-actions">
                    <button
                      className="lineup-nav-button"
                      type="button"
                      onClick={() => {
                        if (previousRide) {
                          navigateToRide(route.parkSlug, previousRide.slug);
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
                          navigateToRide(route.parkSlug, nextRide.slug);
                        }
                      }}
                      disabled={!nextRide}
                    >
                      Next ride
                    </button>
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

      <footer className="developer-footer" aria-live="polite">
        <div className="developer-status">
          <span className={`status-chip status-chip-${apiStatus.state}`}>
            {apiStatusLabel}
          </span>
          <p className="developer-copy">
            {apiStatus.state === "success"
              ? `Updated ${apiStatus.response.timestamp}`
              : apiStatus.state === "loading"
                ? "Checking /health"
                : apiStatus.message}
          </p>
        </div>
        <p className="developer-copy">
          API source: <code>{apiBaseUrl || "Missing VITE_API_BASE_URL"}</code>
        </p>
      </footer>
    </main>
  );
}

function catalogStateChip(status: ParksStatus) {
  if (status.state === "success") {
    return `${status.parks.length} results`;
  }

  if (status.state === "loading") {
    return "Loading results";
  }

  return "Catalog unavailable";
}

export default App;
