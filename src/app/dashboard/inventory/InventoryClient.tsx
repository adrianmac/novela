'use client'

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Search, Filter, Plus, Image as ImageIcon, CheckCircle2, AlertTriangle, Clock, RotateCcw } from 'lucide-react';
import { addInventoryItem, reserveItem, markItemStatus, logReturn, searchEvents } from './actions';

export default function InventoryClient({ initialItems }: { initialItems: any[] }) {
  const [items, setItems] = useState(initialItems);
  const [tab, setTab] = useState('All');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sizeFilter, setSizeFilter] = useState('All');

  // Add Item State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addData, setAddData] = useState({ sku: '', name: '', category: 'Bridal', size: '', description: '', rentalPrice: '', depositAmount: '' });
  const [isAdding, setIsAdding] = useState(false);

  // Reserve State
  const [reserveModalOpen, setReserveModalOpen] = useState<{item: any} | null>(null);
  const [eventSearch, setEventSearch] = useState('');
  const [eventResults, setEventResults] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [reserveDates, setReserveDates] = useState({ pickup: '', return: '' });
  const [isReserving, setIsReserving] = useState(false);
  const [reserveError, setReserveError] = useState('');

  // Return State
  const [returnModalOpen, setReturnModalOpen] = useState<{item: any} | null>(null);
  const [returnData, setReturnData] = useState({ condition: 'Excellent', notes: '', cleaning: true });
  const [isReturning, setIsReturning] = useState(false);

  // Detail
  const [detailModalOpen, setDetailModalOpen] = useState<{item: any} | null>(null);

  const TABS = ['All', 'Bridal', 'Quinceañera', 'Decoration'];
  const STATUSES = ['All', 'Available', 'Reserved', 'Rented', 'Cleaning', 'Overdue'];

  // Extract unique sizes for the filter
  const SIZES = ['All', ...Array.from(new Set(items.map(i => i.size).filter(Boolean)))];

  // Filtering logic
  const filteredItems = items.filter(item => {
    if (tab !== 'All' && item.category.toLowerCase() !== tab.toLowerCase() && !(tab === 'Bridal' && item.category === 'bridal') && !(tab === 'Quinceañera' && item.category === 'quinceanera')) return false;
    if (statusFilter !== 'All' && item.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (sizeFilter !== 'All' && item.size !== sizeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!item.sku.toLowerCase().includes(q) && !item.name.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const handleAddItem = async () => {
    setIsAdding(true);
    const res = await addInventoryItem({
      ...addData,
      category: addData.category.toLowerCase(),
      rentalPrice: Number(addData.rentalPrice),
      depositAmount: Number(addData.depositAmount)
    });
    setIsAdding(false);
    if (res.success) {
      setAddModalOpen(false);
      window.location.reload();
    } else {
      alert(res.error || "Failed to add item");
    }
  };

  useEffect(() => {
    if (reserveModalOpen && eventSearch.length > 2) {
      const delay = setTimeout(() => {
        searchEvents(eventSearch).then(res => setEventResults(res));
      }, 300);
      return () => clearTimeout(delay);
    } else {
      setEventResults([]);
    }
  }, [eventSearch, reserveModalOpen]);

  const handleReserve = async () => {
    if (!selectedEvent || !reserveDates.pickup || !reserveDates.return) {
      setReserveError('Please select an event and set dates.');
      return;
    }
    setIsReserving(true);
    setReserveError('');
    const res = await reserveItem(reserveModalOpen!.item.id, selectedEvent.id, reserveDates.pickup, reserveDates.return);
    setIsReserving(false);
    if (res.success) {
      setReserveModalOpen(null);
      window.location.reload();
    } else {
      setReserveError(res.error || 'Failed to reserve item');
    }
  };

  const selectEventForReservation = (evt: any) => {
    setSelectedEvent(evt);
    // Auto populate dates (pickup = event - 1 day, return = event + 2 days)
    const eDate = new Date(evt.date);
    const pDate = new Date(eDate); pDate.setDate(pDate.getDate() - 1);
    const rDate = new Date(eDate); rDate.setDate(rDate.getDate() + 2);
    setReserveDates({
      pickup: pDate.toISOString().split('T')[0],
      return: rDate.toISOString().split('T')[0]
    });
    setEventSearch('');
  };

  const handleReturn = async () => {
    if (!returnModalOpen?.item?.activeRental) return;
    setIsReturning(true);
    const res = await logReturn(returnModalOpen.item.activeRental.id, returnData.condition, returnData.notes, returnData.cleaning);
    setIsReturning(false);
    if (res.success) {
      setReturnModalOpen(null);
      window.location.reload();
    } else {
      alert("Failed to log return");
    }
  };

  return (
    <div className="space-y-6">

      {/* TABS & ADD BUTTON */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-rose-100 pb-2">
        <div className="flex gap-1 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-hide">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} className={cn(
              "px-4 py-3 text-sm font-bold uppercase tracking-widest whitespace-nowrap border-b-2 transition-colors touch-manipulation",
              tab === t ? "border-rose-600 text-rose-900" : "border-transparent text-rose-800/60 hover:text-rose-800 hover:bg-rose-50"
            )}>
              {t}
            </button>
          ))}
        </div>
        <button onClick={() => setAddModalOpen(true)} className="h-13 sm:h-11 px-5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-sm text-sm uppercase tracking-wider flex items-center gap-2 flex-shrink-0 touch-manipulation w-full sm:w-auto justify-center">
          <Plus className="w-5 h-5 sm:w-4 sm:h-4" /> Add Item
        </button>
      </div>

      {/* FILTER + SEARCH BAR */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-4 sm:top-3 text-rose-300" />
          <input type="text" placeholder="Search by SKU or name..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full h-13 sm:h-11 pl-10 pr-4 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto scrollbar-hide pb-2 sm:pb-0">
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="h-13 sm:h-11 px-4 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white min-w-[150px] text-sm font-semibold text-rose-900">
            {STATUSES.map(s => <option key={s} value={s}>{s} Status</option>)}
          </select>
          <select value={sizeFilter} onChange={e => setSizeFilter(e.target.value)}
            className="h-13 sm:h-11 px-4 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white min-w-[120px] text-sm font-semibold text-rose-900">
            {SIZES.map(s => <option key={s} value={s}>{s === 'All' ? 'All Sizes' : `Size ${s}`}</option>)}
          </select>
        </div>
      </div>

      {/* DRESS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white border border-rose-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col relative">

            {/* Image Area */}
            <div className="h-48 bg-rose-50 flex items-center justify-center relative cursor-pointer" onClick={() => setDetailModalOpen({item})}>
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="w-12 h-12 text-rose-200" />
              )}
              {/* Overlays */}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-black font-mono shadow-sm border border-rose-100">
                {item.sku}
              </div>
              <div className={cn(
                "absolute top-3 right-3 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest shadow-sm border",
                item.status === 'available' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                item.status === 'reserved' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                item.status === 'rented' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                item.status === 'cleaning' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                'bg-red-600 text-white border-red-700 animate-pulse'
              )}>
                {item.status}
              </div>
            </div>

            {/* Info Area */}
            <div className="p-5 flex flex-col flex-1">
              <div className="flex justify-between items-start mb-1 cursor-pointer" onClick={() => setDetailModalOpen({item})}>
                <h3 className="font-serif font-bold text-lg text-rose-950 leading-tight">{item.name}</h3>
              </div>
              <p className="text-sm text-rose-700/80 mb-3 line-clamp-2 min-h-[40px]">{item.description}</p>

              <div className="flex items-center gap-2 mb-4">
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold font-mono">Size {item.size}</span>
                <span className="bg-rose-50 text-rose-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest border border-rose-100">{item.category}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 border-t border-b border-rose-50 py-3">
                <div>
                  <div className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-0.5">Rental</div>
                  <div className="font-mono font-bold text-rose-900">${item.rentalPrice / 100}</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mb-0.5">Deposit</div>
                  <div className="font-mono font-bold text-rose-900">${item.depositAmount / 100}</div>
                </div>
              </div>

              {/* Contextual Status Info */}
              {item.activeRental && (
                <div className="mb-4 text-xs font-semibold">
                  {item.status === 'rented' && (
                    <div className="flex items-center gap-1.5 text-rose-700 bg-rose-50 p-2 rounded border border-rose-100">
                      <Clock className="w-3.5 h-3.5" /> Client: {item.activeRental.clientName} • Returns {new Date(item.activeRental.returnDate).toLocaleDateString()}
                    </div>
                  )}
                  {item.status === 'reserved' && (
                    <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 p-2 rounded border border-amber-100">
                      <Clock className="w-3.5 h-3.5" /> Reserved for {item.activeRental.clientName} • Pickup {new Date(item.activeRental.pickupDate).toLocaleDateString()}
                    </div>
                  )}
                  {item.status === 'overdue' && (
                    <div className="flex items-center gap-1.5 text-red-700 bg-red-50 p-2 rounded border border-red-200">
                      <AlertTriangle className="w-3.5 h-3.5" /> OVERDUE • Returns {new Date(item.activeRental.returnDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="mt-auto pt-2 grid gap-2 grid-cols-1">
                {item.status === 'available' && (
                  <button onClick={() => setReserveModalOpen({item})} className="h-13 sm:h-11 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider touch-manipulation transition-colors shadow-sm">
                    Reserve for event
                  </button>
                )}
                {item.status === 'reserved' && (
                  <button onClick={() => markItemStatus(item.id, 'rented').then(() => window.location.reload())} className="h-13 sm:h-11 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider touch-manipulation transition-colors shadow-sm">
                    Mark picked up
                  </button>
                )}
                {item.status === 'rented' && (
                  <button onClick={() => setReturnModalOpen({item})} className="h-13 sm:h-11 bg-rose-100 hover:bg-rose-200 text-rose-900 font-bold rounded-xl text-xs uppercase tracking-wider touch-manipulation transition-colors border border-rose-200">
                    Log return
                  </button>
                )}
                {item.status === 'overdue' && (
                  <div className="grid grid-cols-2 gap-2">
                    <button className="h-13 sm:h-11 bg-red-100 hover:bg-red-200 text-red-900 font-bold rounded-xl text-xs uppercase tracking-wider touch-manipulation transition-colors border border-red-200">
                      Contact
                    </button>
                    <button onClick={() => setReturnModalOpen({item})} className="h-13 sm:h-11 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider touch-manipulation transition-colors shadow-sm">
                      Log return
                    </button>
                  </div>
                )}
                {item.status === 'cleaning' && (
                  <button onClick={() => markItemStatus(item.id, 'available').then(() => window.location.reload())} className="h-13 sm:h-11 bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold rounded-xl text-xs uppercase tracking-wider touch-manipulation transition-colors border border-blue-200 flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Mark cleaned
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <div className="col-span-full py-20 text-center text-rose-500 font-semibold border-2 border-dashed border-rose-200 rounded-2xl bg-white">
            No items found matching your filters.
          </div>
        )}
      </div>

      {/* ADD ITEM MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-rose-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-serif font-bold text-rose-950 mb-4 border-b border-rose-100 pb-2">Add Inventory Item</h2>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-rose-800">SKU *</label>
                  <input type="text" value={addData.sku} onChange={e => setAddData({...addData, sku: e.target.value})} className="w-full h-13 sm:h-11 border border-rose-200 rounded-xl px-4 mt-1 focus:ring-2 focus:ring-rose-500 outline-none" placeholder="SKU-123" />
                </div>
                <div>
                  <label className="text-xs font-bold text-rose-800">Category *</label>
                  <select value={addData.category} onChange={e => setAddData({...addData, category: e.target.value})} className="w-full h-13 sm:h-11 border border-rose-200 rounded-xl px-4 mt-1 focus:ring-2 focus:ring-rose-500 outline-none bg-white">
                    <option value="Bridal">Bridal</option>
                    <option value="Quinceanera">Quinceañera</option>
                    <option value="Decoration">Decoration</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-rose-800">Name *</label>
                <input type="text" value={addData.name} onChange={e => setAddData({...addData, name: e.target.value})} className="w-full h-13 sm:h-11 border border-rose-200 rounded-xl px-4 mt-1 focus:ring-2 focus:ring-rose-500 outline-none" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-rose-800">Size</label>
                  <input type="text" value={addData.size} onChange={e => setAddData({...addData, size: e.target.value})} className="w-full h-13 sm:h-11 border border-rose-200 rounded-xl px-4 mt-1 focus:ring-2 focus:ring-rose-500 outline-none" placeholder="e.g. 8" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-rose-800">Description</label>
                <textarea value={addData.description} onChange={e => setAddData({...addData, description: e.target.value})} className="w-full border border-rose-200 rounded-xl p-4 mt-1 focus:ring-2 focus:ring-rose-500 outline-none min-h-[80px] resize-y" />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-rose-800">Rental Price ($) *</label>
                  <input type="number" value={addData.rentalPrice} onChange={e => setAddData({...addData, rentalPrice: e.target.value})} className="w-full h-13 sm:h-11 border border-rose-200 rounded-xl px-4 mt-1 focus:ring-2 focus:ring-rose-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-rose-800">Deposit ($) *</label>
                  <input type="number" value={addData.depositAmount} onChange={e => setAddData({...addData, depositAmount: e.target.value})} className="w-full h-13 sm:h-11 border border-rose-200 rounded-xl px-4 mt-1 focus:ring-2 focus:ring-rose-500 outline-none" />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-rose-50">
                <button onClick={() => setAddModalOpen(false)} disabled={isAdding} className="h-13 sm:h-11 px-6 text-gray-500 font-bold hover:bg-gray-100 rounded-xl touch-manipulation w-full sm:w-auto">Cancel</button>
                <button onClick={handleAddItem} disabled={isAdding || !addData.sku || !addData.name} className="h-13 sm:h-11 px-8 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-sm touch-manipulation disabled:opacity-50 w-full sm:w-auto">
                  {isAdding ? 'Saving...' : 'Save Item'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RESERVE MODAL */}
      {reserveModalOpen && (
        <div className="fixed inset-0 bg-rose-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 sm:p-8 relative">
            <h2 className="text-xl font-serif font-bold text-rose-950 mb-4 border-b border-rose-100 pb-2">Reserve {reserveModalOpen.item.sku}</h2>
            <p className="text-sm text-gray-600 mb-4 font-semibold">{reserveModalOpen.item.name}</p>

            {!selectedEvent ? (
              <>
                <div className="relative mb-4">
                  <Search className="w-4 h-4 absolute left-4 top-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search events by client name..."
                    value={eventSearch}
                    onChange={e => setEventSearch(e.target.value)}
                    className="w-full h-13 sm:h-11 border border-rose-200 rounded-xl pl-10 pr-4 focus:ring-2 focus:ring-rose-500 outline-none"
                  />
                </div>
                {eventResults.length > 0 ? (
                  <div className="border border-rose-200 rounded-xl overflow-hidden mb-6 max-h-[200px] overflow-y-auto">
                    {eventResults.map(evt => (
                      <button key={evt.id} onClick={() => selectEventForReservation(evt)} className="w-full text-left p-3 hover:bg-rose-50 border-b border-rose-50 last:border-0 touch-manipulation">
                        <div className="font-bold text-rose-950">{evt.clientName}</div>
                        <div className="text-xs text-rose-600 capitalize">{evt.type} • {new Date(evt.date).toLocaleDateString()}</div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 text-center text-sm text-gray-500 mb-6 min-h-[100px] flex items-center justify-center font-semibold">
                    {eventSearch.length > 2 ? 'No events found.' : 'Search to select an event...'}
                  </div>
                )}
              </>
            ) : (
              <div className="mb-6 space-y-4 animate-in fade-in">
                <div className="bg-rose-50 p-4 rounded-xl border border-rose-100 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-rose-950">{selectedEvent.clientName}</div>
                    <div className="text-xs text-rose-600 capitalize">Event: {new Date(selectedEvent.date).toLocaleDateString()}</div>
                  </div>
                  <button onClick={() => setSelectedEvent(null)} className="text-xs font-bold text-rose-600 hover:text-rose-800 underline touch-manipulation p-2 -mr-2">Change</button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-rose-800">Pickup Date *</label>
                    <input type="date" value={reserveDates.pickup} onChange={e => setReserveDates({...reserveDates, pickup: e.target.value})} className="w-full h-13 sm:h-11 border border-rose-200 rounded-xl px-3 mt-1 outline-none focus:ring-2 focus:ring-rose-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-rose-800">Return Date *</label>
                    <input type="date" value={reserveDates.return} onChange={e => setReserveDates({...reserveDates, return: e.target.value})} className="w-full h-13 sm:h-11 border border-rose-200 rounded-xl px-3 mt-1 outline-none focus:ring-2 focus:ring-rose-500" />
                  </div>
                </div>

                {reserveError && <div className="text-red-600 bg-red-50 p-3 rounded-lg text-sm font-semibold border border-red-200">{reserveError}</div>}
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-rose-50">
              <button onClick={() => {setReserveModalOpen(null); setSelectedEvent(null); setEventSearch(''); setReserveError('');}} className="h-13 sm:h-11 px-4 text-gray-500 font-bold hover:bg-gray-100 rounded-xl w-full sm:w-auto touch-manipulation">Cancel</button>
              {selectedEvent && (
                <button onClick={handleReserve} disabled={isReserving} className="h-13 sm:h-11 px-6 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 shadow-sm disabled:opacity-50 w-full sm:w-auto touch-manipulation">
                  {isReserving ? 'Reserving...' : 'Confirm Reservation'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RETURN MODAL */}
      {returnModalOpen && (
        <div className="fixed inset-0 bg-rose-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-6 sm:p-8 relative">
            <h2 className="text-xl font-serif font-bold text-rose-950 mb-4 border-b border-rose-100 pb-2">Log Return: {returnModalOpen.item.sku}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-rose-800">Condition on Return</label>
                <select value={returnData.condition} onChange={e => setReturnData({...returnData, condition: e.target.value})} className="w-full h-13 sm:h-11 border border-rose-200 rounded-xl px-4 mt-1 focus:ring-2 focus:ring-rose-500 outline-none bg-white font-semibold">
                  <option>Excellent</option>
                  <option>Good</option>
                  <option>Minor Wear</option>
                  <option>Damage Noted</option>
                </select>
              </div>

              {returnData.condition === 'Damage Noted' && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="text-xs font-bold text-rose-800">Damage Notes *</label>
                  <textarea value={returnData.notes} onChange={e => setReturnData({...returnData, notes: e.target.value})} className="w-full border border-rose-200 rounded-xl p-3 mt-1 focus:ring-2 focus:ring-rose-500 outline-none min-h-[80px]" placeholder="Describe the damage..."></textarea>
                </div>
              )}

              <label className="flex items-center gap-3 p-4 border border-rose-200 rounded-xl bg-rose-50/50 cursor-pointer touch-manipulation mt-2">
                <input type="checkbox" checked={returnData.cleaning} onChange={e => setReturnData({...returnData, cleaning: e.target.checked})} className="w-6 h-6 rounded border-gray-300 text-rose-600 focus:ring-rose-500" />
                <span className="font-bold text-rose-900">Send to Cleaning</span>
              </label>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-rose-50">
                <button onClick={() => setReturnModalOpen(null)} disabled={isReturning} className="h-13 sm:h-11 px-6 text-gray-500 font-bold hover:bg-gray-100 rounded-xl w-full sm:w-auto touch-manipulation">Cancel</button>
                <button onClick={handleReturn} disabled={isReturning || (returnData.condition === 'Damage Noted' && !returnData.notes)} className="h-13 sm:h-11 px-8 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 shadow-sm disabled:opacity-50 w-full sm:w-auto touch-manipulation">
                  {isReturning ? 'Saving...' : 'Confirm Return'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {detailModalOpen && (
        <div className="fixed inset-0 bg-rose-950/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-rose-100 bg-rose-50 flex justify-between items-center">
              <h2 className="text-2xl font-serif font-bold text-rose-950">{detailModalOpen.item.name}</h2>
              <button onClick={() => setDetailModalOpen(null)} className="h-10 w-10 sm:h-8 sm:w-8 bg-white rounded-full flex items-center justify-center font-bold text-gray-500 shadow-sm border border-rose-200 touch-manipulation hover:bg-rose-100">✕</button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 sm:gap-6 mb-6">
                <div><div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">SKU</div><div className="font-mono font-bold text-lg text-rose-950">{detailModalOpen.item.sku}</div></div>
                <div><div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Status</div><div className={cn("font-bold text-lg uppercase", detailModalOpen.item.status === 'available' ? 'text-emerald-600' : 'text-amber-600')}>{detailModalOpen.item.status}</div></div>
                <div><div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Size</div><div className="font-bold text-rose-950">{detailModalOpen.item.size || 'N/A'}</div></div>
                <div><div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Category</div><div className="font-bold uppercase text-rose-950">{detailModalOpen.item.category}</div></div>
              </div>
              <div className="border-t border-rose-100 pt-6">
                <h3 className="font-bold text-rose-900 mb-2">Description</h3>
                <p className="text-sm text-gray-700 leading-relaxed">{detailModalOpen.item.description || 'No description provided.'}</p>
              </div>
              {detailModalOpen.item.lastCleanedDate && (
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm font-semibold text-blue-900 flex gap-2 items-center">
                  <CheckCircle2 className="w-5 h-5 text-blue-500" />
                  Last Cleaned: {new Date(detailModalOpen.item.lastCleanedDate).toLocaleDateString()}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-rose-100 bg-gray-50">
              <button onClick={() => setDetailModalOpen(null)} className="w-full h-13 sm:h-11 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl touch-manipulation hover:bg-gray-100">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
