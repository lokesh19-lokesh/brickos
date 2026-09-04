// =============================================================================
// BRICKFLOW ERP - Edge Function: create-demo & reset-demo-data
// Creates or resets demo sandbox factories with pre-populated operational data
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
    const body = await req.json().catch(() => ({}));
    const { demoName = 'Demo Brick Industries' } = body;

    const serviceClient = getSupabaseServiceClient();

    const { data: profile } = await serviceClient
      .from('profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    const profileId = profile?.id;
    const demoCode = `DEMO-${Math.floor(1000 + Math.random() * 9000)}`;

    const { data: factory, error: fErr } = await serviceClient
      .from('factories')
      .insert({
        name: demoName,
        code: demoCode,
        owner_id: profileId,
        phone: '+91 98000 12345',
        email: user.email || 'demo@brickflow.in',
        address: 'Plot 10, Industrial Model Town',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411028',
        factory_type: 'Fly Ash Brick',
        daily_capacity: '30,000 Bricks / Day',
        is_demo: true,
        status: 'active',
      })
      .select()
      .single();

    if (fErr || !factory) {
      return formatError('DEMO_CREATION_FAILED', fErr?.message || 'Failed to create demo factory', 500);
    }

    if (profileId) {
      await serviceClient.from('factory_users').insert({
        factory_id: factory.id,
        user_id: profileId,
        role: 'factory_owner',
        status: 'active',
      });
    }

    await serviceClient.from('demo_accounts').insert({
      factory_id: factory.id,
      created_by: profileId,
      expires_at: new Date(Date.now() + 7 * 86400000).toISOString(),
      status: 'active',
    });

    const { data: prod } = await serviceClient
      .from('products')
      .insert({
        factory_id: factory.id,
        name: '4 Inch Fly Ash Brick',
        code: 'FAB-4IN',
        category: 'Fly Ash Brick',
        unit_name: 'Pcs',
        selling_price: 4.80,
        cost_price: 3.40,
        minimum_stock: 10000,
        status: 'active',
      })
      .select()
      .single();

    const { data: mat } = await serviceClient
      .from('raw_materials')
      .insert({
        factory_id: factory.id,
        name: 'NTPC Thermal Power Fly Ash',
        code: 'RM-FLYASH',
        unit_name: 'Ton',
        minimum_stock: 40.00,
        average_unit_cost: 450.00,
        status: 'active',
      })
      .select()
      .single();

    if (prod) {
      await serviceClient.from('finished_stock_transactions').insert({
        factory_id: factory.id,
        product_id: prod.id,
        batch_code: 'INIT-DEMO',
        transaction_type: 'stock_in',
        quantity: 25000,
        reference_type: 'opening_balance',
        notes: 'Demo Initial Stock',
      });
    }

    if (mat) {
      await serviceClient.from('raw_material_stock_transactions').insert({
        factory_id: factory.id,
        raw_material_id: mat.id,
        transaction_type: 'stock_in',
        quantity: 80.00,
        reference_type: 'opening_balance',
        notes: 'Demo Initial Stock',
      });
    }

    return formatSuccess({
      factoryId: factory.id,
      factoryCode: factory.code,
      factoryName: factory.name,
      isDemo: true,
    }, 'Demo sandbox factory provisioned successfully.');
  } catch (err: any) {
    const statusCode = err.statusCode || 500;
    const code = err.code || 'SERVER_ERROR';
    return formatError(code, err.message || 'Internal server error', statusCode);
  }
});
