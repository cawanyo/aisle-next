"use client";

import { useState, useTransition, useEffect } from "react";
import { inviteMember, removeMember, getTeam } from "@/app/actions/team";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Trash2, Shield, UserPlus, Mail } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function TeamPage({ params }: any) {
  // Note: In Next 15 Client Comps, we unwrap params usually via use() hook or passing from parent
  // But for simplicity in this hybrid setup, we fetch data inside useEffect
  const [projectId, setProjectId] = useState<string>("");
  const [team, setTeam] = useState<any[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<"EDITOR"| "VIEWER"| "OWNER">("VIEWER");
  const [loading, setLoading] = useState(true);

  // Invite Form
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("VIEWER");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // Unwrap params manually
    params.then((p: any) => {
      setProjectId(p.projectId);
      loadTeam(p.projectId);
    });
  }, [params]);

  const loadTeam = async (id: string) => {
    const data = await getTeam(id);
    if (data) {
      setTeam(data.team);
      setCurrentUserRole(data.currentUserRole);
    }
    setLoading(false);
  };

  const handleInvite = () => {
    if (!email) return;
    startTransition(async () => {
      try {
        await inviteMember(projectId, email, role as "EDITOR" | "VIEWER");
        toast.success("Member invited!");
        setEmail("");
        loadTeam(projectId); // Refresh list
      } catch (e: any) {
        toast.error(e.message || "Failed to invite");
      }
    });
  };

  const handleRemove = (userId: string) => {
    if(!confirm("Remove this user?")) return;
    startTransition(async () => {
      try {
        await removeMember(projectId, userId);
        toast.success("Member removed");
        loadTeam(projectId);
      } catch (e) {
        toast.error("Failed to remove");
      }
    });
  };

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-serif font-bold text-stone-900">Project Team</h1>
           <p className="text-stone-500">Manage who can view or edit this wedding plan.</p>
        </div>
      </div>

      {/* INVITE CARD */}
      {currentUserRole === "OWNER" && (
        <Card className="border-stone-200 shadow-sm bg-stone-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" /> Invite Collaborator
            </CardTitle>
            <CardDescription>
                Add your partner, wedding planner, or family members.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-3">
               <div className="relative flex-1">
                 <Mail className="absolute left-3 top-3 w-4 h-4 text-stone-400" />
                 <Input 
                    placeholder="Enter email address..." 
                    className="pl-9 bg-white" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                 />
               </div>
               <Select value={role} onValueChange={setRole}>
                 <SelectTrigger className="w-[140px] bg-white">
                    <SelectValue />
                 </SelectTrigger>
                 <SelectContent>
                    <SelectItem value="EDITOR">Editor</SelectItem>
                    <SelectItem value="VIEWER">Viewer</SelectItem>
                 </SelectContent>
               </Select>
               <Button onClick={handleInvite} disabled={isPending || !email}>
                 {isPending ? <Loader2 className="animate-spin" /> : "Send Invite"}
               </Button>
            </div>
            <p className="text-xs text-stone-400 mt-2">
                * Note: The user must already have an account on this platform.
            </p>
          </CardContent>
        </Card>
      )}

      {/* TEAM LIST */}
      <div className="grid gap-4">
        {team.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 bg-white border border-stone-100 rounded-xl shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                    <Avatar className="w-10 h-10 border border-stone-200">
                        <AvatarImage src={member.user.image || ""} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                            {member.user.name?.[0] || "?"}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-bold text-stone-800">{member.user.name || "Unknown"}</p>
                        <p className="text-sm text-stone-500">{member.user.email}</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    <Badge variant="secondary" className={`
                        ${member.role === 'OWNER' ? 'bg-amber-100 text-amber-800' : 
                          member.role === 'EDITOR' ? 'bg-blue-100 text-blue-800' : 'bg-stone-100 text-stone-600'}
                    `}>
                        {member.role === 'OWNER' && <Shield className="w-3 h-3 mr-1" />}
                        {member.role}
                    </Badge>

                    {currentUserRole === "OWNER" && member.role !== "OWNER" && (
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-stone-400 hover:text-red-500 hover:bg-red-50"
                            onClick={() => handleRemove(member.user.id)}
                            disabled={isPending}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}