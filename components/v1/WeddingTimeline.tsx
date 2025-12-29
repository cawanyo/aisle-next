"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  Heart, Utensils, GlassWater, Music, Camera, 
  MapPin, Clock, Star, PartyPopper 
} from "lucide-react";

export interface WeddingEvent {
  id: string | null;
  title: string | null;
  time: string | null;
  location?: string | null;
  description?: string | null;
  icon?: string | null;
  date?: Date | null;
}
interface TimelineProps {
  projectId: string;
  events: WeddingEvent[];
  onDelete?: (eventId: string) => void;
  onEdit?: (e:any) => void;
}

// Helper to get icons based on keywords
const getEventIcon = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes("ceremony") || t.includes("vow")) return <Heart className="w-5 h-5" />;
  if (t.includes("dinner") || t.includes("lunch") || t.includes("eat")) return <Utensils className="w-5 h-5" />;
  if (t.includes("cocktail") || t.includes("drink")) return <GlassWater className="w-5 h-5" />;
  if (t.includes("party") || t.includes("dance") || t.includes("disco")) return <Music className="w-5 h-5" />;
  if (t.includes("photo")) return <Camera className="w-5 h-5" />;
  if (t.includes("arrival") || t.includes("welcome")) return <MapPin className="w-5 h-5" />;
  if (t.includes("cake")) return <PartyPopper className="w-5 h-5" />;
  return <Star className="w-5 h-5" />; // Default fancy icon
};

export default function WeddingTimeline({ projectId, events, onDelete, onEdit }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll Progress for the "Drawing Line"
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 50%"],
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <div ref={containerRef} className="relative w-full max-w-4xl mx-auto py-10">
      
      {/* --- THE CENTRAL THREAD --- */}
      {/* Background static line */}
      <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-stone-200 -translate-x-1/2 rounded-full" />
      
      {/* Animated drawing line (Rose Gold) */}
      <motion.div 
        style={{ height: lineHeight }}
        className="absolute left-8 md:left-1/2 top-0 w-[2px] bg-gradient-to-b from-rose-300 via-rose-400 to-rose-300 -translate-x-1/2 rounded-full z-10 origin-top"
      />

      <div className="flex flex-col gap-12 md:gap-24 relative z-20">
        {events.map((event, index) => {
          const isEven = index % 2 === 0;
          return (
            <TimelineItem 
              key={index} 
              event={event} 
              index={index} 
              isEven={isEven} 
            />
          );
        })}
      </div>
      
      {/* End Ornament */}
      <div className="absolute bottom-0 left-8 md:left-1/2 -translate-x-1/2 translate-y-full pt-4">
        <div className="w-2 h-2 rounded-full bg-rose-300 animate-pulse"></div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENT: INDIVIDUAL ROW ---
function TimelineItem({ event, index, isEven }: { event: WeddingEvent; index: number; isEven: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1, type: "spring", bounce: 0.4 }}
      className={`relative flex flex-col md:flex-row items-start md:items-center w-full ${
        isEven ? "md:flex-row-reverse" : ""
      }`}
    >
      
      {/* 1. THE CONTENT CARD */}
      <div className="pl-20 md:pl-0 md:w-1/2 flex justify-center md:block p-10 md:p-0">
        <div 
           className={`relative p-6 bg-white border border-stone-100 rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 group w-full max-w-md ${
             isEven ? "md:mr-12 md:text-right" : "md:ml-12 md:text-left"
           }`}
        >
           {/* Decorative corner accent */}
           <div className={`absolute top-4 w-8 h-8 border-t border-stone-200 transition-all group-hover:border-rose-300 ${isEven ? "right-4 border-r rounded-tr-xl" : "left-4 border-l rounded-tl-xl"}`}></div>

           <h3 className="text-2xl font-serif font-bold text-stone-800 mb-2 group-hover:text-rose-500 transition-colors">
             {event.title}
           </h3>
           
           <p className="text-stone-500 text-sm leading-relaxed mb-3 font-medium">
             {event.description || "Join us for this special moment."}
           </p>
           
           {event.location && (
             <div className={`flex items-center gap-2 text-xs text-stone-400 font-bold uppercase tracking-wider ${isEven ? "md:justify-end" : "justify-start"}`}>
               <MapPin className="w-3 h-3" /> {event.location}
             </div>
           )}
        </div>
      </div>


      {/* 2. THE CENTRAL NODE (The Dot) */}
      <div className="absolute left-8 md:left-1/2 -translate-x-1/2 flex items-center justify-center">
        {/* Pulsing Back layer */}
        <div className="absolute w-12 h-12 bg-rose-100 rounded-full opacity-0 animate-ping group-hover:opacity-100 duration-1000"></div>
        
        {/* Front layer */}
        <motion.div 
           whileHover={{ scale: 1.2, rotate: 15 }}
           className="relative w-10 h-10 bg-white border-2 border-rose-200 rounded-full flex items-center justify-center text-rose-400 shadow-lg z-30"
        >
          {getEventIcon(event.title || "")}
        </motion.div>
      </div>


      {/* 3. THE TIME DISPLAY */}
      <div className={`absolute md:relative left-20 md:left-auto top-0 md:top-auto md:w-1/2 flex ${isEven ? "md:justify-start md:pl-12" : "md:justify-end md:pr-12"}`}>
         <div className={`flex items-center gap-2 ${isEven ? "flex-row" : "md:flex-row-reverse"}`}>
            <Clock className="w-4 h-4 text-rose-300" />
            <span className="font-serif font-bold text-xl text-stone-400">{event.date?.toDateString()}</span>
         </div>
      </div>

    </motion.div>
  );
}