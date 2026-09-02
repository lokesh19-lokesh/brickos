import { dbStore } from './mockDatabase';
import { User, UserRole, Factory } from '@/types';

const AUTH_USER_KEY = 'brickflow_auth_session';

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterPayload {
  user: {
    fullName: string;
    email: string;
    phone: string;
    password?: string;
  };
  factory: {
    name: string;
    code: string;
    ownerName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    gstNumber?: string;
    factoryType: Factory['factoryType'];
    employeesCount: string;
    dailyCapacity: string;
    mainProducts: string[];
  };
}

export const authService = {
  async getCurrentUser(): Promise<User | null> {
    try {
      const stored = localStorage.getItem(AUTH_USER_KEY);
      if (stored) {
        const user = JSON.parse(stored) as User;
        // Verify user still exists in DB
        const users = dbStore.get('users');
        const found = users.find(u => u.id === user.id);
        return found || user;
      }
    } catch (e) {
      console.error('Error reading session:', e);
    }
    // Default fallback to Factory Owner for instant exploration if not logged in
    const defaultOwner = dbStore.get('users').find(u => u.role === 'factory_owner');
    if (defaultOwner) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(defaultOwner));
      return defaultOwner;
    }
    return null;
  },

  async login(credentials: LoginCredentials): Promise<{ user: User; factory?: Factory }> {
    await new Promise(res => setTimeout(res, 300)); // Simulate async latency
    const users = dbStore.get('users');
    const user = users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());

    if (!user) {
      throw new Error('Invalid email or password. Please check your credentials.');
    }

    if (user.status === 'inactive') {
      throw new Error('Your account has been deactivated. Please contact your factory administrator.');
    }

    let factory: Factory | undefined;
    if (user.factoryId) {
      const factories = dbStore.get('factories');
      factory = factories.find(f => f.id === user.factoryId);
      if (factory && factory.subscriptionStatus === 'suspended') {
        throw new Error('Factory subscription has been suspended. Please contact platform support.');
      }
    }

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    return { user, factory };
  },

  async quickSwitchRole(role: UserRole): Promise<User> {
    const users = dbStore.get('users');
    const user = users.find(u => u.role === role);
    if (!user) {
      throw new Error(`No mock user found for role ${role}`);
    }
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    return user;
  },

  async register(payload: RegisterPayload): Promise<{ user: User; factory: Factory }> {
    await new Promise(res => setTimeout(res, 400));
    const factories = dbStore.get('factories');
    const users = dbStore.get('users');

    const factoryId = `fact_${Date.now().toString(36)}`;
    const userId = `usr_${Date.now().toString(36)}`;

    const newFactory: Factory = {
      id: factoryId,
      name: payload.factory.name,
      code: payload.factory.code || `FAC-${Math.floor(100 + Math.random() * 900)}`,
      ownerName: payload.factory.ownerName,
      phone: payload.factory.phone,
      email: payload.factory.email,
      address: payload.factory.address,
      city: payload.factory.city,
      state: payload.factory.state,
      pincode: payload.factory.pincode,
      gstNumber: payload.factory.gstNumber,
      factoryType: payload.factory.factoryType,
      employeesCount: payload.factory.employeesCount,
      dailyCapacity: payload.factory.dailyCapacity,
      mainProducts: payload.factory.mainProducts || ['Fly Ash Bricks', 'Cement Bricks'],
      planId: 'plan_trial',
      subscriptionStatus: 'trial',
      subscriptionExpiry: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    const newUser: User = {
      id: userId,
      email: payload.user.email,
      fullName: payload.user.fullName,
      phone: payload.user.phone,
      role: 'factory_owner',
      factoryId: factoryId,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    dbStore.set('factories', [newFactory, ...factories]);
    dbStore.set('users', [newUser, ...users]);

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));
    return { user: newUser, factory: newFactory };
  },

  async logout(): Promise<void> {
    localStorage.removeItem(AUTH_USER_KEY);
  },

  async forgotPassword(email: string): Promise<boolean> {
    await new Promise(res => setTimeout(res, 300));
    return true;
  },

  async resetPassword(password: string): Promise<boolean> {
    await new Promise(res => setTimeout(res, 300));
    return true;
  }
};
