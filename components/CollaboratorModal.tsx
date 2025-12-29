"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Trash2, Shield, Eye, Edit2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function CollaboratorModal({ roadmapId }: { roadmapId: string }) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("VIEWER");

  // Fetch Collaborators
  const { data: collaborators = [] } = useQuery({
    queryKey: ["collaborators", roadmapId],
    queryFn: async () => ((await fetch(`/api/roadmap/${roadmapId}/collaborators`)).json()),
  });

  // Add Collaborator
  const addMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/roadmap/${roadmapId}/collaborators`, {
        method: "POST",
        body: JSON.stringify({ email, role })
      });
      if (!res.ok) throw new Error("Failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collaborators"] });
      setEmail("");
      toast.success("Invited!");
    }
  });

  // Remove Collaborator
  const removeMutation = useMutation({
    mutationFn: async (userId: string) => {
        await fetch(`/api/roadmap/${roadmapId}/collaborators?userId=${userId}`, { method: "DELETE" });
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["collaborators"] });
        toast.success("Removed.");
    }
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="w-4 h-4 mr-2" /> Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Manage Access</DialogTitle></DialogHeader>
        
        {/* Invite Form */}
        <div className="flex gap-2 py-4">
          <Input placeholder="user@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Select value={role} onValueChange={setRole}>
            <SelectTrigger className="w-[110px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="EDITOR">Editor</SelectItem>
              <SelectItem value="VIEWER">Viewer</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => addMutation.mutate()} disabled={addMutation.isPending}>Invite</Button>
        </div>

        {/* List */}
        <div className="space-y-3 mt-2">
          {collaborators.map((c: any) => (
            <div key={c.id} className="flex items-center justify-between p-2 bg-muted/20 rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8"><AvatarFallback>{c.user.name?.[0] || "?"}</AvatarFallback></Avatar>
                <div>
                  <p className="text-sm font-medium">{c.user.name || c.user.email}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {c.role === "OWNER" && <Shield className="w-3 h-3 text-primary" />}
                    {c.role === "EDITOR" && <Edit2 className="w-3 h-3 text-blue-500" />}
                    {c.role === "VIEWER" && <Eye className="w-3 h-3 text-gray-500" />}
                    {c.role}
                  </p>
                </div>
              </div>
              {c.role !== "OWNER" && (
                <Button variant="ghost" size="icon" onClick={() => removeMutation.mutate(c.userId)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}