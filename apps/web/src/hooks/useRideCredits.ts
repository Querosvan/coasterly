import { useCallback, useEffect, useState } from "react";

import type { RideCreditsResponse } from "@coasterly/types";

import type { CurrentUserStatus, RideCreditsStatus } from "../lib/types";
import {
  apiBaseUrl,
  authFailureStatusCode,
  fetchWithSession,
  missingApiBaseUrlMessage
} from "./userDataApi";

export type UseRideCreditsResult = {
  rideCreditsStatus: RideCreditsStatus;
  loadRideCredits: (signal?: AbortSignal) => Promise<void>;
  resetRideCredits: () => void;
  updateRiddenRide: (rideId: number, ridden: boolean) => void;
};

export const useRideCredits = (
  currentUserState: CurrentUserStatus["state"]
): UseRideCreditsResult => {
  const [rideCreditsStatus, setRideCreditsStatus] = useState<RideCreditsStatus>({
    state: "idle"
  });

  const resetRideCredits = useCallback(() => {
    setRideCreditsStatus({ state: "idle" });
  }, []);

  const loadRideCredits = useCallback(async (signal?: AbortSignal) => {
    if (!apiBaseUrl) {
      setRideCreditsStatus({
        state: "error",
        message: missingApiBaseUrlMessage
      });

      return;
    }

    try {
      const response = await fetchWithSession(new URL("/me/ride-credits", apiBaseUrl), {
        ...(signal ? { signal } : {})
      });

      if (response.status === authFailureStatusCode) {
        setRideCreditsStatus({ state: "idle" });

        return;
      }

      if (!response.ok) {
        setRideCreditsStatus({
          state: "error",
          message: `Ride credits request failed with status ${response.status}.`
        });

        return;
      }

      const payload = (await response.json()) as RideCreditsResponse;

      setRideCreditsStatus({
        state: "success",
        rideIds: payload.rideIds,
        userName: payload.user.name
      });
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      setRideCreditsStatus({
        state: "error",
        message:
          error instanceof Error ? error.message : "The ride credits request failed."
      });
    }
  }, []);

  const updateRiddenRide = useCallback((rideId: number, ridden: boolean) => {
    setRideCreditsStatus((current) => {
      if (current.state !== "success") {
        return current;
      }

      const rideIds = ridden
        ? current.rideIds.includes(rideId)
          ? current.rideIds
          : [...current.rideIds, rideId]
        : current.rideIds.filter((currentRideId) => currentRideId !== rideId);

      return {
        ...current,
        rideIds
      };
    });
  }, []);

  useEffect(() => {
    if (currentUserState !== "signed_in") {
      setRideCreditsStatus({ state: "idle" });

      return;
    }

    const controller = new AbortController();

    void loadRideCredits(controller.signal);

    return () => {
      controller.abort();
    };
  }, [currentUserState, loadRideCredits]);

  return {
    rideCreditsStatus,
    loadRideCredits,
    resetRideCredits,
    updateRiddenRide
  };
};
