import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { SESSION_TIMEOUT_MS, SESSION_WARNING_MS } from '@/lib/constants';
import { useAuth } from './AuthContext';

interface SessionContextType {
  showWarning: boolean;
  extendSession: () => void;
  timeRemaining: number;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const { user, signOut } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(SESSION_TIMEOUT_MS);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const clearTimers = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
  };

  const startTimers = () => {
    clearTimers();
    setShowWarning(false);
    lastActivityRef.current = Date.now();
    setTimeRemaining(SESSION_TIMEOUT_MS);

    warningRef.current = setTimeout(() => {
      setShowWarning(true);
      const warningStart = Date.now();
      countdownRef.current = setInterval(() => {
        const elapsed = Date.now() - warningStart;
        const remaining = SESSION_WARNING_MS - elapsed;
        setTimeRemaining(Math.max(0, remaining));
      }, 1000);
    }, SESSION_TIMEOUT_MS - SESSION_WARNING_MS);

    timeoutRef.current = setTimeout(() => {
      signOut();
    }, SESSION_TIMEOUT_MS);
  };

  const extendSession = () => {
    startTimers();
  };

  useEffect(() => {
    if (!user) {
      clearTimers();
      setShowWarning(false);
      return;
    }

    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart'];

    const handleActivity = () => {
      const now = Date.now();
      if (now - lastActivityRef.current > 30_000) {
        startTimers();
      }
      lastActivityRef.current = now;
    };

    activityEvents.forEach(e => document.addEventListener(e, handleActivity, { passive: true }));
    startTimers();

    return () => {
      activityEvents.forEach(e => document.removeEventListener(e, handleActivity));
      clearTimers();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <SessionContext.Provider value={{ showWarning, extendSession, timeRemaining }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession must be used within SessionProvider');
  return context;
}
