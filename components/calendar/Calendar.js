"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useApp } from "@/context/AppContext";
import {
  getDaysInMonth,
  firstDayOfMonth,
  toDateString,
  today,
  monthName,
} from "@/lib/dates";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function TaskDots({ tasks }) {
  if (!tasks || tasks.length === 0) return null;

  const hasDone = tasks.some((t) => t.status === "done");
  const hasDelayed = tasks.some((t) => t.status === "delayed");
  const hasPending = tasks.some((t) => t.status === "pending");

  return (
    <div className="flex gap-0.5 justify-center mt-auto pb-0.5">
      {hasPending && (
        <span className="w-1 h-1 rounded-full bg-violet-500 shrink-0" />
      )}
      {hasDone && (
        <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
      )}
      {hasDelayed && (
        <span className="w-1 h-1 rounded-full bg-red-500 shrink-0" />
      )}
    </div>
  );
}

export default function Calendar() {
  const { tasks, selectedDate, selectDate, loadingTasks } = useApp();
  const todayStr = today();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const days = useMemo(() => getDaysInMonth(year, month), [year, month]);
  const firstDay = useMemo(() => firstDayOfMonth(year, month), [year, month]);

  // Group tasks by date for dot display
  const tasksByDate = useMemo(() => {
    return tasks.reduce((acc, task) => {
      if (!acc[task.date]) acc[task.date] = [];
      acc[task.date].push(task);
      return acc;
    }, {});
  }, [tasks]);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  }

  function goToday() {
    setYear(now.getFullYear());
    setMonth(now.getMonth());
  }

  return (
    <div className="flex flex-col h-full">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {monthName(month)}{" "}
            <span className="text-slate-400 dark:text-slate-500 font-normal">
              {year}
            </span>
          </h2>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={goToday}
            className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            Today
          </button>
          <button onClick={prevMonth} className="btn-ghost p-1.5">
            <ChevronLeft size={18} />
          </button>
          <button onClick={nextMonth} className="btn-ghost p-1.5">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="text-center text-xs font-semibold text-slate-400 dark:text-slate-500 py-1"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-1 flex-1">
        {/* Empty cells for offset */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {days.map((day, idx) => {
          const dateStr = toDateString(day);
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedDate;
          const dayTasks = tasksByDate[dateStr];
          const hasDelayed = dayTasks?.some((t) => t.status === "delayed");

          return (
            <motion.button
              key={dateStr}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.005, duration: 0.15 }}
              onClick={() => selectDate(dateStr)}
              className={`
                cal-day
                ${isToday ? "today" : ""}
                ${isSelected && !isToday ? "ring-2 ring-violet-500 ring-offset-1 dark:ring-offset-slate-950 bg-violet-50 dark:bg-violet-950" : ""}
                ${!isToday && !isSelected ? "hover:bg-slate-100 dark:hover:bg-slate-800" : ""}
                ${hasDelayed && !isToday ? "border border-red-200 dark:border-red-900" : ""}
              `}
            >
              <span className={`text-xs font-semibold leading-none ${isToday ? "text-white" : isSelected ? "text-violet-700 dark:text-violet-300" : "text-slate-700 dark:text-slate-300"}`}>
                {day.getDate()}
              </span>
              {!isToday && <TaskDots tasks={dayTasks} />}
              {isToday && dayTasks?.length > 0 && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/70" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 px-1 pb-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <span className="w-2 h-2 rounded-full bg-violet-500" />
          Pending
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Done
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <span className="w-2 h-2 rounded-full bg-red-500" />
          Delayed
        </div>
      </div>
    </div>
  );
}
