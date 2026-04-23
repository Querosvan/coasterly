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

export interface RidesResponse {
  rides: Ride[];
}

export interface RideResponse {
  ride: Ride;
  park: Park;
}

export interface DemoUser {
  id: number;
  slug: string;
  name: string;
}

export interface RideCreditsResponse {
  user: DemoUser;
  rideIds: number[];
}

export interface RideCreditMutationResponse {
  user: DemoUser;
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
  user: DemoUser;
  totalRiddenRides: number;
  totalParksWithRiddenRides: number;
  parks: DemoUserParkProgress[];
}

export interface ProjectSurface {
  id: "web" | "api" | "mobile";
  name: string;
  responsibility: string;
}
