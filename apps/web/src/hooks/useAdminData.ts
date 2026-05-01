import { useCallback, useEffect, useState } from "react";

import type {
  AdminCatalogFilter,
  AdminParksResponse,
  AdminRidesResponse,
  AdminSummaryResponse
} from "@coasterly/types";

import {
  adminCatalogPageSize,
  defaultAdminCatalogPage,
  defaultAdminFilter
} from "../lib/admin";
import type { AdminParksStatus, AdminRidesStatus, AdminSummaryStatus, Route } from "../lib/types";
import {
  apiBaseUrl,
  fetchWithSession,
  missingApiBaseUrlMessage
} from "./userDataApi";

export type UseAdminDataOptions = {
  route: Route;
  isAdminUser: boolean;
};

export type UseAdminDataResult = {
  adminParksStatus: AdminParksStatus;
  adminRidesStatus: AdminRidesStatus;
  adminSummaryStatus: AdminSummaryStatus;
  adminParksPage: number;
  adminRidesPage: number;
  adminFilter: AdminCatalogFilter;
  applyAdminFilter: (nextFilter: AdminCatalogFilter) => void;
  resetAdminCatalog: () => void;
  goToPreviousAdminParksPage: () => void;
  goToNextAdminParksPage: () => void;
  goToPreviousAdminRidesPage: () => void;
  goToNextAdminRidesPage: () => void;
};

