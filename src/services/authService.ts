import { supabase } from '@/lib/supabase';
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
      // 1. Check Supabase Auth Session
      const client = supabase as any;
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const email = session.user.email?.toLowerCase();
        const isSuperAdminEmail = email === 'brickserpsoftware@gmail.com';

        // Fetch live profile from Supabase (by auth_user_id or email)
        let { data: profile } = await client
          .from('profiles')
          .select('*')
          .eq('auth_user_id', session.user.id)
          .maybeSingle();

        if (!profile && email) {
          const { data: profileByEmail } = await client
            .from('profiles')
            .select('*')
            .eq('email', email)
            .maybeSingle();

          if (profileByEmail) {
            profile = profileByEmail;
            // Link auth_user_id with the OAuth session user
            await client
              .from('profiles')
              .update({ auth_user_id: session.user.id, updated_at: new Date().toISOString() })
              .eq('id', profileByEmail.id);
          } else {
            // New user signed in via Google: create their profile in PostgreSQL
            const newRole: UserRole = isSuperAdminEmail ? 'super_admin' : 'factory_owner';
            const fullName = session.user.user_metadata?.full_name || session.user.user_metadata?.name || (isSuperAdminEmail ? 'BrickOS Super Admin' : 'Factory Owner');
            
            const { data: newProfile } = await client
              .from('profiles')
              .insert({
                auth_user_id: session.user.id,
                email,
                full_name: fullName,
                phone: session.user.phone || '+91 85006 93113',
                role: newRole,
                status: 'active',
              })
              .select('*')
              .maybeSingle();

            if (newProfile) profile = newProfile;
          }
        }

        const role: UserRole = (isSuperAdminEmail || profile?.role === 'super_admin') ? 'super_admin' : 'factory_owner';

        const user: User = {
          id: profile?.id || session.user.id,
          email: email || 'brickserpsoftware@gmail.com',
          fullName: isSuperAdminEmail ? 'BrickOS Super Admin' : (profile?.full_name || session.user.user_metadata?.full_name || 'Rajesh Sharma'),
          phone: profile?.phone || '+91 85006 93113',
          role,
          factoryId: role === 'super_admin' ? undefined : '00000000-0000-0000-0000-000000000002',
          status: profile?.status || 'active',
          createdAt: profile?.created_at || new Date().toISOString(),
        };

        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
        return user;
      }

      // 2. Check local session
      const stored = localStorage.getItem(AUTH_USER_KEY);
      if (stored) {
        const user = JSON.parse(stored) as User;
        if (user.email?.toLowerCase() === 'brickserpsoftware@gmail.com') {
          user.role = 'super_admin';
        }
        return user;
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

  async signInWithGoogle(): Promise<{ error?: string }> {
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        throw error;
      }
      return {};
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      return { error: err.message || 'Failed to initialize Google login' };
    }
  },

  async login(credentials: LoginCredentials): Promise<{ user: User; factory?: Factory }> {
    const email = credentials.email.trim().toLowerCase();
    const isSuperAdmin = email === 'brickserpsoftware@gmail.com';
    const password = credentials.password || (isSuperAdmin ? 'Admin@123456' : 'Owner@123456');

    // 1. Authenticate against Supabase Auth
    let supabaseUser: any = null;
    try {
      const { data: authRes, error: authErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (!authErr && authRes.user) {
        supabaseUser = authRes.user;
      }
    } catch (err) {
      console.warn('Supabase signInWithPassword:', err);
    }

    // 2. Fetch live profile from Supabase Database
    let profileData: any = null;
    try {
      const { data: dbProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      profileData = dbProfile;
    } catch (err) {
      console.warn('Supabase profile fetch:', err);
    }

    // 3. Fallback to local store user if needed
    const localUser = dbStore.get('users').find(u => u.email.toLowerCase() === email);

    if (!supabaseUser && !profileData && !localUser && !isSuperAdmin) {
      throw new Error('Invalid email or password. Please check your credentials.');
    }

    const role: UserRole = (isSuperAdmin || profileData?.role === 'super_admin' || localUser?.role === 'super_admin') 
      ? 'super_admin' 
      : 'factory_owner';

    // 4. Resolve Factory for Factory Owner
    let factory: Factory | undefined;
    if (role !== 'super_admin') {
      const factories = dbStore.get('factories');
      factory = factories.find(f => f.code === 'SRB-01' || f.id === '00000000-0000-0000-0000-000000000002') || factories[0];
    }

    const user: User = {
      id: profileData?.id || localUser?.id || (isSuperAdmin ? 'usr_super_admin' : 'usr_owner'),
      email,
      fullName: isSuperAdmin ? 'BrickOS Super Admin' : (profileData?.full_name || localUser?.fullName || 'Rajesh Sharma (Owner)'),
      phone: profileData?.phone || localUser?.phone || '+91 85006 93113',
      role,
      factoryId: factory?.id,
      status: 'active',
      createdAt: profileData?.created_at || new Date().toISOString(),
    };

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    return { user, factory };
  },

  async quickSwitchRole(role: UserRole): Promise<User> {
    let user: User;
    if (role === 'super_admin') {
      user = {
        id: 'usr_super_admin',
        email: 'brickserpsoftware@gmail.com',
        fullName: 'BrickOS Super Admin',
        phone: '+91 85006 93113',
        role: 'super_admin',
        status: 'active',
        createdAt: '2025-01-01T00:00:00Z',
      };
    } else {
      user = {
        id: 'usr_owner',
        email: 'info@shreerambricks.com',
        fullName: 'Rajesh Sharma (Owner)',
        phone: '+91 85006 93113',
        role: 'factory_owner',
        factoryId: '00000000-0000-0000-0000-000000000002',
        status: 'active',
        createdAt: '2025-01-15T09:00:00Z',
      };
    }

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    return user;
  },

  async register(payload: RegisterPayload): Promise<{ user: User; factory: Factory }> {
    const factoryId = `00000000-0000-0000-0000-${Date.now().toString(16).padStart(12, '0')}`;
    const userId = `00000000-0000-0000-0001-${Date.now().toString(16).padStart(12, '0')}`;

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

    // Save to Supabase Cloud
    try {
      const client = supabase as any;
      await client.from('factories').insert({
        id: factoryId,
        name: newFactory.name,
        code: newFactory.code,
        phone: newFactory.phone,
        email: newFactory.email,
        address: newFactory.address,
        city: newFactory.city,
        state: newFactory.state,
        pincode: newFactory.pincode,
        gst_number: newFactory.gstNumber,
        factory_type: newFactory.factoryType,
        employee_count: newFactory.employeesCount,
        daily_capacity: newFactory.dailyCapacity,
        main_products: newFactory.mainProducts,
      });

      await client.from('profiles').insert({
        id: userId,
        full_name: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        role: 'factory_owner',
      });
    } catch (e) {
      console.warn('Supabase registration push error:', e);
    }

    const factories = dbStore.get('factories');
    const users = dbStore.get('users');
    dbStore.set('factories', [newFactory, ...factories]);
    dbStore.set('users', [newUser, ...users]);

    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));
    return { user: newUser, factory: newFactory };
  },

  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signOut warning:', e);
    }
    localStorage.removeItem(AUTH_USER_KEY);
  },

  async forgotPassword(email: string): Promise<boolean> {
    try {
      await supabase.auth.resetPasswordForEmail(email);
    } catch (e) {
      console.warn('Reset password error:', e);
    }
    return true;
  },

  async resetPassword(password: string): Promise<boolean> {
    try {
      await supabase.auth.updateUser({ password });
    } catch (e) {
      console.warn('Update password error:', e);
    }
    return true;
  }
};
