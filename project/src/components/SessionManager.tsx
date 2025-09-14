import React, { useEffect } from 'react';
import { SessionTimeoutWarning } from './SessionTimeoutWarning';
import { getInactivityManager } from '../utils/inactivityManager';

interface SessionManagerProps {
  children: React.ReactNode;
}

export function SessionManager({ children }: SessionManagerProps) {
  // The SessionManager now just renders the children and SessionTimeoutWarning
  // The inactivity manager is handled by AuthContext and SessionTimeoutWarning
  
  return (
    <>
      {children}
      <SessionTimeoutWarning />
    </>
  );
}