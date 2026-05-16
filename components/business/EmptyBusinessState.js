"use client";

import { motion } from "framer-motion";
import { Building2, Plus } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function EmptyBusinessState() {
  const { setSidebarOpen, setAddBusinessOpen } = useApp();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center h-full text-center py-24 px-6"
    >
      <div className="w-16 h-16 bg-violet-50 dark:bg-violet-950 rounded-3xl flex items-center justify-center mb-4">
        <Building2 size={28} className="text-violet-400" />
      </div>
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
        No business selected
      </h2>
      <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs mb-6">
        Add a business from the sidebar to start managing tasks and calendars.
      </p>
      <button
        onClick={() => { setAddBusinessOpen(true); setSidebarOpen(true); }}
        className="btn-primary flex items-center gap-2"
      >
        <Plus size={16} />
        Add a Business
      </button>
    </motion.div>
  );
}
