'use client';

import { useState } from 'react';
import { KanbanSquare, List, Filter } from 'lucide-react';
import KanbanView from './KanbanView';
import ListView from './ListView';
import JobDetailModal from './JobDetailModal';
import { updateAlterationStatus } from './actions';

export default function AlterationsClient({ initialJobs }: { initialJobs: any[] }) {
  const [view, setView] = useState<'kanban' | 'list'>('kanban');
  const [filter, setFilter] = useState<'all' | 'my'>('all'); // Assuming seamstress views 'my' by default
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  const activeJobsCount = initialJobs.filter(j => j.status !== 'complete').length;

  // Calculate jobs due this week (within next 7 days)
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const dueThisWeekCount = initialJobs.filter(j => {
    if (j.status === 'complete') return false;
    const eventDate = new Date(j.event.date);
    return eventDate >= today && eventDate <= nextWeek;
  }).length;

  // Filter jobs
  const filteredJobs = initialJobs.filter(job => {
    if (filter === 'my') {
      // In a real app, check against logged-in user ID.
      // For now, let's say 'Elena V.' is the current user.
      return job.seamstressName === 'Elena V.';
    }
    return true;
  });

  const handleStatusChange = async (jobId: string, newStatus: string) => {
    try {
      await updateAlterationStatus(jobId, newStatus);
      // Wait for server revalidation or optimistically update local state here
    } catch (error) {
      console.error('Failed to change status', error);
      alert('Failed to update status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-rose-950">Alterations queue</h1>
          <p className="text-rose-700/80 mt-1">
            {activeJobsCount} jobs active &middot; {dueThisWeekCount} due this week
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white rounded-lg p-1 border border-rose-100 flex shadow-sm">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors h-13 sm:h-11 touch-manipulation ${
                filter === 'all'
                  ? 'bg-rose-100 text-rose-900'
                  : 'text-rose-600 hover:text-rose-900 hover:bg-rose-50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('my')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors h-13 sm:h-11 touch-manipulation flex items-center gap-2 ${
                filter === 'my'
                  ? 'bg-rose-100 text-rose-900'
                  : 'text-rose-600 hover:text-rose-900 hover:bg-rose-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              My jobs
            </button>
          </div>

          <div className="bg-white rounded-lg p-1 border border-rose-100 flex shadow-sm">
            <button
              onClick={() => setView('kanban')}
              className={`p-2 rounded-md transition-colors h-13 sm:h-11 w-13 sm:w-11 flex items-center justify-center touch-manipulation ${
                view === 'kanban'
                  ? 'bg-rose-100 text-rose-900'
                  : 'text-rose-400 hover:text-rose-900 hover:bg-rose-50'
              }`}
              title="Kanban View"
            >
              <KanbanSquare className="w-5 h-5" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-md transition-colors h-13 sm:h-11 w-13 sm:w-11 flex items-center justify-center touch-manipulation ${
                view === 'list'
                  ? 'bg-rose-100 text-rose-900'
                  : 'text-rose-400 hover:text-rose-900 hover:bg-rose-50'
              }`}
              title="List View"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {view === 'kanban' ? (
        <KanbanView
          jobs={filteredJobs}
          onJobClick={(job) => setSelectedJob(job)}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <ListView
          jobs={filteredJobs}
          onJobClick={(job) => setSelectedJob(job)}
        />
      )}

      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
