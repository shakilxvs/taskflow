"use client";

import { useApp } from "@/context/AppContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import BusinessHeader from "@/components/business/BusinessHeader";
import EmptyBusinessState from "@/components/business/EmptyBusinessState";
import Calendar from "@/components/calendar/Calendar";
import DayPanel from "@/components/tasks/DayPanel";
import Spinner from "@/components/ui/Spinner";

export default function DashboardPage() {
  const { selectedBusiness, loadingBusinesses, loadingTasks } = useApp();

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header */}
        <Header />

        <main className="flex-1 overflow-y-auto">
          {loadingBusinesses ? (
            <div className="flex items-center justify-center h-full">
              <Spinner size="lg" />
            </div>
          ) : !selectedBusiness ? (
            <EmptyBusinessState />
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6 lg:py-8">
              {/* Business name + stats */}
              <BusinessHeader />

              {/* Calendar */}
              <div className="card p-5">
                {loadingTasks ? (
                  <div className="flex justify-center py-16">
                    <Spinner size="md" />
                  </div>
                ) : (
                  <Calendar />
                )}
              </div>

              {/* Spacer for mobile bottom sheet */}
              <div className="h-6 lg:hidden" />
            </div>
          )}
        </main>
      </div>

      {/* Day panel (right panel on desktop, bottom sheet on mobile) */}
      <DayPanel />
    </div>
  );
}
