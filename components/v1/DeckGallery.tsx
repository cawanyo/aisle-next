"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface InfiniteDeckProps {
  images: { url: string }[];
}

export default function InfiniteDeck({ images }: InfiniteDeckProps) {
  // 1. Setup the deck state
  // If we have fewer than 4 images, we duplicate them to ensure the stack always looks full during the loop.
  const [cards, setCards] = useState(() => {
    const raw = images.map((img, i) => ({ ...img, uniqueId: `${i}-${img.url}` }));
    if (raw.length < 4 && raw.length > 0) {
       return [...raw, ...raw, ...raw]; // Triple it to ensure infinite loop feels smooth
    }
    return raw;
  });

  const [isPaused, setIsPaused] = useState(false);

  // 2. The Auto-Shuffle Logic
  useEffect(() => {
    if (isPaused || cards.length === 0) return;

    const interval = setInterval(() => {
      setCards((current) => {
        // Take the first card (front) and move it to the very end (back)
        const [front, ...rest] = current;
        return [...rest, front];
      });
    }, 3000); // Shuffle every 3 seconds

    return () => clearInterval(interval);
  }, [isPaused, cards.length]);

  // Only render the top 3 cards for performance, plus the one exiting
  const visibleCards = cards.slice(0, 3);

  return (
    <div 
      className="relative w-full h-[500px] flex items-center justify-center perspective-1000"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative w-72 h-96 md:w-80 md:h-[450px]">
        <AnimatePresence mode="popLayout">
          {visibleCards.map((card, index) => {
            return (
              <motion.div
                key={index} // Crucial: Key tracks the specific image
                layout // Helper: smooths layout changes
                
                // STACKING LOGIC
                style={{ 
                   zIndex: visibleCards.length - index, // Front card has highest Z
                }}
                
                // ANIMATION STATES
                initial={{ 
                  scale: 0.9, 
                  y: 20, 
                  opacity: 0 
                }}
                animate={{ 
                  scale: 1 - index * 0.05, // Front is 1, next is 0.95, etc.
                  y: -index * 15,          // Stack them vertically slightly
                  rotate: index % 2 === 0 ? index * 2 : index * -2, // Alternating messy rotation
                  opacity: 1,
                  x: 0,
                }}
                exit={{ 
                  x: 200,          // Fly right
                  y: 50,           // Drop down slightly
                  rotate: 20,      // Tilt
                  opacity: 0,      // Fade out
                  transition: { duration: 0.4 } 
                }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
                
                className="absolute inset-0 rounded-2xl bg-white p-3 shadow-2xl cursor-pointer"
              >
                {/* The "Polaroid" Frame content */}
                <div className="relative w-full h-full rounded-xl overflow-hidden bg-stone-200">
                  <Image
                    src={card.url}
                    alt="Gallery Memory"
                    fill
                    className="object-cover pointer-events-none" // prevent dragging image ghost
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  
                  {/* Glass Sheen Effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50 mix-blend-overlay"></div>
                </div>

                {/* Optional: Add a "Paused" hint only on the front card when hovered */}
                {index === 0 && isPaused && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[10px] uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-md z-20"
                  >
                    Paused
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Decorative "Stage" shadow under the deck */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-[200px] w-64 h-8 bg-black/20 blur-2xl rounded-full pointer-events-none"></div>
    </div>
  );
}