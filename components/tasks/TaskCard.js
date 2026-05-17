"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Trash2, Pencil, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { markTaskDone, markTaskUndone, deleteTask, updateTask } from "@/lib/firestore";
import { sendTaskDoneEmail } from "@/lib/emailjs";
import TagBadge from "@/components/ui/TagBadge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function TaskCard({ task, onEdit, onToast }) {
  const { user, profile } = useAuth();
  const { selectedBusiness, refreshTasks } = useApp();
  const [checking, setChecking] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const isDone = task.status === "done";
  const isDelayed = task.status === "delayed";

  async function handleCheck() {
    setChecking(true);
    try {
      if (isDone) {
        await markTaskUndone(task.id);
        await refreshTasks();
        onToast?.("Task unmarked", "success");
      } else {
        await markTaskDone(task.id);
        // Send email notification
        try {
          await sendTaskDoneEmail({
            task,
            business: selectedBusiness,
            completedBy: profile?.fullName || user?.displayName || user?.email || "Team member",
          });
        } catch (emailErr) {
          console.warn("Email failed:", emailErr);
        }
        await refreshTasks();
        onToast?.("Task marked as done", "success");
      }
    } catch {
      onToast?.("Failed to update task", "error");
    } finally {
      setChecking(false);
    }
  }

  async function handleDelete() {
    setDeleteBusy(true);
    try {
      await deleteTask(task.id);
      await refreshTasks();
      setDeleteOpen(false);
      onToast?.("Task deleted", "success");
    } catch {
      onToast?.("Failed to delete task", "error");
    } finally {
      setDeleteBusy(false);
    }
  }

  const borderColor = isDone
    ? "border-emerald-200 dark:border-emerald-800"
    : isDelayed
    ? "border-red-200 dark:border-red-800"
    : "border-slate-100 dark:border-slate-800";

  const bgColor = isDone
    ? "bg-emerald-50 dark:bg-emerald-950/40"
    : isDelayed
    ? "bg-red-50 dark:bg-red-950/40"
    : "bg-white dark:bg-slate-900";

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96, y: -4 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className={`group relative rounded-2xl border p-4 ${bgColor} ${borderColor} transition-colors`}
      >
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            onClick={handleCheck}
            disabled={checking}
            className="mt-0.5 shrink-0 transition-transform active:scale-90 disabled:cursor-default"
            aria-label={isDone ? "Click to unmark" : "Mark as done"}
          >
            <motion.div
              animate={{ scale: checking ? 0.85 : 1 }}
              transition={{ duration: 0.15 }}
            >
              {isDone ? (
                <CheckCircle2 size={22} className="text-emerald-500" />
              ) : isDelayed ? (
                <AlertCircle size={22} className="text-red-400" />
              ) : (
                <Circle size={22} className="text-slate-300 dark:text-slate-600 group-hover:text-violet-400 transition-colors" />
              )}
            </motion.div>
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-medium leading-snug ${
                isDone
                  ? "line-through text-slate-400 dark:text-slate-500"
                  : "text-slate-900 dark:text-slate-100"
              }`}
            >
              {task.title}
            </p>

            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {task.time && (
                <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500">
                  <Clock size={11} />
                  {task.time}
                </span>
              )}
              <TagBadge tag={task.tag} size="xs" />
              {isDelayed && (
                <span className="text-xs text-red-500 dark:text-red-400 font-medium">
                  Delayed
                </span>
              )}
            </div>

            {task.notes && (
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 line-clamp-2">
                {task.notes}
              </p>
            )}
          </div>

          {/* Actions - show on hover */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            {!isDone && (
              <button
                onClick={() => onEdit?.(task)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                aria-label="Edit task"
              >
                <Pencil size={13} />
              </button>
            )}
            <button
              onClick={() => setDeleteOpen(true)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 dark:hover:bg-red-950 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              aria-label="Delete task"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </motion.div>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        busy={deleteBusy}
        title="Delete Task"
        message={`Delete "${task.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
      />
    </>
  );
}
