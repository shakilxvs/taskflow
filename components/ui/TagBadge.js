import { TAG_COLORS } from "@/lib/constants";

export default function TagBadge({ tag, size = "sm" }) {
  const colors = TAG_COLORS[tag] || TAG_COLORS["General"];
  const sizeClass = size === "xs" ? "text-xs px-2 py-0.5" : "text-xs px-2.5 py-1";

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${sizeClass} ${colors.bg} ${colors.text}`}>
      {tag}
    </span>
  );
}
