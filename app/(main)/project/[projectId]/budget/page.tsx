import { getBudgetOverview } from "@/app/actions/budget";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import BudgetView from "@/components/v1/BudgetView";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function BudgetPage({ params }: PageProps) {
  const { projectId } = await params;
  
  // Fetch grouped data
  const budgetData = await getBudgetOverview(projectId);
  return (
    <div className="flex min-h-screen bg-stone-50 font-sans selection:bg-rose-100">

      <div className="flex-1  transition-all duration-300">
        <main className="py-12 px-6 md:px-12 max-w-6xl mx-auto min-h-screen">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <p className="text-stone-400 font-medium text-sm uppercase tracking-[0.2em] mb-2">Financials</p>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900">Budget Tracker</h1>
            </div>
            <Link href={`/project/${projectId}/roadmap`}> 
                <Button className="rounded-full bg-stone-500 hover:bg-rose-600">Manage Costs</Button>
            </Link>
          </div>

          {budgetData.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center border-2 border-dashed border-stone-200 rounded-3xl p-16 bg-white/50">
               <div className="text-4xl mb-4">💰</div>
               <h3 className="text-xl font-bold text-stone-700">No expenses tracked</h3>
               <Link href={`/project/${projectId}/roadmap`}><Button variant="outline" className="mt-4">Go to Roadmap</Button></Link>
            </div>
          ) : (
            // Pass phases prop
            <BudgetView phases={budgetData} />
          )}

        </main>
      </div>
    </div>
  );
}