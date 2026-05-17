import type { MediaKind } from "./types";

export const brandLogoDark = "/brand/coasterly-logo-horizontal-dark.png";
export const brandIconDark = "/brand/coasterly-logo-icon-dark.png";

const placeholderImageHost = "placehold.co";

export const isPlaceholderImageUrl = (value?: string) =>
  value?.includes(placeholderImageHost) ?? false;

const getLocalMediaPath = (kind: MediaKind, slug: string) =>
  kind === "park"
    ? `/media/parks/${slug}/cover.png`
    : `/media/rides/${slug}/cover.png`;

export const getMediaSources = (kind: MediaKind, slug: string, imageUrl?: string) => {
  const localMediaPath = getLocalMediaPath(kind, slug);

  if (imageUrl && !isPlaceholderImageUrl(imageUrl)) {
    return [imageUrl, localMediaPath];
  }

  if (imageUrl) {
    return [localMediaPath, imageUrl];
  }

  return [localMediaPath];
};
