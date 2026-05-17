import type { ParkLiveWait, ParkStatus, RideStatus } from "@coasterly/types";

export type Locale = "en" | "es";

export const localeStorageKey = "coasterly-locale";

export const localeLabels: Record<Locale, string> = {
  en: "EN",
  es: "ES"
};

export const normalizeLocale = (value?: string | null): Locale =>
  value?.toLowerCase().startsWith("es") ? "es" : "en";

export const getInitialLocale = (): Locale => {
  if (typeof window === "undefined") {
    return "en";
  }

  const storedLocale = window.localStorage.getItem(localeStorageKey);

  if (storedLocale) {
    return normalizeLocale(storedLocale);
  }

  return normalizeLocale(window.navigator.language);
};

export type DiscoveryCue = "Featured" | "Headliner" | "Iconic" | "Standout";

export type CountKind =
  | "park"
  | "ride"
  | "riddenRide"
  | "mission"
  | "badge"
  | "liveRide"
  | "visibleRide"
  | "challenge";

type CountWords = {
  one: string;
  other: string;
};

const countWordsByLocale: Record<Locale, Record<CountKind, CountWords>> = {
  en: {
    park: { one: "park", other: "parks" },
    ride: { one: "ride", other: "rides" },
    riddenRide: { one: "ridden ride", other: "ridden rides" },
    mission: { one: "mission", other: "missions" },
    badge: { one: "badge", other: "badges" },
    liveRide: { one: "live ride", other: "live rides" },
    visibleRide: { one: "visible ride", other: "visible rides" },
    challenge: { one: "challenge", other: "challenges" }
  },
  es: {
    park: { one: "parque", other: "parques" },
    ride: { one: "atracción", other: "atracciones" },
    riddenRide: { one: "crédito", other: "créditos" },
    mission: { one: "misión", other: "misiones" },
    badge: { one: "insignia", other: "insignias" },
    liveRide: { one: "atracción en directo", other: "atracciones en directo" },
    visibleRide: { one: "atracción visible", other: "atracciones visibles" },
    challenge: { one: "reto", other: "retos" }
  }
};

export const formatCountLabel = (locale: Locale, count: number, kind: CountKind) => {
  const words = countWordsByLocale[locale][kind];

  return `${count} ${count === 1 ? words.one : words.other}`;
};

export const formatDateLabel = (locale: Locale, value: string) =>
  new Date(value).toLocaleDateString(locale === "es" ? "es-ES" : "en-US");

export const formatTimeLabel = (locale: Locale, value?: string) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleTimeString(locale === "es" ? "es-ES" : "en-US", {
    hour: "2-digit",
    minute: "2-digit"
  });
};

export const formatStatusLabel = (locale: Locale, status: ParkStatus | RideStatus) => {
  const labels: Record<Locale, Record<ParkStatus | RideStatus, string>> = {
    en: {
      operating: "Operating",
      closed: "Closed",
      planned: "Announced"
    },
    es: {
      operating: "Operativo",
      closed: "Cerrado",
      planned: "Anunciado"
    }
  };

  return labels[locale][status];
};

export const formatLiveWaitLabel = (locale: Locale, ride: ParkLiveWait) => {
  if (ride.isOpen === false) {
    return locale === "es" ? "Cerrada" : "Closed";
  }

  if (typeof ride.waitTimeMinutes === "number") {
    return locale === "es" ? `${ride.waitTimeMinutes} min` : `${ride.waitTimeMinutes} min`;
  }

  if (ride.isOpen === true) {
    return locale === "es" ? "Abierta" : "Open";
  }

  return locale === "es" ? "Sin actualización" : "No update";
};

export const formatWaitStateLabel = (
  locale: Locale,
  isOpen?: boolean
) => {
  if (isOpen === false) {
    return locale === "es" ? "Cerrada" : "Closed";
  }

  if (isOpen === true) {
    return locale === "es" ? "Abierta" : "Open";
  }

  return locale === "es" ? "Sin estado" : "Unknown";
};

export const translateCue = (locale: Locale, cue: DiscoveryCue) => {
  const cues: Record<Locale, Record<DiscoveryCue, string>> = {
    en: {
      Featured: "Featured",
      Headliner: "Headliner",
      Iconic: "Iconic",
      Standout: "Standout"
    },
    es: {
      Featured: "Destacado",
      Headliner: "Headliner",
      Iconic: "Icónica",
      Standout: "Muy recomendable"
    }
  };

  return cues[locale][cue];
};

export const queueTimesAttribution = {
  en: "Powered by Queue-Times.com",
  es: "Datos de Queue-Times.com"
} as const;

