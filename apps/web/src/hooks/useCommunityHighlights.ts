import { useCallback, useState } from "react";

import type { CommunityHighlightsResponse } from "@coasterly/types";

import type { CommunityHighlightsStatus } from "../lib/types";
import { apiBaseUrl, missingApiBaseUrlMessage } from "./userDataApi";

export type UseCommunityHighlightsResult = {
  communityHighlightsStatus: CommunityHighlightsStatus;
  loadCommunityHighlights: (signal?: AbortSignal) => Promise<void>;
};

export const useCommunityHighlights = (): UseCommunityHighlightsResult => {
  const [communityHighlightsStatus, setCommunityHighlightsStatus] =
    useState<CommunityHighlightsStatus>({
      state: "loading"
    });

  const loadCommunityHighlights = useCallback(async (signal?: AbortSignal) => {
    if (!apiBaseUrl) {
      setCommunityHighlightsStatus({
        state: "error",
        message: missingApiBaseUrlMessage
      });

      return;
    }

    setCommunityHighlightsStatus({ state: "loading" });

    try {
      const response = await fetch(new URL("/community/highlights", apiBaseUrl), {
        ...(signal ? { signal } : {})
      });

      if (!response.ok) {
        setCommunityHighlightsStatus({
          state: "error",
          message: `Community request failed with status ${response.status}.`
        });

        return;
      }

      const payload = (await response.json()) as CommunityHighlightsResponse;

      setCommunityHighlightsStatus({
        state: "success",
        profiles: payload.profiles
      });
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      setCommunityHighlightsStatus({
        state: "error",
        message: error instanceof Error ? error.message : "The community request failed."
      });
    }
  }, []);

  return {
    communityHighlightsStatus,
    loadCommunityHighlights
  };
};
