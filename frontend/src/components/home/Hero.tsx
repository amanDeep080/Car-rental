"use client";

import dynamic from "next/dynamic";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const MotionScene = dynamic(() => import("@/three/MotionScene"), { ssr: false });

const TELEMETRY = [
  { label: "AVG. PICKUP TIME", value: "11", unit: "MIN" },
  { label: "FLEET UPTIME", value: "98.4", unit: "%" },
  { label: "CITIES LIVE", value: "06", unit: "" },
];

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const [enable3d, setEnable3d] = useState(false);

  useEffect(() => {
    // Skip the WebGL scene on reduced-motion preference or low-memory devices.
    const lowPower =
      typeof navigator !== "undefined" &&
      "deviceMemory" in navigator &&
      // @ts-expect-error - deviceMemory is experimental, not in TS lib
      navigator.deviceMemory < 4;
    setEnable3d(!prefersReducedMotion && !lowPower);
  }, [prefersReducedMotion]);

  return (
    <section className="relative flex min-h-[100svh] items-end overflow-hidden bg-obsidian pb-24 pt-40">
      {/* Backdrop layer */}
      <div className="absolute inset-0">
        {enable3d ? (
          <MotionScene />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(201,138,59,0.14),transparent_60%)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-obsidian/10 via-obsidian/40 to-obsidian" />
      </div>

      <div className="container-edge relative z-10">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="eyebrow mb-6"
        >
          Self-drive · No drivers, no dispatch
        </motion.p>

        <h1 className="font-display text-hero font-700 text-ivory">
          {["DRIVE IT.", "LOVE IT.", "OWN THE JOURNEY."].map((line, i) => (
            <motion.span
              key={line}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="block"
            >
              {line}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-7 max-w-md text-lg text-steel"
        >
          Well-maintained, fuel-efficient self-drive cars with 24x7 roadside assistance. Best prices, no hidden charges.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-9 flex flex-wrap items-center gap-4"
        >
          <Link
            href="/cars"
            className="group flex items-center gap-2 rounded-full bg-brass-sheen px-7 py-3.5 text-sm font-medium text-obsidian shadow-brass-glow transition-transform duration-300 hover:scale-[1.03]"
          >
            Explore Cars
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link
            href="#booking-search"
            className="rounded-full border border-graphite-line px-7 py-3.5 text-sm font-medium text-ivory transition-colors hover:border-brass"
          >
            Book Now
          </Link>
        </motion.div>

        {/* HUD telemetry strip — the hero's signature element */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-16 grid max-w-xl grid-cols-3 gap-6 border-t border-graphite-line pt-6 font-mono"
        >
          {TELEMETRY.map((t) => (
            <div key={t.label}>
              <div className="text-2xl text-ivory">
                {t.value}
                <span className="ml-1 text-xs text-brass">{t.unit}</span>
              </div>
              <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-steel">{t.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
