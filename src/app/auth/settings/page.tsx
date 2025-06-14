"use client";

import FamilyInvitationGenerator from "@/app/components/molecules/FamilyInvitationGenerator";
import PendingFamilyRequests from "@/app/components/molecules/PendingFamilyRequests";

export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Family Settings</h2>
        <FamilyInvitationGenerator />
      </section>
      <section>
        <PendingFamilyRequests />
      </section>
      {/* Add more settings sections here if needed */}
    </div>
  );
}
