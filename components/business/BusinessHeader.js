"use client";

import { useState, useMemo } from "react";
import { Settings2, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";
import BusinessSettingsModal from "./BusinessSettingsModal";

function StatChip({ icon: Icon, label, count, colorClass }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium ${colorClass}`}>
      <Icon size={13} />
      <span>{count} {label}</span>
    </div>
  );
}

export default function BusinessHeader() {
  const { selectedBusiness, tasks } = useApp();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const stats = useMemo(() => {
    const pending = tasks.filter((t) => t.status === "pending").length;
    const done = tasks.filter((t) => t.status === "done").length;
    const delayed = tasks.filter((t) => t.status === "delayed").length;
    return { pending, done, delayed };
  }, [tasks]);

  if (!selectedBusiness) return null;

  return (
    <>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-2xl shrink-0 shadow-sm"
            style={{ backgroundColor: selectedBusiness.color || "#7C3AED" }}
          />
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white truncate leading-tight">
              {selectedBusiness.name}
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {tasks.length} task{tasks.length !== 1 ? "s" : ""} total
            </p>
          </div>
        </div>

        <button
          onClick={() => setSettingsOpen(true)}
          className="btn-ghost p-2 shrink-0 ml-2"
          aria-label="Business settings"
        >
          <Settings2 size={18} />
        </button>
      </div>

      {/* Stats row */}
      {tasks.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-6">
          {stats.pending > 0 && (
            <StatChip
              icon={Clock}
              label="pending"
              count={stats.pending}
              colorClass="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            />
          )}
          {stats.done > 0 && (
            <StatChip
              icon={CheckCircle2}
              label="done"
              count={stats.done}
              colorClass="bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400"
            />
          )}
          {stats.delayed > 0 && (
            <StatChip
              icon={AlertCircle}
              label="delayed"
              count={stats.delayed}
              colorClass="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400"
            />
          )}
        </div>
      )}

      <BusinessSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}
