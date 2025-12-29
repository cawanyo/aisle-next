"use client";

import Image from "next/image";
import { useState } from "react";
import { claimGift } from "@/app/actions/public";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gift, Check } from "lucide-react";
import { toast } from "sonner";

export default function GiftGrid({ gifts }: { gifts: any[] }) {
  const [selectedGift, setSelectedGift] = useState<any>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [message, setMessage] = useState("");

  const handleClaim = async () => {
    setIsClaiming(true);
    const result = await claimGift(selectedGift.id, guestName, message);
    if (result.success) {
      toast.success("Gift claimed successfully!");
      setSelectedGift(null);
    } else {
      toast.error("Failed to claim gift.");
    }
    setIsClaiming(false);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {gifts.map((gift) => (
          <div key={gift.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-stone-100 flex flex-col group relative">
            
            <div className="relative h-64 w-full bg-stone-100 overflow-hidden">
              {gift.image ? (
                <Image src={gift.image} alt={gift.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
              ) : (
                <div className="flex items-center justify-center h-full text-stone-300">
                  <Gift className="w-16 h-16" />
                </div>
              )}
              {gift.claimedBy && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center text-stone-800 z-10">
                  <div className="bg-green-100 text-green-600 rounded-full p-3 mb-2">
                     <Check className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-lg">Reserved</span>
                  <span className="text-xs text-stone-500">by {gift.claimedBy}</span>
                </div>
              )}
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-serif font-bold text-xl text-stone-800">{gift.name}</h3>
                <span className="bg-rose-50 text-rose-600 px-3 py-1 rounded-full text-sm font-bold">
                  ${gift.price}
                </span>
              </div>
              <p className="text-stone-500 text-sm mb-6 flex-1 line-clamp-3">{gift.description || "A lovely gift for the couple."}</p>
              
              <Button 
                disabled={!!gift.claimedBy}
                onClick={() => setSelectedGift(gift)}
                className="w-full rounded-full h-10 bg-stone-900 hover:bg-rose-600 text-white disabled:opacity-50"
              >
                {gift.claimedBy ? "Unavailable" : "Select Gift"}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Claim Modal */}
      <Dialog open={!!selectedGift} onOpenChange={(open) => !open && setSelectedGift(null)}>
        <DialogContent className="sm:max-w-md bg-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl">Reserve: {selectedGift?.name}</DialogTitle>
            <DialogDescription>
               Please enter your details to mark this gift as purchased.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Your Name</Label>
              <Input value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Jane Doe" className="bg-stone-50" />
            </div>
            <div className="space-y-2">
              <Label>Message for the Couple (Optional)</Label>
              <Input value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Best wishes!" className="bg-stone-50" />
            </div>
          </div>
          <DialogFooter className="gap-2">
             <Button variant="ghost" onClick={() => setSelectedGift(null)}>Cancel</Button>
             <Button onClick={handleClaim} disabled={isClaiming || !guestName} className="bg-stone-900 text-white hover:bg-rose-600">
               {isClaiming ? "Processing..." : "Confirm Reservation"}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}