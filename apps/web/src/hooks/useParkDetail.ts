import { useEffect, useState } from "react";

import type { ParkLiveWaitsResponse, ParkResponse } from "@coasterly/types";

import type { ParkDetailStatus, ParkLiveWaitsStatus, Route } from "../lib/types";
import { apiBaseUrl, missingApiBaseUrlMessage } from "./userDataApi";

export type UseParkDetailResult = {
  parkDetailStatus: ParkDetailStatus;
  parkLiveWaitsStatus: ParkLiveWaitsStatus;
};

export const useParkDetail = (route: Route): UseParkDetailResult => {
  const [parkDetailStatus, setParkDetailStatus] = useState<ParkDetailStatus>({
    state: "idle"
  });
  const [parkLiveWaitsStatus, setParkLiveWaitsStatus] =
    useState<ParkLiveWaitsStatus>({
      state: "idle"
    });

  useEffect(() => {
    if (route.view !== "park") {
      setParkDetailStatus({ state: "idle" });

      return;
    }

    if (!apiBaseUrl) {
      setParkDetailStatus({
        state: "error",
        message: missingApiBaseUrlMessage
      });

      return;
    }

    const controller = new AbortController();

    const loadPark = async () => {
      setParkDetailStatus({ state: "loading" });

      try {
        const response = await fetch(
          new URL(`/parks/${route.slug}`, apiBaseUrl),
          { signal: controller.signal }
        );

        if (response.status === 404) {
          setParkDetailStatus({
            state: "error",
            message: "Park not found."
          });

          return;
        }

        if (!response.ok) {
          setParkDetailStatus({
            state: "error",
            message: `Park request failed with status ${response.status}.`
          });

          return;
        }

        const payload = (await response.json()) as ParkResponse;

        setParkDetailStatus({
          state: "success",
          park: payload.park,
          ...(payload.queueTimes ? { queueTimes: payload.queueTimes } : {})
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setParkDetailStatus({
          state: "error",
          message: error instanceof Error ? error.message : "The park request failed."
        });
      }
    };

    void loadPark();

    return () => {
      controller.abort();
    };
  }, [route]);

  useEffect(() => {
    const liveWaitParkSlug =
      route.view === "park"
        ? route.slug
        : route.view === "ride"
          ? route.parkSlug
          : null;

    if (!liveWaitParkSlug) {
      setParkLiveWaitsStatus({ state: "idle" });

      return;
    }

    if (!apiBaseUrl) {
      setParkLiveWaitsStatus({
        state: "error",
        message: missingApiBaseUrlMessage
      });

      return;
    }

    const controller = new AbortController();

    const loadParkLiveWaits = async () => {
      setParkLiveWaitsStatus({ state: "loading" });

      try {
        const response = await fetch(
          new URL(`/parks/${liveWaitParkSlug}/live-waits`, apiBaseUrl),
          { signal: controller.signal }
        );

        if (response.status === 404) {
          setParkLiveWaitsStatus({
            state: "error",
            message: "Park not found."
          });

          return;
        }

        if (!response.ok) {
          setParkLiveWaitsStatus({
            state: "error",
            message: `Live waits request failed with status ${response.status}.`
          });

          return;
        }

        const payload = (await response.json()) as ParkLiveWaitsResponse;

        setParkLiveWaitsStatus({
          state: "success",
          source: payload.source,
          rides: payload.rides
        });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setParkLiveWaitsStatus({
          state: "error",
          message: error instanceof Error ? error.message : "The live waits request failed."
        });
      }
    };

    void loadParkLiveWaits();

    return () => {
      controller.abort();
    };
  }, [route]);

  return {
    parkDetailStatus,
    parkLiveWaitsStatus
  };
};
