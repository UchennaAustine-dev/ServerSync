"use client";

import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useProfile, useUpdateProfile } from "@/lib/hooks/auth.hooks";
import {
  User,
  Mail,
  Save,
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useState, useEffect } from "react";

export default function ProfilePage() {
  const { data: profile, isLoading, isError, error } = useProfile();
  const updateProfileMutation = useUpdateProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    avatar: "",
  });

  // Update form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        avatar: profile.avatar || "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    updateProfileMutation.mutate(formData, {
      onSuccess: () => {
        setIsEditing(false);
        setShowSuccess(true);
        // Hide success message after 3 seconds
        setTimeout(() => setShowSuccess(false), 3000);
      },
    });
  };

  const handleCancel = () => {
    // Reset form data to current profile
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        avatar: profile.avatar || "",
      });
    }
    setIsEditing(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-secondary mb-2">
            Profile Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">
                Loading profile...
              </span>
            </div>
          </Card>
        )}

        {/* Error State */}
        {isError && (
          <Alert
            variant="destructive"
            className="mb-6 rounded-2xl border-destructive/20 bg-destructive/5"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm font-medium">
              {(error as any)?.response?.data?.message ||
                "Failed to load profile. Please try again."}
            </AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {showSuccess && (
          <Alert className="mb-6 rounded-2xl border-green-200 bg-green-50 text-green-800">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription className="text-sm font-medium">
              Profile updated successfully!
            </AlertDescription>
          </Alert>
        )}

        {/* Update Error Message */}
        {updateProfileMutation.isError && (
          <Alert
            variant="destructive"
            className="mb-6 rounded-2xl border-destructive/20 bg-destructive/5"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm font-medium">
              {(updateProfileMutation.error as any)?.response?.data?.message ||
                "Failed to update profile. Please try again."}
            </AlertDescription>
          </Alert>
        )}

        {/* Personal Information */}
        {profile && (
          <Card className="p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-heading font-semibold">
                    Personal Information
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Update your personal details
                  </p>
                </div>
              </div>
              {!isEditing && (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="bg-gray-50"
                    />
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Email cannot be changed
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
              </div>

              <Separator />

              <div>
                <Label htmlFor="avatar">Avatar URL (Optional)</Label>
                <Input
                  id="avatar"
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={formData.avatar}
                  onChange={(e) =>
                    setFormData({ ...formData, avatar: e.target.value })
                  }
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Provide a URL to your profile picture
                </p>
              </div>

              {formData.avatar && (
                <div className="flex items-center gap-3 p-4 rounded-lg border bg-gray-50">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                    <img
                      src={formData.avatar}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='64' height='64' fill='%23ddd'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%23999'%3E?%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Avatar Preview</p>
                    <p className="text-xs text-muted-foreground">
                      This is how your avatar will appear
                    </p>
                  </div>
                </div>
              )}

              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={updateProfileMutation.isPending}
                  >
                    {updateProfileMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={updateProfileMutation.isPending}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Security */}
        {profile && (
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-heading font-semibold">Security</h2>
                <p className="text-sm text-muted-foreground">
                  Manage your account security
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Two-Factor Authentication
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700"
              >
                Delete Account
              </Button>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
