type CatalogNameOverride = {
  canonicalName?: string;
  alternateNames?: string[];
};

export const queueTimesParkNameOverrides: Record<string, CatalogNameOverride> = {
  "9": {
    alternateNames: ["Parc Astérix"]
  }
};

export const queueTimesRideNameOverrides: Record<string, CatalogNameOverride> = {
  "8236": {
    alternateNames: ["FLY"]
  },
  "1905": {
    alternateNames: ["Oblivion: The Black Hole"]
  },
  "13349": {
    canonicalName: "Voltron Nevera",
    alternateNames: ["Voltron Nevera powered by Rimac"]
  }
};
