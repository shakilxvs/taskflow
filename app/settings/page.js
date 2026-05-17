"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Lock, Moon, Sun, LogOut, CheckSquare, ArrowLeft,
  Eye, EyeOff, Check, AlertCircle, Globe,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useDarkMode } from "@/context/DarkModeContext";
import { TIMEZONES } from "@/lib/constants";

function Section({ title, children }) {
  return (
    <div className="card p-6 space-y-4">
      <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Toast({ message, type }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-panel text-sm font-medium ${
        type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
      }`}
    >
      {type === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
      {message}
    </motion.div>
  );
}

export default function SettingsPage() {
  const { user, profile, loading, updateFullName, changePassword, logout, updateTimezone } = useAuth();
  const { dark, toggle } = useDarkMode();
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [nameBusy, setNameBusy] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwBusy, setPwBusy] = useState(false);

  const [selectedTz, setSelectedTz] = useState("");
  const [tzBusy, setTzBusy] = useState(false);

  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (profile?.fullName) setFullName(profile.fullName);
    else if (user?.displayName) setFullName(user.displayName);
    if (profile?.timezone) setSelectedTz(profile.timezone);
  }, [profile, user]);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  function showToast(message, type = "success") {
    setToast({ message, type });
  }

  async function handleNameSave() {
    if (!fullName.trim()) return;
    setNameBusy(true);
    try {
      await updateFullName(fullName.trim());
      showToast("Name updated successfully");
    } catch {
      showToast("Failed to update name", "error");
    } finally {
      setNameBusy(false);
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    if (newPw.length < 6) { showToast("Password must be at least 6 characters", "error"); return; }
    if (newPw !== confirmPw) { showToast("Passwords do not match", "error"); return; }
    setPwBusy(true);
    try {
      await changePassword(currentPw, newPw);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      showToast("Password changed successfully");
    } catch (err) {
      if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        showToast("Current password is incorrect", "error");
      } else {
        showToast("Failed to change password", "error");
      }
    } finally {
      setPwBusy(false);
    }
  }

  async function handleTimezoneSave() {
    setTzBusy(true);
    try {
      await updateTimezone(selectedTz);
      showToast("Timezone saved");
    } catch {
      showToast("Failed to save timezone", "error");
    } finally {
      setTzBusy(false);
    }
  }

  async function handleLogout() {
    await logout();
    document.cookie = "taskflow-session=; path=/; max-age=0";
    router.replace("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="w-8 h-8 border-2 border-violet-600/30 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-3">
          <button onClick={() => router.back()} className="btn-ghost p-2" aria-label="Go back">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
              <CheckSquare size={15} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white">Settings</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-4">

        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <Section title="Profile">
            <div>
              <label className="label">Full Name</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    className="input pl-10"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                <button onClick={handleNameSave} disabled={nameBusy} className="btn-primary px-5 flex items-center gap-1.5 whitespace-nowrap">
                  {nameBusy ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={16} />}
                  Save
                </button>
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input opacity-60 cursor-not-allowed" value={user?.email || ""} disabled />
              <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
            </div>
          </Section>
        </motion.div>

        {/* Your Timezone */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <Section title="Your Timezone">
            <div>
              <label className="label">Timezone</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select
                    className="input pl-10"
                    value={selectedTz}
                    onChange={(e) => setSelectedTz(e.target.value)}
                  >
                    <option value="">— Select your timezone —</option>
                    {TIMEZONES.map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button onClick={handleTimezoneSave} disabled={tzBusy} className="btn-primary px-5 flex items-center gap-1.5 whitespace-nowrap">
                  {tzBusy ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={16} />}
                  Save
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1.5">
                Each business can also have its own timezone set — useful when your clients are in different countries.
              </p>
            </div>
          </Section>
        </motion.div>

        {/* Change Password */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Section title="Change Password">
            <form onSubmit={handlePasswordChange} className="space-y-3">
              <div>
                <label className="label">Current Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPw ? "text" : "password"}
                    className="input pl-10 pr-10"
                    placeholder="Current password"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">New Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type={showPw ? "text" : "password"} className="input pl-10" placeholder="Min. 6 characters" value={newPw} onChange={(e) => setNewPw(e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="label">Confirm New Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type={showPw ? "text" : "password"} className="input pl-10" placeholder="Repeat new password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} required />
                </div>
              </div>
              <button type="submit" disabled={pwBusy} className="btn-primary flex items-center gap-2">
                {pwBusy ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Lock size={16} />}
                {pwBusy ? "Changing…" : "Change Password"}
              </button>
            </form>
          </Section>
        </motion.div>

        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Section title="Appearance">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {dark ? <Moon size={20} className="text-violet-400" /> : <Sun size={20} className="text-amber-500" />}
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">Dark Mode</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{dark ? "Currently on" : "Currently off"}</p>
                </div>
              </div>
              <button
                onClick={toggle}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${dark ? "bg-violet-600" : "bg-slate-200"}`}
                aria-label="Toggle dark mode"
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${dark ? "translate-x-6" : "translate-x-0"}`} />
              </button>
            </div>
          </Section>
        </motion.div>

        {/* Account */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Section title="Account">
            <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors text-sm font-medium">
              <LogOut size={18} />
              Sign out of TaskFlow
            </button>
          </Section>
        </motion.div>

      </main>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </AnimatePresence>
    </div>
  );
}
