import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// ─── BUSINESSES ────────────────────────────────────────────────────────────

export async function getBusinesses(uid) {
  const q = query(
    collection(db, "businesses"),
    where("uid", "==", uid)
  );
  const snap = await getDocs(q);
  const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  // Sort client-side — avoids needing a Firestore composite index
  return list.sort((a, b) => {
    const aTime = a.createdAt?.seconds ?? 0;
    const bTime = b.createdAt?.seconds ?? 0;
    return aTime - bTime;
  });
}

export async function addBusiness(uid, { name, notificationEmail, color, timezone }) {
  return addDoc(collection(db, "businesses"), {
    uid,
    name,
    notificationEmail: notificationEmail || "",
    color: color || "#7C3AED",
    timezone: timezone || "",
    createdAt: serverTimestamp(),
  });
}

export async function updateBusiness(businessId, updates) {
  return updateDoc(doc(db, "businesses", businessId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteBusiness(businessId) {
  return deleteDoc(doc(db, "businesses", businessId));
}

// ─── TASKS ─────────────────────────────────────────────────────────────────

export async function getTasksByBusiness(uid, businessId) {
  const q = query(
    collection(db, "tasks"),
    where("uid", "==", uid),
    where("businessId", "==", businessId)
  );
  const snap = await getDocs(q);
  const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return list.sort((a, b) => (a.date > b.date ? 1 : -1));
}

export async function getAllTasks(uid) {
  const q = query(
    collection(db, "tasks"),
    where("uid", "==", uid)
  );
  const snap = await getDocs(q);
  const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return list.sort((a, b) => (a.date > b.date ? 1 : -1));
}

export async function addTask(uid, { businessId, title, date, time, tag, notes }) {
  return addDoc(collection(db, "tasks"), {
    uid,
    businessId,
    title,
    date,      // "YYYY-MM-DD"
    time: time || "",
    tag: tag || "General",
    notes: notes || "",
    status: "pending",  // pending | done | delayed
    createdAt: serverTimestamp(),
  });
}

export async function updateTask(taskId, updates) {
  return updateDoc(doc(db, "tasks", taskId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTask(taskId) {
  return deleteDoc(doc(db, "tasks", taskId));
}

export async function markTaskDone(taskId) {
  return updateDoc(doc(db, "tasks", taskId), {
    status: "done",
    completedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function markTaskUndone(taskId) {
  return updateDoc(doc(db, "tasks", taskId), {
    status: "pending",
    completedAt: null,
    updatedAt: serverTimestamp(),
  });
}

// ─── BULK TASK DELETION ────────────────────────────────────────────────────

// Deletes all tasks belonging to a business (called when a business is deleted)
export async function deleteTasksByBusiness(uid, businessId) {
  const q = query(
    collection(db, "tasks"),
    where("uid", "==", uid)
  );
  const snap = await getDocs(q);
  const toDelete = snap.docs.filter((d) => d.data().businessId === businessId);
  await Promise.all(toDelete.map((d) => deleteDoc(doc(db, "tasks", d.id))));
}

// ─── USER TIMEZONE ─────────────────────────────────────────────────────────

export async function updateUserTimezone(uid, timezone) {
  return updateDoc(doc(db, "users", uid), { timezone });
}

// ─── AUTO-DELAY ────────────────────────────────────────────────────────────
// Call on app load — marks any pending tasks with past dates as delayed

export async function autoMarkDelayed(uid) {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  // Single where clause only — avoids composite index requirement
  const q = query(
    collection(db, "tasks"),
    where("uid", "==", uid)
  );
  const snap = await getDocs(q);
  const stale = snap.docs.filter(
    (d) => d.data().status === "pending" && d.data().date < today
  );
  await Promise.all(
    stale.map((d) =>
      updateDoc(doc(db, "tasks", d.id), {
        status: "delayed",
        updatedAt: serverTimestamp(),
      })
    )
  );
}
