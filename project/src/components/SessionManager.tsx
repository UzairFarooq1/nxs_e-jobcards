import React, { useEffect } from 'react';
import { SessionTimeoutWarning } from './SessionTimeoutWarning';
import { getInactivityManager } from '../utils/inactivityManager';

interface SessionManagerProps {
  children: React.ReactNode;
}

export function SessionManager({ children }: SessionManagerProps) {
  useEffect(() => {
    const inactivityManager = getInactivityManager();
    
    // Set up warning callback
    inactivityManager.onWarning(() => {
      // The warning will be handled by the SessionTimeoutWarning component
    });

    return () => {
      inactivityManager.destroy();
    };
  }, []);

  return (
    <>
      {children}
      <SessionTimeoutWarning />
    </>
  );
}