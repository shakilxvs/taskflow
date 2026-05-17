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
} from "firebase/auth";
import { doc, setDoc, getDoc, getDocs, updateDoc, collection, query, where, serverTimestamp } from "firebase/firestore";
import { updateUserTimezone } from "@/lib/firestore";
import { auth, db } from "@/lib/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));
        setProfile(snap.exists() ? snap.data() : null);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function login(emailOrUsername, password) {
    let email = emailOrUsername.trim();
    // If it doesn't look like an email, look up the username in Firestore
    if (!email.includes("@")) {
      const q = query(
        collection(db, "users"),
        where("username", "==", email)
      );
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
    // Create Firestore profile if first time
    const ref = doc(db, "users", u.uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
      await setDoc(ref, {
        fullName: u.displayName || "",
        username: "",
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
    // Derive a default username from the email (before the @)
    // e.g. shakil@gmail.com → "shakil"
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
