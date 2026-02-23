"use client";

import { useState } from "react";
import {
  useRestaurantHours,
  useUpdateOperatingHours,
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
import { toast } from "@/lib/utils/toast";
import { AlertCircle } from "lucide-react";

const DAYS_OF_WEEK = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

export default function SettingsPage() {
  const { user } = useAuthStore();
  const restaurantId = user?.restaurantId || "";

  const { data: operatingHours, isLoading } = useRestaurantHours(restaurantId);
  const updateHours = useUpdateOperatingHours(restaurantId);

  const [schedule, setSchedule] = useState<Record<string, any>>({});

  // Initialize schedule from fetched data
  useState(() => {
    if (operatingHours?.schedule) {
      setSchedule(operatingHours.schedule);
    }
  });

  const handleToggleDay = (day: string, isOpen: boolean) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen,
        openTime: prev[day]?.openTime || "09:00",
        closeTime: prev[day]?.closeTime || "17:00",
      },
    }));
  };

  const handleTimeChange = (
    day: string,
    field: "openTime" | "closeTime",
    value: string,
  ) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      await updateHours.mutateAsync({ schedule });
      toast.success("Operating hours updated successfully");
    } catch (error) {
      toast.error("Failed to update operating hours");
    }
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
            You need to be associated with a restaurant to manage settings.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Restaurant Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your restaurant operating hours
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Operating Hours</CardTitle>
          <CardDescription>
            Set your restaurant's opening and closing times for each day of the
            week
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {DAYS_OF_WEEK.map(({ key, label }) => {
            const daySchedule = schedule[key] || {
              isOpen: false,
              openTime: "09:00",
              closeTime: "17:00",
            };

            return (
              <div
                key={key}
                className="flex items-center gap-4 p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3 w-32">
                  <Switch
                    checked={daySchedule.isOpen}
                    onCheckedChange={(checked) => handleToggleDay(key, checked)}
                  />
                  <Label className="font-medium">{label}</Label>
                </div>

                {daySchedule.isOpen ? (
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={`${key}-open`}
                        className="text-sm text-gray-600"
                      >
                        Open:
                      </Label>
                      <Input
                        id={`${key}-open`}
                        type="time"
                        value={daySchedule.openTime}
                        onChange={(e) =>
                          handleTimeChange(key, "openTime", e.target.value)
                        }
                        className="w-32"
                      />
                    </div>
                    <span className="text-gray-400">—</span>
                    <div className="flex items-center gap-2">
                      <Label
                        htmlFor={`${key}-close`}
                        className="text-sm text-gray-600"
                      >
                        Close:
                      </Label>
                      <Input
                        id={`${key}-close`}
                        type="time"
                        value={daySchedule.closeTime}
                        onChange={(e) =>
                          handleTimeChange(key, "closeTime", e.target.value)
                        }
                        className="w-32"
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-400 flex-1">Closed</span>
                )}
              </div>
            );
          })}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setSchedule(operatingHours?.schedule || {})}
            >
              Reset
            </Button>
            <Button onClick={handleSave} disabled={updateHours.isPending}>
              {updateHours.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
