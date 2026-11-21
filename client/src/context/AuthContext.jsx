import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sunpower_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('sunpower_token'));
  const [originalRole, setOriginalRole] = useState(() => localStorage.getItem('sunpower_original_role') || (user?.role || ''));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('sunpower_token');
      if (savedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('sunpower_user', JSON.stringify(res.data.user));
            const existingOrig = localStorage.getItem('sunpower_original_role');
            if (!existingOrig) {
              localStorage.setItem('sunpower_original_role', res.data.user.role);
              setOriginalRole(res.data.user.role);
            }
          }
        } catch (err) {
          console.error('Failed to restore session:', err.message);
          // If expired, clear
          localStorage.removeItem('sunpower_token');
          localStorage.removeItem('sunpower_user');
          localStorage.removeItem('sunpower_original_role');
          setUser(null);
          setToken(null);
          setOriginalRole('');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        setOriginalRole(res.data.user.role);
        localStorage.setItem('sunpower_token', res.data.token);
        localStorage.setItem('sunpower_user', JSON.stringify(res.data.user));
        localStorage.setItem('sunpower_original_role', res.data.user.role);
        toast.success(`Welcome back, ${res.data.user.name}!`);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post('/auth/register', userData);
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        setOriginalRole(res.data.user.role);
        localStorage.setItem('sunpower_token', res.data.token);
        localStorage.setItem('sunpower_user', JSON.stringify(res.data.user));
        localStorage.setItem('sunpower_original_role', res.data.user.role);
        toast.success('Registration successful!');
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('sunpower_token');
    localStorage.removeItem('sunpower_user');
    localStorage.removeItem('sunpower_original_role');
    setUser(null);
    setToken(null);
    setOriginalRole('');
    toast.success('Logged out successfully');
  };

  // 1-Click Role Switcher with strict RBAC restrictions
  const switchRole = async (targetRole) => {
    // Strict RBAC Guard: If user is logged in as Customer, strictly prevent switching to Admin or staff
    if (user?.role === 'Customer' && targetRole !== 'Customer') {
      const deniedMsg = 'Access Denied: Customer accounts cannot switch to Admin or staff roles.';
      toast.error(deniedMsg);
      return { success: false, message: deniedMsg };
    }

    // If target is Admin but user was not originally Admin, forbid escalation
    if (targetRole === 'Admin' && originalRole && originalRole !== 'Admin') {
      const deniedMsg = 'Access Denied: Only users with Administrator clearance can switch to Admin.';
      toast.error(deniedMsg);
      return { success: false, message: deniedMsg };
    }

    try {
      const res = await api.post('/auth/switch-role', { role: targetRole });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('sunpower_token', res.data.token);
        localStorage.setItem('sunpower_user', JSON.stringify(res.data.user));
        toast.success(`Switched role to: ${targetRole}`);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || `Could not switch to role ${targetRole}`;
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // Dedicated direct role login (used on Home/Login page when selecting role)
  const loginAsRole = async (targetRole) => {
    try {
      const res = await api.post('/auth/switch-role', { role: targetRole });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        setOriginalRole(res.data.user.role);
        localStorage.setItem('sunpower_token', res.data.token);
        localStorage.setItem('sunpower_user', JSON.stringify(res.data.user));
        localStorage.setItem('sunpower_original_role', res.data.user.role);
        toast.success(`Logged in as ${res.data.user.name} (${targetRole})`);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || `Failed to sign in as ${targetRole}`;
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, originalRole, loading, login, register, logout, switchRole, loginAsRole }}>
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
