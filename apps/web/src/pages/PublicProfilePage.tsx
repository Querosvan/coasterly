import type { Locale } from "../i18n";
import type { UiCopy, UserProfileStatus } from "../lib/types";
import { ProfileSurface } from "../components/shared/ProfileSurface";

type PublicProfilePageProps = {
  userProfileStatus: UserProfileStatus;
  locale: Locale;
  copy: UiCopy;
  onOpenPark: (parkSlug: string) => void;
  onOpenRide: (parkSlug: string, rideSlug: string) => void;
};

export function PublicProfilePage({
  userProfileStatus,
  locale,
  copy,
  onOpenPark,
  onOpenRide
}: PublicProfilePageProps) {
  return (
    <section className="catalog-panel browse-panel" aria-live="polite">
      {userProfileStatus.state === "loading" ? (
        <div className="state-message state-message-loading">
          <p>{locale === "es" ? "Cargando perfil..." : "Loading profile..."}</p>
        </div>
      ) : null}

      {userProfileStatus.state === "success" ? (
        <ProfileSurface
          profile={userProfileStatus.profile}
          isCurrentUser={false}
          locale={locale}
          copy={copy}
          onOpenPark={onOpenPark}
          onOpenRide={onOpenRide}
        />
      ) : null}

      {userProfileStatus.state === "error" ? (
        <div className="state-message state-message-error">
          <p>{locale === "es" ? "No se puede cargar este perfil." : "Unable to load this profile."}</p>
          <p>{userProfileStatus.message}</p>
        </div>
      ) : null}
    </section>
  );
}
