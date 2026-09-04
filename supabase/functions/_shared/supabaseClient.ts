// =============================================================================
// BRICKFLOW ERP - supabase/functions/_shared/supabaseClient.ts
// Supabase Client Initializer with Request Auth & Tenant Resolution
// =============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(code: string, message: string, statusCode = 400) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

export function getSupabaseServiceClient() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
  return createClient(supabaseUrl, supabaseServiceKey);
}

export function getSupabaseUserClient(req: Request) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
  const authHeader = req.headers.get('Authorization') ?? '';

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });
}

export async function getAuthenticatedUser(req: Request) {
  const supabase = getSupabaseUserClient(req);
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    throw new AppError('UNAUTHORIZED', 'Invalid or missing authorization token. Please sign in.', 401);
  }
  return { user, supabase };
}

export async function resolveUserFactory(userId: string, requestedFactoryId?: string) {
  const serviceClient = getSupabaseServiceClient();
  
  // 1. Check if user is super admin
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('id, role')
    .eq('auth_user_id', userId)
    .single();

  const isSuperAdmin = profile?.role === 'super_admin';
  const profileId = profile?.id;

  if (!profileId) {
    throw new AppError('PROFILE_NOT_FOUND', 'User profile not found.', 404);
  }

  // 2. Fetch user's active factory memberships
  const { data: memberships, error } = await serviceClient
    .from('factory_users')
    .select('factory_id, role, factories(id, name, code, status)')
    .eq('user_id', profileId)
    .eq('status', 'active');

  if (error || (!memberships?.length && !isSuperAdmin)) {
    throw new AppError('NO_FACTORY_MEMBERSHIP', 'User does not belong to any active factory.', 403);
  }

  // If specific factory requested, verify membership
  if (requestedFactoryId) {
    const hasAccess = isSuperAdmin || memberships.some(m => m.factory_id === requestedFactoryId);
    if (!hasAccess) {
      throw new AppError('FORBIDDEN_FACTORY', 'User does not have access to the requested factory.', 403);
    }
    return requestedFactoryId;
  }

  // Default to first active factory
  return memberships[0].factory_id;
}
