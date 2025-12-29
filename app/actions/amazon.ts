"use server";

import { v2 as cloudinary } from "cloudinary";

// --- Configuration ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// --- 1. Upload Image Action (Your existing code) ---
export async function uploadGiftImage(formData: FormData) {
  const file = formData.get("image") as File | null;
  // We can treat 'name' as optional if just uploading
  const name = (formData.get("name") as string) || "gift-image"; 

  if (!file) {
    throw new Error("No image selected");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "gifts" },
      (error, result) => {
        if (error) reject(error);
        else resolve({ url: result?.secure_url, name });
      }
    );
    stream.end(buffer);
  });
}

// --- 2. Amazon Search Action (Converted from route.ts) ---
export async function searchAmazonProducts(query: string) {
  const apiKey = process.env.SCRAPERAPI_KEY;

  if (!query) return { error: "Missing query" };
  if (!apiKey) return { error: "Server misconfiguration: No API Key" };

  try {
    const amazonUrl = `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
    // Using autoparse=true for ScraperAPI
    const scraperUrl = `http://api.scraperapi.com?api_key=${apiKey}&url=${encodeURIComponent(amazonUrl)}&autoparse=true&country_code=us`;

    const response = await fetch(scraperUrl);

    if (!response.ok) {
      throw new Error(`ScraperAPI error: ${response.status}`);
    }

    const data = await response.json();
    const rawResults = data.results || [];

    // Transform Data
    const results = rawResults.slice(0, 6).map((item: any) => ({
      title: item.name || item.title || "Unknown Item",
      url: item.url && !item.url.startsWith("http") ? `https://www.amazon.com${item.url}` : item.url,
      imageUrl: item.image || item.image_url || "",
      price: item.price ? parseFloat(item.price.toString().replace(/[^0-9.]/g, "")) : 0,
    }));

    if (results.length === 0) {
      return { 
        results: [], 
        message: "No results found." 
      };
    }

    return { results };

  } catch (error) {
    console.error("Scraping Error:", error);
    // Return empty list or mock data on error depending on preference
    return { error: "Failed to fetch Amazon results" };
  }
}