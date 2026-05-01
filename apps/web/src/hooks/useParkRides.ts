import { useEffect, useState } from "react";

import type { RidesResponse } from "@coasterly/types";

import { getUniqueSortedFilterValues } from "../lib/catalogUtils";
import { defaultParkRideSort } from "../lib/routes";
import type {
  ParkRideOptions,
  ParkRideSort,
  ParkRidesStatus,
  Route
} from "../lib/types";
import { apiBaseUrl, missingApiBaseUrlMessage } from "./userDataApi";

export type UseParkRidesOptions = {
  route: Route;
  rideTypeFilter: string;
  manufacturerFilter: string;
  parkRideSort: ParkRideSort;
};

export type UseParkRidesResult = {
  parkRidesStatus: ParkRidesStatus;
  parkRideOptions: ParkRideOptions;
};

export const useParkRides = ({
  route,
  rideTypeFilter,
  manufacturerFilter,
  parkRideSort
}: UseParkRidesOptions): UseParkRidesResult => {
  const [parkRidesStatus, setParkRidesStatus] = useState<ParkRidesStatus>({
    state: "idle"
  });
  const [parkRideOptions, setParkRideOptions] = useState<ParkRideOptions>({
    rideTypes: [],
    manufacturers: []
  });

  useEffect(() => {
    if (route.view !== "park") {
      setParkRideOptions({
        rideTypes: [],
        manufacturers: []
      });

      return;
    }

    if (!apiBaseUrl) {
      return;
    }

    const controller = new AbortController();

    const loadRideOptions = async () => {
      try {
        const ridesUrl = new URL(`/parks/${route.slug}/rides`, apiBaseUrl);

        ridesUrl.searchParams.set("sort", defaultParkRideSort);

        const response = await fetch(ridesUrl, { signal: controller.signal });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as RidesResponse;
        const rideTypes = getUniqueSortedFilterValues(
          payload.rides.map((ride) => ride.rideType),
          {
            excludeGenericRideTypes: true
          }
        );

        const manufacturers = getUniqueSortedFilterValues(
          payload.rides.map((ride) => ride.manufacturer)
        );

        setParkRideOptions({
          rideTypes,
          manufacturers
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
      }
    };

    void loadRideOptions();

    return () => {
      controller.abort();
    };
  }, [route]);

  useEffect(() => {
    if (route.view !== "park") {
      setParkRidesStatus({ state: "idle" });

      return;
    }

    if (!apiBaseUrl) {
      setParkRidesStatus({
        state: "error",
        message: missingApiBaseUrlMessage
      });

      return;
    }

    const controller = new AbortController();

    const loadRides = async () => {
      setParkRidesStatus({ state: "loading" });

      try {
        const ridesUrl = new URL(`/parks/${route.slug}/rides`, apiBaseUrl);

        if (rideTypeFilter) {
          ridesUrl.searchParams.set("rideType", rideTypeFilter);
        }

        if (manufacturerFilter) {
          ridesUrl.searchParams.set("manufacturer", manufacturerFilter);
        }

        ridesUrl.searchParams.set("sort", parkRideSort);

        const response = await fetch(ridesUrl, { signal: controller.signal });

        if (response.status === 404) {
          setParkRidesStatus({
            state: "error",
            message: "Park not found."
          });

          return;
        }

        if (!response.ok) {
          setParkRidesStatus({
            state: "error",
            message: `Rides request failed with status ${response.status}.`
          });

          return;
        }

        const payload = (await response.json()) as RidesResponse;

        setParkRidesStatus({
          state: "success",
          rides: payload.rides
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setParkRidesStatus({
          state: "error",
          message: error instanceof Error ? error.message : "The rides request failed."
        });
      }
    };

    void loadRides();

    return () => {
      controller.abort();
    };
  }, [route, rideTypeFilter, manufacturerFilter, parkRideSort]);

  return {
    parkRidesStatus,
    parkRideOptions
  };
};
