import type { MediaKind } from "./types";

export const brandLogoDark = "/brand/coasterly-logo-horizontal-dark.png";
export const brandIconDark = "/brand/coasterly-logo-icon-dark.png";

const placeholderImageHost = "placehold.co";

export const isPlaceholderImageUrl = (value?: string) =>
  value?.includes(placeholderImageHost) ?? false;

const getLocalMediaBasePath = (kind: MediaKind, slug: string) =>
  kind === "park"
    ? `/media/parks/${slug}`
    : `/media/rides/${slug}`;

const getLocalMediaPaths = (kind: MediaKind, slug: string) => {
  const basePath = getLocalMediaBasePath(kind, slug);

  return [`${basePath}/cover.webp`, `${basePath}/cover.png`];
};

export const getMediaSources = (kind: MediaKind, slug: string, imageUrl?: string) => {
  const localMediaPaths = getLocalMediaPaths(kind, slug);

  if (imageUrl && !isPlaceholderImageUrl(imageUrl)) {
    return [imageUrl, ...localMediaPaths];
  }

  if (imageUrl) {
    return [...localMediaPaths, imageUrl];
  }

  return localMediaPaths;
};
