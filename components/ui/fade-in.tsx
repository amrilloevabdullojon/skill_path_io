"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";

type FadeInUpProps = HTMLMotionProps<"div"> & {
  delay?: number;
  duration?: number;
  children: React.ReactNode;
};

export function FadeInUp({ delay = 0, duration = 0.4, children, ...props }: FadeInUpProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? {} : { opacity: 0, y: 16 }}
      animate={reduced ? {} : { opacity: 1, y: 0 }}
      transition={reduced ? {} : { duration, delay, ease: [0.22, 1, 0.36, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

type StaggerListProps = {
  children: React.ReactNode[];
  staggerDelay?: number;
  className?: string;
};

export function StaggerList({ children, staggerDelay = 0.07, className }: StaggerListProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: reduced ? 0 : staggerDelay } },
      }}
    >
      {children.map((child, i) => (
        <motion.div
          key={i}
          variants={
            reduced
              ? { hidden: {}, visible: {} }
              : {
                  hidden: { opacity: 0, y: 12 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
                }
          }
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
