import ScheduleClient from './ScheduleClient';
import { getScheduleData } from './actions';

export const dynamic = 'force-dynamic';

export default async function SchedulePage() {
  const data = await getScheduleData();
  return <ScheduleClient initialData={data} />;
}
