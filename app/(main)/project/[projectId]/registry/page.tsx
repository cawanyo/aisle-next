import { getRegistry } from "@/app/actions/registry";
import { RegistryView } from "@/components/v1/RegistryView";
import { Gift, ShoppingBag, DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default async function RegistryPage({ params }: PageProps) {
  const { projectId } = await params;
  const gifts = await getRegistry(projectId);

  if (!gifts) return <div>Access Denied</div>;

  // Stats
  const totalItems = gifts.length;
  const purchasedItems = gifts.filter(g => g.takenBy).length;
  const totalValue = gifts.reduce((sum, g) => sum + (g.price || 0), 0);
  const purchasedValue = gifts.reduce((sum, g) => g.takenBy ? sum + (g.price || 0) : sum, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-stone-900">Wishlist & Registry</h1>
        <p className="text-stone-500">Track gifts, funds, and purchases.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-stone-200 bg-white shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
              <Gift className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Items Listed</p>
              <h3 className="text-2xl font-bold text-stone-900">{totalItems}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-stone-200 bg-white shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Purchased</p>
              <h3 className="text-2xl font-bold text-stone-900">{purchasedItems} <span className="text-stone-400 text-sm font-normal">/ {totalItems}</span></h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-stone-200 bg-white shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Value Fulfilled</p>
              <h3 className="text-2xl font-bold text-stone-900">${purchasedValue.toLocaleString()}</h3>
              <p className="text-xs text-stone-400">Total Goal: ${totalValue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Grid */}
      <RegistryView initialGifts={gifts} projectId={projectId} />
    </div>
  );
}