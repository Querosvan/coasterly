import { useCallback, useEffect, useState } from "react";

import type { CurrentUserResponse } from "@coasterly/types";

import type { CurrentUserStatus } from "../lib/types";
import {
  apiBaseUrl,
  authFailureStatusCode,
  fetchWithSession,
  missingApiBaseUrlMessage
} from "./userDataApi";

export type UseCurrentUserResult = {
  currentUserStatus: CurrentUserStatus;
  loadCurrentUser: (signal?: AbortSignal) => Promise<void>;
  markSignedOut: () => void;
};

export const useCurrentUser = (): UseCurrentUserResult => {
  const [currentUserStatus, setCurrentUserStatus] = useState<CurrentUserStatus>({
    state: "loading"
  });

  const markSignedOut = useCallback(() => {
    setCurrentUserStatus({ state: "signed_out" });
  }, []);

  const loadCurrentUser = useCallback(async (signal?: AbortSignal) => {
    if (!apiBaseUrl) {
      setCurrentUserStatus({
        state: "error",
        message: missingApiBaseUrlMessage
      });

      return;
    }

    setCurrentUserStatus({ state: "loading" });

    try {
      const response = await fetchWithSession(new URL("/me", apiBaseUrl), {
        ...(signal ? { signal } : {})
      });

      if (response.status === authFailureStatusCode) {
        setCurrentUserStatus({ state: "signed_out" });
        return;
      }

      if (!response.ok) {
        setCurrentUserStatus({
          state: "error",
          message: `Current user request failed with status ${response.status}.`
        });

        return;
      }

      const payload = (await response.json()) as CurrentUserResponse;

      setCurrentUserStatus({
        state: "signed_in",
        currentUser: payload
      });
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      setCurrentUserStatus({
        state: "error",
        message: error instanceof Error ? error.message : "The current user request failed."
      });
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void loadCurrentUser(controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadCurrentUser]);

  return {
    currentUserStatus,
    loadCurrentUser,
    markSignedOut
  };
};
