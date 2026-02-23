"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRegisterDriver } from "@/lib/hooks/driver.hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Loader2, Upload, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";

/**
 * Driver Registration Page
 *
 * Implements driver registration flow with:
 * - Personal information collection
 * - Vehicle details
 * - Document uploads (license, insurance, registration)
 * - Registration status tracking
 *
 * Requirements: 11.1, 11.2, 11.3, 11.4
 */
export default function DriverRegisterPage() {
  const router = useRouter();
  const registerMutation = useRegisterDriver();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    licenseNumber: "",
    vehicleType: "",
    vehiclePlate: "",
    vehicleColor: "",
  });

  const [documents, setDocuments] = useState<{
    license?: File;
    insurance?: File;
    registration?: File;
  }>({});

  const [validationError, setValidationError] = useState<string | null>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    docType: "license" | "insurance" | "registration",
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setValidationError(`${docType} file must be less than 5MB`);
        return;
      }

      // Validate file type
      const validTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/pdf",
      ];
      if (!validTypes.includes(file.type)) {
        setValidationError(`${docType} must be an image (JPG, PNG) or PDF`);
        return;
      }

      setDocuments((prev) => ({ ...prev, [docType]: file }));
      setValidationError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setValidationError("Password must be at least 8 characters");
      return;
    }

    // Validate phone number format
    const phoneRegex = /^\+?[\d\s-()]+$/;
    if (!phoneRegex.test(formData.phone)) {
      setValidationError("Please enter a valid phone number");
      return;
    }

    // Prepare registration data
    const registrationData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      licenseNumber: formData.licenseNumber,
      vehicleType: formData.vehicleType,
      vehiclePlate: formData.vehiclePlate,
      vehicleColor: formData.vehicleColor,
      documents: Object.keys(documents).length > 0 ? documents : undefined,
    };

    registerMutation.mutate(registrationData, {
      onSuccess: () => {
        // Redirect to driver dashboard after successful registration
        router.push("/driver-portal");
      },
    });
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex items-center justify-center p-4">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 -right-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-linear-to-tr from-primary/5 to-rose-50/30 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-4xl relative z-10">
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-8 group">
            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
              <span className="font-heading font-black text-white text-2xl tracking-tighter">
                S
              </span>
            </div>
            <span className="text-2xl font-heading font-black text-secondary tracking-tight">
              ServeSync
            </span>
          </Link>
          <h1 className="text-4xl font-heading font-black text-secondary mb-3 tracking-tight leading-tight">
            Become a{" "}
            <span className="text-primary italic text-3xl">Driver.</span>
          </h1>
          <p className="text-muted-foreground font-medium">
            Start earning by delivering food to hungry customers.
          </p>
        </div>

        <Card className="border-gray-100 bg-white/70 backdrop-blur-2xl shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] rounded-[40px] overflow-hidden">
          <CardHeader className="pt-10 pb-0 px-10">
            <CardTitle className="text-2xl font-black text-secondary">
              Driver Registration
            </CardTitle>
            <CardDescription className="font-medium text-muted-foreground">
              Complete the form below to start your journey as a driver.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-10 pb-10 pt-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {(validationError || registerMutation.isError) && (
                <Alert
                  variant="destructive"
                  className="rounded-2xl border-destructive/20 bg-destructive/5 text-destructive"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs font-bold">
                    {validationError ||
                      (registerMutation.error as any)?.response?.data
                        ?.message ||
                      "Registration failed. Please try again."}
                  </AlertDescription>
                </Alert>
              )}

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-black text-secondary">
                  Personal Information
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1"
                    >
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      className="h-14 rounded-2xl bg-gray-50/50 border-gray-100 focus:bg-white focus:ring-primary/20 transition-all font-medium"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1"
                    >
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="driver@example.com"
                      className="h-14 rounded-2xl bg-gray-50/50 border-gray-100 focus:bg-white focus:ring-primary/20 transition-all font-medium"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1"
                    >
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      className="h-14 rounded-2xl bg-gray-50/50 border-gray-100 focus:bg-white focus:ring-primary/20 transition-all font-medium"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="licenseNumber"
                      className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1"
                    >
                      Driver License Number *
                    </Label>
                    <Input
                      id="licenseNumber"
                      placeholder="DL123456789"
                      className="h-14 rounded-2xl bg-gray-50/50 border-gray-100 focus:bg-white focus:ring-primary/20 transition-all font-medium"
                      value={formData.licenseNumber}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          licenseNumber: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="password"
                      className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1"
                    >
                      Password *
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="h-14 rounded-2xl bg-gray-50/50 border-gray-100 focus:bg-white focus:ring-primary/20 transition-all font-medium"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="confirmPassword"
                      className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1"
                    >
                      Confirm Password *
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      className="h-14 rounded-2xl bg-gray-50/50 border-gray-100 focus:bg-white focus:ring-primary/20 transition-all font-medium"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-black text-secondary">
                  Vehicle Information
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label
                      htmlFor="vehicleType"
                      className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1"
                    >
                      Vehicle Type *
                    </Label>
                    <Select
                      value={formData.vehicleType}
                      onValueChange={(value) =>
                        setFormData({ ...formData, vehicleType: value })
                      }
                      required
                    >
                      <SelectTrigger className="h-14 rounded-2xl bg-gray-50/50 border-gray-100 focus:bg-white focus:ring-primary/20 transition-all font-medium">
                        <SelectValue placeholder="Select vehicle type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="car">Car</SelectItem>
                        <SelectItem value="motorcycle">Motorcycle</SelectItem>
                        <SelectItem value="bicycle">Bicycle</SelectItem>
                        <SelectItem value="scooter">Scooter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="vehiclePlate"
                      className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1"
                    >
                      License Plate *
                    </Label>
                    <Input
                      id="vehiclePlate"
                      placeholder="ABC-1234"
                      className="h-14 rounded-2xl bg-gray-50/50 border-gray-100 focus:bg-white focus:ring-primary/20 transition-all font-medium"
                      value={formData.vehiclePlate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vehiclePlate: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="vehicleColor"
                      className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1"
                    >
                      Vehicle Color *
                    </Label>
                    <Input
                      id="vehicleColor"
                      placeholder="Black"
                      className="h-14 rounded-2xl bg-gray-50/50 border-gray-100 focus:bg-white focus:ring-primary/20 transition-all font-medium"
                      value={formData.vehicleColor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vehicleColor: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Document Uploads */}
              <div className="space-y-4">
                <h3 className="text-lg font-black text-secondary">
                  Document Uploads
                </h3>
                <p className="text-sm text-muted-foreground">
                  Upload your documents (optional). Accepted formats: JPG, PNG,
                  PDF. Max size: 5MB per file.
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  {/* Driver License */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="license"
                      className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1"
                    >
                      Driver License
                    </Label>
                    <div className="relative">
                      <Input
                        id="license"
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, "license")}
                      />
                      <Label
                        htmlFor="license"
                        className="flex flex-col items-center justify-center h-32 rounded-2xl bg-gray-50/50 border-2 border-dashed border-gray-200 hover:border-primary/50 cursor-pointer transition-all"
                      >
                        {documents.license ? (
                          <div className="flex flex-col items-center gap-2">
                            <CheckCircle2 className="h-8 w-8 text-green-500" />
                            <span className="text-xs font-medium text-center px-2">
                              {documents.license.name}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground">
                              Upload License
                            </span>
                          </div>
                        )}
                      </Label>
                    </div>
                  </div>

                  {/* Insurance */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="insurance"
                      className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1"
                    >
                      Insurance
                    </Label>
                    <div className="relative">
                      <Input
                        id="insurance"
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, "insurance")}
                      />
                      <Label
                        htmlFor="insurance"
                        className="flex flex-col items-center justify-center h-32 rounded-2xl bg-gray-50/50 border-2 border-dashed border-gray-200 hover:border-primary/50 cursor-pointer transition-all"
                      >
                        {documents.insurance ? (
                          <div className="flex flex-col items-center gap-2">
                            <CheckCircle2 className="h-8 w-8 text-green-500" />
                            <span className="text-xs font-medium text-center px-2">
                              {documents.insurance.name}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground">
                              Upload Insurance
                            </span>
                          </div>
                        )}
                      </Label>
                    </div>
                  </div>

                  {/* Vehicle Registration */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="registration"
                      className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1"
                    >
                      Registration
                    </Label>
                    <div className="relative">
                      <Input
                        id="registration"
                        type="file"
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, "registration")}
                      />
                      <Label
                        htmlFor="registration"
                        className="flex flex-col items-center justify-center h-32 rounded-2xl bg-gray-50/50 border-2 border-dashed border-gray-200 hover:border-primary/50 cursor-pointer transition-all"
                      >
                        {documents.registration ? (
                          <div className="flex flex-col items-center gap-2">
                            <CheckCircle2 className="h-8 w-8 text-green-500" />
                            <span className="text-xs font-medium text-center px-2">
                              {documents.registration.name}
                            </span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <span className="text-xs font-medium text-muted-foreground">
                              Upload Registration
                            </span>
                          </div>
                        )}
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 py-2">
                <Checkbox
                  id="terms"
                  required
                  className="rounded-md border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <label
                  htmlFor="terms"
                  className="text-xs font-medium leading-none text-muted-foreground"
                >
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-secondary font-black hover:text-primary transition-colors"
                  >
                    Terms & Privacy Policy
                  </Link>{" "}
                  and confirm that all information provided is accurate.
                </label>
              </div>

              <Button
                type="submit"
                className="w-full h-16 rounded-2xl text-lg font-black shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Complete Registration"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-gray-50 bg-gray-50/30 py-8">
            <p className="text-sm text-muted-foreground font-medium">
              Already registered?{" "}
              <Link
                href="/login"
                className="font-black text-secondary hover:text-primary transition-colors"
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </Card>

        <p className="text-center mt-10 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
          ServeSync &copy; 2026 Crafted with Passion
        </p>
      </div>
    </div>
  );
}
