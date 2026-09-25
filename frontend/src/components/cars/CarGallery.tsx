"use client";

import Image from "next/image";
import { useState } from "react";

export default function CarGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const safeImages = images.length > 0 ? images : ["https://placehold.co/600x400?text=No+Vehicle+Image"];

  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-panel bg-graphite">
        <img
          src={safeImages[active] ?? safeImages[0]!}
          alt={alt}
          className="h-full w-full object-cover"
        />
      </div>
      {safeImages.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto">
          {safeImages.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActive(i)}
              className={`relative h-16 w-24 flex-shrink-0 overflow-hidden rounded-lg border transition-colors ${
                active === i ? "border-brass" : "border-graphite-line"
              }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
