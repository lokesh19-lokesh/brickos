// =============================================================================
// BRICKFLOW ERP - Edge Function: reset-demo-data
// Cleans and re-seeds operational records for a demo factory
// =============================================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { handleCors, formatSuccess, formatError } from '../_shared/cors.ts';
import { getSupabaseServiceClient, getAuthenticatedUser, resolveUserFactory } from '../_shared/supabaseClient.ts';

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  if (req.method !== 'POST') {
    return formatError('METHOD_NOT_ALLOWED', 'Only POST requests are accepted.', 405);
  }

  try {
    const { user } = await getAuthenticatedUser(req);
    const body = await req.json().catch(() => ({}));
    const { factoryId: requestedFactoryId } = body;

    const factoryId = await resolveUserFactory(user.id, requestedFactoryId);
    const serviceClient = getSupabaseServiceClient();

    const { data: factory } = await serviceClient
      .from('factories')
      .select('is_demo, name')
      .eq('id', factoryId)
      .single();

    if (!factory?.is_demo) {
      return formatError('FORBIDDEN', 'Reset operation is only permitted for demo/sandbox factories.', 403);
    }

    await serviceClient.from('sale_items').delete().filter('sale_id', 'in', `(SELECT id FROM sales WHERE factory_id = '${factoryId}')`);
    await serviceClient.from('invoices').delete().eq('factory_id', factoryId);
    await serviceClient.from('sales').delete().eq('factory_id', factoryId);
    await serviceClient.from('customer_payments').delete().eq('factory_id', factoryId);
    await serviceClient.from('vendor_payments').delete().eq('factory_id', factoryId);
    await serviceClient.from('raw_material_purchase_items').delete().filter('purchase_id', 'in', `(SELECT id FROM raw_material_purchases WHERE factory_id = '${factoryId}')`);
    await serviceClient.from('raw_material_purchases').delete().eq('factory_id', factoryId);
    await serviceClient.from('production_workers').delete().eq('factory_id', factoryId);
    await serviceClient.from('production_material_consumption').delete().eq('factory_id', factoryId);
    await serviceClient.from('production_batches').delete().eq('factory_id', factoryId);
    await serviceClient.from('finished_stock_transactions').delete().eq('factory_id', factoryId);
    await serviceClient.from('raw_material_stock_transactions').delete().eq('factory_id', factoryId);
    await serviceClient.from('attendance').delete().eq('factory_id', factoryId);
    await serviceClient.from('wage_payments').delete().eq('factory_id', factoryId);
    await serviceClient.from('wage_records').delete().eq('factory_id', factoryId);
    await serviceClient.from('expenses').delete().eq('factory_id', factoryId);
    await serviceClient.from('ledger_entries').delete().eq('factory_id', factoryId);

    const { data: products } = await serviceClient.from('products').select('id').eq('factory_id', factoryId);
    if (products?.length) {
      for (const prod of products) {
        await serviceClient.from('finished_stock_transactions').insert({
          factory_id: factoryId,
          product_id: prod.id,
          batch_code: 'RESET-STOCK',
          transaction_type: 'stock_in',
          quantity: 25000,
          reference_type: 'opening_balance',
          notes: 'Sandbox Reset Initial Finished Stock',
        });
      }
    }

    const { data: materials } = await serviceClient.from('raw_materials').select('id').eq('factory_id', factoryId);
    if (materials?.length) {
      for (const mat of materials) {
        await serviceClient.from('raw_material_stock_transactions').insert({
          factory_id: factoryId,
          raw_material_id: mat.id,
          transaction_type: 'stock_in',
          quantity: 100.00,
          reference_type: 'opening_balance',
          notes: 'Sandbox Reset Initial Material Stock',
        });
      }
    }

    return formatSuccess({
      factoryId,
      resetTimestamp: new Date().toISOString(),
    }, 'Demo sandbox data reset to clean initial state.');
  } catch (err: any) {
    const statusCode = err.statusCode || 500;
    const code = err.code || 'SERVER_ERROR';
    return formatError(code, err.message || 'Internal server error', statusCode);
  }
});
