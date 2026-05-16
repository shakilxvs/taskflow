"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare,
  Plus,
  Settings,
  X,
  ChevronRight,
  Building2,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import { useDarkMode } from "@/context/DarkModeContext";
import { addBusiness } from "@/lib/firestore";
import { BUSINESS_COLORS } from "@/lib/constants";
import Modal from "@/components/ui/Modal";

function BusinessAvatar({ business, size = 8 }) {
  const initials = business.name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span
      className={`w-${size} h-${size} rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0`}
      style={{ backgroundColor: business.color || "#7C3AED" }}
    >
      {initials}
    </span>
  );
}

function AddBusinessModal({ open, onClose, onAdded }) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [color, setColor] = useState(BUSINESS_COLORS[0]);
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
      });
      setName("");
      setEmail("");
      setColor(BUSINESS_COLORS[0]);
      onAdded();
      onClose();
    } catch {
      setError("Failed to add business. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Add Business">
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
            Task completion emails go here. Leave blank to use your default.
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
        <div className="flex gap-2 justify-end pt-1">
          <button type="button" onClick={onClose} className="btn-ghost text-sm">
            Cancel
          </button>
          <button type="submit" disabled={busy} className="btn-primary flex items-center gap-2 text-sm">
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            {busy ? "Adding…" : "Add Business"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function SidebarContent({ onClose }) {
  const { profile, user } = useAuth();
  const {
    businesses,
    selectedBusiness,
    setSelectedBusiness,
    loadingBusinesses,
    refreshBusinesses,
  } = useApp();
  const [addOpen, setAddOpen] = useState(false);
  const router = useRouter();

  function selectBusiness(biz) {
    setSelectedBusiness(biz);
    if (onClose) onClose();
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-600 rounded-xl flex items-center justify-center shadow-sm">
            <CheckSquare size={17} className="text-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
            TaskFlow
          </span>
        </div>
        {onClose && (
          <button onClick={onClose} className="btn-ghost p-1.5">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Businesses */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Businesses
          </span>
          <button
            onClick={() => setAddOpen(true)}
            className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-violet-600 transition-colors"
            aria-label="Add business"
          >
            <Plus size={15} />
          </button>
        </div>

        {loadingBusinesses ? (
          <div className="flex justify-center py-8">
            <Loader2 size={20} className="animate-spin text-violet-400" />
          </div>
        ) : businesses.length === 0 ? (
          <div className="px-2 py-6 text-center">
            <Building2 size={28} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-xs text-slate-400 dark:text-slate-500">
              No businesses yet.
              <br />
              Add one to get started.
            </p>
          </div>
        ) : (
          businesses.map((biz) => {
            const active = selectedBusiness?.id === biz.id;
            return (
              <button
                key={biz.id}
                onClick={() => selectBusiness(biz)}
                className={`sidebar-item w-full text-left ${active ? "active" : ""}`}
              >
                <BusinessAvatar business={biz} size={7} />
                <span className="flex-1 truncate">{biz.name}</span>
                {active && (
                  <ChevronRight size={14} className="text-violet-500 shrink-0" />
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 dark:border-slate-800 px-3 py-3 space-y-0.5">
        <Link href="/settings" className="sidebar-item" onClick={onClose}>
          <Settings size={17} />
          Settings
        </Link>

        {/* User info */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 mt-1">
          <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-violet-600 dark:text-violet-300">
              {(profile?.fullName || user?.displayName || user?.email || "?")[0].toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
              {profile?.fullName || user?.displayName || "User"}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      <AddBusinessModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdded={refreshBusinesses}
      />
    </div>
  );
}

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useApp();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 dark:bg-black/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-white dark:bg-slate-900 shadow-panel lg:hidden flex flex-col"
            >
              <SidebarContent onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
