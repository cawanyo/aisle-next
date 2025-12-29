import { getItinerary } from "@/app/actions/itinerary";
import { ItineraryView } from "@/components/v1/ItineraryView";
import { CalendarClock } from "lucide-react";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function ItineraryPage({ params }: PageProps) {
  const { projectId } = await params;
  const events = await getItinerary(projectId);

  if (!events) return <div>Access Denied</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
            <CalendarClock className="w-6 h-6" />
        </div>
        <div>
            <h1 className="text-3xl font-serif font-bold text-stone-900">Day-of Itinerary</h1>
            <p className="text-stone-500">Plan the schedule for the big day.</p>
        </div>
      </div>

      <ItineraryView initialEvents={events} projectId={projectId} />
    </div>
  );
}