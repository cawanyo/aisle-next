"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { saveRoadmapStructure, getRoadmap } from "@/app/actions/roadmap"; // <--- Import getRoadmap
import { WEDDING_TEMPLATE } from "@/lib/templates";
import { AIChatPlanner } from "@/components/v1/AIChatPlanner";

// ... (Keep your DnD Imports: DndContext, SortableContext, etc.) ...
import { 
  DndContext, closestCenter, KeyboardSensor, PointerSensor, 
  useSensor, useSensors, DragEndEvent 
} from "@dnd-kit/core";
import { 
  arrayMove, SortableContext, sortableKeyboardCoordinates, 
  verticalListSortingStrategy, useSortable 
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ... (Keep your UI Imports: Button, Dialog, etc.) ...
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2, Save, Sparkles, ArrowLeft, Plus, GripVertical, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { SortablePhase } from "@/components/v1/Sortable";


// ... (Keep SortableMilestone and SortablePhase components exactly as they were) ...
// For brevity, I am assuming the sub-components SortableMilestone & SortablePhase are still in the file.
// If you need them pasted again, let me know.

// --- MAIN PAGE COMPONENT ---

export default function DesignPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.projectId as string;
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");

  const [phases, setPhases] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [isLoadingData, setIsLoadingData] = useState(true); // New loading state

  // ... (Keep Dialog/Form States: isAiOpen, newPhaseTitle, etc.) ...
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isAddPhaseOpen, setIsAddPhaseOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false);
  const [newPhaseTitle, setNewPhaseTitle] = useState("");
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [editingTask, setEditingTask] = useState<any>(null);


  // 1. Initialize Data (Updated Logic)
  useEffect(() => {
    async function load() {
      if (mode === "template") {
        // Load Template
        const formatted = WEDDING_TEMPLATE.map((p, i) => ({
          tempId: Math.random().toString(36).substr(2, 9),
          title: p.title,
          tasks: p.tasks.map((t) => ({ ...t, tempId: Math.random().toString(36).substr(2, 9) }))
        }));
        setPhases(formatted);
        setIsLoadingData(false);
      } else if (mode === "blank") {
        // Start Empty
        setPhases([]);
        setIsLoadingData(false);
      } else {
        // --- EDIT MODE: Fetch Existing Data ---
        try {
          const data = await getRoadmap(projectId);
          if (data && data.length > 0) {
            // Format DB data for DnD (map id -> tempId)
            const formatted = data.map((p: any) => ({
                tempId: p.id, // Use real ID as tempId
                title: p.title,
                tasks: p.tasks.map((t: any) => ({
                    ...t,
                    tempId: t.id // Use real ID as tempId
                }))
            }));
            setPhases(formatted);
          } else {
            // Fallback if empty
            setPhases([]);
          }
        } catch (e) {
            toast.error("Failed to load existing plan");
        } finally {
            setIsLoadingData(false);
        }
      }
    }
    load();
  }, [mode, projectId]);

  // ... (Keep handleSave, handleDragEnd, CRUD handlers exactly as before) ...
  const handleSave = () => {
    startTransition(async () => {
      try {
        // 1. Prepare data by adding 'order' based on array index
        const payload = phases.map((phase, phaseIndex) => ({
          ...phase,
          order: phaseIndex, // <--- Add Phase Order
          // Ensure we send the ID if it's a real database ID (not a temp one)
          id: phase.tempId.includes("-") || phase.tempId.length < 10 ? undefined : phase.tempId, 
          
          tasks: phase.tasks.map((task: any, taskIndex: number) => ({
            ...task,
            order: taskIndex, 
            id: task.tempId.includes("-") || task.tempId.length < 10 ? undefined : task.tempId
          }))
        }));

        // 2. Send the cleaned payload
        await saveRoadmapStructure({ 
            projectId, 
            phases: payload 
        });
        
        toast.success("Roadmap Updated!");
        router.push(`/project/${projectId}/roadmap`);
      } catch (e) {
        console.error(e);
        toast.error("Failed to save.");
      }
    });
  };
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeId = String(active.id);
    const overId = String(over.id);

    if (activeId.startsWith("phase-") && overId.startsWith("phase-")) {
       const oldIdx = phases.findIndex(p => `phase-${p.tempId}` === activeId);
       const newIdx = phases.findIndex(p => `phase-${p.tempId}` === overId);
       setPhases(arrayMove(phases, oldIdx, newIdx));
    } else if (activeId.startsWith("task-") && overId.startsWith("task-")) {
        const sourcePhaseIdx = phases.findIndex(p => p.tasks.some((t: any) => `task-${t.tempId}` === activeId));
        const destPhaseIdx = phases.findIndex(p => p.tasks.some((t: any) => `task-${t.tempId}` === overId));

        if (sourcePhaseIdx !== -1 && destPhaseIdx !== -1 && sourcePhaseIdx === destPhaseIdx) {
            const phase = phases[sourcePhaseIdx];
            const oldIdx = phase.tasks.findIndex((t: any) => `task-${t.tempId}` === activeId);
            const newIdx = phase.tasks.findIndex((t: any) => `task-${t.tempId}` === overId);
            const newTasks = arrayMove(phase.tasks, oldIdx, newIdx);
            const newPhases = [...phases];
            newPhases[sourcePhaseIdx] = { ...phase, tasks: newTasks };
            setPhases(newPhases);
        }
    }
  };

  const handleAddPhase = () => { if (!newPhaseTitle.trim()) return; setPhases([...phases, { tempId: Math.random().toString(36).substr(2, 9), title: newPhaseTitle, tasks: [] }]); setIsAddPhaseOpen(false); setNewPhaseTitle(""); };
  const handleDeletePhase = (id: string) => { setPhases(phases.filter(p => p.tempId !== id)); };
  const handleAddTask = () => { if (!newTask.title.trim()) return; setPhases(phases.map(p => { if (p.tempId === selectedPhaseId) { return { ...p, tasks: [...p.tasks, { tempId: Math.random().toString(36).substr(2, 9), title: newTask.title, description: newTask.description }] }; } return p; })); setIsAddTaskOpen(false); setNewTask({ title: "", description: "" }); };
  const handleDeleteTask = (id: string) => { setPhases(phases.map(p => ({ ...p, tasks: p.tasks.filter((t: any) => t.tempId !== id) }))); };
  const handleEditTask = () => { setPhases(phases.map(p => ({ ...p, tasks: p.tasks.map((t: any) => t.tempId === editingTask.tempId ? { ...t, title: editingTask.title, description: editingTask.description } : t) }))); setIsEditTaskOpen(false); setEditingTask(null); };


  // Loading State
  if (isLoadingData) {
      return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin w-10 h-10 text-primary" /></div>;
  }

  // ... (Return JSX - Identical to previous step, just ensure SortablePhase logic is there) ...
  return (
    <div className="flex flex-col min-h-screen lg:flex-row lg:h-screen bg-stone-50">
      {/* Sidebar */}
      <div className="w-80 border-r border-stone-200 bg-white p-6 flex flex-col z-10 shadow-sm rounded-xl ">
        <div className="mb-6">
            <Button variant="ghost" onClick={() => router.back()} className="pl-0 text-stone-500 hover:text-stone-900 mb-2">
                <ArrowLeft className="mr-2 h-4 w-4"/> Back to Project
            </Button>
            <h1 className="text-2xl font-serif font-bold text-stone-900">
                {mode ? "Design Roadmap" : "Edit Structure"}
            </h1>
            <p className="text-sm text-stone-500 mt-1">
                {mode ? "Choose a template or start blank." : "Modify your existing plan."}
            </p>
        </div>

        {/* ... (Rest of Sidebar UI: AI Button, Add Phase, Save Button) ... */}
        <Dialog open={isAiOpen} onOpenChange={setIsAiOpen}>
             <DialogTrigger asChild><Button variant="secondary" className="w-full mb-6"><Sparkles className="w-4 h-4 mr-2" /> AI Assistant</Button></DialogTrigger>
             <DialogContent className="sm:max-w-[450px] p-0"><AIChatPlanner currentRoadmap={phases} onUpdateRoadmap={(newPlan) => setPhases(newPlan)} /></DialogContent>
        </Dialog>
        
        <div className="mt-auto space-y-3 pt-6 border-t border-stone-100">
             <Dialog open={isAddPhaseOpen} onOpenChange={setIsAddPhaseOpen}>
                <DialogTrigger asChild><Button variant="outline" className="w-full justify-start"><Plus className="mr-2 h-4 w-4" /> Add Phase</Button></DialogTrigger>
                <DialogContent><DialogHeader><DialogTitle>New Phase</DialogTitle></DialogHeader><div className="space-y-4 pt-4"><Input placeholder="Title" value={newPhaseTitle} onChange={(e) => setNewPhaseTitle(e.target.value)} /><Button onClick={handleAddPhase} className="w-full">Create</Button></div></DialogContent>
             </Dialog>
             <Button className="w-full h-12 text-lg shadow-lg" onClick={handleSave} disabled={isPending}>
                 {isPending ? <Loader2 className="animate-spin" /> : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
             </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 bg-stone-50/50 overflow-hidden">
        <ScrollArea className="h-full p-8">
            <div className="max-w-3xl mx-auto pb-32">
                 <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                     <SortableContext items={phases.map(p => `phase-${p.tempId}`)} strategy={verticalListSortingStrategy}>
                         {phases.map((phase, idx) => (
                             <SortablePhase 
                                key={phase.tempId} 
                                phase={phase} 
                                index={idx} 
                                onAddTask={(id: string) => { setSelectedPhaseId(id); setIsAddTaskOpen(true); }}
                                onDeletePhase={handleDeletePhase}
                                onDeleteTask={handleDeleteTask}
                                onEditTask={(t: any) => { setEditingTask(t); setIsEditTaskOpen(true); }}
                             />
                         ))}
                     </SortableContext>
                 </DndContext>
            </div>
        </ScrollArea>
      </div>

      {/* ... (Keep Add/Edit Task Dialogs) ... */}
       <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}><DialogContent><DialogHeader><DialogTitle>Add Task</DialogTitle></DialogHeader><div className="space-y-4 pt-4"><Input placeholder="Task Title" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} autoFocus /><Input placeholder="Description" value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})} /><Button onClick={handleAddTask} className="w-full">Add Task</Button></div></DialogContent></Dialog>
       <Dialog open={isEditTaskOpen} onOpenChange={setIsEditTaskOpen}><DialogContent><DialogHeader><DialogTitle>Edit Task</DialogTitle></DialogHeader><div className="space-y-4 pt-4"><Input value={editingTask?.title || ""} onChange={(e) => setEditingTask({...editingTask, title: e.target.value})} /><Input value={editingTask?.description || ""} onChange={(e) => setEditingTask({...editingTask, description: e.target.value})} /><Button onClick={handleEditTask} className="w-full">Update</Button></div></DialogContent></Dialog>
    </div>
  );
}