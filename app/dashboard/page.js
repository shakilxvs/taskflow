"use client";

import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import { addBusiness } from "@/lib/firestore";
import { BUSINESS_COLORS, TIMEZONES } from "@/lib/constants";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import BusinessHeader from "@/components/business/BusinessHeader";
import EmptyBusinessState from "@/components/business/EmptyBusinessState";
import Calendar from "@/components/calendar/Calendar";
import DayPanel from "@/components/tasks/DayPanel";
import AllTasksList from "@/components/tasks/AllTasksList";
import Spinner from "@/components/ui/Spinner";
import Modal from "@/components/ui/Modal";
import { Loader2, Plus } from "lucide-react";

// ── AddBusinessModal rendered at page root so z-index is never clipped ──
function AddBusinessModal({ open, onClose, onAdded }) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [color, setColor] = useState(BUSINESS_COLORS[0]);
  const [timezone, setTimezone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError("");
    try {
      await addBusiness(user.uid, {
        name: name.trim(),
        notificationEmail: email.trim(),
        color,
        timezone,
      });
      setName("");
      setEmail("");
      setColor(BUSINESS_COLORS[0]);
      setTimezone("");
      onAdded();
      onClose();
    } catch {
      setError("Failed to add business. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Business" maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Business Name</label>
          <input
            className="input"
            placeholder="e.g. CASABELLA US"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
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
            Task completion emails go here. Leave blank if not needed.
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
            Shown on the calendar so you always know the client's timezone.
          </p>
        </div>

        {/* Color */}
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

        <div className="flex gap-2 justify-end pt-1">
          <button type="button" onClick={onClose} className="btn-ghost text-sm">
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            {busy ? "Adding…" : "Add Business"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ── Main dashboard ──
export default function DashboardPage() {
  const { selectedBusiness, loadingBusinesses, loadingTasks, addBusinessOpen, setAddBusinessOpen, refreshBusinesses } = useApp();

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <Header />

        <main className="flex-1 overflow-hidden flex min-w-0">
          {loadingBusinesses ? (
            <div className="flex-1 flex items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : !selectedBusiness ? (
            <div className="flex-1 overflow-y-auto">
              <EmptyBusinessState />
            </div>
          ) : (
            <>
              {/* ── Left: Calendar ── */}
              <div className="flex-1 overflow-y-auto px-4 py-5 lg:px-6 lg:py-6 min-w-0">
                <BusinessHeader />
                <div className="card p-4 lg:p-5">
                  {loadingTasks ? (
                    <div className="flex justify-center py-16">
                      <Spinner size="md" />
                    </div>
                  ) : (
                    <Calendar />
                  )}
                </div>
                {/* Mobile bottom spacer */}
                <div className="h-6 lg:hidden" />
              </div>

              {/* ── Right: All Tasks panel (always visible on xl+) ── */}
              <div className="hidden xl:flex flex-col w-72 2xl:w-80 shrink-0 border-l border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                <AllTasksList />
              </div>
            </>
          )}
        </main>
      </div>

      {/* Day panel slides in from right (over everything) */}
      <DayPanel />

      {/* Add Business modal — rendered at root level so z-index is never clipped */}
      <AddBusinessModal
        open={addBusinessOpen}
        onClose={() => setAddBusinessOpen(false)}
        onAdded={refreshBusinesses}
      />
    </div>
  );
}
