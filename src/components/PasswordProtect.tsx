import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSiteSettings } from "@/components/admin/AdminSettings";

interface PasswordProtectProps {
  children: React.ReactNode;
}

export const PasswordProtect: React.FC<PasswordProtectProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isEnabled, setIsEnabled] = useState(true);
  const [correctPassword, setCorrectPassword] = useState("Flowentra2026");

  const loadSettings = () => {
    const settings = getSiteSettings();
    setIsEnabled(settings.passwordProtectionEnabled);
    setCorrectPassword(settings.accessPassword);
  };

  useEffect(() => {
    loadSettings();

    // Check if user is already authenticated (from localStorage)
    const stored = localStorage.getItem("flowentra_auth");
    if (stored === "true") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);

    // Listen for settings changes from admin panel
    const handler = () => loadSettings();
    window.addEventListener("flowentra_settings_changed", handler);
    return () => window.removeEventListener("flowentra_settings_changed", handler);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password === correctPassword) {
      setIsAuthenticated(true);
      localStorage.setItem("flowentra_auth", "true");
      setPassword("");
    } else {
      setError("Invalid password. Please try again.");
      setPassword("");
    }
  };

  if (isLoading) {
    return null;
  }

  // If password protection is disabled, show content directly
  if (!isEnabled) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 w-full max-w-md px-6">
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-2">Coming Soon</h1>
            <p className="text-2xl text-purple-300 font-semibold">2026</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-8 shadow-xl">
            <p className="text-gray-200 text-center mb-6">
              Something amazing is coming. Enter the access code to preview.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Enter access code"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder-gray-300 h-12 text-center text-lg tracking-wider"
                />
              </div>

              {error && (
                <p className="text-red-400 text-sm text-center font-medium">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold"
              >
                Access Preview
              </Button>
            </form>

            <p className="text-gray-400 text-xs text-center mt-6">
              Protected content for early access members
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default PasswordProtect;
