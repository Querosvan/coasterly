import { useCallback, useState } from "react";

import type { DemoUserStatsResponse } from "@coasterly/types";

import type { DemoUserStatsStatus } from "../lib/types";
import {
  apiBaseUrl,
  authFailureStatusCode,
  fetchWithSession,
  missingApiBaseUrlMessage
} from "./userDataApi";

export type UseUserStatsResult = {
  demoUserStatsStatus: DemoUserStatsStatus;
  loadDemoUserStats: (signal?: AbortSignal) => Promise<void>;
  resetDemoUserStats: () => void;
};

export const useUserStats = (): UseUserStatsResult => {
  const [demoUserStatsStatus, setDemoUserStatsStatus] = useState<DemoUserStatsStatus>({
    state: "idle"
  });

  const resetDemoUserStats = useCallback(() => {
    setDemoUserStatsStatus({ state: "idle" });
  }, []);

  const loadDemoUserStats = useCallback(async (signal?: AbortSignal) => {
    if (!apiBaseUrl) {
      setDemoUserStatsStatus({
        state: "error",
        message: missingApiBaseUrlMessage
      });

      return;
    }

    setDemoUserStatsStatus({ state: "loading" });

    try {
      const response = await fetchWithSession(new URL("/me/stats", apiBaseUrl), {
        ...(signal ? { signal } : {})
      });

      if (response.status === authFailureStatusCode) {
        setDemoUserStatsStatus({ state: "idle" });

        return;
      }

      if (!response.ok) {
        setDemoUserStatsStatus({
          state: "error",
          message: `User stats request failed with status ${response.status}.`
        });

        return;
      }

      const payload = (await response.json()) as DemoUserStatsResponse;

      setDemoUserStatsStatus({
        state: "success",
        userName: payload.user.name,
        totalRiddenRides: payload.totalRiddenRides,
        totalParksWithRiddenRides: payload.totalParksWithRiddenRides,
        parks: payload.parks
      });
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      setDemoUserStatsStatus({
        state: "error",
        message: error instanceof Error ? error.message : "The user stats request failed."
      });
    }
  }, []);

  return {
    demoUserStatsStatus,
    loadDemoUserStats,
    resetDemoUserStats
  };
};
