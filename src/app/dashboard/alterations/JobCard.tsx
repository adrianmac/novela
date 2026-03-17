import { CalendarClock, CalendarDays, CircleUserRound } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface JobCardProps {
  job: any;
  onClick: () => void;
}

export default function JobCard({ job, onClick }: JobCardProps) {
  const eventDate = new Date(job.event.date);
  const daysUntilEvent = differenceInDays(eventDate, new Date());

  let badgeColor = 'bg-green-100 text-green-800';
  if (daysUntilEvent < 14) {
    badgeColor = 'bg-red-100 text-red-800';
  } else if (daysUntilEvent <= 30) {
    badgeColor = 'bg-amber-100 text-amber-800';
  }

  return (
    <div
      onClick={onClick}
      className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer text-left w-full touch-manipulation h-auto min-h-[140px]"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900 truncate pr-2">
          {job.client.firstName} {job.client.lastName}
        </h3>
        <span className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${badgeColor}`}>
          {daysUntilEvent} days
        </span>
      </div>

      <div className="flex items-center text-xs text-gray-500 mb-3 gap-1">
        <CalendarDays className="w-3.5 h-3.5" />
        <span>{format(eventDate, 'MMM d, yyyy')}</span>
      </div>

      <p className="text-sm text-gray-700 mb-3 line-clamp-2 leading-relaxed">
        {job.garmentDescription}
      </p>

      {job.items && job.items.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {job.items.slice(0, 3).map((item: any) => (
            <span
              key={item.id}
              className="text-[10px] font-medium px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md border border-rose-100 uppercase tracking-wider"
            >
              {item.taskName}
            </span>
          ))}
          {job.items.length > 3 && (
            <span className="text-[10px] font-medium px-2 py-0.5 bg-gray-50 text-gray-600 rounded-md border border-gray-200 uppercase tracking-wider">
              +{job.items.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <CircleUserRound className="w-4 h-4 text-gray-400" />
          <span className="truncate max-w-[100px]">{job.seamstressName || 'Unassigned'}</span>
        </div>

        {job.fittings && job.fittings.length > 0 && (
          <div className="flex items-center gap-1 text-xs font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded-md">
            <CalendarClock className="w-3.5 h-3.5" />
            <span>{format(new Date(job.fittings[0].date), 'MMM d')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
