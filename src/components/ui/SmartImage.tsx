"use client";

import { useState } from "react";

/* An <img> that, if the source is missing, gracefully shows a pretty pastel
 * gradient with the caption text — so the experience never looks broken even
 * before the real photos are dropped in. */

const GRADIENTS = [
  "linear-gradient(135deg,#FFD9E0,#C9B8FF)",
  "linear-gradient(135deg,#FFF3C4,#FFB3C6)",
  "linear-gradient(135deg,#E4DCFF,#FFD9BE)",
  "linear-gradient(135deg,#FFB3C6,#FFD9BE)",
  "linear-gradient(135deg,#C9B8FF,#FFD9E0)",
];

export default function SmartImage({
  src,
  alt,
  caption,
  className = "",
  index = 0,
}: {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  index?: number;
}) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`flex items-center justify-center text-center ${className}`}
        style={{ background: GRADIENTS[index % GRADIENTS.length] }}
        aria-label={alt}
      >
        <span className="px-3 font-hand text-lg leading-tight text-ink/70">
          {caption || "add a photo ♥"}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      draggable={false}
      onError={() => setFailed(true)}
      className={`object-cover ${className}`}
    />
  );
}
