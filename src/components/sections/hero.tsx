"use client";

import { motion } from "motion/react";
import dynamic from "next/dynamic";
import { ArrowRight, MoveDown } from "lucide-react";
import { Button } from "@/components/ui/button";

// 3D scene is client-only (WebGL) — load it lazily after hydration.
const HeroScene = dynamic(
  () => import("@/components/three/hero-scene").then((m) => m.HeroScene),
  { ssr: false },
);

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  return (
    <section id="top" className="relative isolate min-h-screen overflow-hidden gradient-navy">
      {/* Texture + depth layers */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:38px_38px]" />
      <div className="pointer-events-none absolute -left-40 top-1/4 size-[34rem] rounded-full bg-navy-soft/40 blur-[120px]" />
      <div className="pointer-events-none absolute -right-20 bottom-0 size-[30rem] rounded-full bg-crimson/15 blur-[120px]" />

      {/* 3D form */}
      <HeroScene className="absolute inset-y-0 right-[-8%] z-0 hidden w-[55%] md:block" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-[1] hidden w-[55%] bg-gradient-to-l from-transparent via-transparent to-navy md:block" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-5 pb-20 pt-32 sm:px-8">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease }}
          className="eyebrow mb-6"
        >
          Luxury Estate &amp; Transition Management · Est. Nairobi
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
          className="mt-8 max-w-xl text-base leading-relaxed text-white/75 text-pretty sm:text-lg"
        >
          A white-glove advisory firm trusted by affluent families, expatriates, and
          businesses across East Africa — combining valuation, marketing, sale, and
          logistics under one premium brand.
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
          className="mt-20 flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-white/45"
        >
          <MoveDown className="size-4 animate-bounce" />
          Scroll to explore
        </motion.div>
      </div>
    </section>
  );
}
