import type { ProjectSurface } from "@coasterly/types";

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

function App() {
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
