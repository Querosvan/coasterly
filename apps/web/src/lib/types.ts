import type {
  AdminCatalogFilter,
  AdminParksResponse,
  AdminRidesResponse,
  AdminSummaryResponse,
  CommunityHighlightsResponse,
  CurrentUserResponse,
  DailyChallengeResponse,
  DemoUserStatsResponse,
  HealthResponse,
  Park,
  ParkLiveWaitsResponse,
  ParkResponse,
  ParksResponse,
  Ride,
  RideCatalogItem,
  RideCatalogResponse,
  RideResponse,
  RideSort,
  UserProfileResponse,
  UserProgressionResponse
} from "@coasterly/types";

import type { Locale, messages } from "../i18n";

export type DiscoveryCue = "Featured" | "Headliner" | "Iconic" | "Standout";

export type EditorialNote = {
  summary: string;
  cues: DiscoveryCue[];
};

export type CuratedCollection = {
  id: string;
  title: string;
  summary: string;
  kind: "park" | "ride";
  badge: string;
  itemSlugs: readonly string[];
};

export type UiCopy = (typeof messages)[Locale];

export type Route =
  | { view: "home" }
  | { view: "parks" }
  | { view: "rides" }
  | { view: "discover" }
  | { view: "admin" }
  | { view: "profile" }
  | { view: "user-profile"; slug: string }
  | { view: "journal" }
  | { view: "park"; slug: string }
  | { view: "ride"; parkSlug: string; rideSlug: string };

export type ApiStatus =
  | { state: "loading" }
  | { state: "success"; response: HealthResponse }
  | { state: "error"; message: string };

export type ParksStatus =
  | { state: "loading" }
  | { state: "success"; parks: Park[]; pageInfo?: ParksResponse["pageInfo"] }
  | { state: "error"; message: string };

export type ParkDetailStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "success"; park: Park; queueTimes?: ParkResponse["queueTimes"] }
  | { state: "error"; message: string };

export type ParkRidesStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "success"; rides: Ride[] }
  | { state: "error"; message: string };

export type RidesCatalogStatus =
  | { state: "idle" }
  | { state: "loading" }
  | {
      state: "success";
      rides: RideCatalogItem[];
      pageInfo?: RideCatalogResponse["pageInfo"];
    }
  | { state: "error"; message: string };

export type ParkLiveWaitsStatus =
  | { state: "idle" }
  | { state: "loading" }
  | {
      state: "success";
      source: ParkLiveWaitsResponse["source"];
      rides: ParkLiveWaitsResponse["rides"];
    }
  | { state: "error"; message: string };

export type ParkRideSort = RideSort;
export type RidesCatalogSort = RideSort;

export type ParkRideOptions = {
  rideTypes: string[];
  manufacturers: string[];
};

export type RidesCatalogOptions = ParkRideOptions & {
  parks: Park[];
};

export type RideDetailOrigin = "park" | "rides";

export type RideCreditsStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "success"; rideIds: number[]; userName: string }
  | { state: "error"; message: string };

export type DemoUserStatsStatus =
  | { state: "idle" }
  | { state: "loading" }
  | {
      state: "success";
      userName: string;
      totalRiddenRides: number;
      totalParksWithRiddenRides: number;
      parks: DemoUserStatsResponse["parks"];
    }
  | { state: "error"; message: string };

export type UserProgressionStatus =
  | { state: "idle" }
  | { state: "loading" }
  | {
      state: "success";
      userName: string;
      badges: UserProgressionResponse["badges"];
      activeMissions: UserProgressionResponse["activeMissions"];
    }
  | { state: "error"; message: string };

export type UserProfileStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "success"; profile: UserProfileResponse }
  | { state: "error"; message: string };

export type CommunityHighlightsStatus =
  | { state: "loading" }
  | { state: "success"; profiles: CommunityHighlightsResponse["profiles"] }
  | { state: "error"; message: string };

export type DailyChallengeStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "success"; response: DailyChallengeResponse }
  | { state: "error"; message: string };

export type AdminParksStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "success"; parks: AdminParksResponse["parks"]; pageInfo?: AdminParksResponse["pageInfo"] }
  | { state: "error"; message: string };

export type AdminRidesStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "success"; rides: AdminRidesResponse["rides"]; pageInfo?: AdminRidesResponse["pageInfo"] }
  | { state: "error"; message: string };

export type AdminSummaryStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "success"; summary: AdminSummaryResponse["summary"] }
  | { state: "error"; message: string };

export type CurrentUserStatus =
  | { state: "loading" }
  | { state: "signed_out" }
  | { state: "signed_in"; currentUser: CurrentUserResponse }
  | { state: "error"; message: string };

export type RideDetailStatus =
  | { state: "idle" }
  | { state: "loading" }
  | {
      state: "success";
      park: Park;
      ride: Ride;
      parkQueueTimes?: RideResponse["parkQueueTimes"];
      rideQueueTimes?: RideResponse["rideQueueTimes"];
    }
  | { state: "error"; message: string };

export type RideLineupStatus =
  | { state: "idle" }
  | { state: "loading" }
  | { state: "success"; rides: Ride[] }
  | { state: "error"; message: string };

export type RideSpecItem = {
  label: string;
  value: string;
  wide?: true;
  code?: true;
};

export type BreadcrumbItem = {
  label: string;
  href?: string;
  onClick?: () => void;
};

export type MediaKind = "park" | "ride";

export type ExternalInsightLink = {
  label: string;
  href: string;
};
