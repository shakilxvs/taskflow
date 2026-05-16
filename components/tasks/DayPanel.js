"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Calendar, ClipboardList } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatDateFull } from "@/lib/dates";
import TaskCard from "@/components/tasks/TaskCard";
import TaskFormModal from "@/components/tasks/TaskFormModal";
import Toast from "@/components/ui/Toast";
import { useToast } from "@/hooks/useToast";

export default function DayPanel() {
  const { panelOpen, closePanel, selectedDate, tasksForDate, selectedBusiness } = useApp();
  const [addOpen, setAddOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const { toast, showToast, dismissToast } = useToast();

  const dateLabel = selectedDate ? formatDateFull(selectedDate) : "";
  const pending = tasksForDate.filter((t) => t.status === "pending");
  const done = tasksForDate.filter((t) => t.status === "done");
  const delayed = tasksForDate.filter((t) => t.status === "delayed");
  const ordered = [...delayed, ...pending, ...done];

  const panelContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <Calendar size={14} className="text-violet-500 shrink-0" />
            <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wide">
              {selectedBusiness?.name}
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
            {dateLabel}
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {ordered.length === 0
              ? "No tasks"
              : `${ordered.length} task${ordered.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <button
          onClick={closePanel}
          className="btn-ghost p-1.5 shrink-0 ml-2"
          aria-label="Close panel"
        >
          <X size={18} />
        </button>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {ordered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <ClipboardList size={32} className="text-slate-200 dark:text-slate-700 mb-3" />
            <p className="text-sm font-medium text-slate-400 dark:text-slate-500">
              No tasks for this day
            </p>
            <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">
              Tap the button below to add one
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {ordered.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={(t) => setEditTask(t)}
                onToast={showToast}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Add button */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
        <button
          onClick={() => setAddOpen(true)}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Plus size={17} />
          Add Task
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Desktop: slide-in panel from right ── */}
      <AnimatePresence>
        {panelOpen && (
          <>
            {/* Subtle overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closePanel}
              className="hidden lg:block fixed inset-0 z-20 bg-black/5 dark:bg-black/20"
            />
            <motion.aside
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="hidden lg:flex flex-col fixed right-0 top-0 bottom-0 z-30 w-[380px] bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 shadow-panel"
            >
              {panelContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Mobile: bottom sheet ── */}
      <AnimatePresence>
        {panelOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closePanel}
              className="lg:hidden fixed inset-0 z-40 bg-black/40 dark:bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl shadow-panel flex flex-col"
              style={{ maxHeight: "85vh" }}
            >
              {/* Pull indicator */}
              <div className="flex justify-center pt-3 pb-1 shrink-0">
                <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
              </div>
              {panelContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Task form modals */}
      <TaskFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        defaultDate={selectedDate}
      />
      <TaskFormModal
        open={!!editTask}
        onClose={() => setEditTask(null)}
        editTask={editTask}
      />

      {/* Toast */}
      <Toast toast={toast} onDismiss={dismissToast} />
    </>
  );
}
