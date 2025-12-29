"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Groq from "groq-sdk";

export async function generateRoadmapAI(history: any[], currentRoadmap: any[]) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("AI Key Missing");

  const groq = new Groq({ apiKey });

  const systemInstruction = `
    You are an expert Wedding Planner AI.
    Current Plan: ${JSON.stringify(currentRoadmap)}
    
    GOAL: Chat with user. If they request changes, return the MODIFIED roadmap JSON.
    
    RESPONSE FORMAT (JSON ONLY):
    {
      "text_response": "Conversational reply...",
      "updated_roadmap": null (if no change) OR [ { "title": "Phase Name", "tasks": [ { "title": "Task Name", "description": "..." } ] } ]
    }
  `;

  const messages = [
    { role: "system", content: systemInstruction },
    ...history.map((msg: any) => ({
      role: msg.role === "ai" ? "assistant" : "user",
      content: msg.content,
    })),
  ];

  try {
    const completion = await groq.chat.completions.create({
      messages: messages as any,
      model: "llama3-8b-8192",
      temperature: 0.5,
      response_format: { type: "json_object" },
    });

    const text = completion.choices[0]?.message?.content || "{}";
    return JSON.parse(text);
  } catch (e) {
    console.error("AI Error", e);
    return { text_response: "Sorry, I had a hiccup. Try again.", updated_roadmap: null };
  }
}