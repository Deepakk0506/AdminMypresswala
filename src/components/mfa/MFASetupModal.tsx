"use client";

import { useState } from "react";
import { X, Copy, CheckCircle, AlertCircle, Shield } from "lucide-react";

interface MFASetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSetupComplete: () => void;
}

export default function MFASetupModal({ isOpen, onClose, onSetupComplete }: MFASetupModalProps) {
  const [step, setStep] = useState<"qr" | "verify" | "backup">("qr");
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateQR = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/mfa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate QR code");
      }

      setQrCode(data.qrCode);
      setSecret(data.manualEntryKey);
      setStep("verify");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter a 6-digit code");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const response = await fetch("/api/mfa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", code: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid code");
      }

      setBackupCodes(data.backupCodes);
      setStep("backup");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const finish = () => {
    onSetupComplete();
    onClose();
    // Reset state
    setStep("qr");
    setQrCode("");
    setSecret("");
    setVerificationCode("");
    setBackupCodes([]);
    setError("");
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Enable 2FA</h2>
              <p className="text-sm text-gray-500">Secure your account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === "qr" && (
            <div className="space-y-4">
              <p className="text-gray-600">
                Two-factor authentication adds an extra layer of security to your account.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">How it works:</h3>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Scan the QR code with your authenticator app</li>
                  <li>Enter the 6-digit code to verify</li>
                  <li>Save your backup codes securely</li>
                </ol>
              </div>
              <button
                onClick={generateQR}
                disabled={isLoading}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Generating..." : "Get Started"}
              </button>
            </div>
          )}

          {step === "verify" && (
            <div className="space-y-4">
              {qrCode && (
                <div className="flex flex-col items-center space-y-4">
                  <img
                    src={qrCode}
                    alt="QR Code for authenticator"
                    className="w-48 h-48 rounded-lg border-2 border-gray-200"
                  />
                  <p className="text-sm text-gray-600 text-center">
                    Scan this code with Google Authenticator, Authy, or Microsoft Authenticator
                  </p>
                  <div className="bg-gray-50 p-3 rounded-lg w-full">
                    <p className="text-xs text-gray-500 mb-1">Manual entry key:</p>
                    <code className="text-sm font-mono bg-gray-200 px-2 py-1 rounded break-all">
                      {secret}
                    </code>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Enter 6-digit verification code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <button
                onClick={verifyCode}
                disabled={isLoading || verificationCode.length !== 6}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isLoading ? "Verifying..." : "Verify & Continue"}
              </button>
            </div>
          )}

          {step === "backup" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-green-600 bg-green-50 p-4 rounded-lg">
                <CheckCircle className="w-6 h-6" />
                <div>
                  <p className="font-semibold">2FA Enabled Successfully!</p>
                  <p className="text-sm text-green-700">Save these backup codes</p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                <p className="text-amber-800 text-sm mb-3">
                  <strong>Important:</strong> Save these backup codes in a secure place. 
                  You&apos;ll need them if you lose access to your authenticator app.
                </p>
                <div className="bg-white p-3 rounded border border-amber-200">
                  <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                    {backupCodes.map((code, i) => (
                      <div key={i} className="text-gray-700">{code}</div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={copyBackupCodes}
                  className="mt-3 flex items-center gap-2 text-sm text-amber-700 hover:text-amber-800"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copy all codes
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={finish}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
