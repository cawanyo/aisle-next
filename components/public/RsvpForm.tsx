"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { submitRSVP } from "@/app/actions/public";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full h-12 text-lg bg-stone-900 hover:bg-rose-600 rounded-full mt-6" disabled={pending}>
      {pending ? <Loader2 className="animate-spin mr-2" /> : "Confirm RSVP"}
    </Button>
  );
}

export default function RsvpForm({ projectId }: { projectId: string }) {
  const [state, formAction] = useActionState(submitRSVP, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  if (state?.success) {
    return (
      <div className="py-12 flex flex-col items-center justify-center animate-in fade-in zoom-in bg-white rounded-3xl">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
          <Check className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-serif font-bold text-stone-800">Thank You!</h3>
        <p className="text-stone-500 mt-2">Your RSVP has been received.</p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="text-left space-y-6">
      <input type="hidden" name="projectId" value={projectId} />
      
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-stone-600 font-bold">Full Name</Label>
        <Input id="name" name="name" required placeholder="John Doe" className="bg-stone-50 border-stone-200 h-12" />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-stone-600 font-bold">Email Address</Label>
        <Input id="email" name="email" type="email" required placeholder="john@example.com" className="bg-stone-50 border-stone-200 h-12" />
      </div>

      {/* Attending? */}
      <div className="space-y-3">
        <Label className="text-stone-600 font-bold">Will you be attending?</Label>
        <RadioGroup defaultValue="yes" name="attending" className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-2 border border-stone-200 p-4 rounded-xl flex-1 cursor-pointer hover:bg-stone-50 bg-white">
            <RadioGroupItem value="yes" id="r1" />
            <Label htmlFor="r1" className="cursor-pointer font-medium">Joyfully Accept</Label>
          </div>
          <div className="flex items-center space-x-2 border border-stone-200 p-4 rounded-xl flex-1 cursor-pointer hover:bg-stone-50 bg-white">
            <RadioGroupItem value="no" id="r2" />
            <Label htmlFor="r2" className="cursor-pointer font-medium">Regretfully Decline</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Plus One */}
      <div className="flex items-center space-x-2 pt-2">
        <input type="checkbox" name="plusOne" id="plusOne" className="w-5 h-5 rounded border-stone-300 text-rose-600 focus:ring-rose-500 accent-rose-600" />
        <Label htmlFor="plusOne" className="text-stone-600 font-medium cursor-pointer">I am bringing a plus one</Label>
      </div>

      {/* Dietary */}
      <div className="space-y-2">
        <Label htmlFor="dietary" className="text-stone-600 font-bold">Dietary Requirements (Optional)</Label>
        <Input id="dietary" name="dietary" placeholder="Vegetarian, Nut allergy, etc." className="bg-stone-50 border-stone-200 h-12" />
      </div>

      <SubmitButton />
      
      {state?.message && !state.success && (
        <p className="text-red-500 text-sm text-center font-bold bg-red-50 p-3 rounded-lg">{state.message}</p>
      )}
    </form>
  );
}