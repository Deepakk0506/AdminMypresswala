"use client";

import { useState } from "react";
import { X, Shield, Key, AlertCircle } from "lucide-react";

interface MFAVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string, isBackupCode: boolean) => Promise<boolean>;
  email: string;
}

export default function MFAVerifyModal({ isOpen, onClose, onVerify, email }: MFAVerifyModalProps) {
  const [code, setCode] = useState("");
  const [isBackupCode, setIsBackupCode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleVerify = async () => {
    if (!code || code.length < 6) {
      setError(isBackupCode ? "Enter backup code" : "Enter 6-digit code");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const success = await onVerify(code, isBackupCode);
      if (!success) {
        setError(isBackupCode ? "Invalid backup code" : "Invalid code. Try again.");
      }
    } catch (err: any) {
      setError(err.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Two-Factor Authentication</h2>
              <p className="text-sm text-gray-500">{email}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-gray-600">
            {isBackupCode
              ? "Enter one of your backup codes to sign in."
              : "Enter the 6-digit code from your authenticator app."}
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                {isBackupCode ? "Backup Code" : "Authentication Code"}
              </label>
              <button
                onClick={() => {
                  setIsBackupCode(!isBackupCode);
                  setCode("");
                  setError("");
                }}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {isBackupCode ? "Use authenticator code" : "Use backup code"}
              </button>
            </div>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                placeholder={isBackupCode ? "BACKUP-CODE" : "000000"}
                className={`w-full pl-10 pr-4 py-3 text-center text-xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                  isBackupCode ? "uppercase" : ""
                }`}
                maxLength={isBackupCode ? 8 : 6}
                autoFocus
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={isLoading || code.length < (isBackupCode ? 6 : 6)}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Verifying..." : "Verify & Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
