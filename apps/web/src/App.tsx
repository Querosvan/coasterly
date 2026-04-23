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

const formatCountLabel = (
  count: number,
  singular: string,
  plural = `${singular}s`
) => `${count} ${count === 1 ? singular : plural}`;

const formatDecimalValue = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

type Route =
  | { view: "home" }
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

type RideSpecItem = {
  label: string;
  value: string;
  wide?: true;
  code?: true;
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

  const match = pathname.match(/^\/parks\/([^/]+)\/?$/);

  if (match?.[1]) {
    return {
      view: "park",
      slug: decodeURIComponent(match[1])
    };
  }

  return { view: "home" };
};

function App() {
  const [route, setRoute] = useState<Route>(() => getRoute(window.location.pathname));
  const [apiStatus, setApiStatus] = useState<ApiStatus>({ state: "loading" });
  const [searchQuery, setSearchQuery] = useState("");
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
  const [rideTypeFilter, setRideTypeFilter] = useState("");
  const [manufacturerFilter, setManufacturerFilter] = useState("");
  const [parkRideSort, setParkRideSort] = useState<ParkRideSort>("name");
  const [rideCreditsStatus, setRideCreditsStatus] = useState<RideCreditsStatus>({
    state: "loading"
  });
  const [demoUserStatsStatus, setDemoUserStatsStatus] = useState<DemoUserStatsStatus>({
    state: "loading"
  });
  const [rideDetailStatus, setRideDetailStatus] = useState<RideDetailStatus>({
    state: "idle"
  });
  const [isUpdatingRideCredit, setIsUpdatingRideCredit] = useState(false);
  const [rideCreditMessage, setRideCreditMessage] = useState<string | null>(null);

  const activeParkSlug = route.view === "park" ? route.slug : null;

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
    if (!apiBaseUrl) {
      setParksStatus({
        state: "error",
        message: "VITE_API_BASE_URL is not configured."
      });

      return;
    }

    const controller = new AbortController();
    const normalizedSearchQuery = searchQuery.trim();

    setParksStatus({ state: "loading" });

    const timeoutId = window.setTimeout(() => {
      const loadParks = async () => {
        try {
          const parksUrl = new URL("/parks", apiBaseUrl);

          if (normalizedSearchQuery) {
            parksUrl.searchParams.set("search", normalizedSearchQuery);
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
    }, normalizedSearchQuery ? 250 : 0);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [searchQuery]);

  useEffect(() => {
    setRideTypeFilter("");
    setManufacturerFilter("");
    setParkRideSort("name");
    setParkRideOptions({
      rideTypes: [],
      manufacturers: []
    });
  }, [activeParkSlug]);

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

        if (!rideTypeFilter && !manufacturerFilter) {
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
        }
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

  const navigateToPark = (slug: string) => {
    const nextPath = `/parks/${slug}`;

    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
      setRoute({ view: "park", slug });
    }
  };

  const navigateToRide = (parkSlug: string, rideSlug: string) => {
    const nextPath = `/parks/${parkSlug}/rides/${rideSlug}`;

    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, "", nextPath);
      setRoute({ view: "ride", parkSlug, rideSlug });
    }
  };

  const navigateHome = () => {
    if (window.location.pathname !== "/") {
      window.history.pushState({}, "", "/");
      setRoute({ view: "home" });
    }
  };

  const navigateBackToPark = (slug: string) => {
    navigateToPark(slug);
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
        setRideCreditMessage(
          `Unable to update ride credit (${response.status}).`
        );

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
  const catalogEyebrow =
    route.view === "home"
      ? "Public catalog"
      : route.view === "park"
        ? "Park profile"
        : "Ride profile";
  const catalogTitle =
    route.view === "home"
      ? "Browse parks"
      : route.view === "park"
        ? "Park detail"
        : "Ride detail";
  const catalogCopy =
    route.view === "home"
      ? "Search the live park catalog by park name, country, or city."
      : route.view === "park"
        ? "Review the selected park and the rides currently tracked inside it."
        : "Review the selected ride with its parent park context.";
  const homeSummary =
    parksStatus.state === "success"
      ? normalizedSearchQuery
        ? `Showing ${formatCountLabel(parksStatus.parks.length, "result")} for "${normalizedSearchQuery}".`
        : `Loaded ${formatCountLabel(parksStatus.parks.length, "park")} from the API.`
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
      ? formatCountLabel(
          demoUserStatsStatus.totalParksWithRiddenRides,
          "park"
        )
      : demoUserStatsStatus.state === "loading"
        ? "Loading stats"
        : "Stats unavailable";
  const apiStatusLabel =
    apiStatus.state === "success"
      ? `API ${apiStatus.response.status}`
      : apiStatus.state === "loading"
        ? "API loading"
        : "API issue";
  const parkProgressBySlug =
    demoUserStatsStatus.state === "success"
      ? new Map(
          demoUserStatsStatus.parks.map((park) => [park.parkSlug, park])
        )
      : null;
  const activeParkProgress =
    route.view === "park" ? parkProgressBySlug?.get(route.slug) : undefined;
  const riddenRideIds =
    rideCreditsStatus.state === "success" ? new Set(rideCreditsStatus.rideIds) : null;
  const isCurrentRideRidden =
    rideDetailStatus.state === "success" &&
    riddenRideIds?.has(rideDetailStatus.ride.id) === true;
  const parkRideSortLabel =
    parkRideSort === "name"
      ? "Name"
      : parkRideSort === "opening_year"
        ? "Opening year"
        : "Top speed";
  const rideSpecItems: RideSpecItem[] = [];

  if (rideDetailStatus.state === "success") {
    rideSpecItems.push({
      label: "Parent park",
      value: rideDetailStatus.park.name,
      wide: true
    });
    rideSpecItems.push({
      label: "Ride type",
      value: rideDetailStatus.ride.rideType
    });

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

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <button className="brand-link" type="button" onClick={navigateHome}>
            Coasterly
          </button>
          <p className="topbar-copy">Track parks and rides in one clean public catalog.</p>
        </div>
        <span className="product-pill">Public catalog</span>
      </header>

      <section className="intro-strip">
        <div className="intro-copy">
          <p className="eyebrow">Theme park tracker</p>
          <h1>Find parks faster and move deeper into each lineup.</h1>
          <p className="intro">
            Coasterly is shaping into a public catalog for parks and rides.
            Search the live catalog, open a park, and move into each tracked ride.
          </p>
        </div>

        <div className="intro-stats" aria-label="Catalog summary">
          <div className="intro-stat">
            <span className="intro-stat-label">Catalog</span>
            <strong>{heroCountLabel}</strong>
          </div>
          <div className="intro-stat">
            <span className="intro-stat-label">Ridden rides</span>
            <strong>{riddenRideCountLabel}</strong>
          </div>
          <div className="intro-stat">
            <span className="intro-stat-label">Parks ridden</span>
            <strong>{riddenParkCountLabel}</strong>
          </div>
        </div>
      </section>

      <section className="catalog-panel" aria-live="polite">
        <div className="catalog-header">
          <div className="catalog-copy">
            <p className="status-label">{catalogEyebrow}</p>
            <h2 className="section-title">{catalogTitle}</h2>
            <p className="section-copy">{catalogCopy}</p>
          </div>

          {route.view === "home" ? (
            <div className="search-controls">
              <label className="search-label" htmlFor="park-search">
                Search by park name, country, or city
              </label>
              <input
                id="park-search"
                className="search-input"
                type="search"
                name="park-search"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                }}
                placeholder="Search parks"
              />
            </div>
          ) : null}
        </div>

        {route.view === "home" && parksStatus.state === "loading" ? (
          <div className="state-message state-message-loading">
            <p>Loading parks...</p>
          </div>
        ) : null}
        {route.view === "home" && parksStatus.state === "success" ? (
          <div className="catalog-content">
            {parksStatus.parks.length > 0 ? (
              <>
                <p className="parks-summary">{homeSummary}</p>
                {demoUserStatsStatus.state === "success" ? (
                  <section className="stats-panel" aria-label="Demo user stats">
                    <div className="section-row">
                      <div>
                        <p className="status-label">Demo rider stats</p>
                        <p className="section-copy">
                          {demoUserStatsStatus.userName}'s current progress based on ride credits.
                        </p>
                      </div>
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
                    {demoUserStatsStatus.parks.length > 0 ? (
                      <div className="stats-breakdown">
                        {demoUserStatsStatus.parks.map((park) => (
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
                              {`${park.riddenRides}/${park.totalRides} ridden | ${park.completionPercentage}% complete`}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="state-message state-message-empty">
                        <p>No ridden rides yet.</p>
                        <p>Open a ride and mark it as ridden to start tracking progress.</p>
                      </div>
                    )}
                  </section>
                ) : null}
                {demoUserStatsStatus.state === "loading" ? (
                  <div className="state-message state-message-loading">
                    <p>Loading demo user stats...</p>
                  </div>
                ) : null}
                {demoUserStatsStatus.state === "error" ? (
                  <div className="state-message state-message-error">
                    <p>Unable to load demo user stats.</p>
                    <p>{demoUserStatsStatus.message}</p>
                  </div>
                ) : null}
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
                        <p className="park-meta">
                          Slug: <code>{park.slug}</code>
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
              </>
            ) : (
              <div className="state-message state-message-empty">
                <p>No parks match this search yet.</p>
                <p>Try a broader park name, city, or country query.</p>
              </div>
            )}
          </div>
        ) : null}
        {route.view === "home" && parksStatus.state === "error" ? (
          <div className="state-message state-message-error">
            <p>Unable to load parks.</p>
            <p>{parksStatus.message}</p>
          </div>
        ) : null}
        {route.view === "park" ? (
          <div className="detail-layout">
            <button className="back-link" type="button" onClick={navigateHome}>
              Back to parks
            </button>
            {parkDetailStatus.state === "loading" ? (
              <div className="state-message state-message-loading">
                <p>Loading park details...</p>
              </div>
            ) : null}
            {parkDetailStatus.state === "success" ? (
              <article className="detail-card">
                <div className="detail-header">
                  <div>
                    <p className="status-label">Park detail</p>
                    <h3 className="detail-title">{parkDetailStatus.park.name}</h3>
                  </div>
                  <span className="catalog-chip">
                    {parkDetailStatus.park.status}
                  </span>
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
                      <p className="status-label">Rides</p>
                      <p className="section-copy">
                        Current rides tracked for this park.
                      </p>
                    </div>
                    {parkRidesStatus.state === "success" ? (
                      <span className="catalog-chip">
                        {formatCountLabel(parkRidesStatus.rides.length, "ride")}
                      </span>
                    ) : null}
                  </div>
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
                    Filters:{" "}
                    <strong>
                      {rideTypeFilter || "All ride types"}
                    </strong>
                    {" | "}
                    <strong>
                      {manufacturerFilter || "All manufacturers"}
                    </strong>
                    {" | "}
                    <strong>{parkRideSortLabel}</strong>
                  </p>
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
                            <div className="card-header">
                              <a
                                className="ride-link"
                                href={`/parks/${route.slug}/rides/${ride.slug}`}
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
                            <p className="park-location">Inside {parkDetailStatus.park.name}</p>
                            <p className="park-meta">
                              Slug: <code>{ride.slug}</code>
                            </p>
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
        ) : null}
        {route.view === "ride" ? (
          <div className="detail-layout">
            <button
              className="back-link"
              type="button"
              onClick={() => {
                navigateBackToPark(route.parkSlug);
              }}
            >
              Back to park
            </button>
            {rideDetailStatus.state === "loading" ? (
              <div className="state-message state-message-loading">
                <p>Loading ride details...</p>
              </div>
            ) : null}
            {rideDetailStatus.state === "success" ? (
              <article className="detail-card">
                <div className="detail-header">
                  <div>
                    <p className="status-label">Ride detail</p>
                    <h3 className="detail-title">{rideDetailStatus.ride.name}</h3>
                  </div>
                  <span className="catalog-chip">
                    {rideDetailStatus.ride.status}
                  </span>
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
        ) : null}
      </section>

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
          Source: <code>{apiBaseUrl || "Missing VITE_API_BASE_URL"}</code>
        </p>
      </footer>
    </main>
  );
}

export default App;
