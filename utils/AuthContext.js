'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Helper function to set a cookie
const setCookie = (name, value, days) => {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = '; expires=' + date.toUTCString();
  }
  document.cookie = name + '=' + encodeURIComponent(value || '') + expires + '; path=/';
};

// Helper function to get a cookie
const getCookie = (name) => {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      const raw = c.substring(nameEQ.length, c.length);
      try {
        return decodeURIComponent(raw);
      } catch {
        return raw;
      }
    }
  }
  return null;
};

const AuthContext = createContext(null);

// Strip large nested payloads before writing to browser cookie (4KB limit)
const toCompactCookieUser = (u) => {
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt,
    totalBalance: u.totalBalance,
    allowedPages: u.allowedPages,
    lockedPages: u.lockedPages,
    adminPermissions: u.adminPermissions,
  };
};

export const AuthProvider = ({ children }) => {
  // Deterministic initial state so SSR and initial client hydration always match 100%
  const [user, setUser] = useState(null);
  const [accountCache, setAccountCache] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Hydrate user and account cache from client storage immediately after mount
    const storedAuthStatus = getCookie('isAuthenticated') || localStorage.getItem('ubs_is_authenticated');
    const storedUserData = localStorage.getItem('ubs_auth_user') || getCookie('user');

    if ((storedAuthStatus === 'true' || storedUserData) && storedUserData) {
      try {
        const parsed = JSON.parse(storedUserData);
        setUser(parsed);
        setIsAuthenticated(true);
      } catch (e) {
        console.error("Failed to parse user data from storage", e);
        setCookie('user', '', -1);
        setCookie('isAuthenticated', '', -1);
        try {
          localStorage.removeItem('ubs_auth_user');
          localStorage.removeItem('ubs_is_authenticated');
        } catch (_) {}
      }
    }

    try {
      const rawCache = sessionStorage.getItem('ubs_account_cache');
      if (rawCache) {
        setAccountCache(JSON.parse(rawCache));
      }
    } catch (_) {}

    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setCookie('isAuthenticated', 'true', 7);
    try {
      setCookie('user', JSON.stringify(toCompactCookieUser(userData)), 7);
      localStorage.setItem('ubs_auth_user', JSON.stringify(userData));
      localStorage.setItem('ubs_is_authenticated', 'true');
    } catch (_) {}
  };

  const updateUser = React.useCallback((updatedFields) => {
    setUser((prev) => {
      const base = prev || {};
      const merged = { ...base, ...updatedFields };
      try {
        setCookie('user', JSON.stringify(toCompactCookieUser(merged)), 7);
        localStorage.setItem('ubs_auth_user', JSON.stringify(merged));
      } catch (_) {}
      return merged;
    });
  }, []);

  const updateAccountCache = React.useCallback((cacheFields) => {
    setAccountCache((prev) => {
      const merged = { ...(prev || {}), ...cacheFields };
      try {
        sessionStorage.setItem('ubs_account_cache', JSON.stringify(merged));
      } catch (_) {}
      return merged;
    });
  }, []);

  const logout = async () => {
    setUser(null);
    setAccountCache(null);
    setIsAuthenticated(false);
    setCookie('isAuthenticated', '', -1);
    setCookie('user', '', -1);
    try {
      localStorage.removeItem('ubs_auth_user');
      localStorage.removeItem('ubs_is_authenticated');
      sessionStorage.removeItem('ubs_account_cache');
    } catch (_) {}
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (_) {}
  };

  return (
    <AuthContext.Provider value={{ user, accountCache, isAuthenticated, loading, login, updateUser, updateAccountCache, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
