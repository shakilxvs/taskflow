// Returns "YYYY-MM-DD" for a given Date object
export function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Returns today as "YYYY-MM-DD"
export function today() {
  return toDateString(new Date());
}

// Returns all days in a given month as Date objects
export function getDaysInMonth(year, month) {
  const days = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

// Returns the weekday index (0=Sun) of the first day of month
export function firstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

// Format "YYYY-MM-DD" → "Mon, Jan 1"
export function formatDateLabel(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// Format "YYYY-MM-DD" → "Wednesday, May 28"
export function formatDateFull(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

// Returns true if date string is before today
export function isPast(dateStr) {
  return dateStr < today();
}

// Month name from index
export function monthName(monthIndex) {
  return new Date(2000, monthIndex, 1).toLocaleString("en-US", { month: "long" });
}

// Group tasks by date string
export function groupByDate(tasks) {
  return tasks.reduce((acc, task) => {
    if (!acc[task.date]) acc[task.date] = [];
    acc[task.date].push(task);
    return acc;
  }, {});
}
