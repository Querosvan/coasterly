import { localeLabels } from "../../i18n";
import type { Locale } from "../../i18n";
import { brandLogoDark } from "../../lib/assets";
import type { ApiStatus, UiCopy } from "../../lib/types";

export type TopNavigationItem = {
  label: string;
  href: string;
  active: boolean;
  onClick: () => void;
};

type AppHeaderProps = {
  isMobileNavOpen: boolean;
  activeNavigationLabel: string;
  topNavigation: TopNavigationItem[];
  locale: Locale;
  copy: UiCopy;
  isAuthenticated: boolean;
  apiStatus: ApiStatus;
  onToggleMobileNav: () => void;
  onCloseMobileNav: () => void;
  onNavigateHome: () => void;
  onLocaleChange: (locale: Locale) => void;
  onSignIn: () => void;
  onSignOut: () => void;
};

export function AppHeader({
  isMobileNavOpen,
  activeNavigationLabel,
  topNavigation,
  locale,
  copy,
  isAuthenticated,
  apiStatus,
  onToggleMobileNav,
  onCloseMobileNav,
  onNavigateHome,
  onLocaleChange,
  onSignIn,
  onSignOut
}: AppHeaderProps) {
  return (
    <header className={`topbar${isMobileNavOpen ? " topbar-nav-open" : ""}`}>
      <div className="topbar-primary">
        <button
          className="brand-link brand-link-image"
          type="button"
          onClick={() => {
            onCloseMobileNav();
            onNavigateHome();
          }}
        >
          <img className="brand-logo" src={brandLogoDark} alt="Coasterly" />
        </button>
        <span className="mobile-route-label">{activeNavigationLabel}</span>
        <button
          className="mobile-menu-button"
          type="button"
          aria-expanded={isMobileNavOpen}
          aria-controls="primary-navigation"
          onClick={onToggleMobileNav}
        >
          {copy.nav.menu}
        </button>
      </div>
      <nav className="topbar-nav" id="primary-navigation" aria-label={copy.nav.menu}>
        {topNavigation.map((item) => (
          <a
            key={item.label}
            className={`topbar-nav-link${item.active ? " topbar-nav-link-active" : ""}`}
            href={item.href}
            onClick={(event) => {
              event.preventDefault();
              onCloseMobileNav();
              item.onClick();
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>
      <div className="topbar-meta">
        <div className="language-switcher" aria-label={copy.nav.language}>
          {(Object.keys(localeLabels) as Locale[]).map((nextLocale) => (
            <button
              key={nextLocale}
              className={`language-button${locale === nextLocale ? " language-button-active" : ""}`}
              type="button"
              onClick={() => {
                onLocaleChange(nextLocale);
              }}
            >
              {localeLabels[nextLocale]}
            </button>
          ))}
        </div>
        {isAuthenticated ? (
          <button className="secondary-button topbar-auth-button" type="button" onClick={onSignOut}>
            {copy.nav.signOut}
          </button>
        ) : (
          <button className="primary-button topbar-auth-button" type="button" onClick={onSignIn}>
            {copy.nav.signIn}
          </button>
        )}
        <div className="status-cluster" aria-live="polite">
          {apiStatus.state === "error" ? (
            <span className="status-chip status-chip-error">{copy.common.serviceIssue}</span>
          ) : null}
        </div>
      </div>
    </header>
  );
}
