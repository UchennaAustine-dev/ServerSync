"use client";

import { useState } from "react";
import {
  useRestaurantPromotions,
  useCreatePromotion,
  useUpdatePromotion,
  useDeletePromotion,
} from "@/lib/hooks/restaurant.hooks";
import { useAuthStore } from "@/lib/store/auth.store";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/lib/utils/toast";
import { Plus, Pencil, Trash2, AlertCircle } from "lucide-react";
import type { Promotion } from "@/lib/api/types/restaurant.types";

interface PromotionFormData {
  code: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minimumOrder?: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
}

const initialFormData: PromotionFormData = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: 0,
  validFrom: "",
  validUntil: "",
};

export default function PromotionsPage() {
  const { user } = useAuthStore();
  const restaurantId = user?.restaurantId || "";

  const { data: promotions, isLoading } = useRestaurantPromotions(restaurantId);
  const createPromotion = useCreatePromotion(restaurantId);
  const updatePromotion = useUpdatePromotion(restaurantId);
  const deletePromotion = useDeletePromotion(restaurantId);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(
    null,
  );
  const [formData, setFormData] = useState<PromotionFormData>(initialFormData);

  const handleInputChange = (field: keyof PromotionFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async () => {
    try {
      await createPromotion.mutateAsync(formData);
      toast.success("Promotion created successfully");
      setIsCreateDialogOpen(false);
      setFormData(initialFormData);
    } catch (error) {
      toast.error("Failed to create promotion");
    }
  };

  const handleEdit = async () => {
    if (!editingPromotion) return;

    try {
      await updatePromotion.mutateAsync({
        promoId: editingPromotion.id,
        data: formData,
      });
      toast.success("Promotion updated successfully");
      setIsEditDialogOpen(false);
      setEditingPromotion(null);
      setFormData(initialFormData);
    } catch (error) {
      toast.error("Failed to update promotion");
    }
  };

  const handleDelete = async (promoId: string) => {
    if (!confirm("Are you sure you want to delete this promotion?")) return;

    try {
      await deletePromotion.mutateAsync(promoId);
      toast.success("Promotion deleted successfully");
    } catch (error) {
      toast.error("Failed to delete promotion");
    }
  };

  const handleToggleActive = async (promotion: Promotion) => {
    try {
      await updatePromotion.mutateAsync({
        promoId: promotion.id,
        data: { isActive: !promotion.isActive },
      });
      toast.success(
        `Promotion ${!promotion.isActive ? "activated" : "deactivated"} successfully`,
      );
    } catch (error) {
      toast.error("Failed to update promotion status");
    }
  };

  const openEditDialog = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      code: promotion.code,
      description: promotion.description,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
      minimumOrder: promotion.minimumOrder,
      maxDiscount: promotion.maxDiscount,
      validFrom: promotion.validFrom.split("T")[0],
      validUntil: promotion.validUntil.split("T")[0],
      usageLimit: promotion.usageLimit,
    });
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!restaurantId) {
    return (
      <div className="container mx-auto p-6">
        <Card className="p-12 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h3 className="font-heading font-semibold text-lg mb-2">
            No Restaurant Found
          </h3>
          <p className="text-muted-foreground">
            You need to be associated with a restaurant to manage promotions.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Promotions</h1>
          <p className="text-gray-600 mt-2">
            Manage your restaurant promotions and discount codes
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Promotion
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Promotion</DialogTitle>
              <DialogDescription>
                Create a new discount code for your customers
              </DialogDescription>
            </DialogHeader>
            <PromotionForm formData={formData} onChange={handleInputChange} />
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={createPromotion.isPending}
              >
                {createPromotion.isPending ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {promotions && promotions.length > 0 ? (
          promotions.map((promotion) => (
            <Card key={promotion.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{promotion.code}</CardTitle>
                    <CardDescription>{promotion.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={promotion.isActive}
                      onCheckedChange={() => handleToggleActive(promotion)}
                    />
                    <Label className="text-sm">
                      {promotion.isActive ? "Active" : "Inactive"}
                    </Label>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Discount</p>
                    <p className="font-medium">
                      {promotion.discountType === "percentage"
                        ? `${promotion.discountValue}%`
                        : `$${promotion.discountValue}`}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Min. Order</p>
                    <p className="font-medium">
                      {promotion.minimumOrder
                        ? `$${promotion.minimumOrder}`
                        : "None"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Usage</p>
                    <p className="font-medium">
                      {promotion.usageCount}
                      {promotion.usageLimit ? ` / ${promotion.usageLimit}` : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Valid Until</p>
                    <p className="font-medium">
                      {new Date(promotion.validUntil).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(promotion)}
                  >
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(promotion.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">
                No promotions yet. Create your first promotion!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Promotion</DialogTitle>
            <DialogDescription>Update promotion details</DialogDescription>
          </DialogHeader>
          <PromotionForm formData={formData} onChange={handleInputChange} />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={updatePromotion.isPending}>
              {updatePromotion.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PromotionForm({
  formData,
  onChange,
}: {
  formData: PromotionFormData;
  onChange: (field: keyof PromotionFormData, value: any) => void;
}) {
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code">Promo Code</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => onChange("code", e.target.value.toUpperCase())}
            placeholder="SUMMER2024"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="discountType">Discount Type</Label>
          <Select
            value={formData.discountType}
            onValueChange={(value) => onChange("discountType", value)}
          >
            <SelectTrigger id="discountType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="fixed">Fixed Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => onChange("description", e.target.value)}
          placeholder="Summer special discount"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="discountValue">
            Discount Value{" "}
            {formData.discountType === "percentage" ? "(%)" : "($)"}
          </Label>
          <Input
            id="discountValue"
            type="number"
            value={formData.discountValue}
            onChange={(e) =>
              onChange("discountValue", parseFloat(e.target.value))
            }
            min="0"
            step={formData.discountType === "percentage" ? "1" : "0.01"}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minimumOrder">Minimum Order ($)</Label>
          <Input
            id="minimumOrder"
            type="number"
            value={formData.minimumOrder || ""}
            onChange={(e) =>
              onChange(
                "minimumOrder",
                e.target.value ? parseFloat(e.target.value) : undefined,
              )
            }
            min="0"
            step="0.01"
          />
        </div>
      </div>

      {formData.discountType === "percentage" && (
        <div className="space-y-2">
          <Label htmlFor="maxDiscount">Max Discount ($)</Label>
          <Input
            id="maxDiscount"
            type="number"
            value={formData.maxDiscount || ""}
            onChange={(e) =>
              onChange(
                "maxDiscount",
                e.target.value ? parseFloat(e.target.value) : undefined,
              )
            }
            min="0"
            step="0.01"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="validFrom">Valid From</Label>
          <Input
            id="validFrom"
            type="date"
            value={formData.validFrom}
            onChange={(e) => onChange("validFrom", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="validUntil">Valid Until</Label>
          <Input
            id="validUntil"
            type="date"
            value={formData.validUntil}
            onChange={(e) => onChange("validUntil", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="usageLimit">Usage Limit (optional)</Label>
        <Input
          id="usageLimit"
          type="number"
          value={formData.usageLimit || ""}
          onChange={(e) =>
            onChange(
              "usageLimit",
              e.target.value ? parseInt(e.target.value) : undefined,
            )
          }
          min="1"
          placeholder="Unlimited"
        />
      </div>
    </div>
  );
}
