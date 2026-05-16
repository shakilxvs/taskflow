"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
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

  // Load businesses when user logs in
  useEffect(() => {
    if (!user) {
      setBusinesses([]);
      setSelectedBusiness(null);
      setTasks([]);
      return;
    }
    setLoadingBusinesses(true);
    getBusinesses(user.uid)
      .then((list) => {
        setBusinesses(list);
        if (list.length > 0) setSelectedBusiness(list[0]);
      })
      .finally(() => setLoadingBusinesses(false));

    // Auto-mark delayed tasks on login
    autoMarkDelayed(user.uid);
  }, [user]);

  // Load tasks when selected business changes
  const refreshTasks = useCallback(async () => {
    if (!user || !selectedBusiness) return;
    setLoadingTasks(true);
    const list = await getTasksByBusiness(user.uid, selectedBusiness.id);
    setTasks(list);
    setLoadingTasks(false);
  }, [user, selectedBusiness]);

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

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
      .then((list) => {
        setBusinesses(list);
      })
      .catch((err) => {
        console.error("Failed to refresh businesses:", err);
      });
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
