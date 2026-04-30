import type { Locale } from "../i18n";
import type {
  CurrentUserStatus,
  DailyChallengeStatus,
  UiCopy,
  UserProfileStatus
} from "../lib/types";
import { AuthPromptPanel } from "../components/shared/AuthPromptPanel";
import { DailyChallengePanel } from "../components/shared/DailyChallengePanel";
import { ProfileSurface } from "../components/shared/ProfileSurface";

type ProfilePageProps = {
  currentUserStatus: CurrentUserStatus;
  userProfileStatus: UserProfileStatus;
  dailyChallengeStatus: DailyChallengeStatus;
  isSubmittingDailyChallenge: boolean;
  isClaimingDailyReward: boolean;
  profileShareMessage: string | null;
  signInPromptTitle: string;
  signInPromptBody: string;
  locale: Locale;
  copy: UiCopy;
  onSignIn: (returnTo?: string) => void;
  onOpenPark: (parkSlug: string) => void;
  onOpenRide: (parkSlug: string, rideSlug: string) => void;
  onBrowseParks: () => void;
  onBrowseRides: () => void;
  onOpenPublicProfile: (userSlug: string) => void;
  onCopyPublicProfile: (userSlug: string) => void;
  onAnswerDailyChallenge: (optionId: string) => void;
  onClaimDailyReward: () => void;
};

export function ProfilePage({
  currentUserStatus,
  userProfileStatus,
  dailyChallengeStatus,
  isSubmittingDailyChallenge,
  isClaimingDailyReward,
  profileShareMessage,
  signInPromptTitle,
  signInPromptBody,
  locale,
  copy,
  onSignIn,
  onOpenPark,
  onOpenRide,
  onBrowseParks,
  onBrowseRides,
  onOpenPublicProfile,
  onCopyPublicProfile,
  onAnswerDailyChallenge,
  onClaimDailyReward
}: ProfilePageProps) {
  return (
    <section className="catalog-panel browse-panel" aria-live="polite">
      <div className="catalog-header">
        <div className="catalog-copy">
          <p className="status-label">{copy.nav.profile}</p>
          <h2 className="section-title">{copy.profile.title}</h2>
        </div>
      </div>

      {currentUserStatus.state === "signed_out" ? (
        <AuthPromptPanel
          title={signInPromptTitle}
          summary={signInPromptBody}
          actionLabel={copy.nav.signIn}
          onAction={() => {
            onSignIn("/profile");
          }}
        />
      ) : null}

      {userProfileStatus.state === "loading" ? (
        <div className="state-message state-message-loading">
          <p>{locale === "es" ? "Cargando perfil..." : "Loading profile..."}</p>
        </div>
      ) : null}

      {currentUserStatus.state === "signed_in" && userProfileStatus.state === "success" ? (
        <>
          {profileShareMessage ? (
            <div className="state-message state-message-compact">
              <p>{profileShareMessage}</p>
            </div>
          ) : null}
          <ProfileSurface
            profile={userProfileStatus.profile}
            isCurrentUser
            locale={locale}
            copy={copy}
            onOpenPark={onOpenPark}
            onOpenRide={onOpenRide}
            onBrowseParks={onBrowseParks}
            onBrowseRides={onBrowseRides}
            onOpenPublicProfile={onOpenPublicProfile}
            onCopyPublicProfile={onCopyPublicProfile}
          />
          {userProfileStatus.profile.totalRiddenRides > 0 ? (
            <DailyChallengePanel
              dailyChallengeStatus={dailyChallengeStatus}
              isSubmitting={isSubmittingDailyChallenge}
              isClaimingReward={isClaimingDailyReward}
              onAnswer={onAnswerDailyChallenge}
              onClaimReward={onClaimDailyReward}
              locale={locale}
              copy={copy}
              onOpenRide={onOpenRide}
            />
          ) : null}
        </>
      ) : null}

      {userProfileStatus.state === "error" ? (
        <div className="state-message state-message-error">
          <p>{locale === "es" ? "No se puede cargar tu perfil." : "Unable to load your profile."}</p>
          <p>{userProfileStatus.message}</p>
        </div>
      ) : null}
    </section>
  );
}
