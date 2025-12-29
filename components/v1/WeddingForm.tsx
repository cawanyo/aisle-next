"use client";

import { useState, useRef, useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { saveWeddingDetails } from "@/app/actions/wedding";
import Image from "next/image";


// --- Types ---
type ExistingImage = { id: string; url: string };

// --- Icons ---
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

const UploadIcon = ({ isDragging }: { isDragging: boolean }) => (
  <svg className={`w-10 h-10 mb-3 ${isDragging ? "text-rose-500" : "text-gray-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

// --- Submit Button ---
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 bg-rose-600 text-white font-bold rounded-lg hover:bg-rose-700 transition disabled:opacity-50 mt-8"
    >
      {pending ? "Saving..." : "Save Wedding Details"}
    </button>
  );
}

interface WeddingFormProps {
  projectId: string;
  initialData?: any;
}

export default function WeddingForm({ projectId, initialData }: WeddingFormProps) {
  const [state, formAction] = useActionState(saveWeddingDetails, { message: "" });
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // --- State ---
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  
  // Existing images from DB (contain ID + URL)
  const [existingGallery, setExistingGallery] = useState<ExistingImage[]>([]);
  
  // New local file previews (URL strings only)
  const [newGalleryPreviews, setNewGalleryPreviews] = useState<string[]>([]);
  
  // Track IDs of images the user clicked "Trash" on
  const [imagesToDeleteIds, setImagesToDeleteIds] = useState<string[]>([]);
  
  const [isDragging, setIsDragging] = useState(false);

  // --- 1. Load Data on Mount/Update ---
  useEffect(() => {
    if (initialData) {
      setCoverPreview(initialData.coverImage || null);
      if (initialData.galleryImages && Array.isArray(initialData.galleryImages)) {
        setExistingGallery(initialData.galleryImages);
      }
      setImagesToDeleteIds([]); // Reset pending deletions
    }
  }, [initialData]);

  // --- 2. Reset Form on Success ---
  useEffect(() => {
    if (state?.message?.includes("Success")) {
      setNewGalleryPreviews([]); // Clear local previews
      setImagesToDeleteIds([]);  // Clear deletion queue
      if (galleryInputRef.current) galleryInputRef.current.value = "";
      // Note: 'existingGallery' updates automatically via the useEffect above 
      // because the Server Action triggers revalidatePath, updating 'initialData'.
    }
  }, [state]);

  // --- Handlers ---

  // Handle Cover Image Selection
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setCoverPreview(URL.createObjectURL(file));
  };

  // Handle Trash Click (Queue for deletion)
  const handleDeleteExisting = (imageId: string) => {
    setImagesToDeleteIds((prev) => [...prev, imageId]);
    setExistingGallery((prev) => prev.filter((img) => img.id !== imageId));
  };

  // Handle Gallery Files (Syncs Previews + Input)
  const updateGalleryFiles = (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    // A. Generate Visual Previews
    const newPreviews = Array.from(files).map((file) => URL.createObjectURL(file));
    setNewGalleryPreviews((prev) => [...prev, ...newPreviews]);

    // B. Update Hidden Input (Crucial: Appends new files to existing selection)
    if (galleryInputRef.current) {
      const dataTransfer = new DataTransfer();
      
      // Keep files already in the input
      if (galleryInputRef.current.files) {
        Array.from(galleryInputRef.current.files).forEach((file) => dataTransfer.items.add(file));
      }
      // Add newly dropped/selected files
      Array.from(files).forEach((file) => dataTransfer.items.add(file));
      
      galleryInputRef.current.files = dataTransfer.files;
    }
  };

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      updateGalleryFiles(e.dataTransfer.files);
    }
  };


  
  return (
    <form action={formAction} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 max-w-5xl mx-auto">
      <h2 className="text-2xl font-serif text-gray-800 mb-6">Edit Wedding Details</h2>
      
      {/* --- Hidden Inputs for Server Action --- */}
      <input type="hidden" name="projectId" value={projectId} />
      {/* Sends the array of IDs to delete as a JSON string */}
      <input type="hidden" name="deletedImageIds" value={JSON.stringify(imagesToDeleteIds)} />

      {/* --- Top Section: Details & Cover --- */}
      <div className="grid md:grid-cols-[1fr_300px] gap-8 mb-10">
        
        {/* Left: Text Inputs */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Groom's Name</label>
              <input name="groomName" defaultValue={initialData?.groomName || ""} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-rose-500 outline-none" placeholder="Harry" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bride's Name</label>
              <input name="brideName" defaultValue={initialData?.brideName || ""} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-rose-500 outline-none" placeholder="Meghan" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Wedding Date</label>
            <input 
              type="date" 
              name="date" 
              defaultValue={initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : ''} 
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-rose-500 outline-none" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input name="location" defaultValue={initialData?.location || ""} className="w-full p-2 border rounded-md focus:ring-2 focus:ring-rose-500 outline-none" placeholder="Windsor Castle" />
          </div>
        </div>

        {/* Right: Cover Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Cover Photo</label>
          <div className="relative w-full h-48 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition group">
            {coverPreview ? (
              <>
                <Image src={coverPreview} alt="Cover" fill className="object-cover" sizes="(max-width: 768px) 100vw, 300px" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-medium transition">
                  Click to Change
                </div>
              </>
            ) : (
              <div className="text-center p-4">
                <span className="text-xs text-gray-500">Upload Cover</span>
              </div>
            )}
            <input type="file" name="coverImage" accept="image/*" onChange={handleCoverChange} className="absolute inset-0 opacity-0 cursor-pointer" />
          </div>
        </div>
      </div>

      <hr className="border-gray-200 mb-8" />

      {/* --- Gallery Section --- */}
      <div>
        <label className="block text-lg font-medium text-gray-800 mb-4">Photo Gallery</label>

        {/* Drop Zone */}
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => galleryInputRef.current?.click()}
          className={`
            w-full py-8 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors mb-6
            ${isDragging ? "border-rose-500 bg-rose-50" : "border-gray-300 hover:bg-gray-50"}
          `}
        >
          <UploadIcon isDragging={isDragging} />
          <p className="text-gray-600 font-medium">Drag & Drop photos here</p>
          <p className="text-sm text-gray-400 mt-1">or click to select files</p>
          
          <input 
            ref={galleryInputRef}
            type="file" 
            name="galleryImages" 
            accept="image/*" 
            multiple 
            onChange={(e) => e.target.files && updateGalleryFiles(e.target.files)}
            className="hidden" 
          />
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
          
          {/* 1. SAVED Images (from DB) with TRASH button */}
          {existingGallery.map((image) => (
            <div key={image.id} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
              {image.url && (
                <Image 
                  src={image.url} 
                  alt="Saved" 
                  fill 
                  className="object-cover transition group-hover:scale-105" 
                  sizes="(max-width: 768px) 33vw, 20vw"
                />
              )}
              {/* Overlay + Trash Button */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-2">
                 <button
                  type="button" 
                  onClick={() => handleDeleteExisting(image.id)}
                  className="bg-white text-rose-600 p-1.5 rounded-full hover:bg-rose-600 hover:text-white transition shadow-sm"
                  title="Remove image"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))}

          {/* 2. NEW Images (Pending Upload) with Badge */}
          {newGalleryPreviews.map((src, idx) => (
            <div key={`new-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border-2 border-rose-500 opacity-90">
              <Image src={src} alt="New" fill className="object-cover" sizes="(max-width: 768px) 33vw, 20vw" />
              <div className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm z-10">
                New
              </div>
            </div>
          ))}
          
        </div>

        {/* Empty State */}
        {existingGallery.length === 0 && newGalleryPreviews.length === 0 && (
          <p className="text-center text-sm text-gray-400 mt-4 italic">No photos in gallery yet.</p>
        )}
      </div>

      <SubmitButton />
      
      {state?.message && (
        <div className={`mt-6 p-3 rounded-lg text-center font-medium ${state.message.includes("Success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {state.message}
        </div>
      )}
    </form>
  );
}