import { 
    arrayMove, SortableContext, sortableKeyboardCoordinates, 
    verticalListSortingStrategy, useSortable 
  } from "@dnd-kit/sortable";
  import { CSS } from "@dnd-kit/utilities";
  
  // UI Imports
  import { Button } from "@/components/ui/button";

  import {  Plus, GripVertical, Pencil, Trash2 } from "lucide-react";


export function SortableMilestone({ milestone, onDelete, onEdit }: any) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `task-${milestone.tempId}` });
    
    const style = { 
      transform: CSS.Transform.toString(transform), 
      transition, 
      zIndex: isDragging ? 50 : "auto", 
      position: isDragging ? "relative" as const : "static" as const 
    };
  
    return (
      <div ref={setNodeRef} style={style} className={`relative pl-4 flex items-center gap-3 group/item ${isDragging ? "opacity-50" : ""}`}>
        {/* Connector Line */}
        <div className="absolute left-0 top-1/2 w-4 h-px bg-stone-200 group-hover/item:bg-primary/50 transition-colors" />
        
        <div className="flex-1 p-3 rounded-lg border border-stone-200 bg-white shadow-sm flex items-center justify-between hover:border-primary/40 transition-all group/card cursor-grab active:cursor-grabbing">
          <div className="flex items-center gap-3 overflow-hidden">
            <div {...attributes} {...listeners} className="text-stone-300 group-hover/card:text-stone-500 cursor-grab shrink-0">
              <GripVertical className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-sm text-stone-800 truncate">{milestone.title}</p>
              {milestone.description && <p className="text-xs text-stone-500 line-clamp-1">{milestone.description}</p>}
            </div>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-stone-400 hover:text-primary" onClick={() => onEdit(milestone)}>
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-stone-400 hover:text-red-500" onClick={() => onDelete(milestone.tempId)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
export function SortablePhase({ phase, index, onAddTask, onDeletePhase, onDeleteTask, onEditTask }: any) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `phase-${phase.tempId}` });
    
    const style = { 
      transform: CSS.Transform.toString(transform), 
      transition, 
      zIndex: isDragging ? 40 : "auto", 
      position: isDragging ? "relative" as const : "static" as const 
    };
  
    return (
      <div ref={setNodeRef} style={style} className={`mb-6 rounded-xl border border-stone-200 bg-stone-50/50 p-4 ${isDragging ? "opacity-50 border-primary" : ""}`}>
        {/* Phase Header */}
        <div className="flex items-center justify-between mb-4 group">
          <div className="flex items-center gap-3">
              <div {...attributes} {...listeners} className="cursor-grab text-stone-300 hover:text-stone-600">
                  <GripVertical className="w-5 h-5" />
              </div>
              <div className="w-8 h-8 rounded-full bg-stone-200 text-stone-600 font-bold flex items-center justify-center text-sm">
                  {index + 1}
              </div>
              <h3 className="text-lg font-bold text-stone-800">{phase.title}</h3>
          </div>
          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity" onClick={() => onDeletePhase(phase.tempId)}>
              <Trash2 className="w-4 h-4" />
          </Button>
        </div>
  
        {/* Tasks List */}
        <div className="space-y-2 ml-4 pl-4 border-l border-stone-200">
          <SortableContext items={phase.tasks.map((t: any) => `task-${t.tempId}`)} strategy={verticalListSortingStrategy}>
            {phase.tasks.map((task: any) => (
              <SortableMilestone 
                  key={task.tempId} 
                  milestone={task} 
                  onDelete={onDeleteTask} 
                  onEdit={onEditTask} 
              />
            ))}
          </SortableContext>
          
          <Button variant="ghost" size="sm" className="w-full justify-start text-stone-400 hover:text-primary mt-2" onClick={() => onAddTask(phase.tempId)}>
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </Button>
        </div>
      </div>
    );
  }