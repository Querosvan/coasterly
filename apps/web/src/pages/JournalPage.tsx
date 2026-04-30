import type { UiCopy } from "../lib/types";

type JournalEntry = {
  category: string;
  title: string;
  summary: string;
  status: string;
};

type JournalPageProps = {
  journalTeasers: readonly JournalEntry[];
  copy: UiCopy;
  onBrowseParks: () => void;
};

export function JournalPage({ journalTeasers, copy, onBrowseParks }: JournalPageProps) {
  return (
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
            <button className="catalog-inline-button" type="button" onClick={onBrowseParks}>
              {copy.journal.browseParks}
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
