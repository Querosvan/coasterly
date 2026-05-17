import { useCallback, useState } from "react";

import type { UserStatsResponse } from "@coasterly/types";

import type { UserStatsStatus } from "../lib/types";
import {
  apiBaseUrl,
  authFailureStatusCode,
  fetchWithSession,
  missingApiBaseUrlMessage
} from "./userDataApi";

export type UseUserStatsResult = {
  userStatsStatus: UserStatsStatus;
  loadUserStats: (signal?: AbortSignal) => Promise<void>;
  resetUserStats: () => void;
};

export const useUserStats = (): UseUserStatsResult => {
  const [userStatsStatus, setUserStatsStatus] = useState<UserStatsStatus>({
    state: "idle"
  });

  const resetUserStats = useCallback(() => {
    setUserStatsStatus({ state: "idle" });
  }, []);

  const loadUserStats = useCallback(async (signal?: AbortSignal) => {
    if (!apiBaseUrl) {
      setUserStatsStatus({
        state: "error",
        message: missingApiBaseUrlMessage
      });

      return;
    }

    setUserStatsStatus({ state: "loading" });

    try {
      const response = await fetchWithSession(new URL("/me/stats", apiBaseUrl), {
        ...(signal ? { signal } : {})
      });

      if (response.status === authFailureStatusCode) {
        setUserStatsStatus({ state: "idle" });

        return;
      }

      if (!response.ok) {
        setUserStatsStatus({
          state: "error",
          message: `User stats request failed with status ${response.status}.`
        });

        return;
      }

      const payload = (await response.json()) as UserStatsResponse;

      setUserStatsStatus({
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

      setUserStatsStatus({
        state: "error",
        message: error instanceof Error ? error.message : "The user stats request failed."
      });
    }
  }, []);

  return {
    userStatsStatus,
    loadUserStats,
    resetUserStats
  };
};
