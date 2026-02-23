"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Bell,
  Volume2,
  Mail,
  MessageSquare,
  ShoppingBag,
  Truck,
  Star,
  AlertCircle,
} from "lucide-react";
import { showSuccessToast, showErrorToast } from "@/lib/utils/error-handler";

interface NotificationPreference {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
  };
}

/**
 * Notification Preferences Component
 *
 * Allows users to manage their notification preferences
 * for different types of events and delivery channels.
 */
export function NotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      id: "order_updates",
      label: "Order Updates",
      description: "Get notified about order status changes",
      icon: ShoppingBag,
      enabled: true,
      channels: { push: true, email: true, sms: false },
    },
    {
      id: "delivery_updates",
      label: "Delivery Updates",
      description: "Track your delivery in real-time",
      icon: Truck,
      enabled: true,
      channels: { push: true, email: false, sms: true },
    },
    {
      id: "promotions",
      label: "Promotions & Offers",
      description: "Receive special deals and discounts",
      icon: Star,
      enabled: true,
      channels: { push: true, email: true, sms: false },
    },
    {
      id: "order_reminders",
      label: "Order Reminders",
      description: "Reminders about incomplete orders",
      icon: Bell,
      enabled: false,
      channels: { push: true, email: false, sms: false },
    },
  ]);

  const [browserNotificationsEnabled, setBrowserNotificationsEnabled] =
    useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Check browser notification permission
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setBrowserNotificationsEnabled(Notification.permission === "granted");
    }
  }, []);

  const requestBrowserNotifications = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      showErrorToast(new Error("Browser notifications not supported"));
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setBrowserNotificationsEnabled(permission === "granted");

      if (permission === "granted") {
        showSuccessToast("Browser notifications enabled");
      } else {
        showErrorToast(new Error("Notification permission denied"));
      }
    } catch (error) {
      showErrorToast(error);
    }
  };

  const togglePreference = (id: string) => {
    setPreferences((prev) =>
      prev.map((pref) =>
        pref.id === id ? { ...pref, enabled: !pref.enabled } : pref,
      ),
    );
  };

  const toggleChannel = (
    id: string,
    channel: keyof NotificationPreference["channels"],
  ) => {
    setPreferences((prev) =>
      prev.map((pref) =>
        pref.id === id
          ? {
              ...pref,
              channels: {
                ...pref.channels,
                [channel]: !pref.channels[channel],
              },
            }
          : pref,
      ),
    );
  };

  const savePreferences = async () => {
    setIsSaving(true);
    try {
      // Map local preferences to API format
      const apiPreferences = {
        orderUpdates: preferences.find((p) => p.id === "order_updates")
          ?.enabled,
        promotions: preferences.find((p) => p.id === "promotions")?.enabled,
        email: preferences.some((p) => p.enabled && p.channels.email),
        sms: preferences.some((p) => p.enabled && p.channels.sms),
        push: preferences.some((p) => p.enabled && p.channels.push),
      };

      // TODO: Integrate with useUpdateNotificationPreferences hook
      await new Promise((resolve) => setTimeout(resolve, 1000));
      showSuccessToast("Notification preferences saved");
    } catch (error) {
      showErrorToast(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Browser Notifications */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-lg mb-1">
                Browser Notifications
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Get real-time notifications even when the app is in the
                background
              </p>
              {!browserNotificationsEnabled && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-900">
                    Browser notifications are currently disabled. Enable them to
                    receive real-time updates.
                  </p>
                </div>
              )}
            </div>
          </div>
          <Button
            variant={browserNotificationsEnabled ? "outline" : "default"}
            onClick={requestBrowserNotifications}
            disabled={browserNotificationsEnabled}
          >
            {browserNotificationsEnabled ? "Enabled" : "Enable"}
          </Button>
        </div>
      </Card>

      {/* Notification Types */}
      <Card className="p-6">
        <h3 className="font-heading font-semibold text-lg mb-4">
          Notification Types
        </h3>
        <div className="space-y-6">
          {preferences.map((pref) => {
            const Icon = pref.icon;
            return (
              <div key={pref.id} className="space-y-3">
                {/* Main Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <Label
                        htmlFor={pref.id}
                        className="font-medium cursor-pointer"
                      >
                        {pref.label}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {pref.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id={pref.id}
                    checked={pref.enabled}
                    onCheckedChange={() => togglePreference(pref.id)}
                  />
                </div>

                {/* Channel Toggles */}
                {pref.enabled && (
                  <div className="ml-11 pl-4 border-l-2 border-muted space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm">Push Notifications</span>
                      </div>
                      <Switch
                        checked={pref.channels.push}
                        onCheckedChange={() => toggleChannel(pref.id, "push")}
                        disabled={!browserNotificationsEnabled}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm">Email</span>
                      </div>
                      <Switch
                        checked={pref.channels.email}
                        onCheckedChange={() => toggleChannel(pref.id, "email")}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm">SMS</span>
                      </div>
                      <Switch
                        checked={pref.channels.sms}
                        onCheckedChange={() => toggleChannel(pref.id, "sms")}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Sound Preferences */}
      <Card className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Volume2 className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-heading font-semibold text-lg">
                Notification Sounds
              </h3>
              <Switch defaultChecked />
            </div>
            <p className="text-sm text-muted-foreground">
              Play a sound when you receive notifications
            </p>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={savePreferences}
          disabled={isSaving}
          className="min-w-32"
        >
          {isSaving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
}
