import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { getInactivityManager } from '../utils/inactivityManager';

export function SessionTimeoutWarning() {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    console.log("🔔 Setting up session timeout warning");
    const inactivityManager = getInactivityManager();
    
    // Set up warning callback
    inactivityManager.onWarning(() => {
      console.log("⚠️ Showing session timeout warning");
      setShowWarning(true);
      setTimeLeft(60);
      
      // Start countdown
      const countdown = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(countdown);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdown);
    });

    // Don't destroy the inactivity manager here since AuthContext manages it
    return () => {
      console.log("🧹 Cleaning up session timeout warning");
    };
  }, []);

  const handleExtendSession = () => {
    console.log("⏰ User extended session");
    setShowWarning(false);
    // Reset the inactivity timer
    const inactivityManager = getInactivityManager();
    inactivityManager.resetTimer();
  };

  const handleLogout = () => {
    console.log("🔐 User chose to logout from warning");
    setShowWarning(false);
    // Clear all data and reload to ensure clean logout
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center mb-4">
          <AlertTriangle className="h-8 w-8 text-yellow-500 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">
            Session Timeout Warning
          </h3>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-600 mb-2">
            Your session will expire in:
          </p>
          <div className="flex items-center text-2xl font-bold text-red-600">
            <Clock className="h-6 w-6 mr-2" />
            {timeLeft} seconds
          </div>
        </div>
        
        <p className="text-sm text-gray-500 mb-6">
          Click "Extend Session" to continue working, or "Logout" to end your session now.
        </p>
        
        <div className="flex space-x-3">
          <button
            onClick={handleExtendSession}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Extend Session
          </button>
          <button
            onClick={handleLogout}
            className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}