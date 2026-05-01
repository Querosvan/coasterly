import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

import {
  defaultParkRideSort,
  getCatalogPageFromUrl,
  getCollectionIdFromUrl,
  getRideBrowserStateFromUrl,
  getRideDetailOriginFromUrl,
  getRidesCatalogStateFromUrl,
  getSearchQueryFromUrl
} from "../lib/routes";
import type { ParkRideSort, RideDetailOrigin, RidesCatalogSort } from "../lib/types";

export type UseCatalogQueryStateResult = {
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  parkCollectionId: string;
  setParkCollectionId: Dispatch<SetStateAction<string>>;
  parksPage: number;
  setParksPage: Dispatch<SetStateAction<number>>;
  rideTypeFilter: string;
  setRideTypeFilter: Dispatch<SetStateAction<string>>;
  manufacturerFilter: string;
  setManufacturerFilter: Dispatch<SetStateAction<string>>;
  parkRideSort: ParkRideSort;
  setParkRideSort: Dispatch<SetStateAction<ParkRideSort>>;
  rideCatalogSearchQuery: string;
  setRideCatalogSearchQuery: Dispatch<SetStateAction<string>>;
  rideCatalogParkFilter: string;
  setRideCatalogParkFilter: Dispatch<SetStateAction<string>>;
  rideCatalogRideTypeFilter: string;
  setRideCatalogRideTypeFilter: Dispatch<SetStateAction<string>>;
  rideCatalogManufacturerFilter: string;
  setRideCatalogManufacturerFilter: Dispatch<SetStateAction<string>>;
  rideCatalogSort: RidesCatalogSort;
  setRideCatalogSort: Dispatch<SetStateAction<RidesCatalogSort>>;
  ridesCatalogPage: number;
  setRidesCatalogPage: Dispatch<SetStateAction<number>>;
  rideCollectionId: string;
  setRideCollectionId: Dispatch<SetStateAction<string>>;
  rideDetailOrigin: RideDetailOrigin;
  setRideDetailOrigin: Dispatch<SetStateAction<RideDetailOrigin>>;
};

export const useCatalogQueryState = (locationSearch: string): UseCatalogQueryStateResult => {
  const [searchQuery, setSearchQuery] = useState(() =>
    getSearchQueryFromUrl(locationSearch)
  );
  const [parkCollectionId, setParkCollectionId] = useState(() =>
    getCollectionIdFromUrl(locationSearch)
  );
  const [parksPage, setParksPage] = useState(() =>
    getCatalogPageFromUrl(locationSearch)
  );
  const [rideTypeFilter, setRideTypeFilter] = useState(
    () => getRideBrowserStateFromUrl(locationSearch).rideType
  );
  const [manufacturerFilter, setManufacturerFilter] = useState(
    () => getRideBrowserStateFromUrl(locationSearch).manufacturer
  );
  const [parkRideSort, setParkRideSort] = useState<ParkRideSort>(
    () => getRideBrowserStateFromUrl(locationSearch).sort ?? defaultParkRideSort
  );
  const [rideCatalogSearchQuery, setRideCatalogSearchQuery] = useState(() =>
    getRidesCatalogStateFromUrl(locationSearch).searchQuery
  );
  const [rideCatalogParkFilter, setRideCatalogParkFilter] = useState(
    () => getRidesCatalogStateFromUrl(locationSearch).park
  );
  const [rideCatalogRideTypeFilter, setRideCatalogRideTypeFilter] = useState(
    () => getRidesCatalogStateFromUrl(locationSearch).rideType
  );
  const [rideCatalogManufacturerFilter, setRideCatalogManufacturerFilter] = useState(
    () => getRidesCatalogStateFromUrl(locationSearch).manufacturer
  );
  const [rideCatalogSort, setRideCatalogSort] = useState<RidesCatalogSort>(
    () => getRidesCatalogStateFromUrl(locationSearch).sort
  );
  const [ridesCatalogPage, setRidesCatalogPage] = useState(() =>
    getCatalogPageFromUrl(locationSearch)
  );
  const [rideCollectionId, setRideCollectionId] = useState(() =>
    getCollectionIdFromUrl(locationSearch)
  );
  const [rideDetailOrigin, setRideDetailOrigin] = useState<RideDetailOrigin>(() =>
    getRideDetailOriginFromUrl(locationSearch)
  );

  useEffect(() => {
    setSearchQuery(getSearchQueryFromUrl(locationSearch));
    setParksPage(getCatalogPageFromUrl(locationSearch));
    setParkCollectionId(getCollectionIdFromUrl(locationSearch));
    setRideCatalogSearchQuery(getRidesCatalogStateFromUrl(locationSearch).searchQuery);

    const rideBrowserState = getRideBrowserStateFromUrl(locationSearch);
    const ridesCatalogState = getRidesCatalogStateFromUrl(locationSearch);

    setRideTypeFilter(rideBrowserState.rideType);
    setManufacturerFilter(rideBrowserState.manufacturer);
    setParkRideSort(rideBrowserState.sort);
    setRideCatalogParkFilter(ridesCatalogState.park);
    setRideCatalogRideTypeFilter(ridesCatalogState.rideType);
    setRideCatalogManufacturerFilter(ridesCatalogState.manufacturer);
    setRideCatalogSort(ridesCatalogState.sort);
    setRidesCatalogPage(getCatalogPageFromUrl(locationSearch));
    setRideCollectionId(getCollectionIdFromUrl(locationSearch));
    setRideDetailOrigin(getRideDetailOriginFromUrl(locationSearch));
  }, [locationSearch]);

  return {
    searchQuery,
    setSearchQuery,
    parkCollectionId,
    setParkCollectionId,
    parksPage,
    setParksPage,
    rideTypeFilter,
    setRideTypeFilter,
    manufacturerFilter,
    setManufacturerFilter,
    parkRideSort,
    setParkRideSort,
    rideCatalogSearchQuery,
    setRideCatalogSearchQuery,
    rideCatalogParkFilter,
    setRideCatalogParkFilter,
    rideCatalogRideTypeFilter,
    setRideCatalogRideTypeFilter,
    rideCatalogManufacturerFilter,
    setRideCatalogManufacturerFilter,
    rideCatalogSort,
    setRideCatalogSort,
    ridesCatalogPage,
    setRidesCatalogPage,
    rideCollectionId,
    setRideCollectionId,
    rideDetailOrigin,
    setRideDetailOrigin
  };
};
