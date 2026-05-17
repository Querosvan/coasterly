import type { CuratedCollection, EditorialNote } from "./types";

export const editorialFeaturedParkSlugs = [
  "phantasialand",
  "europa-park",
  "energylandia",
  "portaventura-park",
  "parque-warner-madrid",
  "alton-towers"
] as const;

export const selectEditorialFeaturedParks = <TPark extends { slug: string }>(
  parks: readonly TPark[],
  limit: number
) => {
  const parkBySlug = new Map(parks.map((park) => [park.slug, park]));
  const editorialParks = editorialFeaturedParkSlugs
    .map((slug) => parkBySlug.get(slug))
    .filter((park): park is TPark => Boolean(park));
  const editorialSlugs = new Set(editorialParks.map((park) => park.slug));
  const fallbackParks = parks.filter((park) => !editorialSlugs.has(park.slug));

  return [...editorialParks, ...fallbackParks].slice(0, limit);
};

export const journalTeasers = [
  {
    category: "Guide",
    title: "Park planning notes",
    summary: "Trip planning context, lineup highlights, and progress-ready park guides.",
    status: "Guide"
  },
  {
    category: "Ranking",
    title: "Coaster lists worth revisiting",
    summary: "Editorial rankings, route ideas, and park-by-park comparisons.",
    status: "Ranking"
  },
  {
    category: "News",
    title: "Launches, retracks, and major openings",
    summary: "Notable park updates, major ride openings, and lineup changes worth tracking.",
    status: "News"
  }
] as const;

export const parkEditorialBySlug: Record<string, EditorialNote> = {
  "europa-park": {
    summary:
      "A resort-scale park with polished themed lands and one of Europe's deepest all-day coaster lineups.",
    cues: ["Featured", "Standout"]
  },
  phantasialand: {
    summary:
      "Dense theming and terrain-driven coasters make this one of the sharpest park days in Europe.",
    cues: ["Headliner", "Standout"]
  },
  "alton-towers": {
    summary:
      "A British classic where major coasters thread through gardens, ruins, and a distinctly atmospheric setting.",
    cues: ["Iconic"]
  },
  "disneyland-park": {
    summary:
      "A castle park built on polished storytelling, broad appeal, and a few instantly recognizable coaster anchors.",
    cues: ["Featured", "Iconic"]
  },
  "parc-asterix": {
    summary:
      "A French thrill-forward park with a fast-rising coaster lineup and a strong steel headline identity.",
    cues: ["Standout"]
  },
  efteling: {
    summary:
      "Fantasy atmosphere, dark rides, and a selective coaster lineup give this catalog stop a very different pace.",
    cues: ["Iconic"]
  },
  "walibi-holland": {
    summary:
      "Compact and ride-led, with a modern thrill lineup that overdelivers for coaster-focused trips.",
    cues: ["Standout"]
  },
  "portaventura-park": {
    summary:
      "A large destination park known for skyline coasters, strong throughput, and broad resort appeal.",
    cues: ["Headliner"]
  },
  "parque-warner-madrid": {
    summary:
      "A Madrid thrill park with recognizable IP, strong coaster anchors, and a clear destination feel.",
    cues: ["Headliner"]
  },
  gardaland: {
    summary:
      "Italy's best-known park, mixing family pull with a small set of reliable headline coasters.",
    cues: ["Featured"]
  },
  energylandia: {
    summary:
      "A rapidly expanding ride-heavy park packed with major coasters and strong credit-count appeal.",
    cues: ["Headliner", "Standout"]
  },
  liseberg: {
    summary:
      "A city park with compact energy, strong atmosphere, and a surprisingly high-quality coaster mix.",
    cues: ["Iconic", "Standout"]
  }
};

