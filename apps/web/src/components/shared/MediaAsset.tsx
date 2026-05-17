import { useEffect, useState } from "react";

import { brandIconDark, getMediaSources, isPlaceholderImageUrl } from "../../lib/assets";
import type { MediaKind } from "../../lib/types";

type MediaAssetProps = {
  kind: MediaKind;
  slug: string;
  imageUrl?: string | undefined;
  alt: string;
  frameClassName: string;
  imageClassName: string;
  loading?: "eager" | "lazy";
  onAvailabilityChange?: (hasMedia: boolean) => void;
};

export function MediaAsset({
  kind,
  slug,
  imageUrl,
  alt,
  frameClassName,
  imageClassName,
  loading = "lazy",
  onAvailabilityChange
}: MediaAssetProps) {
  const sources = getMediaSources(kind, slug, imageUrl);
  const sourceKey = sources.join("|");
  const [activeSourceIndex, setActiveSourceIndex] = useState(0);

  useEffect(() => {
    setActiveSourceIndex(0);
  }, [sourceKey]);

  const activeSource = sources[activeSourceIndex];
  const activeImageSource =
    activeSource && !isPlaceholderImageUrl(activeSource) ? activeSource : undefined;
  const hasRealMedia = Boolean(activeImageSource);

  useEffect(() => {
    onAvailabilityChange?.(hasRealMedia);
  }, [hasRealMedia, onAvailabilityChange]);

  const fallbackClassName = hasRealMedia ? "" : " media-frame-fallback";

  return (
    <div className={`${frameClassName} media-kind-${kind}${fallbackClassName}`}>
      {hasRealMedia ? (
        <img
          className={imageClassName}
          src={activeImageSource}
          alt={alt}
          loading={loading}
          onError={() => {
            setActiveSourceIndex((currentIndex) => currentIndex + 1);
          }}
        />
      ) : (
        <div className="media-fallback" aria-hidden="true">
          <img className="media-fallback-mark" src={brandIconDark} alt="" />
        </div>
      )}
    </div>
  );
}
