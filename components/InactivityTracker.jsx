'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../utils/AuthContext';

// Banking standard: 15 minutes of idle time before automatic sign-out
const DEFAULT_IDLE_TIMEOUT_SECONDS = 15 * 60; // 900 seconds (15 min)

export default function InactivityTracker() {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const lastActivityRef = useRef(Date.now());
  const checkIntervalRef = useRef(null);
  const isLoggingOutRef = useRef(false);

  const timeoutThresholdSec =
    Number(process.env.NEXT_PUBLIC_INACTIVITY_TIMEOUT_SECONDS) ||
    Number(process.env.NEXT_PUBLIC_INACTIVITY_WARNING_SECONDS) ||
    DEFAULT_IDLE_TIMEOUT_SECONDS;

  // Handle automatic silent timeout logout without any prompt
  const handleTimeout = useCallback(async () => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;
    clearInterval(checkIntervalRef.current);
    await logout();
    router.push('/login');
  }, [logout, router]);

  // Track user activity to reset the inactivity timer
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleUserActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [isAuthenticated]);

  // Inactivity check interval — signs out directly when threshold is reached
  useEffect(() => {
    if (!isAuthenticated) {
      clearInterval(checkIntervalRef.current);
      return;
    }

    isLoggingOutRef.current = false;
    lastActivityRef.current = Date.now();

    checkIntervalRef.current = setInterval(() => {
      if (isLoggingOutRef.current) return;

      const idleSeconds = Math.floor((Date.now() - lastActivityRef.current) / 1000);
      if (idleSeconds >= timeoutThresholdSec) {
        handleTimeout();
      }
    }, 1000);

    return () => {
      clearInterval(checkIntervalRef.current);
    };
  }, [isAuthenticated, timeoutThresholdSec, handleTimeout]);

  return null;
}
