"use client";

import Link from "next/link";
import Image from "next/image";

interface GalleryWidgetProps {
  projectId: string;
  images: { id: string; url: string }[];
}

export default function WeddingGalleryWidget({ projectId, images }: GalleryWidgetProps) {
  const hasImages = images && images.length > 0;
  
  // We take up to 3 images for the stack effect
  const displayImages = hasImages ? images.slice(0, 3) : [];

  return (
    <div className="h-full bg-white rounded-[2rem] shadow-sm border border-stone-100 p-6 flex flex-col relative overflow-hidden group">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-6 relative z-10">
        <div>
          <h3 className="font-serif text-xl font-bold text-stone-800">Photo Gallery</h3>
          <p className="text-xs text-stone-500 font-medium uppercase tracking-wider mt-1">
            {hasImages ? `${images.length} Memories Saved` : "No Photos Yet"}
          </p>
        </div>
        <Link 
          href={`/wedding/${projectId}/details`}
          className="text-xs font-bold text-stone-400 hover:text-rose-500 transition-colors"
        >
          MANAGE &rarr;
        </Link>
      </div>

      {/* --- 3D STAGE --- */}
      <div className="flex-1 relative flex items-center justify-center min-h-[220px] perspective-1000">
        
        {!hasImages ? (
          // Empty State
          <Link 
             href={`/wedding/${projectId}/details`}
             className="border-2 border-dashed border-stone-200 rounded-2xl w-full h-full flex flex-col items-center justify-center text-stone-400 hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50/30 transition-all cursor-pointer"
          >
             <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
             <span className="text-sm font-medium">Upload Photos</span>
          </Link>
        ) : (
          // 3D PHOTO STACK
          <div className="relative w-40 h-48 md:w-48 md:h-56 transform-style-3d cursor-pointer">
            {displayImages.map((img, index) => {
              // Calculate different rotations for "scattered" look
              // Index 0: Bottom, Index 2: Top
              const isFirst = index === 0;
              const isSecond = index === 1;
              const isThird = index === 2;

              let rotationClass = "";
              let zIndex = 0;
              
              // Tailwind doesn't allow dynamic class construction easily for arbitrary values, 
              // so we use inline styles for the specific 3D rotations or preset classes.
              // Here is a logic to stack them:
              
              if (index === 0) zIndex = 10;
              if (index === 1) zIndex = 20;
              if (index === 2) zIndex = 30;

              return (
                <div
                  key={img.id}
                  className={`
                    absolute top-0 left-0 w-full h-full bg-white p-2 shadow-xl rounded-lg border border-stone-100
                    transition-all duration-700 ease-out
                    group-hover:scale-105
                    ${/* Hover Effects: Fan them out */ ""}
                    ${index === 0 ? "group-hover:-translate-x-12 group-hover:-rotate-12" : ""}
                    ${index === 1 ? "group-hover:translate-y-2" : ""}
                    ${index === 2 ? "group-hover:translate-x-12 group-hover:rotate-12" : ""}
                  `}
                  style={{
                    zIndex: zIndex,
                    // Initial "Scattered on table" look
                    transform: index === 0 ? 'rotate(-6deg) translateX(-10px)' : 
                               index === 1 ? 'rotate(4deg) translateX(5px)' : 
                               'rotate(-3deg)',
                  }}
                >
                  <div className="relative w-full h-full overflow-hidden rounded-[2px] bg-stone-100">
                     <Image 
                       src={img.url} 
                       alt="Gallery" 
                       fill 
                       className="object-cover"
                       sizes="(max-width: 768px) 50vw, 33vw"
                     />
                  </div>
                </div>
              );
            })}
            
            {/* View All Overlay (Appears on Hover) */}
            <Link 
               href={`/wedding/${projectId}/details`}
               className="absolute inset-0 z-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            >
               <span className="bg-stone-900/80 backdrop-blur-sm text-white px-4 py-2 rounded-full text-xs font-bold tracking-wide shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                 View Gallery
               </span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}