"use client";

import MainLayout from "@/components/layout/MainLayout";

export default function HelpPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-6 py-32 text-center">
        <h1 className="text-6xl font-heading text-secondary mb-8">Help <span className="italic text-primary">Center.</span></h1>
        <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
          We are currently refining our concierge services. For immediate assistance, please contact our support team at <span className="text-secondary font-black underline">support@serversync.com</span>.
        </p>
      </div>
    </MainLayout>
  );
}