export const rideEditorialBySlug: Record<string, EditorialNote> = {
  "silver-star": {
    summary:
      "An open, high-speed hyper with sustained airtime and one of the biggest first drops in Europe.",
    cues: ["Headliner", "Iconic"]
  },
  "voltron-nevera": {
    summary:
      "A dense modern launch coaster built around rapid pacing, inversions, and forceful transitions.",
    cues: ["Featured", "Standout"]
  },
  taron: {
    summary:
      "Terrain-hugging launches and relentless direction changes make it a modern European benchmark.",
    cues: ["Iconic", "Standout"]
  },
  fly: {
    summary:
      "A flying coaster wrapped in heavy theming, designed to feel immersive rather than exposed.",
    cues: ["Featured"]
  },
  "nemesis-reborn": {
    summary:
      "An iconic inverted layout rebuilt around one of the most recognizable coaster names in Europe.",
    cues: ["Iconic"]
  },
  "wicker-man": {
    summary:
      "A character-led wooden coaster with approachable intensity and a memorable visual identity.",
    cues: ["Standout"]
  },
  "big-thunder-mountain": {
    summary:
      "A classic mine train built around scenery, pacing, and broad repeatability rather than raw stats.",
    cues: ["Iconic"]
  },
  "star-wars-hyperspace-mountain": {
    summary:
      "A compact indoor thrill ride that layers Disney spectacle onto a classic high-intensity layout.",
    cues: ["Featured"]
  },
  toutatis: {
    summary:
      "A recent Intamin built to deliver speed, hangtime, and sustained momentum from the first launch.",
    cues: ["Headliner"]
  },
  oziris: {
    summary:
      "A sweeping B&M invert with strong interaction, confident pacing, and broad re-ride appeal.",
    cues: ["Standout"]
  },
  "baron-1898": {
    summary:
      "A compact dive coaster with one dominant drop and a strong Efteling story wrapper.",
    cues: ["Featured"]
  },
  "joris-en-de-draak": {
    summary:
      "A twin-track wooden coaster that adds race energy to one of Efteling's most kinetic areas.",
    cues: ["Iconic"]
  },
  untamed: {
    summary:
      "An RMC hybrid known for quick-fire airtime moments and an aggressively modern pacing profile.",
    cues: ["Headliner"]
  },
  goliath: {
    summary:
      "A classic Intamin mega built around sustained speed and broad, open-air airtime.",
    cues: ["Iconic"]
  },
  shambhala: {
    summary:
      "A towering hyper coaster with huge scale, floating airtime, and one of Europe's signature skylines.",
    cues: ["Headliner", "Iconic"]
  },
  "dragon-khan": {
    summary:
      "A classic inversion machine that still defines PortAventura's skyline and thrill identity.",
    cues: ["Iconic"]
  },
  raptor: {
    summary:
      "A compact wing coaster that stays forceful by keeping the pacing tight and the interactions close.",
    cues: ["Standout"]
  },
  "oblivion-the-black-hole": {
    summary:
      "A dive machine built around one dramatic pause-and-drop sequence rather than a long layout.",
    cues: ["Featured"]
  },
  hyperion: {
    summary:
      "A giant hyper coaster known for scale, pace, and one of the fastest top speeds in the region.",
    cues: ["Headliner"]
  },
  zadra: {
    summary:
      "A large hybrid that combines towering scale with the quick-fire intensity RMC is known for.",
    cues: ["Headliner", "Standout"]
  },
  helix: {
    summary:
      "A launch coaster built for variety, blending launches, inversions, and hillside terrain.",
    cues: ["Standout"]
  },
  balder: {
    summary:
      "A wood coaster that stays relevant through clean pacing, strong airtime, and easy repeat rides.",
    cues: ["Iconic"]
  }
};

export const curatedCollections: CuratedCollection[] = [
  {
    id: "first-time-europe-parks",
    title: "First-time Europe parks",
    summary:
      "Balanced first picks with recognizable coasters, strong atmosphere, and a full-day park rhythm.",
    kind: "park",
    badge: "Parks",
    itemSlugs: ["europa-park", "phantasialand", "portaventura-park", "efteling"]
  },
  {
    id: "parks-with-strong-lineups",
    title: "Parks with strong lineups",
    summary:
      "Dense coaster depth for days where the lineup matters more than a single headline ride.",
    kind: "park",
    badge: "Parks",
    itemSlugs: ["europa-park", "energylandia", "walibi-holland", "phantasialand"]
  },
  {
    id: "best-launches",
    title: "Best launches",
    summary:
      "Fast acceleration, terrain interaction, and momentum-heavy layouts for riders who chase pacing.",
    kind: "ride",
    badge: "Rides",
    itemSlugs: ["taron", "voltron-nevera", "toutatis", "helix"]
  },
  {
    id: "iconic-hypers",
    title: "Iconic hypers",
    summary:
      "Big-airtime headliners that define skylines and still anchor European coaster trip planning.",
    kind: "ride",
    badge: "Rides",
    itemSlugs: ["silver-star", "shambhala", "hyperion"]
  },
  {
    id: "standout-inverts-and-flyers",
    title: "Standout inverts and flyers",
    summary:
      "Suspended or floorless-feeling layouts where interaction and presentation matter as much as stats.",
    kind: "ride",
    badge: "Rides",
    itemSlugs: ["fly", "nemesis-reborn", "oziris", "raptor"]
  }
];
