"use client";

import { useState, useMemo } from "react";
import {
  ListFilter,
  ArrowUpDown,
  Clock,
  CheckCircle2,
  TimerOff,
  Circle,
  ClipboardList,
  Calendar,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatDateLabel } from "@/lib/dates";
import TagBadge from "@/components/ui/TagBadge";

const FILTERS = ["All", "Pending", "Done", "Delayed"];

function TaskRow({ task, onClickDate }) {
  const isDone = task.status === "done";
  const isDelayed = task.status === "delayed";

  const statusIcon = isDone ? (
    <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
  ) : isDelayed ? (
    <TimerOff size={15} className="text-red-400 shrink-0" />
  ) : (
    <Circle size={15} className="text-slate-300 dark:text-slate-600 shrink-0" />
  );

  return (
    <button
      onClick={() => onClickDate(task.date)}
      className="w-full text-left group flex items-start gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
    >
      <div className="mt-0.5">{statusIcon}</div>
      <div className="flex-1 min-w-0">
        <p
          className={`text-xs font-medium leading-snug truncate ${
            isDone
              ? "line-through text-slate-400 dark:text-slate-500"
              : "text-slate-800 dark:text-slate-200"
          }`}
        >
          {task.title}
        </p>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
            <Calendar size={9} />
            {formatDateLabel(task.date)}
          </span>
          {task.time && (
            <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
              <Clock size={9} />
              {task.time}
            </span>
          )}
          <TagBadge tag={task.tag} size="xs" />
          {isDelayed && (
            <span className="text-[10px] text-red-500 font-medium">Delayed</span>
          )}
        </div>
      </div>
    </button>
  );
}

export default function AllTasksList() {
  const { tasks, selectDate } = useApp();
  const [filter, setFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");

  const filtered = useMemo(() => {
    let list = [...tasks];

    // Status filter
    if (filter !== "All") {
      list = list.filter((t) => t.status === filter.toLowerCase());
    }

    // Sort by date
    list.sort((a, b) => {
      if (a.date === b.date) return (a.time || "") > (b.time || "") ? 1 : -1;
      return a.date > b.date ? 1 : -1;
    });
    if (sortOrder === "newest") list.reverse();

    // Delayed always at top (within their sort group)
    const delayed = list.filter((t) => t.status === "delayed");
    const rest = list.filter((t) => t.status !== "delayed");
    return filter === "All" ? [...delayed, ...rest] : list;
  }, [tasks, filter, sortOrder]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ListFilter size={14} className="text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              All Tasks
            </span>
          </div>
          <button
            onClick={() => setSortOrder((s) => (s === "newest" ? "oldest" : "newest"))}
            className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors font-medium"
            title={sortOrder === "newest" ? "Showing newest first" : "Showing oldest first"}
          >
            <ArrowUpDown size={11} />
            {sortOrder === "newest" ? "Newest" : "Oldest"}
          </button>
        </div>

        {/* Filter pills */}
        <div className="flex gap-1 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all ${
                filter === f
                  ? "bg-violet-600 text-white"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Task count */}
      <div className="px-4 py-2 shrink-0">
        <p className="text-[10px] text-slate-400 dark:text-slate-500">
          {filtered.length} task{filtered.length !== 1 ? "s" : ""}
          {filter !== "All" ? ` · ${filter.toLowerCase()}` : ""}
        </p>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center px-4">
            <ClipboardList size={28} className="text-slate-200 dark:text-slate-700 mb-2" />
            <p className="text-xs text-slate-400 dark:text-slate-500">
              {filter === "All" ? "No tasks yet" : `No ${filter.toLowerCase()} tasks`}
            </p>
          </div>
        ) : (
          filtered.map((task) => (
            <TaskRow key={task.id} task={task} onClickDate={selectDate} />
          ))
        )}
      </div>
    </div>
  );
}
