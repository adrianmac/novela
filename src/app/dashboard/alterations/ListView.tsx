import { format, differenceInDays } from 'date-fns';

interface ListViewProps {
  jobs: any[];
  onJobClick: (job: any) => void;
}

export default function ListView({ jobs, onJobClick }: ListViewProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
            <tr>
              <th className="px-6 py-4">Client</th>
              <th className="px-6 py-4">Event Date</th>
              <th className="px-6 py-4">Garment</th>
              <th className="px-6 py-4">Seamstress</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Due In</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {jobs.map((job) => {
              const eventDate = new Date(job.event.date);
              const daysUntilEvent = differenceInDays(eventDate, new Date());
              let badgeColor = 'bg-green-100 text-green-800';
              if (daysUntilEvent < 14) {
                badgeColor = 'bg-red-100 text-red-800';
              } else if (daysUntilEvent <= 30) {
                badgeColor = 'bg-amber-100 text-amber-800';
              }

              return (
                <tr
                  key={job.id}
                  onClick={() => onJobClick(job)}
                  className="hover:bg-rose-50/50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {job.client.firstName} {job.client.lastName}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {format(eventDate, 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                    {job.garmentDescription}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {job.seamstressName || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                      {job.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeColor}`}>
                      {daysUntilEvent} days
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
