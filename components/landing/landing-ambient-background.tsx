"use client";

import { motion } from "framer-motion";

export function LandingAmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.06)_1px,transparent_1px)] bg-[size:40px_40px] opacity-[0.08]" />

      <motion.div
        className="absolute -left-32 top-[-220px] h-[520px] w-[520px] rounded-full bg-cyan-500/12 blur-3xl"
        animate={{ x: [0, 18, 0], y: [0, 22, 0] }}
        transition={{ duration: 18, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      />
      <motion.div
        className="absolute right-[-160px] top-[6%] h-[460px] w-[460px] rounded-full bg-violet-500/14 blur-3xl"
        animate={{ x: [0, -24, 0], y: [0, 16, 0] }}
        transition={{ duration: 20, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-220px] left-1/3 h-[520px] w-[520px] rounded-full bg-sky-500/10 blur-3xl"
        animate={{ x: [0, 20, 0], y: [0, -16, 0] }}
        transition={{ duration: 22, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      />
    </div>
  );
}

