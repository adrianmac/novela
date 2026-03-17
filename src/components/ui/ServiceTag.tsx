import { cn } from "@/lib/utils";

interface ServiceTagProps {
  service: string;
  className?: string;
}

export function ServiceTag({ service, className }: ServiceTagProps) {
  const normalizedService = service.toLowerCase();

  let styles = "bg-gray-100 text-gray-800"; // default
  let label = service.replace('_', ' ');

  if (normalizedService === 'dress_rental') {
    styles = "bg-green-100 text-green-800";
    label = "Dress rental";
  } else if (normalizedService === 'alterations') {
    styles = "bg-blue-100 text-blue-800";
    label = "Alterations";
  } else if (normalizedService === 'planning' || normalizedService === 'event_planning') {
    styles = "bg-purple-100 text-purple-800";
    label = "Event planning";
  } else if (normalizedService === 'decoration') {
    styles = "bg-amber-100 text-amber-800";
    label = "Decoration";
  } else {
    // Capitalize first letter
    label = label.charAt(0).toUpperCase() + label.slice(1);
  }

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border border-current border-opacity-20", styles, className)}>
      {label}
    </span>
  );
}
