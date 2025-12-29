
import { getRoadmap } from "@/app/actions/roadmap";
import { getTeam } from "@/app/actions/team";
import { Button } from "@/components/ui/button";
import { RoadmapView } from "@/components/v1/RoadmapView";
import { Sparkles } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function RoadmapPage({ params }: PageProps) {
  const { projectId } = await params;
  
  // Parallel Fetching: Get Roadmap AND Team
  const [phases, teamData] = await Promise.all([
    getRoadmap(projectId),
    getTeam(projectId)
  ]);

  const team = teamData?.team || []; // Extract just the member array

  if (!phases) return <div>Access Denied</div>;

  if (phases.length === 0) {
    // ... (Empty state code remains same as before)
    return (
        <div className="h-[80vh] flex flex-col items-center justify-center text-center max-w-lg mx-auto">
          {/* ... existing empty state ... */}
           <Link href={`/project/${projectId}/setup`}>
            <Button size="lg" className="rounded-full px-8 h-12 text-lg">Setup Roadmap</Button>
          </Link>
        </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-serif font-bold text-stone-900">Your Journey</h1>
          <p className="text-stone-500 mt-2">Follow the path to your perfect day.</p>
        </div>
        
        {/* UPDATED LINK HERE */}
        <Link href={`/project/${projectId}/setup/design`}> 
            <Button variant="outline">Edit Structure</Button>
        </Link>
        
      </div>
      
      <RoadmapView phases={phases} projectId={projectId} team={team} />
    </div>
  );
}