export const messages = {
  en: {
    nav: {
      home: "Home",
      menu: "Menu",
      parks: "Parks",
      rides: "Rides",
      discover: "Discover",
      profile: "Profile",
      signIn: "Sign in",
      signOut: "Sign out",
      journal: "Journal",
      language: "Language"
    },
    home: {
      heroTitle: "Track every coaster day with less noise.",
      heroText:
        "Find parks worth the trip, log ridden coasters, follow your progress, and use live Queue-Times where coverage is available.",
      browseParks: "Explore parks",
      startTracking: "Start tracking",
      openProfile: "Open profile",
      valueTrackTitle: "Track credits",
      valueTrackBody: "Save ridden coasters and park-by-park completion.",
      valueDiscoverTitle: "Find the next ride",
      valueDiscoverBody: "Use curated park and ride paths instead of a flat catalog.",
      valueLiveTitle: "Check live waits",
      valueLiveBody: "See Queue-Times links where parks and rides are mapped.",
      valueProfileTitle: "Share your profile",
      valueProfileBody: "Build a public coaster profile from real progress.",
      parksStat: "Parks",
      riddenStat: "Coasters tracked",
      featuredLabel: "Where to ride",
      featuredTitle: "Parks with a reason to open next.",
      progressLabel: "Your coaster history",
      progressTitle: "Progress that turns ride days into a profile.",
      progressSummary:
        "Review your saved credits, strongest park progress, profile progression, and daily challenge in one place.",
      seeProgress: "Open Discover",
      collectionsLabel: "Ride paths",
      collectionsTitle: "Curated ways to choose the next park or coaster.",
      communityLabel: "Community",
      communityTitle: "Public profiles with real ride progress.",
      seeMore: "See more",
      noPublicActivity: "Public profile activity will appear once riders start sharing progress.",
      journalLabel: "Journal",
      journalTitle: "Guides, rankings, and park news.",
      readJournal: "Read journal",
      featuredPark: "Featured for your next trip",
      spotlightEmpty: "Featured parks will appear here as the catalog grows.",
      signInValueTitle: "Why sign in?",
      signInValueBody:
        "Signing in saves your ridden coasters, park completion, daily challenge progress, and public profile."
    },
    discover: {
      label: "Discover",
      title: "Choose what to ride next.",
      intro:
        "Use your progress, curated collections, community activity, and mapped live-wait coverage to decide where to spend the next coaster day.",
      rideProgress: "Your progress map",
      browseParks: "Explore parks",
      browseRides: "Explore rides",
      collectionsLabel: "Curated discovery",
      collectionsTitle: "Start with a route, not a blank catalog.",
      collectionsSummary: "Open a focused set of parks or rides built around trip planning, standout launches, and headline lineups.",
      rankedLabel: "Rider signals",
      rankedTitle: "See who is active and what profiles are building.",
      rankingsEmpty: "Community rankings will appear once riders share more progress.",
      rankingsLoading: "Loading rankings...",
      rankingsError: "Unable to load rankings.",
      featuredLabel: "Next park ideas",
      featuredTitle: "Parks that pair well with your progress.",
      featuredSummary: "Open a park to review its lineup, track credits, and check Queue-Times support where available.",
      communityLabel: "Community",
      communityTitle: "Recent credits and public coaster profiles.",
      communityEmpty: "Recent ride activity will appear once riders start sharing public profiles.",
      signedOutTitle: "Turn discovery into your own coaster profile.",
      signedOutBody:
        "Sign in to save ridden coasters, follow park completion, keep daily progress, and share a public profile."
    },
    rankings: {
      label: "Ranking",
      highestLevelTitle: "Highest level",
      highestLevelSummary: "Riders stacking the most XP so far.",
      longestStreakTitle: "Longest streak",
      longestStreakSummary: "Riders keeping the daily loop alive.",
      recentTitle: "Recently active",
      recentSummary: "Fresh credits and profile momentum.",
      levelValue: (level: number, xp: number) => `Level ${level} / ${xp} XP`,
      streakValue: (days: number) => `${days} day streak`,
      recentValue: (rideName: string, parkName: string) => `${rideName} / ${parkName}`
    },
    profile: {
      title: "Your profile",
      publicTitle: "Public profile",
      viewPublicPage: "View public page",
      copyLink: "Copy link",
      ridesLabel: "Ridden rides",
      parksLabel: "Parks ridden",
      progressionLabel: "Profile progression",
      recentActivityLabel: "Recent activity",
      latestCredits: "Latest credits",
      noRecentCredits: "Recent ride credits will appear here.",
      openRide: "Open ride",
      signInTitle: "Sign in to track your rides.",
      signInBody: "Use Google to save credits, missions, and profile progress.",
      emptyStateLabel: "First credit",
      emptyStateTitle: "Log your first coaster.",
      emptyStateBody:
        "Open a ride, mark it ridden, and Coasterly will update your progress and start filling this profile.",
      emptyStateValueCredits: "Save the credit",
      emptyStateValueParks: "Update park progress",
      emptyStateValuePublic: "Build your public profile",
      emptyStateBrowseParks: "Browse parks with coasters",
      emptyStateBrowseRides: "Browse rides to log one",
      publicEmptyTitle: "No rides logged yet.",
      publicEmptyBody: "This profile will start to fill out once rides are logged.",
      level: (level: number) => `Level ${level}`,
      xp: (xp: number) => `${xp} XP`,
      streak: (days: number) => `${days} day streak`,
      completedChallenges: (count: number) => `${count} challenges played`
    },
    progression: {
      activeMissions: "Active missions",
      recentBadges: "Recent badges",
      earnedOn: (date: string) => `Earned ${date}`,
      loadingMissions: "Loading missions...",
      unableLoadMissions: "Unable to load missions.",
      emptyBadges: "Badges will appear as you log more rides."
    },
    community: {
      featuredParkProgress: (percent: number, parkName: string) => `${percent}% at ${parkName}`,
      noRecentActivity: "No recent ride activity yet.",
      loadingActivity: "Loading community activity...",
      unableLoadActivity: "Unable to load community activity."
    },
    daily: {
      today: "Today",
      title: "Daily challenge",
      openRide: "Open ride",
      level: (level: number) => `Level ${level}`,
      xp: (xp: number) => `${xp} XP`,
      streak: (days: number) => `${days} day streak`,
      claiming: "Claiming...",
      claimXp: (xp: number) => `Claim ${xp} XP`,
      claimedXp: (xp?: number) => `Reward claimed${xp ? ` / ${xp} XP` : ""}`,
      correct: (xp: number) => `Correct. +${xp} XP from the challenge.`,
      locked: (xp: number) => `Answer locked. +${xp} XP from the challenge.`,
      idle: "Answer once today, then claim the reward.",
      rewardAvailable: (xp: number) => `Daily reward available: ${xp} XP.`,
      rewardClaimed: (date?: string) => `Daily reward claimed${date ? ` on ${date}` : ""}.`,
      completed: (count: number) => `${count} challenges completed.`,
      loading: "Loading daily challenge...",
      error: "Unable to load the daily challenge."
    },
    collections: {
      viewingNow: "Viewing now",
      insideCollection: (count: string) => `${count} inside this collection`
    },
    browse: {
      browse: "Browse",
      parksTitle: "Parks",
      ridesTitle: "Rides",
      searchParks: "Search parks",
      searchRides: "Search rides",
      parkPlaceholder: "Park name, country, or city",
      ridePlaceholder: "Ride name",
      clear: "Clear",
      clearFilters: "Clear filters",
      clearCollection: "Clear collection",
      rideType: "Category",
      manufacturer: "Builder",
      sortBy: "Sort by",
      allRideTypes: "All categories",
      allManufacturers: "All builders",
      allParks: "All parks",
      name: "Name",
      openingYear: "Opening year",
      topSpeed: "Top speed",
      loadingResults: "Loading results",
      results: (count: number) => `${count} results`,
      showing: (start: number, end: number, total: number) => `${start}-${end} of ${total}`,
      searchChip: (query: string) => `"${query}"`,
      noParksForCollection: "No parks match this collection yet.",
      noParksForSearch: "No parks match this search yet.",
      noRidesForCollection: "No rides match this collection yet.",
      noRidesForView: "No rides match this view yet.",
      broadenRideSearch: "Try a broader ride name or clear one of the current filters.",
      loadingParks: "Loading parks...",
      loadingRides: "Loading rides...",
      previousPage: "Previous",
      nextPage: "Next",
      page: (current: number, total: number) => `Page ${current} of ${total}`,
      unableLoadParks: "Unable to load parks.",
      unableLoadRides: "Unable to load rides.",
      tryAgain: "Try again"
    },
    route: {
      parksBrowse: "Parks browse",
      ridesBrowse: "Rides browse",
      discovery: "Discovery",
      profile: "Profile",
      publicProfile: "Public profile",
      journal: "Journal",
      parkDetail: "Park detail",
      rideDetail: "Ride detail",
      landing: "Landing",
      search: (query: string) => `Search: "${query}"`,
      allParks: "All parks",
      allRides: "All rides",
      browse: "Browse",
      comingSoon: "Editorial",
      parkResults: "Catalog",
      statsUnavailable: "Stats unavailable"
    },
    journal: {
      title: "Rankings, guides, and park news",
      browseParks: "Browse parks"
    },
    park: {
      backToParks: "Back to parks",
      loading: "Loading park details...",
      label: "Park",
      progressLabel: "Your progress",
      completion: "Completion",
      riddenOutOf: (ridden: number, total: number) => `${ridden} of ${total} rides ridden`,
      city: "City",
      country: "Country",
      status: "Status",
      queueTimes: "Queue-Times",
      notMapped: "Not mapped",
      liveRideCount: (count: number) => formatCountLabel("en", count, "liveRide"),
      loadingLiveWaits: "Loading live waits...",
      liveWaitsUnavailable: "Live waits unavailable right now.",
      noLiveRideUpdates: "No live ride updates right now.",
      parkNotLinked: "This park is not linked to Queue-Times yet.",
      rideLineup: "Ride lineup",
      visibleRides: (count: number) => formatCountLabel("en", count, "visibleRide"),
      noRidesForFilters: "No rides match the current filters.",
      noRidesAvailable: "No rides available yet.",
      clearOneFilter: "Try clearing one filter or switching the sort order.",
      noSeededRides: "No rides are available for this park yet.",
      loadingRides: "Loading rides...",
      unableLoadRides: "Unable to load rides.",
      unableLoadPark: "Unable to load this park."
    },
    ride: {
      backToRides: "Back to rides",
      backToLineup: "Back to lineup",
      loading: "Loading ride details...",
      label: "Ride",
      rideLog: "Ride log",
      saved: "This ride is saved on your profile and counted in your progress.",
      savePrompt: "Add this ride to your profile and update your park progress.",
      checking: "Checking your ride log.",
      saving: "Saving...",
      markRidden: "Mark ridden",
      removeRide: "Remove ride",
      signInToTrack: "Sign in to save this ride to your profile and keep progress in sync.",
      creditSignedOutTitle: "Save this ride to your profile",
      creditReadyTitle: "Ready to log this credit?",
      creditRiddenTitle: "Already in your ride log",
      creditSavingTitle: "Updating your ride log",
      creditSuccessTitle: "Ride log updated",
      creditSavingBody: "Saving this change to your profile.",
      creditUnavailable: "Your ride log is unavailable right now.",
      creditSavedSuccess: "Saved. Profile and progress updated.",
      creditRemovedSuccess: "Removed. Profile and progress updated.",
      queueTimes: "Queue-Times",
      loadingWait: "Loading current wait.",
      currentWaitUnavailable: "Live wait unavailable right now.",
      noLiveUpdate: "No live wait update right now.",
      rideNotLinked: "No live wait link yet.",
      rideOrder: "Ride order",
      loadingRideOrder: "Loading ride order.",
      rideOrderUnavailable: "Ride order unavailable.",
      previousRide: "Previous ride",
      nextRide: "Next ride",
      rideFacts: "Ride facts",
      parentPark: "Parent park",
      rideType: "Ride type",
      manufacturer: "Manufacturer",
      model: "Model",
      openingYear: "Opening year",
      height: "Height",
      topSpeed: "Top speed",
      inversions: "Inversions",
      unableLoadRide: "Unable to load this ride."
    },
    common: {
      source: "Source",
      serviceIssue: "Service issue",
      signIn: "Sign in",
      noUpdate: "No update",
      open: "Open",
      closed: "Closed",
      unknown: "Unknown",
      updatedAt: (time: string) => `Updated ${time}`,
      currentStatus: "Current status from Queue-Times.",
      parkWaits: "Park waits",
      parkStats: "Park stats",
      rideStats: "Ride stats",
      copiedPublicProfile: "Public profile link copied."
    }
  },
  es: {
    nav: {
      home: "Inicio",
      menu: "Menú",
      parks: "Parques",
      rides: "Atracciones",
      discover: "Descubrir",
      profile: "Perfil",
      signIn: "Iniciar sesi\u00f3n",
      signOut: "Cerrar sesi\u00f3n",
      journal: "Revista",
      language: "Idioma"
    },
    home: {
      heroTitle: "Sigue cada día coaster con menos ruido.",
      heroText:
        "Encuentra parques que merecen el viaje, guarda montañas rusas montadas, sigue tu progreso y usa Queue-Times en directo donde haya cobertura.",
      browseParks: "Explorar parques",
      startTracking: "Empezar a seguir",
      openProfile: "Abrir perfil",
      valueTrackTitle: "Registra créditos",
      valueTrackBody: "Guarda montañas rusas montadas y avance parque por parque.",
      valueDiscoverTitle: "Encuentra la próxima",
      valueDiscoverBody: "Usa rutas curadas de parques y rides en vez de un catálogo plano.",
      valueLiveTitle: "Consulta esperas",
      valueLiveBody: "Accede a Queue-Times donde parques y rides estén mapeados.",
      valueProfileTitle: "Comparte tu perfil",
      valueProfileBody: "Construye un perfil coaster público desde progreso real.",
      parksStat: "Parques",
      riddenStat: "Coasters seguidas",
      featuredLabel: "Dónde montar",
      featuredTitle: "Parques con una razón para abrir ahora.",
      progressLabel: "Tu historial coaster",
      progressTitle: "Progreso que convierte tus días de parque en un perfil.",
      progressSummary:
        "Revisa tus créditos guardados, mejor avance por parque, progresión del perfil y reto diario en un solo lugar.",
      seeProgress: "Abrir Descubrir",
      collectionsLabel: "Rutas coaster",
      collectionsTitle: "Formas curadas de elegir el siguiente parque o coaster.",
      communityLabel: "Comunidad",
      communityTitle: "Perfiles públicos con progreso real.",
      seeMore: "Ver más",
      noPublicActivity: "La actividad pública aparecerá cuando más riders compartan su progreso.",
      journalLabel: "Revista",
      journalTitle: "Guías, rankings y noticias de parques.",
      readJournal: "Leer revista",
      featuredPark: "Destacado para tu próximo viaje",
      spotlightEmpty: "Los parques destacados aparecerán aquí a medida que crezca el catálogo.",
      signInValueTitle: "¿Por qué iniciar sesión?",
      signInValueBody:
        "Iniciar sesión guarda tus coasters montadas, avance por parque, retos diarios y perfil público."
    },
    discover: {
      label: "Descubrir",
      title: "Elige qué montar después.",
      intro:
        "Usa tu progreso, colecciones curadas, actividad de la comunidad y cobertura de esperas en directo para decidir el próximo día coaster.",
      rideProgress: "Mapa de tu progreso",
      browseParks: "Explorar parques",
      browseRides: "Explorar rides",
      collectionsLabel: "Descubrimiento curado",
      collectionsTitle: "Empieza con una ruta, no con un catálogo vacío.",
      collectionsSummary: "Abre una selección enfocada de parques o rides pensada para planificar viajes, launches destacadas y grandes lineups.",
      rankedLabel: "Señales de riders",
      rankedTitle: "Mira quién está activo y qué perfiles se están construyendo.",
      rankingsEmpty: "Los rankings aparecerán cuando más riders compartan progreso.",
      rankingsLoading: "Cargando rankings...",
      rankingsError: "No se pueden cargar los rankings.",
      featuredLabel: "Ideas para el próximo parque",
      featuredTitle: "Parques que encajan con tu progreso.",
      featuredSummary: "Abre un parque para revisar su lineup, guardar créditos y comprobar soporte de Queue-Times donde esté disponible.",
      communityLabel: "Comunidad",
      communityTitle: "Créditos recientes y perfiles coaster públicos.",
      communityEmpty: "La actividad reciente aparecerá cuando riders compartan perfiles públicos.",
      signedOutTitle: "Convierte el descubrimiento en tu propio perfil coaster.",
      signedOutBody:
        "Inicia sesión para guardar coasters montadas, seguir avance por parque, mantener progreso diario y compartir un perfil público."
    },
    rankings: {
      label: "Ranking",
      highestLevelTitle: "Nivel más alto",
      highestLevelSummary: "Usuarios que acumulan más XP hasta ahora.",
      longestStreakTitle: "Racha más larga",
      longestStreakSummary: "Usuarios que mantienen vivo el bucle diario.",
      recentTitle: "Más recientes",
      recentSummary: "Créditos frescos y movimiento de perfil.",
      levelValue: (level: number, xp: number) => `Nivel ${level} / ${xp} XP`,
      streakValue: (days: number) => `${days} días de racha`,
      recentValue: (rideName: string, parkName: string) => `${rideName} / ${parkName}`
    },
    profile: {
      title: "Tu perfil",
      publicTitle: "Perfil público",
      viewPublicPage: "Ver perfil público",
      copyLink: "Copiar enlace",
      ridesLabel: "Créditos",
      parksLabel: "Parques montados",
      progressionLabel: "Progresión",
      recentActivityLabel: "Actividad reciente",
      latestCredits: "Últimos créditos",
      noRecentCredits: "Los créditos recientes aparecerán aquí.",
      openRide: "Abrir atracción",
      signInTitle: "Inicia sesión para registrar tus atracciones.",
      signInBody: "Usa Google para guardar créditos, misiones y progreso del perfil.",
      emptyStateLabel: "Primer crédito",
      emptyStateTitle: "Registra tu primera coaster.",
      emptyStateBody:
        "Abre una atracción, márcala como montada y Coasterly actualizará tu progreso y empezará a llenar este perfil.",
      emptyStateValueCredits: "Guardar el crédito",
      emptyStateValueParks: "Actualizar progreso del parque",
      emptyStateValuePublic: "Construir tu perfil público",
      emptyStateBrowseParks: "Ver parques con coasters",
      emptyStateBrowseRides: "Ver atracciones para registrar una",
      publicEmptyTitle: "Todavía no hay atracciones registradas.",
      publicEmptyBody: "Este perfil empezará a llenarse cuando se registren atracciones.",
      level: (level: number) => `Nivel ${level}`,
      xp: (xp: number) => `${xp} XP`,
      streak: (days: number) => `${days} días de racha`,
      completedChallenges: (count: number) => `${count} retos completados`
    },
    progression: {
      activeMissions: "Misiones activas",
      recentBadges: "Insignias recientes",
      earnedOn: (date: string) => `Conseguida el ${date}`,
      loadingMissions: "Cargando misiones...",
      unableLoadMissions: "No se pueden cargar las misiones.",
      emptyBadges: "Las insignias aparecerán al registrar más créditos."
    },
    community: {
      featuredParkProgress: (percent: number, parkName: string) => `${percent}% en ${parkName}`,
      noRecentActivity: "Todavía no hay actividad reciente.",
      loadingActivity: "Cargando actividad de la comunidad...",
      unableLoadActivity: "No se puede cargar la actividad de la comunidad."
    },
    daily: {
      today: "Hoy",
      title: "Reto diario",
      openRide: "Abrir atracción",
      level: (level: number) => `Nivel ${level}`,
      xp: (xp: number) => `${xp} XP`,
      streak: (days: number) => `${days} días de racha`,
      claiming: "Reclamando...",
      claimXp: (xp: number) => `Reclamar ${xp} XP`,
      claimedXp: (xp?: number) => `Recompensa reclamada${xp ? ` / ${xp} XP` : ""}`,
      correct: (xp: number) => `Correcto. +${xp} XP del reto.`,
      locked: (xp: number) => `Respuesta bloqueada. +${xp} XP del reto.`,
      idle: "Responde una vez hoy y luego reclama la recompensa.",
      rewardAvailable: (xp: number) => `Recompensa diaria disponible: ${xp} XP.`,
      rewardClaimed: (date?: string) => `Recompensa diaria reclamada${date ? ` el ${date}` : ""}.`,
      completed: (count: number) => `${count} retos completados.`,
      loading: "Cargando reto diario...",
      error: "No se puede cargar el reto diario."
    },
    collections: {
      viewingNow: "Viendo ahora",
      insideCollection: (count: string) => `${count} dentro de esta colección`
    },
    browse: {
      browse: "Explorar",
      parksTitle: "Parques",
      ridesTitle: "Atracciones",
      searchParks: "Buscar parques",
      searchRides: "Buscar atracciones",
      parkPlaceholder: "Nombre del parque, país o ciudad",
      ridePlaceholder: "Nombre de la atracción",
      clear: "Limpiar",
      clearFilters: "Quitar filtros",
      clearCollection: "Quitar colección",
      rideType: "Categoría",
      manufacturer: "Constructor",
      sortBy: "Ordenar por",
      allRideTypes: "Todas las categorías",
      allManufacturers: "Todos los constructores",
      allParks: "Todos los parques",
      name: "Nombre",
      openingYear: "Año de apertura",
      topSpeed: "Velocidad punta",
      loadingResults: "Cargando resultados",
      results: (count: number) => `${count} resultados`,
      showing: (start: number, end: number, total: number) => `${start}-${end} de ${total}`,
      searchChip: (query: string) => `"${query}"`,
      noParksForCollection: "Ningún parque coincide todavía con esta colección.",
      noParksForSearch: "Ningún parque coincide con esta búsqueda.",
      noRidesForCollection: "Ninguna atracción coincide todavía con esta colección.",
      noRidesForView: "Ninguna atracción coincide con esta vista.",
      broadenRideSearch: "Prueba con otro nombre o limpia alguno de los filtros.",
      loadingParks: "Cargando parques...",
      loadingRides: "Cargando atracciones...",
      previousPage: "Anterior",
      nextPage: "Siguiente",
      page: (current: number, total: number) => `Página ${current} de ${total}`,
      unableLoadParks: "No se pueden cargar los parques.",
      unableLoadRides: "No se pueden cargar las atracciones.",
      tryAgain: "Reintentar"
    },
    route: {
      parksBrowse: "Explorar parques",
      ridesBrowse: "Explorar atracciones",
      discovery: "Descubrir",
      profile: "Perfil",
      publicProfile: "Perfil público",
      journal: "Revista",
      parkDetail: "Detalle del parque",
      rideDetail: "Detalle de la atracción",
      landing: "Inicio",
      search: (query: string) => `Búsqueda: "${query}"`,
      allParks: "Todos los parques",
      allRides: "Todas las atracciones",
      browse: "Explorar",
      comingSoon: "Editorial",
      parkResults: "Catálogo",
      statsUnavailable: "Estadísticas no disponibles"
    },
    journal: {
      title: "Rankings, guías y noticias de parques",
      browseParks: "Ver parques"
    },
    park: {
      backToParks: "Volver a parques",
      loading: "Cargando detalles del parque...",
      label: "Parque",
      progressLabel: "Tu progreso",
      completion: "Completado",
      riddenOutOf: (ridden: number, total: number) => `${ridden} de ${total} montadas`,
      city: "Ciudad",
      country: "País",
      status: "Estado",
      queueTimes: "Queue-Times",
      notMapped: "Sin mapear",
      liveRideCount: (count: number) => formatCountLabel("es", count, "liveRide"),
      loadingLiveWaits: "Cargando tiempos en directo...",
      liveWaitsUnavailable: "Los tiempos en directo no están disponibles ahora mismo.",
      noLiveRideUpdates: "No hay actualizaciones en directo ahora mismo.",
      parkNotLinked: "Este parque todavía no está conectado con Queue-Times.",
      rideLineup: "Lineup de atracciones",
      visibleRides: (count: number) => formatCountLabel("es", count, "visibleRide"),
      noRidesForFilters: "Ninguna atracción coincide con los filtros actuales.",
      noRidesAvailable: "Todavía no hay atracciones disponibles.",
      clearOneFilter: "Prueba a quitar un filtro o cambiar el orden.",
      noSeededRides: "Todavía no hay atracciones disponibles para este parque.",
      loadingRides: "Cargando atracciones...",
      unableLoadRides: "No se pueden cargar las atracciones.",
      unableLoadPark: "No se puede cargar este parque."
    },
    ride: {
      backToRides: "Volver a atracciones",
      backToLineup: "Volver al lineup",
      loading: "Cargando detalles de la atracción...",
      label: "Atracción",
      rideLog: "Registro",
      saved: "Esta atracción está guardada en tu perfil y cuenta en tu progreso.",
      savePrompt: "Añade esta atracción a tu perfil y actualiza el progreso del parque.",
      checking: "Comprobando tu registro.",
      saving: "Guardando...",
      markRidden: "Marcar montada",
      removeRide: "Quitar de montadas",
      signInToTrack: "Inicia sesión para guardar esta atracción en tu perfil y mantener el progreso al día.",
      creditSignedOutTitle: "Guarda esta atracción en tu perfil",
      creditReadyTitle: "¿Lista para registrar este crédito?",
      creditRiddenTitle: "Ya está en tu registro",
      creditSavingTitle: "Actualizando tu registro",
      creditSuccessTitle: "Registro actualizado",
      creditSavingBody: "Guardando este cambio en tu perfil.",
      creditUnavailable: "Tu registro no está disponible ahora mismo.",
      creditSavedSuccess: "Guardada. Perfil y progreso actualizados.",
      creditRemovedSuccess: "Quitada. Perfil y progreso actualizados.",
      queueTimes: "Queue-Times",
      loadingWait: "Cargando espera actual.",
      currentWaitUnavailable: "Espera en directo no disponible ahora.",
      noLiveUpdate: "Sin actualización de espera ahora.",
      rideNotLinked: "Todavía no hay enlace de espera.",
      rideOrder: "Orden del lineup",
      loadingRideOrder: "Cargando orden del lineup.",
      rideOrderUnavailable: "El orden del lineup no está disponible.",
      previousRide: "Atracción anterior",
      nextRide: "Siguiente atracción",
      rideFacts: "Ficha",
      parentPark: "Parque",
      rideType: "Tipo",
      manufacturer: "Fabricante",
      model: "Modelo",
      openingYear: "Apertura",
      height: "Altura",
      topSpeed: "Velocidad punta",
      inversions: "Inversiones",
      unableLoadRide: "No se puede cargar esta atracción."
    },
    common: {
      source: "Fuente",
      serviceIssue: "Problema del servicio",
      noUpdate: "Sin actualización",
      open: "Abierta",
      closed: "Cerrada",
      unknown: "Sin estado",
      updatedAt: (time: string) => `Actualizado ${time}`,
      currentStatus: "Estado actual desde Queue-Times.",
      parkWaits: "Esperas del parque",
      parkStats: "Estadísticas del parque",
      rideStats: "Estadísticas de la atracción",
      copiedPublicProfile: "Enlace del perfil público copiado."
    }
  }
} as const;

