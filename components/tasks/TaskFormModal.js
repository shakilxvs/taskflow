"use client";

import { useState, useEffect } from "react";
import { Loader2, Plus, Pencil } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { addTask, updateTask } from "@/lib/firestore";
import { TAGS } from "@/lib/constants";
import Modal from "@/components/ui/Modal";

export default function TaskFormModal({ open, onClose, editTask = null, defaultDate = null }) {
  const { user } = useAuth();
  const { selectedBusiness, refreshTasks } = useApp();

  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [tag, setTag] = useState("General");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!editTask;

  useEffect(() => {
    if (open) {
      if (editTask) {
        setTitle(editTask.title || "");
        setDate(editTask.date || "");
        setTime(editTask.time || "");
        setTag(editTask.tag || "General");
        setNotes(editTask.notes || "");
      } else {
        setTitle("");
        setDate(defaultDate || "");
        setTime("");
        setTag("General");
        setNotes("");
      }
      setError("");
    }
  }, [open, editTask, defaultDate]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !date) return;
    if (!selectedBusiness) {
      setError("No business selected.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      if (isEdit) {
        await updateTask(editTask.id, {
          title: title.trim(),
          date,
          time,
          tag,
          notes: notes.trim(),
        });
      } else {
        await addTask(user.uid, {
          businessId: selectedBusiness.id,
          title: title.trim(),
          date,
          time,
          tag,
          notes: notes.trim(),
        });
      }
      await refreshTasks();
      onClose();
    } catch {
      setError("Failed to save task. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Task" : "Add Task"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="label">Task</label>
          <input
            className="input"
            placeholder="e.g. Send invoice for May"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
        </div>

        {/* Date + Time row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Date</label>
            <input
              type="date"
              className="input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">Time (optional)</label>
            <input
              type="time"
              className="input"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        {/* Tag */}
        <div>
          <label className="label">Tag</label>
          <div className="flex gap-1.5 flex-wrap">
            {TAGS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTag(t)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                  tag === t
                    ? "bg-violet-600 text-white border-violet-600"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-violet-400"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="label">Notes (optional)</label>
          <textarea
            className="input resize-none h-20"
            placeholder="Any additional details…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
        )}

        <div className="flex gap-2 justify-end pt-1">
          <button type="button" onClick={onClose} className="btn-ghost text-sm">
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            {busy ? (
              <Loader2 size={15} className="animate-spin" />
            ) : isEdit ? (
              <Pencil size={15} />
            ) : (
              <Plus size={15} />
            )}
            {busy ? "Saving…" : isEdit ? "Save Changes" : "Add Task"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
