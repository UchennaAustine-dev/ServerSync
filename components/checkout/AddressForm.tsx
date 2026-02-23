"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Address } from "@/lib/api/types/order.types";

interface AddressFormProps {
  address: Partial<Address>;
  onChange: (address: Partial<Address>) => void;
  errors?: Partial<Record<keyof Address, string>>;
}

export function AddressForm({ address, onChange, errors }: AddressFormProps) {
  const handleChange = (field: keyof Address, value: string) => {
    onChange({ ...address, [field]: value });
  };

  return (
    <div className="space-y-10" role="group" aria-labelledby="address-heading">
      <h3 id="address-heading" className="sr-only">
        Delivery Address
      </h3>
      <div className="space-y-4">
        <Label
          htmlFor="street"
          className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-4"
        >
          Delivery Residence
        </Label>
        <Input
          id="street"
          placeholder="Street address, Suite, or Penthouse"
          className="h-16 px-8 rounded-2xl bg-gray-50/50 border-transparent focus:bg-white focus:border-primary/20 transition-all text-lg"
          value={address.street || ""}
          onChange={(e) => handleChange("street", e.target.value)}
          aria-invalid={!!errors?.street}
          aria-describedby={errors?.street ? "street-error" : undefined}
          required
          autoComplete="street-address"
        />
        {errors?.street && (
          <p
            id="street-error"
            className="text-xs text-destructive ml-4"
            role="alert"
          >
            {errors.street}
          </p>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-10">
        <div className="space-y-4">
          <Label
            htmlFor="city"
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-4"
          >
            City
          </Label>
          <Input
            id="city"
            placeholder="City"
            className="h-16 px-8 rounded-2xl bg-gray-50/50 border-transparent focus:bg-white focus:border-primary/20 transition-all text-lg"
            value={address.city || ""}
            onChange={(e) => handleChange("city", e.target.value)}
            aria-invalid={!!errors?.city}
            aria-describedby={errors?.city ? "city-error" : undefined}
            required
            autoComplete="address-level2"
          />
          {errors?.city && (
            <p
              id="city-error"
              className="text-xs text-destructive ml-4"
              role="alert"
            >
              {errors.city}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <Label
            htmlFor="state"
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-4"
          >
            State
          </Label>
          <Input
            id="state"
            placeholder="State"
            className="h-16 px-8 rounded-2xl bg-gray-50/50 border-transparent focus:bg-white focus:border-primary/20 transition-all text-lg"
            value={address.state || ""}
            onChange={(e) => handleChange("state", e.target.value)}
            aria-invalid={!!errors?.state}
            aria-describedby={errors?.state ? "state-error" : undefined}
            required
            autoComplete="address-level1"
          />
          {errors?.state && (
            <p
              id="state-error"
              className="text-xs text-destructive ml-4"
              role="alert"
            >
              {errors.state}
            </p>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-10">
        <div className="space-y-4">
          <Label
            htmlFor="zipCode"
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-4"
          >
            Zip Code
          </Label>
          <Input
            id="zipCode"
            placeholder="12345"
            className="h-16 px-8 rounded-2xl bg-gray-50/50 border-transparent focus:bg-white focus:border-primary/20 transition-all text-lg"
            value={address.zipCode || ""}
            onChange={(e) => handleChange("zipCode", e.target.value)}
            aria-invalid={!!errors?.zipCode}
            aria-describedby={errors?.zipCode ? "zipCode-error" : undefined}
            required
            autoComplete="postal-code"
          />
          {errors?.zipCode && (
            <p
              id="zipCode-error"
              className="text-xs text-destructive ml-4"
              role="alert"
            >
              {errors.zipCode}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <Label
            htmlFor="country"
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-4"
          >
            Country
          </Label>
          <Input
            id="country"
            placeholder="United States"
            className="h-16 px-8 rounded-2xl bg-gray-50/50 border-transparent focus:bg-white focus:border-primary/20 transition-all text-lg"
            value={address.country || ""}
            onChange={(e) => handleChange("country", e.target.value)}
            aria-invalid={!!errors?.country}
            aria-describedby={errors?.country ? "country-error" : undefined}
            required
            autoComplete="country-name"
          />
          {errors?.country && (
            <p
              id="country-error"
              className="text-xs text-destructive ml-4"
              role="alert"
            >
              {errors.country}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
