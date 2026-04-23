import { useEffect, useState } from "react";

import type {
  HealthResponse,
  Park,
  ParksResponse,
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

type ApiStatus =
  | { state: "loading" }
  | { state: "success"; response: HealthResponse }
  | { state: "error"; message: string };

type ParksStatus =
  | { state: "loading" }
  | { state: "success"; parks: Park[] }
  | { state: "error"; message: string };

function App() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>({ state: "loading" });
  const [parksStatus, setParksStatus] = useState<ParksStatus>({
    state: "loading"
  });

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
        {parksStatus.state === "loading" ? (
          <p className="status-copy status-loading">Loading parks...</p>
        ) : null}
        {parksStatus.state === "success" ? (
          <div className="status-copy">
            <p className="parks-summary">
              Loaded <strong>{parksStatus.parks.length}</strong> parks from the
              API.
            </p>
            <div className="parks-list">
              {parksStatus.parks.map((park) => (
                <article className="park-card" key={park.id}>
                  <p className="park-name">{park.name}</p>
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
        {parksStatus.state === "error" ? (
          <div className="status-copy status-error">
            <p>Unable to load parks.</p>
            <p>{parksStatus.message}</p>
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
