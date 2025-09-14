import React, { useEffect, useState } from "react";
import { supabase } from "../config/supabase";
import { useAuth } from "../contexts/AuthContext";

export function AuthCallback() {
  const { user } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Processing authentication...");

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if this is an invite callback
        const searchParams = window.location.search || "";
        const hashParams = window.location.hash || "";
        console.log("Auth callback - search params:", searchParams);
        console.log("Auth callback - hash params:", hashParams);

        const urlParams = new URLSearchParams(searchParams);
        const type = urlParams.get("type");

        // Also check hash for Supabase auth tokens
        const hashUrlParams = new URLSearchParams(hashParams.substring(1)); // Remove # from hash
        const accessToken = hashUrlParams.get("access_token");
        const tokenType = hashUrlParams.get("type");

        console.log("Auth callback - type:", type);
        console.log("Auth callback - token type:", tokenType);
        console.log("Auth callback - has access token:", !!accessToken);

        if (type === "invite" || tokenType === "invite" || accessToken) {
          setMessage("Setting up your account...");

          // Get the current session after the invite process
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();

          if (error) {
            console.error("Auth callback error:", error);
            setStatus("error");
            setMessage(
              "Authentication failed. Please try the invite link again."
            );
            return;
          }

          if (session?.user) {
            setStatus("success");
            setMessage("Account setup successful! Redirecting to login...");

            // Wait a moment then redirect to login
            setTimeout(() => {
              window.location.href = "/";
            }, 2000);
          } else {
            setStatus("error");
            setMessage("Please complete the password setup and try again.");
          }
        } else {
          // Handle other auth types or redirect to home
          setStatus("success");
          setMessage("Authentication successful! Redirecting...");
          setTimeout(() => {
            window.location.href = "/";
          }, 1000);
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        setStatus("error");
        if (error instanceof Error) {
          setMessage(
            `Authentication error: ${error.message}. Please try again or contact support.`
          );
        } else {
          setMessage(
            "An error occurred during authentication. Please try again."
          );
        }
      }
    };

    handleAuthCallback();
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case "loading":
        return (
          <svg
            className="animate-spin -ml-1 mr-3 h-8 w-8 text-blue-600"
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
        );
      case "success":
        return (
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        );
      case "error":
        return (
          <svg
            className="h-8 w-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="flex flex-col items-center">
            {getStatusIcon()}
            <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
              {status === "loading" && "Processing..."}
              {status === "success" && "Success!"}
              {status === "error" && "Authentication Error"}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">{message}</p>

            {status === "error" && (
              <div className="mt-6">
                <button
                  onClick={() => (window.location.href = "/")}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Return to Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-center mt-8">
        <p className="text-xs text-gray-500">NXS E-JobCard System</p>
      </div>
    </div>
  );
}
