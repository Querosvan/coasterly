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
}

export interface ParksResponse {
  parks: Park[];
}

export interface ParkResponse {
  park: Park;
}

export interface ProjectSurface {
  id: "web" | "api" | "mobile";
  name: string;
  responsibility: string;
}