export const useAdminData = ({
  route,
  isAdminUser
}: UseAdminDataOptions): UseAdminDataResult => {
  const [adminParksStatus, setAdminParksStatus] = useState<AdminParksStatus>({
    state: "idle"
  });
  const [adminRidesStatus, setAdminRidesStatus] = useState<AdminRidesStatus>({
    state: "idle"
  });
  const [adminSummaryStatus, setAdminSummaryStatus] = useState<AdminSummaryStatus>({
    state: "idle"
  });
  const [adminParksPage, setAdminParksPage] = useState(defaultAdminCatalogPage);
  const [adminRidesPage, setAdminRidesPage] = useState(defaultAdminCatalogPage);
  const [adminFilter, setAdminFilter] = useState<AdminCatalogFilter>(defaultAdminFilter);

  const loadAdminParks = useCallback(
    async (signal?: AbortSignal) => {
      if (!apiBaseUrl) {
        setAdminParksStatus({
          state: "error",
          message: missingApiBaseUrlMessage
        });

        return;
      }

      setAdminParksStatus({ state: "loading" });

      try {
        const response = await fetchWithSession(
          new URL(
            `/admin/parks?limit=${adminCatalogPageSize}&offset=${(adminParksPage - 1) * adminCatalogPageSize}&filter=${adminFilter}`,
            apiBaseUrl
          ),
          {
            ...(signal ? { signal } : {})
          }
        );

        if (!response.ok) {
          setAdminParksStatus({
            state: "error",
            message: `Admin parks request failed with status ${response.status}.`
          });

          return;
        }

        const payload = (await response.json()) as AdminParksResponse;

        setAdminParksStatus({
          state: "success",
          parks: payload.parks,
          pageInfo: payload.pageInfo
        });
      } catch (error) {
        if (signal?.aborted) {
          return;
        }

        setAdminParksStatus({
          state: "error",
          message:
            error instanceof Error ? error.message : "The admin parks request failed."
        });
      }
    },
    [adminFilter, adminParksPage]
  );

  const loadAdminRides = useCallback(
    async (signal?: AbortSignal) => {
      if (!apiBaseUrl) {
        setAdminRidesStatus({
          state: "error",
          message: missingApiBaseUrlMessage
        });

        return;
      }

      setAdminRidesStatus({ state: "loading" });

      try {
        const response = await fetchWithSession(
          new URL(
            `/admin/rides?limit=${adminCatalogPageSize}&offset=${(adminRidesPage - 1) * adminCatalogPageSize}&filter=${adminFilter}`,
            apiBaseUrl
          ),
          {
            ...(signal ? { signal } : {})
          }
        );

        if (!response.ok) {
          setAdminRidesStatus({
            state: "error",
            message: `Admin rides request failed with status ${response.status}.`
          });

          return;
        }

        const payload = (await response.json()) as AdminRidesResponse;

        setAdminRidesStatus({
          state: "success",
          rides: payload.rides,
          pageInfo: payload.pageInfo
        });
      } catch (error) {
        if (signal?.aborted) {
          return;
        }

        setAdminRidesStatus({
          state: "error",
          message:
            error instanceof Error ? error.message : "The admin rides request failed."
        });
      }
    },
    [adminFilter, adminRidesPage]
  );

  const loadAdminSummary = useCallback(async (signal?: AbortSignal) => {
    if (!apiBaseUrl) {
      setAdminSummaryStatus({
        state: "error",
        message: missingApiBaseUrlMessage
      });

      return;
    }

    setAdminSummaryStatus({ state: "loading" });

    try {
      const response = await fetchWithSession(new URL("/admin/summary", apiBaseUrl), {
        ...(signal ? { signal } : {})
      });

      if (!response.ok) {
        setAdminSummaryStatus({
          state: "error",
          message: `Admin summary request failed with status ${response.status}.`
        });

        return;
      }

      const payload = (await response.json()) as AdminSummaryResponse;

      setAdminSummaryStatus({
        state: "success",
        summary: payload.summary
      });
    } catch (error) {
      if (signal?.aborted) {
        return;
      }

      setAdminSummaryStatus({
        state: "error",
        message:
          error instanceof Error ? error.message : "The admin summary request failed."
      });
    }
  }, []);

  useEffect(() => {
    if (route.view !== "admin" || !isAdminUser) {
      setAdminParksStatus({ state: "idle" });
      setAdminRidesStatus({ state: "idle" });
      setAdminSummaryStatus({ state: "idle" });

      return;
    }

    const controller = new AbortController();

    void loadAdminSummary(controller.signal);
    void loadAdminParks(controller.signal);
    void loadAdminRides(controller.signal);

    return () => {
      controller.abort();
    };
  }, [route, isAdminUser, loadAdminParks, loadAdminRides, loadAdminSummary]);

  const resetAdminCatalog = useCallback(() => {
    setAdminParksPage(defaultAdminCatalogPage);
    setAdminRidesPage(defaultAdminCatalogPage);
    setAdminFilter(defaultAdminFilter);
  }, []);

  const goToPreviousAdminParksPage = useCallback(() => {
    setAdminParksPage((currentPage) =>
      currentPage > defaultAdminCatalogPage ? currentPage - 1 : currentPage
    );
  }, []);

  const goToNextAdminParksPage = useCallback(() => {
    if (adminParksStatus.state !== "success" || !adminParksStatus.pageInfo?.hasMore) {
      return;
    }

    setAdminParksPage((currentPage) => currentPage + 1);
  }, [adminParksStatus]);

  const goToPreviousAdminRidesPage = useCallback(() => {
    setAdminRidesPage((currentPage) =>
      currentPage > defaultAdminCatalogPage ? currentPage - 1 : currentPage
    );
  }, []);

  const goToNextAdminRidesPage = useCallback(() => {
    if (adminRidesStatus.state !== "success" || !adminRidesStatus.pageInfo?.hasMore) {
      return;
    }

    setAdminRidesPage((currentPage) => currentPage + 1);
  }, [adminRidesStatus]);

  const applyAdminFilter = useCallback((nextFilter: AdminCatalogFilter) => {
    setAdminFilter(nextFilter);
    setAdminParksPage(defaultAdminCatalogPage);
    setAdminRidesPage(defaultAdminCatalogPage);
  }, []);

  return {
    adminParksStatus,
    adminRidesStatus,
    adminSummaryStatus,
    adminParksPage,
    adminRidesPage,
    adminFilter,
    applyAdminFilter,
    resetAdminCatalog,
    goToPreviousAdminParksPage,
    goToNextAdminParksPage,
    goToPreviousAdminRidesPage,
    goToNextAdminRidesPage
  };
};