export const journalTeasersEs = [
  {
    category: "Guía",
    title: "Notas para planificar parques",
    summary: "Contexto para planificar viajes, puntos clave del lineup y guías listas para seguir tu progreso.",
    status: "Guía"
  },
  {
    category: "Ranking",
    title: "Listas de coasters para revisitar",
    summary: "Rankings editoriales, ideas de ruta y comparativas parque por parque.",
    status: "Ranking"
  },
  {
    category: "Noticias",
    title: "Lanzamientos, retracks y grandes aperturas",
    summary: "Actualizaciones de parques, aperturas importantes y cambios de lineup que merece la pena seguir.",
    status: "Noticias"
  }
] as const;

export const parkEditorialBySlugEs: Record<string, { summary: string; cues: DiscoveryCue[] }> = {
  "europa-park": {
    summary:
      "Un resort a gran escala con áreas temáticas muy pulidas y uno de los lineups más profundos de Europa.",
    cues: ["Featured", "Standout"]
  },
  phantasialand: {
    summary:
      "Tematización densa y coasters pegadas al terreno hacen de este uno de los mejores días de parque de Europa.",
    cues: ["Headliner", "Standout"]
  },
  "alton-towers": {
    summary:
      "Un clásico británico donde grandes coasters cruzan jardines, ruinas y un entorno con mucha atmósfera.",
    cues: ["Iconic"]
  },
  "disneyland-park": {
    summary:
      "Un parque de castillo construido sobre storytelling pulido, gran atractivo general y varios anclajes muy reconocibles.",
    cues: ["Featured", "Iconic"]
  },
  "parc-asterix": {
    summary:
      "Un parque francés orientado al thrill con un lineup en clara subida y una fuerte identidad de acero.",
    cues: ["Standout"]
  },
  efteling: {
    summary:
      "Ambiente de fantasía, dark rides y un lineup selectivo de coasters que cambia el ritmo del viaje.",
    cues: ["Iconic"]
  },
  "walibi-holland": {
    summary:
      "Compacto y centrado en las atracciones, con un lineup moderno que rinde por encima de su tamaño.",
    cues: ["Standout"]
  },
  "portaventura-park": {
    summary:
      "Un gran parque de destino conocido por su skyline, su capacidad y su atractivo de resort.",
    cues: ["Headliner"]
  },
  gardaland: {
    summary:
      "El parque más conocido de Italia, mezclando tirón familiar con varios headliners fiables.",
    cues: ["Featured"]
  },
  energylandia: {
    summary:
      "Un parque en expansión rápida, muy cargado de coasters y con mucho atractivo para sumar créditos.",
    cues: ["Headliner", "Standout"]
  },
  liseberg: {
    summary:
      "Un city park con mucha energía, gran ambiente y una mezcla de coasters mejor de lo que aparenta.",
    cues: ["Iconic", "Standout"]
  }
};

