"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
  useDeleteAddress,
} from "@/lib/hooks/customer.hooks";
import type {
  CustomerAddress,
  CreateAddressRequest,
} from "@/lib/api/types/customer.types";
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Star,
  Home,
  Briefcase,
  Building,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddressesPage() {
  const { data: addresses, isLoading } = useAddresses();
  const createAddressMutation = useCreateAddress();
  const updateAddressMutation = useUpdateAddress();
  const deleteAddressMutation = useDeleteAddress();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(
    null,
  );
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateAddressRequest>({
    label: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    isDefault: false,
  });

  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof CreateAddressRequest, string>>
  >({});

  const handleOpenDialog = (address?: CustomerAddress) => {
    if (address) {
      setEditingAddress(address);
      setFormData({
        label: address.label,
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        isDefault: address.isDefault,
      });
    } else {
      setEditingAddress(null);
      setFormData({
        label: "",
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "United States",
        isDefault: false,
      });
    }
    setFormErrors({});
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAddress(null);
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof CreateAddressRequest, string>> = {};

    if (!formData.label.trim()) {
      errors.label = "Label is required";
    }
    if (!formData.street.trim()) {
      errors.street = "Street address is required";
    }
    if (!formData.city.trim()) {
      errors.city = "City is required";
    }
    if (!formData.state.trim()) {
      errors.state = "State is required";
    }
    if (!formData.zipCode.trim()) {
      errors.zipCode = "Zip code is required";
    } else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
      errors.zipCode = "Invalid zip code format";
    }
    if (!formData.country.trim()) {
      errors.country = "Country is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (editingAddress) {
        await updateAddressMutation.mutateAsync({
          id: editingAddress.id,
          data: formData,
        });
      } else {
        await createAddressMutation.mutateAsync(formData);
      }
      handleCloseDialog();
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAddressMutation.mutateAsync(id);
      setDeleteConfirmId(null);
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  };

  const getAddressIcon = (label: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes("home")) return Home;
    if (lowerLabel.includes("work") || lowerLabel.includes("office"))
      return Briefcase;
    return Building;
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded-lg w-1/3" />
            <div className="grid md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-3xl" />
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-end justify-between border-b border-gray-100 pb-6 mb-8">
          <div>
            <h1 className="text-5xl font-heading text-secondary tracking-tight">
              My <span className="italic text-primary">Addresses.</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Manage your delivery locations
            </p>
          </div>
          <Button
            onClick={() => handleOpenDialog()}
            className="h-12 px-6 rounded-2xl font-black shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Address
          </Button>
        </div>

        {/* Addresses Grid */}
        {!addresses || addresses.length === 0 ? (
          <div className="p-20 text-center bg-white/40 backdrop-blur-xl rounded-[40px] border border-gray-100">
            <MapPin
              className="w-20 h-20 text-primary/20 mx-auto mb-8"
              strokeWidth={1}
            />
            <h3 className="font-heading text-3xl text-secondary mb-4 italic">
              No addresses saved yet.
            </h3>
            <p className="text-muted-foreground font-medium mb-10 max-w-sm mx-auto leading-relaxed">
              Add your delivery addresses to make checkout faster and easier.
            </p>
            <Button
              onClick={() => handleOpenDialog()}
              className="h-16 px-10 rounded-2xl text-lg font-black shadow-2xl shadow-primary/20"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Your First Address
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {addresses.map((address) => {
              const Icon = getAddressIcon(address.label);
              return (
                <div
                  key={address.id}
                  className="p-8 bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-sm hover:shadow-xl transition-all duration-500 group relative"
                >
                  {address.isDefault && (
                    <Badge className="absolute top-4 right-4 bg-primary/10 text-primary border-primary/20 font-black px-3 h-7 rounded-xl">
                      <Star className="w-3 h-3 mr-1 fill-primary" />
                      Default
                    </Badge>
                  )}

                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon
                        className="w-7 h-7 text-primary"
                        strokeWidth={1.5}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl font-heading text-secondary mb-1">
                        {address.label}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {address.street}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {address.city}, {address.state} {address.zipCode}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {address.country}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-6 border-t border-gray-100">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(address)}
                      className="flex-1 h-10 rounded-xl font-black"
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDeleteConfirmId(address.id)}
                      className="flex-1 h-10 rounded-xl font-black text-destructive hover:bg-destructive/5 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-heading text-secondary">
                {editingAddress ? "Edit" : "Add"}{" "}
                <span className="italic text-primary">Address</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label
                  htmlFor="label"
                  className="text-sm font-black uppercase tracking-wider text-muted-foreground"
                >
                  Label
                </Label>
                <Input
                  id="label"
                  placeholder="e.g., Home, Work, Office"
                  value={formData.label}
                  onChange={(e) =>
                    setFormData({ ...formData, label: e.target.value })
                  }
                  className={`h-12 rounded-xl ${formErrors.label ? "border-destructive" : ""}`}
                />
                {formErrors.label && (
                  <p className="text-xs text-destructive">{formErrors.label}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="street"
                  className="text-sm font-black uppercase tracking-wider text-muted-foreground"
                >
                  Street Address
                </Label>
                <Input
                  id="street"
                  placeholder="123 Main Street"
                  value={formData.street}
                  onChange={(e) =>
                    setFormData({ ...formData, street: e.target.value })
                  }
                  className={`h-12 rounded-xl ${formErrors.street ? "border-destructive" : ""}`}
                />
                {formErrors.street && (
                  <p className="text-xs text-destructive">
                    {formErrors.street}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="city"
                    className="text-sm font-black uppercase tracking-wider text-muted-foreground"
                  >
                    City
                  </Label>
                  <Input
                    id="city"
                    placeholder="New York"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    className={`h-12 rounded-xl ${formErrors.city ? "border-destructive" : ""}`}
                  />
                  {formErrors.city && (
                    <p className="text-xs text-destructive">
                      {formErrors.city}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="state"
                    className="text-sm font-black uppercase tracking-wider text-muted-foreground"
                  >
                    State
                  </Label>
                  <Input
                    id="state"
                    placeholder="NY"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    className={`h-12 rounded-xl ${formErrors.state ? "border-destructive" : ""}`}
                  />
                  {formErrors.state && (
                    <p className="text-xs text-destructive">
                      {formErrors.state}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="zipCode"
                    className="text-sm font-black uppercase tracking-wider text-muted-foreground"
                  >
                    Zip Code
                  </Label>
                  <Input
                    id="zipCode"
                    placeholder="10001"
                    value={formData.zipCode}
                    onChange={(e) =>
                      setFormData({ ...formData, zipCode: e.target.value })
                    }
                    className={`h-12 rounded-xl ${formErrors.zipCode ? "border-destructive" : ""}`}
                  />
                  {formErrors.zipCode && (
                    <p className="text-xs text-destructive">
                      {formErrors.zipCode}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="country"
                    className="text-sm font-black uppercase tracking-wider text-muted-foreground"
                  >
                    Country
                  </Label>
                  <Input
                    id="country"
                    placeholder="United States"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    className={`h-12 rounded-xl ${formErrors.country ? "border-destructive" : ""}`}
                  />
                  {formErrors.country && (
                    <p className="text-xs text-destructive">
                      {formErrors.country}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) =>
                    setFormData({ ...formData, isDefault: e.target.checked })
                  }
                  className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label
                  htmlFor="isDefault"
                  className="text-sm font-medium cursor-pointer"
                >
                  Set as default address
                </Label>
              </div>
            </div>

            <DialogFooter className="gap-3">
              <Button
                variant="outline"
                onClick={handleCloseDialog}
                className="h-12 px-6 rounded-xl font-black"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={
                  createAddressMutation.isPending ||
                  updateAddressMutation.isPending
                }
                className="h-12 px-6 rounded-xl font-black"
              >
                {createAddressMutation.isPending ||
                updateAddressMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </div>
                ) : editingAddress ? (
                  "Update Address"
                ) : (
                  "Add Address"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteConfirmId !== null}
          onOpenChange={() => setDeleteConfirmId(null)}
        >
          <DialogContent className="sm:max-w-[400px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading text-secondary">
                Delete <span className="italic text-destructive">Address?</span>
              </DialogTitle>
            </DialogHeader>

            <p className="text-muted-foreground py-4">
              Are you sure you want to delete this address? This action cannot
              be undone.
            </p>

            <DialogFooter className="gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmId(null)}
                className="h-12 px-6 rounded-xl font-black"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
                disabled={deleteAddressMutation.isPending}
                className="h-12 px-6 rounded-xl font-black"
              >
                {deleteAddressMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </div>
                ) : (
                  "Delete Address"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
