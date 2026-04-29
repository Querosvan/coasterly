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
      planned: "Planned"
    },
    es: {
      operating: "Operativo",
      closed: "Cerrado",
      planned: "Planificado"
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
      journal: "Journal",
      language: "Language"
    },
    home: {
      heroTitle: "A park catalog built for coaster people.",
      heroText:
        "Browse standout parks, track what you've ridden, and move through each lineup with less noise.",
      browseParks: "Browse parks",
      openProfile: "Open profile",
      parksStat: "Parks",
      riddenStat: "Rides logged",
      featuredLabel: "Featured parks",
      featuredTitle: "Parks worth opening next.",
      progressLabel: "Progress",
      progressTitle: "Keep your collection in view.",
      seeProgress: "See progress",
      collectionsLabel: "Collections",
      collectionsTitle: "Curated ways into the catalog.",
      communityLabel: "Community",
      communityTitle: "Recent rider profiles.",
      seeMore: "See more",
      noPublicActivity: "No public activity yet.",
      journalLabel: "Journal",
      journalTitle: "Guides, rankings, and park news.",
      readJournal: "Read journal",
      featuredPark: "Featured park",
      spotlightEmpty: "Featured parks will appear here shortly."
    },
    discover: {
      label: "Discover",
      title: "Pick the next park worth opening.",
      rideProgress: "Ride progress",
      browseParks: "Browse parks",
      collectionsLabel: "Collections",
      collectionsTitle: "Browse by collection.",
      rankedLabel: "Ranked now",
      rankedTitle: "A quicker read on active riders.",
      rankingsEmpty: "No rankings yet.",
      rankingsLoading: "Loading rankings...",
      rankingsError: "Unable to load rankings.",
      featuredLabel: "Featured now",
      featuredTitle: "Highlighted parks.",
      communityLabel: "Community",
      communityTitle: "Recent rider activity."
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
      rideType: "Ride type",
      manufacturer: "Manufacturer",
      sortBy: "Sort by",
      allRideTypes: "All ride types",
      allManufacturers: "All manufacturers",
      allParks: "All parks",
      name: "Name",
      openingYear: "Opening year",
      topSpeed: "Top speed",
      loadingResults: "Loading results",
      results: (count: number) => `${count} results`,
      searchChip: (query: string) => `"${query}"`,
      noParksForCollection: "No parks match this collection yet.",
      noParksForSearch: "No parks match this search yet.",
      noRidesForCollection: "No rides match this collection yet.",
      noRidesForView: "No rides match this view yet.",
      broadenRideSearch: "Try a broader ride name or clear one of the current filters.",
      loadingParks: "Loading parks...",
      loadingRides: "Loading rides...",
      loadMore: "Load more",
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
      comingSoon: "Coming soon",
      parkResults: "Catalog",
      statsUnavailable: "Stats unavailable"
    },
    journal: {
      title: "Rankings, guides, and park news will live here.",
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
      noSeededRides: "This park has no seeded rides in the current catalog.",
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
      saved: "Saved to your ridden list.",
      savePrompt: "Save this ride to your ridden list.",
      checking: "Checking ride status.",
      saving: "Saving...",
      markRidden: "Mark ridden",
      removeRide: "Remove ride",
      queueTimes: "Queue-Times",
      loadingWait: "Loading current wait.",
      currentWaitUnavailable: "Current wait unavailable right now.",
      noLiveUpdate: "No live Queue-Times update is available for this ride.",
      rideNotLinked: "This ride is not linked to Queue-Times yet.",
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
      journal: "Revista",
      language: "Idioma"
    },
    home: {
      heroTitle: "El catálogo de parques para gente de montañas rusas.",
      heroText:
        "Explora parques destacados, guarda lo que ya has montado y recorre cada lineup con menos ruido.",
      browseParks: "Ver parques",
      openProfile: "Abrir perfil",
      parksStat: "Parques",
      riddenStat: "Créditos",
      featuredLabel: "Parques destacados",
      featuredTitle: "Parques que merece la pena abrir ahora.",
      progressLabel: "Progreso",
      progressTitle: "Mantén tu colección a la vista.",
      seeProgress: "Ver progreso",
      collectionsLabel: "Colecciones",
      collectionsTitle: "Formas curadas de entrar al catálogo.",
      communityLabel: "Comunidad",
      communityTitle: "Perfiles con actividad reciente.",
      seeMore: "Ver más",
      noPublicActivity: "Todavía no hay actividad pública.",
      journalLabel: "Revista",
      journalTitle: "Guías, rankings y noticias de parques.",
      readJournal: "Leer revista",
      featuredPark: "Parque destacado",
      spotlightEmpty: "Los parques destacados aparecerán aquí en breve."
    },
    discover: {
      label: "Descubrir",
      title: "Elige el siguiente parque que merece la pena abrir.",
      rideProgress: "Progreso de créditos",
      browseParks: "Ver parques",
      collectionsLabel: "Colecciones",
      collectionsTitle: "Explora por colección.",
      rankedLabel: "Ahora mismo",
      rankedTitle: "Una lectura rápida de la actividad de la comunidad.",
      rankingsEmpty: "Todavía no hay rankings.",
      rankingsLoading: "Cargando rankings...",
      rankingsError: "No se pueden cargar los rankings.",
      featuredLabel: "Destacados",
      featuredTitle: "Parques destacados.",
      communityLabel: "Comunidad",
      communityTitle: "Actividad reciente."
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
      rideType: "Tipo de atracción",
      manufacturer: "Fabricante",
      sortBy: "Ordenar por",
      allRideTypes: "Todos los tipos",
      allManufacturers: "Todos los fabricantes",
      allParks: "Todos los parques",
      name: "Nombre",
      openingYear: "Año de apertura",
      topSpeed: "Velocidad punta",
      loadingResults: "Cargando resultados",
      results: (count: number) => `${count} resultados`,
      searchChip: (query: string) => `"${query}"`,
      noParksForCollection: "Ningún parque coincide todavía con esta colección.",
      noParksForSearch: "Ningún parque coincide con esta búsqueda.",
      noRidesForCollection: "Ninguna atracción coincide todavía con esta colección.",
      noRidesForView: "Ninguna atracción coincide con esta vista.",
      broadenRideSearch: "Prueba con otro nombre o limpia alguno de los filtros.",
      loadingParks: "Cargando parques...",
      loadingRides: "Cargando atracciones...",
      loadMore: "Cargar más",
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
      comingSoon: "Próximamente",
      parkResults: "Catálogo",
      statsUnavailable: "Estadísticas no disponibles"
    },
    journal: {
      title: "Aquí vivirán rankings, guías y noticias de parques.",
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
      noSeededRides: "Este parque no tiene atracciones sembradas en el catálogo actual.",
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
      saved: "Guardada en tu lista de montadas.",
      savePrompt: "Guarda esta atracción en tu lista de montadas.",
      checking: "Comprobando estado.",
      saving: "Guardando...",
      markRidden: "Marcar montada",
      removeRide: "Quitar de montadas",
      queueTimes: "Queue-Times",
      loadingWait: "Cargando espera actual.",
      currentWaitUnavailable: "La espera actual no está disponible ahora mismo.",
      noLiveUpdate: "No hay actualización en directo de Queue-Times para esta atracción.",
      rideNotLinked: "Esta atracción todavía no está conectada con Queue-Times.",
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
    summary: "Planificación de viajes, contexto del lineup y guías listas para seguir tu progreso.",
    status: "Planificado"
  },
  {
    category: "Ranking",
    title: "Listas de coasters para revisitar",
    summary: "Rankings editoriales, ideas de ruta y comparativas parque por parque.",
    status: "Planificado"
  },
  {
    category: "Noticias",
    title: "Lanzamientos, retracks y grandes aperturas",
    summary: "Un futuro hogar para noticias de parques cuando exista la capa editorial.",
    status: "Planificado"
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
