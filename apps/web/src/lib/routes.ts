import { matchPath } from "react-router-dom";

import type { ParkRideSort, RideDetailOrigin, RidesCatalogSort, Route } from "./types";

export type { Route } from "./types";

export const browsePageSize = 24;
export const fullCatalogFetchLimit = 5000;
export const defaultCatalogPage = 1;
export const defaultParkRideSort: ParkRideSort = "name";
export const defaultRidesCatalogSort: RidesCatalogSort = "name";

const isParkRideSort = (value: string | null): value is ParkRideSort =>
  value === "name" || value === "opening_year" || value === "speed_kmh";

const isRidesCatalogSort = (value: string | null): value is RidesCatalogSort =>
  value === "name" || value === "opening_year" || value === "speed_kmh";

export const getSearchQueryFromUrl = (search: string) => {
  const value = new URLSearchParams(search).get("search")?.trim();

  return value ?? "";
};

export const getCatalogPageFromUrl = (search: string) => {
  const rawValue = new URLSearchParams(search).get("page");
  const parsedValue = rawValue ? Number.parseInt(rawValue, 10) : Number.NaN;

  return Number.isFinite(parsedValue) && parsedValue >= 1
    ? parsedValue
    : defaultCatalogPage;
};

export const getRideBrowserStateFromUrl = (search: string) => {
  const params = new URLSearchParams(search);
  const rideType = params.get("rideType")?.trim() ?? "";
  const manufacturer = params.get("manufacturer")?.trim() ?? "";
  const sort = params.get("sort");

  return {
    rideType,
    manufacturer,
    sort: isParkRideSort(sort) ? sort : defaultParkRideSort
  };
};

export const getRidesCatalogStateFromUrl = (search: string) => {
  const params = new URLSearchParams(search);
  const searchQuery = params.get("search")?.trim() ?? "";
  const park = params.get("park")?.trim() ?? "";
  const rideType = params.get("rideType")?.trim() ?? "";
  const manufacturer = params.get("manufacturer")?.trim() ?? "";
  const sort = params.get("sort");

  return {
    searchQuery,
    park,
    rideType,
    manufacturer,
    sort: isRidesCatalogSort(sort) ? sort : defaultRidesCatalogSort
  };
};

export const getCollectionIdFromUrl = (search: string) =>
  new URLSearchParams(search).get("collection")?.trim() ?? "";

export const getRideDetailOriginFromUrl = (search: string): RideDetailOrigin =>
  new URLSearchParams(search).get("origin") === "rides" ? "rides" : "park";

export const buildPathWithQuery = (pathname: string, params: URLSearchParams) => {
  const query = params.toString();

  return query ? `${pathname}?${query}` : pathname;
};

const decodeRouteParam = (value: string) => decodeURIComponent(value);

export const getRoute = (pathname: string): Route => {
  const rideMatch = matchPath(
    { path: "/parks/:parkSlug/rides/:rideSlug", end: true },
    pathname
  );

  if (rideMatch?.params.parkSlug && rideMatch.params.rideSlug) {
    return {
      view: "ride",
      parkSlug: decodeRouteParam(rideMatch.params.parkSlug),
      rideSlug: decodeRouteParam(rideMatch.params.rideSlug)
    };
  }

  if (matchPath({ path: "/parks", end: true }, pathname)) {
    return { view: "parks" };
  }

  if (matchPath({ path: "/rides", end: true }, pathname)) {
    return { view: "rides" };
  }

  const parkMatch = matchPath({ path: "/parks/:slug", end: true }, pathname);

  if (parkMatch?.params.slug) {
    return {
      view: "park",
      slug: decodeRouteParam(parkMatch.params.slug)
    };
  }

  if (matchPath({ path: "/discover", end: true }, pathname)) {
    return { view: "discover" };
  }

  if (matchPath({ path: "/admin", end: true }, pathname)) {
    return { view: "admin" };
  }

  if (matchPath({ path: "/profile", end: true }, pathname)) {
    return { view: "profile" };
  }

  const userProfileMatch = matchPath({ path: "/users/:slug", end: true }, pathname);

  if (userProfileMatch?.params.slug) {
    return {
      view: "user-profile",
      slug: decodeRouteParam(userProfileMatch.params.slug)
    };
  }

  if (matchPath({ path: "/journal", end: true }, pathname)) {
    return { view: "journal" };
  }

  return { view: "home" };
};
