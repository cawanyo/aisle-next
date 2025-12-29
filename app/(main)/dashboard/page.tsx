"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
// Import Server Actions
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Users, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query"; // We still use Query for fetching lists on client if preferred, or we can fetch in a Server Component. 
import { createProject, getUserProjects } from "../../actions/project";

// NOTE: For a pure Server Actions approach, we usually fetch data in a Server Component parent.
// But to keep it interactive (client component), let's wrap the action in a generic fetcher or keep using useQuery calling the action.

export default function DashboardPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [isPending, startTransition] = useTransition();

  // Fetching data using Server Action inside useQuery
  const { data: projects = [], refetch } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => await getUserProjects(),
  });

  const handleCreate = () => {
    if (!title.trim()) return;
    
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("title", title);
        
        const result = await createProject(formData);
        if (result.success) {
          toast.success("Wedding Project Created!");
          setIsOpen(false);
          setTitle("");
          router.push(`/project/${result.projectId}/roadmap`); // Go directly to roadmap
        }
      } catch (error) {
        toast.error("Failed to create project");
      }
    });
  };

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-serif font-bold text-stone-800">Wedding Dashboard</h1>
            <p className="text-stone-500 mt-2">Manage your events and collaborations.</p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="shadow-xl bg-stone-900 hover:bg-stone-800 text-white rounded-full px-8">
                <Plus className="mr-2 h-4 w-4" /> New Wedding
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Name the Wedding</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <Input 
                  placeholder="e.g. Sarah & Tom's Big Day" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  autoFocus
                />
                <Button onClick={handleCreate} disabled={isPending || !title} className="w-full">
                  {isPending ? <Loader2 className="animate-spin" /> : "Create Project"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-dashed border-stone-200">
            <Sparkles className="w-12 h-12 text-stone-300 mb-4" />
            <h3 className="text-lg font-medium text-stone-600">No weddings yet</h3>
            <p className="text-stone-400 mb-6">Create your first project to get started.</p>
            <Button variant="outline" onClick={() => setIsOpen(true)}>Create Project</Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p: any) => (
              <Card 
                key={p.project.id} 
                className="group cursor-pointer hover:shadow-2xl transition-all duration-300 border-stone-100 hover:border-primary/20 overflow-hidden"
                onClick={() => router.push(`/project/${p.project.id}/roadmap`)}
              >
                <div className="h-2 bg-gradient-to-r from-stone-200 to-stone-100 group-hover:from-primary/40 group-hover:to-accent/40 transition-colors" />
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className={p.role === 'OWNER' ? "bg-stone-100" : "bg-blue-50 text-blue-600"}>
                      {p.role}
                    </Badge>
                    <span className="text-xs text-stone-400">
                      {new Date(p.project.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <CardTitle className="font-serif text-xl">{p.project.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center text-sm text-stone-500 mt-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {p.project._count.collaborators} member(s)
                    </div>
                    <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}