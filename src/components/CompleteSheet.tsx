import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  open: boolean;
  globalDay: number;
  onConfirm: (note: string) => void;
  onClose: () => void;
}

export default function CompleteSheet({
  open,
  globalDay,
  onConfirm,
  onClose,
}: Props) {
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setNote('');
      setSubmitting(false);
    }
  }, [open]);

  const handleConfirm = () => {
    if (submitting) return;
    setSubmitting(true);
    onConfirm(note);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/30"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-app rounded-t-[24px] bg-white p-5 pb-8 shadow-soft safe-bottom"
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-200" />
            <h2 className="text-center text-xl font-extrabold text-gray-800">
              完成 Day {globalDay} 🎉
            </h2>
            <p className="mt-1 text-center text-sm text-gray-500">
              简单记录一下今天的完成情况（可选）
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="今天学得怎么样？记一句话吧～"
              className="mt-4 min-h-[96px] w-full resize-none rounded-card border border-line bg-cream p-3 text-sm text-gray-700 outline-none focus:border-forest"
            />
            <button
              onClick={handleConfirm}
              disabled={submitting}
              className="mt-4 w-full rounded-card bg-forest py-4 text-base font-extrabold text-white active:scale-[0.98] disabled:opacity-70"
            >
              确认完成 ✓
            </button>
            <button
              onClick={onClose}
              className="mt-2 w-full py-2 text-sm font-semibold text-gray-400"
            >
              取消
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
