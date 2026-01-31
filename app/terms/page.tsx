"use client";

import MainLayout from "@/components/layout/MainLayout";

export default function TermsPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-6 py-32 text-center">
        <h1 className="text-6xl font-heading text-secondary mb-8">Terms of <span className="italic text-primary">Service.</span></h1>
        <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
          Excellence requires boundaries. We are currently polishing our terms of service to ensure a transparent and luxurious experience for all ServeSync members.
        </p>
      </div>
    </MainLayout>
  );
}
