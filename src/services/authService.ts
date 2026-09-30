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
        let profile: any = null;
        try {
          const { data: p } = await client
            .from('profiles')
            .select('*')
            .eq('auth_user_id', session.user.id)
            .maybeSingle();
          profile = p;
        } catch (e) {
          console.warn('Profile fetch by auth_user_id warning:', e);
        }

        if (!profile && email) {
          try {
            const newRole: UserRole = isSuperAdminEmail ? 'super_admin' : 'factory_owner';
            const fullName = session.user.user_metadata?.full_name || 
                             session.user.user_metadata?.name || 
                             (isSuperAdminEmail ? 'BrickOS Super Admin' : 'Factory Owner');

            // Use upsert to gracefully link auth_user_id and prevent duplicate key violations
            const { data: newProfile, error: upsertErr } = await client
              .from('profiles')
              .upsert({
                auth_user_id: session.user.id,
                email,
                full_name: fullName,
                phone: session.user.phone || session.user.user_metadata?.phone || '+91 85006 93113',
                role: newRole,
                status: 'active',
              }, { onConflict: 'email' })
              .select('*')
              .maybeSingle();

            if (newProfile && !upsertErr) {
              profile = newProfile;
            }
          } catch (e) {
            console.warn('Profile upsert warning:', e);
          }
        }

        const role: UserRole = (isSuperAdminEmail || profile?.role === 'super_admin') ? 'super_admin' : 'factory_owner';

        // Resolve Factory ID dynamically from Supabase
        let factoryId: string | undefined = undefined;
        if (role !== 'super_admin') {
          try {
            // 1. Check factory_users
            if (profile?.id) {
              const { data: fu } = await client
                .from('factory_users')
                .select('factory_id')
                .eq('user_id', profile.id)
                .maybeSingle();
              if (fu?.factory_id) {
                factoryId = fu.factory_id;
              }
            }
            // 2. Check factories where owner_id = profile.id OR email = user email
            if (!factoryId && (profile?.id || email)) {
              let query = client.from('factories').select('id, name');
              if (profile?.id) {
                query = query.or(`owner_id.eq.${profile.id},email.eq.${email}`);
              } else {
                query = query.eq('email', email);
              }
              const { data: fac } = await query.order('created_at', { ascending: false }).maybeSingle();
              if (fac?.id) {
                factoryId = fac.id;
              }
            }
          } catch (e) {
            console.warn('Factory resolution notice:', e);
          }

          if (!factoryId) {
            const factories = dbStore.get('factories');
            const userFac = factories.find(f => f.email?.toLowerCase() === email?.toLowerCase() || f.id === profile?.id);
            factoryId = userFac?.id || factories[0]?.id || '00000000-0000-0000-0000-000000000002';
          }

          // Trigger live factory data sync in the background
          if (factoryId) {
            const fid = factoryId;
            import('./supabaseSync').then(({ supabaseSync }) => {
              supabaseSync.syncFactoryData(fid);
            });
          }
        }

        const user: User = {
          id: profile?.id || session.user.id,
          email: email || 'brickserpsoftware@gmail.com',
          fullName: isSuperAdminEmail 
            ? 'BrickOS Super Admin' 
            : (profile?.full_name || session.user.user_metadata?.full_name || 'Rajesh Sharma'),
          phone: profile?.phone || session.user.phone || '+91 85006 93113',
          role,
          factoryId,
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
    const password = credentials.password?.trim();

    if (!email) {
      throw new Error('Please enter your work email address.');
    }
    if (!password) {
      throw new Error('Please enter your password.');
    }

    const isSuperAdmin = email === 'brickserpsoftware@gmail.com';

    // 1. Authenticate strictly against Supabase Auth
    let supabaseUser: any = null;
    let authError: any = null;

    try {
      const { data: authRes, error: authErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authErr) {
        authError = authErr;
      } else if (authRes.user) {
        supabaseUser = authRes.user;
      }
    } catch (err: any) {
      authError = err;
    }

    // If Supabase returned an explicit authentication error:
    if (authError) {
      const msg = authError.message?.toLowerCase() || '';

      // Wrong password / invalid credentials -> NEVER log in!
      if (msg.includes('invalid login credentials') || msg.includes('invalid credentials')) {
        throw new Error('Invalid email or password. Please verify your credentials and try again.');
      }

      // Email not confirmed -> inform user to verify
      if (msg.includes('email not confirmed')) {
        throw new Error('Your email address has not been verified yet. Please check your inbox and click the verification link.');
      }

      // Rate limit
      if (msg.includes('too many requests') || msg.includes('rate limit')) {
        throw new Error('Too many login attempts. Please wait a few moments and try again.');
      }

      // Only allow offline demo bypass if network is offline AND user provided the designated demo credentials
      const isOfflineNetwork = !navigator.onLine || msg.includes('failed to fetch') || msg.includes('network');
      const isDemoOwner = email === 'info@shreerambricks.com' && (password === 'Owner@123456' || password === 'Demo@123456');
      const isDemoAdmin = isSuperAdmin && (password === 'Admin@123456' || password === 'Super@123456');

      if (!isOfflineNetwork || (!isDemoOwner && !isDemoAdmin)) {
        throw new Error(authError.message || 'Invalid email or password.');
      }
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

    // 3. Fallback to local store user only if authenticated or valid offline demo
    const localUser = dbStore.get('users').find(u => u.email.toLowerCase() === email);

    if (!supabaseUser && !isSuperAdmin) {
      const isDemoOwner = email === 'info@shreerambricks.com' && (password === 'Owner@123456' || password === 'Demo@123456');
      if (!isDemoOwner) {
        throw new Error('Invalid email or password. Please verify your credentials and try again.');
      }
    }

    const role: UserRole = (isSuperAdmin || profileData?.role === 'super_admin' || localUser?.role === 'super_admin') 
      ? 'super_admin' 
      : 'factory_owner';

    // 4. Resolve Factory for Factory Owner dynamically from Supabase
    let factory: Factory | undefined;
    if (role !== 'super_admin') {
      try {
        const client = supabase as any;
        let foundFactoryId: string | undefined = undefined;

        if (profileData?.id) {
          const { data: fu } = await client
            .from('factory_users')
            .select('factory_id')
            .eq('user_id', profileData.id)
            .maybeSingle();
          if (fu?.factory_id) {
            foundFactoryId = fu.factory_id;
          }
        }

        let q = client.from('factories').select('*');
        if (foundFactoryId) {
          q = q.eq('id', foundFactoryId);
        } else if (profileData?.id) {
          q = q.or(`owner_id.eq.${profileData.id},email.eq.${email}`);
        } else {
          q = q.eq('email', email);
        }

        const { data: fac } = await q.order('created_at', { ascending: false }).maybeSingle();
        if (fac) {
          factory = {
            id: fac.id,
            name: fac.name,
            code: fac.code,
            ownerName: profileData?.full_name || 'Plant Owner',
            phone: fac.phone,
            email: fac.email,
            address: fac.address,
            city: fac.city,
            state: fac.state,
            pincode: fac.pincode,
            gstNumber: fac.gst_number,
            factoryType: fac.factory_type,
            employeesCount: fac.employee_count,
            dailyCapacity: fac.daily_capacity,
            mainProducts: fac.main_products || [],
            planId: 'plan_trial',
            subscriptionStatus: 'active',
            createdAt: fac.created_at,
          };
        }

        if (!factory) {
          const factories = dbStore.get('factories');
          factory = factories.find(f => f.email?.toLowerCase() === email || f.id === foundFactoryId) || factories[0];
        }

        if (factory?.id) {
          import('./supabaseSync').then(({ supabaseSync }) => {
            supabaseSync.syncFactoryData(factory!.id);
          });
        }
      } catch (err) {
        console.warn('Login factory lookup:', err);
        const factories = dbStore.get('factories');
        factory = factories.find(f => f.email?.toLowerCase() === email) || factories[0];
      }
    }

    const user: User = {
      id: supabaseUser?.id || profileData?.id || localUser?.id || (isSuperAdmin ? 'usr_super_admin' : 'usr_owner'),
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

  async register(payload: RegisterPayload): Promise<{ user: User; factory: Factory; needsEmailVerification?: boolean }> {
    const normalizedEmail = payload.user.email.trim().toLowerCase();
    const password = payload.user.password?.trim();

    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    // 1. Sign up user in Supabase Auth (Creates user in auth.users & sends verification email)
    let authUserId = `00000000-0000-0000-0001-${Date.now().toString(16).padStart(12, '0')}`;
    let needsEmailVerification = false;

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          full_name: payload.user.fullName,
          phone: payload.user.phone,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      throw new Error(signUpError.message || 'Failed to create user account in Supabase.');
    }

    if (signUpData.user) {
      authUserId = signUpData.user.id;
      // If user identities array is empty, user already exists in auth.users
      if (signUpData.user.identities && signUpData.user.identities.length === 0) {
        throw new Error('An account with this email address already exists. Please sign in instead.');
      }
      // If session is null, email confirmation is required by Supabase project settings
      if (!signUpData.session) {
        needsEmailVerification = true;
      }
    }

    const factoryId = `00000000-0000-0000-0000-${Date.now().toString(16).padStart(12, '0')}`;
    const factoryCode = payload.factory.code || `FAC-${Math.floor(100 + Math.random() * 900)}`;

    // 2. Persist Factory and Profile into Supabase PostgreSQL database
    try {
      const client = supabase as any;

      // Attempt calling atomic stored function register_factory
      const { data: rpcData, error: rpcError } = await client.rpc('register_factory', {
        p_auth_user_id: authUserId,
        p_full_name: payload.user.fullName,
        p_email: normalizedEmail,
        p_phone: payload.user.phone,
        p_factory_name: payload.factory.name,
        p_factory_code: factoryCode,
        p_factory_type: payload.factory.factoryType || 'Fly Ash Brick',
        p_city: payload.factory.city || 'Pune',
        p_state: payload.factory.state || 'Maharashtra',
        p_address: payload.factory.address || 'Industrial Area',
        p_pincode: payload.factory.pincode || '411001',
        p_gst_number: payload.factory.gstNumber || null,
      });

      if (rpcError) {
        console.warn('register_factory RPC notice, inserting directly:', rpcError.message);

        // Direct table fallback
        const isSyntheticAuthId = authUserId.startsWith('00000000-0000-0000-0001');
        const { data: profileInsert } = await client.from('profiles').upsert({
          auth_user_id: isSyntheticAuthId ? null : authUserId,
          full_name: payload.user.fullName,
          email: normalizedEmail,
          phone: payload.user.phone,
          role: 'factory_owner',
          status: 'active',
        }, { onConflict: 'email' }).select('*').maybeSingle();

        const vProfileId = profileInsert?.id;

        await client.from('factories').insert({
          id: factoryId,
          name: payload.factory.name,
          code: factoryCode,
          owner_id: vProfileId || null,
          phone: payload.factory.phone || payload.user.phone,
          email: payload.factory.email || normalizedEmail,
          address: payload.factory.address,
          city: payload.factory.city,
          state: payload.factory.state,
          pincode: payload.factory.pincode,
          gst_number: payload.factory.gstNumber,
          factory_type: payload.factory.factoryType,
          employee_count: payload.factory.employeesCount,
          daily_capacity: payload.factory.dailyCapacity,
          main_products: payload.factory.mainProducts,
        });

        if (vProfileId) {
          await client.from('factory_users').upsert({
            factory_id: factoryId,
            user_id: vProfileId,
            role: 'factory_owner',
            status: 'active',
          });
        }

        // Initialize standard catalog for new factory
        import('./supabaseSync').then(({ supabaseSync }) => {
          supabaseSync.ensureInitialFactoryData(factoryId);
        });
      }
    } catch (e) {
      console.warn('Supabase database sync notice:', e);
    }

    // 3. Update local mock database store for seamless offline/immediate state
    const newFactory: Factory = {
      id: factoryId,
      name: payload.factory.name,
      code: factoryCode,
      ownerName: payload.factory.ownerName || payload.user.fullName,
      phone: payload.factory.phone || payload.user.phone,
      email: payload.factory.email || normalizedEmail,
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
      id: authUserId,
      email: normalizedEmail,
      fullName: payload.user.fullName,
      phone: payload.user.phone,
      role: 'factory_owner',
      factoryId: factoryId,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    const factories = dbStore.get('factories');
    const users = dbStore.get('users');
    dbStore.set('factories', [newFactory, ...factories]);
    dbStore.set('users', [newUser, ...users]);

    if (!needsEmailVerification) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(newUser));
    }

    return { user: newUser, factory: newFactory, needsEmailVerification };
  },

  async resendVerificationEmail(email: string): Promise<boolean> {
    const normalizedEmail = email.trim().toLowerCase();
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: normalizedEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      throw new Error(error.message || 'Failed to resend verification email.');
    }
    return true;
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
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        throw error;
      }
    } catch (e: any) {
      console.warn('Reset password error:', e);
      throw new Error(e.message || 'Failed to send password reset email.');
    }
    return true;
  },

  async resetPassword(password: string): Promise<boolean> {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        throw error;
      }
    } catch (e: any) {
      console.warn('Update password error:', e);
      throw new Error(e.message || 'Failed to update password.');
    }
    return true;
  }
};
