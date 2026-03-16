'use client'

import React, { useState } from 'react';
import { submitIntakeForm } from './actions';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Check, Calendar, Users, MapPin, Search } from 'lucide-react';

const steps = ['Basic information', 'Event details', 'Schedule consultation'];
const servicesList = ['Dress rental', 'Alterations / Seamstress', 'Event planning', 'Decoration'];

export default function IntakeForm({ availableStaff }: { availableStaff: any[] }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    secondaryContactName: '', secondaryContactPhone: '',
    hearAboutUs: '', referredBy: '',
    eventType: '', eventDate: '', guestCount: '', venueName: '', venueCity: '', budgetRange: '',
    services: [] as string[],
    appointmentDate: '', staffId: '', staffName: '', appointmentNotes: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleNext = () => {
    // Basic validation per step
    if (step === 1) {
      const newErrors: any = {};
      if (!formData.firstName) newErrors.firstName = 'First name required';
      if (!formData.lastName) newErrors.lastName = 'Last name required';
      if (!formData.phone || formData.phone.length < 10) newErrors.phone = 'Valid phone required';
      if (Object.keys(newErrors).length > 0) return setErrors(newErrors);
    }
    if (step === 2) {
      const newErrors: any = {};
      if (!formData.eventType) newErrors.eventType = 'Event type required';
      if (!formData.eventDate) newErrors.eventDate = 'Event date required';
      if (Object.keys(newErrors).length > 0) return setErrors(newErrors);
    }

    setErrors({});
    setStep(s => Math.min(3, s + 1));
  };

  const handleBack = () => setStep(s => Math.max(1, s - 1));

  const handleSubmit = async () => {
    // Validate final step
    if (!formData.appointmentDate) return setErrors({ appointmentDate: 'Please select a date' });
    if (!formData.staffId) return setErrors({ staffId: 'Please select staff' });

    // Ensure staffName is populated
    const selectedStaff = availableStaff.find(s => s.id === formData.staffId);
    const finalData = { ...formData, staffName: selectedStaff?.name || 'Unassigned' };

    const res = await submitIntakeForm(finalData);
    if (res.success && res.eventId) {
      // Toast notification placeholder
      alert('Client created and consultation booked!');
      router.push(`/dashboard/events/${res.eventId}`);
    } else {
      alert('Error creating intake form. Please check console logs.');
    }
  };

  const toggleService = (svc: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(svc) ? prev.services.filter(s => s !== svc) : [...prev.services, svc]
    }));
  };

  // Warning for date
  let dateWarning = false;
  if (formData.eventDate) {
    const diff = new Date(formData.eventDate).getTime() - new Date().getTime();
    if (diff > 0 && diff < 60 * 24 * 60 * 60 * 1000) dateWarning = true;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-rose-100 overflow-hidden">

      {/* HEADER & STEP INDICATOR */}
      <div className="bg-rose-50/50 p-6 sm:px-10 border-b border-rose-100">
        <h1 className="text-2xl font-serif font-bold text-rose-950 mb-4 tracking-tight">New Client Intake</h1>

        <div className="flex items-center gap-4 text-sm font-semibold text-rose-800/60 uppercase tracking-wider mb-2">
          Step {step} of 3
        </div>

        {/* Progress Dots */}
        <div className="flex items-center gap-3">
          {steps.map((label, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < step;
            const isActive = stepNum === step;
            return (
              <React.Fragment key={idx}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors",
                    isCompleted ? "bg-emerald-500 text-white shadow-sm" :
                    isActive ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-600/20 ring-offset-2" :
                    "bg-gray-100 text-gray-400"
                  )}>
                    {isCompleted ? <Check className="w-5 h-5" /> : stepNum}
                  </div>
                  <span className={cn(
                    "hidden sm:inline font-semibold",
                    isActive ? "text-rose-950" : "text-gray-400"
                  )}>{label}</span>
                </div>
                {idx < steps.length - 1 && <div className="flex-1 h-px bg-rose-200 mx-2 hidden sm:block"></div>}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      <div className="p-6 sm:p-10 space-y-8">

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            <h2 className="text-xl font-serif font-bold text-rose-900 border-b border-rose-50 pb-2">Basic Information</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-rose-900 mb-2">First name *</label>
                <input type="text" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})}
                  className="w-full h-13 px-4 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white" placeholder="Jessica" />
                {errors.firstName && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-rose-900 mb-2">Last name *</label>
                <input type="text" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})}
                  className="w-full h-13 px-4 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white" placeholder="Smith" />
                {errors.lastName && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.lastName}</p>}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-rose-900 mb-2">Primary phone *</label>
                <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full h-13 px-4 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white" placeholder="(555) 123-4567" />
                {errors.phone && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm font-bold text-rose-900 mb-2">Email address</label>
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full h-13 px-4 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white" placeholder="jessica@example.com" />
              </div>
            </div>

            <div className="bg-rose-50/50 p-5 rounded-xl border border-rose-100 space-y-4">
              <h3 className="font-bold text-rose-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-rose-500" /> Optional Secondary Contact
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-rose-700 mb-1">Mother / Partner / Guardian Name</label>
                  <input type="text" value={formData.secondaryContactName} onChange={e => setFormData({...formData, secondaryContactName: e.target.value})}
                    className="w-full h-11 px-3 text-sm rounded-lg border border-rose-200 bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-rose-700 mb-1">Secondary Phone</label>
                  <input type="tel" value={formData.secondaryContactPhone} onChange={e => setFormData({...formData, secondaryContactPhone: e.target.value})}
                    className="w-full h-11 px-3 text-sm rounded-lg border border-rose-200 bg-white" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-rose-900 mb-2">How did you hear about us?</label>
              <select value={formData.hearAboutUs} onChange={e => setFormData({...formData, hearAboutUs: e.target.value})}
                className="w-full h-13 px-4 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white appearance-none">
                <option value="">Select option...</option>
                <option value="Walk-in">Walk-in</option>
                <option value="Instagram">Instagram</option>
                <option value="Google">Google</option>
                <option value="Facebook">Facebook</option>
                <option value="Referral">Referral</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {formData.hearAboutUs === 'Referral' && (
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-sm font-bold text-rose-900 mb-2">Referred by (client name)</label>
                <input type="text" value={formData.referredBy} onChange={e => setFormData({...formData, referredBy: e.target.value})}
                  className="w-full h-13 px-4 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white" placeholder="Enter name" />
              </div>
            )}
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            <h2 className="text-xl font-serif font-bold text-rose-900 border-b border-rose-50 pb-2">Event Details</h2>

            <div>
              <label className="block text-sm font-bold text-rose-900 mb-3">Event type *</label>
              <div className="grid grid-cols-2 gap-4">
                {['wedding', 'quinceanera'].map(type => (
                  <button key={type} onClick={() => setFormData({...formData, eventType: type})} className={cn(
                    "h-16 rounded-xl border-2 font-bold uppercase tracking-widest text-sm transition-all shadow-sm touch-manipulation",
                    formData.eventType === type
                      ? "bg-rose-50 border-rose-500 text-rose-900 ring-4 ring-rose-500/10"
                      : "bg-white border-gray-200 text-gray-500 hover:border-rose-200 hover:bg-rose-50/30"
                  )}>
                    {type === 'wedding' ? 'WEDDING' : 'QUINCEAÑERA'}
                  </button>
                ))}
              </div>
              {errors.eventType && <p className="text-red-500 text-xs mt-2 font-semibold">{errors.eventType}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-rose-900 mb-2">Event date *</label>
                <input type="date" value={formData.eventDate} onChange={e => setFormData({...formData, eventDate: e.target.value})}
                  className="w-full h-13 px-4 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white" />
                {errors.eventDate && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.eventDate}</p>}

                {dateWarning && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 animate-in fade-in">
                    <span className="text-amber-500 mt-0.5">⚠️</span>
                    <p className="text-amber-800 text-xs font-semibold leading-relaxed">
                      This event is less than 60 days away. Expedited fees may apply for alterations or rentals.
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-rose-900 mb-2">Approx. Guest Count</label>
                <input type="number" value={formData.guestCount} onChange={e => setFormData({...formData, guestCount: e.target.value})}
                  className="w-full h-13 px-4 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white" placeholder="150" />
              </div>
            </div>

            <div className="bg-rose-50/50 p-5 rounded-xl border border-rose-100 space-y-4">
              <h3 className="font-bold text-rose-900 text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-500" /> Venue Information
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-xs font-semibold text-rose-700 mb-1">Venue Name</label>
                  <div className="absolute left-3 top-8 text-gray-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input type="text" value={formData.venueName} onChange={e => setFormData({...formData, venueName: e.target.value})}
                    className="w-full h-11 pl-9 pr-3 text-sm rounded-lg border border-rose-200 bg-white" placeholder="Search past venues..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-rose-700 mb-1">Venue City</label>
                  <input type="text" value={formData.venueCity} onChange={e => setFormData({...formData, venueCity: e.target.value})}
                    className="w-full h-11 px-3 text-sm rounded-lg border border-rose-200 bg-white" placeholder="e.g. Los Angeles" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-rose-900 mb-3">Services interested in</label>
              <div className="grid sm:grid-cols-2 gap-3">
                {servicesList.map(svc => (
                  <label key={svc} className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-rose-50 cursor-pointer touch-manipulation shadow-sm transition-colors group has-[:checked]:border-rose-400 has-[:checked]:bg-rose-50">
                    <input type="checkbox" checked={formData.services.includes(svc)} onChange={() => toggleService(svc)}
                      className="w-5 h-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500 focus:ring-offset-2 transition-colors cursor-pointer" />
                    <span className="font-semibold text-rose-950 group-has-[:checked]:text-rose-900">{svc}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-rose-900 mb-2">Budget range</label>
              <select value={formData.budgetRange} onChange={e => setFormData({...formData, budgetRange: e.target.value})}
                className="w-full h-13 px-4 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white appearance-none">
                <option value="">Select range (optional)...</option>
                <option value="Under $2,000">Under $2,000</option>
                <option value="$2,000-$4,000">$2,000-$4,000</option>
                <option value="$4,000-$7,000">$4,000-$7,000</option>
                <option value="$7,000-$10,000">$7,000-$10,000</option>
                <option value="$10,000+">$10,000+</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
            <h2 className="text-xl font-serif font-bold text-rose-900 border-b border-rose-50 pb-2">Schedule Consultation</h2>

            {/* Summary Card */}
            <div className="bg-gradient-to-br from-rose-900 to-rose-950 p-6 rounded-2xl shadow-md text-white">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-serif font-bold tracking-tight">{formData.firstName} {formData.lastName}</h3>
                  <div className="text-rose-200 text-sm mt-1">{formData.phone} • {formData.email || 'No email'}</div>
                </div>
                <div className="bg-white/20 px-3 py-1 rounded text-xs font-black uppercase tracking-widest backdrop-blur-sm shadow-sm border border-white/10">
                  {formData.eventType === 'wedding' ? 'WEDDING' : 'QUINCEAÑERA'}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-4 mt-2">
                <div>
                  <div className="text-rose-300 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Event Date</div>
                  <div className="font-semibold text-lg">{formData.eventDate ? new Date(formData.eventDate).toLocaleDateString() : 'TBD'}</div>
                </div>
                <div>
                  <div className="text-rose-300 text-xs font-bold uppercase tracking-wider mb-1">Services</div>
                  <div className="font-semibold leading-snug">{formData.services.length > 0 ? formData.services.join(', ') : 'None selected'}</div>
                </div>
              </div>
            </div>

            {/* Availability Picker (Simplified Mock) */}
            <div className="space-y-4">
               <div className="flex justify-between items-center">
                 <h3 className="font-bold text-rose-950">Select Time Slot</h3>
                 <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">Next Week</span>
               </div>
               <div className="grid grid-cols-3 gap-2 sm:gap-4">
                 {['2026-04-12T10:00:00', '2026-04-12T14:00:00', '2026-04-13T11:00:00'].map(dateStr => {
                   const dateObj = new Date(dateStr);
                   const isSelected = formData.appointmentDate === dateStr;
                   return (
                     <button key={dateStr} onClick={() => setFormData({...formData, appointmentDate: dateStr})} className={cn(
                       "p-3 rounded-xl border-2 text-center transition-all touch-manipulation shadow-sm",
                       isSelected ? "bg-blue-600 border-blue-600 text-white shadow-md ring-4 ring-blue-600/20" : "bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                     )}>
                       <div className="text-xs font-bold uppercase tracking-widest mb-1 opacity-80">{dateObj.toLocaleDateString([], { weekday: 'short' })}</div>
                       <div className="font-semibold">{dateObj.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</div>
                     </button>
                   )
                 })}
               </div>
               {errors.appointmentDate && <p className="text-red-500 text-xs font-semibold">{errors.appointmentDate}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-rose-50">
              <div>
                <label className="block text-sm font-bold text-rose-900 mb-2">Assign Coordinator *</label>
                <select value={formData.staffId} onChange={e => setFormData({...formData, staffId: e.target.value})}
                  className="w-full h-13 px-4 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white appearance-none">
                  <option value="">Select staff...</option>
                  {availableStaff.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                  ))}
                </select>
                {errors.staffId && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.staffId}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-rose-900 mb-2">Anything we should know before the consultation?</label>
              <textarea value={formData.appointmentNotes} onChange={e => setFormData({...formData, appointmentNotes: e.target.value})}
                className="w-full p-4 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white min-h-[100px] resize-y" placeholder="Client specifically asked about custom veil options..."></textarea>
            </div>

          </div>
        )}

      </div>

      {/* FOOTER ACTIONS */}
      <div className="bg-gray-50 border-t border-gray-200 p-6 flex items-center justify-between gap-4">
        {step > 1 ? (
          <button onClick={handleBack} className="h-13 px-6 rounded-xl font-bold text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors touch-manipulation uppercase tracking-wider text-sm shadow-sm border border-transparent hover:border-gray-300">
            ← Back
          </button>
        ) : <div></div>}

        {step < 3 ? (
          <button onClick={handleNext} className="h-13 px-8 rounded-xl bg-gray-900 text-white font-bold hover:bg-black transition-colors touch-manipulation shadow-md hover:shadow-lg active:scale-[0.98] uppercase tracking-wider text-sm flex items-center gap-2">
            Next: {step === 1 ? 'Event Details' : 'Schedule Consultation'} →
          </button>
        ) : (
          <button onClick={handleSubmit} className="h-13 px-8 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors touch-manipulation shadow-md hover:shadow-lg active:scale-[0.98] uppercase tracking-wider text-sm">
            Create Client & Book
          </button>
        )}
      </div>

    </div>
  );
}
