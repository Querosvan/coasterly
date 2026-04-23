import { useEffect, useState } from "react";

import type {
  HealthResponse,
  Park,
  ParkResponse,
  ParksResponse,
  Ride,
  RideResponse,
  RidesResponse,
  ProjectSurface
} from "@coasterly/types";

const surfaces: ProjectSurface[] = [
  {
    id: "web",
    name: "Web app",
    responsibility: "Home for the browser experience and future user-facing features."
  },
  {
    id: "api",
    name: "Backend API",
    responsibility: "HTTP layer for platform logic, integrations, and future persistence."
  },
  {
    id: "mobile",
    name: "Future mobile app",
    responsibility: "Reserved space for a later native or cross-platform client."
  }
];

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

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
      setParksStatus({
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

    const loadParks = async () => {
      try {
        const response = await fetch(new URL("/parks", apiBaseUrl), {
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

    void loadHealth();
    void loadParks();

    return () => {
      controller.abort();
    };
  }, []);

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

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Coasterly starter</p>
        <h1>Community-first theme park tracking starts here.</h1>
        <p className="intro">
          This monorepo is intentionally small: a web app, an API, shared
          types, and documentation that make the project easy to grow without
          overengineering it.
        </p>
      </section>

      <section className="status-panel" aria-live="polite">
        <p className="status-label">API connectivity</p>
        <p className="status-target">
          Target: <code>{apiBaseUrl || "Missing VITE_API_BASE_URL"}</code>
        </p>
        {apiStatus.state === "loading" ? (
          <p className="status-copy status-loading">
            Checking <code>/health</code>...
          </p>
        ) : null}
        {apiStatus.state === "success" ? (
          <div className="status-copy status-success">
            <p>Connected successfully.</p>
            <p>
              API status: <strong>{apiStatus.response.status}</strong>
            </p>
            <p>
              Timestamp: <code>{apiStatus.response.timestamp}</code>
            </p>
          </div>
        ) : null}
        {apiStatus.state === "error" ? (
          <div className="status-copy status-error">
            <p>Connection failed.</p>
            <p>{apiStatus.message}</p>
          </div>
        ) : null}
      </section>

      <section className="status-panel" aria-live="polite">
        <p className="status-label">Parks</p>
        {route.view === "home" && parksStatus.state === "loading" ? (
          <p className="status-copy status-loading">Loading parks...</p>
        ) : null}
        {route.view === "home" && parksStatus.state === "success" ? (
          <div className="status-copy">
            <p className="parks-summary">
              Loaded <strong>{parksStatus.parks.length}</strong> parks from the
              API.
            </p>
            <div className="parks-list">
              {parksStatus.parks.map((park) => (
                <article className="park-card" key={park.id}>
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
                  <p className="park-meta">
                    {park.city}, {park.country}
                  </p>
                  <p className="park-meta">
                    Slug: <code>{park.slug}</code>
                  </p>
                  <p className="park-status">Status: {park.status}</p>
                </article>
              ))}
            </div>
          </div>
        ) : null}
        {route.view === "home" && parksStatus.state === "error" ? (
          <div className="status-copy status-error">
            <p>Unable to load parks.</p>
            <p>{parksStatus.message}</p>
          </div>
        ) : null}
        {route.view === "park" ? (
          <div className="status-copy">
            <button className="back-link" type="button" onClick={navigateHome}>
              Back to parks
            </button>
            {parkDetailStatus.state === "loading" ? (
              <p className="status-loading">Loading park details...</p>
            ) : null}
            {parkDetailStatus.state === "success" ? (
              <article className="park-detail-card">
                <p className="status-label">Park detail</p>
                <h2 className="park-detail-name">{parkDetailStatus.park.name}</h2>
                <p className="park-meta">
                  City: {parkDetailStatus.park.city}
                </p>
                <p className="park-meta">
                  Country: {parkDetailStatus.park.country}
                </p>
                <p className="park-meta">
                  Slug: <code>{parkDetailStatus.park.slug}</code>
                </p>
                <p className="park-status">
                  Status: {parkDetailStatus.park.status}
                </p>

                <div className="rides-section">
                  <p className="status-label">Rides</p>
                  {parkRidesStatus.state === "loading" ? (
                    <p className="status-loading">Loading rides...</p>
                  ) : null}
                  {parkRidesStatus.state === "success" ? (
                    parkRidesStatus.rides.length > 0 ? (
                      <div className="rides-list">
                        {parkRidesStatus.rides.map((ride) => (
                          <article className="ride-card" key={ride.id}>
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
                            <p className="park-meta">
                              Type: {ride.rideType}
                            </p>
                            <p className="park-meta">
                              Slug: <code>{ride.slug}</code>
                            </p>
                            <p className="park-status">
                              Status: {ride.status}
                            </p>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <p className="park-meta">No rides available yet.</p>
                    )
                  ) : null}
                  {parkRidesStatus.state === "error" ? (
                    <div className="status-error">
                      <p>Unable to load rides.</p>
                      <p>{parkRidesStatus.message}</p>
                    </div>
                  ) : null}
                </div>
              </article>
            ) : null}
            {parkDetailStatus.state === "error" ? (
              <div className="status-error">
                <p>Unable to load this park.</p>
                <p>{parkDetailStatus.message}</p>
              </div>
            ) : null}
          </div>
        ) : null}
        {route.view === "ride" ? (
          <div className="status-copy">
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
              <p className="status-loading">Loading ride details...</p>
            ) : null}
            {rideDetailStatus.state === "success" ? (
              <article className="park-detail-card">
                <p className="status-label">Ride detail</p>
                <h2 className="park-detail-name">{rideDetailStatus.ride.name}</h2>
                <p className="park-meta">
                  Parent park: {rideDetailStatus.park.name}
                </p>
                <p className="park-meta">
                  Ride type: {rideDetailStatus.ride.rideType}
                </p>
                <p className="park-meta">
                  Slug: <code>{rideDetailStatus.ride.slug}</code>
                </p>
                <p className="park-status">
                  Status: {rideDetailStatus.ride.status}
                </p>
              </article>
            ) : null}
            {rideDetailStatus.state === "error" ? (
              <div className="status-error">
                <p>Unable to load this ride.</p>
                <p>{rideDetailStatus.message}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>

      <section className="surface-grid" aria-label="Project surfaces">
        {surfaces.map((surface) => (
          <article className="surface-card" key={surface.id}>
            <p className="surface-label">{surface.name}</p>
            <p className="surface-copy">{surface.responsibility}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

export default App;
