import { cn } from "@/lib/utils";

interface CountdownBadgeProps {
  daysUntil: number;
  className?: string;
}

export function CountdownBadge({ daysUntil, className }: CountdownBadgeProps) {
  let styles = "bg-gray-100 text-gray-800";
  let text = "";

  if (daysUntil < 0) {
    styles = "bg-gray-100 text-gray-600 border border-gray-200";
    text = "Past";
  } else if (daysUntil === 0) {
    styles = "bg-red-100 text-red-800 border border-red-200 animate-pulse shadow-sm shadow-red-200";
    text = "Today!";
  } else if (daysUntil <= 6) {
    styles = "bg-red-100 text-red-700 border border-red-200 shadow-sm shadow-red-100 animate-[pulse_2s_ease-in-out_infinite]";
    text = `${daysUntil} day${daysUntil > 1 ? 's' : ''}`;
  } else if (daysUntil <= 13) {
    styles = "bg-orange-100 text-orange-800 border border-orange-200";
    text = `${daysUntil} days`;
  } else if (daysUntil <= 30) {
    styles = "bg-amber-100 text-amber-800 border border-amber-200";
    text = `${daysUntil} days`;
  } else {
    // > 30 days
    styles = "bg-gray-100 text-gray-700 border border-gray-200";
    text = `${daysUntil} days`;
  }

  return (
    <span className={cn("inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider", styles, className)}>
      {text}
    </span>
  );
}
