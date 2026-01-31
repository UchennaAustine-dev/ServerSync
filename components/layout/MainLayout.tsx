"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, User, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAuthStore, useCartStore } from "@/lib/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";

const navLinks = [
  { href: "/restaurants", label: "Restaurants" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { items, total, removeFromCart, clearCart } = useCartStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!hydrated) return null;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <span className="relative font-heading text-3xl font-normal tracking-[-0.05em] text-secondary group-hover:text-primary transition-colors duration-500">
                Serve<span className="italic">Sync.</span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-5 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
                  pathname === link.href
                    ? "text-primary bg-primary/10 shadow-sm"
                    : "text-muted-foreground hover:text-secondary hover:bg-muted/80"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Cart */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-primary/10 rounded-full transition-colors"
                >
                  <ShoppingBag className="w-5.5 h-5.5 text-secondary" />
                  {items.length > 0 && (
                    <span className="absolute top-0 right-0 w-5 h-5 flex items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold ring-2 ring-white">
                      {items.length}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-md flex flex-col">
                <SheetHeader className="px-6 pt-6 pb-2">
                  <SheetTitle className="font-heading text-4xl text-secondary tracking-tight">
                    Your <span className="italic text-primary">Basket.</span>
                  </SheetTitle>
                </SheetHeader>

                {items.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                    <div className="relative mb-8 group">
                      <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full scale-150 group-hover:scale-[2] transition-transform duration-1000" />
                      <div className="relative w-32 h-32 rounded-full bg-white shadow-2xl flex items-center justify-center">
                        <ShoppingBag className="w-12 h-12 text-primary" strokeWidth={1} />
                      </div>
                    </div>
                    <h3 className="text-2xl font-heading text-secondary mb-3">Silent Palate.</h3>
                    <p className="text-muted-foreground font-medium mb-10 max-w-[240px] leading-relaxed italic">
                      "Your basket awaits its first masterpiece."
                    </p>
                    <SheetClose asChild>
                      <Button asChild variant="outline" className="h-14 px-10 rounded-2xl text-lg font-black border-gray-100 hover:bg-gray-50 transition-all">
                        <Link href="/restaurants">Explore Dining</Link>
                      </Button>
                    </SheetClose>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-8 scrollbar-hide">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-6 group animate-in fade-in slide-in-from-right-8 duration-700"
                        >
                          <div className="w-20 h-20 rounded-2xl bg-gray-50 overflow-hidden shrink-0 shadow-lg group-hover:shadow-primary/5 transition-all">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl bg-linear-to-br from-orange-50 to-rose-50">🍱</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-heading text-lg text-secondary truncate leading-tight mb-1 group-hover:text-primary transition-colors">
                              {item.name}
                            </h4>
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-black text-secondary/60 tabular-nums bg-gray-50 px-2 py-0.5 rounded-md">
                                ${item.price.toFixed(2)}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-gray-200" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Qty: {item.quantity}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="w-10 h-10 rounded-xl bg-gray-50 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all flex items-center justify-center"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-8 bg-gray-50/50 border-t border-gray-100 rounded-t-[40px] space-y-6">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          <span>Subtotal</span>
                          <span className="tabular-nums">${total().toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          <span>Concierge Fee</span>
                          <span className="tabular-nums">$4.99</span>
                        </div>
                        <div className="h-px bg-gray-200/50 my-2" />
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Amount</p>
                            <p className="text-4xl font-heading font-black text-secondary tabular-nums">${(total() + 4.99).toFixed(2)}</p>
                          </div>
                          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black h-8 px-4 rounded-xl">
                            {items.length} Elements
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-4 pt-2">
                        <SheetClose asChild>
                          <Button asChild className="w-full h-16 rounded-[24px] text-lg font-black shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                            <Link href="/checkout">
                              Secure Checkout
                              <ChevronRight className="ml-2 w-5 h-5" />
                            </Link>
                          </Button>
                        </SheetClose>
                        <button
                          onClick={clearCart}
                          className="w-full text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 hover:text-destructive transition-colors py-2"
                        >
                          Clear Selection
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </SheetContent>
            </Sheet>

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-10 h-10 rounded-2xl border border-gray-100 hover:border-primary/20 hover:bg-primary/5 transition-all">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="bg-secondary text-white text-[10px] font-black uppercase tracking-tighter">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 rounded-3xl p-2 border-gray-100 shadow-2xl">
                  <DropdownMenuLabel className="px-4 py-3">
                    <p className="font-black text-secondary leading-tight">{user.name}</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-1">
                      {user.email}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-50" />
                  <DropdownMenuItem asChild className="rounded-2xl px-4 py-3 focus:bg-primary/5 focus:text-primary transition-colors">
                    <Link href="/dashboard" className="cursor-pointer flex items-center font-bold">
                      <User className="mr-3 h-4 w-4" /> Account Setting
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-50" />
                  <DropdownMenuItem
                    onClick={logout}
                    className="rounded-2xl px-4 py-3 text-destructive focus:bg-destructive/5 focus:text-destructive cursor-pointer font-bold"
                  >
                    <LogOut className="mr-3 h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-4 ml-2">
                <Link href="/login" className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                  Sign In
                </Link>
                <Button asChild className="h-10 px-6 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <div className="flex flex-col gap-6 pt-6">
                  <nav className="flex flex-col gap-1">
                    {navLinks.map((link) => (
                      <SheetClose key={link.href} asChild>
                        <Link
                          href={link.href}
                          className={`px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                            pathname === link.href
                              ? "text-primary bg-primary/5"
                              : "text-muted-foreground hover:text-secondary hover:bg-muted/50"
                          }`}
                        >
                          {link.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </nav>

                  {!user && (
                    <div className="flex flex-col gap-2 pt-4 border-t">
                      <SheetClose asChild>
                        <Button asChild variant="outline" className="w-full">
                          <Link href="/login">Sign in</Link>
                        </Button>
                      </SheetClose>
                      <SheetClose asChild>
                        <Button asChild className="w-full">
                          <Link href="/register">Get Started</Link>
                        </Button>
                      </SheetClose>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[120px] -z-10" />
      
      <div className="container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-20">
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-heading text-3xl font-normal tracking-[-0.05em] text-secondary">
                Serve<span className="italic text-primary">Sync.</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm font-medium leading-relaxed max-w-xs">
              Deleviring the most premium culinary experiences from top-tier local restaurants straight to your doorstep.
            </p>
            <div className="flex gap-4">
              {['Facebook', 'Twitter', 'Instagram'].map(social => (
                <Link key={social} href="#" className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-secondary hover:bg-primary hover:text-white transition-all duration-300">
                  <span className="text-[10px] font-black uppercase">{social[0]}</span>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-secondary mb-8">Navigation</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/restaurants" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform" />
                  Explore Dining
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform" />
                  Our Heritage
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform" />
                  Partner with Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-secondary mb-8">Personal</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/dashboard" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform" />
                  Member Dashboard
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform" />
                  Account Access
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform" />
                  Active Basket
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-secondary mb-8">Legal & Support</h4>
            <ul className="space-y-4">
              <li>
                <Link href="/help" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Help Center</Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Privacy Concierge</Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
            © 2026 ServeSync. Crafted for Excellence.
          </p>
          <div className="flex gap-8">
            {['Privacy', 'Legal', 'Cookies'].map(item => (
              <Link key={item} href="#" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 hover:text-secondary transition-colors">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}
