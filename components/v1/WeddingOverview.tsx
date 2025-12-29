"use client";

import Link from "next/link";
import Image from "next/image";

interface WeddingOverviewProps {
  projectId: string;
  data?: {
    groomName?: string | null;
    brideName?: string | null;
    date?: Date | null;
    location?: string | null;
    coverImage?: string | null;
  } | null;
}


// Reusing your previous logic, but styling heavily
export default function WeddingOverview({ projectId, data }: WeddingOverviewProps) {
  
  if (!data) {
    // Empty State
    return (
      <div className="h-full bg-white rounded-3xl border border-dashed border-stone-300 p-8 flex flex-col items-center justify-center text-center group hover:border-rose-300 transition-colors">
        <div className="w-16 h-16 bg-rose-50 text-rose-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
        </div>
        <h3 className="text-xl font-serif font-bold text-stone-800 mb-2">Let's Get Started</h3>
        <p className="text-stone-500 mb-6 max-w-xs text-sm">Add the couple's names, date, and a beautiful cover photo.</p>
        <Link 
          href={`/project/${projectId}/details`}
          className="bg-stone-900 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-rose-600 transition shadow-lg shadow-rose-900/10"
        >
          Setup Wedding
        </Link>
      </div>
    );
  }

  const formattedDate = data.date 
    ? new Date(data.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : "Date TBD";

  return (
    <div className="relative group h-full bg-white rounded-3xl shadow-xl shadow-stone-200/50 overflow-hidden border border-stone-100 flex flex-col">
      {/* Image Layer */}
      <div className="relative h-64 w-full bg-stone-200">
        {data.coverImage ? (
          <Image src={data.coverImage} alt="Cover" fill className="object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-stone-400 bg-stone-100">
             <span className="font-serif italic text-lg opacity-50">No Cover Photo</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
        
        {/* Edit Button */}
        <Link 
          href={`/project/${projectId}/details`}
          className="absolute top-4 right-4 bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-rose-600 p-2.5 rounded-full transition-all duration-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
        </Link>
      </div>

      {/* Text Layer */}
      <div className="p-8 flex-1 flex flex-col justify-center text-center -mt-10 relative z-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 mx-4">
            <h2 className="text-3xl font-serif text-stone-800 mb-1">
              {data.groomName || "Groom"} <span className="text-rose-400 italic">&</span> {data.brideName || "Bride"}
            </h2>
            <div className="h-px w-16 bg-rose-200 mx-auto my-4"></div>
            <p className="text-stone-500 font-medium uppercase tracking-widest text-xs mb-1">Save the Date</p>
            <p className="text-stone-800 font-medium">{formattedDate}</p>
            <p className="text-stone-400 text-sm mt-1">{data.location || "Location TBD"}</p>
        </div>
      </div>
    </div>
  );
}