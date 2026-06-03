"use client";
import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updatePassword,
  updateProfile,
  EmailAuthProvider,
  reauthenticateWithCredential,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  collection,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { updateUserTimezone } from "@/lib/firestore";
import { auth, db } from "@/lib/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ── Timeout fallback: if Firebase doesn't respond in 8s, stop spinning ──
    const timeout = setTimeout(() => {
      console.warn("Firebase auth timed out — check your connection or region.");
      setLoading(false);
    }, 8000);

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(timeout); // Firebase responded — cancel the timeout
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const snap = await getDoc(doc(db, "users", firebaseUser.uid));
          setProfile(snap.exists() ? snap.data() : null);
        } catch (err) {
          console.error("Failed to load user profile:", err);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      unsub();
      clearTimeout(timeout);
    };
  }, []);

  async function login(emailOrUsername, password) {
    let email = emailOrUsername.trim();
    if (!email.includes("@")) {
      const q = query(collection(db, "users"), where("username", "==", email));
      const snap = await getDocs(q);
      if (snap.empty) {
        const err = new Error("Username not found");
        err.code = "auth/user-not-found";
        throw err;
      }
      email = snap.docs[0].data().email;
    }
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const u = result.user;
    const ref = doc(db, "users", u.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      const username = (u.email || "").split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "");
      await setDoc(ref, {
        fullName: u.displayName || "",
        username,
        email: u.email || "",
        timezone: "",
        createdAt: serverTimestamp(),
      });
    }
    return result;
  }

  async function register(email, password, fullName) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: fullName });
    const username = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "");
    await setDoc(doc(db, "users", cred.user.uid), {
      uid: cred.user.uid,
      fullName,
      email,
      username,
      timezone: "",
      createdAt: serverTimestamp(),
    });
    setProfile({ uid: cred.user.uid, fullName, email, username });
    return cred;
  }

  async function logout() {
    await signOut(auth);
    setProfile(null);
  }

  async function updateFullName(fullName) {
    if (!user) return;
    await updateProfile(user, { displayName: fullName });
    await updateDoc(doc(db, "users", user.uid), { fullName });
    setProfile((p) => ({ ...p, fullName }));
  }

  async function changePassword(currentPassword, newPassword) {
    if (!user) return;
    const cred = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, cred);
    await updatePassword(user, newPassword);
  }

  async function updateTimezone(timezone) {
    if (!user) return;
    await updateUserTimezone(user.uid, timezone);
    setProfile((p) => ({ ...p, timezone }));
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, login, register, logout, signInWithGoogle, updateFullName, changePassword, updateTimezone }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
