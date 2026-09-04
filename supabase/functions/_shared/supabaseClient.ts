// =============================================================================
// BRICKFLOW ERP - supabase/functions/_shared/supabaseClient.ts
// Supabase Client Initializer with Request Auth & Tenant Resolution
// =============================================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

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
    throw new Error('UNAUTHORIZED: Invalid or missing authorization token.');
  }
  return { user, supabase };
}

export async function resolveUserFactory(userId: string, requestedFactoryId?: string) {
  const serviceClient = getSupabaseServiceClient();
  
  // 1. Check if user is super admin
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('role')
    .eq('auth_user_id', userId)
    .single();

  const isSuperAdmin = profile?.role === 'super_admin';

  // 2. Fetch user's active factory memberships
  const { data: memberships, error } = await serviceClient
    .from('factory_users')
    .select('factory_id, role, factories(id, name, code, status)')
    .eq('user_id', (
      await serviceClient
        .from('profiles')
        .select('id')
        .eq('auth_user_id', userId)
        .single()
    ).data?.id)
    .eq('status', 'active');

  if (error || (!memberships?.length && !isSuperAdmin)) {
    throw new Error('NO_FACTORY_MEMBERSHIP: User does not belong to any active factory.');
  }

  // If specific factory requested, verify membership
  if (requestedFactoryId) {
    const hasAccess = isSuperAdmin || memberships.some(m => m.factory_id === requestedFactoryId);
    if (!hasAccess) {
      throw new Error('FORBIDDEN_FACTORY: User does not have access to the requested factory.');
    }
    return requestedFactoryId;
  }

  // Default to first active factory
  return memberships[0].factory_id;
}
