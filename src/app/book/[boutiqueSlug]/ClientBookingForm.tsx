"use client";

import { useState } from "react";
import { Check, Calendar, Gem, Sparkles, Scissors, User, Phone, MapPin, CheckCircle2 } from "lucide-react";
import { submitBooking } from "./actions";

type Step = 1 | 2 | 3 | 4 | 5 | 6; // 6 is success
type EventType = "wedding" | "quinceanera" | null;

interface BookingData {
  eventType: EventType;
  services: string[];
  eventDate: string;
  guestCount: string;
  venue: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  contactMethod: string;
  howFound: string;
  appointmentTime: string;
}

export default function ClientBookingForm({ boutiqueSlug }: { boutiqueSlug: string }) {
  const [step, setStep] = useState<Step>(1);
  const [data, setData] = useState<BookingData>({
    eventType: null,
    services: [],
    eventDate: "",
    guestCount: "",
    venue: "",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    contactMethod: "Phone call",
    howFound: "",
    appointmentTime: "",
  });

  const nextStep = () => setStep((s) => (s + 1) as Step);
  const prevStep = () => setStep((s) => (s - 1) as Step);

  const updateData = (fields: Partial<BookingData>) => {
    setData((prev) => ({ ...prev, ...fields }));
  };

  if (step === 6) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-8 text-center mt-12">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="font-serif text-3xl font-bold text-stone-900 mb-4">You’re booked!</h2>
        <p className="text-stone-600 text-lg mb-8">
          We’ll see you on <span className="font-semibold">{new Date(data.appointmentTime).toLocaleString(undefined, { weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>.
        </p>
        <p className="text-stone-500 mb-2">We sent a confirmation text to {data.phone}.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Progress Indicator */}
      <div className="flex justify-between items-center mb-8 px-4 relative">
         <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-rose-100 -z-10 -translate-y-1/2 rounded" />
         {[1, 2, 3, 4, 5].map((s) => (
           <div
             key={s}
             className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
               step >= s
                 ? "bg-rose-800 text-white shadow-sm ring-4 ring-rose-50"
                 : "bg-white text-stone-400 border border-stone-200"
             }`}
           >
             {s}
           </div>
         ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
        {step === 1 && (
          <Step1 eventType={data.eventType} onSelect={(t) => { updateData({ eventType: t }); nextStep(); }} />
        )}
        {step === 2 && (
          <Step2 services={data.services} onUpdate={(s) => updateData({ services: s })} onNext={nextStep} onBack={prevStep} />
        )}
        {step === 3 && (
          <Step3 data={data} onUpdate={updateData} onNext={nextStep} onBack={prevStep} />
        )}
        {step === 4 && (
          <Step4 data={data} onUpdate={updateData} onNext={nextStep} onBack={prevStep} />
        )}
        {step === 5 && (
          <Step5 data={data} onUpdate={updateData} onSubmit={async () => {
             await submitBooking(data);
             setStep(6);
          }} onBack={prevStep} />
        )}
      </div>
    </div>
  );
}

function Step1({ eventType, onSelect }: { eventType: EventType, onSelect: (t: "wedding" | "quinceanera") => void }) {
  return (
    <div className="p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="font-serif text-2xl font-bold text-stone-900 mb-6 text-center">What are you celebrating?</h2>

      <div className="space-y-4">
        <button
          onClick={() => onSelect("wedding")}
          className={`w-full flex items-start gap-5 p-5 sm:p-6 rounded-xl border-2 transition-all text-left ${
            eventType === "wedding" ? "border-rose-800 bg-rose-50/50" : "border-stone-100 bg-white hover:border-rose-200 hover:shadow-sm"
          }`}
        >
          <div className={`p-4 rounded-full flex-shrink-0 ${eventType === "wedding" ? "bg-white text-rose-800" : "bg-rose-50 text-rose-600"}`}>
            <Gem size={32} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-stone-900 mb-1">Wedding</h3>
            <p className="text-stone-500 leading-relaxed">Bridal gowns, alterations, planning & decor for your special day</p>
          </div>
        </button>

        <button
          onClick={() => onSelect("quinceanera")}
          className={`w-full flex items-start gap-5 p-5 sm:p-6 rounded-xl border-2 transition-all text-left ${
            eventType === "quinceanera" ? "border-rose-800 bg-rose-50/50" : "border-stone-100 bg-white hover:border-rose-200 hover:shadow-sm"
          }`}
        >
          <div className={`p-4 rounded-full flex-shrink-0 ${eventType === "quinceanera" ? "bg-white text-rose-800" : "bg-rose-50 text-rose-600"}`}>
            <Sparkles size={32} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-stone-900 mb-1">Quinceañera</h3>
            <p className="text-stone-500 leading-relaxed">Quinceañera gowns, planning & decor for your 15th birthday celebration</p>
          </div>
        </button>
      </div>
    </div>
  );
}

function Step2({ services, onUpdate, onNext, onBack }: { services: string[], onUpdate: (s: string[]) => void, onNext: () => void, onBack: () => void }) {
  const options = [
    { id: "dress_rental", label: "Dress rental", desc: "Try on and rent from our collection", price: "from $350", icon: <User size={20} /> },
    { id: "alterations", label: "Alterations", desc: "Custom fitting by our seamstress team", price: "from $150", icon: <Scissors size={20} /> },
    { id: "planning", label: "Event planning", desc: "Full coordination from A to Z", price: "from $800", icon: <Calendar size={20} /> },
    { id: "decoration", label: "Decoration", desc: "In-house venue decoration setup", price: "from $600", icon: <Gem size={20} /> },
  ];

  const toggle = (id: string) => {
    if (services.includes(id)) {
      onUpdate(services.filter(s => s !== id));
    } else {
      onUpdate([...services, id]);
    }
  };

  const allSelected = options.every(o => services.includes(o.id));

  return (
    <div className="p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2 text-center">What services do you need?</h2>
      <p className="text-center text-stone-500 mb-6">Select all that apply.</p>

      {allSelected && (
        <div className="bg-rose-100 text-rose-800 p-4 rounded-xl mb-6 flex items-center gap-3 animate-in fade-in zoom-in duration-300">
          <Sparkles className="flex-shrink-0 text-rose-600" size={20} />
          <p className="font-semibold text-sm">You selected all 4 services! You qualify for our <span className="font-bold">Full Package Discount</span>.</p>
        </div>
      )}

      <div className="space-y-3 mb-8">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => toggle(opt.id)}
            className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left group ${
              services.includes(opt.id) ? "border-rose-800 bg-rose-50/30" : "border-stone-100 hover:border-rose-200"
            }`}
          >
            <div className="flex items-center gap-4">
               <div className={`w-6 h-6 rounded flex items-center justify-center border transition-colors ${
                 services.includes(opt.id) ? "bg-rose-800 border-rose-800 text-white" : "border-stone-300 group-hover:border-rose-400"
               }`}>
                 {services.includes(opt.id) && <Check size={14} strokeWidth={3} />}
               </div>
               <div>
                 <div className="font-bold text-stone-900 flex items-center gap-2">
                   {opt.label}
                 </div>
                 <div className="text-sm text-stone-500 mt-0.5">{opt.desc}</div>
               </div>
            </div>
            <div className="text-sm font-medium text-stone-600 bg-stone-100 px-3 py-1 rounded-full whitespace-nowrap">
              {opt.price}
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-4">
        <button onClick={onBack} className="w-1/3 py-4 font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors min-h-13">Back</button>
        <button onClick={onNext} disabled={services.length === 0} className="w-2/3 py-4 font-bold text-white bg-rose-800 hover:bg-rose-900 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-13">
          Continue
        </button>
      </div>
    </div>
  );
}

function Step3({ data, onUpdate, onNext, onBack }: { data: BookingData, onUpdate: (d: Partial<BookingData>) => void, onNext: () => void, onBack: () => void }) {
  // Calculate min date (30 days from now)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 30);
  const minDateString = minDate.toISOString().split('T')[0];

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.value;
    onUpdate({ eventDate: selected });
  };

  const isRushOrder = data.eventDate && data.eventDate < minDateString;

  return (
    <div className="p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="font-serif text-2xl font-bold text-stone-900 mb-6 text-center">When is your event?</h2>

      <div className="space-y-6 mb-8">
        <div>
          <label className="block text-sm font-bold text-stone-700 mb-2">Event Date</label>
          <input
            type="date"
            value={data.eventDate}
            onChange={handleDateChange}
            className="w-full p-4 rounded-xl border border-stone-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors min-h-13"
          />
          {isRushOrder && (
            <p className="mt-2 text-rose-600 text-sm font-medium flex items-center gap-1">
               <Calendar size={14} /> Rush order (under 30 days). Please call us directly!
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold text-stone-700 mb-2">Approximate Guest Count</label>
          <input
            type="number"
            min="0"
            value={data.guestCount}
            onChange={(e) => onUpdate({ guestCount: e.target.value })}
            placeholder="e.g. 150"
            className="w-full p-4 rounded-xl border border-stone-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors min-h-13"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-stone-700 mb-2">Venue (Optional)</label>
          <div className="relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
            <input
              type="text"
              value={data.venue}
              onChange={(e) => onUpdate({ venue: e.target.value })}
              placeholder="e.g. The Grand Plaza"
              className="w-full pl-11 p-4 rounded-xl border border-stone-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors min-h-13"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={onBack} className="w-1/3 py-4 font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors min-h-13">Back</button>
        <button
          onClick={onNext}
          disabled={!data.eventDate || !!isRushOrder}
          className="w-2/3 py-4 font-bold text-white bg-rose-800 hover:bg-rose-900 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-13"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function Step4({ data, onUpdate, onNext, onBack }: { data: BookingData, onUpdate: (d: Partial<BookingData>) => void, onNext: () => void, onBack: () => void }) {
  const isComplete = data.firstName && data.lastName && data.phone.length > 9;

  return (
    <div className="p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="font-serif text-2xl font-bold text-stone-900 mb-6 text-center">Your contact information</h2>

      <div className="space-y-5 mb-8">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">First Name</label>
            <input
              type="text"
              value={data.firstName}
              onChange={(e) => onUpdate({ firstName: e.target.value })}
              className="w-full p-4 rounded-xl border border-stone-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors min-h-13"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">Last Name</label>
            <input
              type="text"
              value={data.lastName}
              onChange={(e) => onUpdate({ lastName: e.target.value })}
              className="w-full p-4 rounded-xl border border-stone-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors min-h-13"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-stone-700 mb-2">Phone Number</label>
          <div className="relative">
             <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
             <input
               type="tel"
               value={data.phone}
               onChange={(e) => onUpdate({ phone: e.target.value })}
               placeholder="(555) 000-0000"
               className="w-full pl-11 p-4 rounded-xl border border-stone-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors min-h-13"
             />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-stone-700 mb-2">Email (Optional)</label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onUpdate({ email: e.target.value })}
            className="w-full p-4 rounded-xl border border-stone-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors min-h-13"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-stone-700 mb-3">Preferred Contact Method</label>
          <div className="flex gap-3">
            {["Phone call", "SMS", "Email"].map(method => (
              <button
                key={method}
                onClick={() => onUpdate({ contactMethod: method })}
                className={`flex-1 py-3 text-sm font-medium rounded-lg border transition-colors ${
                  data.contactMethod === method ? "bg-stone-900 border-stone-900 text-white" : "border-stone-300 text-stone-600 hover:border-stone-400 hover:bg-stone-50"
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-stone-700 mb-2">How did you find us?</label>
          <select
            value={data.howFound}
            onChange={(e) => onUpdate({ howFound: e.target.value })}
            className="w-full p-4 rounded-xl border border-stone-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors bg-white appearance-none min-h-13"
          >
            <option value="" disabled>Select an option...</option>
            <option value="Instagram">Instagram</option>
            <option value="Google">Google Search</option>
            <option value="Facebook">Facebook</option>
            <option value="Friend/Family Referral">Friend/Family Referral</option>
            <option value="Walk-in">Walk-in / Drove by</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={onBack} className="w-1/3 py-4 font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors min-h-13">Back</button>
        <button
          onClick={onNext}
          disabled={!isComplete}
          className="w-2/3 py-4 font-bold text-white bg-rose-800 hover:bg-rose-900 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-13"
        >
          Continue
        </button>
      </div>
    </div>
  );
}

function Step5({ data, onUpdate, onSubmit, onBack }: { data: BookingData, onUpdate: (d: Partial<BookingData>) => void, onSubmit: () => void, onBack: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  // Generate fake dates for the upcoming week
  const slots: string[] = [];
  const today = new Date();
  for (let i = 1; i <= 5; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    d.setHours(10, 0, 0, 0); // 10 AM
    slots.push(d.toISOString());
    d.setHours(14, 0, 0, 0); // 2 PM
    slots.push(d.toISOString());
    d.setHours(16, 0, 0, 0); // 4 PM
    slots.push(d.toISOString());
  }

  // Group slots by day
  const groupedSlots = slots.reduce((acc, slot) => {
    const d = new Date(slot);
    const dayStr = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    if (!acc[dayStr]) acc[dayStr] = [];
    acc[dayStr].push(slot);
    return acc;
  }, {} as Record<string, string[]>);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onSubmit();
    setIsSubmitting(false);
  };

  if (showSummary && data.appointmentTime) {
    return (
      <div className="p-6 sm:p-8 animate-in fade-in slide-in-from-right-4 duration-300">
        <h2 className="font-serif text-2xl font-bold text-stone-900 mb-6 text-center">Confirm your consultation</h2>

        <div className="bg-stone-50 rounded-xl p-6 mb-8 border border-stone-100">
           <div className="space-y-4">
             <div className="flex justify-between pb-4 border-b border-stone-200">
               <span className="text-stone-500 font-medium">Name</span>
               <span className="font-bold text-stone-900">{data.firstName} {data.lastName}</span>
             </div>
             <div className="flex justify-between pb-4 border-b border-stone-200">
               <span className="text-stone-500 font-medium">Event</span>
               <span className="font-bold text-stone-900 capitalize">{data.eventType} ({data.eventDate})</span>
             </div>
             <div className="flex justify-between pb-4 border-b border-stone-200">
               <span className="text-stone-500 font-medium">Services</span>
               <div className="text-right">
                 {data.services.map(s => (
                   <div key={s} className="font-bold text-stone-900 capitalize">{s.replace('_', ' ')}</div>
                 ))}
               </div>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-stone-500 font-medium">Time</span>
               <span className="font-bold text-rose-800 text-right bg-rose-100 px-3 py-1 rounded-full">
                 {new Date(data.appointmentTime).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
               </span>
             </div>
           </div>
        </div>

        <div className="flex gap-4">
          <button onClick={() => setShowSummary(false)} disabled={isSubmitting} className="w-1/3 py-4 font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors min-h-13 disabled:opacity-50">Back</button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-2/3 py-4 flex items-center justify-center gap-2 font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-colors disabled:opacity-50 min-h-13"
          >
            {isSubmitting ? "Confirming..." : "Confirm Consultation"} <Check size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="font-serif text-2xl font-bold text-stone-900 mb-6 text-center">Pick a consultation time</h2>

      <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {Object.entries(groupedSlots).map(([day, daySlots]) => (
          <div key={day}>
            <h3 className="font-bold text-stone-900 mb-3">{day}</h3>
            <div className="grid grid-cols-2 gap-3">
              {daySlots.map(slot => {
                const isSelected = data.appointmentTime === slot;
                const d = new Date(slot);
                return (
                  <button
                    key={slot}
                    onClick={() => onUpdate({ appointmentTime: slot })}
                    className={`py-3 px-4 rounded-lg font-bold text-sm transition-all border ${
                      isSelected
                        ? "bg-stone-900 border-stone-900 text-white"
                        : "bg-white border-stone-200 text-stone-700 hover:border-stone-400 hover:shadow-sm"
                    }`}
                  >
                    {d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <button onClick={onBack} className="w-1/3 py-4 font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors min-h-13">Back</button>
        <button
          onClick={() => setShowSummary(true)}
          disabled={!data.appointmentTime}
          className="w-2/3 py-4 font-bold text-white bg-rose-800 hover:bg-rose-900 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-13"
        >
          Review Summary
        </button>
      </div>
    </div>
  );
}
