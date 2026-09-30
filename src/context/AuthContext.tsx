import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, Factory, SubscriptionStatus } from '@/types';
import { authService, LoginCredentials, RegisterPayload } from '@/services/authService';
import { factoryService } from '@/services/factoryService';
import { dbStore } from '@/services/mockDatabase';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  factory: Factory | null;
  subscriptionStatus: SubscriptionStatus | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ user: User; factory: Factory | null }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  register: (payload: RegisterPayload) => Promise<{ user: User; factory: Factory; needsEmailVerification?: boolean }>;
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

    // Listen to Supabase Auth state changes (including Google OAuth callback)
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED')) {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        if (currentUser?.factoryId) {
          const f = await factoryService.getFactory(currentUser.factoryId);
          setFactory(f);
        } else {
          setFactory(null);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setFactory(null);
      }
    });

    // Subscribe to DB updates (e.g. factory updates, role changes)
    const unsubscribeDb = dbStore.subscribe(() => {
      if (user?.factoryId) {
        factoryService.getFactory(user.factoryId).then(f => {
          if (f) setFactory(f);
        });
      }
    });

    return () => {
      authSubscription.unsubscribe();
      unsubscribeDb();
    };
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    try {
      const res = await authService.login(credentials);
      setUser(res.user);
      const factory = res.factory || null;
      setFactory(factory);
      return { user: res.user, factory };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setIsLoading(true);
    try {
      return await authService.signInWithGoogle();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      const res = await authService.register(payload);
      if (!res.needsEmailVerification) {
        setUser(res.user);
        setFactory(res.factory);
      }
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
        signInWithGoogle,
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

const fallbackAuthContext: AuthContextType = {
  user: null,
  role: null,
  factory: null,
  subscriptionStatus: null,
  isLoading: true,
  login: async () => ({ user: null as any, factory: null }),
  signInWithGoogle: async () => ({}),
  register: async () => ({ user: null as any, factory: null as any }),
  logout: async () => {},
  switchRole: async () => {},
  refreshSession: async () => {},
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    return fallbackAuthContext;
  }
  return context;
};
