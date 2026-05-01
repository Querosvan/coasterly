import { useEffect, useState } from "react";

import type { ParksResponse } from "@coasterly/types";

import {
  browsePageSize,
  fullCatalogFetchLimit
} from "../lib/routes";
import type { ParksStatus, Route } from "../lib/types";
import { apiBaseUrl, missingApiBaseUrlMessage } from "./userDataApi";

export type UseParksCatalogOptions = {
  route: Route;
  searchQuery: string;
  parkCollectionId: string;
  parksPage: number;
};

export type UseParksCatalogResult = {
  parksStatus: ParksStatus;
};

export const useParksCatalog = ({
  route,
  searchQuery,
  parkCollectionId,
  parksPage
}: UseParksCatalogOptions): UseParksCatalogResult => {
  const [parksStatus, setParksStatus] = useState<ParksStatus>({
    state: "loading"
  });

  useEffect(() => {
    if (!apiBaseUrl) {
      setParksStatus({
        state: "error",
        message: missingApiBaseUrlMessage
      });

      return;
    }

    const controller = new AbortController();
    const activeSearchQuery = route.view === "parks" ? searchQuery.trim() : "";
    const shouldPaginateParks = route.view === "parks" && !parkCollectionId;
    const effectiveParkLimit =
      route.view === "parks"
        ? shouldPaginateParks
          ? browsePageSize
          : fullCatalogFetchLimit
        : 24;
    const effectiveParkOffset = shouldPaginateParks
      ? (parksPage - 1) * browsePageSize
      : 0;

    setParksStatus({ state: "loading" });

    const timeoutId = window.setTimeout(() => {
      const loadParks = async () => {
        try {
          const parksUrl = new URL("/parks", apiBaseUrl);

          if (activeSearchQuery) {
            parksUrl.searchParams.set("search", activeSearchQuery);
          }

          parksUrl.searchParams.set("limit", String(effectiveParkLimit));
          parksUrl.searchParams.set("offset", String(effectiveParkOffset));

          const response = await fetch(parksUrl, {
            signal: controller.signal
          });

          if (!response.ok) {
            setParksStatus({
              state: "error",
              message: `Parks request failed with status ${response.status}.`
            });

            return;
          }

          const payload = (await response.json()) as ParksResponse;

          setParksStatus({
            state: "success",
            parks: payload.parks,
            ...(payload.pageInfo ? { pageInfo: payload.pageInfo } : {})
          });
        } catch (error) {
          if (controller.signal.aborted) {
            return;
          }

          setParksStatus({
            state: "error",
            message: error instanceof Error ? error.message : "The parks request failed."
          });
        }
      };

      void loadParks();
    }, activeSearchQuery ? 250 : 0);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [route, searchQuery, parkCollectionId, parksPage]);

  return {
    parksStatus
  };
};
