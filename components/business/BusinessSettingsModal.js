"use client";

import { useState, useEffect } from "react";
import { Loader2, Trash2, Check } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { updateBusiness, deleteBusiness, deleteTasksByBusiness } from "@/lib/firestore";
import { BUSINESS_COLORS, TIMEZONES } from "@/lib/constants";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function BusinessSettingsModal({ open, onClose }) {
  const { selectedBusiness, setSelectedBusiness, businesses, refreshBusinesses } = useApp();
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [color, setColor] = useState(BUSINESS_COLORS[0]);
  const [timezone, setTimezone] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (selectedBusiness) {
      setName(selectedBusiness.name || "");
      setEmail(selectedBusiness.notificationEmail || "");
      setColor(selectedBusiness.color || BUSINESS_COLORS[0]);
      setTimezone(selectedBusiness.timezone || "");
    }
  }, [selectedBusiness, open]);

  async function handleSave(e) {
    e.preventDefault();
    if (!name.trim() || !selectedBusiness) return;
    setBusy(true);
    setError("");
    try {
      await updateBusiness(selectedBusiness.id, {
        name: name.trim(),
        notificationEmail: email.trim(),
        color,
        timezone,
      });
      await refreshBusinesses();
      setSelectedBusiness((prev) => ({
        ...prev,
        name: name.trim(),
        notificationEmail: email.trim(),
        color,
        timezone,
      }));
      onClose();
    } catch {
      setError("Failed to save. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!selectedBusiness) return;
    setDeleteBusy(true);
    try {
      await deleteTasksByBusiness(user.uid, selectedBusiness.id);
      await deleteBusiness(selectedBusiness.id);
      await refreshBusinesses();
      const remaining = businesses.filter((b) => b.id !== selectedBusiness.id);
      setSelectedBusiness(remaining[0] || null);
      setDeleteOpen(false);
      onClose();
    } catch {
      setError("Failed to delete business.");
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <>
      <Modal open={open} onClose={onClose} title="Business Settings" maxWidth="max-w-lg">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Business Name</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="label">Notification Email</label>
            <input
              type="email"
              className="input"
              placeholder="team@business.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="text-xs text-slate-400 mt-1">
              Completed task emails go here.
            </p>
          </div>

          {/* Timezone */}
          <div>
            <label className="label">Business Timezone</label>
            <select
              className="input"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            >
              <option value="">— Not set —</option>
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">
              Shown on the calendar so you know which timezone your client works in.
            </p>
          </div>

          <div>
            <label className="label">Color</label>
            <div className="flex gap-2 flex-wrap">
              {BUSINESS_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full transition-transform hover:scale-110 focus:outline-none"
                  style={{ backgroundColor: c }}
                >
                  {color === c && (
                    <span className="flex items-center justify-center w-full h-full">
                      <span className="w-2 h-2 bg-white rounded-full" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
          )}

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="flex items-center gap-1.5 text-sm text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
            >
              <Trash2 size={15} />
              Delete Business
            </button>

            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="btn-ghost text-sm">
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy}
                className="btn-primary text-sm flex items-center gap-1.5"
              >
                {busy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {busy ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        busy={deleteBusy}
        title="Delete Business"
        message={`Are you sure you want to delete "${selectedBusiness?.name}"? This will permanently delete the business and all its tasks.`}
        confirmLabel="Delete"
        danger
      />
    </>
  );
}
