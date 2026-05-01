import { useEffect, useState } from "react";

import type { RideResponse, RidesResponse } from "@coasterly/types";

import type {
  ParkRideSort,
  RideDetailStatus,
  RideLineupStatus,
  Route
} from "../lib/types";
import { apiBaseUrl, missingApiBaseUrlMessage } from "./userDataApi";

export type UseRideDetailOptions = {
  route: Route;
  rideTypeFilter: string;
  manufacturerFilter: string;
  parkRideSort: ParkRideSort;
};

export type UseRideDetailResult = {
  rideDetailStatus: RideDetailStatus;
  rideLineupStatus: RideLineupStatus;
};

export const useRideDetail = ({
  route,
  rideTypeFilter,
  manufacturerFilter,
  parkRideSort
}: UseRideDetailOptions): UseRideDetailResult => {
  const [rideDetailStatus, setRideDetailStatus] = useState<RideDetailStatus>({
    state: "idle"
  });
  const [rideLineupStatus, setRideLineupStatus] = useState<RideLineupStatus>({
    state: "idle"
  });

  useEffect(() => {
    if (route.view !== "ride") {
      setRideLineupStatus({ state: "idle" });

      return;
    }

    if (!apiBaseUrl) {
      setRideLineupStatus({
        state: "error",
        message: missingApiBaseUrlMessage
      });

      return;
    }

    const controller = new AbortController();

    const loadRideLineup = async () => {
      setRideLineupStatus({ state: "loading" });

      try {
        const ridesUrl = new URL(`/parks/${route.parkSlug}/rides`, apiBaseUrl);

        if (rideTypeFilter) {
          ridesUrl.searchParams.set("rideType", rideTypeFilter);
        }

        if (manufacturerFilter) {
          ridesUrl.searchParams.set("manufacturer", manufacturerFilter);
        }

        ridesUrl.searchParams.set("sort", parkRideSort);

        const response = await fetch(ridesUrl, { signal: controller.signal });

        if (response.status === 404) {
          setRideLineupStatus({
            state: "error",
            message: "Park not found."
          });

          return;
        }

        if (!response.ok) {
          setRideLineupStatus({
            state: "error",
            message: `Ride lineup request failed with status ${response.status}.`
          });

          return;
        }

        const payload = (await response.json()) as RidesResponse;

        setRideLineupStatus({
          state: "success",
          rides: payload.rides
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setRideLineupStatus({
          state: "error",
          message: error instanceof Error ? error.message : "The ride lineup request failed."
        });
      }
    };

    void loadRideLineup();

    return () => {
      controller.abort();
    };
  }, [route, rideTypeFilter, manufacturerFilter, parkRideSort]);

  useEffect(() => {
    if (route.view !== "ride") {
      setRideDetailStatus({ state: "idle" });

      return;
    }

    if (!apiBaseUrl) {
      setRideDetailStatus({
        state: "error",
        message: missingApiBaseUrlMessage
      });

      return;
    }

    const controller = new AbortController();

    const loadRide = async () => {
      setRideDetailStatus({ state: "loading" });

      try {
        const response = await fetch(
          new URL(`/parks/${route.parkSlug}/rides/${route.rideSlug}`, apiBaseUrl),
          { signal: controller.signal }
        );

        if (response.status === 404) {
          setRideDetailStatus({
            state: "error",
            message: "Ride not found."
          });

          return;
        }

        if (!response.ok) {
          setRideDetailStatus({
            state: "error",
            message: `Ride request failed with status ${response.status}.`
          });

          return;
        }

        const payload = (await response.json()) as RideResponse;

        setRideDetailStatus({
          state: "success",
          park: payload.park,
          ride: payload.ride,
          ...(payload.parkQueueTimes ? { parkQueueTimes: payload.parkQueueTimes } : {}),
          ...(payload.rideQueueTimes ? { rideQueueTimes: payload.rideQueueTimes } : {})
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setRideDetailStatus({
          state: "error",
          message: error instanceof Error ? error.message : "The ride request failed."
        });
      }
    };

    void loadRide();

    return () => {
      controller.abort();
    };
  }, [route]);

  return {
    rideDetailStatus,
    rideLineupStatus
  };
};
