import { cn } from "@/lib/utils";

export interface Milestone {
  amount: number;
  status: 'pending' | 'invoiced' | 'overdue' | 'paid' | 'refunded' | string;
}

interface PaymentProgressProps {
  totalAmount: number;
  paidAmount: number;
  milestones?: Milestone[];
  className?: string;
}

export function PaymentProgress({ totalAmount, paidAmount, milestones = [], className }: PaymentProgressProps) {
  const percentPaid = totalAmount > 0 ? Math.min(100, Math.round((paidAmount / totalAmount) * 100)) : 0;
  const remainingAmount = Math.max(0, totalAmount - paidAmount);

  const hasOverdue = milestones.some(m => m.status === 'overdue');

  return (
    <div className={cn("space-y-2 w-full", className)}>
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium text-green-700">{percentPaid}% paid</span>
        <span className="text-gray-400">·</span>
        <span className={cn("font-medium", hasOverdue ? "text-red-600" : "text-gray-600")}>
          ${(remainingAmount / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} remaining
        </span>
      </div>

      <div className="relative h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-green-500 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${percentPaid}%` }}
        />

        {/* Milestone markers */}
        {milestones.length > 0 && totalAmount > 0 && (() => {
          let accumulatedAmount = 0;
          return milestones.map((milestone, idx) => {
            accumulatedAmount += milestone.amount;
            const markerPercent = Math.min(100, (accumulatedAmount / totalAmount) * 100);

            // Determine dot color
            let dotColor = "bg-gray-300";
            if (milestone.status === 'paid') dotColor = "bg-green-600 shadow-sm shadow-green-200";
            else if (milestone.status === 'overdue') dotColor = "bg-red-500 shadow-sm shadow-red-200";
            else if (milestone.status === 'invoiced') dotColor = "bg-blue-400";

            // Only render dot if it's not the very end (100%), or maybe we do want it at the end.
            // Let's render it anyway, but it might be slightly clipped if it's exactly at 100%.

            return (
              <div
                key={idx}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-white z-10",
                  dotColor
                )}
                style={{ left: `calc(${markerPercent}% - 4px)` }}
                title={`Milestone: ${(milestone.amount / 100).toFixed(2)} - ${milestone.status}`}
              />
            );
          });
        })()}
      </div>
    </div>
  );
}
