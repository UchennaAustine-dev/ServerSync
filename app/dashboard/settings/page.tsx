"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Store,
  Clock,
  MapPin,
  Phone,
  Mail,
  Save,
  Upload,
  Globe,
} from "lucide-react";
import { useState } from "react";

export default function RestaurantSettingsPage() {
  const [isSaving, setIsSaving] = useState(false);

  const [settings, setSettings] = useState({
    name: "Dragon Wok",
    description:
      "Authentic Chinese cuisine with a modern twist. Family recipes passed down through generations.",
    cuisine: "Chinese",
    phone: "+1 (555) 987-6543",
    email: "dragon@wok.com",
    website: "https://dragonwok.com",
    address: "456 Restaurant Ave",
    city: "San Francisco",
    zipCode: "94103",
    deliveryRadius: "5",
    minOrder: "15",
    deliveryFee: "4.99",
    estimatedTime: "30-40",
  });

  const [hours, setHours] = useState({
    monday: { open: "11:00", close: "22:00", closed: false },
    tuesday: { open: "11:00", close: "22:00", closed: false },
    wednesday: { open: "11:00", close: "22:00", closed: false },
    thursday: { open: "11:00", close: "22:00", closed: false },
    friday: { open: "11:00", close: "23:00", closed: false },
    saturday: { open: "12:00", close: "23:00", closed: false },
    sunday: { open: "12:00", close: "21:00", closed: false },
  });

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const dayNames = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-secondary mb-2">
            Restaurant Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your restaurant information and preferences
          </p>
        </div>

        {/* Basic Information */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Store className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-semibold">
                Basic Information
              </h2>
              <p className="text-sm text-muted-foreground">
                Your restaurant's public profile
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Restaurant Name</Label>
              <Input
                id="name"
                value={settings.name}
                onChange={(e) =>
                  setSettings({ ...settings, name: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="w-full min-h-[100px] px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                value={settings.description}
                onChange={(e) =>
                  setSettings({ ...settings, description: e.target.value })
                }
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cuisine">Cuisine Type</Label>
                <Input
                  id="cuisine"
                  value={settings.cuisine}
                  onChange={(e) =>
                    setSettings({ ...settings, cuisine: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={settings.phone}
                  onChange={(e) =>
                    setSettings({ ...settings, phone: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) =>
                    setSettings({ ...settings, email: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={settings.website}
                  onChange={(e) =>
                    setSettings({ ...settings, website: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Restaurant Image</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG up to 10MB
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Location */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
              <MapPin className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-semibold">Location</h2>
              <p className="text-sm text-muted-foreground">
                Where customers can find you
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={settings.address}
                onChange={(e) =>
                  setSettings({ ...settings, address: e.target.value })
                }
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={settings.city}
                  onChange={(e) =>
                    setSettings({ ...settings, city: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input
                  id="zipCode"
                  value={settings.zipCode}
                  onChange={(e) =>
                    setSettings({ ...settings, zipCode: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="deliveryRadius">Delivery Radius (miles)</Label>
              <Input
                id="deliveryRadius"
                type="number"
                value={settings.deliveryRadius}
                onChange={(e) =>
                  setSettings({ ...settings, deliveryRadius: e.target.value })
                }
              />
            </div>
          </div>
        </Card>

        {/* Delivery Settings */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
              <span className="text-2xl">🛵</span>
            </div>
            <div>
              <h2 className="text-xl font-heading font-semibold">
                Delivery Settings
              </h2>
              <p className="text-sm text-muted-foreground">
                Configure delivery options
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="minOrder">Minimum Order ($)</Label>
              <Input
                id="minOrder"
                type="number"
                value={settings.minOrder}
                onChange={(e) =>
                  setSettings({ ...settings, minOrder: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="deliveryFee">Delivery Fee ($)</Label>
              <Input
                id="deliveryFee"
                type="number"
                step="0.01"
                value={settings.deliveryFee}
                onChange={(e) =>
                  setSettings({ ...settings, deliveryFee: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="estimatedTime">Estimated Time (min)</Label>
              <Input
                id="estimatedTime"
                value={settings.estimatedTime}
                onChange={(e) =>
                  setSettings({ ...settings, estimatedTime: e.target.value })
                }
              />
            </div>
          </div>
        </Card>

        {/* Operating Hours */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-semibold">
                Operating Hours
              </h2>
              <p className="text-sm text-muted-foreground">
                Set your daily schedule
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {dayNames.map((day) => (
              <div
                key={day}
                className="flex items-center gap-4 p-3 rounded-lg border"
              >
                <div className="w-28">
                  <p className="font-medium capitalize">{day}</p>
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    type="time"
                    className="w-32"
                    value={hours[day as keyof typeof hours].open}
                    onChange={(e) =>
                      setHours({
                        ...hours,
                        [day]: {
                          ...hours[day as keyof typeof hours],
                          open: e.target.value,
                        },
                      })
                    }
                    disabled={hours[day as keyof typeof hours].closed}
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="time"
                    className="w-32"
                    value={hours[day as keyof typeof hours].close}
                    onChange={(e) =>
                      setHours({
                        ...hours,
                        [day]: {
                          ...hours[day as keyof typeof hours],
                          close: e.target.value,
                        },
                      })
                    }
                    disabled={hours[day as keyof typeof hours].closed}
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hours[day as keyof typeof hours].closed}
                    onChange={(e) =>
                      setHours({
                        ...hours,
                        [day]: {
                          ...hours[day as keyof typeof hours],
                          closed: e.target.checked,
                        },
                      })
                    }
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-muted-foreground">Closed</span>
                </label>
              </div>
            ))}
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button size="lg" onClick={handleSave} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Saving..." : "Save All Changes"}
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
