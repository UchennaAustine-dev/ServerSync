"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ContactFormProps {
  phone: string;
  onChange: (phone: string) => void;
  error?: string;
}

export function ContactForm({ phone, onChange, error }: ContactFormProps) {
  return (
    <div className="space-y-4">
      <Label
        htmlFor="phone"
        className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-4"
      >
        Contact Number
      </Label>
      <Input
        id="phone"
        type="tel"
        placeholder="+1 (555) 000-0000"
        className="h-16 px-8 rounded-2xl bg-gray-50/50 border-transparent focus:bg-white focus:border-primary/20 transition-all text-lg"
        value={phone}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? "phone-error" : undefined}
        required
        autoComplete="tel"
      />
      {error && (
        <p
          id="phone-error"
          className="text-xs text-destructive ml-4"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
