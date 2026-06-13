"use client";

import { motion } from 'framer-motion';

export default function KnowledgeTree({ stage }: { stage: number, points?: number }) {
  const getStageName = (s: number) => {
    switch (s) {
      case 1: return "Seed";
      case 2: return "Sprout";
      case 3: return "Young Tree";
      case 4: return "Knowledge Tree";
      case 5: return "Wisdom Tree";
      default: return "Seed";
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative flex h-48 w-48 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 shadow-inner"
    >
      <div className="text-6xl">
        {stage === 1 && "🌱"}
        {stage === 2 && "🌿"}
        {stage === 3 && "🌳"}
        {stage === 4 && "🌲"}
        {stage >= 5 && "🌎"}
      </div>
      <div className="absolute -bottom-4 rounded-full bg-emerald-500 dark:bg-emerald-600 px-4 py-1 text-sm font-bold text-white shadow">
        {getStageName(stage)}
      </div>
    </motion.div>
  );
}
