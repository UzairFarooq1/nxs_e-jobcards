import { useState, useEffect } from "react";
import { LogOut, BarChart3, Plus, Cloud, Clock } from "lucide-react";
import { User } from "../contexts/AuthContext";
import { useJobCard } from "../contexts/JobCardContext";
import { getInactivityManager } from "../utils/inactivityManager";

interface HeaderProps {
  user: User;
  currentView: string;
  onViewChange: (view: "dashboard" | "form" | "admin") => void;
  onLogout: () => void;
}

export function Header({
  user,
  currentView,
  onViewChange,
  onLogout,
}: HeaderProps) {
  const { isDriveInitialized } = useJobCard();
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const inactivityManager = getInactivityManager();

    const checkTimeLeft = () => {
      const remaining = inactivityManager.getRemainingTime();
      if (remaining > 0 && remaining < 5 * 60 * 1000) {
        // Less than 5 minutes
        setTimeLeft(Math.ceil(remaining / 1000));
      } else {
        setTimeLeft(null);
      }
    };

    const interval = setInterval(checkTimeLeft, 1000);
    checkTimeLeft();

    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <img
                src="/static/images/logo.jpg"
                alt="NXS Logo"
                className="h-10 w-auto"
                onError={(e) => {
                  console.log("Logo failed to load");
                  e.currentTarget.style.display = "none";
                }}
              />
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  NXS E-JobCard
                </h1>
                <p className="text-xs text-gray-500">
                  Nairobi X-ray Supplies Limited
                </p>
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-4">
            {user.role === "engineer" && (
              <>
                <button
                  onClick={() => onViewChange("dashboard")}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === "dashboard"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => onViewChange("form")}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === "form"
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>New Job Card</span>
                </button>
              </>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {/* Storage Status */}
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Cloud className="w-4 h-4" />
              <span>
                {isDriveInitialized ? "Google Drive" : "Local Storage"}
              </span>
            </div>

            {/* Session Timer */}
            {timeLeft && (
              <div className="flex items-center space-x-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                <Clock className="w-4 h-4" />
                <span>
                  {Math.floor(timeLeft / 60)}:
                  {(timeLeft % 60).toString().padStart(2, "0")}
                </span>
              </div>
            )}

            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">
                {user.role} {user.engineerId && `• ${user.engineerId}`}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
