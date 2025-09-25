import React, { useState, useEffect } from "react";
import { LoginForm } from "./components/LoginForm";
import { EngineerDashboard } from "./components/EngineerDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { JobCardForm } from "./components/JobCardForm";
import { Header } from "./components/Header";
import { AuthCallback } from "./components/AuthCallback";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LoadingSpinner } from "./components/LoadingSpinner";
import { JobCardProvider } from "./contexts/JobCardContext";

function AppContent() {
  const { user, logout, isLoading } = useAuth();
  const [currentView, setCurrentView] = useState<
    "dashboard" | "form" | "admin"
  >("dashboard");

  // Check if this is an auth callback
  const isAuthCallback = React.useMemo(() => {
    try {
      console.log("🔍 Checking auth callback...");
      console.log("  window.location:", window.location);
      console.log("  pathname:", window.location.pathname);
      console.log("  search:", window.location.search);
      console.log("  href:", window.location.href);

      const pathname = window.location.pathname || "";
      const search = window.location.search || "";
      const hash = window.location.hash || "";

      const result =
        pathname === "/auth/callback" ||
        search.includes("type=invite") ||
        hash.includes("access_token") ||
        hash.includes("type=invite");
      console.log("  isAuthCallback result:", result);
      return result;
    } catch (error) {
      console.error("❌ Error checking auth callback:", error);
      console.error("Error details:", error);
      return false;
    }
  }, []);

  if (isAuthCallback) {
    return <AuthCallback />;
  }

  // Avoid flashing Login during session restoration
  if (isLoading) {
    return (
      <LoadingSpinner
        message="Restoring your session..."
        size="lg"
        variant="bars"
      />
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderContent = () => {
    if (user.role === "admin") {
      return <AdminDashboard />;
    }

    switch (currentView) {
      case "form":
        return <JobCardForm onBack={() => setCurrentView("dashboard")} />;
      case "dashboard":
      default:
        return (
          <EngineerDashboard onCreateJobCard={() => setCurrentView("form")} />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50">
      <Header
        user={user}
        currentView={currentView}
        onViewChange={setCurrentView}
        onLogout={logout}
      />
      <main className="pt-16">{renderContent()}</main>
    </div>
  );
}

function App() {
  // Add global error handler for unhandled errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error("🚨 Global error caught:", event.error);
      if (event.error?.message?.includes("Invalid URL")) {
        console.error("🔗 URL Error Details:");
        console.error("  Message:", event.error.message);
        console.error("  Stack:", event.error.stack);
        console.error("  Current URL:", window.location.href);
        console.error("  Filename:", event.filename);
        console.error("  Line:", event.lineno);
        console.error("  Column:", event.colno);
      }
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("🚨 Unhandled promise rejection:", event.reason);
      if (event.reason?.message?.includes("Invalid URL")) {
        console.error("🔗 URL Promise Rejection:", event.reason);
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <JobCardProvider>
          <AppContent />
        </JobCardProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
