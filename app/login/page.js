"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, Eye, EyeOff, CheckSquare, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Google "G" SVG logo (no external image needed)
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M47.532 24.552c0-1.636-.132-3.2-.388-4.704H24.48v9.02h13.012c-.572 3.016-2.26 5.572-4.796 7.288v6.04h7.756c4.536-4.18 7.08-10.336 7.08-17.644z" fill="#4285F4"/>
      <path d="M24.48 48c6.516 0 11.988-2.156 15.984-5.804l-7.756-6.04c-2.156 1.444-4.912 2.3-8.228 2.3-6.324 0-11.676-4.272-13.596-10.02H2.872v6.24C6.848 42.836 15.1 48 24.48 48z" fill="#34A853"/>
      <path d="M10.884 28.436A14.44 14.44 0 0 1 10.1 24c0-1.54.268-3.036.784-4.436v-6.24H2.872A23.96 23.96 0 0 0 .48 24c0 3.876.928 7.54 2.392 10.676l8.012-6.24z" fill="#FBBC05"/>
      <path d="M24.48 9.544c3.564 0 6.756 1.224 9.272 3.632l6.952-6.952C36.46 2.392 30.988 0 24.48 0 15.1 0 6.848 5.164 2.872 13.324l8.012 6.24c1.92-5.748 7.272-10.02 13.596-10.02z" fill="#EA4335"/>
    </svg>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
      <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">or</span>
      <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
    </div>
  );
}

export default function LoginPage() {
  const { login, signInWithGoogle, user, loading } = useAuth();
  const router = useRouter();

  const [identifier, setIdentifier] = useState(""); // email OR username
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [user, loading, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(identifier.trim(), password);
      document.cookie = "taskflow-session=1; path=/; max-age=604800";
      router.replace("/");
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setGoogleBusy(true);
    try {
      await signInWithGoogle();
      document.cookie = "taskflow-session=1; path=/; max-age=604800";
      router.replace("/");
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user" && err.code !== "auth/cancelled-popup-request") {
        setError("Google sign-in failed. Please try again.");
      }
    } finally {
      setGoogleBusy(false);
    }
  }

  function friendlyError(code) {
    switch (code) {
      case "auth/user-not-found":
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Incorrect email / username or password.";
      case "auth/too-many-requests":
        return "Too many attempts. Please wait a moment.";
      case "auth/invalid-email":
        return "Invalid email address.";
      default:
        return "Something went wrong. Please try again.";
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-10 h-10 bg-violet-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-200 dark:shadow-violet-900">
            <CheckSquare size={22} className="text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            TaskFlow
          </span>
        </div>

        {/* Card */}
        <div className="card p-8">
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Sign in to your workspace
          </p>

          {/* Google button */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleBusy || busy}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/70 text-sm font-medium text-slate-700 dark:text-slate-200 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {googleBusy ? (
              <span className="w-4 h-4 border-2 border-slate-300 border-t-violet-600 rounded-full animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            {googleBusy ? "Signing in…" : "Continue with Google"}
          </button>

          <Divider />

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email or Username */}
            <div>
              <label className="label">Email or Username</label>
              <div className="relative">
                <User
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  className="input pl-10"
                  placeholder="you@example.com or your username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  autoComplete="username"
                  autoCapitalize="none"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type={showPass ? "text" : "password"}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-red-500 bg-red-50 dark:bg-red-950 dark:text-red-400 px-3 py-2 rounded-lg"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={busy || googleBusy}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {busy ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn size={16} />
              )}
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-5">
          No account?{" "}
          <Link
            href="/register"
            className="text-violet-600 dark:text-violet-400 font-medium hover:underline"
          >
            Create one
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
