"use client";

import { useState, useEffect } from "react";
import { Shield, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import MFASetupModal from "./MFASetupModal";

export default function MFASettings() {
  const [mfaStatus, setMfaStatus] = useState<{ mfaEnabled: boolean; verifiedAt: string | null } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [disableError, setDisableError] = useState("");

  useEffect(() => {
    checkMFAStatus();
  }, []);

  const checkMFAStatus = async () => {
    try {
      const response = await fetch("/api/mfa/status");
      if (response.ok) {
        const data = await response.json();
        setMfaStatus(data);
      }
    } catch (error) {
      console.error("Error checking MFA status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupComplete = () => {
    checkMFAStatus();
    setShowSetupModal(false);
  };

  const handleDisable = async () => {
    setDisableError("");
    try {
      const response = await fetch("/api/mfa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: disablePassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setDisableError(data.error || "Failed to disable MFA");
        return;
      }

      setMfaStatus({ mfaEnabled: false, verifiedAt: null });
      setShowDisableConfirm(false);
      setDisablePassword("");
    } catch (error) {
      setDisableError("Network error");
    }
  };

  const regenerateBackupCodes = async () => {
    try {
      const response = await fetch("/api/mfa/backup-codes", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        alert(`New backup codes generated:\n${data.backupCodes.join("\n")}\n\nSave these securely!`);
      }
    } catch (error) {
      console.error("Error regenerating backup codes:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Shield className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Two-Factor Authentication</h2>
          <p className="text-sm text-gray-500">Secure your account with 2FA</p>
        </div>
      </div>

      {mfaStatus?.mfaEnabled ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-900">2FA is enabled</p>
              <p className="text-sm text-green-700">
                Your account is protected with two-factor authentication.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={regenerateBackupCodes}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Regenerate Backup Codes
            </button>
            <button
              onClick={() => setShowDisableConfirm(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Disable 2FA
            </button>
          </div>

          {showDisableConfirm && (
            <div className="p-4 bg-red-50 rounded-lg space-y-3">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Warning: Disabling 2FA makes your account less secure</span>
              </div>
              <p className="text-sm text-red-600">
                Enter your password to confirm:
              </p>
              <input
                type="password"
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
              {disableError && (
                <p className="text-sm text-red-600">{disableError}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={handleDisable}
                  disabled={!disablePassword}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  Confirm Disable
                </button>
                <button
                  onClick={() => {
                    setShowDisableConfirm(false);
                    setDisablePassword("");
                    setDisableError("");
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-900">2FA is not enabled</p>
              <p className="text-sm text-amber-700">
                Enable two-factor authentication for additional security.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSetupModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Enable 2FA
          </button>
        </div>
      )}

      <MFASetupModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        onSetupComplete={handleSetupComplete}
      />
    </div>
  );
}
