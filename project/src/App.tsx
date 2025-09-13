import React, { useState, useEffect } from "react";
import { LoginForm } from "./components/LoginForm";
import { EngineerDashboard } from "./components/EngineerDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { JobCardForm } from "./components/JobCardForm";
import { Header } from "./components/Header";
import { SessionManager } from "./components/SessionManager";
import { AuthCallback } from "./components/AuthCallback";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { JobCardProvider } from "./contexts/JobCardContext";

function AppContent() {
  const { user, logout } = useAuth();
  const [currentView, setCurrentView] = useState<
    "dashboard" | "form" | "admin"
  >("dashboard");

  // Check if this is an auth callback
  const isAuthCallback = React.useMemo(() => {
    try {
      const pathname = window.location.pathname || "";
      const search = window.location.search || "";

      return pathname === "/auth/callback" || search.includes("type=invite");
    } catch (error) {
      console.error("Error checking auth callback:", error);
      return false;
    }
  }, []);

  if (isAuthCallback) {
    return <AuthCallback />;
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
    <div className="min-h-screen bg-gray-50">
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
  return (
    <AuthProvider>
      <JobCardProvider>
        <SessionManager>
          <AppContent />
        </SessionManager>
      </JobCardProvider>
    </AuthProvider>
  );
}

export default App;
