"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { ArrowRight, MoveDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRegion } from "@/components/region/region-context";
import { regionContent } from "@/lib/site";

const ease = [0.22, 1, 0.36, 1] as const;

// Drop a file at /public/hero/estate.mp4 to use a background video instead of
// the still image (Christie's-style). Leave null to use the image.
const HERO_VIDEO: string | null = null;

export function Hero() {
  const { region } = useRegion();
  const content = regionContent[region];
  return (
    <section
      id="top"
      className="relative isolate flex min-h-screen flex-col overflow-hidden gradient-navy"
    >
      {/* Full-bleed background media (image or video) */}
      <div className="absolute inset-0 -z-10">
        {HERO_VIDEO ? (
          <video
            className="size-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            poster="/hero/estate.jpg"
          >
            <source src={HERO_VIDEO} type="video/mp4" />
          </video>
        ) : (
          <motion.div
            initial={{ scale: 1.08 }}
            animate={{ scale: 1 }}
            transition={{ duration: 12, ease: "easeOut" }}
            className="relative size-full"
          >
            <Image
              src="/hero/estate.jpg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        )}
      </div>

      {/* Legibility scrims that darken toward the bottom and left over the photo */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-navy-deep/45" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-t from-navy-deep via-navy-deep/40 to-transparent" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-r from-navy-deep/80 via-navy-deep/25 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-5 pb-20 pt-32 sm:px-8">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
          className="eyebrow mb-6"
        >
          Luxury Estate &amp; Transition Management
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.08 }}
          className="max-w-3xl font-display text-[2.7rem] font-light leading-[1.04] text-white text-balance sm:text-6xl lg:text-7xl"
        >
          Luxury Estates.
          <br />
          Commercial Liquidations.
          <br />
          <span className="gradient-gold-text font-normal italic">Seamless Transitions.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.2 }}
          className="mt-8 max-w-xl text-base leading-relaxed text-white/80 text-pretty sm:text-lg"
        >
          {content.lede}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease, delay: 0.32 }}
          className="mt-11 flex flex-col gap-4 sm:flex-row"
        >
          <Button
            asChild
            size="lg"
            className="group h-13 bg-gold px-8 text-base text-navy hover:bg-gold-soft"
          >
            <a href="#contact">
              Book a Consultation
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </a>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="h-13 border-white/30 bg-white/5 px-8 text-base text-white backdrop-blur-sm hover:bg-white/10 hover:text-white"
          >
            <a href="#contact">Request an Asset Review</a>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-20 flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-white/50"
        >
          <MoveDown className="size-4 animate-bounce" />
          Scroll to explore
        </motion.div>
      </div>
    </section>
  );
}
