import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex h-[50vh] w-full items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      <span className="ml-2 font-medium text-rose-700">Loading dashboard...</span>
    </div>
  );
}
