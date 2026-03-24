"use client";

import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";

type FadeInUpProps = HTMLMotionProps<"div"> & {
  delay?: number;
  duration?: number;
  children: React.ReactNode;
};

export function FadeInUp({ delay = 0, duration = 0.4, children, ...props }: FadeInUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
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
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerDelay } },
      }}
    >
      {children.map((child, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
