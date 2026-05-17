export const TAGS = [
  "General",
  "Important",
  "Invoice",
  "Meeting",
  "Follow-up",
  "Delivery",
  "Design",
  "Marketing",
  "Urgent",
  "Personal",
];

export const TAG_COLORS = {
  General:    { bg: "bg-slate-100 dark:bg-slate-700",   text: "text-slate-600 dark:text-slate-300" },
  Important:  { bg: "bg-violet-100 dark:bg-violet-900", text: "text-violet-700 dark:text-violet-300" },
  Invoice:    { bg: "bg-emerald-100 dark:bg-emerald-900", text: "text-emerald-700 dark:text-emerald-300" },
  Meeting:    { bg: "bg-blue-100 dark:bg-blue-900",     text: "text-blue-700 dark:text-blue-300" },
  "Follow-up":{ bg: "bg-amber-100 dark:bg-amber-900",   text: "text-amber-700 dark:text-amber-300" },
  Delivery:   { bg: "bg-orange-100 dark:bg-orange-900", text: "text-orange-700 dark:text-orange-300" },
  Design:     { bg: "bg-pink-100 dark:bg-pink-900",     text: "text-pink-700 dark:text-pink-300" },
  Marketing:  { bg: "bg-cyan-100 dark:bg-cyan-900",     text: "text-cyan-700 dark:text-cyan-300" },
  Urgent:     { bg: "bg-red-100 dark:bg-red-900",       text: "text-red-700 dark:text-red-300" },
  Personal:   { bg: "bg-teal-100 dark:bg-teal-900",     text: "text-teal-700 dark:text-teal-300" },
};

export const STATUS_STYLES = {
  pending:  { bg: "bg-slate-50 dark:bg-slate-800",   border: "border-slate-200 dark:border-slate-700" },
  done:     { bg: "bg-emerald-50 dark:bg-emerald-950", border: "border-emerald-200 dark:border-emerald-800" },
  delayed:  { bg: "bg-red-50 dark:bg-red-950",        border: "border-red-200 dark:border-red-800" },
};

export const BUSINESS_COLORS = [
  "#7C3AED", // violet
  "#2563EB", // blue
  "#059669", // emerald
  "#DC2626", // red
  "#D97706", // amber
  "#DB2777", // pink
  "#0891B2", // cyan
  "#65A30D", // lime
  "#9333EA", // purple
  "#EA580C", // orange
];

export const TIMEZONES = [
  // Asia
  { label: "Dhaka (GMT+6)",         value: "Asia/Dhaka",          short: "BD" },
  { label: "Kolkata (GMT+5:30)",     value: "Asia/Kolkata",        short: "IN" },
  { label: "Karachi (GMT+5)",        value: "Asia/Karachi",        short: "PK" },
  { label: "Tashkent (GMT+5)",       value: "Asia/Tashkent",       short: "UZ" },
  { label: "Dubai (GMT+4)",          value: "Asia/Dubai",          short: "UAE" },
  { label: "Riyadh (GMT+3)",         value: "Asia/Riyadh",         short: "SA" },
  { label: "Doha (GMT+3)",           value: "Asia/Qatar",          short: "QA" },
  { label: "Istanbul (GMT+3)",       value: "Europe/Istanbul",     short: "TR" },
  { label: "Bangkok (GMT+7)",        value: "Asia/Bangkok",        short: "TH" },
  { label: "Jakarta (GMT+7)",        value: "Asia/Jakarta",        short: "ID" },
  { label: "Singapore (GMT+8)",      value: "Asia/Singapore",      short: "SG" },
  { label: "Kuala Lumpur (GMT+8)",   value: "Asia/Kuala_Lumpur",   short: "MY" },
  { label: "Hong Kong (GMT+8)",      value: "Asia/Hong_Kong",      short: "HK" },
  { label: "Shanghai (GMT+8)",       value: "Asia/Shanghai",       short: "CN" },
  { label: "Tokyo (GMT+9)",          value: "Asia/Tokyo",          short: "JP" },
  { label: "Seoul (GMT+9)",          value: "Asia/Seoul",          short: "KR" },
  // Oceania
  { label: "Sydney (GMT+10/+11)",    value: "Australia/Sydney",    short: "AU" },
  { label: "Melbourne (GMT+10/+11)", value: "Australia/Melbourne", short: "AU" },
  // Africa & Middle East
  { label: "Cairo (GMT+3)",          value: "Africa/Cairo",        short: "EG" },
  { label: "Lagos (GMT+1)",          value: "Africa/Lagos",        short: "NG" },
  { label: "Nairobi (GMT+3)",        value: "Africa/Nairobi",      short: "KE" },
  // Europe
  { label: "London (GMT+0/+1)",      value: "Europe/London",       short: "UK" },
  { label: "Amsterdam (GMT+1/+2)",   value: "Europe/Amsterdam",    short: "NL" },
  { label: "Paris (GMT+1/+2)",       value: "Europe/Paris",        short: "FR" },
  { label: "Berlin (GMT+1/+2)",      value: "Europe/Berlin",       short: "DE" },
  { label: "Madrid (GMT+1/+2)",      value: "Europe/Madrid",       short: "ES" },
  { label: "Moscow (GMT+3)",         value: "Europe/Moscow",       short: "RU" },
  // Americas
  { label: "New York (GMT-4/-5)",    value: "America/New_York",    short: "NY" },
  { label: "Chicago (GMT-5/-6)",     value: "America/Chicago",     short: "CHI" },
  { label: "Denver (GMT-6/-7)",      value: "America/Denver",      short: "DEN" },
  { label: "Los Angeles (GMT-7/-8)", value: "America/Los_Angeles", short: "LA" },
  { label: "Toronto (GMT-4/-5)",     value: "America/Toronto",     short: "CA" },
  { label: "Vancouver (GMT-7/-8)",   value: "America/Vancouver",   short: "CA" },
  { label: "São Paulo (GMT-3)",      value: "America/Sao_Paulo",   short: "BR" },
  { label: "Mexico City (GMT-6)",    value: "America/Mexico_City", short: "MX" },
  // UTC
  { label: "UTC (GMT+0)",            value: "UTC",                 short: "UTC" },
];

// Returns a short display label like "BD GMT+6" for a given IANA timezone
export function getTimezoneDisplay(ianaTimezone) {
  if (!ianaTimezone) return null;
  const entry = TIMEZONES.find((t) => t.value === ianaTimezone);
  try {
    const offset = new Intl.DateTimeFormat("en", {
      timeZone: ianaTimezone,
      timeZoneName: "shortOffset",
    })
      .formatToParts(new Date())
      .find((p) => p.type === "timeZoneName")?.value || "";
    const short = entry?.short || ianaTimezone.split("/").pop().replace(/_/g, " ");
    return `${short} ${offset}`;
  } catch {
    return entry?.label || ianaTimezone;
  }
}
