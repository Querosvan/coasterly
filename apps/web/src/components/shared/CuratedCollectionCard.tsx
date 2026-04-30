import { formatCountLabel } from "../../i18n";
import type { Locale } from "../../i18n";
import type { CuratedCollection, UiCopy } from "../../lib/types";

type CuratedCollectionCardProps = {
  collection: CuratedCollection;
  isActive?: boolean;
  onOpen: () => void;
  locale: Locale;
  copy: UiCopy;
};

export function CuratedCollectionCard({
  collection,
  isActive = false,
  onOpen,
  locale,
  copy
}: CuratedCollectionCardProps) {
  return (
    <button
      className={`collection-card${isActive ? " collection-card-active" : ""}`}
      type="button"
      onClick={onOpen}
    >
      <div className="collection-card-header">
        <span className="editorial-tag">{collection.badge}</span>
        {isActive ? (
          <span className="catalog-chip catalog-chip-ridden">{copy.collections.viewingNow}</span>
        ) : null}
      </div>
      <div className="collection-card-copy">
        <h3>{collection.title}</h3>
        <p>{collection.summary}</p>
      </div>
      <span className="collection-card-meta">
        {copy.collections.insideCollection(
          formatCountLabel(locale, collection.itemSlugs.length, collection.kind)
        )}
      </span>
    </button>
  );
}
