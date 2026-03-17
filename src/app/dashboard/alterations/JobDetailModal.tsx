import { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, CheckCircle2, Clock, AlertCircle, Plus } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { updateMeasurements, toggleAlterationItem, addAlterationItem } from './actions';

interface JobDetailModalProps {
  job: any;
  onClose: () => void;
  onStatusChange: (jobId: string, newStatus: string) => void;
}

const MEASUREMENT_FIELDS = [
  'Bust', 'Waist', 'Hips', 'Height',
  'Desired dress length', 'Shoulder width', 'Sleeve length'
];

export default function JobDetailModal({ job, onClose, onStatusChange }: JobDetailModalProps) {
  const [measurements, setMeasurements] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');

  useEffect(() => {
    if (job.measurementsJson) {
      try {
        setMeasurements(JSON.parse(job.measurementsJson));
      } catch (e) {
        console.error('Failed to parse measurements', e);
      }
    } else {
      setMeasurements({});
    }
  }, [job]);

  const eventDate = new Date(job.event.date);
  const daysUntilEvent = differenceInDays(eventDate, new Date());

  const handleSaveMeasurements = async () => {
    setIsSaving(true);
    try {
      await updateMeasurements(job.id, JSON.stringify(measurements));
      // Add visual feedback
    } catch (e) {
      alert('Failed to save measurements');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleItem = async (itemId: string, currentStatus: number) => {
    try {
      await toggleAlterationItem(itemId, !currentStatus);
    } catch (e) {
      alert('Failed to toggle item');
    }
  };

  const handleAddItem = async () => {
    if (!newItemName || !newItemPrice) return;
    try {
      await addAlterationItem(
        job.id,
        newItemName,
        '', // Optional description
        Math.round(parseFloat(newItemPrice) * 100) // Convert to cents
      );
      setShowAddItem(false);
      setNewItemName('');
      setNewItemPrice('');
    } catch (e) {
      alert('Failed to add item');
    }
  };

  const totalPrice = job.items ? job.items.reduce((sum: number, item: any) => sum + item.estimatedPrice, 0) : 0;

  const nextStatusLabel: Record<string, { label: string, next: string }> = {
    'measurement_needed': { label: 'Start Alterations', next: 'in_progress' },
    'in_progress': { label: 'Schedule Fitting', next: 'fitting_scheduled' },
    'fitting_scheduled': { label: 'Complete Alterations', next: 'complete' },
    'complete': { label: 'Reopen Job', next: 'in_progress' },
  };

  const handleStatusAdvance = () => {
    const nextInfo = nextStatusLabel[job.status];
    if (nextInfo) {
      onStatusChange(job.id, nextInfo.next);
      onClose(); // Optional: close modal on status change
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col relative my-auto">

        {/* Header */}
        <div className="flex-shrink-0 flex items-start justify-between p-6 border-b border-rose-100 bg-rose-50/30 rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-display font-bold text-rose-950">
              {job.client.firstName} {job.client.lastName}
            </h2>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-rose-700/80">
              <span className="flex items-center gap-1.5 font-medium bg-rose-100/50 px-2.5 py-1 rounded-md text-rose-800">
                <Calendar className="w-4 h-4" />
                Event: {format(eventDate, 'MMM d, yyyy')}
              </span>
              <span className={`font-semibold ${daysUntilEvent < 14 ? 'text-red-600' : 'text-amber-600'}`}>
                {daysUntilEvent} days remaining
              </span>
            </div>
            <p className="mt-4 font-medium text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100 flex flex-col gap-1">
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Garment</span>
              {job.garmentDescription}
              {job.inventory && (
                <span className="text-xs text-rose-600 font-semibold">SKU: {job.inventory.sku}</span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-rose-400 hover:text-rose-900 hover:bg-rose-100 rounded-full transition-colors h-13 sm:h-11 w-13 sm:w-11 flex items-center justify-center touch-manipulation"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-gray-50/30">

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Left Column: Measurements */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg text-gray-900">Measurements (inches)</h3>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                {MEASUREMENT_FIELDS.map(field => (
                  <div key={field}>
                    <label className="block text-xs font-medium text-gray-500 mb-1">{field}</label>
                    <input
                      type="number"
                      step="0.1"
                      value={measurements[field] || ''}
                      onChange={(e) => setMeasurements({...measurements, [field]: e.target.value})}
                      className="w-full h-13 sm:h-11 rounded-lg border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 touch-manipulation"
                      placeholder="--"
                    />
                  </div>
                ))}
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Notes</label>
                  <textarea
                    value={measurements['Notes'] || ''}
                    onChange={(e) => setMeasurements({...measurements, ['Notes']: e.target.value})}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-rose-500 focus:ring-rose-500 min-h-[80px]"
                    placeholder="Any specific fit requests..."
                  />
                </div>
              </div>
              <button
                onClick={handleSaveMeasurements}
                disabled={isSaving}
                className="w-full bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg font-medium h-13 sm:h-11 touch-manipulation disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Record Measurements'}
              </button>
            </div>

            {/* Right Column: Work Items & Fittings */}
            <div className="space-y-6">

              {/* Work Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg text-gray-900">Work Items</h3>
                  <span className="font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded-full text-sm">
                    Est. Total: ${(totalPrice / 100).toFixed(2)}
                  </span>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <ul className="divide-y divide-gray-100">
                    {job.items?.map((item: any) => (
                      <li key={item.id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors flex items-start gap-3">
                        <button
                          onClick={() => handleToggleItem(item.id, item.isCompleted)}
                          className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded border flex items-center justify-center transition-colors touch-manipulation ${
                            item.isCompleted ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 bg-white'
                          }`}
                        >
                          {item.isCompleted ? <CheckCircle2 className="w-4 h-4" /> : null}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium text-sm ${item.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                            {item.taskName}
                          </p>
                          {item.description && (
                            <p className="text-xs text-gray-500 truncate mt-0.5">{item.description}</p>
                          )}
                        </div>
                        <div className="text-sm font-medium text-gray-700 flex-shrink-0">
                          ${(item.estimatedPrice / 100).toFixed(2)}
                        </div>
                      </li>
                    ))}

                    {/* Add Item Form */}
                    <li className="p-3 sm:p-4 bg-gray-50/50">
                      {showAddItem ? (
                        <div className="flex flex-col gap-2">
                          <input
                            type="text"
                            placeholder="Task (e.g. Hem, Take in)"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            className="w-full h-11 rounded-md border-gray-300 text-sm focus:ring-rose-500 focus:border-rose-500"
                          />
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <DollarSign className="h-4 w-4 text-gray-400" />
                              </div>
                              <input
                                type="number"
                                placeholder="Price"
                                value={newItemPrice}
                                onChange={(e) => setNewItemPrice(e.target.value)}
                                className="w-full h-11 pl-9 rounded-md border-gray-300 text-sm focus:ring-rose-500 focus:border-rose-500"
                              />
                            </div>
                            <button
                              onClick={handleAddItem}
                              className="bg-rose-600 hover:bg-rose-700 text-white px-4 rounded-md text-sm font-medium h-11 touch-manipulation"
                            >
                              Add
                            </button>
                            <button
                              onClick={() => setShowAddItem(false)}
                              className="text-gray-500 hover:bg-gray-200 px-3 rounded-md h-11 touch-manipulation"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowAddItem(true)}
                          className="flex items-center gap-2 text-sm font-medium text-rose-600 hover:text-rose-800 touch-manipulation py-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add custom item
                        </button>
                      )}
                    </li>
                  </ul>
                </div>
              </div>

              {/* Fittings */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-gray-900">Fittings</h3>
                {job.fittings && job.fittings.length > 0 ? (
                  <div className="space-y-2">
                    {job.fittings.map((fitting: any) => (
                      <div key={fitting.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
                        <div className="flex items-center gap-3">
                          <div className="bg-purple-100 p-2 rounded-md text-purple-700">
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-purple-900">
                              {format(new Date(fitting.date), 'MMMM d, yyyy')}
                            </p>
                            <p className="text-xs text-purple-700">
                              {format(new Date(fitting.date), 'h:mm a')} &middot; {fitting.status}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center flex flex-col items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-gray-400" />
                    <p className="text-sm text-gray-500">No fittings scheduled yet.</p>
                  </div>
                )}
                <button className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium h-13 sm:h-11 touch-manipulation">
                  Schedule New Fitting
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 p-4 sm:p-6 border-t border-gray-200 bg-white rounded-b-2xl flex flex-col sm:flex-row gap-3 justify-end items-center">
          <div className="mr-auto text-sm text-gray-500 flex items-center gap-2">
            Status: <span className="font-semibold text-gray-900 capitalize bg-gray-100 px-2 py-0.5 rounded-md">{job.status.replace('_', ' ')}</span>
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors h-13 sm:h-11 touch-manipulation"
          >
            Close
          </button>
          {nextStatusLabel[job.status] && (
            <button
              onClick={handleStatusAdvance}
              className="w-full sm:w-auto px-6 py-2 rounded-lg font-medium text-white bg-rose-600 hover:bg-rose-700 transition-colors h-13 sm:h-11 touch-manipulation shadow-sm flex items-center justify-center gap-2"
            >
              {nextStatusLabel[job.status].label}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
