import { useEffect, useState } from "react";

import type { RideCatalogOptionsResponse, RideCatalogResponse } from "@coasterly/types";

import { getUniqueSortedFilterValues } from "../lib/catalogUtils";
import {
  browsePageSize,
  fullCatalogFetchLimit
} from "../lib/routes";
import type {
  RidesCatalogOptions,
  RidesCatalogSort,
  RidesCatalogStatus,
  Route
} from "../lib/types";
import { apiBaseUrl, missingApiBaseUrlMessage } from "./userDataApi";

export type UseRidesCatalogOptions = {
  route: Route;
  rideCatalogSearchQuery: string;
  rideCatalogParkFilter: string;
  rideCatalogRideTypeFilter: string;
  rideCatalogManufacturerFilter: string;
  rideCatalogSort: RidesCatalogSort;
  rideCollectionId: string;
  ridesCatalogPage: number;
};

export type UseRidesCatalogResult = {
  ridesCatalogStatus: RidesCatalogStatus;
  ridesCatalogOptions: RidesCatalogOptions;
};

export const useRidesCatalog = ({
  route,
  rideCatalogSearchQuery,
  rideCatalogParkFilter,
  rideCatalogRideTypeFilter,
  rideCatalogManufacturerFilter,
  rideCatalogSort,
  rideCollectionId,
  ridesCatalogPage
}: UseRidesCatalogOptions): UseRidesCatalogResult => {
  const [ridesCatalogStatus, setRidesCatalogStatus] = useState<RidesCatalogStatus>({
    state: "idle"
  });
  const [ridesCatalogOptions, setRidesCatalogOptions] = useState<RidesCatalogOptions>({
    parks: [],
    rideTypes: [],
    manufacturers: []
  });

  useEffect(() => {
    if (route.view !== "rides") {
      setRidesCatalogOptions({
        parks: [],
        rideTypes: [],
        manufacturers: []
      });

      return;
    }

    if (!apiBaseUrl) {
      return;
    }

    const controller = new AbortController();

    const loadRidesCatalogOptions = async () => {
      try {
        const response = await fetch(new URL("/rides/options", apiBaseUrl), {
          signal: controller.signal
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as RideCatalogOptionsResponse;

        setRidesCatalogOptions({
          parks: payload.parks,
          rideTypes: getUniqueSortedFilterValues(payload.rideTypes, {
            excludeGenericRideTypes: true
          }),
          manufacturers: getUniqueSortedFilterValues(payload.manufacturers)
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
      }
    };

    void loadRidesCatalogOptions();

    return () => {
      controller.abort();
    };
  }, [route]);

  useEffect(() => {
    if (route.view !== "rides") {
      setRidesCatalogStatus({ state: "idle" });

      return;
    }

    if (!apiBaseUrl) {
      setRidesCatalogStatus({
        state: "error",
        message: missingApiBaseUrlMessage
      });

      return;
    }

    const controller = new AbortController();
    const activeSearchQuery = rideCatalogSearchQuery.trim();
    const shouldPaginateRides = !rideCollectionId;
    const effectiveRideLimit = shouldPaginateRides
      ? browsePageSize
      : fullCatalogFetchLimit;
    const effectiveRideOffset = shouldPaginateRides
      ? (ridesCatalogPage - 1) * browsePageSize
      : 0;

    setRidesCatalogStatus({ state: "loading" });

    const timeoutId = window.setTimeout(() => {
      const loadRidesCatalog = async () => {
        try {
          const ridesUrl = new URL("/rides", apiBaseUrl);

          if (activeSearchQuery) {
            ridesUrl.searchParams.set("search", activeSearchQuery);
          }

          if (rideCatalogParkFilter) {
            ridesUrl.searchParams.set("park", rideCatalogParkFilter);
          }

          if (rideCatalogRideTypeFilter) {
            ridesUrl.searchParams.set("rideType", rideCatalogRideTypeFilter);
          }

          if (rideCatalogManufacturerFilter) {
            ridesUrl.searchParams.set("manufacturer", rideCatalogManufacturerFilter);
          }

          ridesUrl.searchParams.set("sort", rideCatalogSort);
          ridesUrl.searchParams.set("limit", String(effectiveRideLimit));
          ridesUrl.searchParams.set("offset", String(effectiveRideOffset));

          const response = await fetch(ridesUrl, {
            signal: controller.signal
          });

          if (!response.ok) {
            setRidesCatalogStatus({
              state: "error",
              message: `Rides request failed with status ${response.status}.`
            });

            return;
          }

          const payload = (await response.json()) as RideCatalogResponse;

          setRidesCatalogStatus({
            state: "success",
            rides: payload.rides,
            ...(payload.pageInfo ? { pageInfo: payload.pageInfo } : {})
          });
        } catch (error) {
          if (controller.signal.aborted) {
            return;
          }

          setRidesCatalogStatus({
            state: "error",
            message: error instanceof Error ? error.message : "The rides request failed."
          });
        }
      };

      void loadRidesCatalog();
    }, activeSearchQuery ? 250 : 0);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [
    route,
    rideCatalogSearchQuery,
    rideCatalogParkFilter,
    rideCatalogRideTypeFilter,
    rideCatalogManufacturerFilter,
    rideCatalogSort,
    rideCollectionId,
    ridesCatalogPage
  ]);

  return {
    ridesCatalogStatus,
    ridesCatalogOptions
  };
};
