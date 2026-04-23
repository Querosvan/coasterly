import { useEffect, useState } from "react";

import type {
  HealthResponse,
  Park,
  ParkResponse,
  ParksResponse,
  Ride,
  RideResponse,
  RidesResponse
} from "@coasterly/types";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

const formatCountLabel = (
  count: number,
  singular: string,
  plural = `${singular}s`
) => `${count} ${count === 1 ? singular : plural}`;

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

type RideDetailStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "success"; park: Park; ride: Ride }
  | { state: "error"; message: string };

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
  const [rideDetailStatus, setRideDetailStatus] = useState<RideDetailStatus>({
    state: "idle"
  });

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
    if (route.view !== "park") {
      setParkDetailStatus({ state: "idle" });
      setParkRidesStatus({ state: "idle" });

      return;
    }

    if (!apiBaseUrl) {
      setParkDetailStatus({
        state: "error",
        message: "VITE_API_BASE_URL is not configured."
      });
      setParkRidesStatus({
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

    const loadRides = async () => {
      setParkRidesStatus({ state: "loading" });

      try {
        const response = await fetch(
          new URL(`/parks/${route.slug}/rides`, apiBaseUrl),
          { signal: controller.signal }
        );

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

    void Promise.all([loadPark(), loadRides()]);

    return () => {
      controller.abort();
    };
  }, [route]);

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
  const apiStatusLabel =
    apiStatus.state === "success"
      ? `API ${apiStatus.response.status}`
      : apiStatus.state === "loading"
        ? "API loading"
        : "API issue";

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
            <span className="intro-stat-label">Coverage</span>
            <strong>Parks and rides</strong>
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
                <div className="parks-list">
                  {parksStatus.parks.map((park) => (
                    <article className="park-card" key={park.id}>
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
                    </article>
                  ))}
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
                  {parkRidesStatus.state === "loading" ? (
                    <div className="state-message state-message-loading">
                      <p>Loading rides...</p>
                    </div>
                  ) : null}
                  {parkRidesStatus.state === "success" ? (
                    parkRidesStatus.rides.length > 0 ? (
                      <div className="rides-list">
                        {parkRidesStatus.rides.map((ride) => (
                          <article className="ride-card" key={ride.id}>
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
                              <span className="catalog-chip">{ride.status}</span>
                            </div>
                            <p className="park-meta">Type: {ride.rideType}</p>
                            <p className="park-location">Inside {parkDetailStatus.park.name}</p>
                            <p className="park-meta">
                              Slug: <code>{ride.slug}</code>
                            </p>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <div className="state-message state-message-empty">
                        <p>No rides available yet.</p>
                        <p>This park has no seeded rides in the current catalog.</p>
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

                <div className="detail-grid">
                  <div className="detail-item detail-item-wide">
                    <span className="detail-item-label">Parent park</span>
                    <p>{rideDetailStatus.park.name}</p>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item-label">Ride type</span>
                    <p>{rideDetailStatus.ride.rideType}</p>
                  </div>
                  <div className="detail-item">
                    <span className="detail-item-label">Slug</span>
                    <p><code>{rideDetailStatus.ride.slug}</code></p>
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
