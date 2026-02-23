"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useCartStore, useAuthStore, useUIStore } from "@/lib/store";
import { AddressForm } from "@/components/checkout/AddressForm";
import { ContactForm } from "@/components/checkout/ContactForm";
import { SpecialInstructionsInput } from "@/components/checkout/SpecialInstructionsInput";
import { PromoCodeInput } from "@/components/checkout/PromoCodeInput";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { useCreateOrder } from "@/lib/hooks/order.hooks";
import { useAddresses } from "@/lib/hooks/customer.hooks";
import type { Address } from "@/lib/api/types/order.types";
import type { ValidatePromoResponse } from "@/lib/api/types/order.types";
import { PaymentForm } from "@/components/payment/PaymentForm";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Star,
  MapPin,
  Home,
  Briefcase,
  Building,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const { addToast } = useUIStore();
  const {
    items,
    getTotal,
    removeFromCart,
    updateQuantity,
    clearCart,
    restaurantId,
  } = useCartStore();
  const { user } = useAuthStore();
  const createOrderMutation = useCreateOrder();
  const { data: savedAddresses } = useAddresses();

  const [step, setStep] = useState<"cart" | "details" | "payment" | "success">(
    "cart",
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null,
  );
  const [useNewAddress, setUseNewAddress] = useState(false);

  // Delivery details state
  const [deliveryAddress, setDeliveryAddress] = useState<Partial<Address>>({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
  });
  const [contactPhone, setContactPhone] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<
    (ValidatePromoResponse & { code: string }) | undefined
  >();

  // Validation errors
  const [addressErrors, setAddressErrors] = useState<
    Partial<Record<keyof Address, string>>
  >({});
  const [phoneError, setPhoneError] = useState<string>();

  const deliveryFee = 4.99;
  const serviceFee = 2.5;
  const subtotal = getTotal();
  const discount = appliedPromo?.discountAmount || 0;
  const grandTotal = subtotal + deliveryFee + serviceFee - discount;

  const handleProceedToDetails = () => {
    if (items.length === 0) return;

    // Pre-select default address if available
    if (savedAddresses && savedAddresses.length > 0 && !selectedAddressId) {
      const defaultAddress = savedAddresses.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
        setDeliveryAddress({
          street: defaultAddress.street,
          city: defaultAddress.city,
          state: defaultAddress.state,
          zipCode: defaultAddress.zipCode,
          country: defaultAddress.country,
        });
      } else {
        setUseNewAddress(true);
      }
    } else if (!savedAddresses || savedAddresses.length === 0) {
      setUseNewAddress(true);
    }

    setStep("details");
  };

  const validateDeliveryDetails = (): boolean => {
    const errors: Partial<Record<keyof Address, string>> = {};
    let phoneErr: string | undefined;

    // Validate address
    if (!deliveryAddress.street?.trim()) {
      errors.street = "Street address is required";
    }
    if (!deliveryAddress.city?.trim()) {
      errors.city = "City is required";
    }
    if (!deliveryAddress.state?.trim()) {
      errors.state = "State is required";
    }
    if (!deliveryAddress.zipCode?.trim()) {
      errors.zipCode = "Zip code is required";
    } else if (!/^\d{5}(-\d{4})?$/.test(deliveryAddress.zipCode)) {
      errors.zipCode = "Invalid zip code format";
    }
    if (!deliveryAddress.country?.trim()) {
      errors.country = "Country is required";
    }

    // Validate phone
    if (!contactPhone.trim()) {
      phoneErr = "Contact number is required";
    } else if (!/^[\d\s\-\+\(\)]+$/.test(contactPhone)) {
      phoneErr = "Invalid phone number format";
    }

    setAddressErrors(errors);
    setPhoneError(phoneErr);

    return Object.keys(errors).length === 0 && !phoneErr;
  };

  const handleProceedToPayment = async () => {
    if (!validateDeliveryDetails()) {
      return;
    }

    if (!restaurantId) {
      addToast({
        type: "error",
        message: "No restaurant selected",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create order before proceeding to payment
      const order = await createOrderMutation.mutateAsync({
        restaurantId,
        items: items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          specialInstructions: item.specialInstructions,
        })),
        deliveryAddress: deliveryAddress as Address,
        contactPhone,
        specialInstructions: specialInstructions || undefined,
        promoCode: appliedPromo?.code,
      });

      // Store order ID for payment
      setCreatedOrderId(order.id);

      // Move to payment step
      setStep("payment");

      addToast({
        type: "success",
        message: "Order created! Please complete payment.",
      });
    } catch (error: any) {
      console.error("Order creation error:", error);

      // Handle specific error cases
      if (error?.response?.data?.message) {
        addToast({
          type: "error",
          message: error.response.data.message,
        });
      } else if (error?.response?.status === 400) {
        addToast({
          type: "error",
          message: "Please check your cart items and try again",
        });
      } else {
        addToast({
          type: "error",
          message: "Unable to create order. Please try again.",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentSuccess = () => {
    // Clear cart after successful payment
    clearCart();
    // Move to success step
    setStep("success");
  };

  const handlePaymentError = (error: string) => {
    addToast({
      type: "error",
      message: error,
    });
  };

  const handleStartNewOrder = () => {
    clearCart();
    router.push("/restaurants");
  };

  if (step === "success") {
    return (
      <MainLayout>
        <div className="min-h-[80vh] flex items-center justify-center py-20 px-6">
          <div className="max-w-4xl w-full text-center space-y-12 animate-in fade-in zoom-in-95 duration-1000">
            {/* Success Icon / Branding */}
            <div className="relative inline-block group">
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-150 animate-pulse" />
              <div className="relative w-32 h-32 rounded-[40px] bg-white shadow-2xl flex items-center justify-center border border-gray-50">
                <CheckCircle
                  className="w-16 h-16 text-primary"
                  strokeWidth={1}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-heading text-secondary tracking-tighter">
                A <span className="italic text-primary">Masterpiece</span>{" "}
                confirmed.
              </h1>
              <p className="text-xl text-muted-foreground font-medium italic opacity-70">
                "Your culinary experience is now being carefully prepared."
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="bg-white/60 backdrop-blur-xl p-10 rounded-[40px] border border-white/40 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">
                      Portfolio Reference
                    </p>
                    <p className="text-2xl font-heading text-secondary truncate">
                      #
                      {createdOrderId?.slice(0, 12) ||
                        "ORD-" + Math.floor(Math.random() * 10000)}
                    </p>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-black px-4 h-8 rounded-xl">
                    Confirmed
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                    <span>Total Investment</span>
                    <span className="text-xl font-heading text-secondary tabular-nums">
                      ${grandTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                    <span>Arrival Window</span>
                    <span className="text-secondary font-bold">
                      25 - 35 Minutes
                    </span>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                    A concierge confirmation has been dispatched to your primary
                    contact. Our logistics artisans are now in pursuit.
                  </p>
                </div>
              </div>

              <div className="bg-secondary p-10 rounded-[40px] text-white flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                <div className="relative z-10 space-y-6">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Star className="w-6 h-6 text-primary fill-primary" />
                  </div>
                  <h3 className="text-3xl font-heading italic leading-tight">
                    "The palate remembers what the heart feels."
                  </h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                    — The ServeSync Chef's Circle
                  </p>
                </div>

                <div className="relative z-10 space-y-4 pt-8">
                  <Button
                    className="w-full h-14 rounded-2xl bg-white text-secondary hover:bg-white/90 font-black"
                    onClick={handleStartNewOrder}
                  >
                    Return to Gallery
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-14 rounded-2xl border-white/20 text-white hover:bg-white/10 font-black"
                    asChild
                  >
                    <Link href="/dashboard">View My Lifestyle</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Progress Steps - Minimalist Luxury Style */}
        <div className="mb-16">
          <div className="flex items-center justify-between max-w-3xl mx-auto relative px-12">
            {/* Background Line */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-100 -translate-y-1/2 z-0" />

            {["cart", "details", "payment"].map((s, idx) => {
              const isActive = step === s;
              const isCompleted =
                ["cart", "details", "payment"].indexOf(step) > idx;

              return (
                <div
                  key={s}
                  className="relative z-10 flex flex-col items-center gap-4"
                >
                  <div
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-700 ${
                      isActive
                        ? "bg-secondary text-white shadow-2xl scale-110"
                        : isCompleted
                          ? "bg-primary text-white"
                          : "bg-white border border-gray-100 text-muted-foreground/40"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <span className="text-sm font-black">{idx + 1}</span>
                    )}
                  </div>
                  <div className="absolute -bottom-8 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-500 ${
                        isActive ? "text-secondary" : "text-muted-foreground/20"
                      }`}
                    >
                      {s === "cart"
                        ? "The Selection"
                        : s === "details"
                          ? "Concierge"
                          : "Finalize"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Cart Step */}
            {step === "cart" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex items-end justify-between border-b border-gray-100 pb-6">
                  <h1 className="text-5xl font-heading text-secondary tracking-tight">
                    The <span className="italic text-primary">Selection.</span>
                  </h1>
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/40">
                    Review your curated order
                  </p>
                </div>

                {items.length === 0 ? (
                  <div className="p-20 text-center bg-white/40 backdrop-blur-xl rounded-[40px] border border-gray-100">
                    <ShoppingBag
                      className="w-20 h-20 text-primary/20 mx-auto mb-8"
                      strokeWidth={1}
                    />
                    <h3 className="font-heading text-3xl text-secondary mb-4 italic">
                      Your basket is a blank canvas.
                    </h3>
                    <p className="text-muted-foreground font-medium mb-10 max-w-sm mx-auto leading-relaxed">
                      Begin your culinary journey by exploring our selection of
                      world-class dining partners.
                    </p>
                    <Button
                      asChild
                      className="h-16 px-10 rounded-2xl text-lg font-black shadow-2xl shadow-primary/20"
                    >
                      <Link href="/restaurants">Explore Dining</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {items.map((item) => (
                      <div
                        key={item.menuItemId}
                        className="p-8 bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-sm hover:shadow-xl transition-all duration-500 group"
                      >
                        <div className="flex gap-8 items-center">
                          <div className="w-32 h-32 rounded-3xl bg-gray-50 shrink-0 overflow-hidden shadow-lg group-hover:scale-105 transition-transform duration-700">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-4xl bg-linear-to-br from-orange-50 to-rose-50">
                                🍱
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-2xl font-heading text-secondary truncate group-hover:text-primary transition-colors">
                                {item.name}
                              </h3>
                              <p className="text-2xl font-heading text-secondary tabular-nums">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-muted-foreground/60 mb-6">
                              <span>${item.price.toFixed(2)} / element</span>
                              <span className="w-1 h-1 rounded-full bg-gray-200" />
                              <span className="text-primary italic">
                                Signature Dish
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 p-1.5 bg-gray-50 rounded-2xl border border-gray-100/50">
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.menuItemId,
                                      item.quantity - 1,
                                    )
                                  }
                                  className="w-10 h-10 rounded-xl hover:bg-white hover:shadow-sm text-secondary transition-all flex items-center justify-center"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="text-sm font-black w-6 text-center tabular-nums">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(
                                      item.menuItemId,
                                      item.quantity + 1,
                                    )
                                  }
                                  className="w-10 h-10 rounded-xl hover:bg-white hover:shadow-sm text-secondary transition-all flex items-center justify-center"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.menuItemId)}
                                className="w-12 h-12 rounded-xl text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5 transition-all flex items-center justify-center"
                              >
                                <Trash2 className="w-5 h-5" strokeWidth={1.5} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Delivery Details Step */}
            {step === "details" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex items-end justify-between border-b border-gray-100 pb-6 mb-8">
                  <h1 className="text-5xl font-heading text-secondary tracking-tight">
                    The <span className="italic text-primary">Concierge.</span>
                  </h1>
                  <button
                    onClick={() => setStep("cart")}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-primary transition-colors mb-2"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    Back to Selection
                  </button>
                </div>

                <div className="bg-white/60 backdrop-blur-xl p-10 rounded-[40px] border border-white/40 shadow-sm space-y-10">
                  {/* Saved Addresses Selection */}
                  {savedAddresses && savedAddresses.length > 0 && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-4">
                          Select Delivery Address
                        </Label>
                        <Link
                          href="/profile/addresses"
                          className="text-xs text-primary hover:underline font-medium"
                        >
                          Manage Addresses
                        </Link>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        {savedAddresses.map((address) => {
                          const Icon = address.label
                            .toLowerCase()
                            .includes("home")
                            ? Home
                            : address.label.toLowerCase().includes("work") ||
                                address.label.toLowerCase().includes("office")
                              ? Briefcase
                              : Building;
                          const isSelected = selectedAddressId === address.id;

                          return (
                            <button
                              key={address.id}
                              onClick={() => {
                                setSelectedAddressId(address.id);
                                setUseNewAddress(false);
                                setDeliveryAddress({
                                  street: address.street,
                                  city: address.city,
                                  state: address.state,
                                  zipCode: address.zipCode,
                                  country: address.country,
                                });
                              }}
                              className={`p-6 rounded-2xl border-2 text-left transition-all ${
                                isSelected
                                  ? "border-primary bg-primary/5"
                                  : "border-gray-100 hover:border-gray-200"
                              }`}
                            >
                              <div className="flex items-start gap-3 mb-3">
                                <div
                                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                    isSelected ? "bg-primary/10" : "bg-gray-50"
                                  }`}
                                >
                                  <Icon
                                    className={`w-5 h-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                                    strokeWidth={1.5}
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-heading text-lg text-secondary">
                                      {address.label}
                                    </h4>
                                    {address.isDefault && (
                                      <Badge className="bg-primary/10 text-primary border-primary/20 text-[9px] px-2 h-5">
                                        Default
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {address.street}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {address.city}, {address.state}{" "}
                                    {address.zipCode}
                                  </p>
                                </div>
                              </div>
                            </button>
                          );
                        })}

                        {/* New Address Option */}
                        <button
                          onClick={() => {
                            setUseNewAddress(true);
                            setSelectedAddressId(null);
                            setDeliveryAddress({
                              street: "",
                              city: "",
                              state: "",
                              zipCode: "",
                              country: "United States",
                            });
                          }}
                          className={`p-6 rounded-2xl border-2 text-left transition-all ${
                            useNewAddress
                              ? "border-primary bg-primary/5"
                              : "border-gray-100 hover:border-gray-200"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                useNewAddress ? "bg-primary/10" : "bg-gray-50"
                              }`}
                            >
                              <Plus
                                className={`w-5 h-5 ${useNewAddress ? "text-primary" : "text-muted-foreground"}`}
                                strokeWidth={1.5}
                              />
                            </div>
                            <div>
                              <h4 className="font-heading text-lg text-secondary mb-1">
                                New Address
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                Enter a different delivery location
                              </p>
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Address Form - Show when new address is selected or no saved addresses */}
                  {(useNewAddress ||
                    !savedAddresses ||
                    savedAddresses.length === 0) && (
                    <AddressForm
                      address={deliveryAddress}
                      onChange={setDeliveryAddress}
                      errors={addressErrors}
                    />
                  )}

                  <ContactForm
                    phone={contactPhone}
                    onChange={setContactPhone}
                    error={phoneError}
                  />

                  <SpecialInstructionsInput
                    value={specialInstructions}
                    onChange={setSpecialInstructions}
                  />

                  {items.length > 0 && (
                    <PromoCodeInput
                      restaurantId={items[0].restaurantId}
                      subtotal={subtotal}
                      onPromoApplied={setAppliedPromo}
                      onPromoRemoved={() => setAppliedPromo(undefined)}
                      appliedPromo={appliedPromo}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Payment Step */}
            {step === "payment" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex items-end justify-between border-b border-gray-100 pb-6 mb-8">
                  <h1 className="text-5xl font-heading text-secondary tracking-tight">
                    The <span className="italic text-primary">Finalize.</span>
                  </h1>
                  <button
                    onClick={() => setStep("details")}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-primary transition-colors mb-2"
                    disabled={isProcessing}
                  >
                    <ArrowLeft className="w-3 h-3" />
                    Back to Concierge
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="p-8 border-2 border-primary rounded-[32px] bg-primary/5 transition-all">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
                          <CreditCard
                            className="w-8 h-8 text-primary"
                            strokeWidth={1.5}
                          />
                        </div>
                        <div>
                          <p className="font-heading text-xl text-secondary">
                            Card Portfolio
                          </p>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                            Secure Vault Payment
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-8 border border-gray-100 rounded-[32px] opacity-40 cursor-not-allowed group">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center grayscale">
                          <span className="text-3xl">💵</span>
                        </div>
                        <div>
                          <p className="font-heading text-xl text-secondary">
                            A la Direct
                          </p>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                            Coming to Collection
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/60 backdrop-blur-xl p-10 rounded-[40px] border border-white/40 shadow-sm">
                    {createdOrderId ? (
                      <PaymentForm
                        orderId={createdOrderId}
                        amount={grandTotal}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                      />
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Preparing payment...
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <OrderSummary
                items={items}
                subtotal={subtotal}
                deliveryFee={deliveryFee}
                serviceFee={serviceFee}
                discount={discount}
                total={grandTotal}
                showItems={step !== "cart"}
              />

              <div className="mt-6">
                {step === "cart" && (
                  <Button
                    className="w-full h-18 rounded-[24px] text-lg font-black shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all bg-secondary text-white hover:bg-primary"
                    onClick={handleProceedToDetails}
                    disabled={items.length === 0}
                  >
                    Proceed to Delivery
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                )}

                {step === "details" && (
                  <Button
                    className="w-full h-18 rounded-[24px] text-lg font-black shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all bg-secondary text-white hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    onClick={handleProceedToPayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating Order...
                      </div>
                    ) : (
                      <>
                        Proceed to Payment
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </>
                    )}
                  </Button>
                )}

                {step === "payment" && (
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground italic">
                      Complete payment on the left to finalize your order
                    </p>
                  </div>
                )}

                <div className="mt-8 text-center">
                  <p className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-[0.3em]">
                    Guaranteed by ServeSync Signature
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
