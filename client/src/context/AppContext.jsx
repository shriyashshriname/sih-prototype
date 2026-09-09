import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getRiskSummary, getHabitations, getAlerts } from '../api';

const AppContext = createContext(null);

const DEFAULT_DEMO_OFFICER = {
  name: 'Dr. Rajesh Deshmukh, IAS',
  role: 'District Officer',
  email: 'collector.pune@maharashtra.gov.in',
  district: 'Pune & Maharashtra State',
  badgeId: 'MH-DM-0419',
  avatar: 'RD',
};

export const AppProvider = ({ children }) => {
  // Authentication & Role State
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('aegis_user');
      return saved ? JSON.parse(saved) : DEFAULT_DEMO_OFFICER;
    } catch {
      return DEFAULT_DEMO_OFFICER;
    }
  });

  const [presentationMode, setPresentationMode] = useState(false);

  // Platform Data State
  const [habitations, setHabitations] = useState([]);
  const [summary, setSummary]         = useState(null);
  const [alerts, setAlerts]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [hRes, sRes, aRes] = await Promise.all([
        getHabitations(),
        getRiskSummary(),
        getAlerts({ status: 'active' }),
      ]);
      setHabitations(hRes.data.data);
      setSummary(sRes.data.data);
      setAlerts(aRes.data.data);
    } catch (err) {
      setError(err.message || 'Failed to load platform data. Please ensure backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(() => {
      getAlerts({ status: 'active' }).then(r => setAlerts(r.data.data)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  // Auth methods
  const login = (role = 'District Officer', customUser = {}) => {
    const newUser = {
      ...DEFAULT_DEMO_OFFICER,
      role,
      ...customUser,
    };
    setUser(newUser);
    try {
      localStorage.setItem('aegis_user', JSON.stringify(newUser));
    } catch {}
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('aegis_user');
    } catch {}
  };

  const switchRole = (newRole) => {
    if (!user) return;
    const updated = { ...user, role: newRole };
    setUser(updated);
    try {
      localStorage.setItem('aegis_user', JSON.stringify(updated));
    } catch {}
  };

  const togglePresentationMode = () => {
    setPresentationMode(prev => !prev);
  };

  return (
    <AppContext.Provider
      value={{
        // Auth & Role
        user,
        isAuthenticated: Boolean(user),
        login,
        logout,
        switchRole,
        presentationMode,
        togglePresentationMode,

        // Data
        habitations,
        summary,
        alerts,
        loading,
        error,
        refetch: fetchAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};
