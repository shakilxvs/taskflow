"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertCircle, Info, X } from "lucide-react";

const ICONS = {
  success: Check,
  error: AlertCircle,
  info: Info,
};

const STYLES = {
  success: "bg-emerald-600 text-white",
  error: "bg-red-600 text-white",
  info: "bg-slate-800 text-white dark:bg-slate-700",
};

export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, 3500);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  const Icon = toast ? ICONS[toast.type] || Check : null;

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.96 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-panel text-sm font-medium whitespace-nowrap ${STYLES[toast.type] || STYLES.info}`}
        >
          {Icon && <Icon size={16} />}
          {toast.message}
          <button
            onClick={onDismiss}
            className="ml-1 opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
