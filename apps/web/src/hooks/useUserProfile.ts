import { useCallback, useState } from "react";

import type { UserProfileResponse } from "@coasterly/types";

import type { UserProfileStatus } from "../lib/types";
import {
  apiBaseUrl,
  authFailureStatusCode,
  fetchWithSession,
  missingApiBaseUrlMessage
} from "./userDataApi";

export type UseUserProfileResult = {
  userProfileStatus: UserProfileStatus;
  loadUserProfile: (signal?: AbortSignal) => Promise<void>;
  loadPublicUserProfile: (userSlug: string, signal?: AbortSignal) => Promise<void>;
  resetUserProfile: () => void;
};

export const useUserProfile = (): UseUserProfileResult => {
  const [userProfileStatus, setUserProfileStatus] = useState<UserProfileStatus>({
    state: "idle"
  });

  const resetUserProfile = useCallback(() => {
    setUserProfileStatus({ state: "idle" });
  }, []);

  const loadUserProfile = useCallback(async (signal?: AbortSignal) => {
    if (!apiBaseUrl) {
      setUserProfileStatus({
        state: "error",
        message: missingApiBaseUrlMessage
      });

      return;
    }

    setUserProfileStatus({ state: "loading" });

    try {
      const response = await fetchWithSession(new URL("/me/profile", apiBaseUrl), {
        ...(signal ? { signal } : {})
      });

      if (response.status === authFailureStatusCode) {
        setUserProfileStatus({ state: "idle" });

        return;
      }

      if (!response.ok) {
        setUserProfileStatus({
          state: "error",
          message: `Profile request failed with status ${response.status}.`
        });

        return;
      }

      const payload = (await response.json()) as UserProfileResponse;

      setUserProfileStatus({
        state: "success",
        profile: payload
      });
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      setUserProfileStatus({
        state: "error",
        message: error instanceof Error ? error.message : "The profile request failed."
      });
    }
  }, []);

  const loadPublicUserProfile = useCallback(
    async (userSlug: string, signal?: AbortSignal) => {
      if (!apiBaseUrl) {
        setUserProfileStatus({
          state: "error",
          message: missingApiBaseUrlMessage
        });

        return;
      }

      setUserProfileStatus({ state: "loading" });

      try {
        const response = await fetch(new URL(`/users/${userSlug}/profile`, apiBaseUrl), {
          ...(signal ? { signal } : {})
        });

        if (response.status === 404) {
          setUserProfileStatus({
            state: "error",
            message: "User not found."
          });

          return;
        }

        if (!response.ok) {
          setUserProfileStatus({
            state: "error",
            message: `Profile request failed with status ${response.status}.`
          });

          return;
        }

        const payload = (await response.json()) as UserProfileResponse;

        setUserProfileStatus({
          state: "success",
          profile: payload
        });
      } catch (error) {
        if (signal?.aborted) {
          return;
        }

        setUserProfileStatus({
          state: "error",
          message: error instanceof Error ? error.message : "The profile request failed."
        });
      }
    },
    []
  );

  return {
    userProfileStatus,
    loadUserProfile,
    loadPublicUserProfile,
    resetUserProfile
  };
};
