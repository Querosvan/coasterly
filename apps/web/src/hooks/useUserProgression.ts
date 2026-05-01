import { useCallback, useState } from "react";

import type { UserProgressionResponse } from "@coasterly/types";

import type { UserProgressionStatus } from "../lib/types";
import {
  apiBaseUrl,
  authFailureStatusCode,
  fetchWithSession,
  missingApiBaseUrlMessage
} from "./userDataApi";

export type UseUserProgressionResult = {
  userProgressionStatus: UserProgressionStatus;
  loadUserProgression: (signal?: AbortSignal) => Promise<void>;
  resetUserProgression: () => void;
};

export const useUserProgression = (): UseUserProgressionResult => {
  const [userProgressionStatus, setUserProgressionStatus] =
    useState<UserProgressionStatus>({
      state: "idle"
    });

  const resetUserProgression = useCallback(() => {
    setUserProgressionStatus({ state: "idle" });
  }, []);

  const loadUserProgression = useCallback(async (signal?: AbortSignal) => {
    if (!apiBaseUrl) {
      setUserProgressionStatus({
        state: "error",
        message: missingApiBaseUrlMessage
      });

      return;
    }

    setUserProgressionStatus({ state: "loading" });

    try {
      const response = await fetchWithSession(new URL("/me/progression", apiBaseUrl), {
        ...(signal ? { signal } : {})
      });

      if (response.status === authFailureStatusCode) {
        setUserProgressionStatus({ state: "idle" });

        return;
      }

      if (!response.ok) {
        setUserProgressionStatus({
          state: "error",
          message: `Progression request failed with status ${response.status}.`
        });

        return;
      }

      const payload = (await response.json()) as UserProgressionResponse;

      setUserProgressionStatus({
        state: "success",
        userName: payload.user.name,
        badges: payload.badges,
        activeMissions: payload.activeMissions
      });
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      setUserProgressionStatus({
        state: "error",
        message: error instanceof Error ? error.message : "The progression request failed."
      });
    }
  }, []);

  return {
    userProgressionStatus,
    loadUserProgression,
    resetUserProgression
  };
};
