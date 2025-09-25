import React from "react";

interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "bars" | "circle" | "pinwheel" | "ellipsis" | "ring";
}

export function LoadingSpinner({
  message = "Loading...",
  size = "md",
  variant = "default",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const renderSpinner = () => {
    switch (variant) {
      case "bars":
        return (
          <div
            className={`${sizeClasses[size]} flex items-end justify-center space-x-1`}
          >
            <div
              className="w-1 bg-blue-600 animate-pulse"
              style={{ animationDelay: "0ms", height: "25%" }}
            ></div>
            <div
              className="w-1 bg-blue-600 animate-pulse"
              style={{ animationDelay: "150ms", height: "50%" }}
            ></div>
            <div
              className="w-1 bg-blue-600 animate-pulse"
              style={{ animationDelay: "300ms", height: "75%" }}
            ></div>
            <div
              className="w-1 bg-blue-600 animate-pulse"
              style={{ animationDelay: "450ms", height: "100%" }}
            ></div>
            <div
              className="w-1 bg-blue-600 animate-pulse"
              style={{ animationDelay: "600ms", height: "75%" }}
            ></div>
            <div
              className="w-1 bg-blue-600 animate-pulse"
              style={{ animationDelay: "750ms", height: "50%" }}
            ></div>
            <div
              className="w-1 bg-blue-600 animate-pulse"
              style={{ animationDelay: "900ms", height: "25%" }}
            ></div>
          </div>
        );
      case "circle":
        return (
          <div
            className={`${sizeClasses[size]} animate-spin rounded-full border-2 border-gray-300 border-t-blue-600`}
          ></div>
        );
      case "pinwheel":
        return (
          <div className={`${sizeClasses[size]} relative`}>
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-blue-600 border-r-blue-600"></div>
            <div
              className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-b-blue-600 border-l-blue-600"
              style={{
                animationDirection: "reverse",
                animationDuration: "0.5s",
              }}
            ></div>
          </div>
        );
      case "ellipsis":
        return (
          <div
            className={`${sizeClasses[size]} flex items-center justify-center space-x-1`}
          >
            <div
              className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: "0ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: "150ms" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: "300ms" }}
            ></div>
          </div>
        );
      case "ring":
        return (
          <div className={`${sizeClasses[size]} relative`}>
            <div className="absolute inset-0 rounded-full border-4 border-gray-300"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 animate-spin"></div>
          </div>
        );
      default:
        return (
          <div
            className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-300 border-t-blue-600`}
          ></div>
        );
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full">
      <div className="flex flex-col items-center justify-center p-8">
        {renderSpinner()}
        <p className="mt-4 text-gray-600 text-sm text-center">{message}</p>
      </div>
    </div>
  );
}
