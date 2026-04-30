import type { BreadcrumbItem } from "../../lib/types";
import { Breadcrumbs } from "./Breadcrumbs";

type RouteBarProps = {
  breadcrumbItems: BreadcrumbItem[];
  routeBarLabel: string;
  routeBarTitle: string;
  routeBarChips: Array<string | null | undefined>;
};

export function RouteBar({
  breadcrumbItems,
  routeBarLabel,
  routeBarTitle,
  routeBarChips
}: RouteBarProps) {
  return (
    <section className="route-bar" aria-label="Current route">
      <div className="route-bar-main">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="route-context">
          <p className="route-context-label">{routeBarLabel}</p>
          <strong className="route-context-value">{routeBarTitle}</strong>
        </div>
      </div>
      <div className="route-bar-actions">
        {routeBarChips.filter((chip): chip is string => Boolean(chip)).map((chip) => (
          <span className="catalog-chip route-chip" key={chip}>
            {chip}
          </span>
        ))}
      </div>
    </section>
  );
}
