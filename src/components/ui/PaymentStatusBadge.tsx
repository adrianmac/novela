import { cn } from "@/lib/utils";

interface PaymentStatusBadgeProps {
  status: 'pending' | 'invoiced' | 'overdue' | 'paid' | 'refunded' | string;
  className?: string;
}

export function PaymentStatusBadge({ status, className }: PaymentStatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();

  let styles = "bg-gray-100 text-gray-800"; // default
  let label = status;

  if (normalizedStatus === 'pending') {
    styles = "bg-gray-100 text-gray-600";
    label = "Upcoming";
  } else if (normalizedStatus === 'invoiced') {
    styles = "bg-blue-100 text-blue-700";
    label = "Invoice sent";
  } else if (normalizedStatus === 'overdue') {
    styles = "bg-red-100 text-red-700 font-bold";
    label = "Overdue";
  } else if (normalizedStatus === 'paid') {
    styles = "bg-green-100 text-green-700";
    label = "Paid";
  } else if (normalizedStatus === 'refunded') {
    styles = "bg-amber-100 text-amber-700";
    label = "Refunded";
  } else {
    // Capitalize first letter
    label = label.charAt(0).toUpperCase() + label.slice(1);
  }

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border border-current border-opacity-10 shadow-sm", styles, className)}>
      <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5",
        normalizedStatus === 'pending' ? 'bg-gray-400' :
        normalizedStatus === 'invoiced' ? 'bg-blue-500 animate-pulse' :
        normalizedStatus === 'overdue' ? 'bg-red-500 animate-ping' :
        normalizedStatus === 'paid' ? 'bg-green-500' :
        normalizedStatus === 'refunded' ? 'bg-amber-500' : 'bg-gray-400'
      )} />
      {label}
    </span>
  );
}
