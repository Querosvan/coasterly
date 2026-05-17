# Coasterly media priority list

This document defines the first cover images to create for Coasterly media coverage.
It is based on the current seed catalog, Home and Discover selection logic, curated
collections, daily challenge eligibility, and Queue-Times mappings.

Do not generate images in this task. Use this list to guide future image sourcing.

## Selection logic checked

- Home and Discover use the web editorial featured park order before falling back to raw catalog order.
- Current editorial featured park order is:
  - `phantasialand`
  - `europa-park`
  - `energylandia`
  - `portaventura-park`
  - `parque-warner-madrid`
  - `alton-towers`
- Home surfaces the first 3 available editorial parks directly in the hero/discovery area.
- Discover shows up to 2 recommended parks by default from the editorial featured parks unless a signed-in user has progress-ranked parks.
- Discover shows up to 3 curated collections. In the current order these are:
  - `first-time-europe-parks`
  - `parks-with-strong-lineups`
  - `best-launches`
- Daily challenge questions are built from the API ride catalog. With the current seed catalog, every seed ride is eligible; manufacturer questions require a manufacturer and currently every seed ride except the two Disneyland Park rides has one.
- Queue-Times seed mappings exist for every current seed park and ride, so Queue-Times support is a visibility multiplier rather than a filter.

## Target paths

Park covers:

```text
apps/web/public/media/parks/<slug>/cover.webp
```

Ride covers:

```text
apps/web/public/media/rides/<slug>/cover.webp
```

## Priority 0: immediate public surface

These are visible on Home or default Discover without user progress.

### Parks

| Priority | Park | Why first | Target path |
| --- | --- | --- | --- |
| P0 | Phantasialand | Editorial featured park #1, Home hero, Discover default recommendation, curated route park, Queue-Times mapped | `apps/web/public/media/parks/phantasialand/cover.webp` |
| P0 | Europa-Park | Editorial featured park #2, Home secondary card, Discover default recommendation, curated route park, Queue-Times mapped | `apps/web/public/media/parks/europa-park/cover.webp` |
| P0 | Energylandia | Editorial featured park #3, Home secondary card when present, major coaster lineup, Queue-Times mapped in seed data | `apps/web/public/media/parks/energylandia/cover.webp` |

### Rides

| Priority | Ride | Park | Why first | Target path |
| --- | --- | --- | --- | --- |
| P0 | Taron | Phantasialand | `best-launches` editorial collection, high-profile launch coaster, daily challenge pool, Queue-Times mapped | `apps/web/public/media/rides/taron/cover.webp` |
| P0 | Voltron Nevera | Europa-Park | `best-launches` editorial collection, newest headline ride in first Home park, daily challenge pool, Queue-Times mapped | `apps/web/public/media/rides/voltron-nevera/cover.webp` |
| P0 | Silver Star | Europa-Park | Headline ride for first Home park, `iconic-hypers` editorial collection, daily challenge pool, Queue-Times mapped | `apps/web/public/media/rides/silver-star/cover.webp` |

## Priority 1: Discover route coverage

These complete the parks and headline rides used by the first Discover routes.

### Parks

| Priority | Park | Why next | Target path |
| --- | --- | --- | --- |
| P1 | PortAventura Park | Editorial featured park #4, `first-time-europe-parks` curated route, Queue-Times mapped | `apps/web/public/media/parks/portaventura-park/cover.webp` |
| P1 | Parque Warner Madrid | Editorial featured park #5 for production catalogs when present | `apps/web/public/media/parks/parque-warner-madrid/cover.webp` |
| P1 | Alton Towers | Editorial featured park #6, fallback Home/Discover candidate, Queue-Times mapped | `apps/web/public/media/parks/alton-towers/cover.webp` |

### Rides

| Priority | Ride | Park | Why next | Target path |
| --- | --- | --- | --- | --- |
| P1 | Toutatis | Parc Asterix | `best-launches` editorial collection, daily challenge pool, Queue-Times mapped | `apps/web/public/media/rides/toutatis/cover.webp` |
| P1 | Helix | Liseberg | `best-launches` editorial collection, daily challenge pool, Queue-Times mapped | `apps/web/public/media/rides/helix/cover.webp` |
| P1 | Shambhala | PortAventura Park | `iconic-hypers` editorial collection, major route park headline, daily challenge pool, Queue-Times mapped | `apps/web/public/media/rides/shambhala/cover.webp` |
| P1 | Hyperion | Energylandia | `iconic-hypers` editorial collection, major route park headline, daily challenge pool, Queue-Times mapped | `apps/web/public/media/rides/hyperion/cover.webp` |
| P1 | Zadra | Energylandia | High-visibility companion headline at route park, daily challenge pool, Queue-Times mapped | `apps/web/public/media/rides/zadra/cover.webp` |
| P1 | Untamed | Walibi Holland | Headline ride at route park, daily challenge pool, Queue-Times mapped | `apps/web/public/media/rides/untamed/cover.webp` |

