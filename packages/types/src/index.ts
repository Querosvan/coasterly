export type ServiceStatus = "ok" | "degraded" | "down";

export interface HealthResponse {
  service: "api";
  status: "ok";
  timestamp: string;
}

export type ParkStatus = "operating" | "closed" | "planned";

export interface Park {
  id: number;
  name: string;
  slug: string;
  country: string;
  city: string;
  status: ParkStatus;
  imageUrl?: string;
}

export interface ParksResponse {
  parks: Park[];
}

export interface ParkResponse {
  park: Park;
  queueTimes?: QueueTimesReference;
}

export type RideStatus = "operating" | "closed" | "planned";

export interface Ride {
  id: number;
  parkId: number;
  name: string;
  slug: string;
  status: RideStatus;
  rideType: string;
  imageUrl?: string;
  manufacturer?: string;
  model?: string;
  openingYear?: number;
  heightM?: number;
  speedKmh?: number;
  inversions?: number;
}

export type RideSort = "name" | "opening_year" | "speed_kmh";

export interface RidesResponse {
  rides: Ride[];
}

export interface RideResponse {
  ride: Ride;
  park: Park;
  parkQueueTimes?: QueueTimesReference;
  rideQueueTimes?: QueueTimesReference;
}

export interface RideCatalogItem {
  ride: Ride;
  park: Park;
}

export interface RideCatalogResponse {
  rides: RideCatalogItem[];
}

export type UserRole =
  | "user"
  | "moderator"
  | "regional_editor"
  | "global_editor"
  | "super_admin";

export interface UserSummary {
  id: number;
  slug: string;
  name: string;
  role: UserRole;
  isSeeded?: boolean;
}

export type DemoUser = UserSummary;

export type CurrentUserIdentitySource = "auth_identity" | "seeded_fallback";

export interface CurrentUserIdentity {
  source: CurrentUserIdentitySource;
  provider?: string;
  subject?: string;
}

export interface CurrentUserResponse {
  user: UserSummary;
  identity: CurrentUserIdentity;
}

export interface RideCreditsResponse {
  user: UserSummary;
  rideIds: number[];
}

export interface RideCreditMutationResponse {
  user: UserSummary;
  rideId: number;
  ridden: boolean;
}

export interface DemoUserParkProgress {
  parkId: number;
  parkName: string;
  parkSlug: string;
  totalRides: number;
  riddenRides: number;
  completionPercentage: number;
}

export interface DemoUserStatsResponse {
  user: UserSummary;
  totalRiddenRides: number;
  totalParksWithRiddenRides: number;
  parks: DemoUserParkProgress[];
}

export type ProgressionBadgeTone = "milestone" | "explorer" | "lineup";

export interface UserProgressionBadge {
  id: string;
  title: string;
  summary: string;
  tone: ProgressionBadgeTone;
  earnedAt: string;
}

export interface UserProgressionMission {
  id: string;
  title: string;
  summary: string;
  progressCurrent: number;
  progressTarget: number;
  progressLabel: string;
  completionPercentage: number;
}

export interface UserProgressionResponse {
  user: UserSummary;
  badges: UserProgressionBadge[];
  activeMissions: UserProgressionMission[];
}

export type AdminEditableEntityKind =
  | "park"
  | "ride"
  | "media"
  | "external_source_mapping"
  | "discovery_metadata"
  | "summary"
  | "featured_flag";

export type ExternalSourceName = "queue-times";

export interface QueueTimesReference {
  sourceName: "queue-times";
  externalId: string;
  queueUrl: string;
  statsUrl: string;
}

export type ExternalEntityType = "park" | "ride";

export type LiveWaitSourceState = "mapped" | "unmapped";

export interface ParkLiveWaitSource {
  name: ExternalSourceName;
  state: LiveWaitSourceState;
  attributionLabel: string;
  attributionUrl: string;
  fetchedAt: string;
  externalId?: string;
  externalUrl?: string;
}

export interface ParkLiveWait {
  rideId: number;
  rideSlug: string;
  rideName: string;
  rideType: string;
  sourceName: ExternalSourceName;
  sourceExternalId: string;
  waitTimeMinutes?: number;
  isOpen?: boolean;
  sourceLastUpdated?: string;
  sourceUrl?: string;
}

export interface ParkLiveWaitsResponse {
  park: Park;
  source: ParkLiveWaitSource;
  rides: ParkLiveWait[];
}

export interface ProjectSurface {
  id: "web" | "api" | "mobile";
  name: string;
  responsibility: string;
}
