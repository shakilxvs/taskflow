"use client";

import Modal from "./Modal";
import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
  danger = true,
  busy = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-sm">
      <div className="flex gap-3 mb-5">
        {danger && (
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center shrink-0">
            <AlertTriangle size={18} className="text-red-600 dark:text-red-400" />
          </div>
        )}
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          {message}
        </p>
      </div>

      <div className="flex gap-2 justify-end">
        <button onClick={onClose} className="btn-ghost text-sm">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={busy}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            danger
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "btn-primary"
          } disabled:opacity-50`}
        >
          {busy && (
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
