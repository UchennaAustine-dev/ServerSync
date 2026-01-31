"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCartStore, useAuthStore } from "@/lib/store";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  MapPin,
  CreditCard,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, removeFromCart, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [step, setStep] = useState<"cart" | "details" | "payment" | "success">(
    "cart",
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const [deliveryDetails, setDeliveryDetails] = useState({
    address: "",
    city: "",
    zipCode: "",
    phone: "",
    notes: "",
  });

  const deliveryFee = 4.99;
  const serviceFee = 2.5;
  const grandTotal = total() + deliveryFee + serviceFee;

  const handleProceedToDetails = () => {
    if (items.length === 0) return;
    setStep("details");
  };

  const handleProceedToPayment = () => {
    if (
      !deliveryDetails.address ||
      !deliveryDetails.city ||
      !deliveryDetails.zipCode ||
      !deliveryDetails.phone
    ) {
      alert("Please fill in all required delivery details");
      return;
    }
    setStep("payment");
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setStep("success");
    setIsProcessing(false);
  };

  const handleStartNewOrder = () => {
    clearCart();
    router.push("/restaurants");
  };

  if (step === "success") {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-secondary mb-3">
              Order Placed Successfully!
            </h1>
            <p className="text-muted-foreground mb-8">
              Your order has been confirmed and is being prepared. You'll
              receive updates via email and SMS.
            </p>

            <Card className="p-6 text-left mb-6">
              <div className="flex items-center justify-between mb-4 pb-4 border-b">
                <div>
                  <p className="text-sm text-muted-foreground">Order Number</p>
                  <p className="font-heading font-semibold text-lg">
                    #ORD-{Math.floor(Math.random() * 10000)}
                  </p>
                </div>
                <Badge className="bg-green-50 text-green-700 border-green-200">
                  Confirmed
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${total().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium">${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Fee</span>
                  <span className="font-medium">${serviceFee.toFixed(2)}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-base">
                  <span className="font-semibold">Total</span>
                  <span className="font-heading font-bold text-primary">
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </Card>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                className="h-12 px-8"
                onClick={handleStartNewOrder}
              >
                Order Again <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-8" asChild>
                <Link href="/dashboard">View My Orders</Link>
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            {["cart", "details", "payment"].map((s, idx) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step === s
                      ? "bg-primary text-white"
                      : ["cart", "details", "payment"].indexOf(step) > idx
                        ? "bg-green-500 text-white"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {["cart", "details", "payment"].indexOf(step) > idx ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    idx + 1
                  )}
                </div>
                {idx < 2 && (
                  <div
                    className={`w-16 h-0.5 mx-2 ${
                      ["cart", "details", "payment"].indexOf(step) > idx
                        ? "bg-green-500"
                        : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-16 mt-3">
            <span
              className={`text-sm ${step === "cart" ? "font-semibold text-primary" : "text-muted-foreground"}`}
            >
              Cart
            </span>
            <span
              className={`text-sm ${step === "details" ? "font-semibold text-primary" : "text-muted-foreground"}`}
            >
              Delivery
            </span>
            <span
              className={`text-sm ${step === "payment" ? "font-semibold text-primary" : "text-muted-foreground"}`}
            >
              Payment
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Cart Step */}
            {step === "cart" && (
              <div>
                <h1 className="text-2xl font-heading font-bold text-secondary mb-6">
                  Your Cart
                </h1>

                {items.length === 0 ? (
                  <Card className="p-12 text-center">
                    <ShoppingBag className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                    <h3 className="font-heading font-semibold text-lg mb-2">
                      Your cart is empty
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Add items from restaurants to get started
                    </p>
                    <Button asChild>
                      <Link href="/restaurants">Browse Restaurants</Link>
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <Card key={item.id} className="p-4">
                        <div className="flex gap-4">
                          <div className="w-24 h-24 rounded-lg bg-muted shrink-0 overflow-hidden">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-3xl">
                                🍽️
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-heading font-semibold text-lg mb-1">
                              {item.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-3">
                              ${item.price.toFixed(2)} each
                            </p>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2 border rounded-lg">
                                <button className="p-2 hover:bg-muted transition-colors">
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="font-semibold w-8 text-center">
                                  {item.quantity}
                                </span>
                                <button className="p-2 hover:bg-muted transition-colors">
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-heading font-bold text-lg">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Delivery Details Step */}
            {step === "details" && (
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep("cart")}
                  className="mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Cart
                </Button>

                <h1 className="text-2xl font-heading font-bold text-secondary mb-6">
                  Delivery Details
                </h1>

                <Card className="p-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="address">Delivery Address *</Label>
                      <Input
                        id="address"
                        placeholder="Street address"
                        value={deliveryDetails.address}
                        onChange={(e) =>
                          setDeliveryDetails({
                            ...deliveryDetails,
                            address: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input
                          id="city"
                          placeholder="City"
                          value={deliveryDetails.city}
                          onChange={(e) =>
                            setDeliveryDetails({
                              ...deliveryDetails,
                              city: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">Zip Code *</Label>
                        <Input
                          id="zipCode"
                          placeholder="12345"
                          value={deliveryDetails.zipCode}
                          onChange={(e) =>
                            setDeliveryDetails({
                              ...deliveryDetails,
                              zipCode: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={deliveryDetails.phone}
                        onChange={(e) =>
                          setDeliveryDetails({
                            ...deliveryDetails,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                      <Input
                        id="notes"
                        placeholder="e.g., Ring doorbell, leave at door"
                        value={deliveryDetails.notes}
                        onChange={(e) =>
                          setDeliveryDetails({
                            ...deliveryDetails,
                            notes: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Payment Step */}
            {step === "payment" && (
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setStep("details")}
                  className="mb-4"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Delivery
                </Button>

                <h1 className="text-2xl font-heading font-bold text-secondary mb-6">
                  Payment Method
                </h1>

                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="p-4 border-2 border-primary rounded-xl bg-primary/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">Credit / Debit Card</p>
                          <p className="text-sm text-muted-foreground">
                            Pay securely with your card
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border rounded-xl opacity-60 cursor-not-allowed">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          💵
                        </div>
                        <div>
                          <p className="font-semibold">Cash on Delivery</p>
                          <p className="text-sm text-muted-foreground">
                            Coming soon
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input id="expiry" placeholder="MM/YY" maxLength={5} />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          type="password"
                          placeholder="123"
                          maxLength={3}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="font-heading font-semibold text-lg mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-4">
                {items.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
                {items.length > 3 && (
                  <p className="text-xs text-muted-foreground">
                    +{items.length - 3} more items
                  </p>
                )}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${total().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span className="font-medium">${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service Fee</span>
                  <span className="font-medium">${serviceFee.toFixed(2)}</span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between text-lg font-semibold mb-6">
                <span>Total</span>
                <span className="text-primary">${grandTotal.toFixed(2)}</span>
              </div>

              {step === "cart" && (
                <Button
                  className="w-full h-12"
                  onClick={handleProceedToDetails}
                  disabled={items.length === 0}
                >
                  Proceed to Delivery
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              )}

              {step === "details" && (
                <Button
                  className="w-full h-12"
                  onClick={handleProceedToPayment}
                >
                  Proceed to Payment
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              )}

              {step === "payment" && (
                <Button
                  className="w-full h-12"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>Processing...</>
                  ) : (
                    <>
                      Place Order
                      <CheckCircle className="ml-2 w-4 h-4" />
                    </>
                  )}
                </Button>
              )}
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}
    >
      {children}
    </span>
  );
}
