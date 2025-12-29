import { PrismaClient } from "@prisma/client";
import GiftForm from "@/components/v1/GiftForm"; // Adjust path if needed
import Image from "next/image";
import Link from "next/link";
import { getGifts } from "@/app/actions/gift";

const prisma = new PrismaClient();

// 1. Fetch gifts directly in the Server Component


export default async function WishlistPage({ params }: { params: { projectId: string } }) {
  // Await params in Next.js 15 (or just use params.projectId in older versions)
  const { projectId } = await params; 
  const gifts = await getGifts(projectId);

  return (
    <main className="max-w-4xl mx-auto py-10 px-4">
      
      {/* --- HEADER --- */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Project Wishlist</h1>
        <p className="text-gray-500 mt-2">Manage gifts and ideas for this project.</p>
      </div>

      <div className="grid md:grid-cols-[1fr_350px] gap-8 items-start">
        
        {/* --- LEFT COLUMN: LIST OF EXISTING GIFTS --- */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold border-b pb-2">Current Gifts ({gifts.length})</h2>
          
          {gifts.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">No gifts added yet. Use the form to add one!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {gifts.map((gift) => (
                <div key={gift.id} className="border border-gray-200 rounded-lg p-4 flex flex-col bg-white shadow-sm hover:shadow-md transition">
                  {/* Image */}
                  <div className="relative w-full h-40 mb-3 bg-gray-100 rounded-md overflow-hidden">
                    {gift.imageUrl ? (
                      <Image 
                        src={gift.imageUrl} 
                        alt={gift.name} 
                        fill 
                        className="object-contain" 
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <h3 className="font-semibold text-gray-800 line-clamp-1">{gift.name}</h3>
                  <div className="mt-auto pt-2 flex items-center justify-between">
                    <span className="text-green-600 font-bold">
                      {gift.price && gift.price > 0 ? `$${gift.price.toFixed(2)}` : "Price N/A"}
                    </span>
                    {gift.url && gift.url !== "#" && (
                      <a 
                        href={gift.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100"
                      >
                        View Item ↗
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- RIGHT COLUMN: THE ADD GIFT FORM --- */}
        <div className="sticky top-6">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Add New Item</h2>
            </div>
            {/* Pass the projectId prop here */}
            <GiftForm projectId={projectId} />
          </div>
        </div>

      </div>
    </main>
  );
}