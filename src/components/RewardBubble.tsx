import { AnimatePresence, motion } from 'framer-motion';

export interface Bubble {
  id: number;
  text: string;
}

export default function RewardBubbles({ bubbles }: { bubbles: Bubble[] }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-50 flex flex-col items-center gap-2">
      <AnimatePresence>
        {bubbles.map((b) => (
          <motion.div
            key={b.id}
            initial={{ scale: 0.5, opacity: 0, y: 0 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 18,
            }}
            className="rounded-full bg-amber px-5 py-2 text-sm font-extrabold text-white shadow-soft"
          >
            {b.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
