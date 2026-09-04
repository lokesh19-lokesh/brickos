import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://apvacpivgvbuutfdwemx.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFwdmFjcGl2Z3ZidXV0ZmR3ZW14Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg0NjM3MzMsImV4cCI6MjEwNDAzOTczM30.E-FAhGYb7ZxqxHyWbw3XdqHBzpV2tNYWOPzbaxHILHA';

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Standardized helper to invoke Supabase Edge Functions with consistent response handling
 */
export async function invokeEdgeFunction<T = any>(functionName: string, body?: any, factoryId?: string): Promise<{ data: T | null; error: string | null }> {
  try {
    const headers: Record<string, string> = {};
    if (factoryId) {
      headers['x-factory-id'] = factoryId;
    }

    const { data, error } = await supabase.functions.invoke(functionName, {
      body,
      headers,
    });

    if (error) {
      return { data: null, error: error.message || 'Function invocation error' };
    }

    if (data && data.success === false) {
      return { data: null, error: data.error?.message || 'Operation failed' };
    }

    return { data: data?.data ?? data, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Unexpected network error' };
  }
}
