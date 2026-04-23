export type ServiceStatus = "ok" | "degraded" | "down";

export interface HealthResponse {
  service: "api";
  status: "ok";
  timestamp: string;
}

export interface ProjectSurface {
  id: "web" | "api" | "mobile";
  name: string;
  responsibility: string;
}
