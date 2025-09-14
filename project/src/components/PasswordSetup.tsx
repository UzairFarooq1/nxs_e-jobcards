import React, { useState } from "react";
import { supabase } from "../config/supabase";
import { Lock, Eye, EyeOff } from "lucide-react";

interface PasswordSetupProps {
  onSuccess: () => void;
  onError: (error: string) => void;
}

export function PasswordSetup({ onSuccess, onError }: PasswordSetupProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validatePassword = (pwd: string) => {
    const errors: { [key: string]: string } = {};

    if (pwd.length < 8) {
      errors.length = "Password must be at least 8 characters long";
    }

    if (!/(?=.*[a-z])/.test(pwd)) {
      errors.lowercase = "Password must contain at least one lowercase letter";
    }

    if (!/(?=.*[A-Z])/.test(pwd)) {
      errors.uppercase = "Password must contain at least one uppercase letter";
    }

    if (!/(?=.*\d)/.test(pwd)) {
      errors.number = "Password must contain at least one number";
    }

    if (!/(?=.*[@$!%*?&])/.test(pwd)) {
      errors.special =
        "Password must contain at least one special character (@$!%*?&)";
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    // Validate password
    const passwordErrors = validatePassword(password);
    if (Object.keys(passwordErrors).length > 0) {
      setErrors(passwordErrors);
      setIsLoading(false);
      return;
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      setErrors({ confirm: "Passwords do not match" });
      setIsLoading(false);
      return;
    }

    try {
      console.log("🔐 Setting up password...");

      // Update user password
      const { data, error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        console.error("❌ Password setup error:", error);
        onError(error.message || "Failed to set password");
        return;
      }

      console.log("✅ Password set successfully:", data);
      onSuccess();
    } catch (error: any) {
      console.error("❌ Password setup failed:", error);
      onError(error.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center mb-8">
            <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Set Your Password
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Create a secure password for your NXS E-JobCard account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                New Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {Object.entries(errors)
                .filter(([key]) => key !== "confirm")
                .map(([key, error]) => (
                  <p key={key} className="mt-1 text-xs text-red-600">
                    {error}
                  </p>
                ))}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.confirm && (
                <p className="mt-1 text-xs text-red-600">{errors.confirm}</p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                Password Requirements:
              </h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li className={password.length >= 8 ? "text-green-600" : ""}>
                  ✓ At least 8 characters long
                </li>
                <li
                  className={
                    /(?=.*[a-z])/.test(password) ? "text-green-600" : ""
                  }
                >
                  ✓ One lowercase letter
                </li>
                <li
                  className={
                    /(?=.*[A-Z])/.test(password) ? "text-green-600" : ""
                  }
                >
                  ✓ One uppercase letter
                </li>
                <li
                  className={/(?=.*\d)/.test(password) ? "text-green-600" : ""}
                >
                  ✓ One number
                </li>
                <li
                  className={
                    /(?=.*[@$!%*?&])/.test(password) ? "text-green-600" : ""
                  }
                >
                  ✓ One special character (@$!%*?&)
                </li>
              </ul>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Setting Password...
                  </>
                ) : (
                  "Set Password"
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              After setting your password, you'll be able to log in to the
              system.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
