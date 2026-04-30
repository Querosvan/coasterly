import type { BreadcrumbItem } from "../../lib/types";

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li className="breadcrumb-item" key={`${item.label}-${index}`}>
              {item.href && item.onClick && !isLast ? (
                <a
                  className="breadcrumb-link"
                  href={item.href}
                  onClick={(event) => {
                    event.preventDefault();
                    item.onClick?.();
                  }}
                >
                  {item.label}
                </a>
              ) : (
                <span
                  className={`breadcrumb-current${isLast ? " breadcrumb-current-active" : ""}`}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast ? <span className="breadcrumb-separator">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
