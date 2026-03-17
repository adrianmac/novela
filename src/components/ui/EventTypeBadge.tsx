import { cn } from "@/lib/utils";

interface EventTypeBadgeProps {
  type: string;
  className?: string;
}

export function EventTypeBadge({ type, className }: EventTypeBadgeProps) {
  const normalizedType = type.toLowerCase();

  let styles = "bg-gray-100 text-gray-800"; // default
  let label = type;

  if (normalizedType === 'wedding') {
    styles = "bg-pink-100 text-pink-800";
    label = "Wedding";
  } else if (normalizedType === 'quinceanera' || normalizedType === 'quinceañera') {
    styles = "bg-purple-100 text-purple-800";
    label = "Quinceañera";
  } else if (normalizedType === 'prom') {
     styles = "bg-blue-100 text-blue-800";
     label = "Prom";
  } else if (normalizedType === 'gala') {
     styles = "bg-emerald-100 text-emerald-800";
     label = "Gala";
  } else {
    // Capitalize first letter
    label = label.charAt(0).toUpperCase() + label.slice(1);
  }

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", styles, className)}>
      {label}
    </span>
  );
}