export const rideEditorialBySlugEs: Record<string, { summary: string; cues: DiscoveryCue[] }> = {
  "silver-star": {
    summary:
      "Una hyper abierta y muy rápida con airtime sostenido y una de las caídas más grandes de Europa.",
    cues: ["Headliner", "Iconic"]
  },
  "voltron-nevera": {
    summary:
      "Una launch moderna y densa, construida alrededor de ritmo alto, inversiones y transiciones muy agresivas.",
    cues: ["Featured", "Standout"]
  },
  taron: {
    summary:
      "Launches pegadas al terreno y cambios constantes de dirección que la convierten en referencia europea moderna.",
    cues: ["Iconic", "Standout"]
  },
  fly: {
    summary:
      "Una flying coaster muy tematizada, diseñada para sentirse inmersiva más que expuesta.",
    cues: ["Featured"]
  },
  "nemesis-reborn": {
    summary:
      "Un layout invertido icónico reconstruido alrededor de uno de los nombres más reconocibles de Europa.",
    cues: ["Iconic"]
  },
  "wicker-man": {
    summary:
      "Una wooden muy de personaje, con intensidad accesible y una identidad visual memorable.",
    cues: ["Standout"]
  },
  "big-thunder-mountain": {
    summary:
      "Un mine train clásico construido alrededor de la escenografía, el ritmo y la capacidad de repetir.",
    cues: ["Iconic"]
  },
  "star-wars-hyperspace-mountain": {
    summary:
      "Una compacta indoor intensa que suma espectáculo Disney a un layout ya muy nervioso.",
    cues: ["Featured"]
  },
  toutatis: {
    summary:
      "Una Intamin reciente pensada para dar velocidad, hangtime y mucho ritmo desde el primer launch.",
    cues: ["Headliner"]
  },
  oziris: {
    summary:
      "Una B&M invert muy fluida, con interacciones fuertes, buen pacing y gran capacidad de re-ride.",
    cues: ["Standout"]
  },
  "baron-1898": {
    summary:
      "Una dive compacta centrada en una gran caída y envuelta en una historia muy Efteling.",
    cues: ["Featured"]
  },
  "joris-en-de-draak": {
    summary:
      "Una wooden de doble vía que añade energía de carrera a una de las zonas más vivas de Efteling.",
    cues: ["Iconic"]
  },
  untamed: {
    summary:
      "Una RMC hybrid conocida por airtime rápido y un perfil de ritmo muy agresivo.",
    cues: ["Headliner"]
  },
  goliath: {
    summary:
      "Una Intamin mega clásica construida sobre velocidad sostenida y airtime al aire libre.",
    cues: ["Iconic"]
  },
  shambhala: {
    summary:
      "Una hyper enorme con gran escala, airtime flotante y uno de los skylines más reconocibles de Europa.",
    cues: ["Headliner", "Iconic"]
  },
  "dragon-khan": {
    summary:
      "Una máquina de inversiones clásica que todavía define el skyline y la identidad de PortAventura.",
    cues: ["Iconic"]
  },
  raptor: {
    summary:
      "Una wing compacta que gana fuerza gracias a su ritmo apretado y las interacciones cercanas.",
    cues: ["Standout"]
  },
  "oblivion-the-black-hole": {
    summary:
      "Una dive centrada en una única secuencia de pausa y caída más que en un layout largo.",
    cues: ["Featured"]
  },
  hyperion: {
    summary:
      "Una hyper gigante conocida por la escala, el ritmo y una de las velocidades punta más altas de la región.",
    cues: ["Headliner"]
  },
  zadra: {
    summary:
      "Una hybrid de gran tamaño que mezcla escala enorme con la intensidad rápida típica de RMC.",
    cues: ["Headliner", "Standout"]
  },
  helix: {
    summary:
      "Una launch pensada para la variedad, combinando launches, inversiones y el terreno de la ladera.",
    cues: ["Standout"]
  },
  balder: {
    summary:
      "Una wooden que sigue vigente gracias a su pacing limpio, buen airtime y re-rides muy fáciles.",
    cues: ["Iconic"]
  }
};

