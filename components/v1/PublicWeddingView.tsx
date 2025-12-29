"use client";

import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Image from "next/image";
import { MapPin, Calendar, Heart, ArrowDown, ExternalLink } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import RsvpForm from "@/components/public/RsvpForm";
import GiftGrid from "@/components/public/GiftGrid";
import WeddingTimeline from "@/components/v1/WeddingTimeline";
import DeckGallery from "./DeckGallery";
import FanDeck from "./FanDeck";

// --- HELPER: FILM GRAIN TEXTURE ---
// Adds a subtle noise texture to the background for a "premium print" look
const GrainOverlay = () => (
  <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-50 mix-blend-overlay">
    <svg className="w-full h-full">
      <filter id="noiseFilter">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noiseFilter)" />
    </svg>
  </div>
);

// --- HELPER: FADE IN SECTION ---
function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98], delay }} // Custom "Apple-like" ease
      className={className}
    >
      {children}
    </motion.div>
  );
}

// --- HELPER: COUNTDOWN ---
function DaysToGo({ date }: { date: Date }) {
  const diff = new Date(date).getTime() - new Date().getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return <span>Happily Married</span>;
  if (days === 0) return <span>Today is the Day!</span>;
  return <span>{days} Days to Go</span>;
}

interface PublicWeddingViewProps {
  data: any;
  projectId: string;
}

