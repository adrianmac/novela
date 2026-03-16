'use client'

import React, { useState } from 'react';
import { toggleTaskStatus, addNote, markPaymentPaid } from './actions';
import { cn } from '@/lib/utils';
import { ChevronRight, CheckCircle2 } from 'lucide-react';

export function DetailInteractions({ eventId, notesData, eventTasks, payments, client }: { eventId: string, notesData: any[], eventTasks: any[], payments: any[], client: any }) {
  const [noteText, setNoteText] = useState('');

  const handleTaskToggle = async (taskId: string, currentStatus: string) => {
    await toggleTaskStatus(taskId, currentStatus, eventId);
  };

  const handlePostNote = async () => {
    if (!noteText.trim()) return;
    await addNote(eventId, noteText);
    setNoteText('');
  };

  const handlePayment = async (paymentId: string) => {
    await markPaymentPaid(paymentId, eventId);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start w-full">
      <section className="bg-white rounded-xl border border-rose-100 p-5 sm:p-6 shadow-sm flex flex-col h-[500px] w-full lg:w-2/3">
         <h2 className="font-serif font-bold text-xl text-[#1C1012] mb-6 flex-shrink-0">Staff Notes</h2>
         <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-6 mb-4">
            {notesData.map((note: any) => (
              <div key={note.id} className="flex gap-3 sm:gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0",
                  note.role === 'coordinator' ? "bg-blue-500" : "bg-purple-500"
                )}>
                  {note.initials}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-bold text-[#1C1012] text-sm">{note.author}</span>
                    <span className="text-xs text-gray-400">{note.time}</span>
                  </div>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg rounded-tl-none border border-gray-100 leading-relaxed">
                    {note.text}
                  </p>
                </div>
              </div>
            ))}
         </div>

         <div className="flex-shrink-0 flex gap-3 sm:gap-4 pt-4 border-t border-rose-100 items-start">
            <div className="w-10 h-10 rounded-full bg-[#8B7355] flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-1">
              IM
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Add a note... (auto-assigns to Isabel M.)"
                className="w-full border border-gray-300 rounded-lg p-3 text-sm min-h-[80px] sm:min-h-[60px] focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none font-sans"
              ></textarea>
              <div className="flex justify-end">
                <button onClick={handlePostNote} className="h-10 px-4 bg-gray-900 text-white rounded-md text-sm font-semibold hover:bg-gray-800 active:scale-[0.97] touch-manipulation">
                  Post Note
                </button>
              </div>
            </div>
         </div>
      </section>

      <aside className="flex flex-col gap-4 sm:gap-6 w-full lg:w-1/3">

        <div className="bg-white rounded-xl border border-rose-100 overflow-hidden shadow-sm">
          <div className="p-4 sm:p-5 border-b border-rose-100">
            <h3 className="font-serif font-bold text-lg text-[#1C1012] mb-1">Payment milestones</h3>
          </div>

          <div className="divide-y divide-rose-50">
            {payments.map((p: any) => {
              const isOverdue = p.status === 'overdue';
              const isPaid = p.status === 'paid';
              return (
                <div key={p.id} className={cn(
                  "p-4 sm:p-5 flex gap-3",
                  isOverdue && "bg-red-50/50"
                )}>
                  <div className={cn(
                    "w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0",
                    isPaid ? "bg-emerald-500" : isOverdue ? "bg-red-500" : "bg-amber-400"
                  )}></div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-[#1C1012] text-sm">{p.milestone}</span>
                      <span className={cn(
                        "font-mono font-bold text-sm",
                        isPaid ? "text-emerald-700" : isOverdue ? "text-red-700" : "text-[#1C1012]"
                      )}>${p.amount / 100}</span>
                    </div>

                    {isOverdue && (
                      <button onClick={() => handlePayment(p.id)} className="mt-3 w-full h-10 border border-red-200 text-red-700 font-semibold text-xs rounded hover:bg-red-100 active:bg-red-200 touch-manipulation transition-colors bg-white">
                        Mark Paid →
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-rose-100 shadow-sm overflow-hidden">
           <div className="p-4 sm:p-5 border-b border-rose-100 flex justify-between items-center">
             <h3 className="font-bold text-[#1C1012] text-sm uppercase tracking-wider text-[#8B7355]">Open Tasks</h3>
           </div>
           <div className="p-2">
             {eventTasks.map((t: any) => {
               const checked = t.status === 'completed';
               const overdue = new Date(t.dueDate) < new Date() && !checked;
               return (
                 <label key={t.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer touch-manipulation group">
                   <div
                    onClick={() => handleTaskToggle(t.id, t.status)}
                    className={cn(
                     "w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                     checked ? "bg-gray-200 border-gray-300 text-gray-500" :
                     overdue ? "border-red-400 bg-red-50" : "border-gray-300 bg-white group-hover:border-gray-400"
                   )}>
                     {checked && <CheckCircle2 className="w-4 h-4" />}
                   </div>
                   <div className="flex-1">
                     <p className={cn(
                       "text-sm font-medium leading-snug mb-1",
                       checked ? "text-gray-400 line-through" :
                       overdue ? "text-red-700" : "text-[#1C1012]"
                     )}>{t.title}</p>
                   </div>
                 </label>
               )
             })}
           </div>
        </div>

        <div className="bg-white rounded-xl border border-rose-100 p-4 sm:p-5 shadow-sm touch-manipulation hover:shadow-md transition-shadow cursor-pointer group relative">
           <div className="flex justify-between items-center mb-3">
             <h3 className="font-bold text-[#1C1012] text-sm uppercase tracking-wider text-[#8B7355]">Client Info</h3>
             <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#C9697A]" />
           </div>
           <p className="font-semibold text-[#1C1012] text-sm mb-1">{client.phone}</p>
           <p className="text-sm text-gray-600 truncate">{client.email}</p>
        </div>

      </aside>
    </div>
  );
}
