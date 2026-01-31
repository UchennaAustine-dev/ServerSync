"use client";

import MainLayout from "@/components/layout/MainLayout";

export default function PrivacyPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-6 py-32 text-center">
        <h1 className="text-6xl font-heading text-secondary mb-8">Privacy <span className="italic text-primary">Concierge.</span></h1>
        <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
          Your data is treated with the same level of care as our finest culinary delights. Our full privacy statement is currently being updated to meet the highest excellence standards.
        </p>
      </div>
    </MainLayout>
  );
}
