"use client";

import { useState, useRef, useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom"; 
import { searchAmazonProducts, uploadGiftImage} from "@/app/actions/amazon";
import Image from "next/image";
import { createGift } from "@/app/actions/gift";

// --- Submit Button ---
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-3 px-4 bg-gray-900 text-white font-bold rounded-lg hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
    >
      {pending ? "Saving Gift..." : "Add to Wishlist"}
    </button>
  );
}

// --- Icons ---
const UploadIcon = () => (<svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>);
const SearchIcon = () => (<svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);

const initialState = { message: "" };

interface GiftFormProps {
  projectId: string;
}

export default function GiftForm({ projectId }: GiftFormProps) {
  const [state, formAction] = useActionState(createGift, initialState);

  // UI State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productUrl, setProductUrl] = useState(""); // <-- Stores the link
  
  // Drag & Search State
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form on success
  useEffect(() => {
    if (state?.message?.includes("Success")) {
      setSelectedImage(null);
      setProductName("");
      setProductPrice("");
      setProductUrl(""); // Reset URL
      setSearchResults([]);
      setSearchQuery("");
    }
  }, [state]);

  // --- Handler: Manual File Upload ---
  const handleFile = async (file: File) => {
    setIsUploading(true);
    const objectUrl = URL.createObjectURL(file);
    setSelectedImage(objectUrl);
    
    // If starting fresh, suggest name from file, clear old URL
    if (!productName) setProductName(file.name.split('.')[0]);
    if (!productUrl) setProductUrl(""); 

    try {
      const formData = new FormData();
      formData.append("image", file);
      const result: any = await uploadGiftImage(formData);
      setSelectedImage(result.url); 
    } catch (err) {
      alert("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  // --- Handler: Amazon Search ---
  const handleSearch = async () => {
    if (!searchQuery) return;
    setIsSearching(true);
    setSearchResults([]);
    const response = await searchAmazonProducts(searchQuery);
    if (response.results) setSearchResults(response.results);
    setIsSearching(false);
  };

  const selectAmazonItem = (item: any) => {
    setSelectedImage(item.imageUrl);
    setProductName(item.title);
    setProductPrice(item.price);
    setProductUrl(item.url); // <-- Auto-fill URL from Amazon
    setSearchResults([]); 
  };

  return (
    <form action={formAction} className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      
      {/* Hidden Inputs for ID and Image (URL is now visible below) */}
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="imageUrl" value={selectedImage || ""} />

      {/* 1. IMAGE AREA */}
      <div className="mb-6 flex justify-center">
        {selectedImage ? (
          <div className="relative w-48 h-48 rounded-lg overflow-hidden border border-gray-200 shadow-sm group">
            <Image src={selectedImage} alt="Selected" fill className="object-cover" />
            <button 
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            {isUploading && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm font-medium">Uploading...</div>}
          </div>
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:bg-gray-50"}`}
          >
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
            <UploadIcon />
            <p className="text-sm text-gray-500 font-medium">Click or drag image</p>
          </div>
        )}
      </div>

      {/* 2. SEARCH BAR */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Or search Amazon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if(e.key === "Enter") { e.preventDefault(); handleSearch(); } }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <div className="absolute left-3 top-2.5"><SearchIcon /></div>
        </div>
        <button type="button" onClick={handleSearch} disabled={isSearching} className="px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded-lg hover:bg-blue-200 transition">
          {isSearching ? "..." : "Search"}
        </button>
      </div>

      {/* 3. SEARCH RESULTS */}
      {searchResults.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6 bg-gray-50 p-3 rounded-lg">
          {searchResults.map((item, idx) => (
            <div key={idx} onClick={() => selectAmazonItem(item)} className="bg-white p-2 rounded border border-gray-200 cursor-pointer hover:border-blue-500">
              <div className="relative w-full h-20 mb-2">
                <Image src={item.imageUrl} alt="" fill className="object-contain" />
              </div>
              <p className="text-xs line-clamp-2">{item.title}</p>
              <p className="text-xs font-bold text-green-600">${item.price}</p>
            </div>
          ))}
        </div>
      )}

      {/* 4. DETAILS INPUTS */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
          <input 
            name="name" 
            required
            value={productName} 
            onChange={(e) => setProductName(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none" 
            placeholder="e.g. Lego Star Wars Set"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
            <input 
              name="price" 
              type="number" 
              step="0.01" 
              value={productPrice}
              onChange={(e) => setProductPrice(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none" 
              placeholder="0.00"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Link</label>
            <input 
              name="productUrl" 
              type="url"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black outline-none text-blue-600 underline" 
              placeholder="https://..."
            />
          </div>
        </div>
      </div>

      {/* 5. SUBMIT */}
      <SubmitButton />
      
      {state?.message && (
        <p className={`mt-4 text-center text-sm font-medium ${state.message.includes("Success") ? "text-green-600" : "text-red-600"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}