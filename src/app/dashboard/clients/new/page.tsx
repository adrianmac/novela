import IntakeForm from './IntakeForm';
import { getAvailableStaff } from './actions';

export const dynamic = 'force-dynamic';

export default async function NewClientPage() {
  const staff = await getAvailableStaff();

  return (
    <div className="max-w-3xl mx-auto py-8">
      <IntakeForm availableStaff={staff} />
    </div>
  );
}
