import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, Factory, SubscriptionStatus } from '@/types';
import { authService, LoginCredentials, RegisterPayload } from '@/services/authService';
import { factoryService } from '@/services/factoryService';
import { dbStore } from '@/services/mockDatabase';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  factory: Factory | null;
  subscriptionStatus: SubscriptionStatus | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<{ user: User; factory: Factory }>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [factory, setFactory] = useState<Factory | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadSession = async () => {
    try {
      setIsLoading(true);
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      if (currentUser?.factoryId) {
        const f = await factoryService.getFactory(currentUser.factoryId);
        setFactory(f);
      } else {
        setFactory(null);
      }
    } catch (e) {
      console.error('Session load error:', e);
      setUser(null);
      setFactory(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSession();

    // Subscribe to DB updates (e.g. factory updates, role changes)
    const unsubscribe = dbStore.subscribe(() => {
      // Background sync if factory or user modified
      if (user?.factoryId) {
        factoryService.getFactory(user.factoryId).then(f => {
          if (f) setFactory(f);
        });
      }
    });

    return unsubscribe;
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const res = await authService.login(credentials);
      setUser(res.user);
      setFactory(res.factory || null);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      const res = await authService.register(payload);
      setUser(res.user);
      setFactory(res.factory);
      return res;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setFactory(null);
  };

  const switchRole = async (role: UserRole) => {
    setIsLoading(true);
    try {
      const switchedUser = await authService.quickSwitchRole(role);
      setUser(switchedUser);
      if (switchedUser.factoryId) {
        const f = await factoryService.getFactory(switchedUser.factoryId);
        setFactory(f);
      } else {
        setFactory(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    await loadSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        factory,
        subscriptionStatus: factory?.subscriptionStatus || null,
        isLoading,
        login,
        register,
        logout,
        switchRole,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
