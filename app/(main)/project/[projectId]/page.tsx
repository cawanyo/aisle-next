import { PrismaClient } from "@prisma/client";
import WeddingOverview from "@/components/v1/WeddingOverview";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getWeddingDetails, getWeddingEvents } from "@/app/actions/wedding";
import WeddingGalleryWidget from "@/components/v1/WeddingGaleryWidget";
import WeddingTimeline from "@/components/v1/WeddingTimeline";

const prisma = new PrismaClient();

// 1. Fetch Wedding Details


// 2. Fetch Gift Summary (Optional: to show stats on dashboard)
async function getGiftStats(projectId: string) {
  const count = await prisma.gift.count({
    where: { projectId },
  });
  return count;
}

export default async function ProjectOverviewPage({ params }: { params: { projectId: string } }) {
  // Await params for Next.js 15 compatibility
  const { projectId: id } = await params;
  
  // Fetch data in parallel
  const [weddingData, giftCount, weddingEvents] = await Promise.all([
    getWeddingDetails(id),
    getGiftStats(id),
    getWeddingEvents(id)
  ]);

  console.log("Wedding Events:", weddingEvents);

  // If you have a Project model, you might want to check if project exists here
  // const project = await prisma.project.findUnique({ where: { id } });
  // if (!project) notFound();

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* --- Header --- */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Project Dashboard</h1>
            <p className="text-gray-500 mt-1">Overview of your wedding planning progress.</p>
          </div>
          <div className="flex gap-3">
             <Link 
               href={`/project/${id}/registry`}
               className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-200 font-medium hover:bg-gray-50 transition shadow-sm"
             >
               View Wishlist
             </Link>
             <Link 
               href={`/project/${id}/details`} 
               className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-black transition shadow-sm"
             >
               Edit Settings
             </Link>
          </div>
        </div>

        {/* --- Dashboard Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Wedding Overview Card */}
          <div className="lg:col-span-1 space-y-6 mb-10">
            <h2 className="text-xl font-semibold text-gray-800">Wedding Details</h2>
            <WeddingOverview projectId={id} data={weddingData} />
          </div>

          {/* RIGHT COLUMN: Quick Actions & Stats */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. Quick Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Gift Stat Card */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-500 font-medium text-sm uppercase">Total Gifts</h3>
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-gray-900">{giftCount}</span>
                  <span className="text-gray-400 text-sm">items listed</span>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link href={`/project/${id}/registry`} className="text-blue-600 text-sm font-medium hover:underline">
                    Manage Wishlist &rarr;
                  </Link>
                </div>
              </div>

              {/* Gallery Stat Card (Mockup since we fetched details already) */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-500 font-medium text-sm uppercase">Gallery Status</h3>
                   <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                </div>

                <div className="flex items-baseline gap-2">
                   {weddingData?.coverImage ? (
                     <span className="text-green-600 text-sm font-bold bg-green-50 px-2 py-1 rounded">Active</span>
                   ) : (
                     <span className="text-gray-500 text-sm font-medium">Not Setup</span>
                   )}
                </div>
                 <div className="mt-auto pt-8 border-t border-gray-100">
                  <Link href={`/project/${id}/details`} className="text-rose-600 text-sm font-medium hover:underline">
                    Update Photos &rarr;
                  </Link>
                </div>
              </div>
            </div>


            {/* 2. Next Steps / Onboarding Box */}
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-xl p-8">
              <h3 className="text-lg font-bold text-indigo-900 mb-2">Next Steps</h3>
              <ul className="space-y-3 mt-4">
                <li className="flex items-center text-indigo-800">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 text-xs ${weddingData?.groomName ? "bg-green-200 text-green-800" : "bg-white border border-indigo-200"}`}>
                    {weddingData?.groomName ? "✓" : "1"}
                  </span>
                  Set up wedding names & date
                </li>
                <li className="flex items-center text-indigo-800">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 text-xs ${giftCount > 0 ? "bg-green-200 text-green-800" : "bg-white border border-indigo-200"}`}>
                    {giftCount > 0 ? "✓" : "2"}
                  </span>
                  Add at least one gift to wishlist
                </li>
                <li className="flex items-center text-indigo-800">
                   <span className="w-5 h-5 rounded-full bg-white border border-indigo-200 flex items-center justify-center mr-3 text-xs">3</span>
                  Share link with guests (Coming Soon)
                </li>
              </ul>
            </div>

          </div>

          
        </div>
       
      </div>
      <div className=" mt-10">
          <WeddingTimeline projectId={id} events={weddingEvents || []} />
      </div>
    </main>
  );
}