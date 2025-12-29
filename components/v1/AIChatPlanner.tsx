"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, Loader2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { DialogClose } from "@/components/ui/dialog";
import { generateRoadmapAI } from "@/app/actions/ai"; // Import the Server Action

interface Message {
  role: "user" | "ai";
  content: string;
}

interface AIChatPlannerProps {
  currentRoadmap: any[];
  onUpdateRoadmap: (newRoadmap: any[]) => void;
}

export function AIChatPlanner({ currentRoadmap, onUpdateRoadmap }: AIChatPlannerProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hello! I'm your wedding planning assistant. Tell me about your dream wedding, and I'll adjust the roadmap for you." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // 1. Add User Message to State immediately
    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // 2. Prepare History for AI (Exclude the latest user message from history array passed to backend if you prefer, 
      // but usually we pass everything. Here we reconstruct it for the backend.)
      const historyForBackend = [...messages, userMsg].map((m) => ({
        role: m.role, // 'user' or 'ai'
        content: m.content,
      }));

      // 3. Call Server Action
      const data = await generateRoadmapAI(historyForBackend, currentRoadmap);

      // 4. Handle Response
      if (data.text_response) {
        setMessages((prev) => [...prev, { role: "ai", content: data.text_response }]);
      }

      if (data.updated_roadmap) {
        onUpdateRoadmap(data.updated_roadmap);
        toast.success("Roadmap updated by AI!");
        setMessages((prev) => [...prev, { role: "ai", content: "✅ I've updated your roadmap plan based on our conversation." }]);
      }
      
    } catch (error) {
      console.error(error);
      toast.error("Failed to connect to AI.");
      setMessages((prev) => [...prev, { role: "ai", content: "⚠️ Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] w-full bg-gradient-to-b from-indigo-50/50 to-white">
      
      {/* Header */}
      <div className="p-4 border-b border-indigo-100 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-indigo-950 text-sm">AI Planner</h3>
            <p className="text-[10px] text-indigo-400 font-medium uppercase tracking-wider">Online</p>
          </div>
        </div>
        
        {/* Close Button */}
        <DialogClose asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:bg-red-50 hover:text-red-500 rounded-full transition-colors">
            <X className="w-4 h-4" />
          </Button>
        </DialogClose>
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                "flex gap-3 max-w-[90%]",
                msg.role === "user" ? "ml-auto flex-row-reverse" : ""
              )}
            >
              {/* Avatar */}
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                msg.role === "user" ? "bg-white text-gray-700 border" : "bg-gradient-to-tr from-indigo-500 to-purple-500 text-white"
              )}>
                {msg.role === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-3 h-3" />}
              </div>
              
              {/* Bubble */}
              <div className={cn(
                "p-3 text-sm leading-relaxed shadow-sm",
                msg.role === "user" 
                  ? "bg-white border text-gray-800 rounded-2xl rounded-tr-none" 
                  : "bg-white border-indigo-100 text-gray-700 rounded-2xl rounded-tl-none"
              )}>
                {msg.content}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white">
                <Loader2 className="w-3 h-3 animate-spin" />
              </div>
              <div className="bg-white border border-indigo-100 px-4 py-2 rounded-2xl rounded-tl-none text-xs text-indigo-400 font-medium flex items-center gap-1">
                Thinking...
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-indigo-50 flex gap-2 items-center">
        <Input 
          className="border-indigo-100 focus-visible:ring-indigo-200 bg-indigo-50/30 rounded-full h-11 px-4 transition-all"
          placeholder="Type your request (e.g., 'Add a brunch for Sunday')..." 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={isLoading}
        />
        <Button 
            size="icon" 
            className="rounded-full h-11 w-11 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95" 
            onClick={handleSend} 
            disabled={isLoading || !input.trim()}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}