"use client";

import { Shield } from "lucide-react";
import MFASettings from "@/components/mfa/MFASettings";

export default function SecurityPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-red-100 rounded-xl">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Security</h1>
            <p className="text-gray-500">Manage your account security settings</p>
          </div>
        </div>
      </div>

      {/* MFA Settings */}
      <MFASettings />
    </div>
  );
}