## Priority 2: remaining editorial and daily challenge rides

These are still product-visible through ride detail, catalog, daily challenge, Queue-Times support, or later curated collections.

| Priority | Ride | Park | Reason | Target path |
| --- | --- | --- | --- | --- |
| P2 | F.L.Y. | Phantasialand | `standout-inverts-and-flyers` editorial collection, daily challenge pool, Queue-Times mapped | `apps/web/public/media/rides/fly/cover.webp` |
| P2 | Nemesis Reborn | Alton Towers | `standout-inverts-and-flyers` editorial collection, editorial featured park ride, daily challenge pool, Queue-Times mapped | `apps/web/public/media/rides/nemesis-reborn/cover.webp` |
| P2 | OzIris | Parc Asterix | `standout-inverts-and-flyers` editorial collection, daily challenge pool, Queue-Times mapped | `apps/web/public/media/rides/oziris/cover.webp` |
| P2 | Raptor | Gardaland | `standout-inverts-and-flyers` editorial collection, daily challenge pool, Queue-Times mapped | `apps/web/public/media/rides/raptor/cover.webp` |
| P2 | Wicker Man | Alton Towers | Editorial featured park ride, daily challenge pool, Queue-Times mapped | `apps/web/public/media/rides/wicker-man/cover.webp` |
| P2 | Baron 1898 | Efteling | Route park ride, daily challenge pool, Queue-Times mapped | `apps/web/public/media/rides/baron-1898/cover.webp` |
| P2 | Joris en de Draak | Efteling | Route park ride, daily challenge pool, Queue-Times mapped | `apps/web/public/media/rides/joris-en-de-draak/cover.webp` |
| P2 | Goliath | Walibi Holland | Route park ride, daily challenge pool, Queue-Times mapped | `apps/web/public/media/rides/goliath/cover.webp` |
| P2 | Dragon Khan | PortAventura Park | Route park ride, daily challenge pool, Queue-Times mapped | `apps/web/public/media/rides/dragon-khan/cover.webp` |

## Priority 3: complete remaining park and ride coverage

These complete the current seed catalog. They are lower priority only because they are not directly surfaced on Home/Discover routes today.

### Parks

| Priority | Park | Reason | Target path |
| --- | --- | --- | --- |
| P3 | Parc Asterix | Supports Toutatis and OzIris; Queue-Times mapped | `apps/web/public/media/parks/parc-asterix/cover.webp` |
| P3 | Disneyland Park | Seed catalog park; Queue-Times mapped | `apps/web/public/media/parks/disneyland-park/cover.webp` |
| P3 | Efteling | `first-time-europe-parks` curated route; Queue-Times mapped | `apps/web/public/media/parks/efteling/cover.webp` |
| P3 | Walibi Holland | `parks-with-strong-lineups` curated route; Queue-Times mapped | `apps/web/public/media/parks/walibi-holland/cover.webp` |
| P3 | Gardaland | Supports Raptor and Oblivion: The Black Hole; Queue-Times mapped | `apps/web/public/media/parks/gardaland/cover.webp` |
| P3 | Liseberg | Supports Helix and Balder; Queue-Times mapped | `apps/web/public/media/parks/liseberg/cover.webp` |

### Rides

| Priority | Ride | Park | Reason | Target path |
| --- | --- | --- | --- | --- |
| P3 | Big Thunder Mountain | Disneyland Park | Daily challenge pool, Queue-Times mapped | `apps/web/public/media/rides/big-thunder-mountain/cover.webp` |
| P3 | Star Wars Hyperspace Mountain | Disneyland Park | Daily challenge pool, Queue-Times mapped | `apps/web/public/media/rides/star-wars-hyperspace-mountain/cover.webp` |
| P3 | Oblivion: The Black Hole | Gardaland | Daily challenge pool, Queue-Times mapped | `apps/web/public/media/rides/oblivion-the-black-hole/cover.webp` |
| P3 | Balder | Liseberg | Daily challenge pool, Queue-Times mapped | `apps/web/public/media/rides/balder/cover.webp` |

## Maintenance notes

- Revisit this list when Home or Discover selection logic changes.
- Revisit this list when curated collections change, especially ride collections.
- If imported catalog data adds new rides with Queue-Times mappings, prioritize items that appear in public-page routes, daily challenge questions, or high-traffic park detail pages.
- Keep cover images real and recognizable. Avoid abstract or atmospheric placeholders for these targets.