export const curatedCollectionsEs = [
  {
    id: "first-time-europe-parks",
    title: "Parques para un primer viaje por Europa",
    summary:
      "Buenas primeras elecciones con coasters reconocibles, gran ambiente y ritmo de parque de día completo.",
    kind: "park",
    badge: "Parques",
    itemSlugs: ["europa-park", "phantasialand", "portaventura-park", "efteling"]
  },
  {
    id: "parks-with-strong-lineups",
    title: "Parques con lineups potentes",
    summary:
      "Mucho fondo de coasters para días en los que importa más el lineup que una sola headliner.",
    kind: "park",
    badge: "Parques",
    itemSlugs: ["europa-park", "energylandia", "walibi-holland", "phantasialand"]
  },
  {
    id: "best-launches",
    title: "Las mejores launches",
    summary:
      "Aceleración, interacción con el terreno y layouts pensados para quienes persiguen el ritmo.",
    kind: "ride",
    badge: "Atracciones",
    itemSlugs: ["taron", "voltron-nevera", "toutatis", "helix"]
  },
  {
    id: "iconic-hypers",
    title: "Hypers icónicas",
    summary:
      "Headliners de gran airtime que definen skylines y siguen anclando viajes coaster por Europa.",
    kind: "ride",
    badge: "Atracciones",
    itemSlugs: ["silver-star", "shambhala", "hyperion"]
  },
  {
    id: "standout-inverts-and-flyers",
    title: "Inverts y flyers destacadas",
    summary:
      "Layouts suspendidos donde importan tanto la interacción y la presentación como las cifras.",
    kind: "ride",
    badge: "Atracciones",
    itemSlugs: ["fly", "nemesis-reborn", "oziris", "raptor"]
  }
] as const;
