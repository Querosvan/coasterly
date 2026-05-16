import { useEffect, useState } from "react";

import { brandIconDark, getMediaSources } from "../../lib/assets";
import type { MediaKind } from "../../lib/types";

type MediaAssetProps = {
  kind: MediaKind;
  slug: string;
  imageUrl?: string | undefined;
  alt: string;
  frameClassName: string;
  imageClassName: string;
  loading?: "eager" | "lazy";
};

export function MediaAsset({
  kind,
  slug,
  imageUrl,
  alt,
  frameClassName,
  imageClassName,
  loading = "lazy"
}: MediaAssetProps) {
  const sources = getMediaSources(kind, slug, imageUrl);
  const sourceKey = sources.join("|");
  const [activeSourceIndex, setActiveSourceIndex] = useState(0);

  useEffect(() => {
    setActiveSourceIndex(0);
  }, [sourceKey]);

  const activeSource = sources[activeSourceIndex];

  const fallbackClassName = activeSource ? "" : " media-frame-fallback";

  return (
    <div className={`${frameClassName} media-kind-${kind}${fallbackClassName}`}>
      {activeSource ? (
        <img
          className={imageClassName}
          src={activeSource}
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
