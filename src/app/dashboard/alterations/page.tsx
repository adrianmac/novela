import { getAlterations } from './actions';
import AlterationsClient from './AlterationsClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Alterations Queue | Novedades Isabel',
};

export default async function AlterationsPage() {
  const jobs = await getAlterations();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <AlterationsClient initialJobs={jobs} />
    </div>
  );
}
