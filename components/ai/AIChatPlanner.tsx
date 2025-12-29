"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
    { role: "ai", content: "Hi! I'm your AI wedding planner. Tell me about your vision, and I'll help organize your roadmap." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      // Prepare history for API (map 'ai' -> 'model')
      const apiHistory = [...messages, userMsg].map(m => ({
        role: m.role === "ai" ? "model" : "user",
        content: m.content
      }));

      const res = await fetch("/api/ai/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: apiHistory,
          currentRoadmap: currentRoadmap
        }),
      });

      const data = await res.json();

      if (data.text_response) {
        setMessages((prev) => [...prev, { role: "ai", content: data.text_response }]);
      }

      if (data.updated_roadmap) {
        onUpdateRoadmap(data.updated_roadmap);
        toast.success("Roadmap updated by AI!");
        setMessages((prev) => [...prev, { role: "ai", content: "✅ I've updated your roadmap based on our conversation." }]);
      }
      
    } catch (error) {
      toast.error("Failed to connect to AI.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px] w-full max-w-md mx-auto border rounded-xl shadow-xl bg-background overflow-hidden">
      
      {/* Header */}
      <div className="bg-primary/10 p-4 border-b flex items-center gap-2">
        <Bot className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-primary">AI Wedding Planner</h3>
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-4 bg-muted">
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                "flex gap-3 max-w-[85%]",
                msg.role === "user" ? "ml-auto flex-row-reverse" : ""
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted border border-border"
              )}>
                {msg.role === "user" ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-primary" />}
              </div>
              
              <div className={cn(
                "p-3 text-sm rounded-lg shadow-sm",
                msg.role === "user" 
                  ? "bg-primary text-primary-foreground rounded-tr-none" 
                  : "bg-white border border-border text-primary rounded-tl-none"
              )}>
                {msg.content}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
              <div className="bg-white border border-border p-3 rounded-lg rounded-tl-none text-sm text-muted-foreground italic">
                Thinking...
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 bg-background border-t flex gap-2">
        <Input 
          placeholder="Ask for ideas or changes..." 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={isLoading}
        />
        <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}