"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface SpecialInstructionsInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SpecialInstructionsInput({
  value,
  onChange,
  placeholder = "e.g., Leave with concierge, ring Bell A, contactless delivery",
}: SpecialInstructionsInputProps) {
  return (
    <div className="space-y-4">
      <Label
        htmlFor="specialInstructions"
        className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-4"
      >
        Personal Instructions
      </Label>
      <Textarea
        id="specialInstructions"
        placeholder={placeholder}
        className="min-h-[120px] px-8 py-6 rounded-2xl bg-gray-50/50 border-transparent focus:bg-white focus:border-primary/20 transition-all text-lg resize-none"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={500}
      />
      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 ml-4">
        {value.length} / 500 characters
      </p>
    </div>
  );
}
