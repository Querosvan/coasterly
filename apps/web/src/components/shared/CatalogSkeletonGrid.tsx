type CatalogSkeletonGridProps = {
  count: number;
  variant: "park" | "ride";
};

export function CatalogSkeletonGrid({ count, variant }: CatalogSkeletonGridProps) {
  return (
    <div
      className={`catalog-skeleton-grid ${
        variant === "ride" ? "rides-list-catalog" : "parks-list"
      }`}
      aria-label={`${variant === "ride" ? "Rides" : "Parks"} loading`}
      aria-busy="true"
    >
      {Array.from({ length: count }, (_, index) => (
        <article className="catalog-skeleton-card" key={`${variant}-skeleton-${index}`}>
          <div className="skeleton-block skeleton-media" />
          <div className="skeleton-row skeleton-row-title" />
          <div className="skeleton-row skeleton-row-short" />
          <div className="skeleton-row" />
          <div className="skeleton-row skeleton-row-medium" />
          <div className="skeleton-chip-row">
            <span className="skeleton-chip" />
            <span className="skeleton-chip" />
          </div>
        </article>
      ))}
    </div>
  );
}
