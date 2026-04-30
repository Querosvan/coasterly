import { queueTimesAttribution } from "../../i18n";
import type { Locale } from "../../i18n";
import type { ExternalInsightLink, UiCopy } from "../../lib/types";

const queueTimesAttributionUrl = "https://queue-times.com/";

export function QueueTimesExternalLinks({ links }: { links: ExternalInsightLink[] }) {
  if (links.length === 0) {
    return null;
  }

  return (
    <div className="queue-times-links">
      {links.map((link) => (
        <a
          className="catalog-inline-button catalog-inline-link"
          href={link.href}
          key={`${link.label}-${link.href}`}
          target="_blank"
          rel="noreferrer"
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}

export function QueueTimesAttribution({
  locale,
  copy
}: {
  locale: Locale;
  copy: UiCopy;
}) {
  return (
    <p className="source-note">
      {copy.common.source}:{" "}
      <a href={queueTimesAttributionUrl} target="_blank" rel="noreferrer">
        {queueTimesAttribution[locale]}
      </a>
    </p>
  );
}
