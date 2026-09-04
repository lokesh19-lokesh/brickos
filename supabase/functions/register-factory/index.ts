// =============================================================================
// BRICKFLOW ERP - Edge Function: register-factory
// Handles new factory registration with validation and onboarding initialization
// =============================================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { handleCors, formatSuccess, formatError } from '../_shared/cors.ts';
import { getSupabaseServiceClient, getAuthenticatedUser } from '../_shared/supabaseClient.ts';

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== 'POST') {
    return formatError('METHOD_NOT_ALLOWED', 'Only POST requests are accepted.', 405);
  }

  try {
    const { user } = await getAuthenticatedUser(req);
    const body = await req.json();

    const {
      fullName,
      email,
      phone,
      factoryName,
      factoryCode,
      factoryType,
      city,
      state,
      address,
      pincode,
      gstNumber,
    } = body;

    // Server-side validation
    if (!fullName || !factoryName || !phone) {
      return formatError('VALIDATION_ERROR', 'Full name, factory name, and phone are required fields.', 422);
    }

    const serviceClient = getSupabaseServiceClient();

    // Call atomic PostgreSQL function
    const { data, error } = await serviceClient.rpc('register_factory', {
      p_auth_user_id: user.id,
      p_full_name: fullName,
      p_email: email || user.email,
      p_phone: phone,
      p_factory_name: factoryName,
      p_factory_code: factoryCode || null,
      p_factory_type: factoryType || 'Fly Ash Brick',
      p_city: city || 'Pune',
      p_state: state || 'Maharashtra',
      p_address: address || 'Industrial Area',
      p_pincode: pincode || '411001',
      p_gst_number: gstNumber || null,
    });

    if (error) {
      return formatError('REGISTRATION_FAILED', error.message, 500, error);
    }

    return formatSuccess(data, 'Factory registered and 14-day free trial activated successfully.');
  } catch (err: any) {
    return formatError('SERVER_ERROR', err.message || 'Internal server error', 500);
  }
});
