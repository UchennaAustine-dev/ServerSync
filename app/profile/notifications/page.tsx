"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/lib/hooks/customer.hooks";
import {
  Bell,
  ShoppingBag,
  Tag,
  Store,
  Truck,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface NotificationToggle {
  id: keyof NotificationPreferencesState;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NotificationPreferencesState {
  orderUpdates: boolean;
  promotions: boolean;
  restaurantUpdates: boolean;
  driverUpdates: boolean;
}

const notificationTypes: NotificationToggle[] = [
  {
    id: "orderUpdates",
    label: "Order Updates",
    description: "Get notified about order status changes and confirmations",
    icon: ShoppingBag,
  },
  {
    id: "promotions",
    label: "Promotions & Offers",
    description: "Receive special deals, discounts, and exclusive offers",
    icon: Tag,
  },
  {
    id: "restaurantUpdates",
    label: "Restaurant Updates",
    description: "New menu items, special events, and restaurant news",
    icon: Store,
  },
  {
    id: "driverUpdates",
    label: "Driver Updates",
    description: "Real-time delivery tracking and driver arrival notifications",
    icon: Truck,
  },
];

export default function NotificationPreferencesPage() {
  const { data: preferences, isLoading, error } = useNotificationPreferences();
  const updatePreferencesMutation = useUpdateNotificationPreferences();

  const [localPreferences, setLocalPreferences] =
    useState<NotificationPreferencesState>({
      orderUpdates: true,
      promotions: true,
      restaurantUpdates: false,
      driverUpdates: true,
    });

  const [hasChanges, setHasChanges] = useState(false);

  // Update local state when data is loaded
  useEffect(() => {
    if (preferences) {
      setLocalPreferences({
        orderUpdates: preferences.orderUpdates ?? true,
        promotions: preferences.promotions ?? true,
        restaurantUpdates: (preferences as any).restaurantUpdates ?? false,
        driverUpdates: (preferences as any).driverUpdates ?? true,
      });
    }
  }, [preferences]);

  const handleToggle = (id: keyof NotificationPreferencesState) => {
    setLocalPreferences((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updatePreferencesMutation.mutateAsync(localPreferences);
      setHasChanges(false);
    } catch (error) {
      // Error handling is done in the mutation hook
    }
  };

  const handleReset = () => {
    if (preferences) {
      setLocalPreferences({
        orderUpdates: preferences.orderUpdates ?? true,
        promotions: preferences.promotions ?? true,
        restaurantUpdates: (preferences as any).restaurantUpdates ?? false,
        driverUpdates: (preferences as any).driverUpdates ?? true,
      });
      setHasChanges(false);
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded-lg w-1/3" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-3xl" />
              ))}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="p-12 text-center bg-red-50 rounded-[40px] border border-red-100">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="font-heading text-2xl text-secondary mb-2">
              Failed to load preferences
            </h3>
            <p className="text-muted-foreground mb-6">
              We couldn't load your notification preferences. Please try again.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="h-12 px-6 rounded-2xl font-black"
            >
              Retry
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-end justify-between border-b border-gray-100 pb-6 mb-8">
          <div>
            <h1 className="text-5xl font-heading text-secondary tracking-tight">
              Notification{" "}
              <span className="italic text-primary">Preferences.</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Manage how you receive updates and notifications
            </p>
          </div>
        </div>

        {/* Notification Types */}
        <div className="space-y-4 mb-8">
          {notificationTypes.map((type) => {
            const Icon = type.icon;
            const isEnabled = localPreferences[type.id];

            return (
              <div
                key={type.id}
                className="p-6 bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                        isEnabled ? "bg-primary/10" : "bg-gray-100"
                      }`}
                    >
                      <Icon
                        className={`w-7 h-7 transition-colors ${
                          isEnabled ? "text-primary" : "text-gray-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Label
                        htmlFor={type.id}
                        className="text-xl font-heading text-secondary mb-1 cursor-pointer block"
                      >
                        {type.label}
                      </Label>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {type.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id={type.id}
                    checked={isEnabled}
                    onCheckedChange={() => handleToggle(type.id)}
                    className="shrink-0"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Banner */}
        <div className="p-6 bg-blue-50/50 backdrop-blur-xl rounded-[32px] border border-blue-100/40 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-heading text-lg text-secondary mb-1">
                About Notifications
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                You can customize your notification preferences at any time.
                Critical order updates will always be sent to ensure you don't
                miss important information about your deliveries.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {hasChanges && (
          <div className="flex items-center justify-end gap-3 p-6 bg-amber-50/50 backdrop-blur-xl rounded-[32px] border border-amber-100/40">
            <p className="text-sm text-amber-900 font-medium mr-auto">
              You have unsaved changes
            </p>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={updatePreferencesMutation.isPending}
              className="h-12 px-6 rounded-2xl font-black"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={updatePreferencesMutation.isPending}
              className="h-12 px-6 rounded-2xl font-black shadow-lg"
            >
              {updatePreferencesMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </div>
              ) : (
                "Save Preferences"
              )}
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
