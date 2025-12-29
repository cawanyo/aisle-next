export type MilestoneType = "essential" | "optional";

export type PhaseType = 
  | "Setting the Coordinates"
  | "Building the Scenery"
  | "The Look & Feel"
  | "The Entertainment & Details"
  | "The Final Stretch"
  | "The Destination";

 // src/types/milestone.ts

export interface Milestone {
  id: number;
  title: string;
  type: "essential" | "optional";
  description: string;
  icon: string;
  tips?: string[];
  isCompleted: boolean;
  deadline?: string | Date;
  estimatedCost?: number;
  realCost?: number; // <--- NEW
  phase?: string;
}

export interface Phase {
  id: number;
  title: string;
  order: number;
  deadline?: string | Date;
  milestones: Milestone[];
  totalCost?: number;     // Sum of estimated
  totalRealCost?: number; // Sum of real <--- NEW
}