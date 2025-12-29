"use client";

import { useState, useTransition } from "react";
import { toggleTask, assignTask, updateTaskDetails } from "@/app/actions/roadmap"; // Import the new action
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { UserCircle2, UserX, Calendar, Coins, Clock, CheckCircle2 } from "lucide-react";

interface RoadmapViewProps {
  phases: any[];
  projectId: string;
  team: any[];
}

export function RoadmapView({ phases, projectId, team }: RoadmapViewProps) {
  
  const [isPending, startTransition] = useTransition();
  
  // State for the Modal
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Handlers ---

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleQuickToggle = (e: React.MouseEvent, taskId: string, currentStatus: boolean) => {
    e.stopPropagation(); // Prevent opening modal when clicking checkbox
    startTransition(async () => {
      await toggleTask(taskId, !currentStatus, projectId);
    });
  };

  const handleAssign = (taskId: string, userId: string | null) => {
    startTransition(async () => {
      await assignTask(taskId, userId, projectId);
    });
  };

  // Helpers
  const formatMoney = (amount: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const formatDate = (dateString: string) => dateString ? new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : "";

  return (
    <div className="relative max-w-5xl mx-auto pb-20">
      
      {/* Central Line */}
      <div className="absolute left-4 lg:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-stone-300 via-rose-200 to-stone-100 lg:-ml-px" />

      <div className="space-y-16">
        {phases.map((phase, index) => {
          const isEven = index % 2 === 0;
          const totalTasks = phase.tasks.length;
          const completedTasks = phase.tasks.filter((t: any) => t.isCompleted).length;
          const isPhaseComplete = totalTasks > 0 && totalTasks === completedTasks;
          const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

          return (
            <div key={phase.id} className={cn("relative flex items-start group", isEven ? "lg:flex-row-reverse" : "")}>
              <div className="hidden lg:block w-1/2" />

              {/* Phase Node */}
              <div className={cn(
                "absolute left-4 lg:left-1/2 -translate-x-1/2 w-12 h-12 rounded-full border-4 border-stone-50 shadow-md flex items-center justify-center z-20 transition-transform duration-500 group-hover:scale-110 top-0",
                isPhaseComplete ? "bg-green-500 text-white" : "bg-white text-stone-400"
              )}>
                <span className="font-serif font-bold text-lg">{index + 1}</span>
              </div>

              {/* Phase Content */}
              <div className={cn("w-full lg:w-1/2 pl-16 lg:pl-0", isEven ? "lg:pr-16" : "lg:pl-16")}>
                <div className={cn(
                  "relative bg-white p-6 rounded-3xl border border-stone-100 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-rose-900/5",
                  isEven ? "lg:rounded-tr-none lg:text-right" : "lg:rounded-tl-none lg:text-left"
                )}>
                  
                  {/* Phase Header & Progress */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-serif font-bold text-stone-800">{phase.title}</h3>
                    <div className={cn("mt-3 w-full flex items-center gap-3", isEven ? "lg:justify-end" : "")}>
                       <div className="w-24 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                         <div className={cn("h-full rounded-full transition-all duration-500", isPhaseComplete ? "bg-green-500" : "bg-rose-400")} style={{ width: `${progressPercent}%` }} />
                       </div>
                       <span className="text-xs font-bold text-stone-400">{completedTasks}/{totalTasks}</span>
                    </div>
                  </div>

                  {/* Tasks List */}
                  <div className="space-y-3">
                    {phase.tasks.map((task: any) => (
                      <Card 
                        key={task.id}
                        onClick={() => handleTaskClick(task)} // <--- CLICK TO OPEN MODAL
                        className={cn(
                          "p-3 flex items-start gap-3 transition-all hover:shadow-md hover:border-rose-200 border-stone-100 cursor-pointer group/card",
                          task.isCompleted ? "opacity-60 bg-stone-50" : "bg-white",
                          isEven ? "lg:flex-row-reverse lg:text-right" : "lg:text-left"
                        )}
                      >
                        {/* Checkbox (Quick Toggle) */}
                        <div onClick={(e) => e.stopPropagation()} className="pt-1">
                          <Checkbox 
                            checked={task.isCompleted} 
                            onCheckedChange={(c) => handleQuickToggle({ stopPropagation: () => {} } as any, task.id, task.isCompleted)}
                            className="data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600 rounded-full w-5 h-5"
                          />
                        </div>
                        
                        {/* Task Text & Badges */}
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm font-medium text-stone-900 truncate", task.isCompleted && "line-through text-stone-500")}>
                            {task.title}
                          </p>
                          
                          {/* Badges Row */}
                          {(task.deadline || task.estimatedCost > 0) && (
                            <div className={cn("flex flex-wrap gap-2 mt-1.5", isEven ? "lg:justify-end" : "lg:justify-start")}>
                              {task.deadline && (
                                <div className="inline-flex items-center text-[10px] font-medium text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {formatDate(task.deadline)}
                                </div>
                              )}
                              {(task.estimatedCost > 0 || task.realCost > 0) && (
                                <div className={cn("inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full border", 
                                  task.realCost > task.estimatedCost && task.estimatedCost > 0 ? "bg-red-50 text-red-600 border-red-100" : "bg-stone-50 text-stone-600 border-stone-200"
                                )}>
                                  <Coins className="w-3 h-3 mr-1" />
                                  <span>
                                    {task.estimatedCost > 0 ? formatMoney(task.estimatedCost) : ''}
                                    {task.realCost > 0 ? ` / ${formatMoney(task.realCost)}` : ''}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Assignment Dropdown */}
                        <div onClick={(e) => e.stopPropagation()} className="mt-0.5">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="flex items-center justify-center outline-none transition-transform active:scale-95">
                                {task.assignedTo ? (
                                  <Avatar className="w-6 h-6 border-white border">
                                    <AvatarImage src={task.assignedTo.image} />
                                    <AvatarFallback className="text-[10px] bg-rose-500 text-white">{task.assignedTo.name?.[0]}</AvatarFallback>
                                  </Avatar>
                                ) : (
                                  <div className="w-8 h-8 rounded-full border border-dashed border-stone-300 flex items-center justify-center text-stone-300 hover:border-rose-500 hover:text-rose-500 transition-colors bg-stone-50">
                                     <UserCircle2 className="w-5 h-5" />
                                  </div>
                                )}
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                              <DropdownMenuLabel>Assign Task</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleAssign(task.id, null)} className="text-red-600"><UserX className="w-4 h-4 mr-2" /> Unassigned</DropdownMenuItem>
                              {team.map((member: any) => (
                                <DropdownMenuItem key={member.user.id} onClick={() => handleAssign(task.id, member.user.id)}>
                                   <Avatar className="w-6 h-6 mr-2"><AvatarImage src={member.user.image} /><AvatarFallback>{member.user.name?.[0]}</AvatarFallback></Avatar>
                                   <span>{member.user.name}</span>
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- EDIT TASK MODAL --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl border-none shadow-2xl">
          {selectedTask && (
            <form action={async (formData) => {
                await updateTaskDetails(formData); // Call server action
                setIsModalOpen(false); // Close modal
            }}>
              <input type="hidden" name="taskId" value={selectedTask.id} />
              <input type="hidden" name="projectId" value={projectId} />

              <DialogHeader className="mb-4">
                <DialogTitle className="font-serif text-2xl text-stone-800">{selectedTask.title}</DialogTitle>
                <DialogDescription>{selectedTask.description || "Manage task details below"}</DialogDescription>
              </DialogHeader>

              <div className="grid gap-6 py-2">
                
                {/* 1. Date */}
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-stone-500 font-bold text-xs uppercase tracking-wider">Deadline</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
                    <Input 
                      id="date" 
                      name="date" 
                      type="date" 
                      required
                      className="pl-9 bg-stone-50 border-stone-200 focus-visible:ring-rose-500"
                      defaultValue={selectedTask.deadline ? new Date(selectedTask.deadline).toISOString().split('T')[0] : ''} 
                    />
                  </div>
                </div>

                {/* 2. Costs Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estimated" className="text-stone-500 font-bold text-xs uppercase tracking-wider">Estimated Cost</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-stone-400 text-sm">$</span>
                      <Input id="estimated" name="estimatedCost" type="number" step="0.01" className="pl-6 bg-stone-50 border-stone-200" defaultValue={selectedTask.estimatedCost} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="actual" className="text-stone-500 font-bold text-xs uppercase tracking-wider">Actual Cost</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-stone-400 text-sm">$</span>
                      <Input id="actual" name="actualCost" type="number" step="0.01" className="pl-6 bg-stone-50 border-stone-200" defaultValue={selectedTask.realCost} />
                    </div>
                  </div>
                </div>

                {/* 3. Status Switch */}
                <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", selectedTask.isCompleted ? "bg-green-100 text-green-600" : "bg-stone-200 text-stone-400")}>
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <Label htmlFor="isCompleted" className="font-bold text-stone-700">Mark as Complete</Label>
                      <p className="text-xs text-stone-400">Task is finished</p>
                    </div>
                  </div>
                  <Checkbox 
                    id="isCompleted" 
                    name="isCompleted" 
                    defaultChecked={selectedTask.isCompleted} 
                    className="w-6 h-6 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  />
                </div>

              </div>

              <DialogFooter className="mt-6 gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-stone-900 hover:bg-rose-600 text-white rounded-full px-6">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}