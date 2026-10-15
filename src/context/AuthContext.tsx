import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserAccount, UserRole } from '../types';
import { DEFAULT_USERS } from '../data/mockData';

interface AuthContextType {
  currentUser: UserAccount | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => boolean;
  logout: () => void;
  switchUserRole: (role: UserRole) => void;
  hasPermission: (module: string, action?: 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export') => boolean;
  canAccessSite: (siteId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check localStorage or default to Super Admin
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('adro_hrms_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_USERS[0];
      }
    }
    return DEFAULT_USERS[0]; // Default logged in as Super Admin
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('adro_hrms_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('adro_hrms_user');
    }
  }, [currentUser]);

  const login = (email: string, _password?: string): boolean => {
    const user = DEFAULT_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      return true;
    }
    // Allow custom login fallback if demo user
    const fallback = DEFAULT_USERS[0];
    setCurrentUser(fallback);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchUserRole = (role: UserRole) => {
    const target = DEFAULT_USERS.find(u => u.role === role);
    if (target) {
      setCurrentUser(target);
    }
  };

  const hasPermission = (module: string, action: 'view' | 'create' | 'edit' | 'delete' | 'approve' | 'export' = 'view'): boolean => {
    if (!currentUser) return false;
    if (currentUser.role === 'super_admin') return true;

    // Check module permission
    const perm = currentUser.permissions.find(p => p.module === module || p.module === 'all');
    if (!perm) return false;

    switch (action) {
      case 'view': return perm.canView;
      case 'create': return perm.canCreate;
      case 'edit': return perm.canEdit;
      case 'delete': return perm.canDelete;
      case 'approve': return perm.canApprove;
      case 'export': return perm.canExport;
      default: return perm.canView;
    }
  };

  const canAccessSite = (siteId: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.assignedSites.includes('*')) return true;
    return currentUser.assignedSites.includes(siteId);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        logout,
        switchUserRole,
        hasPermission,
        canAccessSite
      }}
    >
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
