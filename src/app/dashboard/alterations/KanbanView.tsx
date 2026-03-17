import { useState, useMemo } from 'react';
import JobCard from './JobCard';

interface KanbanViewProps {
  jobs: any[];
  onJobClick: (job: any) => void;
  onStatusChange: (jobId: string, newStatus: string) => void;
}

const COLUMNS = [
  { id: 'measurement_needed', title: 'Measurement Needed', color: 'bg-blue-50 border-blue-200 text-blue-900', border: 'border-blue-400' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-amber-50 border-amber-200 text-amber-900', border: 'border-amber-400' },
  { id: 'fitting_scheduled', title: 'Fitting Scheduled', color: 'bg-purple-50 border-purple-200 text-purple-900', border: 'border-purple-400' },
  { id: 'complete', title: 'Complete', color: 'bg-green-50 border-green-200 text-green-900', border: 'border-green-400' },
];

export default function KanbanView({ jobs, onJobClick, onStatusChange }: KanbanViewProps) {
  const [draggedJobId, setDraggedJobId] = useState<string | null>(null);

  const columnsWithJobs = useMemo(() => {
    return COLUMNS.map(col => ({
      ...col,
      jobs: jobs.filter(job => job.status === col.id),
    }));
  }, [jobs]);

  const handleDragStart = (e: React.DragEvent, jobId: string) => {
    setDraggedJobId(jobId);
    e.dataTransfer.effectAllowed = 'move';
    // Firefox requires data to be set
    e.dataTransfer.setData('text/plain', jobId);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (draggedJobId) {
      const job = jobs.find(j => j.id === draggedJobId);
      if (job && job.status !== columnId) {
        onStatusChange(draggedJobId, columnId);
      }
    }
    setDraggedJobId(null);
  };

  return (
    <div className="flex gap-6 overflow-x-auto pb-6 h-[calc(100vh-200px)] min-h-[600px]">
      {columnsWithJobs.map((column) => (
        <div
          key={column.id}
          className={`flex-shrink-0 w-80 rounded-xl bg-gray-50/50 border border-gray-100 flex flex-col h-full`}
          onDragOver={(e) => handleDragOver(e, column.id)}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          <div className={`p-4 border-b-2 rounded-t-xl font-medium flex justify-between items-center ${column.color} ${column.border}`}>
            <span>{column.title}</span>
            <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs font-bold">
              {column.jobs.length}
            </span>
          </div>

          <div className="p-3 flex-1 overflow-y-auto space-y-3">
            {column.jobs.map((job) => (
              <div
                key={job.id}
                draggable
                onDragStart={(e) => handleDragStart(e, job.id)}
                className={`cursor-grab active:cursor-grabbing transition-transform ${draggedJobId === job.id ? 'opacity-50 scale-95' : 'hover:scale-[1.02]'}`}
              >
                <JobCard job={job} onClick={() => onJobClick(job)} />
              </div>
            ))}
            {column.jobs.length === 0 && (
              <div className="h-24 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-sm text-gray-400">
                Drop here
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
