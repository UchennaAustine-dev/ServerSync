"use client";

import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Star,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, removeFromCart, updateQuantity, clearCart } = useCartStore();
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
        <div className="min-h-[80vh] flex items-center justify-center py-20 px-6">
          <div className="max-w-4xl w-full text-center space-y-12 animate-in fade-in zoom-in-95 duration-1000">
            {/* Success Icon / Branding */}
            <div className="relative inline-block group">
              <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full scale-150 animate-pulse" />
              <div className="relative w-32 h-32 rounded-[40px] bg-white shadow-2xl flex items-center justify-center border border-gray-50">
                <CheckCircle className="w-16 h-16 text-primary" strokeWidth={1} />
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-6xl md:text-8xl font-heading text-secondary tracking-tighter">
                A <span className="italic text-primary">Masterpiece</span> confirmed.
              </h1>
              <p className="text-xl text-muted-foreground font-medium italic opacity-70">
                "Your culinary experience is now being carefully prepared."
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="bg-white/60 backdrop-blur-xl p-10 rounded-[40px] border border-white/40 shadow-sm space-y-6">
                <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Portfolio Reference</p>
                    <p className="text-2xl font-heading text-secondary truncate">#ORD-{Math.floor(Math.random() * 10000)}</p>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-black px-4 h-8 rounded-xl">
                    Confirmed
                  </Badge>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                    <span>Total Investment</span>
                    <span className="text-xl font-heading text-secondary tabular-nums">${grandTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                    <span>Arrival Window</span>
                    <span className="text-secondary font-bold">25 - 35 Minutes</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                    A concierge confirmation has been dispatched to your primary contact. Our logistics artisans are now in pursuit.
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
              const isCompleted = ["cart", "details", "payment"].indexOf(step) > idx;

              return (
                <div key={s} className="relative z-10 flex flex-col items-center gap-4">
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
                      {s === "cart" ? "The Selection" : s === "details" ? "Concierge" : "Finalize"}
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
                    <ShoppingBag className="w-20 h-20 text-primary/20 mx-auto mb-8" strokeWidth={1} />
                    <h3 className="font-heading text-3xl text-secondary mb-4 italic">Your basket is a blank canvas.</h3>
                    <p className="text-muted-foreground font-medium mb-10 max-w-sm mx-auto leading-relaxed">
                      Begin your culinary journey by exploring our selection of world-class dining partners.
                    </p>
                    <Button asChild className="h-16 px-10 rounded-2xl text-lg font-black shadow-2xl shadow-primary/20">
                      <Link href="/restaurants">Explore Dining</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {items.map((item) => (
                      <div key={item.id} className="p-8 bg-white/60 backdrop-blur-xl rounded-[32px] border border-white/40 shadow-sm hover:shadow-xl transition-all duration-500 group">
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
                              <span className="text-primary italic">Signature Dish</span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 p-1.5 bg-gray-50 rounded-2xl border border-gray-100/50">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-10 h-10 rounded-xl hover:bg-white hover:shadow-sm text-secondary transition-all flex items-center justify-center"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="text-sm font-black w-6 text-center tabular-nums">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-10 h-10 rounded-xl hover:bg-white hover:shadow-sm text-secondary transition-all flex items-center justify-center"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.id)}
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
                  <div className="grid gap-10">
                    <div className="space-y-4">
                      <Label htmlFor="address" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-4">
                        Delivery Residence
                      </Label>
                      <Input
                        id="address"
                        placeholder="Street address, Suite, or Penthouse"
                        className="h-16 px-8 rounded-2xl bg-gray-50/50 border-transparent focus:bg-white focus:border-primary/20 transition-all text-lg"
                        value={deliveryDetails.address}
                        onChange={(e) =>
                          setDeliveryDetails({
                            ...deliveryDetails,
                            address: e.target.value,
                          })
                        }
                      />
                    </div>
                    
                    <div className="grid sm:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <Label htmlFor="city" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-4">
                          City
                        </Label>
                        <Input
                          id="city"
                          placeholder="City"
                          className="h-16 px-8 rounded-2xl bg-gray-50/50 border-transparent focus:bg-white focus:border-primary/20 transition-all text-lg"
                          value={deliveryDetails.city}
                          onChange={(e) =>
                            setDeliveryDetails({
                              ...deliveryDetails,
                              city: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="space-y-4">
                        <Label htmlFor="zipCode" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-4">
                          Zip Code
                        </Label>
                        <Input
                          id="zipCode"
                          placeholder="12345"
                          className="h-16 px-8 rounded-2xl bg-gray-50/50 border-transparent focus:bg-white focus:border-primary/20 transition-all text-lg"
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

                    <div className="space-y-4">
                      <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-4">
                        Contact Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        className="h-16 px-8 rounded-2xl bg-gray-50/50 border-transparent focus:bg-white focus:border-primary/20 transition-all text-lg"
                        value={deliveryDetails.phone}
                        onChange={(e) =>
                          setDeliveryDetails({
                            ...deliveryDetails,
                            phone: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-4">
                      <Label htmlFor="notes" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-4">
                        Personal Instructions
                      </Label>
                      <Input
                        id="notes"
                        placeholder="e.g., Leave with concierge, ring Bell A"
                        className="h-16 px-8 rounded-2xl bg-gray-50/50 border-transparent focus:bg-white focus:border-primary/20 transition-all text-lg"
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
                          <CreditCard className="w-8 h-8 text-primary" strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="font-heading text-xl text-secondary">Card Portfolio</p>
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
                          <p className="font-heading text-xl text-secondary">A la Direct</p>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                            Coming to Collection
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/60 backdrop-blur-xl p-10 rounded-[40px] border border-white/40 shadow-sm space-y-10">
                    <div className="space-y-4">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-4">Cardholder Card Number</Label>
                      <Input
                        placeholder="•••• •••• •••• ••••"
                        className="h-16 px-8 rounded-2xl bg-gray-50/50 border-transparent focus:bg-white focus:border-primary/20 transition-all text-xl tabular-nums tracking-[0.2em]"
                        maxLength={19}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-4">Expiry</Label>
                        <Input 
                          placeholder="MM / YY" 
                          className="h-16 px-8 rounded-2xl bg-gray-50/50 border-transparent focus:bg-white focus:border-primary/20 transition-all text-lg"
                        />
                      </div>
                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-4">CVC</Label>
                        <Input
                          type="password"
                          placeholder="•••"
                          className="h-16 px-8 rounded-2xl bg-gray-50/50 border-transparent focus:bg-white focus:border-primary/20 transition-all text-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar - Concierge Invoice Style */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/95 backdrop-blur-3xl p-8 rounded-[40px] border border-white/40 shadow-[0_32px_80px_-20px_rgba(0,0,0,0.1)] sticky top-24">
              <div className="flex items-center justify-between border-b border-gray-100 pb-6 mb-8">
                <h2 className="font-heading text-2xl text-secondary">
                  Order <span className="italic text-primary">Details.</span>
                </h2>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black px-3 rounded-lg">
                  {items.length} Elements
                </Badge>
              </div>
 
              <div className="space-y-6 mb-10 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-secondary truncate">{item.name}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mt-1">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-heading font-normal text-secondary tabular-nums">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
 
              <div className="space-y-4 pt-6 border-t border-gray-50 mb-10">
                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                  <span>Subtotal</span>
                  <span className="text-secondary tabular-nums">${total().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                  <span>Delivery Concierge</span>
                  <span className="text-secondary tabular-nums">${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-muted-foreground/60">
                  <span>Global Service</span>
                  <span className="text-secondary tabular-nums">${serviceFee.toFixed(2)}</span>
                </div>
              </div>
 
              <div className="flex justify-between items-end mb-10">
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Investment</p>
                  <p className="text-4xl font-heading font-black text-secondary tabular-nums tracking-tighter">
                    ${grandTotal.toFixed(2)}
                  </p>
                </div>
              </div>
 
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
                  className="w-full h-18 rounded-[24px] text-lg font-black shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all bg-secondary text-white hover:bg-primary"
                  onClick={handleProceedToPayment}
                >
                  Proceed to Payment
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              )}
 
              {step === "payment" && (
                <Button
                  className="w-full h-18 rounded-[24px] text-lg font-black shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary text-white hover:bg-primary/90"
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Finalizing...
                    </div>
                  ) : (
                    <>
                      Execute Order
                      <CheckCircle className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
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
    </MainLayout>
  );
}

