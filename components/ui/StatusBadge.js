import { Clock, CheckCircle2, AlertCircle } from "lucide-react";

const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    label: "Pending",
    className: "text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800",
  },
  done: {
    icon: CheckCircle2,
    label: "Done",
    className: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950",
  },
  delayed: {
    icon: AlertCircle,
    label: "Delayed",
    className: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950",
  },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      <Icon size={11} />
      {config.label}
    </span>
  );
}
