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
  city?: string;
  continent?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  status: ParkStatus;
  imageUrl?: string;
}

export interface PageInfo {
  offset: number;
  limit: number;
  totalCount: number;
  hasMore: boolean;
}

export interface ParksResponse {
  parks: Park[];
  pageInfo?: PageInfo;
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
  pageInfo?: PageInfo;
}

export interface RideCatalogOptionsResponse {
  parks: Park[];
  rideTypes: string[];
  manufacturers: string[];
}

export interface AdminParkCatalogItem {
  id: number;
  name: string;
  slug: string;
  status: ParkStatus;
  country: string;
  city?: string;
  hasImage: boolean;
  hasQueueTimesMapping: boolean;
}

export interface AdminParksResponse {
  parks: AdminParkCatalogItem[];
  pageInfo?: PageInfo;
}

export type AdminCatalogFilter =
  | "all"
  | "missing_media"
  | "missing_queue_times"
  | "needs_cleanup";

export interface AdminRideCatalogItem {
  id: number;
  name: string;
  slug: string;
  status: RideStatus;
  parkName: string;
  parkSlug: string;
  rideType: string;
  hasImage: boolean;
  hasQueueTimesMapping: boolean;
  needsCleanup?: boolean;
}

export interface AdminRidesResponse {
  rides: AdminRideCatalogItem[];
  pageInfo?: PageInfo;
}

export interface AdminCatalogSummary {
  totalParks: number;
  parksMissingMedia: number;
  parksMissingQueueTimesMapping: number;
  totalRides: number;
  ridesMissingMedia: number;
  ridesMissingQueueTimesMapping: number;
  ridesNeedingCleanup: number;
}

export interface AdminSummaryResponse {
  summary: AdminCatalogSummary;
}

export type UserRole =
  | "user"
  | "admin"
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

export interface UserRecentActivityItem {
  rideId: number;
  rideName: string;
  rideSlug: string;
  parkName: string;
  parkSlug: string;
  riddenAt: string;
}

export interface UserProfileResponse {
  user: UserSummary;
  identity: UserIdentityProgress;
  totalRiddenRides: number;
  totalParksWithRiddenRides: number;
  parks: DemoUserParkProgress[];
  badges: UserProgressionBadge[];
  activeMissions: UserProgressionMission[];
  recentActivity: UserRecentActivityItem[];
}

export interface CommunityHighlight {
  user: UserSummary;
  identity: UserIdentityProgress;
  totalRiddenRides: number;
  totalParksWithRiddenRides: number;
  featuredPark?: DemoUserParkProgress;
  badges: UserProgressionBadge[];
  recentActivity: UserRecentActivityItem[];
}

export interface CommunityHighlightsResponse {
  profiles: CommunityHighlight[];
}

export interface DailyChallengeOption {
  id: string;
  label: string;
}

export type DailyChallengeQuestionKind =
  | "ride_to_park"
  | "ride_to_manufacturer"
  | "ride_to_type";

export interface DailyChallengeQuestionRide {
  id: number;
  name: string;
  slug: string;
  parkSlug: string;
  imageUrl?: string;
}

export interface DailyChallengeQuestion {
  id: string;
  challengeDate: string;
  kind: DailyChallengeQuestionKind;
  title: string;
  prompt: string;
  ride: DailyChallengeQuestionRide;
  options: DailyChallengeOption[];
}

export interface DailyChallengeAttempt {
  selectedOptionId: string;
  correctOptionId: string;
  isCorrect: boolean;
  earnedXp: number;
  answeredAt: string;
}

export interface DailyRewardClaim {
  availableXp: number;
  claimedXp?: number;
  claimedAt?: string;
}

export interface UserIdentityProgress {
  totalXp: number;
  level: number;
  currentStreak: number;
  completedDays: number;
}

export interface DailyChallengeSummary extends UserIdentityProgress {}

export interface DailyChallengeResponse {
  user: UserSummary;
  summary: DailyChallengeSummary;
  challenge: DailyChallengeQuestion;
  attempt?: DailyChallengeAttempt;
  reward: DailyRewardClaim;
}

export interface DailyChallengeAnswerRequest {
  optionId: string;
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
