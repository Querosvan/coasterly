import type { Park, Ride } from "@coasterly/types";

import type { Locale } from "../i18n";
import type { UiCopy } from "./types";

export const formatParkLocation = (park: Pick<Park, "country" | "city">) =>
  park.city ? `${park.city}, ${park.country}` : park.country;

export const formatDecimalValue = (value: number) =>
  Number.isInteger(value) ? String(value) : value.toFixed(1);

const titleCase = (value: string) =>
  value.replace(/\b\w/g, (match) => match.toUpperCase());

const rideTypeDisplayLabels: Record<Locale, Record<string, string>> = {
  en: {
    coaster: "Coaster",
    "steel coaster": "Steel coaster",
    "launch coaster": "Launch coaster",
    "wood coaster": "Wooden coaster",
    "wooden coaster": "Wooden coaster",
    "dark ride": "Dark ride",
    "water ride": "Water ride",
    "family ride": "Family ride",
    "thrill ride": "Thrill ride",
    "flying coaster": "Flying coaster",
    "inverted coaster": "Inverted coaster",
    "mine train coaster": "Mine train coaster",
    "indoor coaster": "Indoor coaster",
    "dive coaster": "Dive coaster",
    "hybrid coaster": "Hybrid coaster",
    "mega coaster": "Mega coaster",
    "hyper coaster": "Hyper coaster",
    "sit-down coaster": "Sit-down coaster",
    "wing coaster": "Wing coaster"
  },
  es: {
    coaster: "Montaña rusa",
    "steel coaster": "Montaña rusa de acero",
    "launch coaster": "Montaña rusa lanzada",
    "wood coaster": "Montaña rusa de madera",
    "wooden coaster": "Montaña rusa de madera",
    "dark ride": "Dark ride",
    "water ride": "Atracción acuática",
    "family ride": "Atracción familiar",
    "thrill ride": "Atracción intensa",
    "flying coaster": "Flying coaster",
    "inverted coaster": "Montaña rusa invertida",
    "mine train coaster": "Mine train",
    "indoor coaster": "Montaña rusa indoor",
    "dive coaster": "Dive coaster",
    "hybrid coaster": "Montaña rusa híbrida",
    "mega coaster": "Mega coaster",
    "hyper coaster": "Hyper coaster",
    "sit-down coaster": "Sit-down coaster",
    "wing coaster": "Wing coaster"
  }
};

const genericRideTypeValues = new Set(["", "ride", "attraction", "attractions"]);

const getNormalizedOptionValue = (value?: string | null) => value?.trim() ?? "";

export const formatRideTypeDisplay = (locale: Locale, rideType?: string | null) => {
  const normalizedRideType = getNormalizedOptionValue(rideType).toLowerCase();

  if (genericRideTypeValues.has(normalizedRideType)) {
    return null;
  }

  return (
    rideTypeDisplayLabels[locale][normalizedRideType] ??
    (rideType ? titleCase(rideType.trim()) : null)
  );
};

export const getUniqueSortedFilterValues = (
  values: Array<string | null | undefined>,
  options?: { excludeGenericRideTypes?: boolean }
) => {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of values) {
    const trimmedValue = getNormalizedOptionValue(value);

    if (!trimmedValue) {
      continue;
    }

    const normalizedValue = trimmedValue.toLowerCase();

    if (options?.excludeGenericRideTypes && genericRideTypeValues.has(normalizedValue)) {
      continue;
    }

    if (seen.has(normalizedValue)) {
      continue;
    }

    seen.add(normalizedValue);
    result.push(trimmedValue);
  }

  result.sort((left, right) => left.localeCompare(right));

  return result;
};

export const getDisplayRideTypeFilterOptions = (locale: Locale, rideTypes: string[]) => {
  const seen = new Set<string>();
  const result: Array<{ value: string; label: string }> = [];

  for (const rideType of getUniqueSortedFilterValues(rideTypes, {
    excludeGenericRideTypes: true
  })) {
    const label = formatRideTypeDisplay(locale, rideType);

    if (!label) {
      continue;
    }

    const normalizedLabel = label.toLowerCase();

    if (seen.has(normalizedLabel)) {
      continue;
    }

    seen.add(normalizedLabel);
    result.push({ value: rideType, label });
  }

  result.sort((left, right) => left.label.localeCompare(right.label));

  return result;
};

export const getParkCardMetric = (
  copy: UiCopy,
  parkProgress?: { riddenRides: number; totalRides: number }
) => {
  if (parkProgress && parkProgress.riddenRides > 0) {
    return {
      label: copy.home.progressLabel,
      value: copy.park.riddenOutOf(parkProgress.riddenRides, parkProgress.totalRides)
    };
  }

  return null;
};

export const getRideCardMeta = (
  locale: Locale,
  ride: Pick<Ride, "rideType" | "manufacturer" | "openingYear" | "speedKmh">
) => {
  const rideTypeDisplay = formatRideTypeDisplay(locale, ride.rideType);
  const openedLabel = locale === "es" ? "Abierta" : "Opened";

  if (rideTypeDisplay && ride.manufacturer) {
    return `${rideTypeDisplay} · ${ride.manufacturer}`;
  }

  if (rideTypeDisplay) {
    return rideTypeDisplay;
  }

  if (ride.manufacturer && ride.speedKmh !== undefined) {
    return `${ride.manufacturer} · ${formatDecimalValue(ride.speedKmh)} km/h`;
  }

  if (ride.manufacturer && ride.openingYear !== undefined) {
    return `${ride.manufacturer} · ${openedLabel} ${ride.openingYear}`;
  }

  if (ride.manufacturer) {
    return ride.manufacturer;
  }

  if (ride.openingYear !== undefined && ride.speedKmh !== undefined) {
    return `${formatDecimalValue(ride.speedKmh)} km/h · ${openedLabel} ${ride.openingYear}`;
  }

  if (ride.speedKmh !== undefined) {
    return `${formatDecimalValue(ride.speedKmh)} km/h`;
  }

  if (ride.openingYear !== undefined) {
    return `${openedLabel} ${ride.openingYear}`;
  }

  return null;
};
