// =============================================================================
// BRICKFLOW ERP - Edge Function: generate-report
// Serves financial reports, profit & loss, customer aging, and production KPIs
// =============================================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { handleCors, formatSuccess, formatError } from '../_shared/cors.ts';
import { getSupabaseServiceClient, getAuthenticatedUser, resolveUserFactory } from '../_shared/supabaseClient.ts';

serve(async (req: Request) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const { user } = await getAuthenticatedUser(req);
    const url = new URL(req.url);
    const reportType = url.searchParams.get('type') || 'pnl';
    const requestedFactoryId = url.searchParams.get('factoryId');
    const startDate = url.searchParams.get('startDate') || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const endDate = url.searchParams.get('endDate') || new Date().toISOString().split('T')[0];

    const factoryId = await resolveUserFactory(user.id, requestedFactoryId || undefined);
    const serviceClient = getSupabaseServiceClient();

    if (reportType === 'pnl') {
      const { data, error } = await serviceClient.rpc('get_factory_profit_and_loss', {
        p_factory_id: factoryId,
        p_start_date: startDate,
        p_end_date: endDate,
      });

      if (error) {
        return formatError('REPORT_FAILED', error.message, 500, error);
      }
      return formatSuccess(data, 'P&L report generated successfully.');
    }

    if (reportType === 'aging') {
      const { data, error } = await serviceClient
        .from('view_customer_aging')
        .select('*')
        .eq('factory_id', factoryId);

      if (error) {
        return formatError('REPORT_FAILED', error.message, 500, error);
      }
      return formatSuccess(data, 'Customer aging report retrieved.');
    }

    if (reportType === 'raw_materials') {
      const { data, error } = await serviceClient
        .from('view_raw_material_inventory')
        .select('*')
        .eq('factory_id', factoryId);

      if (error) {
        return formatError('REPORT_FAILED', error.message, 500, error);
      }
      return formatSuccess(data, 'Raw material inventory report retrieved.');
    }

    if (reportType === 'finished_goods') {
      const { data, error } = await serviceClient
        .from('view_finished_goods_inventory')
        .select('*')
        .eq('factory_id', factoryId);

      if (error) {
        return formatError('REPORT_FAILED', error.message, 500, error);
      }
      return formatSuccess(data, 'Finished goods inventory report retrieved.');
    }

    return formatError('INVALID_REPORT_TYPE', `Unknown report type: ${reportType}`, 400);
  } catch (err: any) {
    return formatError('SERVER_ERROR', err.message || 'Internal server error', 500);
  }
});
