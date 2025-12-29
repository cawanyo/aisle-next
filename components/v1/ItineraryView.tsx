"use client";

import { useState, useTransition, useEffect } from "react";
import { saveEvent, deleteEvent, reorderEvents } from "@/app/actions/itinerary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Plus, MapPin, Clock, GripVertical, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { 
  DndContext, closestCenter, KeyboardSensor, PointerSensor, 
  useSensor, useSensors, DragEndEvent 
} from "@dnd-kit/core";
import { 
  arrayMove, SortableContext, sortableKeyboardCoordinates, 
  verticalListSortingStrategy, useSortable 
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import WeddingTimeline from "./WeddingTimeline";


// --- Main View ---
export function ItineraryView({ initialEvents, projectId }: { initialEvents: any[], projectId: string }) {
    const [events, setEvents] = useState(initialEvents);
    const [isPending, startTransition] = useTransition();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<any>(null);

    // Sync state if server data changes (revalidation)
    useEffect(() => { setEvents(initialEvents) }, [initialEvents]);
    console.log(editingEvent)
    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        
        const data = {
            id: editingEvent?.id,
            title: formData.get("title"),
            time: formData.get("time"),
            location: formData.get("location"),
            description: formData.get("description"),
            date: formData.get("date"),
            
        };

        startTransition(async () => {
            await saveEvent(projectId, data);
            toast.success("Saved");
            setIsModalOpen(false);
        });
    };

    const handleDelete = (id: string) => {
        if(!confirm("Delete this event?")) return;
        startTransition(async () => {
            await deleteEvent(id, projectId);
            toast.success("Deleted");
        });
    };

    // Drag and Drop
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = events.findIndex((e) => e.id === active.id);
        const newIndex = events.findIndex((e) => e.id === over.id);
        
        const newOrder = arrayMove(events, oldIndex, newIndex);
        setEvents(newOrder); // Optimistic UI update

        // Save new order to DB
        startTransition(async () => {
             const updates = newOrder.map((e, index) => ({ id: e.id, order: index }));
             await reorderEvents(projectId, updates);
        });
    };

    const openAdd = () => { setEditingEvent(null); setIsModalOpen(true); };
    const openEdit = (e: any) => { setEditingEvent(e); setIsModalOpen(true); };

    return (
        <div className="pb-20">
            <div className="mb-8 flex justify-end">
                <Button onClick={openAdd} size="lg" className="shadow-lg">
                    <Plus className="w-4 h-4 mr-2" /> Add Event
                </Button>
            </div>

            <div className="relative">
                <WeddingTimeline events={events} onEdit={openEdit} onDelete={handleDelete} projectId={projectId} />
                
                {events.length === 0 && (
                    <div className="text-center py-20 bg-stone-50 rounded-xl border border-dashed border-stone-200">
                        <p className="text-stone-500">No events scheduled yet.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader><DialogTitle>{editingEvent ? "Edit Event" : "Add Event"}</DialogTitle></DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4 pt-4">
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-1">
                                <label className="text-xs font-bold text-stone-500">Time</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                                    <Input name="time" type="time" defaultValue={editingEvent?.time} placeholder="14:00" className="pl-9" />
                                </div>
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-stone-500">Event Title</label>
                                <Input name="title" defaultValue={editingEvent?.title} placeholder="Ceremony" required />
                            </div>
                        </div>
                        
                        <div>
                            <label className="text-xs font-bold text-stone-500">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                                <Input name="location" defaultValue={editingEvent?.location} placeholder="Main Hall" className="pl-9" />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-stone-500">Date</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                                <Input name="date" type="date" defaultValue={
                                        editingEvent?.date
                                        ? new Date(editingEvent.date).toISOString().split("T")[0]
                                        : ""
                                         } placeholder="Main Hall" className="pl-9" />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-stone-500">Description</label>
                            <Textarea name="description" defaultValue={editingEvent?.description} placeholder="Details about this event..." />
                        </div>

                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? <Loader2 className="animate-spin" /> : "Save Event"}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}