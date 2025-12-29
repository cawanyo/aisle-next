"use client";

import { MilestoneCard } from "@/components/MilestoneCard";
import type { Milestone } from "@/types/milestone";
import { motion } from "framer-motion";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { ChevronDown, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

// Define the shape of the data coming from the API
interface PhaseData {
  id: number;
  title: string;
  totalCost?: number;
  totalRealCost?: number;
  milestones: Milestone[];
}

interface RoadmapPathProps {
  phases: PhaseData[];
  completedMilestones: Set<number>;
  onMilestoneClick: (milestone: Milestone) => void;
}

export const RoadmapPath = ({ phases, completedMilestones, onMilestoneClick }: RoadmapPathProps) => {
  
  // Helper to format large numbers (e.g. $1.2k)
  const formatMoney = (amount?: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount || 0);
  };

  return (
    <div className="relative w-full max-w-5xl mx-auto px-2 md:px-0">
      {/* Winding Path Line */}
      <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-journey-start via-journey-active to-journey-complete transform md:-translate-x-1/2 opacity-30 z-0 rounded-full" />
      
      <div className="space-y-20 relative z-10">
        {phases.map((phase, phaseIndex) => {
          const phaseMilestones = phase.milestones || [];
          
          return (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full"
            >
              <Collapsible defaultOpen={true} className="w-full">
                {/* Phase Header Wrapper */}
                <div className="flex flex-col items-center mb-12 sticky top-20 z-20 pointer-events-none">
                  {/* The Button */}
                  <CollapsibleTrigger asChild>
                    <button className="pointer-events-auto group relative flex flex-col items-center bg-gradient-to-r from-primary via-accent to-secondary px-10 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 border-white/20">
                      
                      {/* Title */}
                      <div className="flex items-center gap-3">
                         <h3 className="text-lg md:text-xl font-bold text-primary-foreground text-center font-serif tracking-wide">
                          {phase.title}
                        </h3>
                        <ChevronDown className="w-5 h-5 text-primary-foreground/80 transition-transform duration-300 group-data-[state=open]:rotate-180" />
                      </div>

                      {/* Phase Budget Summary Badge */}
                      {(phase.totalCost || 0) > 0 && (
                        <div className="absolute -bottom-4 bg-background border border-border/50 shadow-sm px-3 py-1 rounded-full text-xs font-medium flex gap-2 items-center">
                          <span className="text-muted-foreground">Est: {formatMoney(phase.totalCost)}</span>
                          {(phase.totalRealCost || 0) > 0 && (
                            <>
                              <span className="w-px h-3 bg-border"></span>
                              <span className={cn(
                                (phase.totalRealCost || 0) > (phase.totalCost || 0) ? "text-destructive" : "text-emerald-600"
                              )}>
                                Real: {formatMoney(phase.totalRealCost)}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </button>
                  </CollapsibleTrigger>
                </div>
                
                {/* Collapsible Content */}
                <CollapsibleContent className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden">
                  <div className="space-y-12 py-2">
                    {phaseMilestones.map((milestone, index) => (
                      <div
                        key={milestone.id}
                        className={cn(
                          "flex items-center",
                          // Mobile: Left aligned with padding. Desktop: Alternating sides.
                          "flex-col md:flex-row",
                          index % 2 === 0 ? "md:justify-start" : "md:justify-end"
                        )}
                      >
                        {/* Card Container */}
                        <div 
                          className={cn(
                            "w-full pl-16 md:pl-0 md:w-5/12", // Mobile: padding for line. Desktop: 41% width
                            index % 2 === 0 ? "md:pr-12" : "md:pl-12" // Spacing from center line
                          )}
                        >
                          <MilestoneCard
                            milestone={milestone}
                            isCompleted={completedMilestones.has(milestone.id)}
                            onClick={() => onMilestoneClick(milestone)}
                            alignRight={index % 2 !== 0} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </motion.div>
          );
        })}
      </div>
      
      {/* Final Destination Marker */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
        className="flex justify-center mt-32 mb-12 relative z-10"
      >
        <div className="bg-gradient-to-r from-journey-complete to-accent px-16 py-8 rounded-full shadow-2xl animate-glow cursor-default border-4 border-white/20 backdrop-blur-sm">
          <p className="text-3xl md:text-4xl font-bold text-center text-white drop-shadow-md font-serif">
            💒 The Destination 💐
          </p>
        </div>
      </motion.div>
    </div>
  );
};