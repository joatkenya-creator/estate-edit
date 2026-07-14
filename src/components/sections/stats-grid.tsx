"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { cn } from "@/lib/utils";
import type { Metric } from "@/lib/site";

function format(n: number, decimals = 0) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function CountUp({ to, prefix = "", suffix = "", decimals = 0 }: Metric) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1600;
    let raf = 0;
    let start = 0;
    const tick = (t: number) => {
      if (!start) start = t;
      const progress = Math.min((t - start) / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(to * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);

  return (
    <span ref={ref}>
      {prefix}
      {format(value, decimals)}
      {suffix}
    </span>
  );
}

export function StatsGrid({ metrics }: { metrics: Metric[] }) {
  // Border/column breakpoint scales with the metric count so a 3-up row
  // (Kenya, since dropping the KES value stat) doesn't leave a gap where a
  // 4th column would have been.
  const wide = metrics.length >= 4;

  return (
    <div
      className={cn(
        "grid gap-y-12",
        wide ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-3",
      )}
    >
      {metrics.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "relative px-4 text-center",
            wide
              ? "lg:border-r lg:border-white/10 lg:last:border-none"
              : "sm:border-r sm:border-white/10 sm:last:border-none",
          )}
        >
          <div className="font-display text-4xl font-light tabular-nums text-white sm:text-5xl lg:text-6xl">
            <CountUp {...m} />
          </div>
          <div className="mt-3 text-xs uppercase tracking-[0.22em] text-white/55">
            {m.label}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