export default function PublicWeddingView({ data, projectId }: PublicWeddingViewProps) {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Parallax Setup
  const { scrollYProgress: heroProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });
  const y = useTransform(heroProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(heroProgress, [0, 0.5], [1, 0]);

  const { weddingDetails } = data;

  // --- COMPONENT: FANCY NAV LINK ---
  const NavLink = ({ href, label }: { href: string; label: string }) => (
    <a
      href={href}
      className="text-white/70 hover:text-white text-xs md:text-sm font-semibold uppercase tracking-[0.15em] transition-all relative group py-2 px-4 rounded-full hover:bg-white/10"
    >
      {label}
    </a>
  );

  return (
    <div className="min-h-screen bg-[#FDFCF8] font-sans text-stone-800 overflow-x-hidden selection:bg-rose-200 selection:text-rose-900">
      
      {/* 1. TEXTURE OVERLAY & PROGRESS BAR */}
      <GrainOverlay />
      <motion.div style={{ scaleX }} className="fixed top-0 left-0 right-0 h-1 bg-rose-400 origin-left z-[60]" />

      {/* --- 2. HERO SECTION --- */}
      <section ref={targetRef} className="relative h-[110vh] w-full overflow-hidden flex items-center justify-center text-center">
        
        {/* Parallax Background Image */}
        <motion.div style={{ y, opacity }} className="absolute inset-0 w-full h-full will-change-transform">
          {weddingDetails?.coverImage ? (
            <Image 
              src={weddingDetails.coverImage} 
              alt="Cover" 
              fill 
              className="object-cover" 
              priority 
              quality={90}
            />
          ) : (
            <div className="absolute inset-0 bg-stone-300" />
          )}
          {/* Gradients for readability */}
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent" />
        </motion.div>

        {/* Hero Content */}
        <div className="relative z-10 text-white px-4 max-w-6xl mx-auto flex flex-col items-center pb-20">
          
          <motion.div
            initial={{ opacity: 0, letterSpacing: "0.8em" }}
            animate={{ opacity: 1, letterSpacing: "0.4em" }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            <p className="text-xs md:text-sm font-bold uppercase mb-6 text-rose-100/90">
              The Wedding Of
            </p>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="text-7xl md:text-9xl lg:text-[11rem] font-serif font-medium leading-[0.85] tracking-tight mix-blend-overlay opacity-90"
          >
            {weddingDetails?.groomName}
            <span className="block text-4xl md:text-6xl my-4 font-light italic font-serif text-rose-200/80">&</span>
            {weddingDetails?.brideName}
          </motion.h1>
          
          {/* Glass Pills for Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm md:text-base font-medium mt-16"
          >
            <div className="group flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full hover:bg-white/10 transition-all cursor-default">
               <Calendar className="w-4 h-4 text-rose-200 group-hover:text-rose-100" />
               <span className="tracking-widest uppercase">
                 {weddingDetails?.date ? new Date(weddingDetails.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : "Date TBD"}
               </span>
            </div>
            {weddingDetails?.location && (
              <div className="group flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-3 rounded-full hover:bg-white/10 transition-all cursor-default">
                 <MapPin className="w-4 h-4 text-rose-200 group-hover:text-rose-100" />
                 <span className="tracking-widest uppercase">{weddingDetails.location}</span>
              </div>
            )}
          </motion.div>

          {/* Navigation */}
          <motion.nav
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 1, delay: 1.2 }}
             className="mt-12 flex flex-wrap justify-center gap-2 md:gap-8 border-t border-white/10 pt-8"
          >
             <NavLink href="#itinerary" label="Itinerary" />
             <NavLink href="#gallery" label="Gallery" />
             <NavLink href="#registry" label="Registry" />
             <NavLink href="#rsvp" label="RSVP" />
          </motion.nav>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
           <div className="flex flex-col items-center gap-2">
             <span className="text-[10px] uppercase tracking-widest text-white/50">Scroll</span>
             <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
               <ArrowDown className="w-5 h-5 text-white/70" />
             </motion.div>
           </div>
        </motion.div>
      </section>


      {/* --- 3. WELCOME NOTE --- */}
      <section className="py-32 md:py-48 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <FadeIn>
            <div className="inline-flex items-center justify-center p-4 bg-rose-50 rounded-full mb-8 text-rose-500 shadow-sm">
              <Heart className="w-6 h-6 fill-current" />
            </div>
            <h2 className="text-4xl md:text-6xl font-serif text-stone-800 mb-10 leading-[1.1]">
              Join us for the <span className="italic text-rose-400">celebration</span> of a lifetime.
            </h2>
            <div className="w-24 h-px bg-stone-300 mx-auto mb-10"></div>
            <p className="text-stone-600 leading-loose text-lg md:text-xl max-w-2xl mx-auto font-serif">
              &ldquo;We can&apos;t wait to share our special day with you. Here you&apos;ll find all the details about the ceremony, reception, and registry. We look forward to dancing the night away with all of our favorite people!&rdquo;
            </p>
            {weddingDetails?.date && (
                <div className="mt-12 text-sm font-bold tracking-widest uppercase text-stone-400">
                    <DaysToGo date={weddingDetails.date} />
                </div>
            )}
          </FadeIn>
        </div>
      </section>


      {/* --- 4. TIMELINE --- */}
      {data.events.length > 0 && (
        <section id="itinerary" className="py-32 bg-stone-100/50 scroll-mt-20">
          <div className="max-w-5xl mx-auto px-6">
            <FadeIn className="text-center mb-20">
                 <span className="text-rose-500 font-bold tracking-widest uppercase text-xs mb-3 block">Order of Events</span>
                 <h2 className="text-5xl font-serif text-stone-900">The Itinerary</h2>
            </FadeIn>
            
            <FadeIn delay={0.2}>
              {/* Added a subtle shadow and border to container for structure */}
              <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-stone-100"> 
                  <WeddingTimeline projectId={projectId} events={data.events} /> 
              </div>
            </FadeIn>
          </div>
        </section>
      )}


{data.weddingDetails.galleryImages.length > 0 && (
        <section id="gallery" className="py-32 bg-stone-50 overflow-hidden relative">
           
          <div className="max-w-7xl mx-auto px-6">
            <FadeIn className="text-center mb-10">
                 <span className="text-rose-500 font-bold tracking-widest uppercase text-xs mb-3 block">Captured Moments</span>
                 <h2 className="text-5xl font-serif text-stone-900">The Gallery</h2>
            </FadeIn>
            
            {/* L'espace pour l'animation des cartes */}
            <div className="py-10">
                <FanDeck images={data.weddingDetails.galleryImages} />
            </div>

          </div>
        </section>
      )}


      {/* --- 6. REGISTRY --- */}
      {data.gifts && data.gifts.length > 0 && (
        <section id="registry" className="py-32 bg-[#FAF9F6] border-t border-stone-200 scroll-mt-20">
           <div className="max-w-6xl mx-auto px-6">
              <FadeIn className="text-center mb-20">
                   <span className="text-rose-500 font-bold tracking-widest uppercase text-xs mb-3 block">Registry</span>
                   <h2 className="text-5xl font-serif text-stone-900 mb-8">Gift Wishlist</h2>
                   <p className="text-stone-500 max-w-xl mx-auto text-lg leading-relaxed">
                      Your presence is the greatest gift. If you wish to honor us with a gift, we have selected a few items for our new home.
                   </p>
              </FadeIn>
              
              <FadeIn delay={0.2}>
                <GiftGrid gifts={data.gifts} />
              </FadeIn>
           </div>
        </section>
      )}


      {/* --- 7. RSVP CARD (Floating "Paper" Effect) --- */}
      <section id="rsvp" className="py-40 bg-stone-900 text-white relative overflow-hidden scroll-mt-20 flex items-center justify-center">
         
         {/* Atmospheric Background */}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-rose-900/40 via-stone-900 to-stone-900"></div>
         
         <div className="max-w-3xl w-full mx-auto px-6 relative z-10">
            <FadeIn>
              <div className="text-center mb-16">
                 <h2 className="text-5xl md:text-7xl font-serif font-medium mb-6 text-rose-100">R.S.V.P.</h2>
                 <p className="text-stone-400 text-lg tracking-wide uppercase">Kindly respond by {weddingDetails?.date ? new Date(new Date(weddingDetails.date).setMonth(new Date(weddingDetails.date).getMonth() - 1)).toLocaleDateString() : 'Next Month'}</p>
              </div>
            </FadeIn>
            
            <FadeIn delay={0.2}>
              {/* The "Card" Look */}
              <div className="bg-[#FAF9F6] text-stone-900 rounded-[2px] p-8 md:p-16 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] relative overflow-hidden transform md:rotate-1 hover:rotate-0 transition-transform duration-700 ease-out origin-top-left">
                 
                 {/* Paper texture overlay for the card itself */}
                 <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

                 <div className="relative z-10">
                    <RsvpForm projectId={projectId} />
                 </div>
              </div>
            </FadeIn>
         </div>
      </section>

      {/* Footer */}
      <footer className="py-12 text-center text-stone-500 text-sm bg-stone-950 border-t border-stone-900">
        <p className="font-serif italic text-lg opacity-60 hover:opacity-100 transition-opacity">
          Made with ❤️ for <span className="text-rose-200">{weddingDetails?.groomName} & {weddingDetails?.brideName}</span>
        </p>
      </footer>
    </div>
  );
}