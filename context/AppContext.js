"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";
import {
  getBusinesses,
  getTasksByBusiness,
  autoMarkDelayed,
} from "@/lib/firestore";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { user } = useAuth();

  const [businesses, setBusinesses] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingBusinesses, setLoadingBusinesses] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [addBusinessOpen, setAddBusinessOpen] = useState(false);

  // Track the selected business id so we can skip re-fetches for the same biz
  const selectedBusinessRef = useRef(null);

  // Load businesses when user logs in — and immediately start loading tasks
  // for the first business in the same chain (cuts one serial round trip)
  useEffect(() => {
    if (!user) {
      setBusinesses([]);
      setSelectedBusiness(null);
      setTasks([]);
      selectedBusinessRef.current = null;
      return;
    }

    setLoadingBusinesses(true);
    setLoadingTasks(true);

    getBusinesses(user.uid)
      .then(async (list) => {
        setBusinesses(list);
        setLoadingBusinesses(false);

        if (list.length === 0) {
          setLoadingTasks(false);
          return;
        }

        const first = list[0];
        setSelectedBusiness(first);
        selectedBusinessRef.current = first.id;

        // Load tasks for first business in the same promise chain —
        // no extra useEffect round trip needed
        try {
          const taskList = await getTasksByBusiness(user.uid, first.id);
          setTasks(taskList);
        } catch (err) {
          console.error("Failed to load initial tasks:", err);
        } finally {
          setLoadingTasks(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load businesses:", err);
        setLoadingBusinesses(false);
        setLoadingTasks(false);
      });

    // Run autoMarkDelayed off the critical path — after UI is ready
    // so it never blocks the initial render
    const delayTimer = setTimeout(() => {
      autoMarkDelayed(user.uid).catch(() => {});
    }, 3000);

    return () => clearTimeout(delayTimer);
  }, [user]);

  // Only re-fetch tasks when the selected business actually changes to a different one
  const refreshTasks = useCallback(async () => {
    if (!user || !selectedBusiness) return;
    setLoadingTasks(true);
    try {
      const list = await getTasksByBusiness(user.uid, selectedBusiness.id);
      setTasks(list);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoadingTasks(false);
    }
  }, [user, selectedBusiness]);

  // Only fires when user deliberately switches to a DIFFERENT business
  useEffect(() => {
    if (!selectedBusiness) return;
    // Skip if this is the same business already loaded on login
    if (selectedBusinessRef.current === selectedBusiness.id) return;
    selectedBusinessRef.current = selectedBusiness.id;
    refreshTasks();
  }, [selectedBusiness, refreshTasks]);

  function selectDate(dateStr) {
    setSelectedDate(dateStr);
    setPanelOpen(true);
  }

  function closePanel() {
    setPanelOpen(false);
    setTimeout(() => setSelectedDate(null), 300);
  }

  function refreshBusinesses() {
    if (!user) return;
    getBusinesses(user.uid)
      .then((list) => setBusinesses(list))
      .catch((err) => console.error("Failed to refresh businesses:", err));
  }

  const tasksForDate = selectedDate
    ? tasks.filter((t) => t.date === selectedDate)
    : [];

  return (
    <AppContext.Provider
      value={{
        businesses,
        setBusinesses,
        selectedBusiness,
        setSelectedBusiness,
        tasks,
        tasksForDate,
        selectedDate,
        panelOpen,
        sidebarOpen,
        setSidebarOpen,
        loadingBusinesses,
        loadingTasks,
        selectDate,
        closePanel,
        refreshTasks,
        refreshBusinesses,
        addBusinessOpen,
        setAddBusinessOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}
