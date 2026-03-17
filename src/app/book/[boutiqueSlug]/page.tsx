import ClientBookingForm from './ClientBookingForm';

export default function BookPage({ params }: { params: { boutiqueSlug: string } }) {
  // Pass the slug to the client component if needed
  return (
    <main className="min-h-screen bg-rose-50/30 flex justify-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-[540px]">
        {/* HEADER */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-2">
             <div className="w-10 h-10 bg-rose-800 rounded flex items-center justify-center text-white font-serif font-bold text-xl">
               N
             </div>
             <h1 className="font-serif text-3xl font-bold text-stone-900">Novela</h1>
          </div>
          <p className="text-stone-500 font-medium">(555) 123-4567</p>
        </div>

        <ClientBookingForm boutiqueSlug={params.boutiqueSlug} />
      </div>
    </main>
  );
}
