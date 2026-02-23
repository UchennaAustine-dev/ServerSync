"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "./ImageUpload";
import type { MenuItem, CreateMenuItemRequest } from "@/lib/api/types";

interface MenuItemFormProps {
  initialData?: MenuItem;
  onSubmit: (data: CreateMenuItemRequest, imageFile?: File) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function MenuItemForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}: MenuItemFormProps) {
  const [formData, setFormData] = useState<CreateMenuItemRequest>({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    category: initialData?.category || "",
    preparationTime: initialData?.preparationTime || 15,
    allergens: initialData?.allergens || [],
    nutritionalInfo: initialData?.nutritionalInfo || {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    },
  });

  const [allergenInput, setAllergenInput] = useState("");
  const [imageFile, setImageFile] = useState<File | undefined>();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData, imageFile);
  };

  const handleImageSelect = (file: File) => {
    setImageFile(file);
  };

  const addAllergen = () => {
    if (
      allergenInput.trim() &&
      !formData.allergens?.includes(allergenInput.trim())
    ) {
      setFormData({
        ...formData,
        allergens: [...(formData.allergens || []), allergenInput.trim()],
      });
      setAllergenInput("");
    }
  };

  const removeAllergen = (allergen: string) => {
    setFormData({
      ...formData,
      allergens: formData.allergens?.filter((a) => a !== allergen),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Item Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          placeholder="e.g., Kung Pao Chicken"
        />
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
          placeholder="Describe the dish..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price ($) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: parseFloat(e.target.value) })
            }
            required
          />
        </div>

        <div>
          <Label htmlFor="preparationTime">Prep Time (min) *</Label>
          <Input
            id="preparationTime"
            type="number"
            min="1"
            value={formData.preparationTime}
            onChange={(e) =>
              setFormData({
                ...formData,
                preparationTime: parseInt(e.target.value),
              })
            }
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="category">Category *</Label>
        <Input
          id="category"
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          required
          placeholder="e.g., Main Course, Appetizers"
        />
      </div>

      <ImageUpload
        onImageSelect={handleImageSelect}
        currentImageUrl={initialData?.image}
        disabled={isLoading}
      />

      <div>
        <Label htmlFor="allergens">Allergens</Label>
        <div className="flex gap-2 mb-2">
          <Input
            id="allergens"
            value={allergenInput}
            onChange={(e) => setAllergenInput(e.target.value)}
            placeholder="e.g., Peanuts, Dairy"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addAllergen();
              }
            }}
          />
          <Button type="button" onClick={addAllergen} variant="outline">
            Add
          </Button>
        </div>
        {formData.allergens && formData.allergens.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.allergens.map((allergen) => (
              <span
                key={allergen}
                className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm"
              >
                {allergen}
                <button
                  type="button"
                  onClick={() => removeAllergen(allergen)}
                  className="hover:text-destructive"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <Label className="mb-2 block">Nutritional Information (optional)</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="calories" className="text-sm">
              Calories
            </Label>
            <Input
              id="calories"
              type="number"
              min="0"
              value={formData.nutritionalInfo?.calories || 0}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  nutritionalInfo: {
                    ...formData.nutritionalInfo!,
                    calories: parseInt(e.target.value) || 0,
                  },
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="protein" className="text-sm">
              Protein (g)
            </Label>
            <Input
              id="protein"
              type="number"
              min="0"
              value={formData.nutritionalInfo?.protein || 0}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  nutritionalInfo: {
                    ...formData.nutritionalInfo!,
                    protein: parseInt(e.target.value) || 0,
                  },
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="carbs" className="text-sm">
              Carbs (g)
            </Label>
            <Input
              id="carbs"
              type="number"
              min="0"
              value={formData.nutritionalInfo?.carbs || 0}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  nutritionalInfo: {
                    ...formData.nutritionalInfo!,
                    carbs: parseInt(e.target.value) || 0,
                  },
                })
              }
            />
          </div>
          <div>
            <Label htmlFor="fat" className="text-sm">
              Fat (g)
            </Label>
            <Input
              id="fat"
              type="number"
              min="0"
              value={formData.nutritionalInfo?.fat || 0}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  nutritionalInfo: {
                    ...formData.nutritionalInfo!,
                    fat: parseInt(e.target.value) || 0,
                  },
                })
              }
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading
            ? "Saving..."
            : initialData
              ? "Update Item"
              : "Create Item"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
