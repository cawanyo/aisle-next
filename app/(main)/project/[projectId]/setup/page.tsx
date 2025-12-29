import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, FilePlus2, ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function SetupPage({ params }: PageProps) {
  const { projectId } = await params;

  return (
    <div className="max-w-4xl mx-auto py-12">
      <Link href={`/project/${projectId}/roadmap`}>
        <Button variant="ghost" className="mb-8"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
      </Link>
      
      <div className="text-center mb-16">
        <h1 className="text-4xl font-serif font-bold text-stone-900 mb-4">How should we start?</h1>
        <p className="text-stone-500">Choose a foundation for your wedding plan.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Template Option */}
        <Link href={`/project/${projectId}/setup/design?mode=template`}>
          <Card className="p-10 cursor-pointer hover:border-primary/50 hover:shadow-xl transition-all group text-center h-full flex flex-col justify-center items-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Wedding Template</h3>
            <p className="text-stone-500 mb-6">Start with our expert-curated timeline. Perfect for most couples.</p>
            <Button className="w-full">Use Template</Button>
          </Card>
        </Link>

        {/* Blank Option */}
        <Link href={`/project/${projectId}/setup/design?mode=blank`}>
          <Card className="p-10 cursor-pointer hover:border-stone-400 hover:shadow-xl transition-all group text-center h-full flex flex-col justify-center items-center">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FilePlus2 className="w-8 h-8 text-stone-500" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Start from Scratch</h3>
            <p className="text-stone-500 mb-6">Build your own phases and tasks one by one.</p>
            <Button variant="outline" className="w-full">Start Blank</Button>
          </Card>
        </Link>
      </div>
    </div>
  );
}