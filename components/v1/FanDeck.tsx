"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

interface FanDeckProps {
  images: { url: string }[];
}

export default function FanDeck({ images }: FanDeckProps) {
  const cards = images.slice(0, 6);
  
  const [animationState, setAnimationState] = useState<"spread" | "pile">("spread");
  const [isHovered, setIsHovered] = useState(false);
  const [isInView, setIsInView] = useState(false);

  // --- THE LOOP LOGIC ---
  useEffect(() => {
    // 1. If hovered, stop looping and force 'spread' so user can see/click
    if (isHovered) {
      setAnimationState("spread");
      return;
    }

    // 2. If not visible on screen yet, do nothing (wait)
    if (!isInView) return;

    let timeoutId: NodeJS.Timeout;

    const runLoop = () => {
      // Step 1: SPREAD (Show all cards)
      setAnimationState("spread");

      // Wait 5 Seconds
      timeoutId = setTimeout(() => {
        
        // Step 2: PILE (Group them)
        setAnimationState("pile");

        // Wait a brief moment (Transition time + 0.5s hold)
        // We allow ~800ms total: ~300ms for them to snap shut, 500ms to sit there.
        timeoutId = setTimeout(() => {
           runLoop(); // RESTART LOOP
        }, 1200); 

      }, 5000);
    };

    runLoop();

    return () => clearTimeout(timeoutId);
  }, [isHovered, isInView]);


  const centerIndex = (cards.length - 1) / 2;

  return (
    <motion.div 
      className="relative h-[400px] w-full flex items-center justify-center cursor-pointer perspective-1000"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onViewportEnter={() => setIsInView(true)} // Start loop when seen
      viewport={{ once: true, margin: "-100px" }}
    >
      {cards.map((img, index) => {
        const offsetFromCenter = index - centerIndex;
        
        // POSITIONS
        const spreadX = offsetFromCenter * 120; 
        const spreadRotate = offsetFromCenter * 5;
        const stackedRotate = (index % 2 === 0 ? 1 : -1) * (index * 3); // Messy stack

        return (
          <motion.div
            key={index}
            variants={{
              spread: { 
                x: spreadX, 
                y: 0, 
                rotate: spreadRotate,
                scale: 1,
                zIndex: index, 
                transition: { 
                  // Smooth opening
                  type: "spring", stiffness: 100, damping: 20 
                }
              },
              pile: { 
                x: offsetFromCenter * 2, // Slight offset so they aren't perfectly hidden
                y: 0, 
                rotate: stackedRotate,
                scale: 1,
                zIndex: index,
                transition: { 
                  // Snappy closing ("Group the deck")
                  type: "spring", stiffness: 150, damping: 20,
                  delay: index * 0.05 // Stagger effect
                }
              },
              hoverCard: {
                scale: 1.15,
                y: -40,
                zIndex: 100,
                transition: { type: "spring", stiffness: 300, damping: 20 }
              }
            }}
            
            initial="spread" 
            animate={animationState} // Controlled by the loop
            whileHover="hoverCard"   // Controlled by user mouse
            
            className="absolute w-40 h-56 md:w-56 md:h-72 bg-white p-2 rounded-xl shadow-2xl border border-stone-100 origin-bottom"
            style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
          >
            <div className="relative w-full h-full rounded-lg overflow-hidden bg-stone-200">
               <Image
                 src={img.url}
                 alt="Memory"
                 fill
                 className="object-cover"
                 sizes="(max-width: 768px) 100vw, 33vw"
               />
               <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none"></div>
            </div>
          </motion.div>
        );
      })}
      
      {/* Progress Bar (Optional Visual Cue) */}
      {!isHovered && animationState === "spread" && (
         <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-stone-200 rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: "0%" }}
               animate={{ width: "100%" }}
               transition={{ duration: 5, ease: "linear" }}
               className="h-full bg-rose-300"
             />
         </div>
      )}
    </motion.div>
  );
}