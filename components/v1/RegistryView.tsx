"use client";

import { useState, useTransition } from "react";
import { saveGift, deleteGift, toggleGiftStatus } from "@/app/actions/registry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, ExternalLink, Gift, Check } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface RegistryViewProps {
  initialGifts: any[];
  projectId: string;
}

export function RegistryView({ initialGifts, projectId }: RegistryViewProps) {
  const [gifts, setGifts] = useState(initialGifts);
  const [isPending, startTransition] = useTransition();
  
  // Modals
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingGift, setEditingGift] = useState<any>(null); // Null = Create Mode
  
  const [isClaimOpen, setIsClaimOpen] = useState(false);
  const [claimingGiftId, setClaimingGiftId] = useState<string | null>(null);
  const [purchaserName, setPurchaserName] = useState("");

  // Update local state when prop updates (revalidation)
  if (initialGifts !== gifts) setGifts(initialGifts);

  // --- SAVE HANDLER (Add/Edit) ---
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    
    const data = {
      id: editingGift?.id,
      name: formData.get("name"),
      price: formData.get("price"),
      url: formData.get("url"),
      imageUrl: formData.get("imageUrl"),
    };

    startTransition(async () => {
      try {
        await saveGift(projectId, data);
        toast.success(editingGift ? "Gift updated" : "Gift added");
        setIsEditOpen(false);
        setEditingGift(null);
      } catch (err) {
        toast.error("Failed to save");
      }
    });
  };

  // --- DELETE HANDLER ---
  const handleDelete = (id: string) => {
    if (!confirm("Delete this item?")) return;
    startTransition(async () => {
      await deleteGift(id, projectId);
      toast.success("Deleted");
    });
  };

  // --- CLAIM HANDLER (Mark Purchased) ---
  const handleClaimSubmit = () => {
    if (!claimingGiftId) return;
    startTransition(async () => {
       await toggleGiftStatus(claimingGiftId, projectId, purchaserName || "Anonymous");
       toast.success("Marked as purchased");
       setIsClaimOpen(false);
       setPurchaserName("");
       setClaimingGiftId(null);
    });
  };

  const handleUnclaim = (id: string) => {
    if (!confirm("Mark this as NOT purchased?")) return;
    startTransition(async () => {
        await toggleGiftStatus(id, projectId, null); // Set takenBy to null
        toast.success("Item is available again");
    });
  };

  const openAdd = () => { setEditingGift(null); setIsEditOpen(true); };
  const openEdit = (gift: any) => { setEditingGift(gift); setIsEditOpen(true); };
  const openClaim = (id: string) => { setClaimingGiftId(id); setIsClaimOpen(true); };
  const router = useRouter();
  return (
    <div className="pb-20">
      <div className="mb-6 flex justify-end">
        <Button onClick={() => router.push(`/project/${projectId}/registry/add`)} size="lg" className="shadow-lg">
          <Plus className="w-4 h-4 mr-2" /> Add Item
        </Button>
      </div>

      {gifts.length === 0 ? (
        <div className="text-center py-20 bg-stone-50 rounded-xl border border-dashed border-stone-200">
          <Gift className="w-12 h-12 mx-auto text-stone-300 mb-4" />
          <h3 className="text-lg font-medium text-stone-600">Your Wishlist is empty</h3>
          <p className="text-stone-400 mb-6">Add gifts, experiences, or cash funds.</p>
          <Button variant="outline" onClick={openAdd}>Add First Item</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {gifts.map((gift) => (
            <div key={gift.id} className="group bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
              {/* Image Area */}
              <div className="h-48 bg-stone-100 relative overflow-hidden flex items-center justify-center">
                 {gift.imageUrl ? (
                    <img src={gift.imageUrl} alt={gift.name} className="w-full h-full object-cover" />
                 ) : (
                    <Gift className="w-12 h-12 text-stone-300" />
                 )}
                 
                 {/* Status Badge */}
                 {gift.takenBy && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center z-10">
                        <Badge className="bg-emerald-600 hover:bg-emerald-700 text-base py-1 px-4">
                            <Check className="w-4 h-4 mr-2" /> Purchased
                        </Badge>
                    </div>
                 )}
                 
                 {/* Edit/Delete Overlay (Only visible on hover) */}
                 <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm" onClick={() => openEdit(gift)}>
                        <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="secondary" size="icon" className="h-8 w-8 bg-white/90 hover:bg-red-50 hover:text-red-500 shadow-sm" onClick={() => handleDelete(gift.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                 </div>
              </div>

              {/* Content Area */}
              <div className="p-5 flex-1 flex flex-col">
                 <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-stone-800 line-clamp-1">{gift.name}</h3>
                    {gift.price > 0 && (
                        <span className="font-medium text-stone-600">${gift.price.toLocaleString()}</span>
                    )}
                 </div>
                 
                 {gift.url && (
                    <a href={gift.url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center mb-4 truncate">
                        View Product <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                 )}

                 <div className="mt-auto pt-4 border-t border-stone-100">
                    {gift.takenBy ? (
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-stone-500">Bought by <strong>{gift.takenBy}</strong></span>
                            <Button variant="ghost" size="sm" className="h-auto p-0 text-stone-400 hover:text-red-500 text-xs" onClick={() => handleUnclaim(gift.id)}>
                                Undo
                            </Button>
                        </div>
                    ) : (
                        <Button 
                            variant="outline" 
                            className="w-full border-stone-300 text-stone-600 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50"
                            onClick={() => openClaim(gift.id)}
                        >
                            Mark as Purchased
                        </Button>
                    )}
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- ADD / EDIT MODAL --- */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
           <DialogHeader><DialogTitle>{editingGift ? "Edit Item" : "Add to Wishlist"}</DialogTitle></DialogHeader>
           <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div>
                  <label className="text-xs font-bold text-stone-500">Item Name</label>
                  <Input name="name" defaultValue={editingGift?.name} required placeholder="e.g. KitchenAid Mixer" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="text-xs font-bold text-stone-500">Price ($)</label>
                      <Input name="price" type="number" step="0.01" defaultValue={editingGift?.price} placeholder="0.00" />
                  </div>
                  <div>
                      <label className="text-xs font-bold text-stone-500">Product URL</label>
                      <Input name="url" defaultValue={editingGift?.url} placeholder="https://..." />
                  </div>
              </div>
              <div>
                  <label className="text-xs font-bold text-stone-500">Image URL</label>
                  <Input name="imageUrl" defaultValue={editingGift?.imageUrl} placeholder="https://image.com/..." />
                  <p className="text-[10px] text-stone-400 mt-1">Right click an image online - "Copy Image Address"</p>
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? <Loader2 className="animate-spin" /> : "Save Item"}
              </Button>
           </form>
        </DialogContent>
      </Dialog>

      {/* --- CLAIM MODAL --- */}
      <Dialog open={isClaimOpen} onOpenChange={setIsClaimOpen}>
        <DialogContent className="sm:max-w-[400px]">
           <DialogHeader><DialogTitle>Mark as Purchased</DialogTitle></DialogHeader>
           <div className="space-y-4 pt-4">
              <p className="text-sm text-stone-500">Who bought this item? This helps track thank-you notes later.</p>
              <Input 
                placeholder="Name (e.g. Aunt May)" 
                value={purchaserName} 
                onChange={(e) => setPurchaserName(e.target.value)} 
              />
              <DialogFooter>
                  <Button onClick={handleClaimSubmit} disabled={isPending || !purchaserName.trim()}>
                      {isPending ? <Loader2 className="animate-spin" /> : "Confirm Purchase"}
                  </Button>
              </DialogFooter>
           </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}